"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Menu, X, Stethoscope } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50)
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? "glass-dark backdrop-blur-xl" : "bg-transparent"
      }`}
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2 group">
            <div className="w-10 h-10 bg-gradient-to-br from-violet to-cyan rounded-xl flex items-center justify-center group-hover:animate-bounce-gentle">
              <Stethoscope className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold text-gradient-rainbow">Smart Clinic</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link href="/" className="nav-link text-white/90 hover:text-white font-medium">
              Home
            </Link>
            <Link href="/features" className="nav-link text-white/90 hover:text-white font-medium">
              Features
            </Link>
            <Link href="/about" className="nav-link text-white/90 hover:text-white font-medium">
              About
            </Link>
            <Link href="/contact" className="nav-link text-white/90 hover:text-white font-medium">
              Contact
            </Link>
            <Link href="/login">
              <Button className="btn-violet px-6 py-2 rounded-full font-semibold">Login</Button>
            </Link>
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden p-2 rounded-lg glass text-white hover:bg-white/10 transition-colors"
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="md:hidden absolute top-16 left-0 right-0 glass-dark backdrop-blur-xl border-t border-white/10 animate-fade-in">
            <div className="px-4 py-6 space-y-4">
              <Link
                href="/"
                className="block text-white/90 hover:text-white font-medium py-2 transition-colors"
                onClick={() => setIsOpen(false)}
              >
                Home
              </Link>
              <Link
                href="/features"
                className="block text-white/90 hover:text-white font-medium py-2 transition-colors"
                onClick={() => setIsOpen(false)}
              >
                Features
              </Link>
              <Link
                href="/about"
                className="block text-white/90 hover:text-white font-medium py-2 transition-colors"
                onClick={() => setIsOpen(false)}
              >
                About
              </Link>
              <Link
                href="/contact"
                className="block text-white/90 hover:text-white font-medium py-2 transition-colors"
                onClick={() => setIsOpen(false)}
              >
                Contact
              </Link>
              <Link href="/login" onClick={() => setIsOpen(false)}>
                <Button className="btn-violet w-full py-3 rounded-full font-semibold">Login</Button>
              </Link>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}
