# Next.js Project

A modern web application built with Next.js 13+ and React.

## 🚀 Features

- Next.js 13+ with App Router
- React 18
- TypeScript
- Tailwind CSS
- ESLint & Prettier
- Pre-commit hooks with Husky
- API Routes

## 📦 Prerequisites

- Node.js 16+ 
- npm or yarn or pnpm

## 🛠️ Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/your-project-name.git
cd your-project-name
```

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
cp .env.example .env.local
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
├── app/                  # App router directory
│   ├── layout.tsx       # Root layout
│   └── page.tsx         # Home page
├── components/          # React components
├── public/             # Static assets
├── styles/             # Global styles
├── lib/                # Utility functions
├── types/              # TypeScript types
└── package.json        # Project dependencies
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