"use client"

import Link from "next/link"
import Image from "next/image"
import { Github, Linkedin } from "lucide-react"

export default function Footer() {
  return (
    <footer className="bg-gradient-to-br from-gray-800/90 to-gray-700/90 text-white py-8">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center gap-8">
          {/* Logo and Description */}
          <div className="text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start gap-2 mb-3">
              <div className="w-8 h-8 flex items-center justify-center">
                <Image
                  src="/logo.png"
                  alt="Logo"
                  width={32}
                  height={32}
                  className="object-contain"
                />
              </div>
              <div className="flex items-center">
                <span className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                  ओषधि
                </span>
                <span className="mx-2 text-gray-500">|</span>
                <span className="text-lg font-semibold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                  N6T Technologies
                </span>
              </div>
            </div>
            <p className="text-gray-300 text-sm max-w-xs">
              A modern healthcare management solution. Built with ❤️ for June Court Hackathon.
            </p>
          </div>

          {/* Quick Links */}
          <div className="flex flex-wrap items-center justify-center gap-8 mx-auto">
            <Link 
              href="/about" 
              className="text-gray-300 hover:text-blue-400 transition-colors text-center px-4"
            >
              About
            </Link>
            <Link 
              href="/help" 
              className="text-gray-300 hover:text-blue-400 transition-colors text-center px-4"
            >
              Help
            </Link>
            <Link 
              href="/contact" 
              className="text-gray-300 hover:text-blue-400 transition-colors text-center px-4"
            >
              Contact
            </Link>
          </div>

          {/* Social Links */}
          <div className="flex items-center gap-6">
            <a 
              href="https://github.com/Deepaksaini73/doctor-clinic-app" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-gray-300 hover:text-blue-400 transition-colors"
            >
              <Github className="h-5 w-5" />
            </a>
            <a 
              href="https://linkedin.com" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-gray-300 hover:text-blue-400 transition-colors"
            >
              <Linkedin className="h-5 w-5" />
            </a>
          </div>
        </div>

        {/* Team Info & Copyright */}
        <div className="mt-8 pt-4 border-t border-gray-600 text-center">
          <p className="text-sm text-gray-300">
            Built by{" "}
            <span className="font-semibold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              TEAM DSA
            </span>
            {" "}for June Court Hackathon 2025
          </p>
          <p className="text-xs text-gray-400 mt-2">
            &copy; {new Date().getFullYear()} ओषधि. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}