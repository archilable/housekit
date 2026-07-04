import { createClient } from '@libsql/client'

// 클라이언트 재사용 — warm 함수 인스턴스에서 재연결 없이 사용
const g = globalThis as any
if (!g.__tursoClient) {
  g.__tursoClient = createClient({
    url: process.env.TURSO_DATABASE_URL!,
    authToken: process.env.TURSO_AUTH_TOKEN,
  })
}
const client = g.__tursoClient

// 데이터 메모리 캐시 — warm 함수에서 DB 쿼리 없이 즉시 응답
const dataCache: Record<string, { data: any; ts: number }> = g.__houseDataCache ?? {}
g.__houseDataCache = dataCache
const CACHE_TTL = 30_000 // 30초

export async function getHousePageData(id: string) {
  // 캐시 히트 시 즉시 반환
  const cached = dataCache[id]
  if (cached && Date.now() - cached.ts < CACHE_TTL) return cached.data

      // 6개 쿼리를 한 번의 HTTP 요청으로 전송 (batch)
      const results = await client.batch([
        // 0. House 기본 정보 + 카운트
        {
          sql: `SELECT h.id, h.address, h.addressDetail, h.houseType, h.buildYear,
                  h.landArea, h.buildArea, h.exclusiveArea, h.area,
                  (SELECT COUNT(*) FROM Inventory WHERE houseId = h.id) as inventoryCount,
                  (SELECT COUNT(*) FROM History WHERE houseId = h.id) as historyCount,
                  (SELECT COUNT(*) FROM DoctorHistory WHERE houseId = h.id) as doctorCount
                FROM House WHERE h.id = ?`,
          args: [id],
        },
        // 1. 설비
        {
          sql: `SELECT id, category, name, brand, model, installedAt, warrantyMonths,
                  notes, sortOrder, contactName, contactPhone, contactCompany, contactImageBase64, houseId
                FROM Inventory WHERE houseId = ? ORDER BY sortOrder ASC, installedAt DESC LIMIT 50`,
          args: [id],
        },
        // 2. 이력 (이미지 제외, inventory JOIN)
        {
          sql: `SELECT h.id, h.title, h.category, h.doneAt, h.cost, h.description,
                  h.company, h.contactName, h.contactPhone, h.contactCompany,
                  h.hasEstimate, h.hasContract,
                  i.id as inv_id, i.name as inv_name, i.category as inv_category
                FROM History h
                LEFT JOIN Inventory i ON h.inventoryId = i.id
                WHERE h.houseId = ? ORDER BY h.doneAt DESC LIMIT 50`,
          args: [id],
        },
        // 3. 공과금
        {
          sql: `SELECT id, houseId, month, electric, water, gas, telecom, createdAt, updatedAt
                FROM Utility WHERE houseId = ? ORDER BY month DESC LIMIT 12`,
          args: [id],
        },
        // 4. 닥터 이력
        {
          sql: `SELECT id, description, result, createdAt, houseId, resolved, resolvedAt
                FROM DoctorHistory WHERE houseId = ? ORDER BY createdAt DESC LIMIT 20`,
          args: [id],
        },
        // 5. 시세
        {
          sql: `SELECT * FROM Valuation WHERE houseId = ? LIMIT 1`,
          args: [id],
        },
      ], 'read')

      const houseRow = results[0].rows[0]
      if (!houseRow) return null

      const house = {
        id: String(houseRow.id),
        address: String(houseRow.address),
        addressDetail: houseRow.addressDetail ? String(houseRow.addressDetail) : null,
        houseType: String(houseRow.houseType),
        buildYear: houseRow.buildYear != null ? Number(houseRow.buildYear) : null,
        landArea: houseRow.landArea != null ? Number(houseRow.landArea) : null,
        buildArea: houseRow.buildArea != null ? Number(houseRow.buildArea) : null,
        exclusiveArea: houseRow.exclusiveArea != null ? Number(houseRow.exclusiveArea) : null,
        area: houseRow.area != null ? Number(houseRow.area) : null,
        _count: {
          inventories: Number(houseRow.inventoryCount),
          histories: Number(houseRow.historyCount),
          doctorHistories: Number(houseRow.doctorCount),
        },
      }

      const inventoryData = results[1].rows.map((r: any) => ({
        id: String(r.id),
        category: String(r.category),
        name: String(r.name),
        brand: r.brand ? String(r.brand) : null,
        model: r.model ? String(r.model) : null,
        installedAt: r.installedAt ? new Date(String(r.installedAt)) : null,
        warrantyMonths: r.warrantyMonths != null ? Number(r.warrantyMonths) : null,
        notes: r.notes ? String(r.notes) : null,
        sortOrder: Number(r.sortOrder ?? 0),
        contactName: r.contactName ? String(r.contactName) : null,
        contactPhone: r.contactPhone ? String(r.contactPhone) : null,
        contactCompany: r.contactCompany ? String(r.contactCompany) : null,
        contactImageBase64: r.contactImageBase64 ? String(r.contactImageBase64) : null,
        houseId: String(r.houseId),
      }))

      const historyData = results[2].rows.map((r: any) => ({
        id: String(r.id),
        title: String(r.title),
        category: String(r.category),
        doneAt: new Date(String(r.doneAt)),
        cost: r.cost != null ? Number(r.cost) : null,
        description: r.description ? String(r.description) : null,
        company: r.company ? String(r.company) : null,
        contactName: r.contactName ? String(r.contactName) : null,
        contactPhone: r.contactPhone ? String(r.contactPhone) : null,
        contactCompany: r.contactCompany ? String(r.contactCompany) : null,
        hasEstimate: Boolean(r.hasEstimate),
        hasContract: Boolean(r.hasContract),
        inventory: r.inv_id ? { id: String(r.inv_id), name: String(r.inv_name), category: String(r.inv_category) } : null,
      }))

      const utilityData = results[3].rows.map((r: any) => ({
        id: String(r.id),
        houseId: String(r.houseId),
        month: String(r.month),
        electric: r.electric != null ? Number(r.electric) : null,
        water: r.water != null ? Number(r.water) : null,
        gas: r.gas != null ? Number(r.gas) : null,
        telecom: r.telecom != null ? Number(r.telecom) : null,
        createdAt: new Date(String(r.createdAt)),
        updatedAt: new Date(String(r.updatedAt)),
      }))

      const doctorData = results[4].rows.map((r: any) => ({
        id: String(r.id),
        houseId: String(r.houseId),
        description: r.description ? String(r.description) : null,
        result: String(r.result),
        createdAt: new Date(String(r.createdAt)),
        resolved: Boolean(r.resolved),
        resolvedAt: r.resolvedAt ? new Date(String(r.resolvedAt)) : null,
      }))

      const valRow = results[5].rows[0]
      const valuationData = valRow ? {
        id: String(valRow.id),
        houseId: String(valRow.houseId),
        landPrice: valRow.landPrice != null ? Number(valRow.landPrice) : null,
        landArea: valRow.landArea != null ? Number(valRow.landArea) : null,
        landShare: valRow.landShare != null ? Number(valRow.landShare) : null,
        buildCostPerSqm: valRow.buildCostPerSqm != null ? Number(valRow.buildCostPerSqm) : null,
        buildArea: valRow.buildArea != null ? Number(valRow.buildArea) : null,
        deprRate: valRow.deprRate != null ? Number(valRow.deprRate) : null,
        officialPrice: valRow.officialPrice != null ? Number(valRow.officialPrice) : null,
        priceRatio: valRow.priceRatio != null ? Number(valRow.priceRatio) : null,
        updatedAt: new Date(String(valRow.updatedAt)),
        createdAt: new Date(String(valRow.createdAt)),
      } : null

  const result = { house, inventoryData, historyData, utilityData, doctorData, valuationData }
  dataCache[id] = { data: result, ts: Date.now() }
  return result
}

// mutations 후 캐시 무효화
export function invalidateHouseCache(id: string) {
  delete dataCache[id]
}
