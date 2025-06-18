# CliniCare - Hospital Management System

A comprehensive hospital management system built with Next.js 13+ and Firebase, designed to streamline healthcare workflows and improve patient care management.

## 🌟 Core Features

### 👨‍⚕️ Doctor Portal
- Real-time appointment dashboard
- Patient medical history access
- AI-powered prescription suggestions
- Appointment status management
- Patient records management

### 👨‍💼 Admin Dashboard
- User management (doctors, receptionists)
- Real-time analytics dashboard
- System monitoring
- User activity tracking
- Role-based access control

### 👩‍💼 Receptionist Portal
- Appointment scheduling
- Patient registration
- Queue management
- Real-time updates
- Patient search functionality

### 👨‍👩‍👦 Patient Features
- Medical history access
- Appointment tracking
- Prescription history
- Profile management

## 🚀 Technical Stack

- **Frontend:** Next.js 13+ (App Router), React 18, TypeScript
- **Styling:** Tailwind CSS, Shadcn UI
- **Database:** Firebase Realtime Database
- **Forms:** React Hook Form
- **Date Handling:** date-fns
- **State Management:** React Context
- **Authentication:** Firebase Auth
- **API:** Next.js API Routes

## 📦 Prerequisites

- Node.js 16+
- Firebase account
- npm/yarn/pnpm
- Git

## ⚡ Quick Start

1. **Clone repository:**
```bash
git clone https://github.com/yourusername/clinicare.git
cd clinicare

2. Install dependencies:
```bash
npm install
# or
yarn install
# or
pnpm install
```

3. Create a `.env.local` file:
```bash
NEXT_PUBLIC_FIREBASE_API_KEY=your_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_DATABASE_URL=your_db_url
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

4. Start the development server:
```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

Visit [http://localhost:3000](http://localhost:3000) to view your application.

## 📁 Project Structure

```
├── app/
│   ├── admin/              # Admin dashboard
│   ├── doctor/             # Doctor portal
│   ├── receptionist/       # Receptionist portal
│   ├── api/               # API routes
│   └── layout.tsx         # Root layout
├── components/
│   ├── admin_dashboard/    # Admin components
│   ├── doctor_dashboard/   # Doctor components
│   ├── patient_dashboard/  # Patient components
│   ├── receptionist_dashboard/ # Receptionist components
│   └── ui/                # Shared UI components
├── lib/
│   ├── firebase.ts        # Firebase config
│   └── utils/             # Utility functions
├── types/                 # TypeScript types
└── styles/               # Global styles
```

## 📝 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build production bundle
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run format` - Format code with Prettier

## ⚙️ Environment Variables

Create a `.env.local` file with the following variables:

```
NEXT_PUBLIC_API_URL=your_api_url
DATABASE_URL=your_database_url
```

## 🚀 Deployment

This project can be deployed using [Vercel](https://vercel.com):

1. Push your code to GitHub
2. Import your repository to Vercel
3. Configure environment variables
4. Deploy!

## 🤝 Contributing

1. Fork the repository
2. Create a new branch: `git checkout -b feature/your-feature`
3. Commit changes: `git commit -m 'Add your feature'`
4. Push to the branch: `git push origin feature/your-feature`
5. Submit a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Next.js Documentation](https://nextjs.org/docs)
- [React Documentation](https://reactjs.org/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)

---

Made with ❤️ using