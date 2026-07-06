export default function HouseIllustration({ houseType }: { houseType: string }) {
  return (
    <svg width="240" height="180" viewBox="0 0 240 180" fill="none" xmlns="http://www.w3.org/2000/svg">
      {houseType === '단독주택' && <SingleHouse />}
      {houseType === '빌라/연립' && <Villa />}
      {houseType === '다가구' && <MultiFamily />}
      {houseType === '아파트' && <Apartment />}
      {houseType === '한옥' && <Hanok />}
      {(houseType === '기타' || !houseType) && <Other />}
    </svg>
  )
}

/* ── 단독주택 ── */
function SingleHouse() {
  return (
    <>
      {/* 그림자 */}
      <ellipse cx="120" cy="170" rx="88" ry="6" fill="#0d1a2e" opacity="0.8" />
      {/* 굴뚝 */}
      <rect x="158" y="52" width="10" height="30" fill="#111828" stroke="#1e3a5f" strokeWidth="0.8" />
      <rect x="155" y="48" width="16" height="6" fill="#1a2540" stroke="#2a4a80" strokeWidth="0.7" rx="1" />
      <rect x="160" y="38" width="3" height="12" fill="#1e3a5f" />
      {/* 연기 */}
      <circle cx="161" cy="34" r="3" fill="none" stroke="#2a4a80" strokeWidth="0.5" opacity="0.5" />
      <circle cx="163" cy="28" r="4" fill="none" stroke="#2a4a80" strokeWidth="0.4" opacity="0.3" />
      {/* 지붕 */}
      <polygon points="120,22 198,88 42,88" fill="#0d1520" stroke="#2a4a80" strokeWidth="1.2" />
      <line x1="120" y1="22" x2="120" y2="88" stroke="#1e3a5f" strokeWidth="0.5" strokeDasharray="5 4" />
      <line x1="120" y1="22" x2="198" y2="88" stroke="#2a4a80" strokeWidth="0.3" opacity="0.5" />
      <line x1="120" y1="22" x2="42" y2="88" stroke="#2a4a80" strokeWidth="0.3" opacity="0.5" />
      {/* 지붕 꼭대기 장식 */}
      <circle cx="120" cy="22" r="5" fill="#0d1a2e" stroke="#60a5fa" strokeWidth="1" />
      <circle cx="120" cy="22" r="2" fill="#60a5fa" opacity="0.9" />
      {/* 벽 */}
      <rect x="42" y="88" width="156" height="80" fill="#111828" stroke="#1e3a5f" strokeWidth="0.8" />
      {/* 벽 질감 라인 */}
      <line x1="42" y1="108" x2="198" y2="108" stroke="#1a1a2e" strokeWidth="0.4" />
      <line x1="42" y1="128" x2="198" y2="128" stroke="#1a1a2e" strokeWidth="0.4" />
      <line x1="42" y1="148" x2="198" y2="148" stroke="#1a1a2e" strokeWidth="0.4" />
      {/* 왼쪽 창문 */}
      <rect x="52" y="96" width="40" height="32" fill="#0a1520" stroke="#2a4a80" strokeWidth="0.8" rx="2" />
      <line x1="72" y1="96" x2="72" y2="128" stroke="#2a4a80" strokeWidth="0.5" />
      <line x1="52" y1="112" x2="92" y2="112" stroke="#2a4a80" strokeWidth="0.5" />
      <rect x="54" y="98" width="16" height="12" fill="#0d1a2e" opacity="0.6" />
      <rect x="74" y="98" width="16" height="12" fill="#0d1a2e" opacity="0.6" />
      <circle cx="72" cy="112" r="14" fill="none" stroke="#1d4ed8" strokeWidth="0.5" opacity="0.3" />
      <circle cx="72" cy="112" r="3" fill="#60a5fa" opacity="0.6" />
      {/* 오른쪽 창문 */}
      <rect x="108" y="96" width="40" height="32" fill="#0a1520" stroke="#2a4a80" strokeWidth="0.8" rx="2" />
      <line x1="128" y1="96" x2="128" y2="128" stroke="#2a4a80" strokeWidth="0.5" />
      <line x1="108" y1="112" x2="148" y2="112" stroke="#2a4a80" strokeWidth="0.5" />
      <rect x="110" y="98" width="16" height="12" fill="#0d1a2e" opacity="0.6" />
      <rect x="130" y="98" width="16" height="12" fill="#1a2a4a" opacity="0.8" />
      <circle cx="128" cy="112" r="14" fill="none" stroke="#1d4ed8" strokeWidth="0.5" opacity="0.3" />
      <circle cx="128" cy="112" r="3" fill="#60a5fa" opacity="0.4" />
      {/* 현관문 */}
      <rect x="156" y="108" width="28" height="60" fill="#0a1018" stroke="#1e3a5f" strokeWidth="0.8" rx="2" />
      <rect x="158" y="110" width="24" height="36" fill="#0d1a2e" stroke="#2a4a80" strokeWidth="0.4" rx="1" opacity="0.5" />
      <circle cx="179" cy="138" r="2.5" fill="#60a5fa" opacity="0.7" />
      <line x1="170" y1="110" x2="170" y2="168" stroke="#1e3a5f" strokeWidth="0.4" />
      {/* 계단 */}
      <rect x="152" y="164" width="36" height="4" fill="#1a2540" stroke="#2a4a80" strokeWidth="0.5" rx="1" />
      <rect x="148" y="168" width="44" height="2" fill="#1e3a5f" rx="1" />
      {/* IoT 신호 */}
      <circle cx="72" cy="112" r="20" fill="none" stroke="#1d4ed8" strokeWidth="0.4" opacity="0.2" strokeDasharray="3 3" />
    </>
  )
}

