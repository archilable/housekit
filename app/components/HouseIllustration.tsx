export default function HouseIllustration({ houseType }: { houseType: string }) {
  return (
    <svg width="220" height="170" viewBox="0 0 220 170" fill="none" xmlns="http://www.w3.org/2000/svg">
      {houseType === '아파트' && <ApartmentSVG />}
      {houseType === '빌라/연립' && <VillaSVG />}
      {houseType === '다가구' && <MultiFamilySVG />}
      {(houseType === '기타' || !houseType) && <OtherSVG />}
      {houseType === '단독주택' && <SingleHouseSVG />}
    </svg>
  )
}

/* 단독주택 — 삼각 지붕 + 마당 */
function SingleHouseSVG() {
  return (
    <>
      <ellipse cx="110" cy="162" rx="85" ry="6" fill="#1a1a2e" opacity="0.6" />
      {/* 굴뚝 */}
      <rect x="148" y="48" width="10" height="24" fill="#1a2540" stroke="#2a4a80" strokeWidth="0.8" />
      <rect x="146" y="44" width="14" height="6" fill="#1e3a5f" rx="1" />
      {/* 지붕 */}
      <polygon points="110,20 192,82 28,82" fill="#1a2540" stroke="#2a4a80" strokeWidth="1" />
      <line x1="110" y1="20" x2="110" y2="82" stroke="#2a4a80" strokeWidth="0.4" strokeDasharray="4 3" />
      {/* 벽 */}
      <rect x="32" y="82" width="156" height="78" fill="#111828" stroke="#1e3a5f" strokeWidth="0.8" />
      {/* 왼쪽 창문 */}
      <rect x="46" y="96" width="34" height="26" fill="#0d1a2e" stroke="#2a4a80" strokeWidth="0.6" rx="2" />
      <line x1="63" y1="96" x2="63" y2="122" stroke="#2a4a80" strokeWidth="0.4" />
      <line x1="46" y1="109" x2="80" y2="109" stroke="#2a4a80" strokeWidth="0.4" />
      <circle cx="63" cy="109" r="10" fill="none" stroke="#60a5fa" strokeWidth="0.4" opacity="0.3" />
      <circle cx="63" cy="109" r="2" fill="#60a5fa" opacity="0.5" />
      {/* 오른쪽 창문 */}
      <rect x="98" y="96" width="34" height="26" fill="#0d1a2e" stroke="#2a4a80" strokeWidth="0.6" rx="2" />
      <line x1="115" y1="96" x2="115" y2="122" stroke="#2a4a80" strokeWidth="0.4" />
      <line x1="98" y1="109" x2="132" y2="109" stroke="#2a4a80" strokeWidth="0.4" />
      <circle cx="115" cy="109" r="10" fill="none" stroke="#60a5fa" strokeWidth="0.4" opacity="0.3" />
      <circle cx="115" cy="109" r="2" fill="#60a5fa" opacity="0.5" />
      {/* 현관문 */}
      <rect x="147" y="104" width="24" height="56" fill="#0d1520" stroke="#1e3a5f" strokeWidth="0.6" rx="2" />
      <circle cx="165" cy="132" r="2" fill="#60a5fa" opacity="0.6" />
      {/* 지붕 꼭대기 */}
      <circle cx="110" cy="20" r="4" fill="#60a5fa" opacity="0.9" />
      {/* 마당 계단 */}
      <rect x="28" y="158" width="164" height="4" fill="#1a1a2e" rx="1" />
    </>
  )
}

