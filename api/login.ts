import { ensureSchema, sql } from './_db.js'
import { verifyPassword, signToken } from './_auth.js'
import { z } from 'zod'

export default async function handler(req: Request) {
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method Not Allowed' }), { status: 405, headers: { 'Content-Type': 'application/json' } })
  }
  try {
    await ensureSchema()
    const body = await req.json()
    const schema = z.object({ email: z.string().email(), password: z.string().min(8) })
    const { email, password } = schema.parse(body)

    const rows = await sql`SELECT id, email, name, password_hash FROM users WHERE email = ${email}` as any
    const user = rows[0]
    if (!user) return new Response(JSON.stringify({ error: 'Invalid credentials' }), { status: 401 })
    const ok = await verifyPassword(password, user.password_hash)
    if (!ok) return new Response(JSON.stringify({ error: 'Invalid credentials' }), { status: 401 })

    const token = await signToken({ sub: user.id, email: user.email })
    delete user.password_hash
    return new Response(JSON.stringify({ token, user }), { status: 200, headers: { 'Content-Type': 'application/json' } })
  } catch (e: any) {
    const msg = e?.message || 'Invalid request'
    return new Response(JSON.stringify({ error: msg }), { status: 400, headers: { 'Content-Type': 'application/json' } })
  }
}

export const config = { runtime: 'nodejs' }
