"use client"

import { TrendingUp } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

interface EnhancedPatientStatisticsProps {
  totalPatients: number
  growthRate: number
}

export default function PatientStatistics({ totalPatients, growthRate }: EnhancedPatientStatisticsProps) {
  return (
    <Card className="lg:col-span-2">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Patient Statistics</CardTitle>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm">
                Monthly
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem>Weekly</DropdownMenuItem>
              <DropdownMenuItem>Monthly</DropdownMenuItem>
              <DropdownMenuItem>Yearly</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="text-3xl font-semibold">{totalPatients}</div>
            <div className="flex items-center text-green-600 text-sm">
              <TrendingUp className="w-4 h-4 mr-1" />
              {growthRate}% since last week
            </div>
          </div>
          <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
            <p className="text-gray-500">Chart visualization would appear here</p>
          </div>
          <div className="flex items-center justify-center gap-6 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
              <span>Patients</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span>Inpatient</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
} 