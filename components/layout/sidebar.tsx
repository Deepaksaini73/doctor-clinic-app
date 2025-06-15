"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import {
  LayoutDashboard,
  Calendar,
  Building2,
  CreditCard,
  UserCheck,
  Users,
  UserPlus,
  User,
  Settings,
  HelpCircle,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Menu,
  X,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface SidebarProps {
  userRole: string
}

export default function Sidebar({ userRole }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const pathname = usePathname()
  const router = useRouter()

  const handleLogout = () => {
    localStorage.removeItem("token")
    localStorage.removeItem("user")
    router.push("/")
  }

  const menuItems = [
    {
      title: "Dashboard",
      icon: LayoutDashboard,
      href: userRole === "admin" ? "/admin/dashboard" : userRole === "doctor" ? "/doctor/dashboard" : "/receptionist",
      roles: ["admin", "doctor", "receptionist"],
    },
    {
      title: "Appointment",
      icon: Calendar,
      href: "/appointments",
      roles: ["admin", "doctor", "receptionist"],
    },
    {
      title: "Room",
      icon: Building2,
      href: "/rooms",
      roles: ["admin", "receptionist"],
    },
    {
      title: "Payment",
      icon: CreditCard,
      href: "/payments",
      roles: ["admin", "receptionist"],
    },
  ]

  const managementItems = [
    {
      title: "Doctor",
      icon: UserCheck,
      href: "/doctors",
      roles: ["admin"],
    },
    {
      title: "Patient",
      icon: Users,
      href: "/patients",
      roles: ["admin", "doctor", "receptionist"],
    },
    {
      title: "Inpatient",
      icon: UserPlus,
      href: "/inpatients",
      roles: ["admin", "doctor"],
    },
  ]

  const settingItems = [
    {
      title: "User",
      icon: User,
      href: "/users",
      roles: ["admin"],
    },
    {
      title: "Settings",
      icon: Settings,
      href: "/settings",
      roles: ["admin", "doctor", "receptionist"],
    },
  ]

  const filterItemsByRole = (items: any[]) => {
    return items.filter((item) => item.roles.includes(userRole))
  }

  const NavItem = ({ item, isActive, onClick }: { item: any; isActive: boolean; onClick?: () => void }) => (
    <Link
      href={item.href}
      onClick={onClick}
      className={cn(
        "flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-lg transition-colors",
        isActive
          ? "bg-blue-50 text-blue-600 border-r-2 border-blue-600"
          : "text-gray-600 hover:bg-gray-50 hover:text-gray-900",
      )}
    >
      <item.icon className="h-5 w-5" />
      {!collapsed && <span>{item.title}</span>}
    </Link>
  )

  const SidebarContent = () => (
    <>
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">C</span>
            </div>
            {!collapsed && <span className="font-semibold text-gray-900">Clinicare</span>}
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setCollapsed(!collapsed)}
            className="h-8 w-8 p-0 hidden md:flex"
          >
            {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </Button>
          <Button variant="ghost" size="sm" onClick={() => setMobileOpen(false)} className="h-8 w-8 p-0 md:hidden">
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex-1 p-4 space-y-6">
        {/* Main Menu */}
        <div>
          {!collapsed && <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-3">Menu</p>}
          <nav className="space-y-1">
            {filterItemsByRole(menuItems).map((item) => (
              <NavItem
                key={item.href}
                item={item}
                isActive={pathname === item.href}
                onClick={() => setMobileOpen(false)}
              />
            ))}
          </nav>
        </div>

        {/* Management */}
        {filterItemsByRole(managementItems).length > 0 && (
          <div>
            {!collapsed && (
              <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-3">Management</p>
            )}
            <nav className="space-y-1">
              {filterItemsByRole(managementItems).map((item) => (
                <NavItem
                  key={item.href}
                  item={item}
                  isActive={pathname === item.href}
                  onClick={() => setMobileOpen(false)}
                />
              ))}
            </nav>
          </div>
        )}

        {/* Settings */}
        <div>
          {!collapsed && <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-3">Setting</p>}
          <nav className="space-y-1">
            {filterItemsByRole(settingItems).map((item) => (
              <NavItem
                key={item.href}
                item={item}
                isActive={pathname === item.href}
                onClick={() => setMobileOpen(false)}
              />
            ))}
          </nav>
        </div>
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-gray-200 space-y-1">
        <Link
          href="/help"
          onClick={() => setMobileOpen(false)}
          className="flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900 rounded-lg transition-colors"
        >
          <HelpCircle className="h-5 w-5" />
          {!collapsed && <span>Help Center</span>}
        </Link>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors"
        >
          <LogOut className="h-5 w-5" />
          {!collapsed && <span>Logout</span>}
        </button>
      </div>
    </>
  )

  return (
    <>
      {/* Mobile Menu Button */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setMobileOpen(true)}
        className="fixed top-4 left-4 z-50 md:hidden bg-white shadow-md"
      >
        <Menu className="h-5 w-5" />
      </Button>

      {/* Mobile Overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden" onClick={() => setMobileOpen(false)} />
      )}

      {/* Desktop Sidebar */}
      <div
        className={cn(
          "bg-white border-r border-gray-200 flex flex-col transition-all duration-300 hidden md:flex",
          collapsed ? "w-16" : "w-64",
        )}
      >
        <SidebarContent />
      </div>

      {/* Mobile Sidebar */}
      <div
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 flex flex-col transition-transform duration-300 md:hidden",
          mobileOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <SidebarContent />
      </div>
    </>
  )
}
