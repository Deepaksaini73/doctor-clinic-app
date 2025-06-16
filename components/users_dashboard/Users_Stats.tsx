"use client"

import { Users, Shield, UserCheck, User } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"

interface EnhancedUsersStatsProps {
  totalUsers: number
  adminUsers: number
  doctorUsers: number
  receptionistUsers: number
}

export default function UsersStats({
  totalUsers,
  adminUsers,
  doctorUsers,
  receptionistUsers,
}: EnhancedUsersStatsProps) {
  return (
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
  )
} 