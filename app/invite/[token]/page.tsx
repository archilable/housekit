import { prisma } from '@/lib/db'
import { auth } from '@/auth'
import { redirect } from 'next/navigation'

export default async function InvitePage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params
  const session = await auth()

  if (!session?.user?.id) {
    redirect(`/login?callbackUrl=/invite/${token}`)
  }

  const invite = await prisma.houseInvite.findUnique({
    where: { token },
    include: { house: true },
  })

  if (!invite) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#0a0a0f', color: '#fff', textAlign: 'center', padding: 24 }}>
        <p style={{ fontSize: 50, marginBottom: 16 }}>😕</p>
        <h1 style={{ fontSize: 22, marginBottom: 8 }}>유효하지 않은 초대 링크예요</h1>
        <p style={{ color: '#555', fontSize: 16 }}>링크가 만료됐거나 잘못됐어요</p>
      </div>
    )
  }

  // 이미 내 집이면 바로 이동
  if (invite.house.userId === session.user.id) {
    redirect(`/houses/${invite.house.id}`)
  }

  // 접근 권한 부여 (이미 있으면 무시)
  await prisma.houseAccess.upsert({
    where: { houseId_userId: { houseId: invite.houseId, userId: session.user.id } },
    create: { houseId: invite.houseId, userId: session.user.id },
    update: {},
  })

  redirect(`/houses/${invite.house.id}`)
}
