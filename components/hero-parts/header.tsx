"use client"

import Link from "next/link"
import Image from "next/image"
import { AnimatedButton } from "@/components/ui/animated-button"

export default function Header() {
  return (
    <header className="bg-white/80 backdrop-blur-md shadow-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 flex items-center justify-center">
                <Image
                  src="/logo.png" // Ensure your logo is in the public folder
                  alt="Logo"
                  width={32}
                  height={32}
                  className="object-contain"
                />
              </div>
              <div className="flex items-center">
                <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  ओषधि
                </span>
                <span className="mx-2 text-gray-300">|</span>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Link href="/about" className="text-gray-600 hover:text-gray-900 transition-colors">
                About
              </Link>
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
  )
}