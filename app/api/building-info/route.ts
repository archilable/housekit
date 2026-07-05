import { NextRequest, NextResponse } from 'next/server'

// 국토교통부 건축물대장 표제부 API
// data.go.kr에서 "건축물대장 표제부" 활용신청 필요
const SERVICE_KEY = process.env.PUBLIC_DATA_API_KEY || ''

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const siDo = searchParams.get('siDo') || ''
  const siGunGu = searchParams.get('siGunGu') || ''
  const eupmyeondong = searchParams.get('eupmyeondong') || ''
  const bun = searchParams.get('bun') || ''
  const ji = searchParams.get('ji') || '0'

  if (!siDo || !siGunGu || !eupmyeondong || !bun) {
    return NextResponse.json({ error: 'missing params' }, { status: 400 })
  }

  try {
    const params = new URLSearchParams({
      serviceKey: SERVICE_KEY,
      siDo, siGunGu, eupmyeondong, bun, ji,
      numOfRows: '10',
      pageNo: '1',
      _type: 'json',
    })

    const url = `https://apis.data.go.kr/1613000/BldRgstHubService/getBrTitleInfo?${params}`
    const res = await fetch(url, { next: { revalidate: 3600 } })
    const text = await res.text()

    let data: any
    try { data = JSON.parse(text) } catch {
      return NextResponse.json({ error: 'API parse error', raw: text.slice(0, 200) }, { status: 502 })
    }

    const items = data?.response?.body?.items?.item
    if (!items) return NextResponse.json({ error: 'no data' }, { status: 404 })

    const list = Array.isArray(items) ? items : [items]
    const item = list[0]

    // 건축연도: 사용승인일 앞 4자리
    const buildYear = item.useAprDay ? parseInt(String(item.useAprDay).slice(0, 4)) : null

    // 주용도코드로 주택 유형 매핑
    const purposeCode = String(item.mainPurpsCdNm || '')
    let houseType = ''
    if (purposeCode.includes('아파트')) houseType = '아파트'
    else if (purposeCode.includes('다세대') || purposeCode.includes('연립')) houseType = '빌라/연립'
    else if (purposeCode.includes('단독')) houseType = '단독주택'
    else if (purposeCode.includes('다가구')) houseType = '다가구'

    return NextResponse.json({
      platArea: item.platArea ? parseFloat(item.platArea) : null,   // 대지면적
      archArea: item.archArea ? parseFloat(item.archArea) : null,   // 건축면적
      totArea: item.totArea ? parseFloat(item.totArea) : null,      // 연면적
      buildYear,
      houseType,
      rawPurpose: item.mainPurpsCdNm || '',
    })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
