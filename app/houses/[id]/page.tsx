import { prisma } from '@/lib/db'

export const dynamic = 'force-dynamic'
import { deleteHistory, deleteInventory } from '@/lib/actions'
import Link from 'next/link'
import { notFound } from 'next/navigation'

function getWarrantyStatus(installedAt: Date | null, warrantyMonths: number | null) {
  if (!installedAt || !warrantyMonths) return null
  const expiry = new Date(installedAt)
  expiry.setMonth(expiry.getMonth() + warrantyMonths)
  const now = new Date()
  const diffMs = expiry.getTime() - now.getTime()
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24))

  if (diffDays < 0) return { label: '만료', color: 'text-red-600 bg-red-50' }
  if (diffDays <= 30) return { label: `D-${diffDays}`, color: 'text-orange-600 bg-orange-50' }
  return { label: `${Math.floor(diffDays / 30)}개월 남음`, color: 'text-green-600 bg-green-50' }
}

export default async function HousePage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>
  searchParams: Promise<{ tab?: string }>
}) {
  const { id } = await params
  const { tab = 'profile' } = await searchParams

  const house = await prisma.house.findUnique({
    where: { id },
    include: {
      inventories: { orderBy: { installedAt: 'desc' } },
      histories: { orderBy: { doneAt: 'desc' } },
    },
  })

  if (!house) notFound()

  const tabs = [
    { key: 'profile', label: '🏠 프로필' },
    { key: 'inventory', label: `📦 설비 (${house.inventories.length})` },
    { key: 'history', label: `📋 이력 (${house.histories.length})` },
    { key: 'doctor', label: '🩺 하우스 닥터' },
  ]

  const CATEGORY_ICONS: Record<string, string> = {
    수리: '🔧', 교체: '🔄', 점검: '🔍', 청소: '🧹', 기타: '📌',
  }
  const INVENTORY_ICONS: Record<string, string> = {
    보일러: '🔥', 에어컨: '❄️', 정수기: '💧', 냉장고: '🧊', 세탁기: '👕', 도어락: '🔐', 기타: '📦',
  }

  return (
    <div>
      <div className="mb-4">
        <Link href="/" className="text-sm text-gray-500 hover:text-gray-700">← 목록으로</Link>
        <div className="flex items-center justify-between mt-2">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full font-medium">
                {house.houseType}
              </span>
              {house.buildYear && (
                <span className="text-xs text-gray-400">{house.buildYear}년 건축</span>
              )}
            </div>
            <h1 className="text-xl font-bold text-gray-900">{house.address}</h1>
            {house.addressDetail && <p className="text-sm text-gray-500">{house.addressDetail}</p>}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 rounded-xl p-1 mb-4">
        {tabs.map((t) => (
          <Link
            key={t.key}
            href={`/houses/${id}?tab=${t.key}`}
            className={`flex-1 text-center text-sm py-2 rounded-lg font-medium transition-colors ${
              tab === t.key
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {t.label}
          </Link>
        ))}
      </div>

      {/* Profile Tab */}
      {tab === 'profile' && (
        <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-3">
          {[
            { label: '주소', value: `${house.address} ${house.addressDetail || ''}`.trim() },
            { label: '유형', value: house.houseType },
            { label: '건축연도', value: house.buildYear ? `${house.buildYear}년` : null },
            { label: '면적', value: house.area ? `${house.area}㎡` : null },
            { label: '소유자', value: house.ownerName },
            { label: '메모', value: house.notes },
          ].map(({ label, value }) =>
            value ? (
              <div key={label} className="flex gap-4">
                <span className="text-sm text-gray-500 w-20 shrink-0">{label}</span>
                <span className="text-sm text-gray-900">{value}</span>
              </div>
            ) : null
          )}
        </div>
      )}

      {/* Inventory Tab */}
      {tab === 'inventory' && (
        <div>
          <div className="flex justify-end mb-3">
            <Link
              href={`/houses/${id}/inventory/new`}
              className="text-sm bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              + 설비 추가
            </Link>
          </div>
          {house.inventories.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <p className="text-4xl mb-2">📦</p>
              <p>등록된 설비가 없습니다</p>
            </div>
          ) : (
            <div className="space-y-2">
              {house.inventories.map((item) => {
                const warranty = getWarrantyStatus(item.installedAt, item.warrantyMonths)
                return (
                  <div key={item.id} className="bg-white rounded-xl border border-gray-200 p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3">
                        <span className="text-2xl">{INVENTORY_ICONS[item.category] || '📦'}</span>
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-medium text-gray-900">{item.name}</p>
                            {warranty && (
                              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${warranty.color}`}>
                                보증 {warranty.label}
                              </span>
                            )}
                          </div>
                          {item.brand && (
                            <p className="text-sm text-gray-500">{item.brand} {item.model}</p>
                          )}
                          {item.installedAt && (
                            <p className="text-xs text-gray-400 mt-0.5">
                              설치: {item.installedAt.toLocaleDateString('ko-KR')}
                            </p>
                          )}
                        </div>
                      </div>
                      <form action={deleteInventory.bind(null, item.id, id)}>
                        <button type="submit" className="text-xs text-gray-400 hover:text-red-500 transition-colors">
                          삭제
                        </button>
                      </form>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}

      {/* History Tab */}
      {tab === 'history' && (
        <div>
          <div className="flex justify-end mb-3">
            <Link
              href={`/houses/${id}/history/new`}
              className="text-sm bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              + 이력 추가
            </Link>
          </div>
          {house.histories.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <p className="text-4xl mb-2">📋</p>
              <p>등록된 이력이 없습니다</p>
            </div>
          ) : (
            <div className="space-y-2">
              {house.histories.map((h) => (
                <div key={h.id} className="bg-white rounded-xl border border-gray-200 p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <span className="text-xl">{CATEGORY_ICONS[h.category] || '📌'}</span>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                            {h.category}
                          </span>
                          <p className="font-medium text-gray-900">{h.title}</p>
                        </div>
                        {h.description && (
                          <p className="text-sm text-gray-500 mt-0.5">{h.description}</p>
                        )}
                        <div className="flex gap-3 text-xs text-gray-400 mt-1">
                          <span>{h.doneAt.toLocaleDateString('ko-KR')}</span>
                          {h.company && <span>업체: {h.company}</span>}
                          {h.cost != null && <span>비용: {h.cost.toLocaleString()}원</span>}
                        </div>
                      </div>
                    </div>
                    <form action={deleteHistory.bind(null, h.id, id)}>
                      <button type="submit" className="text-xs text-gray-400 hover:text-red-500 transition-colors">
                        삭제
                      </button>
                    </form>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Doctor Tab */}
      {tab === 'doctor' && (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="text-center mb-6">
            <p className="text-4xl mb-2">🩺</p>
            <h2 className="text-lg font-bold text-gray-900">하우스 닥터</h2>
            <p className="text-sm text-gray-500">문제 증상을 설명하면 AI가 원인과 수리비를 진단합니다</p>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">문제 부위</label>
              <select className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white">
                <option>선택하세요</option>
                <option>보일러/난방</option>
                <option>수도/배관</option>
                <option>전기/조명</option>
                <option>지붕/외벽</option>
                <option>창문/문</option>
                <option>화장실/욕실</option>
                <option>기타</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">증상 설명</label>
              <textarea
                rows={4}
                placeholder="예: 보일러를 켜면 이상한 소리가 나고 온수가 잘 나오지 않아요"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">사진 첨부 (선택)</label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-blue-400 transition-colors">
                <p className="text-gray-400 text-sm">📷 사진을 드래그하거나 클릭해서 업로드</p>
              </div>
            </div>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-blue-700">
              <strong>AI 진단 기능</strong>은 다음 버전에서 제공될 예정입니다.
              현재는 증상을 기록해두고 수리 이력으로 저장하세요.
            </div>
            <Link
              href={`/houses/${id}/history/new`}
              className="block w-full text-center bg-gray-100 text-gray-700 py-2.5 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors"
            >
              수리 이력으로 저장하기
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}
