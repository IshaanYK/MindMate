import React, { useEffect, useRef, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { analyzeSentiment } from '../utils/modelApi'
import { videosForMood } from '../utils/youtube'
import { isCrisis, waLink } from '../utils/crisis'
import { useAuth } from '../context/AuthContext'

type Msg = { from: 'user'|'bot'; text: string; ts: number }
type Pending = { kind: 'typing'; ts: number } | null

// Render message text with clickable links while preserving line breaks
function renderTextWithLinks(text: string): React.ReactNode {
  const lines = text.split('\n')
  return lines.map((line, i) => {
    const parts = line.split(/(https?:\/\/[^\s]+)/i)
    const nodes = parts.map((part, j) => {
      if (/^https?:\/\//i.test(part)) {
        return (
          <a key={`l-${i}-${j}`} href={part} target="_blank" rel="noopener noreferrer" className="underline">
            {part}
          </a>
        )
      }
      return <React.Fragment key={`t-${i}-${j}`}>{part}</React.Fragment>
    })
    return (
      <React.Fragment key={`line-${i}`}>
        {nodes}
        {i < lines.length - 1 ? <br /> : null}
      </React.Fragment>
    )
  })
}

export default function Chat(){
  const { bot } = useParams()
  const pick = (bot === 'eve' ? 'eve' : 'adem') as 'adem'|'eve'
  const [input, setInput] = useState('')
  const [msgs, setMsgs] = useState<Msg[]>([{
    from:'bot',
    text: `${pick==='adem'?'🧠 Adem':'🌿 Eve'}: Hi! I'm here, what's up?`,
    ts: Date.now()
  }])
  const [crisis, setCrisis] = useState<string | null>(null)
  const { user } = useAuth()
  const bottomRef = useRef<HTMLDivElement>(null)
  const [pending, setPending] = useState<Pending>(null)

  useEffect(()=>{ bottomRef.current?.scrollIntoView({ behavior:'smooth' }) }, [msgs])

  async function send(){
    if (!input.trim()) return
    const text = input.trim()
    setMsgs(m => [...m, { from:'user', text, ts: Date.now() }])
    setInput('')
    if (isCrisis(text)){
      setCrisis(text)
    }
    setPending({ kind:'typing', ts: Date.now() })
    try {
      const res = await analyzeSentiment(text)
      const base = pick === 'adem' ? '🧠 Adem' : '🌿 Eve'
      // Urgent crisis detection (India resources)
      const crisisRegex = /(suicid|kill myself|end my life|want to die|i want to die|i will kill myself|i am going to kill myself|self[- ]?harm|cut myself|jump off|can'?t go on|ending it|end it all|life isn'?t worth)/i
      const urgentCrisis = isCrisis(text) || crisisRegex.test(text)
      if (urgentCrisis){
        const reply = [
          `${base}: I'm taking what you said very seriously. It sounds like you're in a lot of pain, and I'm genuinely worried about you.`,
          `Your safety is the most important thing. You are not alone, and there are people who can help you right now.`,
          `Please reach out to one of these 24/7, free resources in India (call or text):`,
          `• Emergency — Call 112`,
          `• KIRAN Mental Health Helpline — 1800-599-0019 (24×7, toll‑free)`,
          `• AASRA — +91-22-27546669 (24×7)`,
          `• Vandrevala Foundation — +91-9999-666-555`,
          `If any number doesn’t connect, please try again or search “India suicide helpline” for the latest options. I’m still here with you.`,
        ].join('\n\n')
        setMsgs(m => [...m, { from:'bot', text: reply, ts: Date.now() }])
        setCrisis(text)
        return
      }

      // Choose a single curated video per mood to avoid clutter
      const vids = videosForMood(res.label as any)
      const videoId = vids[Math.floor(Math.random()*vids.length)]

      let reply: string
      if (res.label === 'positive' && res.confidence > 0.90) {
        const human = [
          `${base}: That's wonderful to hear. What was the highlight?`,
          `${base}: Love that. Take a moment to soak it in — you deserve it.`,
          `${base}: Amazing. Hold onto that feeling — what made it special?`,
        ]
        const pickOne = human[Math.floor(Math.random()*human.length)]
        reply = [
          `${pickOne}`,
          `Optional 60‑sec nudge: jot two small gratitudes.`,
          `Watch: https://youtu.be/${videoId}`,
        ].join('\n')
      } else if (res.label === 'negative' && res.confidence > 0.90) {
        const human = [
          `${base}: I'm really sorry — that sounds heavy. I'm here.`,
          `${base}: That’s tough. Your feelings make sense, and you’re not alone.`,
          `${base}: I’m with you. Want to vent a bit or try a quick reset?`,
        ]
        const pickOne = human[Math.floor(Math.random()*human.length)]
        reply = [
          `${pickOne}`,
          `Quick reset: try 5‑4‑3‑2‑1 grounding or one minute of box breathing.`,
          `Guided support: https://youtu.be/${videoId}`,
        ].join('\n')
      } else {
        const human = [
          `${base}: Got it — one of those “meh” days happens.`,
          `${base}: Totally fine to have a quieter day.`,
          `${base}: Thanks for checking in. Want something tiny to shift the vibe?`,
        ]
        const pickOne = human[Math.floor(Math.random()*human.length)]
        reply = [
          `${pickOne}`,
          `Tiny nudge: find 3 new little things around you in 5 minutes.`,
          `Optional background: https://youtu.be/${videoId}`,
        ].join('\n')
      }

      setMsgs(m => [...m, { from:'bot', text: reply, ts: Date.now() }])
      if ((res.label === 'negative' && res.confidence >= 0.9) || (/suicid|kill|end it|hopeless|worthless|i'm done|im done|done with life/i.test(text))) {
        setCrisis(text)
      }
    } catch (e) {
      const base = pick === 'adem' ? '🧠 Adem' : '🌿 Eve'
      setMsgs(m => [...m, { from:'bot', text: `${base}: I’m here. Let’s try a 3‑minute breathing exercise together? If you’d like, open Games for a calming start.`, ts: Date.now() }])
    } finally {
      setPending(null)
    }
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="card">
        <div className="h-[60vh] overflow-y-auto space-y-3">
          {msgs.map((m, i)=>(
            <div key={i} className={"max-w-[80%] px-3 py-2 rounded-2xl " + (m.from==='user' ? 'bg-forest-100 dark:bg-forest-900/30 ml-auto' : 'bg-slate-100 dark:bg-slate-800/80')}>
              <p className="text-sm">{renderTextWithLinks(m.text)}</p>
            </div>
          ))}
          {pending && (
            <div className="max-w-[60%] px-3 py-2 rounded-2xl bg-slate-100 dark:bg-slate-800/80">
              <p className="text-sm text-slate-500">Typing…</p>
            </div>
          )}
          <div ref={bottomRef} />
        </div>
        <div className="mt-3 flex gap-2">
          <input className="flex-1 border rounded-xl px-3 py-2 bg-white/70 dark:bg-slate-900/50" placeholder="Type how you feel..." value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=>{ if (e.key==='Enter') send() }} />
          <button onClick={send} className="btn btn-primary" disabled={!!pending}>Send</button>
        </div>
      </div>
      <div className="mt-3 text-sm text-slate-600 dark:text-slate-400">
        Tip: You can explore recommendations in <Link to="/games" className="underline">Games</Link> anytime.
      </div>
      {crisis && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4">
          <div className="card max-w-md">
            <h3 className="font-semibold mb-2">You matter. Let’s get support.</h3>
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">Your message suggests you might be in distress. Consider reaching out to someone you trust or local emergency services immediately.</p>
            <div className="mb-3 text-sm">
              <p className="font-medium mb-1">India — 24/7 Free Resources</p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Emergency — Call <b>112</b></li>
                <li>KIRAN Mental Health Helpline — <b>1800-599-0019</b> (24×7, toll‑free)</li>
                <li>AASRA — <b>+91-22-27546669</b> (24×7)</li>
                <li>Vandrevala Foundation — <b>+91-9999-666-555</b></li>
              </ul>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">If a number doesn’t connect, try again or search “India suicide helpline” for the latest options.</p>
            </div>
            {user?.lovedOnes?.length ? (
              <div className="space-y-2">
                <p className="text-sm">Send a WhatsApp message to:</p>
                {user.lovedOnes.map((l,i)=> (
                  <a key={i} className="block px-3 py-2 rounded-xl border hover:bg-slate-50 dark:hover:bg-slate-800" target="_blank"
                    href={waLink(l.whatsapp, `This is ${user.name}. I need support right now. Can we talk?`)}>
                    {l.name} ({l.whatsapp})
                  </a>
                ))}
              </div>
            ) : (
              <p className="text-sm text-slate-600 dark:text-slate-400">Add loved-one contacts in your Dashboard to enable quick alerts.</p>
            )}
            <div className="flex gap-2 mt-3">
              <a className="px-3 py-2 rounded-xl border btn-outline" href="tel:112">Call emergency</a>
              <button className="btn btn-primary" onClick={()=>setCrisis(null)}>I’m safe</button>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-3">This demo does not automatically notify anyone. Automated messaging requires consent and WhatsApp Business API.</p>
          </div>
        </div>
      )}
    </div>
  )
}
