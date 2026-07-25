# Lead CRM — Assessment Digital Heroes

A full-stack Lead Management CRM built with **React + Vite** (frontend) and **Express + MongoDB** (backend). Features JWT authentication, role-based access control (Admin / Member), lead lifecycle management, activity logging, notes, and a real-time dashboard.

---

## 🚀 Live Demo

| Service  | URL |
|----------|-----|
| **Frontend** | _https://your-vercel-app.vercel.app_ |
| **Backend API** | _https://your-render-app.onrender.com_ |

### Demo Credentials

| Role   | Email                   | Password     |
|--------|-------------------------|--------------|
| Admin  | `admin@leadcrm.dev`     | `Admin@1234` |
| Member | `member@leadcrm.dev`    | `Member@1234`|

> These credentials are for the hosted demo only.

---

## Features

- **Authentication** — JWT-based login & registration
- **Role-Based Access Control** — ADMIN and MEMBER roles
- **Lead Management** — Create, view, edit, delete leads with status tracking
- **Lead Assignment** — Admins can assign leads to members
- **Notes** — Attach notes to leads; admins can delete any note
- **Activity Log** — Automatic audit trail on every lead
- **Dashboard** — Summary stats: total leads, leads by status, recent activity
- **Search / Filter / Sort / Pagination** — On the leads list view
- **Responsive UI** — Tailwind CSS v4 + shadcn/ui components

---

## Project Structure

```
assessment_digital_heroes/
├── client/          # React + Vite frontend
│   ├── src/
│   │   ├── auth/    # AuthContext & auth hooks
│   │   ├── components/
│   │   ├── lib/     # API client helpers
│   │   └── pages/
│   ├── vercel.json
│   └── vite.config.js
└── server/          # Express + Mongoose backend
    ├── config/      # DB & env config
    ├── controllers/
    ├── middleware/  # JWT, RBAC, validation, error handler
    ├── models/      # Mongoose schemas
    ├── routes/
    ├── services/
    ├── tests/
    └── server.js
```

---

## Local Development

### Prerequisites

- Node.js >= 18
- MongoDB (local) **or** a MongoDB Atlas free-tier cluster

### Backend

```bash
cd server
npm install
cp .env.example .env
npm run dev
```

### Frontend

```bash
cd client
npm install
cp .env.example .env
npm run dev
```

### Run Tests

```bash
cd server
npm test
```

---

## Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md) for the step-by-step guide.

| Layer     | Platform       |
|-----------|----------------|
| Frontend  | Vercel         |
| Backend   | Render         |
| Database  | MongoDB Atlas  |

---

## API Documentation

See [API.md](./API.md) for the full endpoint reference.

Base URL (production): `https://your-render-app.onrender.com/api`

| Resource              | Methods                                          |
|-----------------------|--------------------------------------------------|
| `/auth`               | POST /register, POST /login                      |
| `/leads`              | GET, POST, GET /:id, PUT /:id, DELETE /:id       |
| `/leads/:id/assign`   | PATCH (Admin only)                               |
| `/leads/:id/notes`    | GET, POST                                        |
| `/notes/:id`          | DELETE (Admin only)                              |
| `/dashboard`          | GET                                              |
| `/users`              | GET (authenticated)                              |

---

## Tech Stack

### Frontend

| Package              | Purpose                    |
|----------------------|----------------------------|
| React 19             | UI framework               |
| Vite 8               | Build tool                 |
| React Router DOM 7   | Client-side routing        |
| Tailwind CSS 4       | Utility-first styling      |
| shadcn/ui            | Accessible UI components   |
| Axios                | HTTP client                |
| React Hook Form + Zod| Form handling & validation |
| Sonner               | Toast notifications        |

### Backend

| Package              | Purpose                    |
|----------------------|----------------------------|
| Express 5            | HTTP framework             |
| Mongoose 9           | MongoDB ODM                |
| jsonwebtoken         | JWT auth                   |
| bcrypt               | Password hashing           |
| express-validator    | Request validation         |
| cors                 | Cross-origin resource sharing |
| morgan               | HTTP request logging       |
| dotenv               | Environment variables      |

---

## AI Usage Statement

AI assistance (Claude / GitHub Copilot) was used during development for:

- **Boilerplate scaffolding** — Express route/controller/model structure
- **Validation schemas** — express-validator middleware chains
- **React component patterns** — form handling with react-hook-form + zod
- **Test setup** — Jest configuration and test structure
- **Documentation** — README, API docs, and deployment guide drafts

All AI-generated code was reviewed, understood, and adapted to fit the project's requirements.

---

## License

ISC
"# Lead-CRM" 
