import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { invalidateHouseCache } from '@/lib/houseData'
import { auth } from '@/auth'

// POST /api/history/save — 메타데이터만 저장 (이미지 제외), historyId 반환
export async function POST(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const {
      houseId, inventoryId, category, title, description,
      cost, doneAt,
      contactName, contactPhone, contactCompany, contactImageBase64,
      hasEstimate, hasContract,
    } = body

    console.log(`[history/save] houseId=${houseId} hasEst=${hasEstimate} hasCon=${hasContract}`)

    const history = await prisma.history.create({
      data: {
        houseId,
        inventoryId: inventoryId || null,
        category,
        title,
        description: description || null,
        company: null,
        cost: cost ? parseInt(cost) : null,
        doneAt: new Date(doneAt),
        contactName: contactName || null,
        contactPhone: contactPhone || null,
        contactCompany: contactCompany || null,
        contactImageBase64: contactImageBase64 || null,
        hasEstimate: !!hasEstimate,
        hasContract: !!hasContract,
      },
    })

    // revalidatePath: DB 따뜻한 저장 직후 호출 → 다음 방문 시 빠른 재생성
    invalidateHouseCache(houseId)
    return NextResponse.json({ ok: true, historyId: history.id })
  } catch (e: any) {
    console.error('[history/save] error:', e)
    return NextResponse.json({ error: e?.message ?? 'unknown error' }, { status: 500 })
  }
}

// PATCH /api/history/save — 이미지 한 장 추가
export async function PATCH(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
    }

    const { historyId, type, imageBase64, sortOrder } = await req.json()
    console.log(`[history/save PATCH] historyId=${historyId} type=${type} sortOrder=${sortOrder} len=${imageBase64?.length}`)

    await prisma.historyImage.create({
      data: { historyId, type, imageBase64, sortOrder },
    })

    return NextResponse.json({ ok: true })
  } catch (e: any) {
    console.error('[history/save PATCH] error:', e)
    return NextResponse.json({ error: e?.message ?? 'unknown error' }, { status: 500 })
  }
}
