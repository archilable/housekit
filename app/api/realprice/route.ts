import { NextRequest, NextResponse } from 'next/server'

// 법정동코드 앞 5자리 추출 (주소 기반 매핑)
function getLawdCd(address: string): string {
  const map: Record<string, string> = {
    '서울': '11', '부산': '26', '대구': '27', '인천': '28', '광주': '29',
    '대전': '30', '울산': '31', '세종': '36', '경기': '41', '강원': '42',
    '충북': '43', '충남': '44', '전북': '45', '전남': '46', '경북': '47',
    '경남': '48', '제주': '50',
    // 서울 구
    '종로구': '11110', '중구': '11140', '용산구': '11170', '성동구': '11200',
    '광진구': '11215', '동대문구': '11230', '중랑구': '11260', '성북구': '11290',
    '강북구': '11305', '도봉구': '11320', '노원구': '11350', '은평구': '11380',
    '서대문구': '11410', '마포구': '11440', '양천구': '11470', '강서구': '11500',
    '구로구': '11530', '금천구': '11545', '영등포구': '11560', '동작구': '11590',
    '관악구': '11620', '서초구': '11650', '강남구': '11680', '송파구': '11710',
    '강동구': '11740',
    // 부산 구
    '중구': '26110', '서구': '26140', '동구': '26170', '영도구': '26200',
    '부산진구': '26230', '동래구': '26260', '남구': '26290', '북구': '26320',
    '해운대구': '26350', '사하구': '26380', '금정구': '26410', '강서구': '26440',
    '연제구': '26470', '수영구': '26500', '사상구': '26530',
    // 제주
    '제주시': '50110', '서귀포시': '50130',
    // 경기
    '수원시': '41110', '성남시': '41130', '의정부시': '41150', '안양시': '41170',
    '부천시': '41190', '광명시': '41210', '평택시': '41220', '동두천시': '41250',
    '안산시': '41270', '고양시': '41280', '과천시': '41290', '구리시': '41310',
    '남양주시': '41360', '오산시': '41370', '시흥시': '41390', '군포시': '41410',
    '의왕시': '41430', '하남시': '41450', '용인시': '41460', '파주시': '41480',
    '이천시': '41500', '안성시': '41550', '김포시': '41570', '화성시': '41590',
    '광주시': '41610', '양주시': '41630', '포천시': '41650', '여주시': '41670',
  }

  for (const [key, code] of Object.entries(map)) {
    if (address.includes(key) && code.length === 5) return code
  }

  // 광역시/도 기반 fallback (5자리로 확장)
  if (address.includes('서울')) return '11000'
  if (address.includes('부산')) return '26000'
  if (address.includes('대구')) return '27000'
  if (address.includes('인천')) return '28000'
  if (address.includes('광주')) return '29000'
  if (address.includes('대전')) return '30000'
  if (address.includes('울산')) return '31000'
  if (address.includes('세종')) return '36000'
  if (address.includes('경기')) return '41000'
  if (address.includes('강원')) return '42000'
  if (address.includes('충북')) return '43000'
  if (address.includes('충남')) return '44000'
  if (address.includes('전북') || address.includes('전라북도')) return '45000'
  if (address.includes('전남') || address.includes('전라남도')) return '46000'
  if (address.includes('경북') || address.includes('경상북도')) return '47000'
  if (address.includes('경남') || address.includes('경상남도')) return '48000'
  if (address.includes('제주')) return '50110'

  return '11000' // 기본값 서울
}

async function fetchAptTrade(lawdCd: string, dealYmd: string, key: string) {
  const url = `https://apis.data.go.kr/1613000/RTMSDataSvcAptTrade/getRTMSDataSvcAptTrade?serviceKey=${key}&LAWD_CD=${lawdCd}&DEAL_YMD=${dealYmd}&numOfRows=100&pageNo=1`
  const res = await fetch(url)
  const text = await res.text()
  const items = [...text.matchAll(/<거래금액>([\s\S]*?)<\/거래금액>/g)].map(m => parseInt(m[1].replace(/,/g, '').trim(), 10)).filter(n => !isNaN(n))
  const areas = [...text.matchAll(/<전용면적>([\s\S]*?)<\/전용면적>/g)].map(m => parseFloat(m[1].trim())).filter(n => !isNaN(n))
  return items.map((price, i) => ({ price: price * 10000, area: areas[i] || 0 }))
}

async function fetchVillaTrade(lawdCd: string, dealYmd: string, key: string) {
  const url = `https://apis.data.go.kr/1613000/RTMSDataSvcRHTrade/getRTMSDataSvcRHTrade?serviceKey=${key}&LAWD_CD=${lawdCd}&DEAL_YMD=${dealYmd}&numOfRows=100&pageNo=1`
  const res = await fetch(url)
  const text = await res.text()
  const items = [...text.matchAll(/<거래금액>([\s\S]*?)<\/거래금액>/g)].map(m => parseInt(m[1].replace(/,/g, '').trim(), 10)).filter(n => !isNaN(n))
  const areas = [...text.matchAll(/<전용면적>([\s\S]*?)<\/전용면적>/g)].map(m => parseFloat(m[1].trim())).filter(n => !isNaN(n))
  return items.map((price, i) => ({ price: price * 10000, area: areas[i] || 0 }))
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const address = searchParams.get('address') || ''
  const houseType = searchParams.get('houseType') || ''
  const area = parseFloat(searchParams.get('area') || '0')

  const key = process.env.PUBLIC_DATA_API_KEY!
  const lawdCd = getLawdCd(address)

  // 최근 3개월 데이터 수집
  const months: string[] = []
  const now = new Date()
  for (let i = 0; i < 3; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    months.push(`${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, '0')}`)
  }

  try {
    let allTrades: { price: number; area: number }[] = []

    for (const month of months) {
      if (houseType === '아파트') {
        const data = await fetchAptTrade(lawdCd, month, key)
        allTrades = allTrades.concat(data)
      } else {
        const data = await fetchVillaTrade(lawdCd, month, key)
        allTrades = allTrades.concat(data)
      }
    }

    if (allTrades.length === 0) {
      return NextResponse.json({ error: '해당 지역 실거래 데이터가 없습니다.' }, { status: 404 })
    }

    // 면적 유사한 거래 필터링 (±30%)
    let filtered = area > 0
      ? allTrades.filter(t => t.area > 0 && Math.abs(t.area - area) / area < 0.3)
      : allTrades

    if (filtered.length < 3) filtered = allTrades

    const prices = filtered.map(t => t.price).sort((a, b) => a - b)
    const avg = Math.round(prices.reduce((s, p) => s + p, 0) / prices.length)
    const min = prices[0]
    const max = prices[prices.length - 1]
    const median = prices[Math.floor(prices.length / 2)]

    return NextResponse.json({
      lawdCd,
      count: prices.length,
      avg,
      min,
      max,
      median,
      months,
    })
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
