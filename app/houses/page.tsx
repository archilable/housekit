import { prisma } from '@/lib/db'
import Link from 'next/link'
import HouseCarousel from '@/app/components/HouseCarousel'
import { auth, signOut } from '@/auth'
import { redirect } from 'next/navigation'

export const revalidate = 30

export default async function Home() {
  const session = await auth()
  const userId = session?.user?.id

  if (!userId) redirect('/login')

  const [ownedHouses, sharedAccess] = await Promise.all([
    prisma.house.findMany({
      where: { userId },
      orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }],
      include: { _count: { select: { inventories: true, histories: true } } },
    }),
    prisma.houseAccess.findMany({
      where: { userId },
      include: {
        house: { include: { _count: { select: { inventories: true, histories: true } } } },
      },
    }),
  ])

  const sharedHouses = sharedAccess.map(a => ({ ...a.house, _shared: true }))
  const houses = [...ownedHouses, ...sharedHouses as typeof ownedHouses]

  if (houses.length === 0) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '80vh', textAlign: 'center', padding: '0 24px' }}>
        <svg width="80" height="72" viewBox="0 0 80 72" fill="none" style={{ marginBottom: 16 }}>
          <ellipse cx="40" cy="68" rx="28" ry="4" fill="#1a1a2e" />
          <polygon points="40,8 72,34 8,34" fill="#1a2540" stroke="#2a4a80" strokeWidth="1" />
          <rect x="12" y="34" width="56" height="34" fill="#111828" stroke="#1e3a5f" strokeWidth="1" />
          <rect x="20" y="42" width="14" height="12" fill="#0d1a2e" stroke="#2a4a80" strokeWidth="0.5" rx="1" />
          <rect x="42" y="42" width="14" height="12" fill="#0d1a2e" stroke="#2a4a80" strokeWidth="0.5" rx="1" />
          <rect x="31" y="50" width="8" height="18" fill="#0d1a2e" stroke="#1e3a5f" strokeWidth="0.5" rx="1" />
          <circle cx="40" cy="8" r="3" fill="#60a5fa" opacity="0.8" />
        </svg>
        <h1 style={{ fontSize: 24, fontWeight: 500, marginBottom: 8 }}>집의 이력서를 시작하세요</h1>
        <p style={{ fontSize: 16, color: '#666', marginBottom: 32, lineHeight: 1.6 }}>
          보일러 교체일, 누수 이력, 수리업체까지<br />집의 모든 기록을 한 곳에
        </p>
        <Link href="/houses/new" style={{
          background: '#1d4ed8', color: '#fff', padding: '14px 32px',
          borderRadius: 14, fontSize: 17, fontWeight: 500, textDecoration: 'none',
        }}>
          첫 번째 주택 등록하기
        </Link>
      </div>
    )
  }

  return (
    <div style={{ padding: '24px 16px 0', width: '100%', boxSizing: 'border-box' }}>
      {/* 헤더 */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <p style={{ fontSize: 14, color: '#555', marginBottom: 2 }}>내 자산</p>
          <h1 style={{ fontSize: 24, fontWeight: 600 }}>주택 {houses.length}채</h1>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          {session?.user?.image && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={session.user.image} alt="프로필" style={{ width: 28, height: 28, borderRadius: '50%', border: '1px solid #1e3a5f' }} />
          )}
          <Link href="/houses/new" style={{
            fontSize: 14, color: '#60a5fa', background: '#0d1a2e',
            padding: '7px 14px', borderRadius: 20, border: '0.5px solid #1e3a5f',
            textDecoration: 'none',
          }}>
            + 주택 추가
          </Link>
          <form action={async () => { 'use server'; await signOut({ redirectTo: '/login' }) }}>
            <button type="submit" style={{ fontSize: 14, color: '#555', background: 'none', border: 'none', cursor: 'pointer', padding: '7px 4px' }}>
              로그아웃
            </button>
          </form>
        </div>
      </div>

      <HouseCarousel houses={houses} />
    </div>
  )
}
