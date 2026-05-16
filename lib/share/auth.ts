// lib/share/auth.ts
// Server-only. Do NOT import from a client component.
//
// Password hashing: scrypt with random salt, hex-encoded.
// Unlock cookie: single cookie `share_unlock`. Slug is inside the signed
// payload (last-write-wins across slugs is acceptable v1).
// Payload format: `${slug}.${expiresAtMs}.${hmacHex}`.
// HMAC-SHA256 over `${slug}.${expiresAtMs}` using SHARE_LINK_SECRET.
// TTL: 1 hour from issue.

import { randomBytes, scryptSync, timingSafeEqual, createHmac } from 'crypto'

const SCRYPT_KEYLEN = 64
const COOKIE_TTL_MS = 60 * 60 * 1000 // 1 hour

export const UNLOCK_COOKIE_NAME = 'share_unlock'
export const UNLOCK_COOKIE_MAX_AGE_SECONDS = COOKIE_TTL_MS / 1000

export function hashPassword(plain: string): { hash: string; salt: string } {
  if (typeof plain !== 'string' || plain.length === 0) {
    throw new Error('Password must be a non-empty string')
  }
  const salt = randomBytes(16).toString('hex')
  const hash = scryptSync(plain, salt, SCRYPT_KEYLEN).toString('hex')
  return { hash, salt }
}

export function verifyPassword(plain: string, hash: string, salt: string): boolean {
  if (typeof plain !== 'string' || typeof hash !== 'string' || typeof salt !== 'string') return false
  if (hash.length === 0 || salt.length === 0) return false
  try {
    const candidate = scryptSync(plain, salt, SCRYPT_KEYLEN)
    const known = Buffer.from(hash, 'hex')
    if (candidate.length !== known.length) return false
    return timingSafeEqual(candidate, known)
  } catch {
    return false
  }
}

function getSecret(): string {
  const s = process.env.SHARE_LINK_SECRET
  if (!s || s.length < 16) {
    throw new Error('SHARE_LINK_SECRET missing or too short')
  }
  return s
}

export function signUnlockCookie(slug: string): string {
  if (!/^[a-z0-9-]{1,128}$/.test(slug)) {
    throw new Error('Invalid slug for cookie signing')
  }
  const secret = getSecret()
  const expiresAt = Date.now() + COOKIE_TTL_MS
  const payload = `${slug}.${expiresAt}`
  const hmac = createHmac('sha256', secret).update(payload).digest('hex')
  return `${payload}.${hmac}`
}

export function readUnlockCookie(cookieValue: string | undefined, slug: string): boolean {
  if (!cookieValue || typeof cookieValue !== 'string') return false
  if (!/^[a-z0-9-]{1,128}$/.test(slug)) return false
  const parts = cookieValue.split('.')
  if (parts.length !== 3) return false
  const [cookieSlug, expiresAtStr, hmacHex] = parts
  if (cookieSlug !== slug) return false
  const expiresAt = Number(expiresAtStr)
  if (!Number.isFinite(expiresAt) || expiresAt <= Date.now()) return false
  try {
    const secret = getSecret()
    const expected = createHmac('sha256', secret).update(`${cookieSlug}.${expiresAtStr}`).digest('hex')
    const a = Buffer.from(hmacHex, 'hex')
    const b = Buffer.from(expected, 'hex')
    if (a.length !== b.length) return false
    return timingSafeEqual(a, b)
  } catch {
    return false
  }
}
