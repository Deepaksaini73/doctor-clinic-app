"use client"

import { Users, UserCheck, Calendar, Building2, TrendingUp, TrendingDown } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"

interface EnhancedStatisticsCardsProps {
  stats: {
    totalPatients: number
    totalDoctors: number
    totalAppointments: number
    roomAvailability: number
  }
}

export default function StatisticsCards({ stats }: EnhancedStatisticsCardsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
              <p className="text-sm text-gray-600 mb-1">Total Patient</p>
              <p className="text-2xl font-semibold">{stats.totalPatients}</p>
            </div>
            <div className="text-right">
              <div className="flex items-center text-green-600 text-sm">
                <TrendingUp className="w-4 h-4 mr-1" />
                40.81%
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                <UserCheck className="w-6 h-6 text-purple-600" />
              </div>
              <p className="text-sm text-gray-600 mb-1">Total Doctor</p>
              <p className="text-2xl font-semibold">{stats.totalDoctors}</p>
            </div>
            <div className="text-right">
              <div className="flex items-center text-red-600 text-sm">
                <TrendingDown className="w-4 h-4 mr-1" />
                10.35%
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                <Calendar className="w-6 h-6 text-green-600" />
              </div>
              <p className="text-sm text-gray-600 mb-1">Book Appointment</p>
              <p className="text-2xl font-semibold">{stats.totalAppointments}</p>
            </div>
            <div className="text-right">
              <div className="flex items-center text-green-600 text-sm">
                <TrendingUp className="w-4 h-4 mr-1" />
                7.14%
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mb-4">
                <Building2 className="w-6 h-6 text-orange-600" />
              </div>
              <p className="text-sm text-gray-600 mb-1">Room Availability</p>
              <p className="text-2xl font-semibold">{stats.roomAvailability}</p>
            </div>
            <div className="text-right">
              <div className="flex items-center text-red-600 text-sm">
                <TrendingDown className="w-4 h-4 mr-1" />
                6.72%
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 