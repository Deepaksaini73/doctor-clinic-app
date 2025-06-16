"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2 } from "lucide-react"

const formSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address" }),
  password: z.string().min(1, { message: "Password is required" }),
})

type FormValues = z.infer<typeof formSchema>

export default function LoginForm() {
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  })

  const onSubmit = async (data: FormValues) => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || "Login failed")
      }

      // Store token in localStorage (in a real app, use secure HTTP-only cookies)
      localStorage.setItem("token", result.token)
      localStorage.setItem("user", JSON.stringify(result.user))

      // Redirect based on role
      if (result.user.role === "doctor") {
        router.push("/doctor/dashboard")
      } else if (result.user.role === "admin") {
        router.push("/admin/dashboard")
      } else {
        router.push("/receptionist")
      }
    } catch (err) {
      console.error("Login error:", err)
      setError(err instanceof Error ? err.message : "Login failed. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  // For demo purposes - quick login buttons
  const handleQuickLogin = (role: string) => {
    let credentials

    switch (role) {
      case "doctor":
        credentials = { email: "sarah@clinic.com", password: "doctor123" }
        break
      case "admin":
        credentials = { email: "admin@clinic.com", password: "admin123" }
        break
      default:
        credentials = { email: "receptionist@clinic.com", password: "password123" }
    }

    form.setValue("email", credentials.email)
    form.setValue("password", credentials.password)
    form.handleSubmit(onSubmit)()
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl text-center">Doctor Login</CardTitle>
      </CardHeader>
      <CardContent>
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input placeholder="doctor@clinic.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="••••••••" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Logging in...
                </>
              ) : (
                "Login"
              )}
            </Button>
          </form>
        </Form>

        <div className="mt-6">
          <p className="text-center text-sm text-gray-500 mb-2">Quick Login (Demo Only)</p>
          <div className="grid grid-cols-3 gap-2">
            <Button variant="outline" size="sm" onClick={() => handleQuickLogin("doctor")} className="text-xs">
              Doctor
            </Button>
            <Button variant="outline" size="sm" onClick={() => handleQuickLogin("receptionist")} className="text-xs">
              Receptionist
            </Button>
            <Button variant="outline" size="sm" onClick={() => handleQuickLogin("admin")} className="text-xs">
              Admin
            </Button>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-center text-sm text-gray-500">
        <p>This is a demo application. No real authentication is implemented.</p>
      </CardFooter>
    </Card>
  )
}
