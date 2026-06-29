import { createInventory } from '@/lib/actions'
import Link from 'next/link'

export default async function NewInventoryPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  return (
    <div className="max-w-lg mx-auto">
      <div className="mb-6">
        <Link href={`/houses/${id}?tab=inventory`} className="text-sm text-gray-500 hover:text-gray-700">
          ← 설비 목록으로
        </Link>
        <h1 className="text-xl font-bold text-gray-900 mt-2">설비 추가</h1>
      </div>

      <form action={createInventory} className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
        <input type="hidden" name="houseId" value={id} />

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            카테고리 <span className="text-red-500">*</span>
          </label>
          <select
            name="category"
            required
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
          >
            <option value="">선택하세요</option>
            <option value="보일러">🔥 보일러</option>
            <option value="에어컨">❄️ 에어컨</option>
            <option value="정수기">💧 정수기</option>
            <option value="냉장고">🧊 냉장고</option>
            <option value="세탁기">👕 세탁기</option>
            <option value="도어락">🔐 도어락</option>
            <option value="기타">📦 기타</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            설비명 <span className="text-red-500">*</span>
          </label>
          <input
            name="name"
            required
            placeholder="거실 에어컨"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">브랜드</label>
            <input
              name="brand"
              placeholder="삼성, LG 등"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">모델명</label>
            <input
              name="model"
              placeholder="AF17TX700HFH"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">설치일</label>
            <input
              name="installedAt"
              type="date"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">보증기간 (개월)</label>
            <input
              name="warrantyMonths"
              type="number"
              placeholder="24"
              min="1"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">메모</label>
          <textarea
            name="notes"
            rows={2}
            placeholder="추가 정보"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
          />
        </div>

        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2.5 rounded-lg font-medium hover:bg-blue-700 transition-colors"
        >
          추가하기
        </button>
      </form>
    </div>
  )
}