/* ── 빌라/연립 ── */
function Villa() {
  return (
    <>
      <ellipse cx="120" cy="170" rx="88" ry="6" fill="#0d1a2e" opacity="0.8" />

      {/* 왼쪽 동 */}
      <polygon points="80,36 128,76 32,76" fill="#0d1520" stroke="#2a4a80" strokeWidth="1" />
      <line x1="80" y1="36" x2="80" y2="76" stroke="#1e3a5f" strokeWidth="0.4" strokeDasharray="4 3" />
      <circle cx="80" cy="36" r="4" fill="#0d1a2e" stroke="#60a5fa" strokeWidth="0.8" />
      <circle cx="80" cy="36" r="1.5" fill="#60a5fa" opacity="0.9" />
      <rect x="32" y="76" width="96" height="92" fill="#111828" stroke="#1e3a5f" strokeWidth="0.7" />
      <line x1="32" y1="96" x2="128" y2="96" stroke="#1a1a2e" strokeWidth="0.4" />
      <line x1="32" y1="126" x2="128" y2="126" stroke="#1a1a2e" strokeWidth="0.4" />
      {/* 왼쪽 동 창문 2열 */}
      {[84, 110].map(y => [38, 66, 94].map((x, i) => (
        <g key={`lv-${y}-${i}`}>
          <rect x={x} y={y} width="22" height="18" fill="#0a1520" stroke="#2a4a80" strokeWidth="0.5" rx="1" />
          <line x1={x+11} y1={y} x2={x+11} y2={y+18} stroke="#2a4a80" strokeWidth="0.3" />
          <line x1={x} y1={y+9} x2={x+22} y2={y+9} stroke="#2a4a80" strokeWidth="0.3" />
          <circle cx={x+11} cy={y+9} r={2} fill="#60a5fa" opacity={i===1 ? 0.7 : 0.3} />
        </g>
      )))}
      {/* 왼쪽 현관 */}
      <rect x="57" y="140" width="22" height="28" fill="#0a1018" stroke="#1e3a5f" strokeWidth="0.6" rx="1" />
      <circle cx="74" cy="154" r="2" fill="#60a5fa" opacity="0.6" />
      <rect x="53" y="166" width="30" height="3" fill="#1a2540" rx="1" />

      {/* 오른쪽 동 */}
      <polygon points="162,28 210,76 114,76" fill="#0a1218" stroke="#2a4a80" strokeWidth="1" />
      <line x1="162" y1="28" x2="162" y2="76" stroke="#1e3a5f" strokeWidth="0.4" strokeDasharray="4 3" />
      <circle cx="162" cy="28" r="4" fill="#0d1a2e" stroke="#a78bfa" strokeWidth="0.8" />
      <circle cx="162" cy="28" r="1.5" fill="#a78bfa" opacity="0.9" />
      <rect x="114" y="76" width="96" height="92" fill="#0f1620" stroke="#1e3a5f" strokeWidth="0.7" />
      <line x1="114" y1="96" x2="210" y2="96" stroke="#1a1a2e" strokeWidth="0.4" />
      <line x1="114" y1="126" x2="210" y2="126" stroke="#1a1a2e" strokeWidth="0.4" />
      {[84, 110].map(y => [120, 148, 176].map((x, i) => (
        <g key={`rv-${y}-${i}`}>
          <rect x={x} y={y} width="22" height="18" fill="#0a1520" stroke="#2a4a80" strokeWidth="0.5" rx="1" />
          <line x1={x+11} y1={y} x2={x+11} y2={y+18} stroke="#2a4a80" strokeWidth="0.3" />
          <line x1={x} y1={y+9} x2={x+22} y2={y+9} stroke="#2a4a80" strokeWidth="0.3" />
          <circle cx={x+11} cy={y+9} r={2} fill="#a78bfa" opacity={i===0 ? 0.7 : 0.3} />
        </g>
      )))}
      <rect x="141" y="140" width="22" height="28" fill="#0a1018" stroke="#1e3a5f" strokeWidth="0.6" rx="1" />
      <circle cx="158" cy="154" r="2" fill="#a78bfa" opacity="0.6" />
      <rect x="137" y="166" width="30" height="3" fill="#1a2540" rx="1" />
      {/* 중앙 경계선 */}
      <line x1="114" y1="76" x2="128" y2="168" stroke="#1e3a5f" strokeWidth="0.6" strokeDasharray="3 2" />
    </>
  )
}

