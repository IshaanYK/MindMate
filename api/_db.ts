import { neon } from '@neondatabase/serverless'

const rawUrl = process.env.NEON_DATABASE_URL
if (!rawUrl) {
  throw new Error('NEON_DATABASE_URL is not set')
}

function normalizeNeonUrl(u: string){
  try {
    const p = new URL(u)
    // Remove connection params not applicable to HTTP driver
    p.searchParams.delete('channel_binding')
    return p.toString()
  } catch {
    return u
  }
}

export const sql = neon(normalizeNeonUrl(rawUrl))

export async function ensureSchema(){
  // Prefer UUID via pgcrypto, but fall back to text id if extension creation isn't allowed
  let uuidOk = true
  try {
    await sql`CREATE EXTENSION IF NOT EXISTS pgcrypto;`
  } catch {
    uuidOk = false
  }
  if (uuidOk) {
    await sql`
      CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        email TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        name TEXT NOT NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT now()
      );
    `
  } else {
    // md5() is available without pgcrypto; generates a 32-char hex string
    await sql`
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY DEFAULT md5(random()::text || clock_timestamp()::text),
        email TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        name TEXT NOT NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT now()
      );
    `
  }
}
