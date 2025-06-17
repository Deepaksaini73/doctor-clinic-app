"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"

export default function DoctorLoginPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const router = useRouter()

  useEffect(() => {
    // Check if user is already authenticated
    const token = localStorage.getItem("token")
    const user = localStorage.getItem("user")

    if (token && user) {
      try {
        const userData = JSON.parse(user)
        if (userData.role === "doctor") {
          setIsAuthenticated(true)
          router.push("/doctor/dashboard")
        }
      } catch (error) {
        console.error("Error parsing user data:", error)
        localStorage.removeItem("token")
        localStorage.removeItem("user")
      }
    }
  }, [router])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Doctor Portal</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">Sign in to access your dashboard</p>
        </div>
      </div>
    </div>
  )
}
