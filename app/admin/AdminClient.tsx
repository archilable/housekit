'use client'
import { useState } from 'react'

type House = { id: string; address: string }
type HouseAccess = { id: string; house: { address: string } }
type User = {
  id: string
  name: string | null
  email: string | null
  image: string | null
  isAdmin: boolean
  createdAt: Date
  houses: House[]
  houseAccess: HouseAccess[]
}

export default function AdminClient({ users, todayCount, totalHouses, myId }: {
  users: User[]
  todayCount: number
  totalHouses: number
  myId: string
}) {
  const [userList, setUserList] = useState(users)
  const [loading, setLoading] = useState<string | null>(null)

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  async function toggleAdmin(userId: string, current: boolean) {
    setLoading(userId)
    await fetch('/api/admin/toggle', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, isAdmin: !current }),
    })
    setUserList(prev => prev.map(u => u.id === userId ? { ...u, isAdmin: !current } : u))
    setLoading(null)
  }

  return (
    <div style={{ padding: '32px 16px 40px', maxWidth: 480, margin: '0 auto' }}>
      {/* 헤더 */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 28 }}>
        <div style={{
          width: 44, height: 44, borderRadius: 14,
          background: 'linear-gradient(135deg, #1e1e3a 0%, #0d0d1f 100%)',
          border: '0.5px solid #2a2a5a', display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <i className="ti ti-shield-lock" style={{ fontSize: 22, color: '#818cf8' }} />
        </div>
        <div>
          <p style={{ fontSize: 11, color: '#555', textTransform: 'uppercase', letterSpacing: 1 }}>관리자</p>
          <h1 style={{ fontSize: 20, fontWeight: 700 }}>HouseKit Admin</h1>
        </div>
      </div>

      {/* 요약 카드 */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, marginBottom: 28 }}>
        <div style={{ background: '#0d1a2e', border: '0.5px solid #1e3a5f', borderRadius: 14, padding: '14px 12px', textAlign: 'center' }}>
          <p style={{ fontSize: 24, fontWeight: 700, color: '#60a5fa' }}>{userList.length}</p>
          <p style={{ fontSize: 11, color: '#666', marginTop: 2 }}>전체 가입자</p>
        </div>
        <div style={{ background: '#0d1f14', border: '0.5px solid #1a3d28', borderRadius: 14, padding: '14px 12px', textAlign: 'center' }}>
          <p style={{ fontSize: 24, fontWeight: 700, color: '#34d399' }}>{todayCount}</p>
          <p style={{ fontSize: 11, color: '#666', marginTop: 2 }}>오늘 가입</p>
        </div>
        <div style={{ background: '#1a0f00', border: '0.5px solid #3d2000', borderRadius: 14, padding: '14px 12px', textAlign: 'center' }}>
          <p style={{ fontSize: 24, fontWeight: 700, color: '#f97316' }}>{totalHouses}</p>
          <p style={{ fontSize: 11, color: '#666', marginTop: 2 }}>등록 자산</p>
        </div>
      </div>

      {/* 가입자 목록 */}
      <p style={{ fontSize: 11, color: '#444', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 12 }}>가입자 목록</p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {userList.map((user) => {
          const isToday = user.createdAt && new Date(user.createdAt) >= today
          const isMe = user.id === myId
          const joinDate = user.createdAt
            ? new Date(user.createdAt).toLocaleDateString('ko-KR', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
            : '—'

          return (
            <div key={user.id} style={{
              background: isToday ? '#0d1f14' : 'var(--bg-card)',
              border: isToday ? '0.5px solid #1a3d28' : '0.5px solid var(--border)',
              borderRadius: 14, padding: '14px 16px',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{
                  width: 40, height: 40, borderRadius: 12, flexShrink: 0,
                  background: isToday ? '#34d39922' : '#60a5fa22',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden',
                }}>
                  {user.image
                    ? <img src={user.image} width={40} height={40} style={{ borderRadius: 12, objectFit: 'cover' }} alt="" />
                    : <i className="ti ti-user" style={{ color: isToday ? '#34d399' : '#60a5fa', fontSize: 18 }} />}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2, flexWrap: 'wrap' }}>
                    <p style={{ fontSize: 14, fontWeight: 500 }}>{user.name || '이름 없음'}</p>
                    {isToday && <span style={{ fontSize: 10, color: '#34d399', background: '#0d1f14', border: '0.5px solid #1a3d28', padding: '1px 6px', borderRadius: 8 }}>NEW</span>}
                    {user.isAdmin && <span style={{ fontSize: 10, color: '#818cf8', background: '#0d0d1f', border: '0.5px solid #2a2a5a', padding: '1px 6px', borderRadius: 8 }}>관리자</span>}
                  </div>
                  <p style={{ fontSize: 12, color: '#555' }}>{user.email}</p>
                  <p style={{ fontSize: 11, color: '#444', marginTop: 1 }}>{joinDate}</p>
                </div>
                {/* 관리자 권한 토글 */}
                {!isMe && (
                  <button
                    onClick={() => toggleAdmin(user.id, user.isAdmin)}
                    disabled={loading === user.id}
                    style={{
                      background: user.isAdmin ? '#1e1e3a' : '#1a1a1a',
                      border: user.isAdmin ? '0.5px solid #2a2a5a' : '0.5px solid #2a2a2a',
                      borderRadius: 10, padding: '6px 10px', cursor: 'pointer',
                      fontSize: 11, color: user.isAdmin ? '#818cf8' : '#555',
                      flexShrink: 0, opacity: loading === user.id ? 0.5 : 1,
                    }}
                  >
                    {user.isAdmin ? '권한 해제' : '권한 부여'}
                  </button>
                )}
              </div>
              {/* 자산 목록 */}
              {(user.houses.length > 0 || user.houseAccess.length > 0) && (
                <div style={{ marginTop: 10, paddingTop: 10, borderTop: '0.5px solid #1e1e28', display: 'flex', flexDirection: 'column', gap: 4 }}>
                  {user.houses.map(h => (
                    <span key={h.id} style={{ fontSize: 11, color: '#60a5fa' }}>🏠 {h.address}</span>
                  ))}
                  {user.houseAccess.map((a, i) => (
                    <span key={i} style={{ fontSize: 11, color: '#555' }}>🔗 {a.house.address} (공유)</span>
                  ))}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