/* ── 다가구 ── */
function MultiFamily() {
  return (
    <>
      <ellipse cx="120" cy="170" rx="88" ry="6" fill="#0d1a2e" opacity="0.8" />
      {/* 옥상 */}
      <rect x="40" y="28" width="160" height="8" fill="#1a2540" stroke="#2a4a80" strokeWidth="0.8" rx="1" />
      {/* 옥상 난간 기둥 */}
      {[52, 78, 104, 130, 156, 182].map(x => (
        <line key={x} x1={x} y1="18" x2={x} y2="28" stroke="#2a4a80" strokeWidth="1.2" />
      ))}
      <line x1="50" y1="18" x2="184" y2="18" stroke="#2a4a80" strokeWidth="0.8" />
      {/* 옥상 물탱크 */}
      <rect x="164" y="10" width="20" height="16" fill="#0d1a2e" stroke="#2a4a80" strokeWidth="0.7" rx="2" />
      <line x1="174" y1="10" x2="174" y2="4" stroke="#2a4a80" strokeWidth="0.8" />
      <ellipse cx="174" cy="10" rx="10" ry="2.5" fill="#1a2540" stroke="#2a4a80" strokeWidth="0.5" />
      {/* 안테나 */}
      <line x1="60" y1="18" x2="60" y2="8" stroke="#2a4a80" strokeWidth="0.8" />
      <line x1="54" y1="10" x2="66" y2="10" stroke="#2a4a80" strokeWidth="0.6" />
      <circle cx="60" cy="8" r="2" fill="#60a5fa" opacity="0.8" />
      {/* 본체 */}
      <rect x="40" y="36" width="160" height="132" fill="#111828" stroke="#1e3a5f" strokeWidth="0.8" />
      {/* 층 구분선 */}
      <line x1="40" y1="78" x2="200" y2="78" stroke="#1e3a5f" strokeWidth="0.6" />
      <line x1="40" y1="118" x2="200" y2="118" stroke="#1e3a5f" strokeWidth="0.6" />
      {/* 3층 창문 */}
      {[48, 88, 128, 168].map((x, i) => (
        <g key={`m3-${i}`}>
          <rect x={x} y="42" width="30" height="28" fill="#0a1520" stroke="#2a4a80" strokeWidth="0.6" rx="2" />
          <line x1={x+15} y1="42" x2={x+15} y2="70" stroke="#2a4a80" strokeWidth="0.4" />
          <line x1={x} y1="56" x2={x+30} y2="56" stroke="#2a4a80" strokeWidth="0.4" />
          <rect x={x+2} y="44" width="11" height="10" fill="#0d1a2e" opacity="0.8" />
          <rect x={x+17} y="44" width="11" height="10" fill={i===1 ? '#1a2a4a' : '#0d1a2e'} opacity="0.8" />
          <circle cx={x+15} cy={56} r="3" fill="#60a5fa" opacity={i===1 ? 0.7 : 0.3} />
        </g>
      ))}
      {/* 2층 창문 */}
      {[48, 88, 128, 168].map((x, i) => (
        <g key={`m2-${i}`}>
          <rect x={x} y="84" width="30" height="26" fill="#0a1520" stroke="#2a4a80" strokeWidth="0.6" rx="2" />
          <line x1={x+15} y1="84" x2={x+15} y2="110" stroke="#2a4a80" strokeWidth="0.4" />
          <line x1={x} y1="97" x2={x+30} y2="97" stroke="#2a4a80" strokeWidth="0.4" />
          <circle cx={x+15} cy={97} r="3" fill="#60a5fa" opacity={i===3 ? 0.7 : 0.3} />
        </g>
      ))}
      {/* 1층 — 상가 + 현관 */}
      <rect x="44" y="124" width="52" height="44" fill="#0a1018" stroke="#1e3a5f" strokeWidth="0.6" />
      <rect x="48" y="128" width="44" height="24" fill="#0d1a2e" stroke="#2a4a80" strokeWidth="0.4" rx="1" />
      <line x1="70" y1="128" x2="70" y2="152" stroke="#2a4a80" strokeWidth="0.3" />
      <rect x="104" y="130" width="28" height="38" fill="#0a1018" stroke="#1e3a5f" strokeWidth="0.6" rx="1" />
      <circle cx="127" cy="149" r="2.5" fill="#60a5fa" opacity="0.7" />
      <line x1="116" y1="130" x2="116" y2="168" stroke="#1e3a5f" strokeWidth="0.4" />
      <rect x="140" y="124" width="52" height="44" fill="#0a1018" stroke="#1e3a5f" strokeWidth="0.6" />
      <rect x="144" y="128" width="44" height="24" fill="#0d1a2e" stroke="#2a4a80" strokeWidth="0.4" rx="1" />
      <line x1="166" y1="128" x2="166" y2="152" stroke="#2a4a80" strokeWidth="0.3" />
      {/* 계단 */}
      <rect x="40" y="166" width="160" height="3" fill="#1a2540" rx="1" />
    </>
  )
}

