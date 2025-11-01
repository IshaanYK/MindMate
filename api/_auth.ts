import { SignJWT, jwtVerify } from 'jose'
import bcrypt from 'bcryptjs'

const secret = process.env.AUTH_JWT_SECRET
if (!secret) throw new Error('AUTH_JWT_SECRET is not set')
const secretKey = new TextEncoder().encode(secret)

export async function hashPassword(password: string){
  return await bcrypt.hash(password, 10)
}

export async function verifyPassword(password: string, hash: string){
  return await bcrypt.compare(password, hash)
}

export async function signToken(payload: Record<string, unknown>){
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('30d')
    .sign(secretKey)
}

export async function verifyToken(token: string){
  const { payload } = await jwtVerify(token, secretKey)
  return payload
}