/* 빌라/연립 — 나란히 붙은 2채 */
function VillaSVG() {
  return (
    <>
      <ellipse cx="110" cy="162" rx="85" ry="6" fill="#1a1a2e" opacity="0.6" />
      {/* 왼쪽 동 */}
      <polygon points="72,28 118,70 26,70" fill="#1a2540" stroke="#2a4a80" strokeWidth="1" />
      <rect x="28" y="70" width="88" height="90" fill="#111828" stroke="#1e3a5f" strokeWidth="0.8" />
      {/* 왼쪽 동 창문들 */}
      <rect x="36" y="80" width="22" height="18" fill="#0d1a2e" stroke="#2a4a80" strokeWidth="0.5" rx="1" />
      <line x1="47" y1="80" x2="47" y2="98" stroke="#2a4a80" strokeWidth="0.3" />
      <circle cx="47" cy="89" r="6" fill="none" stroke="#60a5fa" strokeWidth="0.3" opacity="0.3" />
      <circle cx="47" cy="89" r="1.5" fill="#60a5fa" opacity="0.5" />
      <rect x="64" y="80" width="22" height="18" fill="#0d1a2e" stroke="#2a4a80" strokeWidth="0.5" rx="1" />
      <line x1="75" y1="80" x2="75" y2="98" stroke="#2a4a80" strokeWidth="0.3" />
      <circle cx="75" cy="89" r="6" fill="none" stroke="#60a5fa" strokeWidth="0.3" opacity="0.3" />
      <circle cx="75" cy="89" r="1.5" fill="#60a5fa" opacity="0.5" />
      <rect x="36" y="106" width="22" height="18" fill="#0d1a2e" stroke="#2a4a80" strokeWidth="0.5" rx="1" />
      <line x1="47" y1="106" x2="47" y2="124" stroke="#2a4a80" strokeWidth="0.3" />
      <rect x="64" y="106" width="22" height="18" fill="#0d1a2e" stroke="#2a4a80" strokeWidth="0.5" rx="1" />
      <line x1="75" y1="106" x2="75" y2="124" stroke="#2a4a80" strokeWidth="0.3" />
      {/* 왼쪽 현관 */}
      <rect x="47" y="136" width="18" height="24" fill="#0d1520" stroke="#1e3a5f" strokeWidth="0.5" rx="1" />
      <circle cx="60" cy="148" r="1.5" fill="#60a5fa" opacity="0.6" />

      {/* 오른쪽 동 */}
      <polygon points="148,28 194,70 102,70" fill="#152035" stroke="#2a4a80" strokeWidth="1" />
      <rect x="104" y="70" width="88" height="90" fill="#0f1620" stroke="#1e3a5f" strokeWidth="0.8" />
      {/* 오른쪽 동 창문들 */}
      <rect x="112" y="80" width="22" height="18" fill="#0d1a2e" stroke="#2a4a80" strokeWidth="0.5" rx="1" />
      <line x1="123" y1="80" x2="123" y2="98" stroke="#2a4a80" strokeWidth="0.3" />
      <circle cx="123" cy="89" r="6" fill="none" stroke="#60a5fa" strokeWidth="0.3" opacity="0.3" />
      <circle cx="123" cy="89" r="1.5" fill="#60a5fa" opacity="0.5" />
      <rect x="140" y="80" width="22" height="18" fill="#0d1a2e" stroke="#2a4a80" strokeWidth="0.5" rx="1" />
      <line x1="151" y1="80" x2="151" y2="98" stroke="#2a4a80" strokeWidth="0.3" />
      <circle cx="151" cy="89" r="6" fill="none" stroke="#60a5fa" strokeWidth="0.3" opacity="0.3" />
      <circle cx="151" cy="89" r="1.5" fill="#60a5fa" opacity="0.5" />
      <rect x="112" y="106" width="22" height="18" fill="#0d1a2e" stroke="#2a4a80" strokeWidth="0.5" rx="1" />
      <line x1="123" y1="106" x2="123" y2="124" stroke="#2a4a80" strokeWidth="0.3" />
      <rect x="140" y="106" width="22" height="18" fill="#0d1a2e" stroke="#2a4a80" strokeWidth="0.5" rx="1" />
      <line x1="151" y1="106" x2="151" y2="124" stroke="#2a4a80" strokeWidth="0.3" />
      {/* 오른쪽 현관 */}
      <rect x="123" y="136" width="18" height="24" fill="#0d1520" stroke="#1e3a5f" strokeWidth="0.5" rx="1" />
      <circle cx="136" cy="148" r="1.5" fill="#60a5fa" opacity="0.6" />

      <circle cx="72" cy="28" r="3.5" fill="#60a5fa" opacity="0.9" />
      <circle cx="148" cy="28" r="3.5" fill="#a78bfa" opacity="0.7" />
    </>
  )
}

