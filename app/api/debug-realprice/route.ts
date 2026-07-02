import { NextResponse } from 'next/server'
export const dynamic = 'force-dynamic'
export async function GET() {
  const key = process.env.PUBLIC_DATA_API_KEY!
  const url = `https://apis.data.go.kr/1613000/RTMSDataSvcAptTrade/getRTMSDataSvcAptTrade?serviceKey=${key}&LAWD_CD=11680&DEAL_YMD=202605&numOfRows=5&pageNo=1`
  const res = await fetch(url)
  const text = await res.text()
  return NextResponse.json({ status: res.status, body: text.substring(0, 1000) })
}
