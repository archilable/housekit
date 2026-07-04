import { prisma } from '@/lib/db'
import { deleteHistory, deleteInventory } from '@/lib/actions'
import DeleteUtilityButton from '@/app/components/DeleteUtilityButton'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import DoctorTab from '@/app/components/DoctorTab'
import UtilityChart from '@/app/components/UtilityChart'
import SortableInventoryList from '@/app/components/SortableInventoryList'
import AiValuation from '@/app/components/AiValuation'
import RealPriceData from '@/app/components/RealPriceData'
import DoctorHistoryList from '@/app/components/DoctorHistoryList'
import HouseIllustration from '@/app/components/HouseIllustration'
import InviteButton from '@/app/components/InviteButton'
import BackHomeButtons from '@/app/components/BackHomeButtons'
import SwipeableTabContent from '@/app/components/SwipeableTabContent'

export const dynamic = 'force-dynamic'

function getWarrantyStatus(installedAt: Date | null, warrantyMonths: number | null) {
  if (!installedAt || !warrantyMonths) return null
  const expiry = new Date(installedAt)
  expiry.setMonth(expiry.getMonth() + warrantyMonths)
  const diffDays = Math.ceil((expiry.getTime() - Date.now()) / 86400000)
  if (diffDays < 0)   return { label: '보증 만료',                          color: '#f87171', bg: '#1a0d0d', border: '#3d1a1a' }
  if (diffDays <= 30)  return { label: `D-${diffDays}일 후 만료`,             color: '#f87171', bg: '#1a0d0d', border: '#3d1a1a' }
  if (diffDays <= 90)  return { label: `${diffDays}일 후 만료`,               color: '#f97316', bg: '#1a0f00', border: '#3d2000' }
  if (diffDays <= 180) return { label: `${Math.floor(diffDays/30)}개월 후 만료`, color: '#fbbf24', bg: '#1a1200', border: '#3d2e00' }
  return { label: `${Math.floor(diffDays/30)}개월 후 만료`,                     color: '#34d399', bg: '#0d1f14', border: '#1a3d28' }
}

function calcHealthScore(inventoryCount: number, historyCount: number) {
  return Math.min(40 + Math.min(inventoryCount * 8, 30) + Math.min(historyCount * 6, 30), 100)
}

const CATEGORY_ICONS: Record<string, string> = { 수리: 'ti-tool', 교체: 'ti-refresh', 점검: 'ti-search', 청소: 'ti-sparkles', 방역: 'ti-bug', 기타: 'ti-pin' }
const CATEGORY_COLORS: Record<string, string> = { 수리: '#60a5fa', 교체: '#a78bfa', 점검: '#34d399', 청소: '#fbbf24', 방역: '#f97316', 기타: '#888' }
const INVENTORY_ICONS: Record<string, string> = { 보일러: 'ti-flame', 에어컨: 'ti-air-conditioning', 정수기: 'ti-droplet', 냉장고: 'ti-snowflake', 세탁기: 'ti-wash', 도어락: 'ti-lock', 기타: 'ti-package' }
const INVENTORY_COLORS: Record<string, string> = { 보일러: '#f97316', 에어컨: '#60a5fa', 정수기: '#34d399', 냉장고: '#a78bfa', 세탁기: '#38bdf8', 도어락: '#fbbf24', 기타: '#888' }
void INVENTORY_ICONS; void INVENTORY_COLORS

