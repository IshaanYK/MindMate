import React, { useEffect, useState } from 'react'

type Item = { title: string; link: string; source: string }

async function fetchRSS(url: string): Promise<Item[]> {
  const res = await fetch(`https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`)
  const text = await res.text()
  const parser = new DOMParser()
  const doc = parser.parseFromString(text, 'text/xml')
  const items = Array.from(doc.querySelectorAll('item')).slice(0, 9)
  return items.map(it => ({
    title: it.querySelector('title')?.textContent || 'Untitled',
    link: it.querySelector('link')?.textContent || '#',
    source: new URL(url).hostname.replace('www.','')
  }))
}

export default function News(){
  const [items, setItems] = useState<Item[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(()=>{
    (async () => {
      try {
        const a = await fetchRSS('https://www.goodnewsnetwork.org/feed/')
        const b = await fetchRSS('https://www.positive.news/feed/')
        setItems([...a, ...b].slice(0,12))
      } catch (e) {
        console.error(e)
      } finally {
        setLoading(false)
      }
    })()
  }, [])

  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
      {loading ? (
        Array.from({ length: 6 }).map((_,i)=>(
          <div key={i} className="card h-28 animate-pulse" />
        ))
      ) : (
        items.map((n, i)=>(
          <a key={i} href={n.link} target="_blank" className="card group hover:shadow-lg transition relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-forest-200/20 to-mint/20 dark:from-forest-900/10 dark:to-forest-800/10 pointer-events-none" />
            <h3 className="font-semibold group-hover:underline">{n.title}</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{n.source}</p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">Curated positive updates that hint at a brighter future.</p>
          </a>
        ))
      )}
    </div>
  )
}
