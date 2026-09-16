import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { ForgotPasswordSchema, formatZodError } from '@/lib/schemas'
import { rateLimit, getClientIp } from '@/lib/rate-limit'
import crypto from 'crypto'

/**
 * POST /api/auth/forgot-password
 * Generate a one-time password reset token and email a reset link.
 * Always returns the same response whether or not the email exists
 * (no account enumeration).
 */
export async function POST(request: NextRequest) {
  const ip = getClientIp(request);
  const rl = rateLimit(`forgot-password:${ip}`, 5, 60_000);
  if (!rl.allowed) {
    return NextResponse.json({ error: 'Too many requests, try again later' }, { status: 429, headers: { 'Retry-After': String(Math.ceil((rl.resetAt - Date.now())/1000)) } });
  }

  const raw = await request.json().catch(() => ({}))
  const parsed = ForgotPasswordSchema.safeParse(raw)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Validation failed', details: formatZodError(parsed.error) }, { status: 400 })
  }
  const { email } = parsed.data

  const user = await prisma.user.findUnique({ where: { email } })

  if (!user || !user.password) {
    // Return success regardless so we don't leak which emails have accounts
    return NextResponse.json({ message: 'If an account exists for that email, a password reset link has been sent.' })
  }

  // Invalidate any previous reset tokens for this user
  await prisma.verificationToken.deleteMany({ where: { identifier: `reset:${email.toLowerCase()}` } })

  const token = crypto.randomBytes(32).toString('hex')
  const expires = new Date(Date.now() + 1000 * 60 * 60) // 1 hour
  await prisma.verificationToken.create({
    data: { identifier: `reset:${email.toLowerCase()}`, token, expires },
  })

  const baseUrl = process.env.NEXTAUTH_URL || 'https://invoice-app-omega-ten.vercel.app'
  const resetUrl = `${baseUrl}/auth/reset-password?token=${token}&email=${encodeURIComponent(email)}`

  if (process.env.RESEND_API_KEY) {
    try {
      const { Resend } = await import('resend')
      const resend = new Resend(process.env.RESEND_API_KEY)
      await resend.emails.send({
        from: process.env.EMAIL_FROM || 'Invoice Atlas <onboarding@resend.dev>',
        to: email,
        subject: 'Reset your Invoice Atlas password',
        html: `<p>We received a request to reset your password.</p><p><a href="${resetUrl}">Reset your password</a></p><p>This link expires in 1 hour. If you didn't request this, you can safely ignore this email.</p>`,
      })
    } catch (e) {
      console.error('resend forgot-password failed', e)
    }
  } else {
    // Dev fallback — log the reset link like the invite flow does
    console.log(`Forgot-password dev: ${email} -> ${resetUrl}`)
  }

  return NextResponse.json({ message: 'If an account exists for that email, a password reset link has been sent.' })
}