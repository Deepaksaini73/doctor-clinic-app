"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

const EnhancedCard = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    hover?: boolean
    gradient?: boolean
    shadow?: "sm" | "md" | "lg" | "xl"
  }
>(({ className, hover = true, gradient = false, shadow = "md", ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "rounded-xl border bg-white text-gray-950 transition-all duration-300",
      hover && "hover:shadow-lg hover:-translate-y-1 cursor-pointer",
      gradient && "bg-gradient-to-br from-white to-gray-50",
      {
        "shadow-sm": shadow === "sm",
        "shadow-md": shadow === "md",
        "shadow-lg": shadow === "lg",
        "shadow-xl": shadow === "xl",
      },
      className,
    )}
    {...props}
  />
))
EnhancedCard.displayName = "EnhancedCard"

const EnhancedCardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    gradient?: boolean
  }
>(({ className, gradient = false, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "flex flex-col space-y-1.5 p-6",
      gradient && "bg-gradient-to-r from-blue-50 to-indigo-50 rounded-t-xl",
      className,
    )}
    {...props}
  />
))
EnhancedCardHeader.displayName = "EnhancedCardHeader"

const EnhancedCardTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement> & {
    gradient?: boolean
  }
>(({ className, gradient = false, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn(
      "font-semibold leading-none tracking-tight",
      gradient && "bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent",
      className,
    )}
    {...props}
  />
))
EnhancedCardTitle.displayName = "EnhancedCardTitle"

const EnhancedCardDescription = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(
  ({ className, ...props }, ref) => <p ref={ref} className={cn("text-sm text-gray-500", className)} {...props} />,
)
EnhancedCardDescription.displayName = "EnhancedCardDescription"

const EnhancedCardContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => <div ref={ref} className={cn("p-6 pt-0", className)} {...props} />,
)
EnhancedCardContent.displayName = "EnhancedCardContent"

const EnhancedCardFooter = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("flex items-center p-6 pt-0", className)} {...props} />
  ),
)
EnhancedCardFooter.displayName = "EnhancedCardFooter"

// Stat Card Component
const StatCard = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    title: string
    value: string | number
    change?: string
    changeType?: "positive" | "negative" | "neutral"
    icon: React.ReactNode
    color?: "blue" | "green" | "purple" | "orange" | "red"
  }
>(({ className, title, value, change, changeType = "neutral", icon, color = "blue", ...props }, ref) => {
  const colorClasses = {
    blue: "from-blue-500 to-blue-600",
    green: "from-green-500 to-green-600",
    purple: "from-purple-500 to-purple-600",
    orange: "from-orange-500 to-orange-600",
    red: "from-red-500 to-red-600",
  }

  const changeClasses = {
    positive: "text-green-600 bg-green-50",
    negative: "text-red-600 bg-red-50",
    neutral: "text-gray-600 bg-gray-50",
  }

  return (
    <EnhancedCard ref={ref} className={cn("overflow-hidden", className)} {...props}>
      <EnhancedCardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <div
              className={cn(
                "w-12 h-12 rounded-lg bg-gradient-to-r flex items-center justify-center text-white",
                colorClasses[color],
              )}
            >
              {icon}
            </div>
            <p className="text-sm font-medium text-gray-600">{title}</p>
            <p className="text-2xl font-bold text-gray-900">{value}</p>
          </div>
          {change && (
            <div className={cn("px-2 py-1 rounded-full text-xs font-medium", changeClasses[changeType])}>{change}</div>
          )}
        </div>
      </EnhancedCardContent>
    </EnhancedCard>
  )
})
StatCard.displayName = "StatCard"

export {
  EnhancedCard,
  EnhancedCardHeader,
  EnhancedCardFooter,
  EnhancedCardTitle,
  EnhancedCardDescription,
  EnhancedCardContent,
  StatCard,
}
