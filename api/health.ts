import { ensureSchema, sql } from './_db.js'

export default async function handler(_req: Request) {
  try {
    await ensureSchema()
    // Check table exists and return a tiny status
    const exists = await sql`SELECT to_regclass('public.users') as t` as any
    let userCount = 0
    if (exists[0]?.t) {
      const cnt = await sql`SELECT count(*)::int as c FROM users` as any
      userCount = cnt?.[0]?.c ?? 0
    }
    return new Response(JSON.stringify({ ok: true, users: userCount }), { status: 200, headers: { 'Content-Type': 'application/json' } })
  } catch (e: any) {
    return new Response(JSON.stringify({ ok: false, error: e?.message || 'Health check failed' }), { status: 500, headers: { 'Content-Type': 'application/json' } })
  }
}

export const config = { runtime: 'nodejs' }
