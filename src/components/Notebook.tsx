import { CSSProperties, useState } from 'react'
import { Pattern } from '../data/products'
interface Props { id?: string; color: string; title?: string; pattern?: Pattern; className?: string; style?: CSSProperties }
// Drop a real photo at /public/products/<id>.jpg (3:4) and it's used automatically; otherwise this illustration renders.
export default function Notebook({ id, color, title, pattern = 'lines', className = '', style }: Props) {
  const [failed, setFailed] = useState(false)
  if (id && !failed) return <img src={`/products/${id}.jpg`} alt={title || id} onError={() => setFailed(true)} loading="lazy" className={`aspect-[3/4] w-full object-cover rounded-md ${className}`} style={style} />
  const ruleColor = pattern === 'blank' ? 'transparent' : 'rgba(255,255,255,.34)'
  const bg = pattern === 'grid' ? `linear-gradient(${ruleColor} 1px,transparent 1px),linear-gradient(90deg,${ruleColor} 1px,transparent 1px)` : `repeating-linear-gradient(0deg,${ruleColor} 0 1px,transparent 1px 13px)`
  return (
    <div className={`nb relative aspect-[3/4] rounded-[4px] ${className}`}
      style={{ background: `linear-gradient(155deg, rgba(255,255,255,.16), rgba(0,0,0,.08) 55%), ${color}`, boxShadow: 'inset 0 0 0 1px rgba(0,0,0,.08), 0 18px 30px -18px rgba(0,0,0,.5)', ...style }}>
      {/* elastic band */}
      <div className="absolute top-0 bottom-0 left-[9%] w-[3.5%] bg-black/20 rounded-full" />
      {/* spine shadow */}
      <div className="absolute top-0 bottom-0 right-0 w-[10%]" style={{ background: 'linear-gradient(90deg, transparent, rgba(0,0,0,.28))' }} />
      {/* corner page-edge hint */}
      <div className="absolute bottom-0 left-0 right-[8%] h-[6%] rounded-bl-[4px]" style={{ background: 'repeating-linear-gradient(90deg, rgba(255,255,255,.5) 0 1px, transparent 1px 3px)', opacity: .35 }} />
      {title && <div className="absolute top-[16%] right-[24%] left-[16%] text-white text-[.72em] font-semibold leading-tight drop-shadow-sm">{title}</div>}
      {pattern !== 'blank' && <div className="absolute left-[16%] right-[24%] bottom-[11%] h-[34%] opacity-90" style={{ backgroundImage: bg, backgroundSize: pattern === 'grid' ? '13px 13px' : undefined }} />}
      {/* glossy highlight */}
      <div className="absolute inset-0 rounded-[4px]" style={{ background: 'linear-gradient(115deg, rgba(255,255,255,.22) 0%, transparent 22%)' }} />
    </div>
  )
}
