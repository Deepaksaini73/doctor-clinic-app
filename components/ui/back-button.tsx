"use client"

import Link from "next/link"
import { ChevronLeft } from "lucide-react"
import { motion } from "framer-motion"

export function BackButton() {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      className="fixed top-6 left-6 z-50"
    >
      <Link href="/">
        <button className="group flex items-center gap-2 px-4 py-2 rounded-full bg-white/90 backdrop-blur-sm shadow-md hover:shadow-lg transition-all duration-300">
          <ChevronLeft className="w-5 h-5 text-blue-600 group-hover:-translate-x-1 transition-transform" />
          <span className="text-gray-700 group-hover:text-blue-600 transition-colors">Back to Home</span>
        </button>
      </Link>
    </motion.div>
  )
}