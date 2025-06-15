"use client"

import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"

interface NewAppointment {
  patientName: string
  doctorName: string
  date: string
  status: string
  notes: string
}

interface EnhancedCreateAppointmentProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  newAppointment: NewAppointment
  onNewAppointmentChange: (appointment: NewAppointment) => void
  onCreateAppointment: () => void
}

export default function EnhancedCreateAppointment({
  isOpen,
  onOpenChange,
  newAppointment,
  onNewAppointmentChange,
  onCreateAppointment,
}: EnhancedCreateAppointmentProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button className="bg-blue-600 hover:bg-blue-700">
          <Plus className="w-4 h-4 mr-2" />
          New Appointment
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Create New Appointment</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Patient Name</Label>
              <Select
                value={newAppointment.patientName}
                onValueChange={(value) => onNewAppointmentChange({ ...newAppointment, patientName: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select patient" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Sabrina Gomez">Sabrina Gomez</SelectItem>
                  <SelectItem value="Alexandra Smith">Alexandra Smith</SelectItem>
                  <SelectItem value="Benjamin Johnson">Benjamin Johnson</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Doctor Name</Label>
              <Select
                value={newAppointment.doctorName}
                onValueChange={(value) => onNewAppointmentChange({ ...newAppointment, doctorName: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select doctor" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Dr. Tina">Dr. Tina</SelectItem>
                  <SelectItem value="Dr. Oliver Westwood">Dr. Oliver Westwood</SelectItem>
                  <SelectItem value="Dr. Sophia Langley">Dr. Sophia Langley</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Appointment Date</Label>
              <Input
                type="date"
                value={newAppointment.date}
                onChange={(e) => onNewAppointmentChange({ ...newAppointment, date: e.target.value })}
              />
            </div>
            <div>
              <Label>Status</Label>
              <Select
                value={newAppointment.status}
                onValueChange={(value) => onNewAppointmentChange({ ...newAppointment, status: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Scheduled">Scheduled</SelectItem>
                  <SelectItem value="Completed">Completed</SelectItem>
                  <SelectItem value="Cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div>
            <Label>Notes</Label>
            <Textarea
              placeholder="Enter appointment notes"
              value={newAppointment.notes}
              onChange={(e) => onNewAppointmentChange({ ...newAppointment, notes: e.target.value })}
            />
          </div>
          <div className="flex gap-2 pt-4">
            <Button variant="outline" onClick={() => onOpenChange(false)} className="flex-1">
              Cancel
            </Button>
            <Button onClick={onCreateAppointment} className="flex-1 bg-blue-600 hover:bg-blue-700">
              Create Appointment
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
} 