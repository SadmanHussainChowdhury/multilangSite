# MultiLang Site - Next.js 14 Version

A modern, highly dynamic multilingual website built with Next.js 14 (App Router), MongoDB, and NextAuth. Converted from a legacy Laravel application into a fully real-time React application.

## 🚀 Key Features

- 🌍 **Dynamic Multi-language Support**: 13 languages supported out of the box (English, Vietnamese, Indonesian, Uzbek, Mongolian, Nepali, Burmese, Sinhala, Bengali, Filipino, Khmer, Thai, Korean).
- 🔄 **Real-Time Translation Engine**: Translations can be edited via the Admin Panel and instantly sync to the live frontend within 5 seconds without requiring a build or page refresh.
- 👨‍💼 **Comprehensive Admin Panel**:
  - **Translations Manager**: Side-by-side editing of localized strings with instant live-preview support.
  - **Dynamic Pages System**: Create, edit, and deactivate SEO-friendly pages on the fly with rich text.
  - **Logo Manager**: Instantly update the site's logo across all pages dynamically.
  - **Registrations**: View, manage, and toggle the status of user contact submissions.
- 🔐 **Authentication**: NextAuth.js with secure role-based access control (Admin vs User).
- 📝 **Registration System**: Public contact form with secure MongoDB storage.
- 🎨 **Modern UI**: Tailwind CSS with premium aesthetics, dynamic gradients, glassmorphism, and responsive design.

## 🛠 Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Database**: MongoDB with Mongoose
- **Authentication**: NextAuth.js
- **Styling**: Tailwind CSS
- **Internationalization**: next-intl + Custom MongoDB Cache Engine
- **Notifications**: Sonner

## 🏁 Getting Started

### Prerequisites

- Node.js 18+ 
- MongoDB (local or Atlas)
- npm or yarn

### Installation

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Set up environment variables**:
   ```bash
   cp .env.example .env.local
   ```
   
   Edit `.env.local` and add:
   - `MONGODB_URI`: Your MongoDB connection string
   - `NEXTAUTH_SECRET`: Generate a random secret (use `openssl rand -base64 32`)
   - `NEXTAUTH_URL`: Your app URL (http://localhost:3000 for dev)

3. **Run the development server**:
   ```bash
   npm run dev
   ```

4. **Seed Translations (First Run)**:
   - Log into the Admin panel (`/en/auth/login`) using your admin credentials.
   - Navigate to **Admin -> Translations**.
   - Click **Import from JSON** to automatically seed your database with the default localized strings.

5. **Open your browser**:
   Navigate to [http://localhost:3000](http://localhost:3000)

## 📁 Project Structure

```
nextjs-app/
├── app/                    # Next.js App Router
│   ├── [locale]/          # Localized routes
│   │   ├── page.tsx       # Home page
│   │   ├── admin/         # Full Admin Dashboard (Pages, Translations, Logo, etc.)
│   │   └── auth/          # Authentication pages
│   ├── api/               # API routes
│   │   ├── auth/          # NextAuth routes
│   │   ├── admin/         # Admin API endpoints
│   │   └── translations/  # Real-time translation polling endpoints
│   └── providers.tsx      # Client providers
├── models/                # Mongoose database models
├── lib/                   # Utilities & Caching Logic
│   ├── mongodb.ts         # MongoDB connection
│   └── translationCache.ts# High-performance memory cache for i18n
├── i18n/                  # Internationalization
│   ├── config.ts          # Locale configuration
│   ├── request.ts         # Custom i18n request handler (DB fallback to JSON)
│   └── messages/          # Fallback JSON files
└── middleware.ts          # Auth & Locale middleware
```

## 🌐 Real-Time Translation System

This project features a custom-built, highly optimized translation engine:
1. **Fallback Strategy**: `next-intl` attempts to read translations from the MongoDB database first. If a key is missing, it merges in fallbacks from the local `.json` files.
2. **Memory Caching**: Database translations are stored in a high-speed memory cache on the server.
3. **Cache Invalidation**: When an admin updates a translation, the server purges the cache and increments a global translation version.
4. **Client Polling**: An invisible client component (`TranslationRefresh.tsx`) polls the server every 5 seconds. If a version bump is detected, it triggers a lightweight `router.refresh()` to instantly update the UI.

## 🚀 Deployment

### Vercel (Recommended)

1. Push to GitHub
2. Import project in Vercel
3. Add environment variables for Production, Preview, and Development:
   - `MONGODB_URI`: Your MongoDB connection string
   - `NEXTAUTH_SECRET`: A stable random secret, for example from `openssl rand -base64 32`
   - `NEXTAUTH_URL`: Your deployed app URL, for example `https://your-domain.vercel.app`
4. In MongoDB Atlas, allow Vercel to connect to the database by adding `0.0.0.0/0` in Network Access.
5. Deploy!

### Other Platforms
- **Railway**: Easy MongoDB + Next.js deployment
- **Render**: Full-stack platform
- **DigitalOcean**: App Platform

## 📜 License

MIT
