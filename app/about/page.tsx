"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { Github, Linkedin, Mail, Code, Database, Palette, Brain } from "lucide-react"
import { motion } from "framer-motion"
import { BackButton } from "@/components/ui/back-button"

const teamMembers = [
  {
    name: "Deepak Saini",
    role: "Frontend Developer",
    rollNo: "123CE0119",
    image: "https://res.cloudinary.com/dpt4bhayi/image/upload/v1750315962/deepak_image_dxpubx.jpg", // Add team member images in public/team folder
    github: "https://github.com/Deepaksaini73",
    linkedin: "https://www.linkedin.com/in/deepak-saini-b02bab291/",
    icon: <Palette className="w-6 h-6" />
  },
  {
    name: "Sachin Choudhary",
    role: "Backend Developer",
    rollNo: "123CS0157",
    image: "https://res.cloudinary.com/dpt4bhayi/image/upload/v1750336143/sachin_yoqs9q.jpg",
    github: "https://github.com/ghost-28-02",
    linkedin: "https://www.linkedin.com/in/sachin-choudhary-b87890323?utm_source=share&utm_campaign=share_via&utm_content=profile&utm_medium=ios_app",
    icon: <Database className="w-6 h-6" />
  },
  {
    name: "Shivam Sharma",
    role: "ML Engineer",
    rollNo: "123CR0836",
    image: "https://res.cloudinary.com/dpt4bhayi/image/upload/v1750348714/shivaang_w2eanl.jpg",
    github: "https://github.com/ShivangSharma26",
    linkedin: "https://www.linkedin.com/in/shivang-sharma-9324512a7/",
    icon: <Brain className="w-6 h-6" />
  },
  {
    name: "Shubham Sahoo",
    role: "ML Engineer",
    rollNo: "123CR0834",
    image: "https://res.cloudinary.com/dpt4bhayi/image/upload/v1750333822/1750332647451_vhwz8i.jpg",
    github: "https://github.com/realsubhamsahoo",
    linkedin: "https://www.linkedin.com/in/realsubhamsahoo/",
    icon: <Brain className="w-6 h-6" />
  }
]

export default function AboutPage() {
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
            Meet the Team Behind{" "}
            <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              ओषधि
            </span>
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            A hackathon project by{" "}
            <span className="font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              N6T Technologies
            </span>
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {teamMembers.map((member, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-xl shadow-lg overflow-hidden group hover:shadow-xl transition-all duration-300"
            >
              <div className="relative h-48 bg-gradient-to-br from-blue-600 to-indigo-600">
                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors"></div>
                <Image
                  src={member.image}
                  alt={member.name}
                  fill
                  className="object-cover opacity-90 group-hover:opacity-100 transition-opacity"
                />
              </div>
              <div className="p-6">
                <div className="mb-4">
                  {member.icon}
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-1">{member.name}</h3>
                <p className="text-gray-600 mb-2">{member.role}</p>
                <p className="text-sm text-gray-500 mb-4">{member.rollNo}</p>
                <div className="flex gap-3">
                  <a
                    href={member.github}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-600 hover:text-blue-600 transition-colors"
                  >
                    <Github className="w-5 h-5" />
                  </a>
                  <a
                    href={member.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-600 hover:text-blue-600 transition-colors"
                  >
                    <Linkedin className="w-5 h-5" />
                  </a>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  )
}