/* 다가구 — 3층 건물 */
function MultiFamilySVG() {
  return (
    <>
      <ellipse cx="110" cy="162" rx="85" ry="6" fill="#1a1a2e" opacity="0.6" />
      {/* 옥상 난간 */}
      <rect x="38" y="28" width="144" height="6" fill="#1e3a5f" rx="1" />
      <line x1="50" y1="22" x2="50" y2="34" stroke="#2a4a80" strokeWidth="1.5" />
      <line x1="80" y1="22" x2="80" y2="34" stroke="#2a4a80" strokeWidth="1.5" />
      <line x1="110" y1="22" x2="110" y2="34" stroke="#2a4a80" strokeWidth="1.5" />
      <line x1="140" y1="22" x2="140" y2="34" stroke="#2a4a80" strokeWidth="1.5" />
      <line x1="170" y1="22" x2="170" y2="34" stroke="#2a4a80" strokeWidth="1.5" />
      {/* 본체 */}
      <rect x="38" y="34" width="144" height="126" fill="#111828" stroke="#1e3a5f" strokeWidth="0.8" />
      {/* 3층 수평선 */}
      <line x1="38" y1="76" x2="182" y2="76" stroke="#1e3a5f" strokeWidth="0.5" />
      <line x1="38" y1="118" x2="182" y2="118" stroke="#1e3a5f" strokeWidth="0.5" />
      {/* 3층 창문 */}
      {[42, 80, 118, 156].map((x, i) => (
        <g key={i}>
          <rect x={x} y="40" width="28" height="28" fill="#0d1a2e" stroke="#2a4a80" strokeWidth="0.5" rx="2" />
          <line x1={x+14} y1="40" x2={x+14} y2="68" stroke="#2a4a80" strokeWidth="0.3" />
          <line x1={x} y1="54" x2={x+28} y2="54" stroke="#2a4a80" strokeWidth="0.3" />
          <circle cx={x+14} cy={54} r="7" fill="none" stroke="#60a5fa" strokeWidth="0.3" opacity="0.3" />
          <circle cx={x+14} cy={54} r="2" fill="#60a5fa" opacity={i % 2 === 0 ? 0.6 : 0.3} />
        </g>
      ))}
      {/* 2층 창문 */}
      {[42, 80, 118, 156].map((x, i) => (
        <g key={i}>
          <rect x={x} y="82" width="28" height="28" fill="#0d1a2e" stroke="#2a4a80" strokeWidth="0.5" rx="2" />
          <line x1={x+14} y1="82" x2={x+14} y2="110" stroke="#2a4a80" strokeWidth="0.3" />
          <line x1={x} y1="96" x2={x+28} y2="96" stroke="#2a4a80" strokeWidth="0.3" />
          <circle cx={x+14} cy={96} r="2" fill="#60a5fa" opacity={i % 2 !== 0 ? 0.6 : 0.3} />
        </g>
      ))}
      {/* 1층 — 가게/현관 */}
      <rect x="42" y="124" width="40" height="36" fill="#0a1020" stroke="#1e3a5f" strokeWidth="0.5" rx="1" />
      <rect x="45" y="127" width="34" height="20" fill="#0d1a2e" stroke="#2a4a80" strokeWidth="0.4" rx="1" />
      <rect x="100" y="130" width="22" height="30" fill="#0d1520" stroke="#1e3a5f" strokeWidth="0.5" rx="1" />
      <circle cx="117" cy="145" r="1.5" fill="#60a5fa" opacity="0.6" />
      <rect x="130" y="124" width="40" height="36" fill="#0a1020" stroke="#1e3a5f" strokeWidth="0.5" rx="1" />
      <rect x="133" y="127" width="34" height="20" fill="#0d1a2e" stroke="#2a4a80" strokeWidth="0.4" rx="1" />
      {/* 옥상 물탱크 */}
      <rect x="154" y="14" width="18" height="14" fill="#0d1a2e" stroke="#2a4a80" strokeWidth="0.6" rx="2" />
      <line x1="163" y1="14" x2="163" y2="8" stroke="#2a4a80" strokeWidth="0.8" />
    </>
  )
}

