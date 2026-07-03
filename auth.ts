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
    async jwt({ token, user, account }) {
      if (user?.id) token.id = user.id
      // 카카오 로그인 시 providerAccountId를 토큰에 저장
      if (account?.provider === 'kakao') {
        token.kakaoId = account.providerAccountId
      }
      return token
    },
    async session({ session, token }) {
      // 카카오 로그인인 경우 DB에서 실제 연결된 userId 조회
      if (token.kakaoId) {
        const linked = await prisma.account.findUnique({
          where: { provider_providerAccountId: { provider: 'kakao', providerAccountId: token.kakaoId as string } },
          include: { user: true },
        })
        if (linked) {
          session.user.id = linked.userId
          session.user.email = linked.user.email ?? session.user.email
          session.user.name = linked.user.name ?? session.user.name
          return session
        }
      }
      session.user.id = (token.id ?? token.sub) as string
      return session
    },
  },
})