/* ── 아파트 ── */
function Apartment() {
  return (
    <>
      <ellipse cx="120" cy="170" rx="90" ry="6" fill="#0d1a2e" opacity="0.8" />

      {/* 왼쪽 동 (낮음) */}
      <rect x="14" y="60" width="68" height="108" fill="#0f1620" stroke="#1e3a5f" strokeWidth="0.7" />
      <rect x="14" y="54" width="68" height="8" fill="#1a2540" stroke="#2a4a80" strokeWidth="0.6" rx="1" />
      {[66, 88, 110, 130].map((y, r) =>
        [20, 42, 62].map((x, c) => (
          <g key={`la-${r}-${c}`}>
            <rect x={x} y={y} width="16" height="14" fill="#0a1520" stroke="#2a4a80" strokeWidth="0.4" rx="1" />
            <line x1={x+8} y1={y} x2={x+8} y2={y+14} stroke="#2a4a80" strokeWidth="0.25" />
            <circle cx={x+8} cy={y+7} r="2" fill="#60a5fa" opacity={(r+c)%3===0 ? 0.7 : 0.2} />
          </g>
        ))
      )}
      <line x1="14" y1="88" x2="82" y2="88" stroke="#1e3a5f" strokeWidth="0.4" />
      <line x1="14" y1="110" x2="82" y2="110" stroke="#1e3a5f" strokeWidth="0.4" />
      <line x1="14" y1="130" x2="82" y2="130" stroke="#1e3a5f" strokeWidth="0.4" />

      {/* 중앙 동 (가장 높음) */}
      <rect x="76" y="12" width="88" height="156" fill="#111828" stroke="#1e3a5f" strokeWidth="0.9" />
      <rect x="76" y="6" width="88" height="8" fill="#1a2540" stroke="#2a4a80" strokeWidth="0.7" rx="1" />
      {/* 중앙 안테나 */}
      <line x1="120" y1="6" x2="120" y2="-2" stroke="#60a5fa" strokeWidth="1.2" />
      <circle cx="120" cy="-2" r="2.5" fill="#60a5fa" opacity="0.9" />
      <line x1="114" y1="2" x2="126" y2="2" stroke="#60a5fa" strokeWidth="0.6" opacity="0.5" />
      {[18, 38, 58, 78, 98, 118, 138].map((y, r) =>
        [82, 102, 122, 142].map((x, c) => (
          <g key={`ca-${r}-${c}`}>
            <rect x={x} y={y} width="16" height="14" fill="#0a1520" stroke="#2a4a80" strokeWidth="0.5" rx="1" />
            <line x1={x+8} y1={y} x2={x+8} y2={y+14} stroke="#2a4a80" strokeWidth="0.3" />
            <circle cx={x+8} cy={y+7} r="2.5" fill="#60a5fa" opacity={(r*4+c)%5===0 ? 0.8 : 0.2} />
          </g>
        ))
      )}
      <line x1="76" y1="38" x2="164" y2="38" stroke="#1e3a5f" strokeWidth="0.4" />
      <line x1="76" y1="58" x2="164" y2="58" stroke="#1e3a5f" strokeWidth="0.4" />
      <line x1="76" y1="78" x2="164" y2="78" stroke="#1e3a5f" strokeWidth="0.4" />
      <line x1="76" y1="98" x2="164" y2="98" stroke="#1e3a5f" strokeWidth="0.4" />
      <line x1="76" y1="118" x2="164" y2="118" stroke="#1e3a5f" strokeWidth="0.4" />
      <line x1="76" y1="138" x2="164" y2="138" stroke="#1e3a5f" strokeWidth="0.4" />
      {/* 로비 */}
      <rect x="76" y="152" width="88" height="16" fill="#0a1018" stroke="#1e3a5f" strokeWidth="0.6" />
      <rect x="100" y="152" width="40" height="16" fill="#0d1a2e" stroke="#60a5fa" strokeWidth="0.5" />
      <line x1="120" y1="152" x2="120" y2="168" stroke="#60a5fa" strokeWidth="0.4" />
      <circle cx="136" cy="160" r="2" fill="#60a5fa" opacity="0.7" />

      {/* 오른쪽 동 (낮음) */}
      <rect x="158" y="68" width="68" height="100" fill="#0f1620" stroke="#1e3a5f" strokeWidth="0.7" />
      <rect x="158" y="62" width="68" height="8" fill="#1a2540" stroke="#2a4a80" strokeWidth="0.6" rx="1" />
      {[74, 94, 114, 134].map((y, r) =>
        [164, 184, 204].map((x, c) => (
          <g key={`ra-${r}-${c}`}>
            <rect x={x} y={y} width="16" height="14" fill="#0a1520" stroke="#2a4a80" strokeWidth="0.4" rx="1" />
            <line x1={x+8} y1={y} x2={x+8} y2={y+14} stroke="#2a4a80" strokeWidth="0.25" />
            <circle cx={x+8} cy={y+7} r="2" fill="#60a5fa" opacity={(r+c)%4===0 ? 0.7 : 0.2} />
          </g>
        ))
      )}
      <line x1="158" y1="94" x2="226" y2="94" stroke="#1e3a5f" strokeWidth="0.4" />
      <line x1="158" y1="114" x2="226" y2="114" stroke="#1e3a5f" strokeWidth="0.4" />
      <line x1="158" y1="134" x2="226" y2="134" stroke="#1e3a5f" strokeWidth="0.4" />
      {/* 바닥선 */}
      <line x1="14" y1="168" x2="82" y2="168" stroke="#1e3a5f" strokeWidth="0.5" />
      <line x1="158" y1="168" x2="226" y2="168" stroke="#1e3a5f" strokeWidth="0.5" />
      {/* IoT 신호 */}
      <circle cx="120" cy="90" r="60" fill="none" stroke="#1d4ed8" strokeWidth="0.3" opacity="0.15" strokeDasharray="4 4" />
    </>
  )
}

