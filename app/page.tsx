"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { ArrowRight, Shield, Zap, Mic, Play, Heart, Star } from "lucide-react"
import { EnhancedCard, EnhancedCardContent } from "@/components/ui/enhanced-card"
import { AnimatedButton } from "@/components/ui/animated-button"

export default function Home() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50">
      {/* Enhanced Header */}
      <header className="bg-white/80 backdrop-blur-md shadow-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">C</span>
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                Clinicare
              </span>
            </div>
            <div className="flex items-center gap-4">
              <Link href="/about" className="text-gray-600 hover:text-gray-900 transition-colors">
                About
              </Link>
              {/* <Link href="/features" className="text-gray-600 hover:text-gray-900 transition-colors">
                Features
              </Link> */}
              <Link href="/contact" className="text-gray-600 hover:text-gray-900 transition-colors">
                Contact
              </Link>
              <Link href="/login">
                <AnimatedButton variant="gradient" animation="shimmer">
                  Login
                </AnimatedButton>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Enhanced Hero Section */}
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
                  Get Started Free
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

      {/* Enhanced Features Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Powerful Features for{" "}
              <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                Modern Healthcare
              </span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Everything you need to manage your clinic efficiently and provide excellent patient care
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: <Mic className="h-8 w-8" />,
                title: "Voice Recognition",
                description:
                  "Advanced AI-powered voice input for seamless appointment booking and patient data entry with 99% accuracy",
                gradient: "from-blue-500 to-blue-600",
              },
              {
                icon: <Shield className="h-8 w-8" />,
                title: "Secure & Compliant",
                description:
                  "HIPAA compliant with enterprise-grade security and end-to-end encryption to protect sensitive patient information",
                gradient: "from-green-500 to-green-600",
              },
              {
                icon: <Zap className="h-8 w-8" />,
                title: "AI-Powered Insights",
                description:
                  "Intelligent prescription suggestions, predictive analytics, and automated diagnosis assistance for better outcomes",
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

      {/* Enhanced Testimonials */}
      <section className="py-20 bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Trusted by Healthcare{" "}
              <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                Professionals Worldwide
              </span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                name: "Dr. Sarah Johnson",
                role: "Chief Medical Officer",
                content:
                  "Smart Clinic has revolutionized our patient management. The AI suggestions are incredibly accurate and have improved our diagnosis efficiency by 40%.",
                rating: 5,
                avatar: "SJ",
                color: "from-blue-500 to-blue-600",
              },
              {
                name: "Maria Rodriguez",
                role: "Head Receptionist",
                content:
                  "The voice recognition feature saves us hours every day. Appointment booking has never been easier, and patients love the quick check-in process.",
                rating: 5,
                avatar: "MR",
                color: "from-green-500 to-green-600",
              },
              {
                name: "Dr. Michael Chen",
                role: "Family Physician",
                content:
                  "The integrated system helps me provide better care with comprehensive patient histories at my fingertips. It's like having a medical assistant that never sleeps.",
                rating: 5,
                avatar: "MC",
                color: "from-purple-500 to-purple-600",
              },
            ].map((testimonial, index) => (
              <EnhancedCard key={index} hover shadow="lg">
                <EnhancedCardContent className="p-6">
                  <div className="flex mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                    ))}
                  </div>
                  <p className="text-gray-700 mb-6 italic leading-relaxed">"{testimonial.content}"</p>
                  <div className="flex items-center">
                    <div
                      className={`w-12 h-12 bg-gradient-to-r ${testimonial.color} rounded-full flex items-center justify-center text-white font-bold mr-4`}
                    >
                      {testimonial.avatar}
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900">{testimonial.name}</div>
                      <div className="text-gray-600 text-sm">{testimonial.role}</div>
                    </div>
                  </div>
                </EnhancedCardContent>
              </EnhancedCard>
            ))}
          </div>
        </div>
      </section>

      {/* Enhanced CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-indigo-600 relative overflow-hidden">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="container mx-auto px-4 text-center relative z-10">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-4xl font-bold text-white mb-6">Ready to Transform Your Healthcare Practice?</h2>
            <p className="text-xl text-blue-100 mb-8">
              Join thousands of healthcare professionals who trust Clinicare for their daily operations
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
                  Start Free Trial
                </AnimatedButton>
              </Link>
              <AnimatedButton
                size="xl"
                variant="outline"
                className="border-white text-white hover:bg-white hover:text-blue-600"
                animation="shimmer"
              >
                Schedule Demo
              </AnimatedButton>
            </div>
          </div>
        </div>
      </section>

      {/* Enhanced Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">C</span>
                </div>
                <span className="text-xl font-bold">Clinicare</span>
              </div>
              <p className="text-gray-400">Revolutionizing healthcare management with intelligent technology.</p>
            </div>

            {[
              {
                title: "Product",
                links: [
                  { name: "Features", href: "/features" },
                  { name: "Pricing", href: "/pricing" },
                  { name: "Security", href: "/security" },
                ],
              },
              {
                title: "Company",
                links: [
                  { name: "About", href: "/about" },
                  { name: "Careers", href: "/careers" },
                  { name: "Contact", href: "/contact" },
                ],
              },
              {
                title: "Support",
                links: [
                  { name: "Help Center", href: "/help" },
                  { name: "Documentation", href: "/docs" },
                  { name: "System Status", href: "/status" },
                ],
              },
            ].map((section, index) => (
              <div key={index}>
                <h3 className="font-semibold mb-4">{section.title}</h3>
                <ul className="space-y-2 text-gray-400">
                  {section.links.map((link, linkIndex) => (
                    <li key={linkIndex}>
                      <Link href={link.href} className="hover:text-white transition-colors">
                        {link.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 Clinicare. All rights reserved. Made with ❤️ for healthcare professionals.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
