# 🌟 TalentOS - Modern Recruitment & ATS Platform

Welcome to **TalentOS**, a premium, production-grade SaaS Applicant Tracking System (ATS) designed to connect ambitious students with forward-thinking companies. I built this project to deliver a seamless, highly-polished experience for both Hiring Managers and Students, heavily enhanced by Google Gemini AI capabilities and real-time job scraping.

---

## 🔗 Live Links & Submission Details

**1. Public GitHub Repo:** `https://github.com/KoushikGIT7/TalentOS`
**2. Live Frontend URL:** `https://talent-os-sage.vercel.app/`
**3. Backend API URL:** `https://talent-os-c3kt.vercel.app/` 

### 🔐 Test Login Credentials

Feel free to explore the platform using these test accounts:

**Hiring Manager Account:**
- **Email:** `sample@gmail.com`
- **Password:** `sample123`

**Student Account:**
- **Email:** `samplestd@gmail.com`
- **Password:** `samplestd123`

---

## 🚀 Core Features Included

I have successfully implemented all the requested features for this project:

### 1. Authentication & Security
- Fully secure **Signup/Login** system utilizing **JWT (JSON Web Tokens)**.
- Strict **Role-Based Access Control (RBAC)** using a `role` field (`STUDENT` vs `HIRING_MANAGER`).
- Protected API routes and protected React frontend routes that restrict access based on the logged-in user's role.

### 2. Job Scraper Module (Student Role)
- **Live Web Scraping via RapidAPI:** Instead of basic web scrapers that get blocked by CAPTCHAs, this project uses the **JSearch API (via RapidAPI)**.
- **How it Works:** When a student searches for a role (like "React Developer"), the backend instantly reaches out and scrapes live, real-time job postings across the internet (including LinkedIn, Indeed, Glassdoor, and direct company career pages).
- **External Redirects:** Students can browse these aggregated real-time jobs in the same feed as internal jobs. Clicking "Apply Externally" redirects them straight to the original company's application page.
- **Smart Caching:** Added a 15-minute backend cache so that popular searches load instantly and don't waste API quota.

### 3. Job Posting & Management (Hiring Manager Role)
- Full **CRUD operations** on job postings.
- Hiring managers can effortlessly create, edit, view, and delete their own job listings in a dedicated dashboard.

### 4. Job Results Table & Feed
- A beautiful, responsive UI that displays job results showing the **Title, Company, Location, Platform/Source, and Link**.
- Includes an intuitive **Apply button** that intelligently handles both internal platform jobs and external scraped jobs.

### 5. Apply to Job (Student Role)
- Compulsory onboarding ensures students complete their profile (Bio, Skills, Resume link) before applying to internal jobs.
- Clicking "Apply Now" securely saves the **Application record to the MongoDB Database**, linking the Student, Job, and Hiring Manager.

### 6. Application History Page (Student Role)
- Students have a dedicated **Application History timeline view** on their dashboard.
- They can track the exact status of their applications (e.g., Applied, Interviewing, Offered, Rejected) in real-time.

### 7. Applicant Tracking View (Hiring Manager Role)
- A powerful **Kanban-style Applicant Tracking System (ATS)**.
- Hiring Managers can see exactly who applied to their postings, view their profiles and resumes, and drag-and-drop candidates through different pipeline stages.
- Includes a feature to leave private **Recruiter Notes** on candidates.

### 8. Profile Page with CRUD Operations (Both Roles)
- Both Students and Hiring Managers have rich profile pages.
- Users can update their personal information, social links (GitHub, LinkedIn), upload avatars, and manage their core details.

---

## ✨ Bonus Points & Premium Features

I went above and beyond to include these standout bonus features:

- 🧠 **AI Cover Letter Writer (AI Feature):** Students can instantly generate a highly tailored cover letter based on their profile data and the specific job they are applying for using Google Gemini AI.
- 🧠 **AI Fit Analysis & Match Score (AI Feature):** Hiring managers can run an AI analysis on any candidate. Gemini reads the candidate's profile against the job description and outputs a precise Match Percentage (0-100%) along with reasoning.
- 🧠 **AI Job Enhancer (AI Feature):** Hiring Managers can type a basic job description, and the AI will instantly upgrade it to a professional, compelling standard.
- 📌 **Bookmarking (Saved Jobs):** Students can easily "save" or bookmark both internal and external jobs to a dedicated saved jobs list for later viewing.
- 📄 **Resume Upload Integration:** Students can attach their resume URLs during profile completion, which are surfaced directly to hiring managers in the ATS.

---

## 🛠️ Architecture & Tech Stack

**Frontend (Client)**
- **Framework:** React + Vite (TypeScript)
- **Styling:** Tailwind CSS (Custom "Hiring Psychology" Design System, micro-interactions)
- **State Management:** TanStack Query (React Query)
- **Icons & Animations:** Lucide React + Framer Motion

**Backend (Server)**
- **Runtime:** Node.js + Express.js
- **Database:** MongoDB Atlas (Mongoose ODM)
- **Security:** Helmet, bcrypt, CORS, JWT
- **AI Integration:** Google Gemini 1.5 Flash API

---

## 💻 Local Setup Instructions

### 1. Backend Setup
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
```
Start the backend:
```bash
npm run dev
```

### 2. Frontend Setup
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
