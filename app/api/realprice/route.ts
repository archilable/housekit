import { NextRequest, NextResponse } from 'next/server'
import { unstable_cache } from 'next/cache'

// 법정동코드 앞 5자리 추출 (주소 기반)
function getLawdCd(address: string): string {
  // 제주
  if (address.includes('서귀포시')) return '50130'
  if (address.includes('제주시') || address.includes('제주')) return '50110'
  // 서울 구
  if (address.includes('서울')) {
    if (address.includes('종로구')) return '11110'
    if (address.includes('중구')) return '11140'
    if (address.includes('용산구')) return '11170'
    if (address.includes('성동구')) return '11200'
    if (address.includes('광진구')) return '11215'
    if (address.includes('동대문구')) return '11230'
    if (address.includes('중랑구')) return '11260'
    if (address.includes('성북구')) return '11290'
    if (address.includes('강북구')) return '11305'
    if (address.includes('도봉구')) return '11320'
    if (address.includes('노원구')) return '11350'
    if (address.includes('은평구')) return '11380'
    if (address.includes('서대문구')) return '11410'
    if (address.includes('마포구')) return '11440'
    if (address.includes('양천구')) return '11470'
    if (address.includes('강서구')) return '11500'
    if (address.includes('구로구')) return '11530'
    if (address.includes('금천구')) return '11545'
    if (address.includes('영등포구')) return '11560'
    if (address.includes('동작구')) return '11590'
    if (address.includes('관악구')) return '11620'
    if (address.includes('서초구')) return '11650'
    if (address.includes('강남구')) return '11680'
    if (address.includes('송파구')) return '11710'
    if (address.includes('강동구')) return '11740'
    return '11000'
  }
  // 부산 구
  if (address.includes('부산')) {
    if (address.includes('중구')) return '26110'
    if (address.includes('서구')) return '26140'
    if (address.includes('동구')) return '26170'
    if (address.includes('영도구')) return '26200'
    if (address.includes('부산진구')) return '26230'
    if (address.includes('동래구')) return '26260'
    if (address.includes('남구')) return '26290'
    if (address.includes('북구')) return '26320'
    if (address.includes('해운대구')) return '26350'
    if (address.includes('사하구')) return '26380'
    if (address.includes('금정구')) return '26410'
    if (address.includes('강서구')) return '26440'
    if (address.includes('연제구')) return '26470'
    if (address.includes('수영구')) return '26500'
    if (address.includes('사상구')) return '26530'
    return '26000'
  }
  // 경기 시
  if (address.includes('경기') || address.includes('수원') || address.includes('성남') || address.includes('고양') || address.includes('용인')) {
    if (address.includes('수원')) return '41110'
    if (address.includes('성남')) return '41130'
    if (address.includes('의정부')) return '41150'
    if (address.includes('안양')) return '41170'
    if (address.includes('부천')) return '41190'
    if (address.includes('광명')) return '41210'
    if (address.includes('평택')) return '41220'
    if (address.includes('안산')) return '41270'
    if (address.includes('고양')) return '41280'
    if (address.includes('용인')) return '41460'
    if (address.includes('파주')) return '41480'
    if (address.includes('화성')) return '41590'
    if (address.includes('김포')) return '41570'
    if (address.includes('남양주')) return '41360'
    if (address.includes('시흥')) return '41390'
    return '41000'
  }
  // 광역시/도
  if (address.includes('대구')) return '27000'
  if (address.includes('인천')) return '28000'
  if (address.includes('광주')) return '29000'
  if (address.includes('대전')) return '30000'
  if (address.includes('울산')) return '31000'
  if (address.includes('세종')) return '36000'
  if (address.includes('강원')) return '42000'
  if (address.includes('충북')) return '43000'
  if (address.includes('충남')) return '44000'
  if (address.includes('전북') || address.includes('전라북도')) return '45000'
  if (address.includes('전남') || address.includes('전라남도')) return '46000'
  if (address.includes('경북') || address.includes('경상북도')) return '47000'
  if (address.includes('경남') || address.includes('경상남도')) return '48000'
  return '11000'
}

