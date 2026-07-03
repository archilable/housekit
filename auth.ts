import NextAuth from 'next-auth'
import { PrismaAdapter } from '@auth/prisma-adapter'
import Google from 'next-auth/providers/google'
import Kakao from 'next-auth/providers/kakao'
import { prisma } from '@/lib/db'

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: { strategy: 'jwt' },
  trustHost: true,
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    Kakao({
      clientId: process.env.KAKAO_CLIENT_ID!,
      clientSecret: process.env.KAKAO_CLIENT_SECRET!,
      // 카카오는 어댑터가 처리하지 않도록 account 연결 끊기
      profile(profile) {
        return {
          id: String(profile.id),
          name: profile.properties?.nickname ?? null,
          email: profile.kakao_account?.email ?? null,
          image: profile.properties?.profile_image ?? null,
          kakaoId: String(profile.id),
        }
      },
    }),
  ],
  pages: {
    signIn: '/login',
  },
  callbacks: {
    async signIn({ user, account, profile }) {
      if (account?.provider !== 'kakao') return true

      const kakaoId = account.providerAccountId

      // 기존 연결 계정 찾기
      const existing = await prisma.account.findUnique({
        where: { provider_providerAccountId: { provider: 'kakao', providerAccountId: kakaoId } },
      })

      if (existing) {
        // JWT에 올바른 userId 심기
        user.id = existing.userId
        return true
      }

      // 새 유저 생성
      const newUser = await prisma.user.create({
        data: {
          name: user.name,
          image: user.image,
          accounts: {
            create: {
              type: 'oauth',
              provider: 'kakao',
              providerAccountId: kakaoId,
              access_token: account.access_token,
              refresh_token: account.refresh_token,
              expires_at: account.expires_at,
              token_type: account.token_type,
              scope: account.scope,
            },
          },
        },
      })
      user.id = newUser.id
      // 어댑터가 중복으로 계정 생성하는 것 방지
      account.providerAccountId = `handled_${kakaoId}`
      return true
    },
    async jwt({ token, user, account }) {
      if (user?.id) token.id = user.id
      return token
    },
    async session({ session, token }) {
      session.user.id = (token.id ?? token.sub) as string
      // 이메일 없는 카카오 유저면 DB에서 보정
      if (!session.user.email) {
        const dbUser = await prisma.user.findUnique({ where: { id: session.user.id } })
        if (dbUser?.email) session.user.email = dbUser.email
      }
      return session
    },
  },
})
