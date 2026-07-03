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
      console.log('[JWT]', JSON.stringify({ userId: user?.id, provider: account?.provider, providerAccountId: account?.providerAccountId, tokenId: token.id, tokenSub: token.sub }))
      if (user?.id) {
        token.id = user.id
      } else if (account?.provider === 'kakao' && account.providerAccountId) {
        const linked = await prisma.account.findUnique({
          where: { provider_providerAccountId: { provider: 'kakao', providerAccountId: account.providerAccountId } },
        })
        console.log('[JWT KAKAO LOOKUP]', JSON.stringify({ providerAccountId: account.providerAccountId, found: linked?.userId }))
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
