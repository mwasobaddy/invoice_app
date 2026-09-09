import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { hashPassword } from '@/lib/auth-utils'
import { RegisterSchema, formatZodError } from '@/lib/schemas'
import { rateLimit, getClientIp } from '@/lib/rate-limit'

/**
 * POST /api/auth/register
 * Register a new user
 */
export async function POST(request: NextRequest) {
  try {
    const ip = getClientIp(request);
    const rl = rateLimit(`register:${ip}`, 5, 60_000);
    if (!rl.allowed) {
      return NextResponse.json({ error: 'Too many requests, try again later' }, { status: 429, headers: { 'Retry-After': String(Math.ceil((rl.resetAt - Date.now())/1000)) } });
    }
    const raw = await request.json()
    const parsed = RegisterSchema.safeParse(raw)
    if (!parsed.success) {
      return NextResponse.json({ error: 'Validation failed', details: formatZodError(parsed.error) }, { status: 400 })
    }
    const { email, name, password } = parsed.data

    // Stronger policy: Enforce complexity (S4)
    if (password.length < 8 || !/[A-Z]/.test(password) || !/[0-9]/.test(password)) {
      return NextResponse.json({ error: 'Password must be 8+ chars with uppercase and number' }, { status: 400 })
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    })

    if (existingUser) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 409 }
      )
    }

    // Hash password
    const hashedPassword = await hashPassword(password)

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        name: name || undefined,
        password: hashedPassword,
      },
    })

    return NextResponse.json(
      {
        message: 'User created successfully',
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
        },
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Error registering user:', error)
    return NextResponse.json(
      { error: 'Failed to register user' },
      { status: 500 }
    )
  }
}
