"use client"

import { useState } from "react"
import { Edit, Trash2 } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import {
  EnhancedCard,
  EnhancedCardContent,
  EnhancedCardHeader,
  EnhancedCardTitle,
} from "@/components/ui/enhanced-card"
import { AnimatedButton } from "@/components/ui/animated-button"
import { CardSkeleton } from "@/components/ui/loading-skeleton"

export default function RecentPatients() {
  const [isLoading, setIsLoading] = useState(false)
  const [recentPatients, setRecentPatients] = useState([
    {
      id: 1,
      name: "Sabrina Marie Gomez",
      gender: "Female",
      dateOfBirth: "March 15, 1985",
      address: "123 Maple Street, Springfield, IL",
      phoneNumber: "021 1234 5678",
      bloodType: "O+",
    },
    {
      id: 2,
      name: "Cody James Fisher",
      gender: "Male",
      dateOfBirth: "April 22, 1992",
      address: "456 Oak Avenue, Riverside, TX",
      phoneNumber: "021 2345 6789",
      bloodType: "A-",
    },
    {
      id: 3,
      name: "Savannah Lee Nguyen",
      gender: "Female",
      dateOfBirth: "June 30, 1990",
      address: "789 Pine Road, Lakeview, CA",
      phoneNumber: "021 3456 7890",
      bloodType: "B+",
    },
  ])

  return (
    <EnhancedCard hover shadow="lg">
      <EnhancedCardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <EnhancedCardTitle>Recent Patients</EnhancedCardTitle>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
            <input
              type="text"
              placeholder="Search patients..."
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
            />
            <AnimatedButton variant="outline" size="sm" animation="glow">
              Filter
            </AnimatedButton>
          </div>
        </div>
      </EnhancedCardHeader>
      <EnhancedCardContent>
        {/* Desktop Table View */}
        <div className="hidden lg:block overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 font-medium text-gray-600">No.</th>
                <th className="text-left py-3 px-4 font-medium text-gray-600">Name</th>
                <th className="text-left py-3 px-4 font-medium text-gray-600">Gender</th>
                <th className="text-left py-3 px-4 font-medium text-gray-600">Date of Birth</th>
                <th className="text-left py-3 px-4 font-medium text-gray-600">Address</th>
                <th className="text-left py-3 px-4 font-medium text-gray-600">Phone Number</th>
                <th className="text-left py-3 px-4 font-medium text-gray-600">Blood Type</th>
                <th className="text-left py-3 px-4 font-medium text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody>
              {recentPatients.map((patient, index) => (
                <tr
                  key={patient.id}
                  className="border-b border-gray-100 hover:bg-blue-50 transition-colors duration-200"
                >
                  <td className="py-3 px-4 text-sm">{index + 1}</td>
                  <td className="py-3 px-4 text-sm font-medium">{patient.name}</td>
                  <td className="py-3 px-4 text-sm">{patient.gender}</td>
                  <td className="py-3 px-4 text-sm">{patient.dateOfBirth}</td>
                  <td className="py-3 px-4 text-sm">{patient.address}</td>
                  <td className="py-3 px-4 text-sm">{patient.phoneNumber}</td>
                  <td className="py-3 px-4 text-sm">
                    <Badge className="bg-blue-100 text-blue-800">{patient.bloodType}</Badge>
                  </td>
                  <td className="py-3 px-4 text-sm">
                    <div className="flex items-center gap-2">
                      <AnimatedButton variant="ghost" size="sm" animation="pulse">
                        <Edit className="h-4 w-4" />
                      </AnimatedButton>
                      <AnimatedButton variant="ghost" size="sm" className="text-red-600 hover:text-red-700">
                        <Trash2 className="h-4 w-4" />
                      </AnimatedButton>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile Card View */}
        <div className="lg:hidden space-y-4">
          {isLoading ? (
            <>
              <CardSkeleton />
              <CardSkeleton />
              <CardSkeleton />
            </>
          ) : (
            recentPatients.map((patient, index) => (
              <EnhancedCard key={patient.id} hover>
                <EnhancedCardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-medium text-gray-900">{patient.name}</h3>
                      <p className="text-sm text-gray-500">
                        {patient.gender} • {patient.dateOfBirth}
                      </p>
                    </div>
                    <Badge className="bg-blue-100 text-blue-800">{patient.bloodType}</Badge>
                  </div>

                  <div className="space-y-2 mb-3 text-sm">
                    <div>
                      <span className="text-gray-500">Phone:</span>
                      <span className="ml-1">{patient.phoneNumber}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Address:</span>
                      <span className="ml-1">{patient.address}</span>
                    </div>
                  </div>

                  <div className="flex justify-end gap-2">
                    <AnimatedButton variant="outline" size="sm" icon={<Edit className="h-4 w-4" />}>
                      Edit
                    </AnimatedButton>
                    <AnimatedButton
                      variant="outline"
                      size="sm"
                      className="text-red-600 hover:text-red-700"
                      icon={<Trash2 className="h-4 w-4" />}
                    >
                      Delete
                    </AnimatedButton>
                  </div>
                </EnhancedCardContent>
              </EnhancedCard>
            ))
          )}
        </div>
      </EnhancedCardContent>
    </EnhancedCard>
  )
}
