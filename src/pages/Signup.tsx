import React, { useState } from 'react'
import { useAuth } from '../context/AuthContext'

type Loved = { name: string; email: string; mobile: string }

export default function Signup(){
  const { signup, loginWithGithub, loginWithGoogle, updateLovedOnes, user } = useAuth()
  const [name, setName] = useState('')
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [mobile, setMobile] = useState('')
  const [password, setPassword] = useState('')
  const [loved, setLoved] = useState<Loved[]>([{ name:'', email:'', mobile:'' }, { name:'', email:'', mobile:'' }])
  const [agree, setAgree] = useState(false)
  const [error, setError] = useState<string| null>(null)

  async function onSubmit(e: React.FormEvent){
    e.preventDefault()
    setError(null)
    if (!agree) { setError('Please agree to the consent terms to continue.'); return }
  try { await signup(email, password, name || username || email) } catch (e:any){ setError(e?.message || String(e)) }
  }

  async function onGithubSignup(){
    setError(null)
    if (!agree) { setError('Please agree to the consent terms to continue.'); return }
    try {
      await loginWithGithub()
      // After auth state updates, persist loved ones captured in form (if any)
      const mapped = loved
        .filter(l => l.name || l.mobile)
        .map(l => ({ name: l.name || l.email || 'Loved One', whatsapp: l.mobile || '' }))
      if (mapped.length) updateLovedOnes(mapped)
    } catch (e:any){
      setError(e?.message || 'GitHub sign-up failed')
    }
  }

  async function onGoogleSignup(){
    setError(null)
    if (!agree) { setError('Please agree to the consent terms to continue.'); return }
    try {
      await loginWithGoogle()
      const mapped = loved
        .filter(l => l.name || l.mobile)
        .map(l => ({ name: l.name || l.email || 'Loved One', whatsapp: l.mobile || '' }))
      if (mapped.length) updateLovedOnes(mapped)
    } catch (e:any){
      setError(e?.message || 'Google sign-up failed')
    }
  }

  return (
    <div className="max-w-2xl mx-auto card">
      <h2 className="text-xl font-semibold mb-4">Create your account</h2>
      <form onSubmit={onSubmit} className="space-y-4">
        <div className="grid md:grid-cols-2 gap-3">
          <input className="border rounded-xl px-3 py-2 bg-white/70 dark:bg-slate-900/50" placeholder="Full name" value={name} onChange={e=>setName(e.target.value)} />
          <input className="border rounded-xl px-3 py-2 bg-white/70 dark:bg-slate-900/50" placeholder="Preferred username" value={username} onChange={e=>setUsername(e.target.value)} />
        </div>
        <div className="grid md:grid-cols-2 gap-3">
          <input className="border rounded-xl px-3 py-2 bg-white/70 dark:bg-slate-900/50" placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)} />
          <input className="border rounded-xl px-3 py-2 bg-white/70 dark:bg-slate-900/50" placeholder="Mobile (+91...)" value={mobile} onChange={e=>setMobile(e.target.value)} />
        </div>
        <input className="w-full border rounded-xl px-3 py-2 bg-white/70 dark:bg-slate-900/50" type="password" placeholder="Password" value={password} onChange={e=>setPassword(e.target.value)} />

        <div className="rounded-xl border p-3">
          <h3 className="font-semibold mb-2">Loved-one contacts (Parent Control)</h3>
          <p className="text-xs text-slate-600 dark:text-slate-400 mb-3">Add two trusted recipients for monthly summaries and urgent alerts (with your consent).</p>
          <div className="grid md:grid-cols-2 gap-3">
            {loved.map((l, i)=>(
              <div key={i} className="space-y-2">
                <input className="w-full border rounded-xl px-3 py-2 bg-white/70 dark:bg-slate-900/50" placeholder="Name" value={l.name} onChange={e=>{ const v=[...loved]; v[i].name=e.target.value; setLoved(v) }} />
                <input className="w-full border rounded-xl px-3 py-2 bg-white/70 dark:bg-slate-900/50" placeholder="Email" value={l.email} onChange={e=>{ const v=[...loved]; v[i].email=e.target.value; setLoved(v) }} />
                <input className="w-full border rounded-xl px-3 py-2 bg-white/70 dark:bg-slate-900/50" placeholder="Mobile (+91...)" value={l.mobile} onChange={e=>{ const v=[...loved]; v[i].mobile=e.target.value; setLoved(v) }} />
              </div>
            ))}
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
            By default, monthly wellbeing summaries are prepared for you to share. Automated sending and crisis alerts to contacts or authorities require explicit consent and a verified phone/API on your account.
          </p>
        </div>

        <label className="flex items-start gap-2 text-sm">
          <input type="checkbox" checked={agree} onChange={e=>setAgree(e.target.checked)} className="mt-1" />
          <span>
            I agree that MindMate may prepare monthly summaries of my mental/physical wellness and, if I choose to enable it later, send them to my loved ones.<br/>
            In an emergency (risk of self-harm), I understand that I can enable an alert workflow to notify my loved ones and appropriate local resources in India (e.g., government-supported mental health lines). This demo does <b>not</b> automatically contact anyone.
          </span>
        </label>

        {error && <p className="text-red-600 text-sm">{error}</p>}
        <button className="w-full btn btn-primary" disabled={!agree}>Create account</button>
        <div className="my-4 flex items-center gap-3">
          <div className="h-px bg-slate-200 dark:bg-slate-800 flex-1"/>
          <span className="text-xs text-slate-500 dark:text-slate-400">or</span>
          <div className="h-px bg-slate-200 dark:bg-slate-800 flex-1"/>
        </div>
  <button type="button" onClick={onGithubSignup} className="w-full px-3 py-2 rounded-xl border btn-outline">Sign up with GitHub</button>
  <div className="h-2"/>
  <button type="button" onClick={onGoogleSignup} className="w-full px-3 py-2 rounded-xl border btn-outline">Sign up with Google</button>
        <p className="text-xs text-slate-500 dark:text-slate-400">This is a demo — not a medical device. For emergencies in India, call 112 or visit the Ministry of Health resources.</p>
      </form>
    </div>
  )
}
