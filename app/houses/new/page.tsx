import { createHouse } from '@/lib/actions'
import Link from 'next/link'

export default function NewHousePage() {
  return (
    <div className="max-w-lg mx-auto">
      <div className="mb-6">
        <Link href="/" className="text-sm text-gray-500 hover:text-gray-700">← 목록으로</Link>
        <h1 className="text-xl font-bold text-gray-900 mt-2">주택 등록</h1>
      </div>

      <form action={createHouse} className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            주소 <span className="text-red-500">*</span>
          </label>
          <input
            name="address"
            required
            placeholder="서울시 마포구 합정동 123-45"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">상세 주소</label>
          <input
            name="addressDetail"
            placeholder="1층, 빌라 A동 101호 등"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            주택 유형 <span className="text-red-500">*</span>
          </label>
          <select
            name="houseType"
            required
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
          >
            <option value="">선택하세요</option>
            <option value="단독주택">단독주택</option>
            <option value="빌라/연립">빌라/연립</option>
            <option value="다가구">다가구</option>
            <option value="아파트">아파트</option>
            <option value="기타">기타</option>
          </select>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">건축연도</label>
            <input
              name="buildYear"
              type="number"
              placeholder="2005"
              min="1900"
              max={new Date().getFullYear()}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">면적 (㎡)</label>
            <input
              name="area"
              type="number"
              placeholder="84.5"
              step="0.1"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">소유자 이름</label>
          <input
            name="ownerName"
            placeholder="홍길동"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">메모</label>
          <textarea
            name="notes"
            rows={3}
            placeholder="추가 정보를 입력하세요"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
          />
        </div>

        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2.5 rounded-lg font-medium hover:bg-blue-700 transition-colors"
        >
          등록하기
        </button>
      </form>
    </div>
  )
}
