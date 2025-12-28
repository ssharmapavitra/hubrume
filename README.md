# Hubrume

A LinkedIn-like platform where users can create resume-style profiles, follow each other, post updates, and download their profile as a PDF.

## Tech Stack

- **Backend**: NestJS, Prisma, PostgreSQL
- **Frontend**: Next.js 14, TypeScript, Tailwind CSS
- **Database**: PostgreSQL (localhost:5432)
- **Testing**: Jest, React Testing Library

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- PostgreSQL running on localhost:5432
  - User: postgres
  - Password: root
  - Database: hubrume

### Installation

Install dependencies for all projects:

```bash
npm run install:all
```

Or install individually:

```bash
# Root
npm install

# Backend
cd backend && npm install

# Frontend
cd frontend && npm install
```

### Database Setup

Make sure PostgreSQL is running, then run migrations:

```bash
cd backend
DATABASE_URL="postgresql://postgres:root@localhost:5432/hubrume?schema=public" npx prisma migrate dev
```

### Running the Application

#### Option 1: Using npm script (Recommended)

From the root directory:

```bash
npm run dev
```

This will start both backend (port 3000) and frontend (port 3001) concurrently.

#### Option 2: Using shell script

```bash
./dev.sh
```

#### Option 3: Run individually

```bash
# Terminal 1 - Backend
cd backend
npm run start:dev

# Terminal 2 - Frontend
cd frontend
npm run dev
```

### Access the Application

- **Frontend**: http://localhost:3001
- **Backend API**: http://localhost:3000

## Project Structure

```
hubrume/
├── backend/          # NestJS API
│   ├── src/
│   │   ├── auth/     # Authentication
│   │   ├── profiles/  # Profile management
│   │   ├── follows/   # Follow/unfollow
│   │   ├── posts/     # Text posts
│   │   ├── admin/     # Admin panel
│   │   └── pdf/       # PDF generation
│   └── prisma/        # Database schema
├── frontend/         # Next.js app
│   ├── app/          # App router pages
│   ├── lib/          # API client
│   └── store/        # State management
└── package.json      # Root scripts
```

## Features

- ✅ User authentication (email/password with JWT)
- ✅ Profile management (resume-style with education, work experience, skills)
- ✅ Follow/unfollow users
- ✅ Text-only posts with feed
- ✅ PDF resume download
- ✅ Admin panel (disable users, delete posts)
- ✅ Soft delete for users and posts
- ✅ Active/inactive user status

## Testing

### Backend Tests

```bash
cd backend
npm test
```

### Frontend Tests

```bash
cd frontend
npm test
```

## Environment Variables

### Backend (.env)

```env
DATABASE_URL="postgresql://postgres:root@localhost:5432/hubrume?schema=public"
JWT_SECRET="your-secret-key-change-in-production"
JWT_EXPIRES_IN="7d"
PORT=3000
```

### Frontend

Create `.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:3000
```

## License

MIT
