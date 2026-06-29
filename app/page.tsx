import { prisma } from '@/lib/db'
import { deleteHouse } from '@/lib/actions'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

export default async function Home() {
  const houses = await prisma.house.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      _count: { select: { inventories: true, histories: true } },
    },
  })

  if (houses.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <div className="text-6xl mb-4">🏠</div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">집의 이력서를 시작하세요</h1>
        <p className="text-gray-500 mb-8 max-w-sm">
          보일러 교체일, 누수 이력, 수리업체까지 — 집의 모든 기록을 한 곳에 보관합니다
        </p>
        <Link
          href="/houses/new"
          className="bg-blue-600 text-white px-6 py-3 rounded-xl font-medium hover:bg-blue-700 transition-colors"
        >
          첫 번째 주택 등록하기
        </Link>
      </div>
    )
  }

  return (
    <div>
      <h1 className="text-xl font-bold text-gray-900 mb-4">내 주택 목록</h1>
      <div className="grid gap-3">
        {houses.map((house) => (
          <div
            key={house.id}
            className="bg-white rounded-xl border border-gray-200 p-4 hover:border-blue-300 hover:shadow-sm transition-all"
          >
            <div className="flex items-start justify-between">
              <Link href={`/houses/${house.id}`} className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full font-medium">
                    {house.houseType}
                  </span>
                  {house.buildYear && (
                    <span className="text-xs text-gray-400">{house.buildYear}년 건축</span>
                  )}
                </div>
                <p className="font-semibold text-gray-900">{house.address}</p>
                {house.addressDetail && (
                  <p className="text-sm text-gray-500">{house.addressDetail}</p>
                )}
              </Link>
              <div className="flex items-center gap-3 ml-3 shrink-0">
                <div className="text-right text-sm text-gray-400 flex gap-3">
                  <span>설비 {house._count.inventories}</span>
                  <span>이력 {house._count.histories}</span>
                </div>
                <form action={deleteHouse.bind(null, house.id)}>
                  <button
                    type="submit"
                    className="text-xs text-gray-400 hover:text-red-500 transition-colors px-1"
                    onClick={(e) => {
                      if (!confirm(`"${house.address}" 주택을 삭제할까요?\n설비·이력 데이터도 모두 삭제됩니다.`)) {
                        e.preventDefault()
                      }
                    }}
                  >
                    삭제
                  </button>
                </form>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
