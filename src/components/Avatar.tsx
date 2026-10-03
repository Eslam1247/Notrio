export default function Avatar({ name, color, size = 56 }: { name: string; color: string; size?: number }) {
  const initial = (name || '?').trim().charAt(0).toUpperCase()
  return <div className="rounded-full grid place-items-center text-white font-bold shrink-0" style={{ width: size, height: size, background: color, fontSize: size * 0.42 }}>{initial}</div>
}
