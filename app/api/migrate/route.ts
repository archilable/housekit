import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET() {
  try {
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "FloorPlan" (
        "id"        TEXT NOT NULL PRIMARY KEY,
        "houseId"   TEXT NOT NULL,
        "name"      TEXT NOT NULL,
        "url"       TEXT NOT NULL,
        "fileType"  TEXT NOT NULL,
        "fileSize"  INTEGER NOT NULL DEFAULT 0,
        "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "FloorPlan_houseId_fkey" FOREIGN KEY ("houseId") REFERENCES "House" ("id") ON DELETE CASCADE ON UPDATE CASCADE
      )
    `)
    return NextResponse.json({ ok: true, message: 'FloorPlan table created' })
  } catch (e) {
    return NextResponse.json({ ok: false, error: String(e) }, { status: 500 })
  }
}
