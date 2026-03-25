# SocioSphere — Smart Society Management System

A full-stack SaaS-style web application for managing residential housing societies in India.(Still in Development)

##  Tech Stack

**Frontend:** React (Vite), TailwindCSS v3, React Router v6, Axios, React Hook Form, Recharts, Lucide React  
**Backend:** Node.js, Express.js, Prisma ORM, PostgreSQL, JWT, bcryptjs  
**Design:** Glassmorphism dark theme, role-based UI (Admin / Resident)

---

##  Features

| Module | Description |
|--------|-------------|
|  Auth | Register / Login with JWT, role-based access |
|  Resident Management | Admin CRUD for all residents |
|  Community Polls | Create polls, cast votes, auto-expire, AI summary |
|  Parking Management | Visual slot grid, assign/release, bulk creation |
|  Marketplace | Buy/sell second-hand items with image upload & AI categorization |
|  Notifications | Per-user inbox + admin broadcast |
|  AI Insights | Dashboard analytics with activity logs |
|  Profile | Update profile info & change password |

---

##  Setup & Installation

### Prerequisites
- Node.js 18+
- PostgreSQL 14+ (running locally)
- A Cloudinary account (free tier works)

---


##  Demo Credentials

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@sociosphere.com | admin123 |
| Resident | rahul@example.com | resident123 |

> All 5 seeded residents use the password `resident123`  
> Other resident emails: `priya@example.com`, `amit@example.com`, `sneha@example.com`, `vikram@example.com`

---

##  Project Structure

```
sociosphere/
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma       # Database schema
│   │   └── seed.js             # Demo data seeder
│   ├── src/
│   │   ├── config/             # Prisma & Cloudinary config
│   │   ├── controllers/        # Business logic (auth, residents, polls, etc.)
│   │   ├── middleware/         # Auth, validation, error, upload
│   │   └── routes/             # Express route definitions
│   ├── server.js               # Express app entry point
│   └── .env                    # Environment variables
│
└── frontend/
    ├── src/
    │   ├── components/
    │   │   ├── layout/         # Sidebar, Topbar, AppLayout
    │   │   └── common/         # Shared UI components
    │   ├── context/            # AuthContext (JWT state)
    │   ├── pages/
    │   │   ├── Landing.jsx
    │   │   ├── auth/           # Login, Register
    │   │   ├── admin/          # Dashboard, Residents, AI Insights
    │   │   ├── resident/       # Resident Dashboard
    │   │   ├── polls/
    │   │   ├── parking/
    │   │   ├── marketplace/
    │   │   ├── notifications/
    │   │   └── profile/
    │   ├── services/           # Axios API service layer
    │   └── App.jsx             # React Router configuration
    └── vite.config.js          # Vite + API proxy config
```

---