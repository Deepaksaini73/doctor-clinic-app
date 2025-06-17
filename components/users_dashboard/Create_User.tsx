"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { UserPlus, Key, Mail, Lock, Eye, EyeOff, Copy, Check } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface CreateUserProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  newUser: {
    name: string
    role: string
    email: string
    password: string
  }
  onNewUserChange: (user: any) => void
  onCreateUser: () => void
  onGenerateCredentials: (role: string) => void
}

export default function CreateUser({
  isOpen,
  onOpenChange,
  newUser,
  onNewUserChange,
  onCreateUser,
  onGenerateCredentials,
}: CreateUserProps) {
  const [showPassword, setShowPassword] = useState(false)
  const [copyingPassword, setCopyingPassword] = useState(false)
  const [copyingEmail, setCopyingEmail] = useState(false)
    const { toast } = useToast()

  const handleCopy = async (text: string, type: 'email' | 'password') => {
    await navigator.clipboard.writeText(text)
    if (type === 'password') {
      setCopyingPassword(true)
      setTimeout(() => setCopyingPassword(false), 2000)
    } else {
      setCopyingEmail(true)
      setTimeout(() => setCopyingEmail(false), 2000)
    }
    toast({
        title: "Sucess",
        description: `${type} copied to clipboard!`,
        variant: "destructive",
      })
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button className="text-black bg-white hover:bg-gray-100 border border-gray-200">
          <UserPlus className="mr-2 h-4 w-4" />
          Add New User
        </Button>
      </DialogTrigger>
      <DialogContent className="text-black sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-black">Create New User</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-black">Full Name</label>
            <Input
              placeholder="Enter user's full name"
              value={newUser.name}
              onChange={(e) =>
                onNewUserChange({ ...newUser, name: e.target.value })
              }
              className="text-black"
            />
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium text-black">Role</label>
            <Select
              value={newUser.role}
              onValueChange={(value) =>
                onNewUserChange({ ...newUser, role: value })
              }
            >
              <SelectTrigger className="text-black">
                <SelectValue placeholder="Select role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="admin">Administrator</SelectItem>
                <SelectItem value="doctor">Doctor</SelectItem>
                <SelectItem value="receptionist">Receptionist</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-black">Email</label>
            <div className="flex space-x-2">
              <Input
                value={newUser.email}
                onChange={(e) =>
                  onNewUserChange({ ...newUser, email: e.target.value })
                }
                placeholder="Enter email address"
                className="text-black"
              />
              <Button
                type="button"
                variant="outline"
                className="text-black"
                onClick={() => handleCopy(newUser.email, 'email')}
              >
                {copyingEmail ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              </Button>
              <Button
                type="button"
                variant="outline"
                className="text-black"
                onClick={() => onGenerateCredentials(newUser.role)}
              >
                <Mail className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-black">Password</label>
            <div className="flex space-x-2">
              <Input
                type={showPassword ? "text" : "password"}
                value={newUser.password}
                onChange={(e) =>
                  onNewUserChange({ ...newUser, password: e.target.value })
                }
                placeholder="Enter password"
                className="text-black"
              />
              <Button
                type="button"
                variant="outline"
                className="text-black"
                onClick={() => handleCopy(newUser.password, 'password')}
              >
                {copyingPassword ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              </Button>
              <Button
                type="button"
                variant="outline"
                className="text-black"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
              <Button
                type="button"
                variant="outline"
                className="text-black"
                onClick={() => onGenerateCredentials(newUser.role)}
              >
                <Lock className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <Button
            type="button"
            variant="outline"
            className="w-full text-black"
            onClick={() => onGenerateCredentials(newUser.role)}
          >
            <Key className="mr-2 h-4 w-4" />
            Generate All Credentials
          </Button>

          <div className="flex justify-end space-x-2 pt-4">
            <Button 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              className="text-black"
            >
              Cancel
            </Button>
            <Button 
              onClick={onCreateUser}
              className="bg-primary text-white hover:bg-primary/90"
            >
              Create User
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}