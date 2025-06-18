import { NextResponse } from "next/server"
import { database } from "@/lib/firebase"
import { ref, get, push, set } from "firebase/database"

export async function GET() {
  try {
    const usersRef = ref(database, 'users')
    const snapshot = await get(usersRef)
    
    if (!snapshot.exists()) {
      return NextResponse.json({ users: [] })
    }

    const users = Object.entries(snapshot.val()).map(([id, data]: [string, any]) => ({
      id,
      ...data
    }))

    return NextResponse.json({ users })
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch users" },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const userData = await request.json()
    const usersRef = ref(database, 'users')
    const newUserRef = push(usersRef)
    await set(newUserRef, userData)

    return NextResponse.json({ 
      id: newUserRef.key,
      ...userData,
      message: "User created successfully" 
    })
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to create user" },
      { status: 500 }
    )
  }
}