/* ── 한옥 ── */
function Hanok() {
  return (
    <>
      <ellipse cx="120" cy="170" rx="88" ry="6" fill="#0d1a2e" opacity="0.8" />

      {/* 기단 */}
      <rect x="38" y="148" width="164" height="18" fill="#1a2540" stroke="#2a4a80" strokeWidth="0.8" rx="1" />
      <line x1="38" y1="154" x2="202" y2="154" stroke="#2a4a80" strokeWidth="0.4" />
      {[55,75,95,120,145,165,185].map(x => (
        <line key={x} x1={x} y1="148" x2={x} y2="166" stroke="#2a4a80" strokeWidth="0.3" opacity="0.5" />
      ))}

      {/* 벽체 */}
      <rect x="50" y="100" width="140" height="48" fill="#111828" stroke="#1e3a5f" strokeWidth="0.8" />

      {/* 창살 창문 왼쪽 */}
      <rect x="58" y="108" width="34" height="32" fill="#0a1520" stroke="#2a4a80" strokeWidth="0.7" rx="1" />
      {[64,70,76,82,88].map(x => (
        <line key={x} x1={x} y1="108" x2={x} y2="140" stroke="#2a4a80" strokeWidth="0.4" />
      ))}
      {[115,122,129,136].map(y => (
        <line key={y} x1="58" y1={y} x2="92" y2={y} stroke="#2a4a80" strokeWidth="0.4" />
      ))}
      <circle cx="75" cy="124" r="2.5" fill="#60a5fa" opacity="0.5" />

      {/* 창살 창문 오른쪽 */}
      <rect x="148" y="108" width="34" height="32" fill="#0a1520" stroke="#2a4a80" strokeWidth="0.7" rx="1" />
      {[154,160,166,172,178].map(x => (
        <line key={x} x1={x} y1="108" x2={x} y2="140" stroke="#2a4a80" strokeWidth="0.4" />
      ))}
      {[115,122,129,136].map(y => (
        <line key={y} x1="148" y1={y} x2="182" y2={y} stroke="#2a4a80" strokeWidth="0.4" />
      ))}
      <circle cx="165" cy="124" r="2.5" fill="#60a5fa" opacity="0.3" />

      {/* 대문 */}
      <rect x="103" y="110" width="34" height="38" fill="#0a1018" stroke="#1e3a5f" strokeWidth="0.8" rx="1" />
      <line x1="120" y1="110" x2="120" y2="148" stroke="#1e3a5f" strokeWidth="0.6" />
      <rect x="105" y="112" width="13" height="20" fill="#0d1a2e" stroke="#2a4a80" strokeWidth="0.4" rx="1" opacity="0.7" />
      <rect x="122" y="112" width="13" height="20" fill="#0d1a2e" stroke="#2a4a80" strokeWidth="0.4" rx="1" opacity="0.7" />
      <circle cx="113" cy="122" r="1.8" fill="#60a5fa" opacity="0.7" />
      <circle cx="127" cy="122" r="1.8" fill="#60a5fa" opacity="0.7" />

      {/* 처마 하부 (soffit) — 처마 끝 아래 어두운 면 */}
      <path d="M14,64 Q120,100 226,64 L210,100 Q120,108 30,100 Z"
        fill="#0d1520" stroke="#1e3a5f" strokeWidth="0.5" />

      {/*
        지붕 본체 핵심:
        - 상단 경사면: 능선→처마 끝으로 내려오면서 안쪽으로 오목하게 휨 (concave)
        - 처마선: 중앙이 낮고 양 끝이 위로 올라감 (추녀)
        C x1,y1 x2,y2 ex,ey  ← cubic bezier: 제어점이 직선 안쪽에 있으면 concave
      */}
      <path d="
        M90,22 L150,22
        C 172,26 210,44 226,64
        Q 173,96 120,100
        Q 67,96 14,64
        C 30,44 68,26 90,22
        Z"
        fill="#0d1520" stroke="#2a4a80" strokeWidth="1.2" />

      {/* 처마 끝선 강조 — 양 끝이 올라가는 곡선 */}
      <path d="M14,64 Q120,100 226,64"
        fill="none" stroke="#60a5fa" strokeWidth="0.9" opacity="0.5" />

      {/* 추녀 끝 위로 꺾임 */}
      <path d="M14,64 Q8,54 6,42" fill="none" stroke="#2a4a80" strokeWidth="2" strokeLinecap="round" />
      <path d="M226,64 Q232,54 234,42" fill="none" stroke="#2a4a80" strokeWidth="2" strokeLinecap="round" />

      {/* 용마루 */}
      <rect x="90" y="18" width="60" height="6" fill="#1a2540" stroke="#2a4a80" strokeWidth="0.8" rx="2" />
      {/* 취두 */}
      <circle cx="90" cy="21" r="4" fill="#0d1a2e" stroke="#60a5fa" strokeWidth="1" />
      <circle cx="90" cy="21" r="1.5" fill="#60a5fa" opacity="0.9" />
      <circle cx="150" cy="21" r="4" fill="#0d1a2e" stroke="#60a5fa" strokeWidth="1" />
      <circle cx="150" cy="21" r="1.5" fill="#60a5fa" opacity="0.9" />

      {/* 서까래 */}
      {[38,62,86,120,154,178,202].map((x,i) => (
        <line key={i} x1={120} y1={22} x2={x} y2={98} stroke="#1e3a5f" strokeWidth="0.3" opacity="0.3" />
      ))}
    </>
  )
}

