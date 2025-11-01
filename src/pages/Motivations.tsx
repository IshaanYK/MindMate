import React from 'react'

const STORIES = [
  {
    name: 'J.K. Rowling',
    text: 'Before Harry Potter, she faced years of rejection and personal hardship. She kept writing through uncertainty, proving that persistence can transform a low point into a turning point.'
  },
  {
    name: 'Steve Jobs',
    text: 'He was fired from the company he founded, then used that setback to learn, rebuild, and return stronger — a reminder that a detour can shape your best work.'
  },
  {
    name: 'Oprah Winfrey',
    text: 'Early career setbacks and adversity didn’t define her. Compassion, consistency, and self-belief did. She turned vulnerability into connection.'
  },
  {
    name: 'Malala Yousafzai',
    text: 'She transformed pain into purpose, advocating for education with courage. Even small steps toward what matters are powerful.'
  },
]

export default function Motivations(){
  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
      {STORIES.map((s, i)=>(
        <div
          key={i}
          className="card transition-transform hover:shadow-lg hover:-translate-y-0.5"
          style={{ perspective: '800px' }}
        >
          <div className="rounded-xl p-2 bg-gradient-to-br from-forest-100/70 to-mint/40 dark:from-forest-900/30 dark:to-forest-800/20">
            <div className="bg-white/70 dark:bg-slate-900/60 rounded-xl p-4"
                 style={{ transform: 'rotateX(2deg) rotateY(-2deg)' }}>
              <h3 className="font-semibold">{s.name}</h3>
              <p className="text-sm text-slate-700 dark:text-slate-300">{s.text}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
