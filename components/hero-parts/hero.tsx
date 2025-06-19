"use client"

import Link from "next/link"
import { ArrowRight, Heart, Play } from "lucide-react"
import { EnhancedCard, EnhancedCardContent } from "@/components/ui/enhanced-card"
import { AnimatedButton } from "@/components/ui/animated-button"

export default function Hero() {
  return (
    <section className="bg-gradient-to-br from-white via-blue-50 to-indigo-100 py-20 relative overflow-hidden">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-20 left-10 w-20 h-20 bg-blue-200 rounded-full opacity-20 animate-pulse"></div>
          <div className="absolute top-40 right-20 w-32 h-32 bg-indigo-200 rounded-full opacity-20 animate-bounce"></div>
          <div className="absolute bottom-20 left-1/4 w-24 h-24 bg-purple-200 rounded-full opacity-20 animate-pulse"></div>
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <div className="mb-8 animate-fade-in">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                <Heart className="h-8 w-8 text-white" />
              </div>
              <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
                Smart Healthcare
                <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent block">
                  Management System
                </span>
              </h1>
              <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed">
                Streamline your clinic operations with{" "}
                <span className="font-semibold text-blue-600">AI-powered voice recognition</span>,{" "}
                <span className="font-semibold text-indigo-600">intelligent appointment scheduling</span>, and{" "}
                <span className="font-semibold text-purple-600">comprehensive patient management</span>.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <Link href="/login">
                <AnimatedButton
                  size="xl"
                  variant="gradient"
                  animation="glow"
                  icon={<ArrowRight className="h-5 w-5" />}
                  iconPosition="right"
                >
                  Try ओषधि Now
                </AnimatedButton>
              </Link>
              <AnimatedButton size="xl" variant="outline" animation="shimmer" icon={<Play className="h-5 w-5" />}>
                Watch Demo
              </AnimatedButton>
            </div>

            {/* Enhanced Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-16">
              {[
                { value: "99.9%", label: "Uptime", color: "from-blue-500 to-blue-600" },
                { value: "50K+", label: "Patients", color: "from-green-500 to-green-600" },
                { value: "24/7", label: "Support", color: "from-purple-500 to-purple-600" },
                { value: "500+", label: "Clinics", color: "from-orange-500 to-orange-600" },
              ].map((stat, index) => (
                <EnhancedCard key={index} hover className="text-center">
                  <EnhancedCardContent className="p-6">
                    <div
                      className={`text-3xl font-bold bg-gradient-to-r ${stat.color} bg-clip-text text-transparent mb-2`}
                    >
                      {stat.value}
                    </div>
                    <div className="text-gray-600">{stat.label}</div>
                  </EnhancedCardContent>
                </EnhancedCard>
              ))}
            </div>
          </div>
        </div>
      </section>
  )
}