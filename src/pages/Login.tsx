import React, { useState } from 'react'
import { useAuth } from '../context/AuthContext'

export default function Login(){
  const { login } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string| null>(null)

  async function onSubmit(e: React.FormEvent){
    e.preventDefault()
    setError(null)
    try { await login(email, password) } catch (e:any){ setError(e.message) }
  }

  return (
    <div className="max-w-md mx-auto card">
      <h2 className="text-xl font-semibold mb-4">Log in</h2>
      <form onSubmit={onSubmit} className="space-y-3">
        <input className="w-full border rounded-xl px-3 py-2 bg-white/70 dark:bg-slate-900/50" placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)} />
        <input className="w-full border rounded-xl px-3 py-2 bg-white/70 dark:bg-slate-900/50" type="password" placeholder="Password" value={password} onChange={e=>setPassword(e.target.value)} />
        {error && <p className="text-red-600 text-sm">{error}</p>}
        <button className="w-full btn btn-primary">Continue</button>
      </form>
      <p className="text-xs text-slate-500 dark:text-slate-400 mt-4">
        Demo only — do not use real passwords. Authentication can be swapped to Firebase later.
      </p>
    </div>
  )
}
