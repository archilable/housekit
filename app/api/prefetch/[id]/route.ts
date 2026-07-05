import { NextRequest, NextResponse } from 'next/server'
import { getHousePageData } from '@/lib/houseData'
import { auth } from '@/auth'

// 목록 페이지에서 호출 — 인메모리 캐시를 미리 채워서 대시보드 로드 속도 향상
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ ok: false }, { status: 401 })
  const { id } = await params
  await getHousePageData(id)
  return NextResponse.json({ ok: true })
}
