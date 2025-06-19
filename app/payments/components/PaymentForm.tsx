import { useState } from "react"
import { z } from "zod"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { database } from "@/lib/firebase"
import { ref, push, set } from "firebase/database"
import { Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

const paymentSchema = z.object({
  patientName: z.string().min(1, "Patient name is required"),
  service: z.string().min(1, "Service is required"),
  amount: z.number().min(0, "Amount must be positive"),
  method: z.string().min(1, "Payment method is required"),
  status: z.enum(["Paid", "Pending", "Overdue"]),
  notes: z.string().optional(),
})

type PaymentFormData = z.infer<typeof paymentSchema>

interface PaymentFormProps {
  onSuccess: () => void
  onCancel: () => void
}

const PAYMENT_METHODS = [
  "Cash",
  "Credit Card",
  "Debit Card",
  "UPI",
  "Net Banking",
  "Insurance"
]

const SERVICES = [
  { name: "Consultation", price: 500 },
  { name: "Lab Test", price: 1000 },
  { name: "X-Ray", price: 800 },
  { name: "Medicine", price: 300 },
  { name: "Procedure", price: 2000 },
]

export function PaymentForm({ onSuccess, onCancel }: PaymentFormProps) {
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [selectedService, setSelectedService] = useState(SERVICES[0])

  const form = useForm<PaymentFormData>({
    resolver: zodResolver(paymentSchema),
    defaultValues: {
      amount: SERVICES[0].price,
      status: "Pending",
      notes: "",
      service: SERVICES[0].name,  // Add default service
      method: PAYMENT_METHODS[0],  // Add default method
    },
  })

// Replace the existing generateInvoiceId function with this:
const generateInvoiceId = () => {
  const date = new Date()
  const year = date.getFullYear().toString().slice(-2)
  const month = (date.getMonth() + 1).toString().padStart(2, "0")
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, "0")
  return `INV${year}${month}${random}`
}

  const handleSubmit = async (data: PaymentFormData) => {
    setIsSubmitting(true)
    try {
      // Validate required fields
      if (!data.patientName || !data.service || !data.method || !data.status) {
        throw new Error("Please fill all required fields")
      }

      const paymentsRef = ref(database, "payments")
      const newPaymentRef = push(paymentsRef)
      
      const paymentData = {
        id: newPaymentRef.key,
        patientName: data.patientName,
        service: selectedService.name,
        amount: Number(data.amount),
        method: data.method,
        status: data.status,
        notes: data.notes || "",
        invoiceId: generateInvoiceId(),
        date: new Date().toISOString().split("T")[0],
        createdAt: new Date().toISOString()
      }

      await set(newPaymentRef, paymentData)
      
      // Reset form and state
      form.reset({
        patientName: "",
        service: SERVICES[0].name,
        amount: SERVICES[0].price,
        method: PAYMENT_METHODS[0],
        status: "Pending",
        notes: ""
      })
      setSelectedService(SERVICES[0])
      
      toast({
        title: "Success",
        description: "Payment created successfully",
      })
      
      onSuccess()
    } catch (error) {
      console.error("Error creating payment:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create payment",
        variant: "destructive"
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={form.handleSubmit(handleSubmit)} className="text-black space-y-6">
      <div className="text-black grid grid-cols-2 gap-4">
        <div className="text-black space-y-2">
          <Label htmlFor="patientName">Patient Name</Label>
          <Input
            id="patientName"
            placeholder="Enter patient name"
            {...form.register("patientName")}
          />
          {form.formState.errors.patientName && (
            <p className="text-sm text-red-500">{form.formState.errors.patientName.message}</p>
          )}
        </div>

        <div className="text-black space-y-2">
          <Label>Service</Label>
          <Select
            value={selectedService.name}
            onValueChange={(value) => {
              const service = SERVICES.find(s => s.name === value)
              if (service) {
                setSelectedService(service)
                form.setValue("service", service.name)
                form.setValue("amount", service.price)
              }
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select service" />
            </SelectTrigger>
            <SelectContent>
              {SERVICES.map((service) => (
                <SelectItem key={service.name} value={service.name}>
                  {service.name} - ₹{service.price}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="text-black space-y-2">
          <Label htmlFor="amount">Amount (₹)</Label>
          <Input
            id="amount"
            type="number"
            {...form.register("amount", { valueAsNumber: true })}
          />
        </div>

        <div className="text-black space-y-2">
          <Label>Payment Method</Label>
          <Select 
            defaultValue={PAYMENT_METHODS[0]}
            onValueChange={(value) => form.setValue("method", value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select payment method" />
            </SelectTrigger>
            <SelectContent>
              {PAYMENT_METHODS.map((method) => (
                <SelectItem key={method} value={method}>
                  {method}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {form.formState.errors.method && (
            <p className="text-sm text-red-500">{form.formState.errors.method.message}</p>
          )}
        </div>

        <div className="text-black space-y-2">
          <Label>Status</Label>
          <Select 
            defaultValue="Pending"
            onValueChange={(value: "Paid" | "Pending" | "Overdue") => 
              form.setValue("status", value)
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Paid">Paid</SelectItem>
              <SelectItem value="Pending">Pending</SelectItem>
              <SelectItem value="Overdue">Overdue</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="text-black space-y-2">
          <Label htmlFor="notes">Notes (Optional)</Label>
          <Textarea
            id="notes"
            placeholder="Add any additional notes..."
            {...form.register("notes")}
          />
        </div>
      </div>

      <div className="text-black flex justify-end gap-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Creating...
            </>
          ) : (
            "Create Payment"
          )}
        </Button>
      </div>
    </form>
  )
}