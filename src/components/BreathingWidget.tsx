import React, { useEffect, useState } from 'react'

export default function BreathingWidget() {
  const [phase, setPhase] = useState<'Inhale'|'Hold'|'Exhale'>('Inhale')
  const [count, setCount] = useState(4)

  useEffect(() => {
    const seq: Array<{p:'Inhale'|'Hold'|'Exhale', d:number}> = [
      { p: 'Inhale', d: 4 }, { p: 'Hold', d: 4 }, { p: 'Exhale', d: 6 }
    ]
    let i = 0
    let c = seq[i].d
    setPhase(seq[i].p as any); setCount(c)
    const timer = setInterval(() => {
      c -= 1
      if (c <= 0) {
        i = (i + 1) % seq.length
        c = seq[i].d
        setPhase(seq[i].p as any)
      }
      setCount(c)
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  return (
    <div className="card flex flex-col items-center text-center">
      <div className="w-40 h-40 rounded-full border-8 border-slate-200 dark:border-slate-800 flex items-center justify-center my-4 transition-all"
        style={{ transform: phase === 'Inhale' ? 'scale(1.1)' : phase==='Exhale' ? 'scale(0.9)' : 'scale(1.0)'}}>
        <span className="text-2xl">{count}</span>
      </div>
      <h3 className="font-semibold">{phase}</h3>
      <p className="text-sm text-slate-500 dark:text-slate-400">Box breathing to reduce stress.</p>
    </div>
  )
}
