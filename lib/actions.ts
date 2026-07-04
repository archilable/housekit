'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { prisma } from './db'
import { auth } from '@/auth'

// House actions
export async function createHouse(formData: FormData) {
  const session = await auth()
  const address = formData.get('address') as string
  const addressDetail = formData.get('addressDetail') as string
  const buildYear = formData.get('buildYear') ? parseInt(formData.get('buildYear') as string) : null
  const landArea = formData.get('landArea') ? parseFloat(formData.get('landArea') as string) : null
  const buildArea = formData.get('buildArea') ? parseFloat(formData.get('buildArea') as string) : null
  const exclusiveArea = formData.get('exclusiveArea') ? parseFloat(formData.get('exclusiveArea') as string) : null
  const houseType = formData.get('houseType') as string
  const ownerName = formData.get('ownerName') as string
  const notes = formData.get('notes') as string

  const house = await prisma.house.create({
    data: {
      userId: session?.user?.id ?? null,
      address,
      addressDetail: addressDetail || null,
      buildYear,
      landArea,
      buildArea,
      exclusiveArea,
      houseType,
      ownerName: ownerName || null,
      notes: notes || null,
    },
  })

  redirect(`/houses/${house.id}`)
}

export async function updateHouse(id: string, formData: FormData) {
  await prisma.house.update({
    where: { id },
    data: {
      address: formData.get('address') as string,
      addressDetail: (formData.get('addressDetail') as string) || null,
      buildYear: formData.get('buildYear') ? parseInt(formData.get('buildYear') as string) : null,
      landArea: formData.get('landArea') ? parseFloat(formData.get('landArea') as string) : null,
      buildArea: formData.get('buildArea') ? parseFloat(formData.get('buildArea') as string) : null,
      exclusiveArea: formData.get('exclusiveArea') ? parseFloat(formData.get('exclusiveArea') as string) : null,
      houseType: formData.get('houseType') as string,
      ownerName: (formData.get('ownerName') as string) || null,
      notes: (formData.get('notes') as string) || null,
    },
  })
  revalidatePath(`/houses/${id}`)
  redirect(`/houses/${id}`)
}

export async function deleteHouse(id: string) {
  await prisma.house.delete({ where: { id } })
  revalidatePath('/')
  redirect('/houses')
}

// Inventory actions
export async function createInventory(formData: FormData) {
  const houseId = formData.get('houseId') as string
  const category = formData.get('category') as string
  const name = formData.get('name') as string
  const brand = formData.get('brand') as string
  const model = formData.get('model') as string
  const installedAtStr = formData.get('installedAt') as string
  const warrantyMonths = formData.get('warrantyMonths') ? parseInt(formData.get('warrantyMonths') as string) : null
  const notes = formData.get('notes') as string

  await prisma.inventory.create({
    data: {
      houseId,
      category,
      name,
      brand: brand || null,
      model: model || null,
      installedAt: installedAtStr ? new Date(installedAtStr) : null,
      warrantyMonths,
      notes: notes || null,
      contactName: (formData.get('contactName') as string) || null,
      contactPhone: (formData.get('contactPhone') as string) || null,
      contactCompany: (formData.get('contactCompany') as string) || null,
      contactImageBase64: (formData.get('contactImageBase64') as string) || null,
    },
  })

  revalidatePath(`/houses/${houseId}`)
  redirect(`/houses/${houseId}?tab=inventory`)
}

export async function updateInventory(id: string, formData: FormData) {
  const houseId = formData.get('houseId') as string
  const installedAtStr = formData.get('installedAt') as string
  await prisma.inventory.update({
    where: { id },
    data: {
      category: formData.get('category') as string,
      name: formData.get('name') as string,
      brand: (formData.get('brand') as string) || null,
      model: (formData.get('model') as string) || null,
      installedAt: installedAtStr ? new Date(installedAtStr) : null,
      warrantyMonths: formData.get('warrantyMonths') ? parseInt(formData.get('warrantyMonths') as string) : null,
      notes: (formData.get('notes') as string) || null,
      contactName: (formData.get('contactName') as string) || null,
      contactPhone: (formData.get('contactPhone') as string) || null,
      contactCompany: (formData.get('contactCompany') as string) || null,
      contactImageBase64: (formData.get('contactImageBase64') as string) || null,
    },
  })
  revalidatePath(`/houses/${houseId}`)
  redirect(`/houses/${houseId}?tab=inventory`)
}

export async function deleteInventory(id: string, houseId: string) {
  await prisma.inventory.delete({ where: { id } })
  revalidatePath(`/houses/${houseId}`)
}

// History actions
function extractImages(formData: FormData, name: string): string[] {
  return (formData.getAll(name) as string[]).filter(Boolean)
}

