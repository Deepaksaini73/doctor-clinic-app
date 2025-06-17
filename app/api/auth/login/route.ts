import { NextResponse } from "next/server"
import { database } from "@/lib/firebase"
import { ref, get, set } from "firebase/database"

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json()

    // Get users ref from Firebase
    const usersRef = ref(database, 'users')
    const snapshot = await get(usersRef)

    if (!snapshot.exists()) {
      return NextResponse.json({ error: "Authentication failed" }, { status: 401 })
    }

    // Find user with matching email and password
    const users = snapshot.val()
    const user = Object.values(users).find((u: any) => 
      u.email === email && u.password === password
    )

    if (!user) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })
    }

    // Update last login
    try {
      const userRef = ref(database, `users/${user.id}`)
      await set(userRef, {
        ...user,
        lastLogin: new Date().toISOString()
      })
    } catch (error) {
      console.error("Error updating last login:", error)
    }

    // Generate token
    const token = btoa(
      JSON.stringify({
        id: user.id,
        name: user.name,
        role: user.role,
        email: user.email,
        exp: Date.now() + 3600000, // 1 hour expiry
      })
    )

    return NextResponse.json({
      user: {
        id: user.id,
        name: user.name,
        role: user.role,
        email: user.email,
        status: user.status
      },
      token,
    })
  } catch (error) {
    console.error("Login error:", error)
    return NextResponse.json(
      { error: "Authentication failed" }, 
      { status: 500 }
    )
  }
}
