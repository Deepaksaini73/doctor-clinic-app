"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import type { Appointment, Doctor } from "@/lib/types"
import { useToast } from "@/hooks/use-toast"
import { Download, BarChart, PieChart, LineChart } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { database } from "@/lib/firebase"
import { ref, onValue, get } from "firebase/database"
import {
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  LineChart as RechartsLineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  BarChart as RechartsBarChart,
  Bar
} from 'recharts'

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8']

// Custom label component for better positioning
const CustomLabel = ({ cx, cy, midAngle, outerRadius, percent, name, fill }: any) => {
  const RADIAN = Math.PI / 180
  const sin = Math.sin(-midAngle * RADIAN)
  const cos = Math.cos(-midAngle * RADIAN)
  const sx = cx + (outerRadius + 4) * cos
  const sy = cy + (outerRadius + 4) * sin
  const mx = cx + (outerRadius + 15) * cos
  const my = cy + (outerRadius + 15) * sin
  const ex = mx + (cos >= 0 ? 1 : -1) * 8
  const ey = my
  const textAnchor = cos >= 0 ? 'start' : 'end'

  return (
    <g>
      <path d={`M${sx},${sy}L${mx},${my}L${ex},${ey}`} stroke={fill} fill="none" />
      <circle cx={ex} cy={ey} r={2} fill={fill} stroke="none" />
      <text x={ex + (cos >= 0 ? 1 : -1) * 2} y={ey} textAnchor={textAnchor} fill="#000000" dominantBaseline="central">
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    </g>
  )
}