export async function createHistory(formData: FormData) {
  const houseId = formData.get('houseId') as string
  const category = formData.get('category') as string
  const title = formData.get('title') as string
  const description = formData.get('description') as string
  const company = formData.get('company') as string
  const cost = formData.get('cost') ? parseInt(formData.get('cost') as string) : null
  const doneAt = formData.get('doneAt') as string
  const inventoryId = (formData.get('inventoryId') as string) || null

  const estimateImages = extractImages(formData, 'estimateImage')
  const contractImages = extractImages(formData, 'contractImage')

  const history = await prisma.history.create({
    data: {
      houseId,
      inventoryId,
      category,
      title,
      description: description || null,
      company: company || null,
      cost,
      doneAt: new Date(doneAt),
      contactName: (formData.get('contactName') as string) || null,
      contactPhone: (formData.get('contactPhone') as string) || null,
      contactCompany: (formData.get('contactCompany') as string) || null,
      contactImageBase64: (formData.get('contactImageBase64') as string) || null,
      hasEstimate: estimateImages.length > 0,
      hasContract: contractImages.length > 0,
    },
  })

  for (let i = 0; i < estimateImages.length; i++) {
    await prisma.historyImage.create({ data: { historyId: history.id, type: 'estimate', imageBase64: estimateImages[i], sortOrder: i } })
  }
  for (let i = 0; i < contractImages.length; i++) {
    await prisma.historyImage.create({ data: { historyId: history.id, type: 'contract', imageBase64: contractImages[i], sortOrder: i } })
  }

  revalidatePath(`/houses/${houseId}`)
  redirect(`/houses/${houseId}?tab=history`)
}

export async function updateHistory(id: string, formData: FormData) {
  const houseId = formData.get('houseId') as string
  const estimateImages = extractImages(formData, 'estimateImage')
  const contractImages = extractImages(formData, 'contractImage')

  await prisma.history.update({
    where: { id },
    data: {
      inventoryId: (formData.get('inventoryId') as string) || null,
      category: formData.get('category') as string,
      title: formData.get('title') as string,
      description: (formData.get('description') as string) || null,
      company: (formData.get('company') as string) || null,
      cost: formData.get('cost') ? parseInt(formData.get('cost') as string) : null,
      doneAt: new Date(formData.get('doneAt') as string),
      contactName: (formData.get('contactName') as string) || null,
      contactPhone: (formData.get('contactPhone') as string) || null,
      contactCompany: (formData.get('contactCompany') as string) || null,
      contactImageBase64: (formData.get('contactImageBase64') as string) || null,
      hasEstimate: estimateImages.length > 0,
      hasContract: contractImages.length > 0,
    },
  })

  // 기존 이미지 삭제 후 새로 저장
  await prisma.historyImage.deleteMany({ where: { historyId: id } })
  for (let i = 0; i < estimateImages.length; i++) {
    await prisma.historyImage.create({ data: { historyId: id, type: 'estimate', imageBase64: estimateImages[i], sortOrder: i } })
  }
  for (let i = 0; i < contractImages.length; i++) {
    await prisma.historyImage.create({ data: { historyId: id, type: 'contract', imageBase64: contractImages[i], sortOrder: i } })
  }

  revalidatePath(`/houses/${houseId}`)
  redirect(`/houses/${houseId}?tab=history`)
}

export async function deleteHistory(id: string, houseId: string) {
  await prisma.history.delete({ where: { id } })
  revalidatePath(`/houses/${houseId}`)
}

// Utility actions
export async function upsertUtility(formData: FormData) {
  const houseId = formData.get('houseId') as string
  const month = formData.get('month') as string
  const electric = formData.get('electric') ? parseInt(formData.get('electric') as string) : null
  const water = formData.get('water') ? parseInt(formData.get('water') as string) : null
  const gas = formData.get('gas') ? parseInt(formData.get('gas') as string) : null
  const telecom = formData.get('telecom') ? parseInt(formData.get('telecom') as string) : null

  await prisma.utility.upsert({
    where: { houseId_month: { houseId, month } },
    create: { houseId, month, electric, water, gas, telecom },
    update: { electric, water, gas, telecom },
  })

  revalidatePath(`/houses/${houseId}`)
  redirect(`/houses/${houseId}?tab=utility`)
}

export async function deleteUtility(utilityId: string, houseId: string) {
  await prisma.utility.delete({ where: { id: utilityId } })
  revalidatePath(`/houses/${houseId}`)
  redirect(`/houses/${houseId}?tab=utility`)
}

// Valuation actions
export async function upsertValuation(formData: FormData) {
  const houseId = formData.get('houseId') as string
  const f = (k: string) => formData.get(k)
  const fi = (k: string) => f(k) ? parseInt(f(k) as string) : null
  const ff = (k: string) => f(k) ? parseFloat(f(k) as string) : null

  await prisma.valuation.upsert({
    where: { houseId },
    create: {
      houseId,
      landPrice: fi('landPrice'),
      landArea: ff('landArea'),
      landShare: ff('landShare'),
      buildCostPerSqm: fi('buildCostPerSqm'),
      buildArea: ff('buildArea'),
      deprRate: ff('deprRate'),
      officialPrice: fi('officialPrice'),
      priceRatio: ff('priceRatio'),
    },
    update: {
      landPrice: fi('landPrice'),
      landArea: ff('landArea'),
      landShare: ff('landShare'),
      buildCostPerSqm: fi('buildCostPerSqm'),
      buildArea: ff('buildArea'),
      deprRate: ff('deprRate'),
      officialPrice: fi('officialPrice'),
      priceRatio: ff('priceRatio'),
    },
  })
  revalidatePath(`/houses/${houseId}`)
  redirect(`/houses/${houseId}?tab=valuation`)
}
