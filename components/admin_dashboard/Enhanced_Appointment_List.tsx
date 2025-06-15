"use client"

import { Plus } from "lucide-react"
import {
  EnhancedCard,
  EnhancedCardContent,
  EnhancedCardHeader,
  EnhancedCardTitle,
} from "@/components/ui/enhanced-card"
import { AnimatedButton } from "@/components/ui/animated-button"

export default function EnhancedAppointmentList() {
  return (
    <EnhancedCard hover gradient>
      <EnhancedCardHeader gradient>
        <div className="flex items-center justify-between">
          <EnhancedCardTitle gradient>Appointment List</EnhancedCardTitle>
          <AnimatedButton size="sm" variant="gradient" animation="shimmer" icon={<Plus className="h-4 w-4" />}>
            <span className="hidden sm:inline">New</span>
          </AnimatedButton>
        </div>
      </EnhancedCardHeader>
      <EnhancedCardContent>
        <div className="space-y-4">
          {[
            { name: "Dr. Sophia Langley", time: "April 23, 2025 • 9:20 pm", color: "blue" },
            { name: "Dr. Oliver Westwood", time: "April 22, 2025 • 8:00 pm", color: "green" },
            { name: "Dr. Victoria Ashford", time: "April 22, 2025 • 8:00 pm", color: "purple" },
          ].map((appointment, index) => (
            <div
              key={index}
              className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:shadow-md transition-all duration-200 hover:border-blue-300"
            >
              <div
                className={`w-10 h-10 rounded-full bg-${appointment.color}-100 flex items-center justify-center`}
              >
                <span className={`text-${appointment.color}-600 font-medium text-sm`}>
                  {appointment.name.split(" ")[1]?.charAt(0)}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm truncate">{appointment.name}</p>
                <p className="text-xs text-gray-500">{appointment.time}</p>
              </div>
            </div>
          ))}
        </div>
      </EnhancedCardContent>
    </EnhancedCard>
  )
}
