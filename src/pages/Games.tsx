import React, { useEffect, useState } from 'react'
import BreathingWidget from '../components/BreathingWidget'

type Q = { q: string; a: string[]; correct: number; img?: string }

const QUIZ: Q[] = [
  { q: 'A quick way to calm your body is to?', a: ['Scroll social media', 'Hold your breath', 'Exhale longer than inhale'], correct: 2, img:'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=400&q=60' },
  { q: 'A helpful daily habit is to write?', a: ['3 worries', '3 gratitudes', '3 tasks to avoid'], correct: 1, img:'https://images.unsplash.com/photo-1515879218367-8466d910aaa4?w=400&q=60' },
  { q: 'For tension, try a?', a: ['Shoulder stretch', 'Sugary snack', 'All-nighter'], correct: 0, img:'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=400&q=60' },
]

export default function Games(){
  const [i, setI] = useState(0)
  const [score, setScore] = useState(0)
  const [answered, setAnswered] = useState<number | null>(null)
  const [showCTA, setShowCTA] = useState(true)

  useEffect(()=>{
    const t = setTimeout(()=> setShowCTA(false), 3000) // show inhale CTA then auto-hide
    return ()=>clearTimeout(t)
  }, [])

  const done = i >= QUIZ.length

  function pick(k:number){
    setAnswered(k)
    if (k === QUIZ[i].correct) setScore(s => s+1)
    setTimeout(()=>{
      setI(v=>v+1); setAnswered(null)
    }, 800)
  }

  return (
    <div className="grid md:grid-cols-2 gap-6">
      <div className="space-y-3">
        {showCTA && (
          <div className="card">
            <h3 className="font-semibold">Let’s start with an inhale</h3>
            <p className="text-sm text-slate-600 dark:text-slate-400">Follow the circle for one minute — in for 4s, hold 4s, out for 6s.</p>
          </div>
        )}
        <BreathingWidget />
      </div>
      <div className="card">
        <h3 className="font-semibold mb-2">Mini Quiz</h3>
        {!done ? (
          <div>
            {QUIZ[i].img && <img src={QUIZ[i].img} alt="" className="rounded-xl mb-2 w-full h-40 object-cover" />}
            <p className="mb-3">{QUIZ[i].q}</p>
            <div className="space-y-2">
              {QUIZ[i].a.map((opt, k)=>(
                <button key={k} onClick={()=>pick(k)} className={"w-full text-left px-3 py-2 rounded-xl border " + (answered===k ? (k===QUIZ[i].correct?'bg-green-100 dark:bg-green-900/30':'bg-red-100 dark:bg-red-900/30') : '')}>
                  {opt}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div>
            <p className="mb-2">Score: {score} / {QUIZ.length}</p>
            <button className="btn btn-primary" onClick={()=>{ setI(0); setScore(0) }}>Play again</button>
          </div>
        )}
      </div>
    </div>
  )
}
