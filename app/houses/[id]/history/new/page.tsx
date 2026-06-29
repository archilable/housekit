import { createHistory } from '@/lib/actions'
import Link from 'next/link'

export default async function NewHistoryPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const today = new Date().toISOString().split('T')[0]

  return (
    <div className="max-w-lg mx-auto">
      <div className="mb-6">
        <Link href={`/houses/${id}?tab=history`} className="text-sm text-gray-500 hover:text-gray-700">
          ← 이력 목록으로
        </Link>
        <h1 className="text-xl font-bold text-gray-900 mt-2">이력 추가</h1>
      </div>

      <form action={createHistory} className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
        <input type="hidden" name="houseId" value={id} />

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            구분 <span className="text-red-500">*</span>
          </label>
          <select
            name="category"
            required
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
          >
            <option value="">선택하세요</option>
            <option value="수리">🔧 수리</option>
            <option value="교체">🔄 교체</option>
            <option value="점검">🔍 점검</option>
            <option value="청소">🧹 청소</option>
            <option value="기타">📌 기타</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            제목 <span className="text-red-500">*</span>
          </label>
          <input
            name="title"
            required
            placeholder="보일러 수리, 누수 점검 등"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">상세 내용</label>
          <textarea
            name="description"
            rows={3}
            placeholder="작업 내용을 자세히 기록하세요"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            작업일 <span className="text-red-500">*</span>
          </label>
          <input
            name="doneAt"
            type="date"
            required
            defaultValue={today}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">업체명</label>
            <input
              name="company"
              placeholder="홍길동 보일러"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">비용 (원)</label>
            <input
              name="cost"
              type="number"
              placeholder="150000"
              min="0"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2.5 rounded-lg font-medium hover:bg-blue-700 transition-colors"
        >
          저장하기
        </button>
      </form>
    </div>
  )
}
