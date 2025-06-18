import { NextResponse } from "next/server"
import { database } from "@/lib/firebase"
import { ref, get, set } from "firebase/database"

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json()
    const usersRef = ref(database, 'users')
    const snapshot = await get(usersRef)

    if (!snapshot.exists()) {
      return NextResponse.json({ error: "Authentication failed" }, { status: 401 })
    }

    // Find user with matching email and get their document ID
    const users = snapshot.val()
    let userId: string | null = null
    let userData: any = null

    Object.entries(users).forEach(([key, value]: [string, any]) => {
      if (value.email === email && value.password === password) {
        userId = key
        userData = value
      }
    })

    if (!userId || !userData) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })
    }

    // Update last login
    try {
      const userRef = ref(database, `users/${userId}`)
      await set(userRef, {
        ...userData,
        lastLogin: new Date().toISOString()
      })
    } catch (error) {
      console.error("Error updating last login:", error)
    }

    // Generate token with userId
    const token = btoa(
      JSON.stringify({
        id: userId,
        name: userData.name,
        role: userData.role,
        email: userData.email,
        userId: userData.userId, // Include the userId if exists
        exp: Date.now() + 3600000,
      })
    )

    // Update POST function return data structure
    return NextResponse.json({
      user: {
        id: userId,
        userId: userData.userId || userId, // Fallback to Firebase ID if no custom ID
        name: userData.name,
        role: userData.role.toLowerCase(), // Ensure consistent casing
        email: userData.email,
        status: userData.status?.toLowerCase() || 'active'
      },
      token: token,
    })
  } catch (error) {
    console.error("Login error:", error)
    return NextResponse.json(
      { error: "Authentication failed" }, 
      { status: 500 }
    )
  }
}
