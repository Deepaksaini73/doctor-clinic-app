# 🩺 Doctor Dashboard & AI Prescription Generator

An intelligent, real-time doctor dashboard built for modern healthcare environments. It integrates AI-generated prescription assistance using Gemini API, context-aware response refinement using LangChain, and real-time patient data synchronization using Firebase and MCP protocol.

## 🔧 Tech Stack

- **Frontend**: Next.js (TypeScript), Tailwind CSS
- **Backend**: Firebase Firestore, Firebase Auth, WebSockets
- **AI/LLM Integration**: Gemini API (Google), LangChain
- **Additional Features**: MCP Protocol, Speech Recognition, Text-to-Speech
- **Deployment**: Vercel (serverless architecture)

## ⚙️ Features

- 🧠 **AI-Generated Prescriptions**: Generate medical prescriptions in real-time using the Gemini LLM based on patient inputs and context.
- 🔄 **Realtime Sync**: Bi-directional sync of patient history and doctor actions using Firestore + WebSockets.
- 🔍 **Context Retention**: Powered by LangChain for tracking prior inputs and refining responses accordingly.
- 🗣️ **Voice Recognition & TTS**: Supports voice-based input from doctors and vocal responses using Web Speech API.
- 🛡️ **Authentication**: Secure login with Firebase Auth for verified doctors only.
- 📄 **Editable Flow**: Suggestions by LLM are editable and overrideable with instant feedback to the system.


