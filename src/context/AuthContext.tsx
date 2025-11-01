import React, { createContext, useContext, useEffect, useState } from 'react'
import { auth } from '../utils/firebase'
import { GithubAuthProvider, GoogleAuthProvider, onAuthStateChanged, signInWithPopup, signOut } from 'firebase/auth'

type LovedOne = { name: string; whatsapp: string }
type User = { email: string; name: string; lovedOnes: LovedOne[] }

type Ctx = {
  user: User | null
  signup: (email:string, password:string, name:string)=>Promise<void>
  login: (email:string, password:string)=>Promise<void>
  loginWithGithub: ()=>Promise<void>
  loginWithGoogle: ()=>Promise<void>
  logout: ()=>void
  updateLovedOnes: (lovedOnes: LovedOne[])=>void
}

const AuthCtx = createContext<Ctx | null>(null)

const LS_KEY = 'mindmate_user'
const allowDemoAuth = (import.meta as any)?.env?.VITE_ALLOW_DEMO_AUTH === 'true'
const API_BASE = (((import.meta as any)?.env?.VITE_API_BASE as string) || '').replace(/\/$/, '')

async function safeJson(res: Response){
  const ctype = res.headers.get('Content-Type') || ''
  if (ctype.includes('application/json')) {
    try { return await res.json() } catch { return null }
  }
  // Fallback: attempt text to surface server errors
  try { const text = await res.text(); return text ? { error: text } : null } catch { return null }
}

function errToString(x: unknown){
  if (!x) return 'Unknown error'
  if (typeof x === 'string') return x
  if (x instanceof Error) return x.message || 'Unknown error'
  try { return JSON.stringify(x) } catch { return String(x) }
}

function lovedOnesKey(id: string){
  return `${LS_KEY}_${id}`
}

export function AuthProvider({ children }:{ children: React.ReactNode }){
  const [user, setUser] = useState<User | null>(null)

  useEffect(() => {
    // Observe Firebase auth state (if available); fallback to local storage for demo
    let unsub: (()=>void) | undefined
    if (auth) {
      unsub = onAuthStateChanged(auth, (fb) => {
        if (fb) {
          const email = fb.email || 'user@github'
          const name = fb.displayName || email.split('@')[0]
          const id = fb.uid || email
          const lo = localStorage.getItem(lovedOnesKey(id))
          const lovedOnes = lo ? JSON.parse(lo) as LovedOne[] : []
          setUser({ email, name, lovedOnes })
        } else {
          // fallback to previous local user if exists (demo)
          const raw = localStorage.getItem(LS_KEY)
          if (raw) setUser(JSON.parse(raw))
          else setUser(null)
        }
      })
    } else {
      const raw = localStorage.getItem(LS_KEY)
      if (raw) setUser(JSON.parse(raw))
    }
    return () => { if (unsub) unsub() }
  }, [])

  useEffect(() => {
    if (user) {
      // persist demo user and per-identity loved ones
      localStorage.setItem(LS_KEY, JSON.stringify(user))
      const id = user.email
      localStorage.setItem(lovedOnesKey(id), JSON.stringify(user.lovedOnes || []))
    }
  }, [user])

  async function signup(email:string, _password:string, name:string){
    // Try Neon-backed registration
    try {
  const res = await fetch(`${API_BASE}/api/register`, { method: 'POST', headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' }, body: JSON.stringify({ email, password: _password, name }) })
      const data = await safeJson(res)
      if (!res.ok) {
        const raw = (data as any)?.error ?? res.statusText ?? 'Signup failed'
        throw new Error(errToString(raw))
      }
      // store JWT if you need authenticated calls later
      localStorage.setItem('mm_jwt', (data as any).token)
      const newUser: User = { email: (data as any).user.email, name: (data as any).user.name, lovedOnes: [] }
      setUser(newUser)
      return
    } catch (e:any) {
      if (allowDemoAuth) {
        // Demo-only: allow local signup when backend is unavailable
        const newUser: User = { email, name, lovedOnes: [] }
        setUser(newUser)
        return
      }
      const msg = typeof e === 'string' ? e : (e?.message || JSON.stringify(e) || 'Signup failed')
      throw new Error(msg)
    }
  }

  async function login(email:string, _password:string){
    // Try Neon-backed login
    try {
  const res = await fetch(`${API_BASE}/api/login`, { method: 'POST', headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' }, body: JSON.stringify({ email, password: _password }) })
      const data = await safeJson(res)
      if (!res.ok) {
        const raw = (data as any)?.error ?? res.statusText ?? 'Login failed'
        throw new Error(errToString(raw))
      }
      localStorage.setItem('mm_jwt', (data as any).token)
      setUser({ email: (data as any).user.email, name: (data as any).user.name, lovedOnes: [] })
      return
    } catch (e:any) {
      if (allowDemoAuth) {
        // Demo-only: only allow login if a matching demo user exists locally
        const raw = localStorage.getItem(LS_KEY)
        if (raw) {
          const u = JSON.parse(raw)
          if (u.email === email) { setUser(u); return }
        }
      }
      const msg = typeof e === 'string' ? e : (e?.message || JSON.stringify(e) || 'Login failed')
      throw new Error(msg)
    }
  }

  async function loginWithGithub(){
    if (!auth) throw new Error('Auth not initialized')
    const provider = new GithubAuthProvider()
    await signInWithPopup(auth, provider)
    // onAuthStateChanged will set context
  }

  async function loginWithGoogle(){
    if (!auth) throw new Error('Auth not initialized')
    const provider = new GoogleAuthProvider()
    provider.setCustomParameters({ prompt: 'select_account' })
    await signInWithPopup(auth, provider)
  }

  function logout(){
    if (auth) signOut(auth).catch(()=>{/* ignore */})
    setUser(null)
    localStorage.removeItem(LS_KEY)
    localStorage.removeItem('mm_jwt')
  }

  function updateLovedOnes(lovedOnes: LovedOne[]){
    if (!user) return
    setUser({ ...user, lovedOnes })
  }

  return <AuthCtx.Provider value={{ user, signup, login, loginWithGithub, loginWithGoogle, logout, updateLovedOnes }}>{children}</AuthCtx.Provider>
}

export function useAuth(){
  const v = useContext(AuthCtx)
  if (!v) throw new Error('AuthContext missing')
  return v
}
