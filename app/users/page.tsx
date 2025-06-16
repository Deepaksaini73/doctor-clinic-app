"use client"

import { useState } from "react"
import MainLayout from "@/components/layout/main-layout"
import UsersList from "@/components/users_dashboard/Users_List"
import CreateUser from "@/components/users_dashboard/Create_User"
import UsersStats from "@/components/users_dashboard/Users_Stats"

export default function UsersPage() {
  const [users, setUsers] = useState([
    {
      id: 1,
      name: "Dr. Sarah Johnson",
      email: "sarah.johnson@clinicare.com",
      role: "doctor",
      status: "Active",
      created: "2024-01-15",
      lastLogin: "2024-03-15 09:30",
    },
    {
      id: 2,
      name: "Maria Rodriguez",
      email: "maria.rodriguez@clinicare.com",
      role: "receptionist",
      status: "Active",
      created: "2024-02-01",
      lastLogin: "2024-03-15 08:45",
    },
    {
      id: 3,
      name: "Admin User",
      email: "admin@clinicare.com",
      role: "admin",
      status: "Active",
      created: "2024-01-01",
      lastLogin: "2024-03-15 10:15",
    },
    {
      id: 4,
      name: "Dr. Michael Chen",
      email: "michael.chen@clinicare.com",
      role: "doctor",
      status: "Inactive",
      created: "2024-02-15",
      lastLogin: "2024-03-10 14:20",
    },
  ])

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [newUser, setNewUser] = useState({
    name: "",
    role: "",
    email: "",
    password: "",
  })

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

  const handleCreateUser = () => {
    if (newUser.name && newUser.role && newUser.email) {
      const user = {
        id: users.length + 1,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        status: "Active",
        created: new Date().toISOString().split("T")[0],
        lastLogin: "Never",
      }
      setUsers([...users, user])
      setNewUser({ name: "", role: "", email: "", password: "" })
      setIsCreateModalOpen(false)
    }
  }

  const totalUsers = users.length
  const adminUsers = users.filter((u) => u.role === "admin").length
  const doctorUsers = users.filter((u) => u.role === "doctor").length
  const receptionistUsers = users.filter((u) => u.role === "receptionist").length

  return (
    <MainLayout title="User Management" subtitle="Manage system users and their access permissions">
      <div className="space-y-6">
        {/* Statistics Cards */}
        <UsersStats
          totalUsers={totalUsers}
          adminUsers={adminUsers}
          doctorUsers={doctorUsers}
          receptionistUsers={receptionistUsers}
        />

        {/* Users List */}
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
        <UsersList users={users} />
      </div>
    </MainLayout>
  )
}
