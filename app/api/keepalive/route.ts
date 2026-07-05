import { NextResponse } from 'next/server'
import { getHousePageData } from '@/lib/houseData'

// 공유 클라이언트(globalThis.__tursoClient)로 ping — 새 클라이언트 생성 안 함
export async function GET() {
  try {
    const g = globalThis as any
    const client = g.__tursoClient
    if (!client) return NextResponse.json({ ok: false, reason: 'no client' })
    await client.execute('SELECT 1')
    return NextResponse.json({ ok: true, ts: Date.now() })
  } catch (e) {
    return NextResponse.json({ ok: false, error: String(e) }, { status: 500 })
  }
}