export default function AnalyticsDashboard() {
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [doctors, setDoctors] = useState<Doctor[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true)
      try {
        // Fetch appointments from Firebase
        const appointmentsRef = ref(database, 'appointments')
        onValue(appointmentsRef, (snapshot) => {
          if (snapshot.exists()) {
            const appointmentsData = Object.values(snapshot.val()) as Appointment[]
            setAppointments(appointmentsData)
          } else {
            setAppointments([])
          }
        })

        // Fetch doctors from Firebase
        const doctorsRef = ref(database, 'doctors')
        onValue(doctorsRef, (snapshot) => {
          if (snapshot.exists()) {
            const doctorsData = Object.values(snapshot.val()) as Doctor[]
            setDoctors(doctorsData)
          } else {
            setDoctors([])
          }
        })
      } catch (error) {
        console.error("Error fetching data:", error)
        toast({
          title: "Error",
          description: "Failed to load analytics data. Please try again.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [toast])

  // Calculate analytics data
  const totalAppointments = appointments.length

  const appointmentsByStatus = {
    scheduled: appointments.filter((app) => app.status === "scheduled").length,
    inProgress: appointments.filter((app) => app.status === "in-progress").length,
    completed: appointments.filter((app) => app.status === "completed").length,
    cancelled: appointments.filter((app) => app.status === "cancelled").length,
  }

  const appointmentsByPriority = {
    routine: appointments.filter((app) => app.priority === "routine").length,
    urgent: appointments.filter((app) => app.priority === "urgent").length,
    emergency: appointments.filter((app) => app.priority === "emergency").length,
  }

  const appointmentsByDoctor = doctors.map((doctor) => ({
    doctorName: doctor.name,
    count: appointments.filter((app) => app.doctorId === doctor.id).length,
  }))

  // Calculate time distribution from actual data
  const timeDistribution = appointments.reduce((acc: { [key: string]: number }, app) => {
    const hour = app.time.split(':')[0] // Extract just the hour part
    acc[hour] = (acc[hour] || 0) + 1
    return acc
  }, {})

  // Create array with all hours (0-23) and initialize with 0 if no appointments
  const timeDistributionArray = Array.from({ length: 24 }, (_, i) => {
    const hour = i.toString().padStart(2, '0')
    return {
      hour: `${hour}:00`,
      count: timeDistribution[hour] || 0
    }
  })

  // Prepare data for charts
  const statusData = [
    { name: 'Scheduled', value: appointmentsByStatus.scheduled },
    { name: 'In Progress', value: appointmentsByStatus.inProgress },
    { name: 'Completed', value: appointmentsByStatus.completed },
    { name: 'Cancelled', value: appointmentsByStatus.cancelled },
  ]

  const priorityData = [
    { name: 'Routine', value: appointmentsByPriority.routine },
    { name: 'Urgent', value: appointmentsByPriority.urgent },
    { name: 'Emergency', value: appointmentsByPriority.emergency },
  ]

  return (
    <div className="space-y-4">
      {/* <Alert className="bg-blue-50 border-blue-200">
        <AlertDescription className="text-blue-800">
          <strong>ML Integration Point:</strong> This dashboard will be enhanced with predictive analytics from your ML
          system to forecast patient volume and resource needs.
        </AlertDescription>
      </Alert> */}

      <h2 className="text-2xl font-bold text-gray-900">Analytics DashBoard</h2>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard
          title="Total Appointments"
          value={totalAppointments}
          description="All appointments"
          icon={<BarChart className="h-4 w-4 text-admin" />}
          color="admin"
        />
        <StatCard
          title="Scheduled"
          value={appointmentsByStatus.scheduled}
          description="Pending appointments"
          icon={<BarChart className="h-4 w-4 text-blue-600" />}
          color="blue"
        />
        <StatCard
          title="Completed"
          value={appointmentsByStatus.completed}
          description="Finished appointments"
          icon={<BarChart className="h-4 w-4 text-green-600" />}
          color="green"
        />
        <StatCard
          title="Urgent/Emergency"
          value={appointmentsByPriority.urgent + appointmentsByPriority.emergency}
          description="High priority cases"
          icon={<BarChart className="h-4 w-4 text-red-600" />}
          color="red"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="border-admin border-t-4">
          <CardHeader>
            <CardTitle>Appointments by Status</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <RechartsPieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  labelLine={true}
                  label={CustomLabel}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value: number) => [`${value} appointments`, 'Count']}
                  contentStyle={{
                    backgroundColor: 'white',
                    border: '1px solid #ccc',
                    borderRadius: '4px',
                    padding: '8px'
                  }}
                />
                <Legend 
                  layout="horizontal" 
                  verticalAlign="bottom" 
                  align="center"
                  wrapperStyle={{
                    paddingTop: '20px'
                  }}
                />
              </RechartsPieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="border-admin border-t-4">
          <CardHeader>
            <CardTitle>Appointments by Priority</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <RechartsPieChart>
                <Pie
                  data={priorityData}
                  cx="50%"
                  cy="50%"
                  labelLine={true}
                  label={CustomLabel}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {priorityData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value: number) => [`${value} appointments`, 'Count']}
                  contentStyle={{
                    backgroundColor: 'white',
                    border: '1px solid #ccc',
                    borderRadius: '4px',
                    padding: '8px'
                  }}
                />
                <Legend 
                  layout="horizontal" 
                  verticalAlign="bottom" 
                  align="center"
                  wrapperStyle={{
                    paddingTop: '20px'
                  }}
                />
              </RechartsPieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card className="border-admin border-t-4">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Hourly Distribution</CardTitle>
            <Button variant="outline" size="sm">
              <Download className="mr-2 h-4 w-4" /> Export
            </Button>
          </div>
          <CardDescription>Appointment distribution throughout the day</CardDescription>
        </CardHeader>
        <CardContent className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <RechartsLineChart data={timeDistributionArray}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="hour" 
                tickFormatter={(hour) => hour.split(':')[0] + 'h'} // Format as "Xh"
              />
              <YAxis />
              <Tooltip 
                formatter={(value: number) => [`${value} appointments`, 'Count']}
                labelFormatter={(hour) => `${hour.split(':')[0]}:00`}
              />
              <Legend />
              <Line type="monotone" dataKey="count" stroke="#8884d8" activeDot={{ r: 8 }} />
            </RechartsLineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card className="border-admin border-t-4">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Doctor Workload</CardTitle>
            <Button variant="outline" size="sm">
              <Download className="mr-2 h-4 w-4" /> Export
            </Button>
          </div>
          <CardDescription>Appointments per doctor</CardDescription>
        </CardHeader>
        <CardContent className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <RechartsBarChart data={appointmentsByDoctor}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="doctorName" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="count" fill="#8884d8" />
            </RechartsBarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  )
}

function StatCard({
  title,
  value,
  description,
  icon,
  color = "gray",
}: {
  title: string
  value: number
  description: string
  icon: React.ReactNode
  color?: string
}) {
  const getBorderClass = () => {
    switch (color) {
      case "admin":
        return "border-admin border-t-4"
      case "blue":
        return "border-blue-600 border-t-4"
      case "green":
        return "border-green-600 border-t-4"
      case "red":
        return "border-red-600 border-t-4"
      default:
        return "border-gray-600 border-t-4"
    }
  }

  return (
    <Card className={getBorderClass()}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <p className="text-xs text-gray-500">{description}</p>
      </CardContent>
    </Card>
  )
}
