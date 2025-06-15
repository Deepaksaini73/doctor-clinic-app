import { NextResponse } from "next/server"
import { mockUsers } from "@/lib/mock-data"

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json()

    const user = mockUsers.find((u) => u.email === email && u.password === password)

    if (!user) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })
    }

    // In a real app, you would generate a JWT token here
    const token = btoa(
      JSON.stringify({
        id: user.id,
        name: user.name,
        role: user.role,
        exp: Date.now() + 3600000, // 1 hour expiry
      }),
    )

    return NextResponse.json({
      user: {
        id: user.id,
        name: user.name,
        role: user.role,
      },
      token,
    })
  } catch (error) {
    return NextResponse.json({ error: "Authentication failed" }, { status: 500 })
  }
}
