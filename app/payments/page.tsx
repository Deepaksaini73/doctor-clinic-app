"use client";

import { useState, useEffect } from "react";
import {
  CreditCard,
  Plus,
  Download,
  DollarSign,
  TrendingUp,
  Clock,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import MainLayout from "@/components/layout/main-layout";
import { database } from "@/lib/firebase";
import { ref, get } from "firebase/database";
import { useToast } from "@/hooks/use-toast";
import { PaymentForm } from "./components/PaymentForm";
import { PaymentDetails } from "./components/PaymentDetails";

interface Payment {
  id: string;
  patientName: string;
  amount: number;
  service: string;
  date: string;
  status: "Paid" | "Pending" | "Overdue";
  method: string;
  invoiceId: string;
}

export default function PaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isNewPaymentOpen, setIsNewPaymentOpen] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchPayments();
  }, []);

  const fetchPayments = async () => {
    setIsLoading(true);
    try {
      const paymentsRef = ref(database, "payments");
      const snapshot = await get(paymentsRef);

      if (snapshot.exists()) {
        const paymentsData = Object.entries(snapshot.val())
          .map(([id, data]: [string, any]) => ({
            id,
            ...data,
            amount: Number(data.amount),
          }))
          .sort(
            (a, b) =>
              new Date(b.date).getTime() - new Date(a.date).getTime()
          );

        setPayments(paymentsData);
      } else {
        setPayments([]);
      }
    } catch (error) {
      console.error("Error fetching payments:", error);
      toast({
        title: "Error",
        description: "Failed to load payments",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleExport = () => {
    const csv = [
      [
        "Invoice ID",
        "Patient Name",
        "Service",
        "Amount",
        "Method",
        "Date",
        "Status",
      ],
      ...payments.map((p) => [
        p.invoiceId,
        p.patientName,
        p.service,
        p.amount,
        p.method,
        p.date,
        p.status,
      ]),
    ]
      .map((row) => row.join(","))
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `payments_₹{new Date().toISOString().split("T")[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Paid":
        return "bg-green-100 text-green-800";
      case "Pending":
        return "bg-yellow-100 text-yellow-800";
      case "Overdue":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const filteredPayments = payments
    .filter((p) => filterStatus === "all" || p.status === filterStatus)
    .filter(
      (p) =>
        p.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.invoiceId.toLowerCase().includes(searchTerm.toLowerCase())
    );

  const totalRevenue = payments.reduce((sum, p) => sum + p.amount, 0);
  const paidAmount = payments
    .filter((p) => p.status === "Paid")
    .reduce((sum, p) => sum + p.amount, 0);
  const pendingAmount = payments
    .filter((p) => p.status === "Pending")
    .reduce((sum, p) => sum + p.amount, 0);
  const overdueAmount = payments
    .filter((p) => p.status === "Overdue")
    .reduce((sum, p) => sum + p.amount, 0);

  const handlePaymentComplete = async () => {
    setIsNewPaymentOpen(false);
    await fetchPayments();
    toast({
      title: "Success",
      description: "Payment created successfully",
    });
  };

  return (
    <MainLayout
      title="Payment Management"
      subtitle="Track payments, invoices, and financial transactions"
    >
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
                  <p className="text-sm font-medium text-gray-600">
                    Total Revenue
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    ₹{totalRevenue.toFixed(2)}
                  </p>
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
                  <p className="text-sm font-medium text-gray-600">
                    Paid Amount
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    ₹{paidAmount.toFixed(2)}
                  </p>
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
                  <p className="text-sm font-medium text-gray-600">
                    Pending
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    ₹{pendingAmount.toFixed(2)}
                  </p>
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
                  <p className="text-sm font-medium text-gray-600">
                    Overdue
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    ₹{overdueAmount.toFixed(2)}
                  </p>
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
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Input
                    placeholder="Search payments..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-64"
                  />
                  <Select
                    value={filterStatus}
                    onValueChange={setFilterStatus}
                  >
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="Paid">Paid</SelectItem>
                      <SelectItem value="Pending">Pending</SelectItem>
                      <SelectItem value="Overdue">Overdue</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button variant="outline" size="sm" onClick={handleExport}>
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
                <Button
                  className="bg-blue-600 hover:bg-blue-700"
                  onClick={() => setIsNewPaymentOpen(true)}
                >
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
                    <th className="text-left py-3 px-4 font-medium text-gray-600">
                      Invoice ID
                    </th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">
                      Patient Name
                    </th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">
                      Service
                    </th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">
                      Amount
                    </th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">
                      Payment Method
                    </th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">
                      Date
                    </th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">
                      Status
                    </th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {isLoading ? (
                    <tr>
                      <td
                        colSpan={8}
                        className="py-8 text-center text-gray-500"
                      >
                        Loading payments...
                      </td>
                    </tr>
                  ) : filteredPayments.length === 0 ? (
                    <tr>
                      <td
                        colSpan={8}
                        className="py-8 text-center text-gray-500"
                      >
                        No payments found
                      </td>
                    </tr>
                  ) : (
                    filteredPayments.map((payment) => (
                      <tr
                        key={payment.id}
                        className="border-b border-gray-100 hover:bg-gray-50"
                      >
                        <td className="py-3 px-4 text-sm font-medium">
                          {payment.invoiceId}
                        </td>
                        <td className="py-3 px-4 text-sm">
                          {payment.patientName}
                        </td>
                        <td className="py-3 px-4 text-sm">
                          {payment.service}
                        </td>
                        <td className="py-3 px-4 text-sm font-medium">
                          ₹{payment.amount.toFixed(2)}
                        </td>
                        <td className="py-3 px-4 text-sm">{payment.method}</td>
                        <td className="py-3 px-4 text-sm">{payment.date}</td>
                        <td className="py-3 px-4 text-sm">
                          <Badge className={getStatusColor(payment.status)}>
                            {payment.status}
                          </Badge>
                        </td>
                        <td className="py-3 px-4 text-sm">
                          <div className="flex items-center gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setSelectedPayment(payment)}
                            >
                              View
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* New Payment Dialog */}
      <Dialog open={isNewPaymentOpen} onOpenChange={setIsNewPaymentOpen}>
        <DialogContent className="text-black sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Create New Payment</DialogTitle>
          </DialogHeader>
          <PaymentForm
            onSuccess={handlePaymentComplete}
            onCancel={() => setIsNewPaymentOpen(false)}
          />
        </DialogContent>
      </Dialog>

      <PaymentDetails
        payment={selectedPayment}
        isOpen={!!selectedPayment}
        onClose={() => setSelectedPayment(null)}
      />
    </MainLayout>
  );
}
