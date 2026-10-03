export function OpenBookArt() {
  return (
    <svg viewBox="0 0 420 300" className="w-full max-w-[420px] mx-auto drop-shadow-2xl" aria-hidden>
      <ellipse cx="210" cy="272" rx="170" ry="14" fill="black" opacity=".18" />
      <path d="M20 40 Q210 8 210 40 V250 Q210 218 20 250 Z" fill="#F7F7FA" stroke="#00000014" />
      <path d="M400 40 Q210 8 210 40 V250 Q210 218 400 250 Z" fill="#FCFCFE" stroke="#00000014" />
      {[0, 1, 2, 3, 4, 5].map(i => <path key={'l' + i} d={`M40 ${72 + i * 26} Q210 ${50 + i * 26} 195 ${74 + i * 26}`} stroke="#0E1CC31f" strokeWidth="2" fill="none" />)}
      {[0, 1, 2, 3, 4, 5].map(i => <path key={'r' + i} d={`M225 ${74 + i * 26} Q210 ${50 + i * 26} 380 ${72 + i * 26}`} stroke="#0E1CC31f" strokeWidth="2" fill="none" />)}
      <path d="M204 20 C216 60 216 220 204 258" stroke="#25252522" strokeWidth="10" fill="none" />
      <path d="M120 96 L165 96 M120 122 L150 122" stroke="#FE00AE" strokeWidth="3" strokeLinecap="round" />
      <circle cx="300" cy="170" r="16" fill="#CDFF00" opacity=".85" />
    </svg>
  )
}
export function StoryArt() {
  return (
    <svg viewBox="0 0 320 260" className="w-full max-w-[300px]" aria-hidden>
      <ellipse cx="160" cy="238" rx="130" ry="12" fill="black" opacity=".25" />
      <g transform="rotate(-6 160 190)"><rect x="70" y="150" width="150" height="70" rx="4" fill="#1f6f5c" /><rect x="70" y="150" width="150" height="10" fill="#ffffff22" /></g>
      <g transform="rotate(4 160 160)"><rect x="80" y="110" width="150" height="70" rx="4" fill="#e0662f" /><rect x="80" y="110" width="150" height="10" fill="#ffffff22" /></g>
      <g transform="rotate(-3 160 120)"><rect x="75" y="60" width="150" height="70" rx="4" fill="#CDFF00" /><rect x="75" y="60" width="150" height="10" fill="#00000014" />
        <line x1="95" y1="90" x2="200" y2="90" stroke="#252525" strokeOpacity=".25" strokeWidth="2" /><line x1="95" y1="102" x2="180" y2="102" stroke="#252525" strokeOpacity=".25" strokeWidth="2" /></g>
      <g transform="rotate(18 250 60)"><rect x="240" y="20" width="8" height="90" rx="4" fill="#FE00AE" /><path d="M240 20 l8 0 l-4 -14 z" fill="#252525" /></g>
    </svg>
  )
}
