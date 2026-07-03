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
      // 카카오 로그인: 이메일 없어도 처리 + 기존 계정 연결
      if (account?.provider === 'kakao') {
        const kakaoProfile = profile as any
        const kakaoEmail = kakaoProfile?.kakao_account?.email as string | undefined
        const kakaoId = account.providerAccountId

        // 이미 연결된 카카오 계정인지 확인
        const existingAccount = await prisma.account.findUnique({
          where: { provider_providerAccountId: { provider: 'kakao', providerAccountId: kakaoId } },
        })
        if (existingAccount) return true

        // 카카오 이메일로 기존 유저 찾기
        let targetUser = kakaoEmail
          ? await prisma.user.findUnique({ where: { email: kakaoEmail } })
          : null

        // 없으면 새 유저 생성
        if (!targetUser) {
          targetUser = await prisma.user.create({
            data: {
              email: kakaoEmail ?? null,
              name: user.name ?? kakaoProfile?.properties?.nickname ?? null,
              image: user.image ?? kakaoProfile?.properties?.profile_image ?? null,
            },
          })
        }

        // 카카오 Account를 해당 유저에 연결
        await prisma.account.create({
          data: {
            userId: targetUser.id,
            type: account.type,
            provider: 'kakao',
            providerAccountId: kakaoId,
            access_token: account.access_token,
            refresh_token: account.refresh_token,
            expires_at: account.expires_at,
            token_type: account.token_type,
            scope: account.scope,
          },
        })

        user.id = targetUser.id
        return true
      }
      return true
    },
    jwt({ token, user, account }) {
      if (user?.id) token.id = user.id
      return token
    },
    session({ session, token }) {
      session.user.id = (token.id ?? token.sub) as string
      return session
    },
  },
})