export default async function HousePage({
  params, searchParams,
}: {
  params: Promise<{ id: string }>
  searchParams: Promise<{ tab?: string; highlight?: string }>
}) {
  const [{ id }, { tab = 'home', highlight }] = await Promise.all([params, searchParams])

  // 탭에 따라 필요한 데이터만 가져오기
  const [house, tabData] = await Promise.all([
    // 모든 탭 공통: 기본 정보 + 카운트만
    prisma.house.findUnique({
      where: { id },
      select: {
        id: true,
        address: true,
        addressDetail: true,
        houseType: true,
        buildYear: true,
        landArea: true,
        buildArea: true,
        exclusiveArea: true,
        area: true,
        _count: { select: { inventories: true, histories: true, doctorHistories: true } },
      },
    }),
    // 탭별 데이터
    tab === 'home' ? prisma.house.findUnique({
      where: { id },
      select: {
        inventories: {
          select: { id: true, name: true, installedAt: true, warrantyMonths: true, brand: true },
          orderBy: [{ sortOrder: 'asc' }, { installedAt: 'desc' }],
        },
        histories: {
          select: { id: true, title: true, category: true, doneAt: true, cost: true, company: true, inventory: { select: { name: true, category: true } } },
          orderBy: { doneAt: 'desc' },
          take: 5,
        },
        utilities: { orderBy: { month: 'desc' }, take: 2 },
        doctorHistories: {
          select: { id: true, resolved: true, createdAt: true },
          orderBy: { createdAt: 'desc' },
          take: 20,
        },
      },
    }) :
    tab === 'inventory' ? prisma.house.findUnique({
      where: { id },
      select: { inventories: { orderBy: [{ sortOrder: 'asc' }, { installedAt: 'desc' }] } },
    }) :
    tab === 'history' ? prisma.house.findUnique({
      where: { id },
      select: { histories: { orderBy: { doneAt: 'desc' }, take: 50, include: { inventory: { select: { name: true, category: true } } } } },
    }) :
    tab === 'utility' ? prisma.house.findUnique({
      where: { id },
      select: { utilities: { orderBy: { month: 'desc' }, take: 12 } },
    }) :
    tab === 'doctor' ? prisma.house.findUnique({
      where: { id },
      select: {
        doctorHistories: {
          orderBy: { createdAt: 'desc' },
          take: 20,
          select: { id: true, description: true, result: true, createdAt: true, houseId: true, resolved: true, resolvedAt: true },
        },
      },
    }) :
    tab === 'valuation' ? prisma.house.findUnique({
      where: { id },
      select: { valuation: true },
    }) :
    null,
  ])

  if (!house) notFound()

  const score = calcHealthScore(house._count.inventories, house._count.histories)
  const scoreColor = score >= 70 ? '#34d399' : score >= 40 ? '#fbbf24' : '#f87171'

  // 홈 탭 데이터
  const homeInventories = tab === 'home' ? (tabData as any)?.inventories ?? [] : []
  const homeHistories   = tab === 'home' ? (tabData as any)?.histories ?? [] : []
  const homeUtilities   = tab === 'home' ? (tabData as any)?.utilities ?? [] : []
  const homeDoctors     = tab === 'home' ? (tabData as any)?.doctorHistories ?? [] : []

  const thisMonth = new Date().toISOString().slice(0, 7)
  const prevMonth = (() => { const d = new Date(); d.setMonth(d.getMonth() - 1); return d.toISOString().slice(0, 7) })()
  const thisUtil  = homeUtilities.find((u: any) => u.month === thisMonth)
  const prevUtil  = homeUtilities.find((u: any) => u.month === prevMonth)
  const displayUtil = thisUtil ?? homeUtilities[0] ?? null
  const isCurrentMonth = displayUtil?.month === thisMonth

  // 보증 만료 임박 (홈 탭에서만)
  const warrantyAlerts = homeInventories.filter((item: any) => {
    if (!item.installedAt || !item.warrantyMonths) return false
    const expiry = new Date(item.installedAt)
    expiry.setMonth(expiry.getMonth() + item.warrantyMonths)
    const diffDays = Math.ceil((expiry.getTime() - Date.now()) / 86400000)
    return diffDays >= 0 && diffDays <= 90
  }).map((item: any) => {
    const expiry = new Date(item.installedAt!)
    expiry.setMonth(expiry.getMonth() + item.warrantyMonths!)
    const diffDays = Math.ceil((expiry.getTime() - Date.now()) / 86400000)
    return { ...item, diffDays }
  }).sort((a: any, b: any) => a.diffDays - b.diffDays)

  return (
    <div style={{ color: '#fff', width: '100%', boxSizing: 'border-box', overflowX: 'hidden' }}>
      {/* 보증 만료 알림 배너 */}
      {warrantyAlerts.length > 0 && (
        <div style={{ margin: '12px 16px 0', background: 'linear-gradient(135deg, #1a0a00, #2d1500)', border: '1px solid #f97316', borderRadius: 14, padding: '14px 16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
            <i className="ti ti-bell-ringing" style={{ fontSize: 18, color: '#f97316' }} />
            <p style={{ fontSize: 15, fontWeight: 600, color: '#f97316' }}>보증 만료 임박 알림</p>
            <span style={{ fontSize: 13, background: '#f97316', color: '#000', borderRadius: 10, padding: '1px 7px', fontWeight: 700 }}>{warrantyAlerts.length}</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {warrantyAlerts.map((item: any) => (
              <Link key={item.id} href="/notifications" style={{ textDecoration: 'none', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(249,115,22,0.08)', borderRadius: 10, padding: '10px 12px' }}>
                <div>
                  <p style={{ fontSize: 15, fontWeight: 500, color: '#fff' }}>{item.name}</p>
                  {item.brand && <p style={{ fontSize: 13, color: '#888', marginTop: 2 }}>{item.brand}</p>}
                </div>
                <div style={{ textAlign: 'right' }}>
                  <p style={{ fontSize: 15, fontWeight: 700, color: item.diffDays <= 30 ? '#f87171' : '#fbbf24' }}>
                    {item.diffDays <= 30 ? `D-${item.diffDays}` : `${Math.floor(item.diffDays / 30)}개월 후`}
                  </p>
                  <p style={{ fontSize: 12, color: '#666', marginTop: 1 }}>보증 만료</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 16px 0' }}>
        <BackHomeButtons houseId={id} />
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <span style={{ fontSize: 15, background: '#0d1a2e', color: '#60a5fa', padding: '3px 10px', borderRadius: 20, border: '0.5px solid #1e3a5f' }}>
            {house.houseType}
          </span>
          {house.buildYear && <span style={{ fontSize: 15, color: '#555' }}>{house.buildYear}년</span>}
          <Link href={`/houses/${id}/edit`} style={{ color: '#60a5fa', fontSize: 20, textDecoration: 'none' }}>
            <i className="ti ti-pencil" aria-hidden="true" />
          </Link>
          <InviteButton houseId={id} />
        </div>
      </div>

      {/* House Illustration */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '24px 0 12px', position: 'relative' }}>
        <HouseIllustration houseType={house.houseType} />
        <div style={{ position: 'absolute', bottom: 0, left: '50%', transform: 'translateX(-50%)', width: 180, height: 30, background: 'radial-gradient(ellipse, rgba(59,130,246,0.15) 0%, transparent 70%)', borderRadius: '50%' }} />
      </div>

      {/* House Name */}
      <div style={{ textAlign: 'center', padding: '4px 16px 20px' }}>
        <h1 style={{ fontSize: 24, fontWeight: 500, marginBottom: 4 }}>{house.address}</h1>
        {house.addressDetail && <p style={{ fontSize: 17, color: '#666' }}>{house.addressDetail}</p>}
        {(house.landArea || house.buildArea || house.exclusiveArea) && (
          <div style={{ display: 'flex', justifyContent: 'center', gap: 16, marginTop: 10, flexWrap: 'wrap' }}>
            {house.landArea && <span style={{ fontSize: 14, color: '#555' }}>대지 <span style={{ color: '#aaa' }}>{house.landArea}㎡ ({(house.landArea / 3.305785).toFixed(1)}평)</span></span>}
            {house.buildArea && <span style={{ fontSize: 14, color: '#555' }}>건축 <span style={{ color: '#aaa' }}>{house.buildArea}㎡ ({(house.buildArea / 3.305785).toFixed(1)}평)</span></span>}
            {house.exclusiveArea && <span style={{ fontSize: 14, color: '#60a5fa' }}>전용 <span style={{ fontWeight: 600 }}>{house.exclusiveArea}㎡ ({(house.exclusiveArea / 3.305785).toFixed(1)}평)</span></span>}
          </div>
        )}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, marginTop: 12 }}>
          <span style={{ fontSize: 14, color: '#666' }}>집 건강점수</span>
          <div style={{ width: 100, height: 4, background: '#1a1a2e', borderRadius: 2 }}>
            <div style={{ width: `${score}%`, height: '100%', background: scoreColor, borderRadius: 2, transition: 'width 0.5s' }} />
          </div>
          <span style={{ fontSize: 16, fontWeight: 500, color: scoreColor }}>{score}점</span>
        </div>
      </div>

      {/* Tab Nav */}
      <div style={{ display: 'flex', gap: 0, borderBottom: '0.5px solid #1e1e28', marginBottom: 16, padding: '0 16px', overflowX: 'auto' }}>
        {[
          { key: 'home', label: '홈' },
          { key: 'history', label: '이력' },
          { key: 'inventory', label: '설비' },
          { key: 'doctor', label: '닥터' },
          { key: 'utility', label: '공과금' },
          { key: 'valuation', label: '시세' },
        ].map((t) => (
          <Link key={t.key} href={`/houses/${id}?tab=${t.key}`} style={{
            flex: 1, textAlign: 'center', padding: '10px 0', fontSize: 17,
            color: tab === t.key ? '#60a5fa' : '#555',
            borderBottom: tab === t.key ? '2px solid #60a5fa' : '2px solid transparent',
            textDecoration: 'none', fontWeight: tab === t.key ? 500 : 400,
            marginBottom: -0.5,
          }}>{t.label}</Link>
        ))}
      </div>

      <SwipeableTabContent houseId={id} currentTab={tab}>

      {/* HOME TAB */}
      {tab === 'home' && (
        <div style={{ padding: '0 16px' }}>
          <p style={{ fontSize: 13, color: '#444', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 10 }}>실시간 현황</p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 16 }}>
            {/* 보증 알림 카드 */}
            {(() => {
              const alertItems = homeInventories
                .filter((i: any) => {
                  if (!i.installedAt || !i.warrantyMonths) return false
                  const expiry = new Date(i.installedAt)
                  expiry.setMonth(expiry.getMonth() + i.warrantyMonths)
                  return Math.ceil((expiry.getTime() - Date.now()) / 86400000) >= 0
                })
                .sort((a: any, b: any) => {
                  const ea = new Date(a.installedAt!); ea.setMonth(ea.getMonth() + a.warrantyMonths!)
                  const eb = new Date(b.installedAt!); eb.setMonth(eb.getMonth() + b.warrantyMonths!)
                  return ea.getTime() - eb.getTime()
                })
              const alertItem = alertItems[0]
              if (alertItem) {
                const w = getWarrantyStatus(alertItem.installedAt, alertItem.warrantyMonths)!
                return (
                  <Link href={`/notifications?warranty=1&houseId=${id}`} style={{ textDecoration: 'none', color: 'inherit', background: w.bg, border: `0.5px solid ${w.border}`, borderRadius: 14, padding: 14, display: 'block' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
                      <div style={{ width: 28, height: 28, borderRadius: 8, background: w.border, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <i className="ti ti-alert-triangle" style={{ fontSize: 16, color: w.color }} />
                      </div>
                      <i className="ti ti-chevron-right" style={{ fontSize: 15, color: '#333', marginTop: 4 }} />
                    </div>
                    <p style={{ fontSize: 13, color: '#666' }}>보증 알림</p>
                    <p style={{ fontSize: 18, fontWeight: 500, color: w.color, marginTop: 2 }}>{alertItem.name}</p>
                    <p style={{ fontSize: 12, color: '#555', marginTop: 1 }}>{w.label}</p>
                  </Link>
                )
              }
              return (
                <Link href={`/houses/${id}?tab=inventory`} style={{ textDecoration: 'none', color: 'inherit', background: '#0d1f14', border: '0.5px solid #1a3d28', borderRadius: 14, padding: 14, display: 'block' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
                    <div style={{ width: 28, height: 28, borderRadius: 8, background: '#1a3d28', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <i className="ti ti-shield-check" style={{ fontSize: 16, color: '#34d399' }} />
                    </div>
                    <i className="ti ti-chevron-right" style={{ fontSize: 15, color: '#333', marginTop: 4 }} />
                  </div>
                  <p style={{ fontSize: 13, color: '#666' }}>보증 현황</p>
                  <p style={{ fontSize: 18, fontWeight: 500, color: '#34d399', marginTop: 2 }}>정상</p>
                  <p style={{ fontSize: 12, color: '#555', marginTop: 1 }}>만료 예정 없음</p>
                </Link>
              )
            })()}

            {/* 누적 수리비 */}
            <Link href={`/houses/${id}?tab=history`} style={{ textDecoration: 'none', color: 'inherit', background: 'var(--bg-card)', border: '0.5px solid var(--border)', borderRadius: 14, padding: 14, display: 'block' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
                <div style={{ width: 28, height: 28, borderRadius: 8, background: '#1f1000', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <i className="ti ti-wallet" style={{ fontSize: 16, color: '#fbbf24' }} />
                </div>
                <i className="ti ti-chevron-right" style={{ fontSize: 15, color: '#333', marginTop: 4 }} />
              </div>
              <p style={{ fontSize: 13, color: '#666' }}>누적 수리비</p>
              <p style={{ fontSize: 18, fontWeight: 500, color: '#fbbf24', marginTop: 2 }}>
                {homeHistories.reduce((s: number, h: any) => s + (h.cost || 0), 0).toLocaleString()}원
              </p>
              <p style={{ fontSize: 12, color: '#555', marginTop: 1 }}>총 {house._count.histories}건</p>
            </Link>

            {/* 등록 설비 */}
            <Link href={`/houses/${id}?tab=inventory`} style={{ textDecoration: 'none', color: 'inherit', background: 'var(--bg-card)', border: '0.5px solid var(--border)', borderRadius: 14, padding: 14, display: 'block' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
                <div style={{ width: 28, height: 28, borderRadius: 8, background: '#0d1a2e', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <i className="ti ti-package" style={{ fontSize: 16, color: '#60a5fa' }} />
                </div>
                <i className="ti ti-chevron-right" style={{ fontSize: 15, color: '#333', marginTop: 4 }} />
              </div>
              <p style={{ fontSize: 13, color: '#666' }}>등록 설비</p>
              <p style={{ fontSize: 18, fontWeight: 500, color: '#60a5fa', marginTop: 2 }}>{house._count.inventories}개</p>
              <p style={{ fontSize: 12, color: '#555', marginTop: 1 }}>
                {homeInventories.filter((i: any) => getWarrantyStatus(i.installedAt, i.warrantyMonths)).length}개 보증 추적 중
              </p>
            </Link>

            {/* 하우스 닥터 */}
            <Link href={`/houses/${id}?tab=doctor`} style={{ textDecoration: 'none', color: 'inherit', background: 'var(--bg-card)', border: '0.5px solid var(--border)', borderRadius: 14, padding: 14, display: 'block' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
                <div style={{ width: 28, height: 28, borderRadius: 8, background: '#0d1a2e', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <i className="ti ti-stethoscope" style={{ fontSize: 16, color: '#34d399' }} />
                </div>
                <i className="ti ti-chevron-right" style={{ fontSize: 15, color: '#333', marginTop: 4 }} />
              </div>
              <p style={{ fontSize: 13, color: '#666' }}>하우스 닥터</p>
              {(() => {
                const unresolved = homeDoctors.filter((d: any) => !d.resolved).length
                const total = house._count.doctorHistories
                return (
                  <>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginTop: 2 }}>
                      {unresolved > 0
                        ? <p style={{ fontSize: 18, fontWeight: 500, color: '#f87171', margin: 0 }}>미해결 {unresolved}건</p>
                        : <p style={{ fontSize: 18, fontWeight: 500, color: '#34d399', margin: 0 }}>모두 해결</p>}
                      {total > 0 && <span style={{ fontSize: 12, color: '#444' }}>전체 {total}건</span>}
                    </div>
                    <p style={{ fontSize: 12, color: '#555', marginTop: 1 }}>
                      {homeDoctors[0] ? new Date(homeDoctors[0].createdAt).toLocaleDateString('ko-KR', { year: 'numeric', month: 'short', day: 'numeric' }) : '진단 기록 없음'}
                    </p>
                  </>
                )
              })()}
            </Link>
          </div>

          {/* 공과금 요약 */}
          {displayUtil && (
            <div style={{ background: '#111118', border: '0.5px solid #1e1e28', borderRadius: 14, padding: 14, marginBottom: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <p style={{ fontSize: 15, color: '#888', textTransform: 'uppercase', letterSpacing: 1 }}>
                    {isCurrentMonth ? '이번달 공과금' : `${displayUtil.month.slice(0, 4)}년 ${displayUtil.month.slice(5)}월 공과금`}
                  </p>
                  {!isCurrentMonth && (
                    <span style={{ fontSize: 12, color: '#f97316', background: '#1a0e00', border: '0.5px solid #f97316', borderRadius: 8, padding: '1px 6px' }}>지난달</span>
                  )}
                </div>
                <Link href={`/houses/${id}?tab=utility`} style={{ fontSize: 15, color: '#60a5fa', textDecoration: 'none' }}>전체 보기</Link>
              </div>
              <div style={{ display: 'flex', gap: 8, justifyContent: 'space-between' }}>
                {[
                  { label: '전기', icon: 'ti-bolt', color: '#fbbf24', val: displayUtil.electric },
                  { label: '수도', icon: 'ti-droplet', color: '#60a5fa', val: displayUtil.water },
                  { label: '가스', icon: 'ti-flame', color: '#f97316', val: displayUtil.gas },
                  { label: '통신', icon: 'ti-wifi', color: '#34d399', val: displayUtil.telecom },
                ].map(({ label, icon, color, val }) => (
                  <div key={label} style={{ flex: 1, textAlign: 'center' }}>
                    <i className={`ti ${icon}`} style={{ fontSize: 22, color, display: 'block', marginBottom: 6 }} />
                    <p style={{ fontSize: 13, color: '#666', marginBottom: 3 }}>{label}</p>
                    <p style={{ fontSize: 16, fontWeight: 600, color: '#fff' }}>{val != null ? (val / 1000).toFixed(0) + 'K' : '—'}</p>
                  </div>
                ))}
              </div>
              <div style={{ marginTop: 12, paddingTop: 12, borderTop: '0.5px solid #1e1e28', display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontSize: 15, color: '#666' }}>합계</span>
                <span style={{ fontSize: 18, fontWeight: 600, color: '#60a5fa' }}>
                  {((displayUtil.electric || 0) + (displayUtil.water || 0) + (displayUtil.gas || 0) + (displayUtil.telecom || 0)).toLocaleString()}원
                </span>
              </div>
            </div>
          )}

          {/* 최근 이력 */}
          {homeHistories.length > 0 && (
            <>
              <p style={{ fontSize: 13, color: '#444', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 12 }}>최근 이력</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                {homeHistories.map((h: any, idx: number) => {
                  const dotColors: Record<string, string> = { 수리: '#60a5fa', 교체: '#a78bfa', 점검: '#34d399', 청소: '#fbbf24', 기타: '#888' }
                  return (
                    <Link key={h.id} href={`/houses/${id}?tab=history&highlight=${h.id}`} style={{ display: 'flex', gap: 12, paddingBottom: idx < homeHistories.length - 1 ? 16 : 0, position: 'relative', textDecoration: 'none', color: 'inherit' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        <div style={{ width: 8, height: 8, borderRadius: '50%', background: dotColors[h.category] || '#888', flexShrink: 0, marginTop: 4 }} />
                        {idx < homeHistories.length - 1 && <div style={{ width: 1, flex: 1, background: '#1e1e28', marginTop: 4 }} />}
                      </div>
                      <div style={{ flex: 1, paddingBottom: 4 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                          <p style={{ fontSize: 15, fontWeight: 500 }}>{h.title}</p>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 4, flexShrink: 0 }}>
                            <p style={{ fontSize: 13, color: '#555' }}>{new Date(h.doneAt).toLocaleDateString('ko-KR', { year: 'numeric', month: 'short', day: 'numeric' })}</p>
                            <i className="ti ti-chevron-right" style={{ fontSize: 14, color: '#333' }} />
                          </div>
                        </div>
                        <p style={{ fontSize: 13, color: '#555', marginTop: 1 }}>
                          {h.company && `${h.company} · `}
                          {h.cost != null ? `${h.cost.toLocaleString()}원` : h.category}
                        </p>
                      </div>
                    </Link>
                  )
                })}
              </div>
            </>
          )}
        </div>
      )}

      {/* INVENTORY TAB */}
      {tab === 'inventory' && (
        <div style={{ padding: '0 16px' }}>
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 12 }}>
            <Link href={`/houses/${id}/inventory/new`} style={{ background: '#1d4ed8', color: '#fff', padding: '8px 16px', borderRadius: 10, fontSize: 15, textDecoration: 'none', fontWeight: 500 }}>
              + 설비 추가
            </Link>
          </div>
          {(tabData as any)?.inventories?.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '48px 0', color: '#555' }}>
              <i className="ti ti-package" style={{ fontSize: 42, display: 'block', marginBottom: 8 }} />
              <p>등록된 설비가 없습니다</p>
            </div>
          ) : (
            <SortableInventoryList initialItems={(tabData as any)?.inventories ?? []} houseId={id} highlightId={highlight} />
          )}
        </div>
      )}

      {/* HISTORY TAB */}
      {tab === 'history' && (
        <div style={{ padding: '0 16px' }}>
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 12 }}>
            <Link href={`/houses/${id}/history/new`} style={{ background: '#1d4ed8', color: '#fff', padding: '8px 16px', borderRadius: 10, fontSize: 15, textDecoration: 'none', fontWeight: 500 }}>
              + 이력 추가
            </Link>
          </div>
          {(tabData as any)?.histories?.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '48px 0', color: '#555' }}>
              <i className="ti ti-clipboard-list" style={{ fontSize: 42, display: 'block', marginBottom: 8 }} />
              <p>등록된 이력이 없습니다</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {((tabData as any)?.histories ?? []).map((h: any) => {
                const icon = CATEGORY_ICONS[h.category] || 'ti-pin'
                const color = CATEGORY_COLORS[h.category] || '#888'
                const isHighlighted = highlight === h.id
                return (
                  <div key={h.id} id={`history-${h.id}`} style={{ background: isHighlighted ? '#0d1a2e' : 'var(--bg-card)', border: isHighlighted ? '1px solid #3b82f6' : '0.5px solid var(--border)', borderRadius: 14, padding: '14px 16px', display: 'flex', gap: 12, transition: 'border 0.3s' }}>
                    <div style={{ width: 36, height: 36, borderRadius: 10, background: color + '22', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <i className={`ti ${icon}`} style={{ fontSize: 20, color }} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4 }}>
                        <p style={{ fontSize: 16, fontWeight: 500 }}>{h.title}</p>
                        <p style={{ fontSize: 13, color: '#555', flexShrink: 0, marginLeft: 8 }}>{new Date(h.doneAt).toLocaleDateString('ko-KR', { year: 'numeric', month: 'short', day: 'numeric' })}</p>
                      </div>
                      {h.description && <p style={{ fontSize: 14, color: '#666', marginBottom: 2 }}>{h.description}</p>}
                      <div style={{ display: 'flex', gap: 10, fontSize: 13, color: '#555', flexWrap: 'wrap' }}>
                        {h.contactCompany && <span>{h.contactCompany}</span>}
                        {!h.contactCompany && h.company && <span>{h.company}</span>}
                        {h.contactName && <span style={{ color: '#666' }}>{h.contactName}</span>}
                        {h.contactPhone && <a href={`tel:${h.contactPhone}`} style={{ color: '#60a5fa', textDecoration: 'none' }}>{h.contactPhone}</a>}
                        {h.cost != null && <span>{h.cost.toLocaleString()}원</span>}
                      </div>
                      {h.inventory && (
                        <div style={{ marginTop: 6 }}>
                          <span style={{ fontSize: 12, color: '#60a5fa', background: '#0d1a2e', border: '0.5px solid #1d3a6e', borderRadius: 6, padding: '2px 8px', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                            <i className="ti ti-tool" style={{ fontSize: 11 }} />
                            {h.inventory.name}
                          </span>
                        </div>
                      )}
                      {(h.estimateImageBase64 || h.contractImageBase64) && (
                        <div style={{ display: 'flex', gap: 6, marginTop: 8 }}>
                          {h.estimateImageBase64 && <div style={{ fontSize: 12, color: '#a78bfa', background: '#1a1040', borderRadius: 6, padding: '3px 8px', display: 'flex', alignItems: 'center', gap: 4 }}><i className="ti ti-file-invoice" style={{ fontSize: 13 }} />견적서</div>}
                          {h.contractImageBase64 && <div style={{ fontSize: 12, color: '#34d399', background: '#0d1f14', borderRadius: 6, padding: '3px 8px', display: 'flex', alignItems: 'center', gap: 4 }}><i className="ti ti-file-text" style={{ fontSize: 13 }} />계약서</div>}
                        </div>
                      )}
                    </div>
                    <div style={{ display: 'flex', gap: 4 }}>
                      <a href={`/houses/${id}/history/${h.id}/edit`} style={{ background: 'none', border: 'none', color: '#60a5fa', cursor: 'pointer', fontSize: 20, padding: 4, textDecoration: 'none' }}>
                        <i className="ti ti-pencil" />
                      </a>
                      <form action={deleteHistory.bind(null, h.id, id)}>
                        <button type="submit" style={{ background: 'none', border: 'none', color: '#f87171', cursor: 'pointer', fontSize: 20, padding: 4 }}>
                          <i className="ti ti-trash" />
                        </button>
                      </form>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}

      {/* UTILITY TAB */}
      {tab === 'utility' && (() => {
        const utilities = (tabData as any)?.utilities ?? []
        const tu = utilities.find((u: any) => u.month === thisMonth)
        const pu = utilities.find((u: any) => u.month === prevMonth)
        return (
          <div style={{ padding: '0 16px' }}>
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 16 }}>
              <Link href={`/houses/${id}/utility/new`} style={{ background: '#1d4ed8', color: '#fff', padding: '10px 18px', borderRadius: 10, fontSize: 16, textDecoration: 'none', fontWeight: 500 }}>
                + 공과금 입력
              </Link>
            </div>
            {tu ? (
              <div style={{ background: '#0d1a2e', border: '0.5px solid #1e3a5f', borderRadius: 16, padding: 16, marginBottom: 16 }}>
                <p style={{ fontSize: 15, color: '#60a5fa', marginBottom: 14, textTransform: 'uppercase', letterSpacing: 1 }}>{thisMonth.replace('-', '년 ')}월 현황</p>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                  {[
                    { label: '전기세', icon: 'ti-bolt', color: '#fbbf24', val: tu.electric, prev: pu?.electric },
                    { label: '수도세', icon: 'ti-droplet', color: '#60a5fa', val: tu.water, prev: pu?.water },
                    { label: '가스비', icon: 'ti-flame', color: '#f97316', val: tu.gas, prev: pu?.gas },
                    { label: '통신비', icon: 'ti-wifi', color: '#34d399', val: tu.telecom, prev: pu?.telecom },
                  ].map(({ label, icon, color, val, prev }) => {
                    const diff = val != null && prev != null ? val - prev : null
                    return (
                      <div key={label} style={{ background: '#111828', borderRadius: 12, padding: 12 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                          <i className={`ti ${icon}`} style={{ fontSize: 22, color }} />
                          {diff != null && <span style={{ fontSize: 14, color: diff > 0 ? '#f87171' : '#34d399' }}>{diff > 0 ? '▲' : '▼'}{Math.abs(diff).toLocaleString()}</span>}
                        </div>
                        <p style={{ fontSize: 15, color: '#666', marginBottom: 4 }}>{label}</p>
                        <p style={{ fontSize: 19, fontWeight: 600, color: '#fff' }}>{val != null ? val.toLocaleString() + '원' : '—'}</p>
                      </div>
                    )
                  })}
                </div>
                <div style={{ marginTop: 12, paddingTop: 12, borderTop: '0.5px solid #1e3a5f', display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: 16, color: '#666' }}>이번달 합계</span>
                  <span style={{ fontSize: 20, fontWeight: 700, color: '#60a5fa' }}>{((tu.electric || 0) + (tu.water || 0) + (tu.gas || 0) + (tu.telecom || 0)).toLocaleString()}원</span>
                </div>
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '32px 0', color: '#555', marginBottom: 16 }}>
                <i className="ti ti-bolt" style={{ fontSize: 38, display: 'block', marginBottom: 8 }} />
                <p style={{ fontSize: 15 }}>이번달 공과금을 입력해보세요</p>
              </div>
            )}
            {utilities.length > 0 && (
              <>
                <p style={{ fontSize: 15, color: '#666', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 10 }}>월별 이력</p>
                <UtilityChart data={utilities} thisMonth={thisMonth} />
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {utilities.map((u: any) => {
                    const total = (u.electric || 0) + (u.water || 0) + (u.gas || 0) + (u.telecom || 0)
                    return (
                      <div key={u.id} style={{ background: '#111118', border: '0.5px solid #1e1e28', borderRadius: 14, padding: '14px 16px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                          <span style={{ fontSize: 18, fontWeight: 500 }}>{u.month.replace('-', '년 ')}월</span>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                            <span style={{ fontSize: 18, fontWeight: 600, color: '#60a5fa' }}>{total.toLocaleString()}원</span>
                            <Link href={`/houses/${id}/utility/new?month=${u.month}`} style={{ color: '#444', textDecoration: 'none', fontSize: 20 }}><i className="ti ti-pencil" /></Link>
                            <DeleteUtilityButton utilityId={u.id} houseId={id} month={u.month} />
                          </div>
                        </div>
                        <div style={{ display: 'flex', gap: 12, fontSize: 15, color: '#666' }}>
                          {u.electric && <span>⚡ {u.electric.toLocaleString()}</span>}
                          {u.water && <span>💧 {u.water.toLocaleString()}</span>}
                          {u.gas && <span>🔥 {u.gas.toLocaleString()}</span>}
                          {u.telecom && <span>📶 {u.telecom.toLocaleString()}</span>}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </>
            )}
          </div>
        )
      })()}

      {/* VALUATION TAB */}
      {tab === 'valuation' && (() => {
        const v = (tabData as any)?.valuation
        const isApt = house.houseType === '아파트'
        const buildYear = house.buildYear ?? new Date().getFullYear()
        const age = new Date().getFullYear() - buildYear
        let landVal = 0, buildVal = 0, estimatedPrice = 0
        if (isApt && v?.officialPrice) {
          estimatedPrice = Math.round(v.officialPrice / (v.priceRatio ?? 0.70))
        } else if (v?.landPrice && v?.landArea) {
          landVal = Math.round(v.landPrice * v.landArea * (v.landShare ?? 1.0))
          if (v.buildCostPerSqm && v.buildArea) {
            const depr = Math.max(1 - (v.deprRate ?? 0.02) * age, 0.2)
            buildVal = Math.round(v.buildCostPerSqm * v.buildArea * depr)
          }
          estimatedPrice = landVal + buildVal
        }
        const fmt = (n: number) => n >= 100000000 ? `${(n / 100000000).toFixed(1)}억` : n >= 10000 ? `${Math.round(n / 10000).toLocaleString()}만원` : n.toLocaleString() + '원'
        return (
          <div style={{ padding: '0 16px' }}>
            {v && estimatedPrice > 0 ? (
              <>
                <div style={{ background: 'linear-gradient(135deg, #0d1a2e 0%, #111828 100%)', border: '0.5px solid #1e3a5f', borderRadius: 20, padding: 24, marginBottom: 16, textAlign: 'center' }}>
                  <p style={{ fontSize: 14, color: '#60a5fa', textTransform: 'uppercase', letterSpacing: 2, marginBottom: 12 }}>추정 시세</p>
                  <p style={{ fontSize: 40, fontWeight: 700, color: '#fff', letterSpacing: -1, marginBottom: 6 }}>{fmt(estimatedPrice)}</p>
                  <p style={{ fontSize: 14, color: '#555' }}>{new Date().getFullYear()}년 기준 · 참고용 추정치</p>
                  {!isApt && (landVal > 0 || buildVal > 0) && (
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginTop: 20 }}>
                      <div style={{ background: '#0a0a0f', borderRadius: 14, padding: 14 }}>
                        <i className="ti ti-map-pin" style={{ fontSize: 20, color: '#fbbf24', display: 'block', marginBottom: 6 }} />
                        <p style={{ fontSize: 13, color: '#666', marginBottom: 4 }}>토지가</p>
                        <p style={{ fontSize: 19, fontWeight: 600, color: '#fbbf24' }}>{fmt(landVal)}</p>
                      </div>
                      <div style={{ background: '#0a0a0f', borderRadius: 14, padding: 14 }}>
                        <i className="ti ti-home-2" style={{ fontSize: 20, color: '#a78bfa', display: 'block', marginBottom: 6 }} />
                        <p style={{ fontSize: 13, color: '#666', marginBottom: 4 }}>건물가</p>
                        <p style={{ fontSize: 19, fontWeight: 600, color: '#a78bfa' }}>{fmt(buildVal)}</p>
                      </div>
                    </div>
                  )}
                </div>
                <div style={{ background: '#111118', border: '0.5px solid #1e1e28', borderRadius: 16, padding: 16, marginBottom: 16 }}>
                  <p style={{ fontSize: 14, color: '#555', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 14 }}>계산 근거</p>
                  {isApt ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ fontSize: 16, color: '#888' }}>공동주택 공시가격</span><span style={{ fontSize: 16, fontWeight: 500 }}>{fmt(v.officialPrice!)}</span></div>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ fontSize: 16, color: '#888' }}>공시가격 반영률</span><span style={{ fontSize: 16, fontWeight: 500 }}>{((v.priceRatio ?? 0.70) * 100).toFixed(0)}%</span></div>
                      <div style={{ height: 1, background: '#1e1e28' }} />
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ fontSize: 16, color: '#60a5fa' }}>추정 시세</span><span style={{ fontSize: 17, fontWeight: 700, color: '#60a5fa' }}>{fmt(estimatedPrice)}</span></div>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ fontSize: 16, color: '#888' }}>공시지가</span><span style={{ fontSize: 16 }}>{(v.landPrice ?? 0).toLocaleString()}원/㎡</span></div>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ fontSize: 16, color: '#888' }}>대지면적 × 지분율</span><span style={{ fontSize: 16 }}>{v.landArea}㎡ × {((v.landShare ?? 1) * 100).toFixed(0)}%</span></div>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ fontSize: 16, color: '#fbbf24' }}>토지가</span><span style={{ fontSize: 16, fontWeight: 600, color: '#fbbf24' }}>{fmt(landVal)}</span></div>
                      <div style={{ height: 1, background: '#1e1e28' }} />
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ fontSize: 16, color: '#888' }}>건축비 단가</span><span style={{ fontSize: 16 }}>{(v.buildCostPerSqm ?? 0).toLocaleString()}원/㎡</span></div>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ fontSize: 16, color: '#888' }}>연면적</span><span style={{ fontSize: 16 }}>{v.buildArea}㎡</span></div>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ fontSize: 16, color: '#888' }}>감가 ({age}년 × {((v.deprRate ?? 0.02) * 100).toFixed(1)}%)</span><span style={{ fontSize: 16 }}>잔존율 {(Math.max(1 - (v.deprRate ?? 0.02) * age, 0.2) * 100).toFixed(0)}%</span></div>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ fontSize: 16, color: '#a78bfa' }}>건물가</span><span style={{ fontSize: 16, fontWeight: 600, color: '#a78bfa' }}>{fmt(buildVal)}</span></div>
                      <div style={{ height: 1, background: '#1e1e28' }} />
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ fontSize: 17, color: '#60a5fa', fontWeight: 500 }}>추정 시세 합계</span><span style={{ fontSize: 18, fontWeight: 700, color: '#60a5fa' }}>{fmt(estimatedPrice)}</span></div>
                    </div>
                  )}
                </div>
                <div style={{ background: '#111118', borderRadius: 12, padding: 14, fontSize: 14, color: '#555', lineHeight: 1.8, marginBottom: 16 }}>
                  ⚠️ 이 금액은 공시가격 기반 참고용 추정치입니다. 실제 매매가와 다를 수 있습니다.
                </div>
              </>
            ) : (
              <div style={{ textAlign: 'center', padding: '48px 0', color: '#555' }}>
                <i className="ti ti-building-estate" style={{ fontSize: 46, display: 'block', marginBottom: 12, color: '#2a2a38' }} />
                <p style={{ fontSize: 17, marginBottom: 6 }}>시세 정보가 없어요</p>
                <p style={{ fontSize: 15, marginBottom: 24, color: '#444' }}>공시지가 등 정보를 입력하면 추정 시세를 계산해드려요</p>
              </div>
            )}
            <RealPriceData address={house.address} houseType={house.houseType} area={house.exclusiveArea ?? house.area} />
            <AiValuation address={house.address} houseType={house.houseType} buildYear={house.buildYear} area={house.exclusiveArea ?? house.area} />
            <Link href={`/houses/${id}/valuation`} style={{ display: 'block', width: '100%', background: '#1d4ed8', color: '#fff', border: 'none', borderRadius: 14, padding: '15px', fontSize: 17, fontWeight: 500, cursor: 'pointer', textAlign: 'center', textDecoration: 'none', boxSizing: 'border-box' }}>
              {v ? '공시지가 기반 수정' : '공시지가 기반 입력'}
            </Link>
            <div style={{ height: 24 }} />
          </div>
        )
      })()}

      {/* DOCTOR TAB */}
      {tab === 'doctor' && (
        <>
          <DoctorTab houseId={id} />
          <DoctorHistoryList histories={(tabData as any)?.doctorHistories ?? []} />
          <div style={{ height: 32 }} />
        </>
      )}

      </SwipeableTabContent>
    </div>
  )
}
