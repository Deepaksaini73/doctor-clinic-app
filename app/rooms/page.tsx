"use client"

import { useState } from "react"
import { Building2, Plus, Edit, Trash2, Users, Bed, Activity } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import MainLayout from "@/components/layout/main-layout"

export default function RoomsPage() {
  const [rooms, setRooms] = useState([
    {
      id: 1,
      roomNumber: "101",
      type: "General Ward",
      capacity: 4,
      occupied: 2,
      status: "Available",
      floor: "1st Floor",
      equipment: ["Oxygen", "Monitor", "IV Stand"],
    },
    {
      id: 2,
      roomNumber: "102",
      type: "ICU",
      capacity: 1,
      occupied: 1,
      status: "Occupied",
      floor: "1st Floor",
      equipment: ["Ventilator", "Heart Monitor", "Defibrillator"],
    },
    {
      id: 3,
      roomNumber: "201",
      type: "Private Room",
      capacity: 1,
      occupied: 0,
      status: "Available",
      floor: "2nd Floor",
      equipment: ["TV", "AC", "Private Bathroom"],
    },
    {
      id: 4,
      roomNumber: "202",
      type: "Surgery Room",
      capacity: 1,
      occupied: 0,
      status: "Maintenance",
      floor: "2nd Floor",
      equipment: ["Surgery Table", "Anesthesia Machine", "Surgical Lights"],
    },
    {
      id: 5,
      roomNumber: "301",
      type: "Emergency Room",
      capacity: 6,
      occupied: 3,
      status: "Available",
      floor: "3rd Floor",
      equipment: ["Crash Cart", "X-Ray", "Ultrasound"],
    },
  ])

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Available":
        return "bg-green-100 text-green-800"
      case "Occupied":
        return "bg-red-100 text-red-800"
      case "Maintenance":
        return "bg-yellow-100 text-yellow-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const totalRooms = rooms.length
  const availableRooms = rooms.filter((room) => room.status === "Available").length
  const occupiedRooms = rooms.filter((room) => room.status === "Occupied").length
  const maintenanceRooms = rooms.filter((room) => room.status === "Maintenance").length

  return (
    <MainLayout title="Room Management" subtitle="Manage hospital rooms and bed availability">
      <div className="space-y-6">
        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                    <Building2 className="h-6 w-6 text-blue-600" />
                  </div>
                  <p className="text-sm font-medium text-gray-600">Total Rooms</p>
                  <p className="text-2xl font-bold text-gray-900">{totalRooms}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                    <Bed className="h-6 w-6 text-green-600" />
                  </div>
                  <p className="text-sm font-medium text-gray-600">Available</p>
                  <p className="text-2xl font-bold text-gray-900">{availableRooms}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mb-4">
                    <Users className="h-6 w-6 text-red-600" />
                  </div>
                  <p className="text-sm font-medium text-gray-600">Occupied</p>
                  <p className="text-2xl font-bold text-gray-900">{occupiedRooms}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center mb-4">
                    <Activity className="h-6 w-6 text-yellow-600" />
                  </div>
                  <p className="text-sm font-medium text-gray-600">Maintenance</p>
                  <p className="text-2xl font-bold text-gray-900">{maintenanceRooms}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Rooms List */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Room List</CardTitle>
              <Button className="bg-blue-600 hover:bg-blue-700">
                <Plus className="h-4 w-4 mr-2" />
                Add Room
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Room No.</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Type</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Floor</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Capacity</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Occupied</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Status</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Equipment</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {rooms.map((room) => (
                    <tr key={room.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-4 text-sm font-medium">{room.roomNumber}</td>
                      <td className="py-3 px-4 text-sm">{room.type}</td>
                      <td className="py-3 px-4 text-sm">{room.floor}</td>
                      <td className="py-3 px-4 text-sm">{room.capacity}</td>
                      <td className="py-3 px-4 text-sm">{room.occupied}</td>
                      <td className="py-3 px-4 text-sm">
                        <Badge className={getStatusColor(room.status)}>{room.status}</Badge>
                      </td>
                      <td className="py-3 px-4 text-sm">
                        <div className="flex flex-wrap gap-1">
                          {room.equipment.slice(0, 2).map((item, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {item}
                            </Badge>
                          ))}
                          {room.equipment.length > 2 && (
                            <Badge variant="outline" className="text-xs">
                              +{room.equipment.length - 2}
                            </Badge>
                          )}
                        </div>
                      </td>
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
