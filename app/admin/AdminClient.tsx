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
  lastSeenAt: Date | null
  houses: House[]
  houseAccess: HouseAccess[]
  accounts: { provider: string }[]
}

type HouseItem = {
  id: string
  address: string
  houseType: string
  createdAt: Date
  user: { name: string | null; image: string | null } | null
}

type ActivityItem = {
  id: string
  type: 'history' | 'inventory'
  title: string
  category: string
  address: string
  userName: string | null
  userImage: string | null
  createdAt: Date
}

function timeAgo(date: Date) {
  const diffMs = Date.now() - new Date(date).getTime()
  const diffMin = Math.floor(diffMs / 60000)
  if (diffMin < 1) return '방금 전'
  if (diffMin < 60) return `${diffMin}분 전`
  const diffHr = Math.floor(diffMin / 60)
  if (diffHr < 24) return `${diffHr}시간 전`
  const diffDay = Math.floor(diffHr / 24)
  if (diffDay < 7) return `${diffDay}일 전`
  return new Date(date).toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' })
}

export default function AdminClient({ users, todayCount, totalHouses, myId, activities = [], allHouses = [], todayThreshold }: {
  users: User[]
  todayCount: number
  totalHouses: number
  myId: string
  activities?: ActivityItem[]
  allHouses?: HouseItem[]
  todayThreshold?: string
}) {
  const [userList, setUserList] = useState(users)
  const [loading, setLoading] = useState<string | null>(null)
  const [filter, setFilter] = useState<'all' | 'today' | 'houses'>('all')

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const todayDate = todayThreshold ? new Date(todayThreshold) : today

  const filteredUsers = userList.filter(u => {
    if (filter === 'today') return u.createdAt && new Date(u.createdAt) >= todayDate
    if (filter === 'houses') return u.houses.length > 0 || u.houseAccess.length > 0
    return true
  })

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
        <button onClick={() => setFilter('all')} style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer' }}>
          <div style={{
            width: 44, height: 44, borderRadius: 14,
            background: 'linear-gradient(135deg, #1e1e3a 0%, #0d0d1f 100%)',
            border: `0.5px solid ${filter === 'all' ? '#4a4a8a' : '#2a2a5a'}`, display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <i className="ti ti-shield-lock" style={{ fontSize: 24, color: '#818cf8' }} />
          </div>
        </button>
        <div>
          <p style={{ fontSize: 13, color: '#555', textTransform: 'uppercase', letterSpacing: 1 }}>관리자</p>
          <h1 style={{ fontSize: 22, fontWeight: 700 }}>HouseKit Admin</h1>
        </div>
      </div>

      {/* 요약 카드 */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, marginBottom: 28 }}>
        <button onClick={() => setFilter('all')} style={{ background: filter === 'all' ? '#1a2a4a' : '#0d1a2e', border: `0.5px solid ${filter === 'all' ? '#3a6abf' : '#1e3a5f'}`, borderRadius: 14, padding: '14px 12px', textAlign: 'center', cursor: 'pointer', fontFamily: 'inherit' }}>
          <p style={{ fontSize: 26, fontWeight: 700, color: '#60a5fa' }}>{userList.length}</p>
          <p style={{ fontSize: 13, color: '#666', marginTop: 2 }}>전체 가입자</p>
        </button>
        <button onClick={() => setFilter(f => f === 'today' ? 'all' : 'today')} style={{ background: filter === 'today' ? '#1a3d28' : '#0d1f14', border: `0.5px solid ${filter === 'today' ? '#34d399' : '#1a3d28'}`, borderRadius: 14, padding: '14px 12px', textAlign: 'center', cursor: 'pointer', fontFamily: 'inherit' }}>
          <p style={{ fontSize: 26, fontWeight: 700, color: '#34d399' }}>{todayCount}</p>
          <p style={{ fontSize: 13, color: '#666', marginTop: 2 }}>오늘 가입</p>
        </button>
        <button onClick={() => setFilter(f => f === 'houses' ? 'all' : 'houses')} style={{ background: filter === 'houses' ? '#2a1800' : '#1a0f00', border: `0.5px solid ${filter === 'houses' ? '#f97316' : '#3d2000'}`, borderRadius: 14, padding: '14px 12px', textAlign: 'center', cursor: 'pointer', fontFamily: 'inherit' }}>
          <p style={{ fontSize: 26, fontWeight: 700, color: '#f97316' }}>{totalHouses}</p>
          <p style={{ fontSize: 13, color: '#666', marginTop: 2 }}>등록 자산</p>
        </button>
      </div>

      {/* 등록 자산 목록 */}
      {filter === 'houses' && (
        <div style={{ marginBottom: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <p style={{ fontSize: 13, color: '#444', textTransform: 'uppercase', letterSpacing: 1 }}>
              등록 자산 <span style={{ marginLeft: 8, color: '#f97316' }}>{allHouses.length}개</span>
            </p>
            <button onClick={() => setFilter('all')} style={{ background: 'none', border: 'none', color: '#555', fontSize: 13, cursor: 'pointer', fontFamily: 'inherit' }}>전체 보기 ✕</button>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {allHouses.map(house => (
              <div key={house.id} style={{ background: 'var(--bg-card)', border: '0.5px solid var(--border)', borderRadius: 14, padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 40, height: 40, borderRadius: 12, background: 'rgba(249,115,22,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0 }}>🏠</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: 15, fontWeight: 600, color: '#fff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{house.address}</p>
                  <p style={{ fontSize: 12, color: '#555', marginTop: 2 }}>
                    {house.houseType} · {house.user?.name ?? '알 수 없음'} · {new Date(house.createdAt).toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 가입자 목록 */}
      {filter !== 'houses' && (
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <p style={{ fontSize: 13, color: '#444', textTransform: 'uppercase', letterSpacing: 1 }}>
          {filter === 'all' ? '가입자 목록' : '오늘 가입자'}
          <span style={{ marginLeft: 8, color: '#60a5fa' }}>{filteredUsers.length}명</span>
        </p>
        {filter !== 'all' && (
          <button onClick={() => setFilter('all')} style={{ background: 'none', border: 'none', color: '#555', fontSize: 13, cursor: 'pointer', fontFamily: 'inherit' }}>전체 보기 ✕</button>
        )}
      </div>
      )}
      {filter !== 'houses' && (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {filteredUsers.map((user) => {
          const isToday = user.createdAt && new Date(user.createdAt) >= today
          const isMe = user.id === myId
          const joinDate = user.createdAt
            ? new Date(user.createdAt).toLocaleDateString('ko-KR', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
            : '—'
          const lastSeen = user.lastSeenAt ? (() => {
            const d = new Date(user.lastSeenAt)
            const diffMs = Date.now() - d.getTime()
            const diffMin = Math.floor(diffMs / 60000)
            if (diffMin < 1) return '방금 전'
            if (diffMin < 60) return `${diffMin}분 전`
            const diffHr = Math.floor(diffMin / 60)
            if (diffHr < 24) return `${diffHr}시간 전`
            const diffDay = Math.floor(diffHr / 24)
            if (diffDay < 7) return `${diffDay}일 전`
            return d.toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' })
          })() : null

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
                    : <i className="ti ti-user" style={{ color: isToday ? '#34d399' : '#60a5fa', fontSize: 20 }} />}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2, flexWrap: 'wrap' }}>
                    <p style={{ fontSize: 16, fontWeight: 500 }}>{user.name || '이름 없음'}</p>
                    {isToday && <span style={{ fontSize: 12, color: '#34d399', background: '#0d1f14', border: '0.5px solid #1a3d28', padding: '1px 6px', borderRadius: 8 }}>NEW</span>}
                    {user.isAdmin && <span style={{ fontSize: 12, color: '#818cf8', background: '#0d0d1f', border: '0.5px solid #2a2a5a', padding: '1px 6px', borderRadius: 8 }}>관리자</span>}
                  </div>
                  <p style={{ fontSize: 14, color: '#555' }}>
                    {user.email ?? (user.accounts.some(a => a.provider === 'kakao') ? '카카오 계정' : '이메일 없음')}
                    {user.accounts.map(a => (
                      <span key={a.provider} style={{ marginLeft: 5, fontSize: 12, color: a.provider === 'kakao' ? '#FEE500' : '#60a5fa', background: '#111', border: '0.5px solid #222', borderRadius: 6, padding: '1px 5px' }}>
                        {a.provider}
                      </span>
                    ))}
                  </p>
                  <p style={{ fontSize: 13, color: '#444', marginTop: 1 }}>가입: {joinDate}</p>
                  {lastSeen && (
                    <p style={{ fontSize: 13, color: '#34d399', marginTop: 1 }}>접속: {lastSeen}</p>
                  )}
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
                      fontSize: 13, color: user.isAdmin ? '#818cf8' : '#555',
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
                    <span key={h.id} style={{ fontSize: 13, color: '#60a5fa' }}>🏠 {h.address}</span>
                  ))}
                  {user.houseAccess.map((a, i) => (
                    <span key={i} style={{ fontSize: 13, color: '#555' }}>🔗 {a.house.address} (공유)</span>
                  ))}
                </div>
              )}
            </div>
          )
        })}
      </div>
      )}

      {/* 최근 활동 피드 - 메인(전체) 화면에서만 표시 */}
      {filter === 'all' && activities.length > 0 && (
        <div style={{ marginTop: 32 }}>
          <p style={{ fontSize: 13, color: '#444', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 12 }}>최근 활동</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {activities.map((act) => (
              <div key={act.type + act.id} style={{
                background: 'var(--bg-card)', border: '0.5px solid var(--border)',
                borderRadius: 14, padding: '12px 14px',
                display: 'flex', alignItems: 'center', gap: 12,
              }}>
                {/* 아바타 */}
                <div style={{
                  width: 36, height: 36, borderRadius: 10, flexShrink: 0,
                  background: act.type === 'history' ? 'rgba(96,165,250,0.15)' : 'rgba(52,211,153,0.15)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden',
                }}>
                  {act.userImage
                    ? <img src={act.userImage} width={36} height={36} style={{ borderRadius: 10, objectFit: 'cover' }} alt="" />
                    : <i className={act.type === 'history' ? 'ti ti-history' : 'ti ti-tool'} style={{ fontSize: 18, color: act.type === 'history' ? '#60a5fa' : '#34d399' }} />
                  }
                </div>
                {/* 내용 */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: 14, color: '#fff', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    <span style={{ color: act.type === 'history' ? '#60a5fa' : '#34d399' }}>
                      {act.userName ?? '알 수 없음'}
                    </span>
                    {' · '}{act.title}
                  </p>
                  <p style={{ fontSize: 12, color: '#444', marginTop: 2 }}>
                    {act.type === 'history' ? '이력 추가' : '설비 추가'} · {act.address}
                  </p>
                </div>
                {/* 시간 */}
                <p style={{ fontSize: 12, color: '#333', flexShrink: 0 }}>{timeAgo(act.createdAt)}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