/* ── 기타 ── */
function Other() {
  return (
    <>
      <ellipse cx="120" cy="170" rx="88" ry="6" fill="#0d1a2e" opacity="0.8" />
      {/* 지붕 평면 */}
      <rect x="36" y="32" width="168" height="10" fill="#1a2540" stroke="#2a4a80" strokeWidth="0.8" rx="1" />
      {/* 안테나 */}
      <line x1="80" y1="32" x2="80" y2="16" stroke="#2a4a80" strokeWidth="0.8" />
      <line x1="72" y1="20" x2="88" y2="20" stroke="#2a4a80" strokeWidth="0.6" />
      <circle cx="80" cy="16" r="2.5" fill="#60a5fa" opacity="0.8" />
      <line x1="160" y1="32" x2="160" y2="22" stroke="#2a4a80" strokeWidth="0.8" />
      <circle cx="160" cy="22" r="2" fill="#a78bfa" opacity="0.7" />
      {/* 본체 */}
      <rect x="36" y="42" width="168" height="126" fill="#111828" stroke="#1e3a5f" strokeWidth="0.8" />
      {/* 수직 구분 */}
      <line x1="36" y1="80" x2="204" y2="80" stroke="#1e3a5f" strokeWidth="0.5" />
      <line x1="36" y1="118" x2="204" y2="118" stroke="#1e3a5f" strokeWidth="0.5" />
      <line x1="120" y1="42" x2="120" y2="168" stroke="#1e3a5f" strokeWidth="0.4" strokeDasharray="4 3" />
      {/* 2층 창문 */}
      {[44, 84, 128, 168].map((x, i) => (
        <g key={`ow2-${i}`}>
          <rect x={x} y="48" width="32" height="24" fill="#0a1520" stroke="#2a4a80" strokeWidth="0.6" rx="2" />
          <line x1={x+16} y1="48" x2={x+16} y2="72" stroke="#2a4a80" strokeWidth="0.4" />
          <line x1={x} y1="60" x2={x+32} y2="60" stroke="#2a4a80" strokeWidth="0.4" />
          <circle cx={x+16} cy={60} r="3" fill="#60a5fa" opacity={i%2===0 ? 0.6 : 0.3} />
        </g>
      ))}
      {/* 1층 창문 */}
      {[44, 84, 128, 168].map((x, i) => (
        <g key={`ow1-${i}`}>
          <rect x={x} y="86" width="32" height="24" fill="#0a1520" stroke="#2a4a80" strokeWidth="0.6" rx="2" />
          <line x1={x+16} y1="86" x2={x+16} y2="110" stroke="#2a4a80" strokeWidth="0.4" />
          <circle cx={x+16} cy={98} r="3" fill="#a78bfa" opacity={i%2!==0 ? 0.6 : 0.3} />
        </g>
      ))}
      {/* 1층 출입구 */}
      <rect x="44" y="124" width="64" height="44" fill="#0a1018" stroke="#1e3a5f" strokeWidth="0.6" />
      <rect x="50" y="128" width="52" height="28" fill="#0d1a2e" stroke="#2a4a80" strokeWidth="0.4" rx="1" />
      <line x1="76" y1="128" x2="76" y2="156" stroke="#2a4a80" strokeWidth="0.3" />
      <rect x="132" y="130" width="24" height="38" fill="#0a1018" stroke="#1e3a5f" strokeWidth="0.6" rx="1" />
      <circle cx="151" cy="149" r="2.5" fill="#60a5fa" opacity="0.7" />
      <rect x="164" y="124" width="32" height="44" fill="#0a1018" stroke="#1e3a5f" strokeWidth="0.5" />
      <rect x="168" y="128" width="24" height="18" fill="#0d1a2e" stroke="#2a4a80" strokeWidth="0.3" rx="1" />
      {/* 바닥 */}
      <rect x="36" y="166" width="168" height="3" fill="#1a2540" rx="1" />
    </>
  )
}
