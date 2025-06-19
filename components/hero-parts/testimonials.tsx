"use client"

import { Star } from "lucide-react"
import { EnhancedCard, EnhancedCardContent } from "@/components/ui/enhanced-card"

export default function Testimonials() {
  return (
    <section className="py-20 bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Trusted by Healthcare Staff at{" "}
              <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                NIT Rourkela ...........
              </span>
            </h2>
            <p className="text-gray-600 text-lg">
              See how ओषधि is transforming healthcare management
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                name: "Dr. Champak Bhattacharyya",
                role: "Senior Medical Officer",
                content:
                  "ओषधि's AI prescription suggestions and patient management system would greatly improve our daily operations. Perfect for our health center needs.",
                rating: 5,
                avatar: "CB",
                color: "from-blue-500 to-blue-600",
              },
              {
                name: "Dr. Sameer Patnaik",
                role: "Medical Officer",
                content:
                  "The automated appointment system and digital prescription management would significantly reduce our paperwork and improve patient care efficiency.",
                rating: 5,
                avatar: "SP",
                color: "from-green-500 to-green-600",
              },
              {
                name: "Sayantan Kundu",
                role: "Junior Assistant",
                content:
                  "As someone handling administrative tasks, this system would streamline our patient records and make appointment scheduling much more organized.",
                rating: 5,
                avatar: "SK",
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
  )
}