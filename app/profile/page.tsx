import { auth, signOut } from '@/auth'
import { redirect } from 'next/navigation'

export default async function ProfilePage() {
  const session = await auth()
  if (!session?.user) redirect('/login')

  const user = session.user
  const dbUser = await import('@/lib/db').then(m => m.prisma.user.findUnique({
    where: { id: user.id },
    include: { accounts: { select: { provider: true } } },
  }))

  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0f', padding: '60px 20px 100px' }}>
      {/* 헤더 */}
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 25, fontWeight: 700, color: '#fff', margin: 0 }}>내 정보</h1>
      </div>

      {/* 프로필 카드 */}
      <div style={{ background: '#111118', border: '0.5px solid #1e1e28', borderRadius: 20, padding: 24, marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          {user.image ? (
            <img src={user.image} alt="프로필" style={{ width: 64, height: 64, borderRadius: '50%', objectFit: 'cover' }} />
          ) : (
            <div style={{ width: 64, height: 64, borderRadius: '50%', background: '#1e1e28', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <i className="ti ti-user" style={{ fontSize: 31, color: '#555' }} />
            </div>
          )}
          <div>
            <p style={{ fontSize: 21, fontWeight: 600, color: '#fff', margin: 0 }}>{user.name ?? '이름 없음'}</p>
            <p style={{ fontSize: 16, color: '#555', margin: '4px 0 0' }}>
              {user.email ?? (dbUser?.accounts.some(a => a.provider === 'kakao') ? '카카오 계정' : '이메일 없음')}
            </p>
            {dbUser?.accounts && dbUser.accounts.length > 0 && (
              <div style={{ display: 'flex', gap: 4, marginTop: 6 }}>
                {dbUser.accounts.map(a => (
                  <span key={a.provider} style={{ fontSize: 14, color: a.provider === 'kakao' ? '#191919' : '#fff', background: a.provider === 'kakao' ? '#FEE500' : '#1d4ed8', borderRadius: 8, padding: '2px 8px', fontWeight: 600 }}>
                    {a.provider === 'kakao' ? '카카오' : 'Google'}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 로그아웃 */}
      <form action={async () => { 'use server'; await signOut({ redirectTo: '/login' }) }}>
        <button type="submit" style={{
          width: '100%', background: 'none', border: '0.5px solid #f8717133',
          borderRadius: 14, padding: '15px', fontSize: 18, fontWeight: 500,
          color: '#f87171', cursor: 'pointer', boxSizing: 'border-box',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
        }}>
          <i className="ti ti-logout" style={{ fontSize: 21 }} />
          로그아웃
        </button>
      </form>
    </div>
  )
}
