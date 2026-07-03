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
        include: { user: true },
      })

      if (existing) {
        // 기존 유저 ID를 user 객체에 주입 → JWT에서 사용
        user.id = existing.userId
        user.email = existing.user.email ?? undefined
        user.name = existing.user.name ?? user.name
        user.image = existing.user.image ?? user.image
        // 토큰 업데이트
        await prisma.account.update({
          where: { provider_providerAccountId: { provider: 'kakao', providerAccountId: kakaoId } },
          data: {
            access_token: account.access_token,
            refresh_token: account.refresh_token,
            expires_at: account.expires_at,
          },
        })
        return true
      }

      // 새 유저 생성 + 카카오 계정 연결
      const kakaoProfile = profile as any
      const newUser = await prisma.user.create({
        data: {
          name: user.name ?? kakaoProfile?.properties?.nickname ?? null,
          image: user.image ?? kakaoProfile?.properties?.profile_image ?? null,
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
      return true
    },
    async jwt({ token, user, account, trigger }) {
      if (user?.id) token.id = user.id
      if (user?.email) token.email = user.email
      return token
    },
    session({ session, token }) {
      session.user.id = (token.id ?? token.sub) as string
      if (token.email) session.user.email = token.email as string
      return session
    },
  },
})
