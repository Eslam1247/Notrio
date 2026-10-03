import { useEffect } from 'react'
// Sets document.title and the meta description for the current page. Call once per page component.
export function useSEO(title: string, description?: string) {
  useEffect(() => {
    const prevTitle = document.title
    document.title = title ? `${title} · Notrio` : 'Notrio'
    let meta = document.querySelector('meta[name="description"]') as HTMLMetaElement | null
    const prevDesc = meta?.content
    if (description) {
      if (!meta) { meta = document.createElement('meta'); meta.name = 'description'; document.head.appendChild(meta) }
      meta.content = description
    }
    return () => { document.title = prevTitle; if (meta && prevDesc !== undefined) meta.content = prevDesc }
  }, [title, description])
}