function parseTrades(text: string, areaTag: string) {
  const items = [...text.matchAll(/<dealAmount>([\s\S]*?)<\/dealAmount>/g)].map(m => parseInt(m[1].replace(/,/g, '').trim(), 10)).filter(n => !isNaN(n))
  const areas = [...text.matchAll(new RegExp(`<${areaTag}>([\\s\\S]*?)<\\/${areaTag}>`, 'g'))].map(m => parseFloat(m[1].trim())).filter(n => !isNaN(n))
  return items.map((price, i) => ({ price: price * 10000, area: areas[i] || 0 }))
}

async function fetchAptTrade(lawdCd: string, dealYmd: string, key: string) {
  const url = `https://apis.data.go.kr/1613000/RTMSDataSvcAptTrade/getRTMSDataSvcAptTrade?serviceKey=${key}&LAWD_CD=${lawdCd}&DEAL_YMD=${dealYmd}&numOfRows=100&pageNo=1`
  const text = await fetch(url).then(r => r.text())
  return parseTrades(text, 'excluUseAr')
}

async function fetchVillaTrade(lawdCd: string, dealYmd: string, key: string) {
  const url = `https://apis.data.go.kr/1613000/RTMSDataSvcRHTrade/getRTMSDataSvcRHTrade?serviceKey=${key}&LAWD_CD=${lawdCd}&DEAL_YMD=${dealYmd}&numOfRows=100&pageNo=1`
  const text = await fetch(url).then(r => r.text())
  return parseTrades(text, 'excluUseAr')
}

async function fetchSingleTrade(lawdCd: string, dealYmd: string, key: string) {
  const url = `https://apis.data.go.kr/1613000/RTMSDataSvcSHTrade/getRTMSDataSvcSHTrade?serviceKey=${key}&LAWD_CD=${lawdCd}&DEAL_YMD=${dealYmd}&numOfRows=100&pageNo=1`
  const text = await fetch(url).then(r => r.text())
  return parseTrades(text, 'totalFloorAr')
}

async function fetchRealPrice(address: string, houseType: string, area: number) {
  const key = process.env.PUBLIC_DATA_API_KEY!
  const lawdCd = getLawdCd(address)

  const months: string[] = []
  const now = new Date()
  for (let i = 2; i < 14; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    months.push(`${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, '0')}`)
  }

  let allTrades: { price: number; area: number }[] = []

  if (houseType === '아파트') {
    const results = await Promise.all(months.map(m => fetchAptTrade(lawdCd, m, key)))
    allTrades = results.flat()
  } else if (houseType === '단독주택' || houseType === '다가구') {
    const results = await Promise.all(months.map(m => fetchSingleTrade(lawdCd, m, key)))
    allTrades = results.flat()
  } else {
    const results = await Promise.all(months.flatMap(m => [
      fetchVillaTrade(lawdCd, m, key),
      fetchSingleTrade(lawdCd, m, key),
    ]))
    allTrades = results.flat()
  }

  if (allTrades.length === 0) return { error: '해당 지역 실거래 데이터가 없습니다.' }

  let filtered = area > 0
    ? allTrades.filter(t => t.area > 0 && Math.abs(t.area - area) / area < 0.3)
    : allTrades
  if (filtered.length < 3) filtered = allTrades

  // 이상치 제거: 상하위 10% 제외
  const sorted = [...filtered].sort((a, b) => a.price - b.price)
  const trimCount = Math.floor(sorted.length * 0.1)
  const trimmed = sorted.slice(trimCount, sorted.length - trimCount || undefined)
  const final = trimmed.length >= 3 ? trimmed : sorted

  const prices = final.map(t => t.price).sort((a, b) => a - b)
  const avg = Math.round(prices.reduce((s, p) => s + p, 0) / prices.length)

  return { lawdCd, count: prices.length, avg, min: prices[0], max: prices[prices.length - 1], median: prices[Math.floor(prices.length / 2)], months }
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const address = searchParams.get('address') || ''
  const houseType = searchParams.get('houseType') || ''
  const area = parseFloat(searchParams.get('area') || '0')

  try {
    // 같은 주소+타입 조합 24시간 캐싱 (국토부 데이터는 매달 업데이트)
    const cached = unstable_cache(
      () => fetchRealPrice(address, houseType, area),
      [`realprice-v2-${address}-${houseType}-${Math.round(area)}`],
      { revalidate: 60 * 60 * 24 }
    )
    const result = await cached()
    if ('error' in result) return NextResponse.json(result, { status: 404 })
    return NextResponse.json(result)
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
