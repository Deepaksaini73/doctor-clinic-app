"use client"

import { useState } from "react"
import { User, Plus, Edit, Trash2, Shield, UserCheck, Users, Mail, Key } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import MainLayout from "@/components/layout/main-layout"

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

  const getRoleColor = (role: string) => {
    switch (role) {
      case "admin":
        return "bg-red-100 text-red-800"
      case "doctor":
        return "bg-blue-100 text-blue-800"
      case "receptionist":
        return "bg-green-100 text-green-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getStatusColor = (status: string) => {
    return status === "Active" ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"
  }

  const totalUsers = users.length
  const adminUsers = users.filter((u) => u.role === "admin").length
  const doctorUsers = users.filter((u) => u.role === "doctor").length
  const receptionistUsers = users.filter((u) => u.role === "receptionist").length

  return (
    <MainLayout title="User Management" subtitle="Manage system users and their access permissions">
      <div className="space-y-6">
        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                    <Users className="h-6 w-6 text-blue-600" />
                  </div>
                  <p className="text-sm font-medium text-gray-600">Total Users</p>
                  <p className="text-2xl font-bold text-gray-900">{totalUsers}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mb-4">
                    <Shield className="h-6 w-6 text-red-600" />
                  </div>
                  <p className="text-sm font-medium text-gray-600">Admins</p>
                  <p className="text-2xl font-bold text-gray-900">{adminUsers}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                    <UserCheck className="h-6 w-6 text-blue-600" />
                  </div>
                  <p className="text-sm font-medium text-gray-600">Doctors</p>
                  <p className="text-2xl font-bold text-gray-900">{doctorUsers}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                    <User className="h-6 w-6 text-green-600" />
                  </div>
                  <p className="text-sm font-medium text-gray-600">Receptionists</p>
                  <p className="text-2xl font-bold text-gray-900">{receptionistUsers}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Users List */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>System Users</CardTitle>
              <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-blue-600 hover:bg-blue-700">
                    <Plus className="h-4 w-4 mr-2" />
                    Add New User
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle>Create New User</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="name">Full Name</Label>
                      <Input
                        id="name"
                        value={newUser.name}
                        onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                        placeholder="Enter full name"
                      />
                    </div>
                    <div>
                      <Label htmlFor="role">Role</Label>
                      <Select
                        value={newUser.role}
                        onValueChange={(value) => {
                          setNewUser({ ...newUser, role: value })
                          generateCredentials(value)
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select role" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="admin">Admin</SelectItem>
                          <SelectItem value="doctor">Doctor</SelectItem>
                          <SelectItem value="receptionist">Receptionist</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="email">Email (Auto-generated)</Label>
                      <div className="flex">
                        <Input id="email" value={newUser.email} readOnly className="bg-gray-50" />
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="ml-2"
                          onClick={() => newUser.role && generateCredentials(newUser.role)}
                        >
                          <Mail className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="password">Password (Auto-generated)</Label>
                      <div className="flex">
                        <Input id="password" value={newUser.password} readOnly className="bg-gray-50" />
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="ml-2"
                          onClick={() => navigator.clipboard.writeText(newUser.password)}
                        >
                          <Key className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" onClick={() => setIsCreateModalOpen(false)}>
                        Cancel
                      </Button>
                      <Button onClick={handleCreateUser} className="bg-blue-600 hover:bg-blue-700">
                        Create User
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Name</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Email</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Role</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Status</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Created</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Last Login</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-4 text-sm font-medium">{user.name}</td>
                      <td className="py-3 px-4 text-sm">{user.email}</td>
                      <td className="py-3 px-4 text-sm">
                        <Badge className={getRoleColor(user.role)}>
                          {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-sm">
                        <Badge className={getStatusColor(user.status)}>{user.status}</Badge>
                      </td>
                      <td className="py-3 px-4 text-sm">{user.created}</td>
                      <td className="py-3 px-4 text-sm">{user.lastLogin}</td>
                      <td className="py-3 px-4 text-sm">
                        <div className="flex items-center gap-2">
                          <Button variant="ghost" size="sm">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  )
}
