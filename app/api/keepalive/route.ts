import { createClient } from '@libsql/client'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const client = createClient({
      url: process.env.TURSO_DATABASE_URL!,
      authToken: process.env.TURSO_AUTH_TOKEN,
    })
    await client.execute('SELECT 1')
    return NextResponse.json({ ok: true, ts: Date.now() })
  } catch (e) {
    return NextResponse.json({ ok: false, error: String(e) }, { status: 500 })
  }
}
