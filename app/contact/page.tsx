"use client"

import { useState, useEffect } from "react"
import { Github, Linkedin, Mail, ExternalLink } from "lucide-react"
import { motion } from "framer-motion"
import { BackButton } from "@/components/ui/back-button"

const contactLinks = [
  {
    title: "View Project Repository",
    description: "Check out our code and contribute",
    icon: <Github className="w-6 h-6" />,
    link: "https://github.com/Deepaksaini73/doctor-clinic-app",
    color: "from-purple-500 to-purple-600"
  },
  {
    title: "Team GitHub Organization",
    description: "Explore our other projects",
    icon: <ExternalLink className="w-6 h-6" />,
    link: "https://github.com/Deepaksaini73/doctor-clinic-app",
    color: "from-blue-500 to-blue-600"
  },
  {
    title: "Connect on LinkedIn",
    description: "Follow our professional journey",
    icon: <Linkedin className="w-6 h-6" />,
    link: "https://www.linkedin.com/in/deepak-saini-b02bab291/",
    color: "from-cyan-500 to-cyan-600"
  },
  {
    title: "Email Us",
    description: "Get in touch for collaborations",
    icon: <Mail className="w-6 h-6" />,
    link: "",
    color: "from-green-500 to-green-600"
  }
]

export default function ContactPage() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50">
        <BackButton />
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Get in Touch with{" "}
            <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              Team DSA
            </span>
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            We'd love to hear from you! Check out our project and connect with us.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {contactLinks.map((item, index) => (
            <motion.a
              key={index}
              href={item.link}
              target="_blank"
              rel="noopener noreferrer"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="group bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300"
            >
              <div className="p-6">
                <div className={`w-12 h-12 rounded-lg bg-gradient-to-r ${item.color} flex items-center justify-center text-white mb-4 group-hover:scale-110 transition-transform duration-300`}>
                  {item.icon}
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                  {item.title}
                </h3>
                <p className="text-gray-600">{item.description}</p>
              </div>
            </motion.a>
          ))}
        </div>

        <div className="mt-16 text-center text-gray-600">
          <p>Made with ❤️ by Team DSA</p>
          <p className="text-sm mt-2">
            A project for June Court Hackathon 2025 at NIT Rourkela
          </p>
        </div>
      </div>
    </div>
  )
}