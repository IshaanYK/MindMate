import { ensureSchema, sql } from './_db.js'
import { hashPassword, signToken } from './_auth.js'
import { z } from 'zod'

export default async function handler(req: Request) {
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method Not Allowed' }), { status: 405, headers: { 'Content-Type': 'application/json' } })
  }
  try {
    await ensureSchema()
    const body = await req.json()
    const schema = z.object({
      email: z.string().email(),
      password: z.string().min(8),
      name: z.string().min(1).max(100),
    })
    const { email, password, name } = schema.parse(body)

    const existing = await sql`SELECT id FROM users WHERE email = ${email}`
    if (existing.length > 0) {
      return new Response(JSON.stringify({ error: 'Email already registered' }), { status: 409 })
    }

    const password_hash = await hashPassword(password)
    const rows = await sql`INSERT INTO users (email, password_hash, name)
                           VALUES (${email}, ${password_hash}, ${name})
                           RETURNING id, email, name, created_at` as any
    const user = rows[0]
    const token = await signToken({ sub: user.id, email: user.email })
    return new Response(JSON.stringify({ token, user }), { status: 201, headers: { 'Content-Type': 'application/json' } })
  } catch (e: any) {
    const msg = e?.message || 'Invalid request'
    return new Response(JSON.stringify({ error: msg }), { status: 400, headers: { 'Content-Type': 'application/json' } })
  }
}

export const config = { runtime: 'nodejs' }
