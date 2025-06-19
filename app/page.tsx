"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { ArrowRight, Shield, Zap, Mic, Play, Heart, Star } from "lucide-react"
import { EnhancedCard, EnhancedCardContent } from "@/components/ui/enhanced-card"
import { AnimatedButton } from "@/components/ui/animated-button"
import Header from "@/components/hero-parts/header"
import Hero from "@/components/hero-parts/hero"
import Features from "@/components/hero-parts/features"
import CTA from "@/components/hero-parts/cta"
import Footer from "@/components/hero-parts/footer"
import Testimonials  from "@/components/hero-parts/testimonials"

export default function Home() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50">
      <Header />
      <Hero />
      <Features />
      <Testimonials />
      <CTA />
      <Footer />
    </div>
  )
}
