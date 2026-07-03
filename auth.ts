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
      if (user?.id) {
        token.id = user.id
      } else if (account?.provider === 'kakao' && account.providerAccountId) {
        // 어댑터가 user를 못 찾은 경우 직접 DB에서 조회
        const linked = await prisma.account.findUnique({
          where: { provider_providerAccountId: { provider: 'kakao', providerAccountId: account.providerAccountId } },
        })
        if (linked) token.id = linked.userId
      }
      return token
    },
    session({ session, token }) {
      session.user.id = (token.id ?? token.sub) as string
      return session
    },
  },
})
