import NextAuth from 'next-auth'
import { PrismaAdapter } from '@auth/prisma-adapter'
import Google from 'next-auth/providers/google'
import Kakao from 'next-auth/providers/kakao'
import { prisma } from '@/lib/db'

// 카카오 ID → 연결할 userId 수동 매핑
const KAKAO_USER_MAP: Record<string, string> = {
  '4973954832': 'cmr20pkhp00000fqsshn05yyg', // archiry@archilable.com
}

const baseAdapter = PrismaAdapter(prisma)

const customAdapter = {
  ...baseAdapter,
  async getUserByAccount({ provider, providerAccountId }: { provider: string; providerAccountId: string }) {
    // 카카오 수동 매핑: DB 상태와 무관하게 지정 유저 반환
    if (provider === 'kakao' && KAKAO_USER_MAP[providerAccountId]) {
      const userId = KAKAO_USER_MAP[providerAccountId]
      const user = await prisma.user.findUnique({ where: { id: userId } })
      return user
    }
    return baseAdapter.getUserByAccount?.({ provider, providerAccountId }) ?? null
  },
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: customAdapter,
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
      profile(profile) {
        return {
          id: String(profile.id),
          name: profile.properties?.nickname ?? null,
          email: profile.kakao_account?.email ?? null,
          image: profile.properties?.profile_image ?? null,
        }
      },
    }),
  ],
  pages: {
    signIn: '/login',
  },
  callbacks: {
    async jwt({ token, user, account }) {
      // 카카오 로그인 시 매핑된 userId로 강제 교체
      if (account?.provider === 'kakao' && account.providerAccountId && KAKAO_USER_MAP[account.providerAccountId]) {
        token.id = KAKAO_USER_MAP[account.providerAccountId]
      } else if (user?.id) {
        token.id = user.id
      }
      return token
    },
    async session({ session, token }) {
      session.user.id = (token.id ?? token.sub) as string
      if (!session.user.email) {
        const dbUser = await prisma.user.findUnique({ where: { id: session.user.id } })
        if (dbUser?.email) session.user.email = dbUser.email
      }
      return session
    },
  },
})
