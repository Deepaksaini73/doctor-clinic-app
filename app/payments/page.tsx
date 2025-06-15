"use client"

import { useState } from "react"
import { CreditCard, Plus, Download, Filter, DollarSign, TrendingUp, Clock } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import MainLayout from "@/components/layout/main-layout"

export default function PaymentsPage() {
  const [payments, setPayments] = useState([
    {
      id: 1,
      patientName: "Sabrina Marie Gomez",
      amount: 250.0,
      service: "General Consultation",
      date: "2024-03-15",
      status: "Paid",
      method: "Credit Card",
      invoiceId: "INV-001",
    },
    {
      id: 2,
      patientName: "Cody James Fisher",
      amount: 450.0,
      service: "X-Ray & Lab Tests",
      date: "2024-03-14",
      status: "Pending",
      method: "Insurance",
      invoiceId: "INV-002",
    },
    {
      id: 3,
      patientName: "Savannah Lee Nguyen",
      amount: 180.0,
      service: "Follow-up Visit",
      date: "2024-03-13",
      status: "Paid",
      method: "Cash",
      invoiceId: "INV-003",
    },
    {
      id: 4,
      patientName: "Eleanor Grace Pena",
      amount: 320.0,
      service: "Dental Cleaning",
      date: "2024-03-12",
      status: "Overdue",
      method: "Credit Card",
      invoiceId: "INV-004",
    },
    {
      id: 5,
      patientName: "Cameron Michael Williamson",
      amount: 150.0,
      service: "Prescription Refill",
      date: "2024-03-11",
      status: "Paid",
      method: "Debit Card",
      invoiceId: "INV-005",
    },
  ])

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Paid":
        return "bg-green-100 text-green-800"
      case "Pending":
        return "bg-yellow-100 text-yellow-800"
      case "Overdue":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const totalRevenue = payments.reduce((sum, payment) => sum + payment.amount, 0)
  const paidAmount = payments.filter((p) => p.status === "Paid").reduce((sum, payment) => sum + payment.amount, 0)
  const pendingAmount = payments.filter((p) => p.status === "Pending").reduce((sum, payment) => sum + payment.amount, 0)
  const overdueAmount = payments.filter((p) => p.status === "Overdue").reduce((sum, payment) => sum + payment.amount, 0)

  return (
    <MainLayout title="Payment Management" subtitle="Track payments, invoices, and financial transactions">
      <div className="space-y-6">
        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                    <DollarSign className="h-6 w-6 text-blue-600" />
                  </div>
                  <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                  <p className="text-2xl font-bold text-gray-900">${totalRevenue.toFixed(2)}</p>
                </div>
                <div className="text-right">
                  <span className="text-sm font-medium text-green-600">↗ 12.5%</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                    <TrendingUp className="h-6 w-6 text-green-600" />
                  </div>
                  <p className="text-sm font-medium text-gray-600">Paid Amount</p>
                  <p className="text-2xl font-bold text-gray-900">${paidAmount.toFixed(2)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center mb-4">
                    <Clock className="h-6 w-6 text-yellow-600" />
                  </div>
                  <p className="text-sm font-medium text-gray-600">Pending</p>
                  <p className="text-2xl font-bold text-gray-900">${pendingAmount.toFixed(2)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mb-4">
                    <CreditCard className="h-6 w-6 text-red-600" />
                  </div>
                  <p className="text-sm font-medium text-gray-600">Overdue</p>
                  <p className="text-2xl font-bold text-gray-900">${overdueAmount.toFixed(2)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Payments List */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Payment Transactions</CardTitle>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm">
                  <Filter className="h-4 w-4 mr-2" />
                  Filter
                </Button>
                <Button variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
                <Button className="bg-blue-600 hover:bg-blue-700">
                  <Plus className="h-4 w-4 mr-2" />
                  New Payment
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Invoice ID</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Patient Name</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Service</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Amount</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Payment Method</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Date</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Status</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {payments.map((payment) => (
                    <tr key={payment.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-4 text-sm font-medium">{payment.invoiceId}</td>
                      <td className="py-3 px-4 text-sm">{payment.patientName}</td>
                      <td className="py-3 px-4 text-sm">{payment.service}</td>
                      <td className="py-3 px-4 text-sm font-medium">${payment.amount.toFixed(2)}</td>
                      <td className="py-3 px-4 text-sm">{payment.method}</td>
                      <td className="py-3 px-4 text-sm">{payment.date}</td>
                      <td className="py-3 px-4 text-sm">
                        <Badge className={getStatusColor(payment.status)}>{payment.status}</Badge>
                      </td>
                      <td className="py-3 px-4 text-sm">
                        <div className="flex items-center gap-2">
                          <Button variant="ghost" size="sm">
                            View
                          </Button>
                          <Button variant="ghost" size="sm">
                            Print
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
