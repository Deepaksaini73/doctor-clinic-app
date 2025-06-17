"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import type { SystemLog } from "@/lib/types"
import { useToast } from "@/hooks/use-toast"
import { Search, Download, RefreshCw } from "lucide-react"
import { database } from "@/lib/firebase"
import { ref, onValue } from "firebase/database"

export default function SystemLogs() {
  const [logs, setLogs] = useState<SystemLog[]>([])
  const [filteredLogs, setFilteredLogs] = useState<SystemLog[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const { toast } = useToast()

  useEffect(() => {
    const logsRef = ref(database, 'logs')
    onValue(logsRef, (snapshot) => {
      if (snapshot.exists()) {
        const logsData = Object.entries(snapshot.val()).map(([id, data]) => ({
          id,
          ...(data as Omit<SystemLog, 'id'>)
        }))
        // Sort logs by timestamp in descending order
        logsData.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
        setLogs(logsData)
        setFilteredLogs(logsData)
      } else {
        setLogs([])
        setFilteredLogs([])
      }
      setIsLoading(false)
    }, (error) => {
      console.error("Error fetching logs:", error)
      toast({
        title: "Error",
        description: "Failed to load system logs. Please try again.",
        variant: "destructive",
      })
      setIsLoading(false)
    })
  }, [toast])

  useEffect(() => {
    if (searchQuery) {
      const filtered = logs.filter(
        (log) =>
          log.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
          log.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          log.details.toLowerCase().includes(searchQuery.toLowerCase()),
      )
      setFilteredLogs(filtered)
    } else {
      setFilteredLogs(logs)
    }
  }, [searchQuery, logs])

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp)
    return date.toLocaleString()
  }

  const getRoleBadge = (role: string) => {
    switch (role) {
      case "doctor":
        return <Badge className="bg-green-100 text-green-800 border-green-200">Doctor</Badge>
      case "admin":
        return <Badge className="bg-admin bg-opacity-10 text-admin">Admin</Badge>
      default:
        return <Badge className="bg-blue-100 text-blue-800 border-blue-200">Receptionist</Badge>
    }
  }

  return (
    <Card className="border-admin border-t-4">
      <CardHeader>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <CardTitle>System Logs</CardTitle>
            <CardDescription>Activity logs from the system</CardDescription>
          </div>
          <div className="flex gap-2">
            <div className="relative w-full md:w-64">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search logs..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Button variant="outline" size="icon">
              <Download className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-600"></div>
          </div>
        ) : filteredLogs.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            {searchQuery ? "No logs match your search" : "No logs available"}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Timestamp</TableHead>
                  <TableHead>Action</TableHead>
                  <TableHead>User</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Details</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredLogs.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell className="font-mono text-xs">{formatTimestamp(log.timestamp)}</TableCell>
                    <TableCell>{log.action}</TableCell>
                    <TableCell>{log.userName}</TableCell>
                    <TableCell>{getRoleBadge(log.userRole)}</TableCell>
                    <TableCell>
                      <div className="max-w-[300px] truncate">{log.details}</div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