/* 아파트 — 고층 */
function ApartmentSVG() {
  return (
    <>
      <ellipse cx="110" cy="162" rx="85" ry="6" fill="#1a1a2e" opacity="0.6" />
      {/* 왼쪽 동 */}
      <rect x="18" y="42" width="72" height="118" fill="#111828" stroke="#1e3a5f" strokeWidth="0.7" />
      <rect x="18" y="36" width="72" height="8" fill="#1a2540" stroke="#2a4a80" strokeWidth="0.5" />
      {[48, 68, 88, 108, 128].map((y, row) =>
        [24, 44, 64].map((x, col) => (
          <rect key={`l-${row}-${col}`} x={x} y={y} width="14" height="12" fill="#0d1a2e" stroke="#2a4a80" strokeWidth="0.4" rx="1" />
        ))
      )}
      {/* 왼쪽 동 불빛 */}
      <rect x="24" y="48" width="14" height="12" fill="#1a2a4a" stroke="#60a5fa" strokeWidth="0.4" rx="1" opacity="0.8" />
      <rect x="64" y="88" width="14" height="12" fill="#1a2a4a" stroke="#60a5fa" strokeWidth="0.4" rx="1" opacity="0.8" />
      <rect x="44" y="128" width="14" height="12" fill="#1a2a4a" stroke="#60a5fa" strokeWidth="0.4" rx="1" opacity="0.8" />

      {/* 중앙 동 (제일 높음) */}
      <rect x="74" y="10" width="72" height="150" fill="#0f1620" stroke="#1e3a5f" strokeWidth="0.8" />
      <rect x="74" y="4" width="72" height="8" fill="#1a2540" stroke="#2a4a80" strokeWidth="0.6" />
      <line x1="110" y1="4" x2="110" y2="0" stroke="#60a5fa" strokeWidth="1.2" />
      <circle cx="110" cy="0" r="2" fill="#60a5fa" opacity="0.9" />
      {[16, 36, 56, 76, 96, 116, 136].map((y, row) =>
        [80, 100, 120].map((x, col) => (
          <rect key={`c-${row}-${col}`} x={x} y={y} width="14" height="14" fill="#0d1a2e" stroke="#2a4a80" strokeWidth="0.4" rx="1" />
        ))
      )}
      {/* 중앙 불빛 */}
      <rect x="80" y="16" width="14" height="14" fill="#1a2a4a" stroke="#60a5fa" strokeWidth="0.4" rx="1" opacity="0.9" />
      <rect x="120" y="56" width="14" height="14" fill="#1a2a4a" stroke="#60a5fa" strokeWidth="0.4" rx="1" opacity="0.9" />
      <rect x="100" y="96" width="14" height="14" fill="#1a2a4a" stroke="#60a5fa" strokeWidth="0.4" rx="1" opacity="0.9" />
      <rect x="80" y="136" width="14" height="14" fill="#1a2a4a" stroke="#60a5fa" strokeWidth="0.4" rx="1" opacity="0.9" />

      {/* 오른쪽 동 */}
      <rect x="130" y="52" width="72" height="108" fill="#111828" stroke="#1e3a5f" strokeWidth="0.7" />
      <rect x="130" y="46" width="72" height="8" fill="#1a2540" stroke="#2a4a80" strokeWidth="0.5" />
      {[58, 78, 98, 118, 138].map((y, row) =>
        [136, 156, 176].map((x, col) => (
          <rect key={`r-${row}-${col}`} x={x} y={y} width="14" height="12" fill="#0d1a2e" stroke="#2a4a80" strokeWidth="0.4" rx="1" />
        ))
      )}
      <rect x="156" y="58" width="14" height="12" fill="#1a2a4a" stroke="#60a5fa" strokeWidth="0.4" rx="1" opacity="0.8" />
      <rect x="136" y="118" width="14" height="12" fill="#1a2a4a" stroke="#60a5fa" strokeWidth="0.4" rx="1" opacity="0.8" />

      {/* 1층 로비 */}
      <rect x="74" y="148" width="72" height="12" fill="#0a1020" stroke="#1e3a5f" strokeWidth="0.5" />
      <rect x="96" y="148" width="28" height="12" fill="#0d1520" stroke="#60a5fa" strokeWidth="0.4" />
      <circle cx="114" cy="154" r="1.5" fill="#60a5fa" opacity="0.7" />
    </>
  )
}

/* 기타 */
function OtherSVG() {
  return (
    <>
      <ellipse cx="110" cy="162" rx="85" ry="6" fill="#1a1a2e" opacity="0.6" />
      <rect x="30" y="50" width="160" height="110" fill="#111828" stroke="#1e3a5f" strokeWidth="0.8" />
      <rect x="30" y="40" width="160" height="12" fill="#1a2540" stroke="#2a4a80" strokeWidth="0.6" />
      {/* 창문 3x2 */}
      {[60, 100, 140].map((x, col) =>
        [60, 100].map((y, row) => (
          <rect key={`o-${col}-${row}`} x={x} y={y} width="30" height="24" fill="#0d1a2e" stroke="#2a4a80" strokeWidth="0.5" rx="2" />
        ))
      )}
      <circle cx="75" cy="72" r="2" fill="#60a5fa" opacity="0.6" />
      <circle cx="155" cy="112" r="2" fill="#60a5fa" opacity="0.6" />
      {/* 입구 */}
      <rect x="90" y="124" width="40" height="36" fill="#0d1520" stroke="#1e3a5f" strokeWidth="0.6" rx="1" />
      <circle cx="124" cy="142" r="2" fill="#60a5fa" opacity="0.6" />
      {/* 안테나 */}
      <line x1="110" y1="40" x2="110" y2="24" stroke="#2a4a80" strokeWidth="1" />
      <line x1="100" y1="28" x2="120" y2="28" stroke="#2a4a80" strokeWidth="0.8" />
      <circle cx="110" cy="24" r="2.5" fill="#60a5fa" opacity="0.8" />
    </>
  )
}
