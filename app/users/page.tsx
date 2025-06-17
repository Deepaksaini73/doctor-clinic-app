"use client"

import { useState, useEffect } from "react"
import { database } from "@/lib/firebase"
import { ref, push, get, set, remove } from "firebase/database"
import MainLayout from "@/components/layout/main-layout"
import UsersList from "@/components/users_dashboard/Users_List"
import CreateUser from "@/components/users_dashboard/Create_User"
import UsersStats from "@/components/users_dashboard/Users_Stats"
import { useToast } from "@/hooks/use-toast"

interface User {
  id: string
  name: string
  email: string
  role: "admin" | "doctor" | "receptionist"
  status: "Active" | "Inactive"
  created: string
  lastLogin: string
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const { toast } = useToast()
  
  const [newUser, setNewUser] = useState({
    name: "",
    role: "",
    email: "",
    password: "",
  })

  // Fetch users on component mount
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const usersRef = ref(database, 'users')
        const snapshot = await get(usersRef)
        
        if (snapshot.exists()) {
          const usersData = snapshot.val()
          const usersArray = Object.entries(usersData).map(([id, data]: [string, any]) => ({
            id,
            ...data
          }))
          setUsers(usersArray)
        }
      } catch (error) {
        console.error('Error fetching users:', error)
        toast({
          title: "Error",
          description: "Failed to fetch users",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchUsers()
  }, [toast])

  const generateCredentials = (role: string) => {
    const timestamp = Date.now()
    const email = `${role}${timestamp}@clinicare.com`
    const password = `${role}${Math.random().toString(36).substring(2, 8)}`

    setNewUser({
      ...newUser,
      email,
      password,
    })
  }

  const handleCreateUser = async () => {
    if (!newUser.name || !newUser.role || !newUser.email) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      })
      return
    }

    try {
      const usersRef = ref(database, 'users')
      const newUserRef = push(usersRef)
      
      const userData = {
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        password: newUser.password, // Note: In production, handle password securely
        status: "Active",
        created: new Date().toISOString().split("T")[0],
        lastLogin: "Never",
      }

      await set(newUserRef, userData)

      // Update local state
      setUsers([...users, { id: newUserRef.key!, ...userData }])
      
      // Reset form and close modal
      setNewUser({ name: "", role: "", email: "", password: "" })
      setIsCreateModalOpen(false)

      toast({
        title: "Success",
        description: "User created successfully",
      })
    } catch (error) {
      console.error('Error creating user:', error)
      toast({
        title: "Error",
        description: "Failed to create user",
        variant: "destructive",
      })
    }
  }

  const refreshUsers = async () => {
    setIsLoading(true)
    try {
      const usersRef = ref(database, 'users')
      const snapshot = await get(usersRef)
      if (snapshot.exists()) {
        const usersData = Object.entries(snapshot.val()).map(([id, data]: [string, any]) => ({
          id,
          ...data
        }))
        setUsers(usersData)
      }
    } catch (error) {
      console.error('Error fetching users:', error)
    } finally {
      setIsLoading(false)
    }
  }

  // Calculate statistics
  const totalUsers = users.length
  const adminUsers = users.filter((u) => u.role === "admin").length
  const doctorUsers = users.filter((u) => u.role === "doctor").length
  const receptionistUsers = users.filter((u) => u.role === "receptionist").length

  return (
    <MainLayout title="User Management" subtitle="Manage system users and their access permissions">
      <div className="space-y-6">
        <UsersStats
          totalUsers={totalUsers}
          adminUsers={adminUsers}
          doctorUsers={doctorUsers}
          receptionistUsers={receptionistUsers}
        />

        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">System Users</h2>
          <CreateUser
            isOpen={isCreateModalOpen}
            onOpenChange={setIsCreateModalOpen}
            newUser={newUser}
            onNewUserChange={setNewUser}
            onCreateUser={handleCreateUser}
            onGenerateCredentials={generateCredentials}
          />
        </div>
        
        <UsersList 
          users={users} 
          isLoading={isLoading}
          onUserDeleted={refreshUsers}  // Pass the refresh function
        />
      </div>
    </MainLayout>
  )
}