import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { hashPassword } from '@/lib/auth-utils'
import { ResetPasswordSchema, formatZodError } from '@/lib/schemas'
import { rateLimit, getClientIp } from '@/lib/rate-limit'

/**
 * POST /api/auth/reset-password
 * Validate a one-time reset token and set a new password.
 */
export async function POST(request: NextRequest) {
  const ip = getClientIp(request);
  const rl = rateLimit(`reset-password:${ip}`, 5, 60_000);
  if (!rl.allowed) {
    return NextResponse.json({ error: 'Too many requests, try again later' }, { status: 429, headers: { 'Retry-After': String(Math.ceil((rl.resetAt - Date.now())/1000)) } });
  }

  const raw = await request.json().catch(() => ({}))
  const parsed = ResetPasswordSchema.safeParse(raw)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Validation failed', details: formatZodError(parsed.error) }, { status: 400 })
  }
  const { token, password } = parsed.data

  if (password.length < 8 || !/[A-Z]/.test(password) || !/[0-9]/.test(password)) {
    return NextResponse.json({ error: 'Password must be 8+ chars with uppercase and number' }, { status: 400 })
  }

  const vt = await prisma.verificationToken.findUnique({ where: { token } })

  if (!vt || !vt.identifier.startsWith('reset:') || vt.expires < new Date()) {
    return NextResponse.json({ error: 'Invalid or expired reset link' }, { status: 400 })
  }

  const email = vt.identifier.replace(/^reset:/, '')

  const user = await prisma.user.findUnique({ where: { email } })
  if (!user || !user.password) {
    return NextResponse.json({ error: 'Invalid or expired reset link' }, { status: 400 })
  }

  // Single-use token — consume before updating so a race can't reuse it
  await prisma.verificationToken.delete({ where: { token } })

  const hashedPassword = await hashPassword(password)
  await prisma.user.update({ where: { email }, data: { password: hashedPassword } })

  return NextResponse.json({ message: 'Password reset successfully. You can now sign in.' })
}