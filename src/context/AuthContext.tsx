import React, { createContext, useContext, useEffect, useState } from 'react'

type LovedOne = { name: string; whatsapp: string }
type User = { email: string; name: string; lovedOnes: LovedOne[] }

type Ctx = {
  user: User | null
  signup: (email:string, password:string, name:string)=>Promise<void>
  login: (email:string, password:string)=>Promise<void>
  logout: ()=>void
  updateLovedOnes: (lovedOnes: LovedOne[])=>void
}

const AuthCtx = createContext<Ctx | null>(null)

const LS_KEY = 'mindmate_user'

export function AuthProvider({ children }:{ children: React.ReactNode }){
  const [user, setUser] = useState<User | null>(null)

  useEffect(() => {
    const raw = localStorage.getItem(LS_KEY)
    if (raw) setUser(JSON.parse(raw))
  }, [])

  useEffect(() => {
    if (user) localStorage.setItem(LS_KEY, JSON.stringify(user))
  }, [user])

  async function signup(email:string, _password:string, name:string){
    const newUser: User = { email, name, lovedOnes: [] }
    setUser(newUser)
  }

  async function login(email:string, _password:string){
    const raw = localStorage.getItem(LS_KEY)
    if (raw) {
      const u = JSON.parse(raw)
      if (u.email === email) { setUser(u); return }
    }
    setUser({ email, name: email.split('@')[0], lovedOnes: [] })
  }

  function logout(){ setUser(null); localStorage.removeItem(LS_KEY) }

  function updateLovedOnes(lovedOnes: LovedOne[]){
    if (!user) return
    setUser({ ...user, lovedOnes })
  }

  return <AuthCtx.Provider value={{ user, signup, login, logout, updateLovedOnes }}>{children}</AuthCtx.Provider>
}

export function useAuth(){
  const v = useContext(AuthCtx)
  if (!v) throw new Error('AuthContext missing')
  return v
}
