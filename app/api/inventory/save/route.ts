import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { invalidateHouseCache } from '@/lib/houseData'
import { auth } from '@/auth'

// POST — 설비 신규 생성
export async function POST(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

    const body = await req.json()
    const { houseId, category, name, brand, model, installedAt, warrantyMonths, notes,
      contactName, contactPhone, contactCompany, contactImageBase64 } = body

    const item = await prisma.inventory.create({
      data: {
        houseId,
        category,
        name,
        brand: brand || null,
        model: model || null,
        installedAt: installedAt ? new Date(installedAt) : null,
        warrantyMonths: warrantyMonths ? parseInt(warrantyMonths) : null,
        notes: notes || null,
        contactName: contactName || null,
        contactPhone: contactPhone || null,
        contactCompany: contactCompany || null,
        contactImageBase64: contactImageBase64 || null,
      },
    })

    invalidateHouseCache(houseId)
    return NextResponse.json({ ok: true, id: item.id })
  } catch (e: any) {
    console.error('[inventory/save POST]', e)
    return NextResponse.json({ error: e?.message ?? 'unknown' }, { status: 500 })
  }
}

// PATCH — 설비 수정
export async function PATCH(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

    const body = await req.json()
    const { inventoryId, houseId, category, name, brand, model, installedAt, warrantyMonths, notes,
      contactName, contactPhone, contactCompany, contactImageBase64 } = body

    await prisma.inventory.update({
      where: { id: inventoryId },
      data: {
        category,
        name,
        brand: brand || null,
        model: model || null,
        installedAt: installedAt ? new Date(installedAt) : null,
        warrantyMonths: warrantyMonths ? parseInt(warrantyMonths) : null,
        notes: notes || null,
        contactName: contactName || null,
        contactPhone: contactPhone || null,
        contactCompany: contactCompany || null,
        contactImageBase64: contactImageBase64 || null,
      },
    })

    invalidateHouseCache(houseId)
    fetch(`${req.nextUrl.origin}/houses/${houseId}`).catch(() => {})
    return NextResponse.json({ ok: true })
  } catch (e: any) {
    console.error('[inventory/save PATCH]', e)
    return NextResponse.json({ error: e?.message ?? 'unknown' }, { status: 500 })
  }
}
