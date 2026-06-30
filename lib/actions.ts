'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { prisma } from './db'

// House actions
export async function createHouse(formData: FormData) {
  const address = formData.get('address') as string
  const addressDetail = formData.get('addressDetail') as string
  const buildYear = formData.get('buildYear') ? parseInt(formData.get('buildYear') as string) : null
  const area = formData.get('area') ? parseFloat(formData.get('area') as string) : null
  const houseType = formData.get('houseType') as string
  const ownerName = formData.get('ownerName') as string
  const notes = formData.get('notes') as string

  const house = await prisma.house.create({
    data: {
      address,
      addressDetail: addressDetail || null,
      buildYear,
      area,
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
      area: formData.get('area') ? parseFloat(formData.get('area') as string) : null,
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
  redirect('/')
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
export async function createHistory(formData: FormData) {
  const houseId = formData.get('houseId') as string
  const category = formData.get('category') as string
  const title = formData.get('title') as string
  const description = formData.get('description') as string
  const company = formData.get('company') as string
  const cost = formData.get('cost') ? parseInt(formData.get('cost') as string) : null
  const doneAt = formData.get('doneAt') as string

  await prisma.history.create({
    data: {
      houseId,
      category,
      title,
      description: description || null,
      company: company || null,
      cost,
      doneAt: new Date(doneAt),
    },
  })

  revalidatePath(`/houses/${houseId}`)
  redirect(`/houses/${houseId}?tab=history`)
}

export async function updateHistory(id: string, formData: FormData) {
  const houseId = formData.get('houseId') as string
  await prisma.history.update({
    where: { id },
    data: {
      category: formData.get('category') as string,
      title: formData.get('title') as string,
      description: (formData.get('description') as string) || null,
      company: (formData.get('company') as string) || null,
      cost: formData.get('cost') ? parseInt(formData.get('cost') as string) : null,
      doneAt: new Date(formData.get('doneAt') as string),
    },
  })
  revalidatePath(`/houses/${houseId}`)
  redirect(`/houses/${houseId}?tab=history`)
}

export async function deleteHistory(id: string, houseId: string) {
  await prisma.history.delete({ where: { id } })
  revalidatePath(`/houses/${houseId}`)
}
