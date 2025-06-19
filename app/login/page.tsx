"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Eye, EyeOff, User } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import Image from "next/image"

// Update UserData interface
interface UserData {
  id: string       // Firebase document ID
  userId?: string  // Custom user ID
  name: string
  email: string
  role: "admin" | "doctor" | "receptionist"
  status: "active" | "inactive"
}

const DEMO_CREDENTIALS = {
  admin: {
    email: "clinicare@gmail.com",
    password: "clinicare@123",
    label: "Admin Demo Login",
  },
  doctor: {
    email: "dr.rnbijarniya@gmail.com",
    password: "ramniwas@123",
    label: "Doctor Demo Login",
  },
  receptionist: {
    email: "ankitajain@gmail.com",
    password: "ankitajain@123",
    label: "Receptionist Demo Login",
  },
}

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [keepLoggedIn, setKeepLoggedIn] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  const validateForm = (): boolean => {
    if (!email || !password) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive",
      })
      return false
    }
    if (!/\S+@\S+\.\S+/.test(email)) {
      toast({
        title: "Invalid Email",
        description: "Please enter a valid email address",
        variant: "destructive",
      })
      return false
    }
    return true
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateForm()) return
    setIsLoading(true)

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      })

      const data = await response.json()

      if (!response.ok) {
        handleLoginError(response.status, data.message)
        return
      }

      handleLoginSuccess(data)
    } catch (error) {
      console.error("Login error:", error)
      toast({
        variant: "destructive",
        title: "Connection Error",
        description: "Unable to connect to the server. Please try again.",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleLoginError = (status: number, message?: string) => {
    const errorMessages = {
      401: "The email or password you entered is incorrect",
      404: "No account exists with this email",
      default: message || "An error occurred during login",
    }

    toast({
      variant: "destructive",
      title: status === 401 ? "Invalid Credentials" : "Login Failed",
      description: errorMessages[status as keyof typeof errorMessages] || errorMessages.default,
    })
  }

  // Update handleLoginSuccess function
  const handleLoginSuccess = (data: { user: UserData; token: string }) => {
    console.log("Login response data:", data);

    if (!data.user || !data.token) {
      console.error("Invalid login response data");
      toast({
        variant: "destructive",
        title: "Login Error",
        description: "Invalid response from server",
      });
      return;
    }

    if (!data.user.role) {
      console.error("User role missing");
      toast({
        variant: "destructive",
        title: "Login Error",
        description: "User role not defined",
      });
      return;
    }

    const userData = {
      ...data.user,
      userId: data.user.userId || data.user.id
    };

    // Store data based on keepLoggedIn preference
    if (keepLoggedIn) {
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(userData));
    } else {
      sessionStorage.setItem("token", data.token);
      sessionStorage.setItem("user", JSON.stringify(userData));
    }

    const redirects: Record<string, string> = {
      admin: "/admin/dashboard",
      doctor: "/doctor/dashboard",
      receptionist: "/receptionist",
      default: "/dashboard",
    };

    const redirectPath = redirects[data.user.role] || redirects.default;

    toast({
      title: "Login Successful",
      description: `Welcome back, ${data.user.name}!`,
    });

    router.push(redirectPath);
  }

  const autoLogin = async (role: keyof typeof DEMO_CREDENTIALS) => {
    const credentials = DEMO_CREDENTIALS[role]
    setEmail(credentials.email)
    setPassword(credentials.password)
    setKeepLoggedIn(true)

    await new Promise((resolve) => setTimeout(resolve, 500))
    document.querySelector("form")?.dispatchEvent(new Event("submit", { cancelable: true }))
  }

  return (
    <>
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="w-12 h-12">
                <Image
                  src="logo.png"
                  alt="Logo"
                  width={48}
                  height={48}
                  className="object-contain"
                />
              </div>
              <div className="flex items-center gap-2">
                <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  ओषधि
                </span>
                <span className="text-gray-300">|</span>
                <span className="text-xl font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  N6T Technologies
                </span>
              </div>
            </div>
          </div>

          {/* Login Card */}
          <Card className="border-0 shadow-lg">
            <CardHeader className="text-center pb-6">
              <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <User className="w-8 h-8 text-blue-600" />
              </div>
              <CardTitle className="text-2xl font-semibold">Welcome Back</CardTitle>
              <CardDescription>Glad to see you again. Log in to your account.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="h-11"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="h-11 pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="keep-logged-in"
                      className="rounded border-gray-300"
                    />
                    <Label className="text-sm">
                      Keep me login
                    </Label>
                  </div>
                  <Button variant="link" className="text-blue-600 p-0 h-auto">
                    Forgot Password?
                  </Button>
                </div>

                <Button type="submit" className="w-full h-11 bg-blue-600 hover:bg-blue-700" disabled={isLoading}>
                  {isLoading ? "Signing in..." : "Login"}
                </Button>
              </form>

              {/* <div className="text-center mt-6">
                <span className="text-sm text-gray-600">Don't have account? </span>
                <Button variant="link" className="text-blue-600 p-0 h-auto">
                  Register
                </Button>
              </div> */}
            </CardContent>
          </Card>

          {/* Demo Login Buttons */}
          <div className="mt-6 space-y-3">
            <p className="text-sm font-medium text-blue-900 mb-2">Quick Demo Access:</p>
            <div className="grid grid-cols-1 gap-2">
              <Button
                type="button"
                variant="outline"
                className="w-full border-blue-200 hover:bg-blue-50 text-blue-700"
                onClick={() => autoLogin("admin")}
                disabled={isLoading}
              >
                <User className="w-4 h-4 mr-2" />
                Admin Demo
              </Button>
              <Button
                type="button"
                variant="outline"
                className="w-full border-blue-200 hover:bg-blue-50 text-blue-700"
                onClick={() => autoLogin("doctor")}
                disabled={isLoading}
              >
                <User className="w-4 h-4 mr-2" />
                Doctor Demo
              </Button>
              <Button
                type="button"
                variant="outline"
                className="w-full border-blue-200 hover:bg-blue-50 text-blue-700"
                onClick={() => autoLogin("receptionist")}
                disabled={isLoading}
              >
                <User className="w-4 h-4 mr-2" />
                Receptionist Demo
              </Button>
            </div>
          </div>

          {/* Footer */}
          <div className="text-center mt-8 text-xs text-gray-500">© 2024 ओषधि | N6T Technologies. All right reserved.</div>
        </div>
      </div>
      {/* <Toaster /> */}
    </>
  )
}
