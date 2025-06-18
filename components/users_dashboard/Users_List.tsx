"use client"

import { useState } from "react"
import { Eye, Trash2, Copy, Check, EyeOff } from "lucide-react"
import { format } from "date-fns"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { database } from "@/lib/firebase"
import { ref, remove } from "firebase/database"
import { useToast } from "@/hooks/use-toast"

interface User {
  id: string
  userId: string
  name: string
  email: string
  role: string
  password: string
  status: "Active" | "Inactive"
  created: string
  lastLogin: string
}

interface UsersListProps {
  users: User[]
  isLoading: boolean
  onUserDeleted: () => void
}

export default function UsersList({ users, isLoading, onUserDeleted }: UsersListProps) {
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [showPassword, setShowPassword] = useState(false)
  const [copyingPassword, setCopyingPassword] = useState(false)
  const [copyingEmail, setCopyingEmail] = useState(false)
  const [copyingUserId, setCopyingUserId] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [dialogOpen, setDialogOpen] = useState(false)
  const { toast } = useToast()

  const handleCopy = async (text: string, type: 'email' | 'password' | 'userId') => {
    await navigator.clipboard.writeText(text)
    const stateSetters = {
      password: setCopyingPassword,
      email: setCopyingEmail,
      userId: setCopyingUserId
    }
    stateSetters[type](true)
    setTimeout(() => stateSetters[type](false), 2000)
    toast({
      title: "Copied!",
      description: `${type.charAt(0).toUpperCase() + type.slice(1)} copied to clipboard`,
    })
  }

  const handleDelete = async (userId: string) => {
    setIsDeleting(true)
    try {
      const userRef = ref(database, `users/${userId}`)
      await remove(userRef)
      setDialogOpen(false)
      onUserDeleted()
      toast({
        title: "Success",
        description: "User deleted successfully",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete user",
        variant: "destructive",
      })
    } finally {
      setIsDeleting(false)
      setSelectedUser(null)
    }
  }

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case "admin": return "bg-purple-100 text-purple-800"
      case "doctor": return "bg-blue-100 text-blue-800"
      case "receptionist": return "bg-green-100 text-green-800"
      default: return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <div className="space-y-4">
      <div className="rounded-md border">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {users.map((user) => (
              <tr key={user.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">{user.name}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <Badge className={getRoleBadgeColor(user.role)}>
                    {user.role}
                  </Badge>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <Badge variant={user.status === "Active" ? "success" : "secondary"}>
                    {user.status}
                  </Badge>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {format(new Date(user.created), "MMM d, yyyy")}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => {
                      setSelectedUser(user);
                      setDialogOpen(true);
                    }}
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Dialog 
        open={dialogOpen} 
        onOpenChange={(open) => {
          setDialogOpen(open);
          if (!open) {
            setShowPassword(false);
            setSelectedUser(null);
          }
        }}
      >
        <DialogContent className="text-black sm:max-w-md bg-white/95">
          <DialogHeader>
            <DialogTitle>User Details</DialogTitle>
          </DialogHeader>
          {selectedUser && (
            <div className="space-y-4">
              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-500">Name</p>
                <p className="text-sm">{selectedUser.name}</p>
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-500">Email</p>
                <div className="flex items-center space-x-2">
                  <p className="text-sm flex-1">{selectedUser.email}</p>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleCopy(selectedUser.email, 'email')}
                  >
                    {copyingEmail ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-500">Password</p>
                <div className="flex items-center space-x-2">
                  <p className="text-sm flex-1 font-mono">
                    {showPassword ? selectedUser.password : "•".repeat(8)}
                  </p>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleCopy(selectedUser.password, 'password')}
                  >
                    {copyingPassword ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setShowPassword(prev => !prev)}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-500">Last Login</p>
                <p className="text-sm">{selectedUser.lastLogin}</p>
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-500">User ID</p>
                <div className="flex items-center space-x-2">
                  <p className="text-sm flex-1 font-mono">{selectedUser.userId}</p>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleCopy(selectedUser.userId, 'userId')}
                  >
                    {copyingUserId ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
            </div>
          )}
          <DialogFooter className="sm:justify-between">
            <Button
              variant="destructive"
              onClick={() => selectedUser && handleDelete(selectedUser.id)}
              disabled={isDeleting || !selectedUser}
              className="mr-auto"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              {isDeleting ? "Deleting..." : "Delete User"}
            </Button>
            <Button 
              variant="secondary" 
              onClick={() => setDialogOpen(false)}
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}