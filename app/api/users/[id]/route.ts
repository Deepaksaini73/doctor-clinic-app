import { NextResponse } from "next/server"
import { database } from "@/lib/firebase"
import { ref, update, remove } from "firebase/database"

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const data = await request.json()
    const userRef = ref(database, `users/${params.id}`)
    await update(userRef, data)

    return NextResponse.json({ 
      id: params.id,
      ...data,
      message: "User updated successfully" 
    })
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to update user" },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const userRef = ref(database, `users/${params.id}`)
    await remove(userRef)

    return NextResponse.json({ 
      message: "User deleted successfully" 
    })
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to delete user" },
      { status: 500 }
    )
  }
}