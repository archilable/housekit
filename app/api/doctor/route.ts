import { NextRequest, NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/db'
import { invalidateHouseCache } from '@/lib/houseData'

export async function POST(req: NextRequest) {
  try {
    const { imageBase64, mediaType, description, houseId } = await req.json()

    const prompt = `당신은 대한민국에서 20년 이상 경력을 쌓은 주택 설비·수리 전문가입니다. 보일러, 배관, 누수, 곰팡이, 균열, 전기, 도배, 타일, 창호, 방수 등 모든 주거 문제에 정통하며, 한국의 일반적인 아파트·빌라·단독주택 구조와 자재를 잘 알고 있습니다.

사용자가 집의 문제 부위 사진과 설명을 보내왔습니다. 전문가 입장에서 정확하고 실용적인 진단을 내려주세요.

사용자 설명: ${description || '없음'}

반드시 아래 형식을 그대로 사용해 한국어로 답변하세요. 추측이 아닌 사진과 설명에 근거한 진단을 해주세요:

## 🔍 진단 결과
[무엇이 문제인지, 왜 발생했는지 원인까지 2-3문장으로 정확하게 설명]

## ⚠️ 심각도
[낮음 / 보통 / 높음 / 긴급] — [방치하면 어떤 문제가 생기는지 구체적으로]

## 🔧 수리 방법
[현실적인 단계별 수리 순서. 최대 5단계. 한국 현장에서 실제로 쓰는 방법으로]

## 🛒 필요한 자재
[실제 한국 시장에서 구매 가능한 자재명과 예상 가격. 형식: - 자재명 (가격대)]

## 👷 전문가 필요 여부
[DIY 가능 / 전문가 권장 / 전문가 필수] — [이유와 예상 공사비용 범위]

## 🔗 숨고 검색어
[숨고에서 검색할 전문가 키워드 2~3개를 쉼표로 구분. 예: "욕실 방수 공사, 타일 보수, 누수 수리"]`

    const systemMessage = {
      role: 'system',
      content: '당신은 대한민국 주택 설비·수리 전문가입니다. 항상 한국어로 답변하며, 한국 시장 기준의 자재명과 가격, 실제 시공 방법을 사용합니다. 불필요한 면책 조항 없이 전문가답게 명확하고 직접적으로 진단합니다.',
    }

    const messages: object[] = [systemMessage]

    if (imageBase64) {
      messages.push({
        role: 'user',
        content: [
          { type: 'image_url', image_url: { url: `data:${mediaType || 'image/jpeg'};base64,${imageBase64}` } },
          { type: 'text', text: prompt },
        ],
      })
    } else {
      messages.push({ role: 'user', content: prompt })
    }

    const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: imageBase64 ? 'meta-llama/llama-4-scout-17b-16e-instruct' : 'llama-3.3-70b-versatile',
        messages,
        max_tokens: 1024,
      }),
    })

    const data = await res.json()
    if (!res.ok) throw new Error(JSON.stringify(data.error) || `API error ${res.status}`)

    const text = data.choices?.[0]?.message?.content ?? '결과를 받지 못했습니다.'

    // 진단 이력 저장
    if (houseId) {
      await prisma.doctorHistory.create({
        data: {
          houseId,
          description: description || null,
          imageBase64: imageBase64 || null,
          result: text,
        },
      })
      invalidateHouseCache(houseId)
      revalidatePath(`/houses/${houseId}`)
    }

    return NextResponse.json({ result: text })
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
