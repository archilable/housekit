import { NextResponse } from 'next/server'
import { createClient } from '@libsql/client'

export async function GET() {
  const client = createClient({
    url: process.env.TURSO_DATABASE_URL!,
    authToken: process.env.TURSO_AUTH_TOKEN!,
  })

  const results: string[] = []

  try {
    await client.execute(`
      CREATE TABLE IF NOT EXISTS "HistoryImage" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "historyId" TEXT NOT NULL,
        "type" TEXT NOT NULL,
        "imageBase64" TEXT NOT NULL,
        "sortOrder" INTEGER NOT NULL DEFAULT 0,
        "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "HistoryImage_historyId_fkey"
          FOREIGN KEY ("historyId") REFERENCES "History" ("id")
          ON DELETE CASCADE ON UPDATE CASCADE
      )
    `)
    results.push('HistoryImage 테이블 생성 완료')

    await client.execute(`
      CREATE INDEX IF NOT EXISTS "HistoryImage_historyId_idx"
      ON "HistoryImage"("historyId")
    `)
    results.push('인덱스 생성 완료')

    return NextResponse.json({ ok: true, results })
  } catch (e) {
    return NextResponse.json({ ok: false, error: String(e), results }, { status: 500 })
  }
}
