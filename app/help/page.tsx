"use client"

import { useState } from "react"
import { Search } from "lucide-react"
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion"
import { Input } from "@/components/ui/input"
import MainLayout from "@/components/layout/main-layout"

// ✅ Corrected helpContent: no extra bracket, well-formatted
const helpContent = {
    admin: [
        {
            question: "How to manage user accounts?",
            answer: "Navigate to Users page from the admin dashboard. Here you can add new users, edit roles, and manage permissions for doctors and receptionists."
        },
        {
            question: "How to view analytics?",
            answer: "The admin dashboard shows key metrics including appointment statistics, patient distribution, and time-based analytics. Click on specific charts for detailed views."
        }
    ],
    doctor: [
        {
            question: "How to access patient records?",
            answer: "From your dashboard, click on any appointment to view patient details. Medical history and previous prescriptions are available in the patient's profile."
        },
        {
            question: "How to use AI prescription suggestions?",
            answer: "When creating a prescription, click 'Get AI Suggestions'. The system analyzes symptoms and your prescription history to provide relevant recommendations."
        }
    ],
    receptionist: [
        {
            question: "How to schedule appointments?",
            answer: "Use the Appointments page to create new appointments. Select available time slots, choose a doctor, and enter patient details."
        },
        {
            question: "How to manage patient queue?",
            answer: "The dashboard shows today's appointments. Use filters to sort by priority and status. Click on appointments to update their status."
        }
    ],
    patient: [
        {
            question: "How to view my appointments?",
            answer: "Your dashboard shows all upcoming and past appointments. Click on any appointment to view details including prescriptions and doctor notes."
        },
        {
            question: "How to request an appointment?",
            answer: "Use the 'Book Appointment' button on your dashboard. Select preferred time slots and symptoms for faster processing."
        }
    ]
}

export default function HelpPage() {
    const [searchQuery, setSearchQuery] = useState("")

    const filterContent = (content: typeof helpContent) => {
        if (!searchQuery) return content

        const filtered: Partial<typeof helpContent> = {}

        Object.entries(content).forEach(([role, questions]) => {
            const filteredQuestions = questions.filter(
                q =>
                    q.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    q.answer.toLowerCase().includes(searchQuery.toLowerCase())
            )

            if (filteredQuestions.length > 0) {
                filtered[role as keyof typeof helpContent] = filteredQuestions
            }
        })

        return filtered
    }

    const filteredContent = filterContent(helpContent)

    return (
        <MainLayout title="Help Center" subtitle="Find answers to common questions">
            <div className="max-w-4xl mx-auto space-y-8">
                {/* Search */}
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                    <Input
                        placeholder="Search for help..."
                        className="pl-10"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>

                {/* Help Sections */}
                <div className=" text-black grid gap-8">
                    {Object.entries(filteredContent).map(([role, questions]) => (
                        <div key={role} className="space-y-4">
                            <h2 className="text-lg font-semibold capitalize text-blue-900">
                                {role} Guide
                            </h2>
                            <Accordion type="single" collapsible className="space-y-2">
                                {questions.map((item, index) => (
                                    <AccordionItem key={index} value={`${role}-${index}`}>
                                        <AccordionTrigger className="text-left hover:text-blue-600">
                                            {item.question}
                                        </AccordionTrigger>
                                        <AccordionContent className="text-gray-600">
                                            {item.answer}
                                        </AccordionContent>
                                    </AccordionItem>
                                ))}
                            </Accordion>
                        </div>
                    ))}
                </div>
            </div>
        </MainLayout>
    )
}
