"use client"

import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { AnimatedButton } from "@/components/ui/animated-button"

export default function CTA() {
  return (
    <section className="py-20 bg-gradient-to-r from-blue-600 to-indigo-600 relative overflow-hidden">
      <div className="absolute inset-0 bg-black/10"></div>
      <div className="container mx-auto px-4 text-center relative z-10">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-4xl font-bold text-white mb-3">
            Experience ओषधि - Digital Healthcare
          </h2>
          <p className="text-lg text-blue-100 mb-4 font-medium">
            स्वास्थ्य सेवा का डिजिटल भविष्य
          </p>
          <p className="text-xl text-blue-100 mb-8">
            A hackathon project aimed at revolutionizing healthcare management through 
            simple yet powerful digital solutions
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/login">
              <AnimatedButton
                size="xl"
                className="bg-white text-blue-600 hover:bg-gray-100"
                animation="glow"
                icon={<ArrowRight className="h-5 w-5" />}
                iconPosition="right"
              >
                Try ओषधि Now
              </AnimatedButton>
            </Link>
            <AnimatedButton
              size="xl"
              variant="outline"
              className="border-white text-white hover:bg-white hover:text-blue-600"
              animation="shimmer"
            >
              Watch Project Demo
            </AnimatedButton>
          </div>
          <p className="text-blue-100 mt-6 text-sm">
            Built with passion by TEAM DSA for June Court Hackathon
          </p>
        </div>
      </div>
    </section>
  )
}