import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Download, Printer } from "lucide-react"
import { format } from "date-fns"
import { Payment } from "../page"


interface PaymentDetailsProps {
  payment: Payment | null
  isOpen: boolean
  onClose: () => void
}

export function PaymentDetails({ payment, isOpen, onClose }: PaymentDetailsProps) {
  if (!payment) return null

  const handlePrint = () => {
    window.print()
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="text-black sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Payment Details</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6 py-4" id="printable-area">
          {/* Invoice Header */}
          <div className="flex justify-between items-start">
            <div>
              <h3 className="font-bold text-xl">INVOICE</h3>
              <p className="text-gray-500">#{payment.invoiceId}</p>
            </div>
            <div className="text-right">
              <p className="font-medium">Date</p>
              <p className="text-gray-500">{payment.date}</p>
            </div>
          </div>

          <hr className="my-4" />

          {/* Patient Details */}
          <div className="space-y-2">
            <h4 className="font-medium">Patient Details</h4>
            <p className="text-gray-600">{payment.patientName}</p>
          </div>

          {/* Payment Details */}
          <div className="bg-gray-50 p-4 rounded-lg space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Service</p>
                <p className="font-medium">{payment.service}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Amount</p>
                <p className="font-medium">₹{payment.amount.toFixed(2)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Payment Method</p>
                <p className="font-medium">{payment.method}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Status</p>
                <Badge className={getStatusColor(payment.status)}>
                  {payment.status}
                </Badge>
              </div>
            </div>
          </div>

          {/* Notes if any */}
          {payment.notes && (
            <div className="space-y-2">
              <h4 className="font-medium">Notes</h4>
              <p className="text-gray-600">{payment.notes}</p>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-4 mt-6">
          <Button variant="outline" onClick={handlePrint}>
            <Printer className="h-4 w-4 mr-2" />
            Print
          </Button>
          <Button variant="default" onClick={onClose}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

const getStatusColor = (status: string) => {
  switch (status) {
    case "Paid": return "bg-green-100 text-green-800"
    case "Pending": return "bg-yellow-100 text-yellow-800"
    case "Overdue": return "bg-red-100 text-red-800"
    default: return "bg-gray-100 text-gray-800"
  }
}