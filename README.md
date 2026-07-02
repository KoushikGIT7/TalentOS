# TalentOS - Modern Recruitment ATS Platform

Prepared for **Kalpana Software Solution Pvt. Ltd.**.

here is the live link (vercel): https://talent-os-sage.vercel.app/

TalentOS is a premium SaaS Applicant Tracking System (ATS) designed to connect ambitious students with forward-thinking companies. It provides a seamless, highly-polished experience for both Hiring Managers and Students, heavily enhanced by Google Gemini AI capabilities.

## Architecture & Tech Stack

This project uses a decoupled Client-Server architecture.

**Frontend (Client)**
- **Framework:** React + Vite
- **Language:** TypeScript
- **Styling:** Tailwind CSS (Custom "Hiring Psychology" Design System with Indigo-600 & Teal-600, micro-interactions, responsive)
- **State/Data Fetching:** TanStack Query (React Query)
- **Forms & Validation:** React Hook Form + Zod
- **Icons & Animations:** Lucide React + Framer Motion (for smooth custom loading states)

**Backend (Server)**
- **Runtime:** Node.js
- **Framework:** Express.js
- **Database:** MongoDB Atlas (Mongoose ODM)
- **Authentication:** JWT (JSON Web Tokens) with Role-Based Access Control (RBAC)
- **Security:** Helmet, bcrypt, CORS
- **AI Integration:** Google Gemini 1.5 Flash for high-speed AI text generation and data analysis.

## Core Features

✅ **Authentication & Authorization**: Secure JWT-based auth with `STUDENT` and `HIRING_MANAGER` roles.
✅ **Student Onboarding**: Compulsory profile completion flow capturing Bio, Skills, Resume, GitHub, LinkedIn, and Portfolio with a dynamic Profile Completion Score.
✅ **Job Search & Aggregation**: Unified job search combining internal postings with an **External Job Scraper** (Real-time live scraping of LinkedIn jobs in India using `jobspy-node` with intelligent in-memory caching).
✅ **Saved Jobs**: Students can bookmark jobs to their dashboard.
✅ **Applicant Tracking System (ATS)**: Hiring Managers can move candidates through a structured pipeline (`APPLIED`, `REVIEWING`, `INTERVIEW`, `OFFERED`, `REJECTED`), leave internal Recruiter Notes, and preview resumes natively.
✅ **Duplicate Application Prevention**: Hard blocks on the backend and UI to prevent students from applying to the same job twice.

## Gemini AI Features

🧠 **AI Cover Letter Writer**: Students can instantly generate a highly tailored cover letter based on their complete profile (Bio, Skills, etc.) and the specific Job Title / Description they are applying for.
🧠 **AI Fit Analysis (Match Score)**: Hiring managers can click a button on any candidate to run a fit analysis. Gemini analyzes the candidate's profile against the job description and outputs a precise Match Percentage (0-100%) along with a one-sentence reasoning.
🧠 **AI Job Enhancer**: Hiring Managers can type a basic job description, and Gemini will instantly upgrade it to a professional, compelling standard tailored perfectly to the specific Job Title (e.g. "Video Editor").

## Folder Structure
```
hiringzone/
├── client/                 # React Frontend
│   ├── src/
│   │   ├── components/     # Reusable UI parts (e.g. LoadingAnimation.tsx)
│   │   ├── context/        # Auth context
│   │   ├── pages/          # React Router pages
│   │   ├── services/       # Axios API integration
│   │   ├── hooks/          # Custom hooks (e.g., useDebounce)
│   │   └── index.css       # Tailwind entry and global styles
├── server/                 # Node.js Backend
│   ├── config/             # DB configuration
│   ├── controllers/        # Route logic
│   ├── middleware/         # Auth & error handling
│   ├── models/             # Mongoose schemas
│   ├── routes/             # Express routers
│   └── index.js            # Entry point
└── README.md
```

## Installation & Local Setup

### 1. Prerequisites
- Node.js (v18 or higher)
- MongoDB account (or local MongoDB)

### 2. Backend Setup
```bash
cd server
npm install
```
Create a `.env` file in the `server/` directory:
```env
PORT=5000
MONGO_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/talentos
JWT_SECRET=your_jwt_secret_here
GEMINI_API_KEY=your_gemini_api_key_here
GEMINI_MODEL=gemini-1.5-flash
```
Start the backend:
```bash
npm run dev
```

### 3. Frontend Setup
```bash
cd client
npm install
```
Create a `.env.local` file in the `client/` directory:
```env
VITE_API_URL=http://localhost:5000/api
```
Start the frontend:
```bash
npm run dev
```
The app will be available at `http://localhost:5173`.

## API Endpoints

- **Auth:** `POST /api/auth/register`, `POST /api/auth/login`, `GET /api/auth/saved-jobs`
- **Jobs:** `GET /api/jobs`, `POST /api/jobs`
- **Applications:** `POST /api/applications/:jobId`, `GET /api/applications/my`, `GET /api/applications/job/:jobId`, `PUT /api/applications/:id`
- **Profiles:** `GET /api/profiles/me`, `PUT /api/profiles/me`
- **AI Integration:** `POST /api/ai/enhance-job`, `POST /api/ai/match-score`, `POST /api/ai/generate-cover-letter`

## Deployment Ready
The application is structured to be easily deployed:
- **Frontend** can be deployed directly to Vercel (push the `client` folder or configure Vercel root directory to `client`).
- **Backend** can be deployed to Render or Heroku (push the `server` folder).
