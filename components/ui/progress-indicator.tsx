"use client"
import { cn } from "@/lib/utils"

interface ProgressIndicatorProps {
  steps: string[]
  currentStep: number
  className?: string
}

export function ProgressIndicator({ steps, currentStep, className }: ProgressIndicatorProps) {
  return (
    <div className={cn("w-full", className)}>
      <div className="flex items-center justify-between mb-4">
        {steps.map((step, index) => (
          <div key={index} className="flex flex-col items-center flex-1">
            <div
              className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all duration-300",
                index < currentStep
                  ? "bg-green-600 text-white"
                  : index === currentStep
                    ? "bg-blue-600 text-white ring-4 ring-blue-100"
                    : "bg-gray-200 text-gray-500",
              )}
            >
              {index < currentStep ? "✓" : index + 1}
            </div>
            <span
              className={cn(
                "mt-2 text-xs font-medium text-center",
                index <= currentStep ? "text-gray-900" : "text-gray-500",
              )}
            >
              {step}
            </span>
          </div>
        ))}
      </div>
      <div className="relative">
        <div className="absolute top-4 left-0 w-full h-0.5 bg-gray-200" />
        <div
          className="absolute top-4 left-0 h-0.5 bg-blue-600 transition-all duration-500"
          style={{ width: `${(currentStep / (steps.length - 1)) * 100}%` }}
        />
      </div>
    </div>
  )
}

interface CircularProgressProps {
  value: number
  max?: number
  size?: "sm" | "md" | "lg"
  color?: "blue" | "green" | "red" | "yellow"
  showValue?: boolean
  className?: string
}

export function CircularProgress({
  value,
  max = 100,
  size = "md",
  color = "blue",
  showValue = true,
  className,
}: CircularProgressProps) {
  const percentage = Math.min((value / max) * 100, 100)
  const circumference = 2 * Math.PI * 45
  const strokeDashoffset = circumference - (percentage / 100) * circumference

  const sizeClasses = {
    sm: "w-16 h-16",
    md: "w-24 h-24",
    lg: "w-32 h-32",
  }

  const colorClasses = {
    blue: "text-blue-600",
    green: "text-green-600",
    red: "text-red-600",
    yellow: "text-yellow-600",
  }

  return (
    <div className={cn("relative", sizeClasses[size], className)}>
      <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
        <circle cx="50" cy="50" r="45" stroke="currentColor" strokeWidth="8" fill="none" className="text-gray-200" />
        <circle
          cx="50"
          cy="50"
          r="45"
          stroke="currentColor"
          strokeWidth="8"
          fill="none"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          className={cn("transition-all duration-1000", colorClasses[color])}
        />
      </svg>
      {showValue && (
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-lg font-semibold text-gray-900">{Math.round(percentage)}%</span>
        </div>
      )}
    </div>
  )
}
