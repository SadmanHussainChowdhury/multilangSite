# MultiLang Site - Next.js Version

A modern, multilingual website built with Next.js 14, MongoDB, and NextAuth. Converted from Laravel to Next.js.

## Features

- 🌍 **Multi-language Support**: 11 languages (English, Arabic, Bengali, Spanish, French, German, Italian, Portuguese, Russian, Japanese, Chinese)
- 🔐 **Authentication**: NextAuth with role-based access control (Admin/User)
- 📝 **Registration System**: Contact form with MongoDB storage
- 👨‍💼 **Admin Panel**: Manage registrations and users
- 🎨 **Modern UI**: Tailwind CSS with responsive design
- ⚡ **Performance**: Next.js 14 with App Router

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Database**: MongoDB with Mongoose
- **Authentication**: NextAuth.js
- **Styling**: Tailwind CSS
- **Internationalization**: next-intl
- **Notifications**: Sonner

## Getting Started

### Prerequisites

- Node.js 18+ 
- MongoDB (local or Atlas)
- npm or yarn

### Installation

1. **Install dependencies**:
   ```bash
   cd nextjs-app
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

4. **Open your browser**:
   Navigate to [http://localhost:3000](http://localhost:3000)

## Project Structure

```
nextjs-app/
├── app/                    # Next.js App Router
│   ├── [locale]/          # Localized routes
│   │   ├── page.tsx       # Home page
│   │   ├── contact/       # Contact page
│   │   └── auth/          # Authentication pages
│   ├── api/               # API routes
│   │   ├── auth/          # NextAuth routes
│   │   ├── registrations/ # Registration API
│   │   └── admin/         # Admin API
│   └── providers.tsx      # Client providers
├── models/                # Mongoose models
├── lib/                   # Utilities
│   ├── mongodb.ts         # MongoDB connection
│   └── auth.ts            # NextAuth config
├── i18n/                  # Internationalization
│   ├── config.ts          # Locale configuration
│   ├── request.ts         # i18n request handler
│   └── messages/          # Translation files
└── middleware.ts          # Auth middleware
```

## API Routes

### Public Routes
- `POST /api/registrations` - Submit registration form
- `GET /api/registrations` - Get registrations (public)

### Protected Routes (Admin)
- `GET /api/admin/registrations` - Get all registrations
- `DELETE /api/admin/registrations/[id]` - Delete registration

## Database Models

- **User**: Authentication and user management
- **Registration**: Contact form submissions
- **Page**: Dynamic content pages
- **Role**: Role-based access control
- **Permission**: Permission management

## Multi-language Support

The app supports 11 languages. Add translation files in `i18n/messages/`:

- `en.json` - English (default)
- `ar.json` - Arabic
- `bn.json` - Bengali
- `es.json` - Spanish
- `fr.json` - French
- And more...

## Authentication

- **Login**: `/auth/login`
- **Dashboard**: `/dashboard` (protected)
- **Admin Panel**: `/admin/*` (admin only)

## Deployment

### Vercel (Recommended)

1. Push to GitHub
2. Import project in Vercel
3. Add environment variables
4. Deploy!

### Other Platforms

- **Railway**: Easy MongoDB + Next.js deployment
- **Render**: Full-stack platform
- **DigitalOcean**: App Platform

## Migration from Laravel

This project was converted from Laravel. Key changes:

- Laravel Blade → React/TSX components
- Laravel Controllers → Next.js API routes
- Eloquent Models → Mongoose schemas
- Laravel Auth → NextAuth
- Laravel i18n → next-intl

## License

MIT

