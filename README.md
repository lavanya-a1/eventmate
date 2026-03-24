# EventMate

A scalable role-based event management platform designed to handle event creation, seat booking, and waitlist management with enterprise-grade security hardening.

## Tech Stack

### Frontend
- **React** 18+ with Vite (fast build tool)
- **React Router** v7 for navigation
- **TailwindCSS** + PostCSS for styling
- **Axios** for HTTP API communication
- **Framer Motion** for animations
- **Recharts** for data visualization
- **React QR Code** for ticket display
- **Lucide React** for icons

### Backend
- **Node.js** + **Express.js** framework
- **MongoDB** with **Mongoose** ODM
- **JWT Authentication** with httpOnly + Secure + Strict SameSite cookies
- **Passport.js** for OAuth 2.0 (Google)
- **Winston** structured logging (file + console)
- **Cloudinary** for image uploads
- **node-cron** for job scheduling
- **express-rate-limit** for rate limiting
- **Joi** for validation
- **Helmet** for security headers
- **Nodemailer** for email support
- **qrcode** library for QR generation

## Core Features

### ✅ User Management
- Role-based access control (Admin / Organizer / Attendee)
- OAuth 2.0 Google authentication with secure cookie-based sessions via Passport.js
- JWT session management with automatic refresh via httpOnly cookies
- Email verification on user registration
- Password reset and change flows
- User profile management with customizable settings

### ✅ Event Management
- Full CRUD for event creation, editing, and deletion
- Dynamic seat availability tracking with real-time updates
- Event categorization and tagging
- Cloudinary integration for event images
- Attendee export functionality
- Event status tracking (draft, published, cancelled)

### ✅ Booking System  
- RSVP with dynamic seat limits and availability
- Booking status tracking (Pending / Confirmed / Cancelled / Waitlisted)
- QR code generation for each booking
- Check-in scanning and attendance tracking
- Export attendee lists for organizers/admins

### ✅ Real-time Features
- Server-Sent Events (SSE) for live dashboard updates
- Auto-refresh on event/booking changes
- Admin activity stream with full audit logs
- Real-time notification delivery

### ✅ Admin Dashboard (30+ endpoints)
- System-wide event and booking oversight
- User management (role assignment, blocking, deletion)
- Payment transaction monitoring and analytics
- QR code validation and attendance management
- Notification broadcasting and reminder scheduling
- Comprehensive system audit logs with activity tracking
- Home dashboard with key metrics and recent activity

### ✅ Notification System
- Email notifications (structure implemented)
- In-app notification center
- Broadcast messaging capability
- Reminder scheduling for events
- Notification categorization (info, success, warning, error, broadcast, reminder)

### ✅ Feedback & Reviews
- Post-event feedback collection
- Rating system
- Feedback moderation by admin
- Analytics on user feedback

## Project Structure

```
eventmate/
├── backend/
│   ├── src/
│   │   ├── config/              # Database, authentication, service configs
│   │   ├── controllers/         # Route handlers and business logic
│   │   ├── middleware/          # Auth, CORS, CSRF, errorHandler, logging
│   │   ├── models/              # Mongoose schemas
│   │   ├── routes/              # Express route definitions
│   │   ├── services/            # Email, realtime, external service integrations
│   │   ├── utils/               # Logging, async handlers, helpers
│   │   ├── validations/         # Request validation schemas
│   │   ├── app.js               # Express app initialization
│   │   └── server.js            # Server entry point
│   ├── scripts/                 # One-off admin utilities (seed, migrate)
│   └── postman/                 # API collection for manual testing
├── frontend/
│   ├── src/
│   │   ├── api/                 # Axios client and API modules
│   │   ├── components/          # Reusable React components
│   │   ├── context/             # Global auth state management
│   │   ├── pages/               # Route-level page components
│   │   ├── admin/               # Admin dashboard sub-app
│   │   ├── organizer/           # Organizer portal sub-app
│   │   ├── hooks/               # Custom React hooks
│   │   ├── utils/               # Error logging, formatting helpers
│   │   └── App.jsx              # Root component
│   ├── vite.config.js           # Vite build configuration
│   └── tailwind.config.js       # Tailwind styling
└── README.md                    # This file
```

## Getting Started

### Prerequisites
- Node.js 18+ and npm
- MongoDB instance (local or Atlas)
- Cloudinary account for image uploads
- Google OAuth 2.0 credentials

### Backend Setup
```bash
cd backend
npm install
cp .env.example .env

# Configure environment variables:
# - MONGO_URI: MongoDB connection string
# - JWT_SECRET: Strong random string for token signing
# - CORS_ORIGINS: Comma-separated allowed origins
# - NODE_ENV: development / production

npm start
```

### Frontend Setup
```bash
cd frontend
npm install
npm run dev          # Development server
npm run build        # Production build
npm run preview      # Preview production build
```
## Environment Configuration

### Required Environment Variables (Backend)
```env
NODE_ENV=production
MONGO_URI=mongodb+srv://user:pass@cluster.mongodb.net/eventmate
JWT_SECRET=<strong-random-string>
JWT_EXPIRY=15m
REFRESH_TOKEN_EXPIRY=7d
CORS_ORIGINS=https://app.example.com,https://admin.example.com
CLOUDINARY_URL=cloudinary://...
MAIL_HOST=smtp.example.com
MAIL_USER=notifications@example.com
MAIL_PASS=<smtp-password>
STRIPE_SECRET_KEY=sk_live_...
GOOGLE_CLIENT_ID=<oauth-client-id>
GOOGLE_CLIENT_SECRET=<oauth-secret>
```