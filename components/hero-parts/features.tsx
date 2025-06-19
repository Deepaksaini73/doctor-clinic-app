"use client"

import { Mic, Shield, Zap } from "lucide-react"
import { EnhancedCard, EnhancedCardContent } from "@/components/ui/enhanced-card"

export default function Features() {
  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Powerful Features of{" "}
            <span className="inline-block bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent font-extrabold">
              ओषधि
            </span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            A modern healthcare solution for{" "}
            <span className="inline-block text-3xl font-extrabold bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 bg-clip-text text-transparent">
              N6T Technologies
            </span>

          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            {
              icon: <Mic className="h-8 w-8" />,
              title: "Voice Recognition",
              description:
                "AI-powered speech-to-text system for fast and accurate appointment booking and patient data entry, reducing manual effort at the front desk.",
              gradient: "from-blue-500 to-blue-600",
            },
            {
              icon: <Shield className="h-8 w-8" />,
              title: "Secure & Compliant",
              description:
                "only doctors can view their own patients, only admins can delete records, and an admin portal manages system-wide data and user access.",
              gradient: "from-green-500 to-green-600",
            },
            {
              icon: <Zap className="h-8 w-8" />,
              title: "AI-Powered Insights",
              description:
                "Intelligent diagnosis assistance, auto-generated prescriptions, and predictive analytics powered by an MCP server to support better treatment decisions.",
              gradient: "from-purple-500 to-purple-600",
            },

          ].map((feature, index) => (
            <EnhancedCard key={index} hover shadow="lg" className="group">
              <EnhancedCardContent className="p-8 text-center">
                <div
                  className={`w-16 h-16 bg-gradient-to-r ${feature.gradient} rounded-full flex items-center justify-center mx-auto mb-6 text-white group-hover:scale-110 transition-transform duration-300`}
                >
                  {feature.icon}
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">{feature.title}</h3>
                <p className="text-gray-600 leading-relaxed">{feature.description}</p>
              </EnhancedCardContent>
            </EnhancedCard>
          ))}
        </div>
      </div>
    </section>
  )
}