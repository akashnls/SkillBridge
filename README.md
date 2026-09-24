# 🚀 SkillBridge — AI-Powered Job & Skill Matching Platform

> **SkillBridge is a full-stack career and recruitment platform that connects job seekers, employers, and administrators through skill-based assessment, job matching, career roadmaps, portfolios, and recruitment workflows.**

SkillBridge is designed to reduce the gap between **what candidates know and what employers need**. Instead of relying only on traditional resumes and academic qualifications, the platform focuses on **skills, assessments, projects, job fit, career development, and employability**.

---

## 📌 Project Overview

SkillBridge provides a unified platform for three major user groups:

* 👨‍💻 **Candidates / Job Seekers** — Build profiles, manage skills, take assessments, explore jobs, create portfolios, follow learning roadmaps, and apply for jobs.
* 🏢 **Employers / Recruiters** — Create job listings, review applicants, evaluate candidate profiles, and manage recruitment pipelines.
* 🛡️ **Administrators** — Manage platform data, users, jobs, skills, assessments, badges, and system-level activities.

The platform combines **skill assessment + job discovery + career development + recruitment management** into a single application.

---

## ✨ Key Features

### 👨‍💻 Candidate Features

* User registration and authentication (with Passkey / WebAuthn support)
* Candidate profile management
* Skill management
* Skill assessments and quizzes
* Job exploration and search
* Job application workflow
* Job-fit explanations
* Personalized skill roadmaps
* Portfolio creation and editing
* Project-based candidate profiles
* AI-powered mock interview experience (with Anthropic Claude integration & heuristic fallback)
* Digital skill badges
* Public badge verification
* Candidate dashboard
* Application tracking

---

### 🏢 Employer & Recruiter Features

* Employer registration and authentication
* Employer dashboard
* Job posting and management
* Candidate discovery and search
* Applicant management
* Applicant pipeline / ATS
* Candidate profile review
* Skill-based candidate evaluation
* Application status management
* Recruitment workflow management
* Employer notifications

---

### 🛡️ Admin Features

* Admin dashboard
* Platform management
* User management
* Job management & moderation
* Skill taxonomy management
* Assessment management
* Badge template & issuance management
* Platform statistics & analytics
* Audit logging
* Administrative controls & settings

---

### 🎯 Skill Assessment

Candidates can evaluate their knowledge through structured assessments.

The assessment system supports:

* Skill-based quizzes
* Question management
* Score calculation
* Assessment results
* Candidate skill evaluation
* Assessment history

---

### 🧭 Skill Roadmaps

SkillBridge helps candidates move from their current skill level toward their target career.

A typical development path can include:

```text
Current Skills
      ↓
Skill Gap Identification
      ↓
Learning / Improvement
      ↓
Assessment
      ↓
Portfolio / Project
      ↓
Job Application
```

---

### 💼 Job Matching & Job Fit

SkillBridge focuses on matching candidates with opportunities based on their skills and qualifications.

Candidates can:

* Explore available jobs
* View job requirements
* Compare their skills with job requirements
* Understand job-fit information
* Apply for suitable positions

Employers can evaluate applicants through their profiles, skills, assessments, and application information.

---

### 📁 Portfolio System

Candidates can showcase practical experience through project-based portfolios.

Portfolio information can include:

* Project title
* Project description
* Technologies used
* Skills demonstrated
* Project links
* Supporting information

This allows candidates to demonstrate **what they can build**, rather than relying only on a traditional resume.

---

### 🏆 Digital Skill Badges

SkillBridge includes a digital badge system for demonstrating verified skills.

Candidates can earn badges based on completed assessments or platform activities.

The platform also provides a **public verification page**, allowing a badge to be checked without requiring a user to log in.

Example:

```text
/verify/<badge-id>
```

---

### 🎤 Mock Interview

The platform provides a comprehensive AI-powered mock interview experience to help candidates prepare for recruitment.

* **Dynamic Question Generation**: Generates role-specific, scenario-based, and architectural questions dynamically using Claude AI (Anthropic API).
* **Heuristic Engine Fallback**: Automatically falls back to a rich built-in question engine and algorithmic scoring if an API key is not configured.
* **Real-time Feedback**: Evaluates answers across conceptual understanding, scenario problem-solving, and practical communication.

Candidates can practice:

* Technical, behavioral, and panel interviews
* Real-world system failure and architecture scenarios
* Dynamic follow-ups and performance scorecards

---

### 📧 Email & Notification Services

The backend includes a dedicated email service with:

* HTML email templates for application status changes, recruiter notifications, and admin actions
* Graceful degradation — the server starts and all APIs work even when SMTP is not configured
* Structured results (`{ success, messageId?, error? }`) with visible failure logs
* Automatic retry (up to 3 attempts with exponential backoff) on transient failures

Email functionality is implemented using **Nodemailer**.

#### Email Setup

Copy `.env.example` and fill in your SMTP credentials:

```bash
cp backend/.env.example backend/.env
```

**Option A — Gmail (recommended for production)**

1. Enable 2-Step Verification on your Google Account.
2. Go to **Google Account → Security → App Passwords**.
3. Create an App Password for *Mail / Other (SkillBridge)*.
4. Set the following in `backend/.env`:

```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-gmail@gmail.com
SMTP_PASS=your-16-char-app-password
SMTP_FROM_EMAIL=your-gmail@gmail.com
SMTP_FROM_NAME=SkillBridge
```

**Option B — Mailtrap sandbox (for local / CI testing)**

Emails are captured in your Mailtrap inbox — nothing is delivered to real addresses.
Sign up free at [mailtrap.io](https://mailtrap.io) → Email Testing → SMTP Settings.

```env
SMTP_HOST=sandbox.smtp.mailtrap.io
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=<mailtrap-username>
SMTP_PASS=<mailtrap-password>
SMTP_FROM_EMAIL=noreply@skillbridge.com
SMTP_FROM_NAME=SkillBridge
```

**Test the email service**

```bash
cd backend
npm run test:email you@example.com
```

A test email (application shortlisted notification) will be delivered. The script exits with code 0 on success and 1 on failure.

**What happens when SMTP is not configured?**

If `SMTP_USER` or `SMTP_PASS` is missing (or left as a placeholder), the server prints **one** startup warning:

```text
⚠️  Email disabled: SMTP credentials not configured. See .env.example.
```

All API requests continue to work normally and gracefully return `{ success: false }`. In development mode (`NODE_ENV !== 'production'`), the email recipient, subject, and content will be logged directly to the server terminal so developers can preview what would have been sent.

---

### 🔐 Security

SkillBridge includes several backend security mechanisms, including:

* Password hashing with bcrypt
* JWT-based authentication
* Role-based access control
* Request validation with Zod
* Rate limiting middleware
* Audit logging middleware
* Environment-based configuration
* Secure HMAC badge verification

---

## 🛠️ Technology Stack

### Frontend

* **React 19**
* **TypeScript**
* **Vite**
* **Tailwind CSS**
* **Axios**
* **Lucide React**
* **Canvas Confetti**

The frontend is organized into reusable components, views/pages, contexts, and supporting services.

### Backend

* **Node.js**
* **Express 5**
* **TypeScript**
* **MongoDB**
* **Mongoose**
* **JWT**
* **bcryptjs**
* **Zod**
* **Nodemailer**
* **SimpleWebAuthn**
* **CORS**
* **dotenv**
* **UUID**
* **tsx**

### Database

**MongoDB** is used as the document database, managed via **Mongoose**. The backend features robust connection lifecycle management with automatic reconnection retries (`src/db/mongoose.ts`) and a comprehensive database seeder (`src/db/seed.ts`).

---

## 🏗️ Project Architecture

```text
SkillBridge/
│
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   └── email.config.ts
│   │   ├── controllers/
│   │   │   ├── admin.controller.ts
│   │   │   ├── application.controller.ts
│   │   │   ├── assessment.controller.ts
│   │   │   ├── auth.controller.ts
│   │   │   ├── candidateProfile.controller.ts
│   │   │   ├── job.controller.ts
│   │   │   ├── match.controller.ts
│   │   │   ├── mockInterview.controller.ts
│   │   │   ├── platform.controller.ts
│   │   │   ├── portfolio.controller.ts
│   │   │   └── roadmap.controller.ts
│   │   ├── db/
│   │   │   ├── mongoose.ts
│   │   │   └── seed.ts
│   │   ├── middleware/
│   │   │   ├── audit.middleware.ts
│   │   │   ├── auth.middleware.ts
│   │   │   └── rateLimit.middleware.ts
│   │   ├── models/
│   │   │   ├── Application.ts
│   │   │   ├── ApplicationEvent.ts
│   │   │   ├── Assessment.ts
│   │   │   ├── AssessmentAttempt.ts
│   │   │   ├── AuditLog.ts
│   │   │   ├── Badge.ts
│   │   │   ├── BadgeTemplate.ts
│   │   │   ├── CandidateSkill.ts
│   │   │   ├── Company.ts
│   │   │   ├── Conversation.ts
│   │   │   ├── InterviewPrepProgress.ts
│   │   │   ├── Job.ts
│   │   │   ├── Message.ts
│   │   │   ├── MockInterview.ts
│   │   │   ├── Notification.ts
│   │   │   ├── PasswordReset.ts
│   │   │   ├── PlatformSetting.ts
│   │   │   ├── Portfolio.ts
│   │   │   ├── Report.ts
│   │   │   ├── Resume.ts
│   │   │   ├── Roadmap.ts
│   │   │   ├── SavedJob.ts
│   │   │   ├── ScheduledInterview.ts
│   │   │   ├── SkillTaxonomy.ts
│   │   │   └── User.ts
│   │   ├── routes/
│   │   │   └── api.routes.ts
│   │   ├── scripts/
│   │   │   └── test-email.ts
│   │   ├── services/
│   │   │   ├── ai.service.ts
│   │   │   ├── email.service.ts
│   │   │   ├── matching.service.ts
│   │   │   ├── mockInterviewAI.service.ts
│   │   │   └── notify.service.ts
│   │   └── server.ts
│   ├── .env.example
│   ├── package.json
│   └── tsconfig.json
│
├── frontend/
│   ├── src/
│   │   ├── assets/
│   │   ├── components/
│   │   │   ├── ApplicantPipelineATS.tsx
│   │   │   ├── AssessmentQuiz.tsx
│   │   │   ├── Footer.tsx
│   │   │   ├── JobCard.tsx
│   │   │   ├── JobFitExplanationModal.tsx
│   │   │   ├── Navbar.tsx
│   │   │   ├── PageHeader.tsx
│   │   │   ├── PortfolioEditor.tsx
│   │   │   ├── SkillBridgeLogo.tsx
│   │   │   ├── SkillRoadmapView.tsx
│   │   │   └── VerifiableBadgeCard.tsx
│   │   ├── context/
│   │   │   ├── AuthContext.tsx
│   │   │   ├── LanguageContext.tsx
│   │   │   ├── RouterContext.tsx
│   │   │   └── ThemeContext.tsx
│   │   ├── i18n/
│   │   │   └── translations.ts
│   │   ├── pages/
│   │   │   ├── admin/
│   │   │   │   ├── AdminActivityLogsView.tsx
│   │   │   │   ├── AdminAnalyticsView.tsx
│   │   │   │   ├── AdminApplicationsView.tsx
│   │   │   │   ├── AdminAssessmentsView.tsx
│   │   │   │   ├── AdminBadgesView.tsx
│   │   │   │   ├── AdminCompaniesView.tsx
│   │   │   │   ├── AdminDashboardView.tsx
│   │   │   │   ├── AdminJobsModerationView.tsx
│   │   │   │   ├── AdminLayout.tsx
│   │   │   │   ├── AdminLoginPage.tsx
│   │   │   │   ├── AdminRecruitersView.tsx
│   │   │   │   ├── AdminReportsView.tsx
│   │   │   │   ├── AdminSettingsView.tsx
│   │   │   │   ├── AdminSkillsView.tsx
│   │   │   │   └── AdminUsersView.tsx
│   │   │   ├── candidate/
│   │   │   │   ├── CandidateApplicationsView.tsx
│   │   │   │   ├── CandidateAssessmentsView.tsx
│   │   │   │   ├── CandidateCareerRoadmapView.tsx
│   │   │   │   ├── CandidateDashboardView.tsx
│   │   │   │   ├── CandidateInterviewPrepView.tsx
│   │   │   │   ├── CandidateInterviewsView.tsx
│   │   │   │   ├── CandidateJobDetailView.tsx
│   │   │   │   ├── CandidateJobsView.tsx
│   │   │   │   ├── CandidateLayout.tsx
│   │   │   │   ├── CandidateMockInterviewView.tsx
│   │   │   │   ├── CandidateNotificationsView.tsx
│   │   │   │   ├── CandidatePortfolioView.tsx
│   │   │   │   ├── CandidateProfileView.tsx
│   │   │   │   ├── CandidateResumeView.tsx
│   │   │   │   ├── CandidateSavedJobsView.tsx
│   │   │   │   ├── CandidateSettingsView.tsx
│   │   │   │   └── CandidateSkillsView.tsx
│   │   │   ├── recruiter/
│   │   │   │   ├── CandidateProfileDetailView.tsx
│   │   │   │   ├── CandidateSearchView.tsx
│   │   │   │   ├── CompanyProfileView.tsx
│   │   │   │   ├── InterviewManagementView.tsx
│   │   │   │   ├── MyJobsView.tsx
│   │   │   │   ├── PostJobView.tsx
│   │   │   │   ├── RecruiterApplicationsView.tsx
│   │   │   │   ├── RecruiterDashboardView.tsx
│   │   │   │   ├── RecruiterLayout.tsx
│   │   │   │   ├── RecruiterMessagingView.tsx
│   │   │   │   ├── RecruiterNotificationsView.tsx
│   │   │   │   ├── RecruiterSettingsView.tsx
│   │   │   │   └── ShortlistedCandidatesView.tsx
│   │   │   ├── JobsExplorerPage.tsx
│   │   │   ├── LandingPage.tsx
│   │   │   ├── LoginPage.tsx
│   │   │   ├── PortfolioPage.tsx
│   │   │   ├── PublicBadgeVerifyPage.tsx
│   │   │   ├── RegisterPage.tsx
│   │   │   ├── RoadmapPage.tsx
│   │   │   └── SkillAssessmentsPage.tsx
│   │   ├── services/
│   │   │   └── api.ts
│   │   ├── types/
│   │   │   └── index.ts
│   │   ├── App.tsx
│   │   ├── index.css
│   │   └── main.tsx
│   ├── .env.example
│   ├── index.html
│   ├── package.json
│   ├── tsconfig.json
│   └── vite.config.ts
│
├── .gitignore
├── FIXLOG.md
├── package.json
└── README.md
```

---

# 🚀 Getting Started

## Prerequisites

Make sure the following are installed:

* **Node.js 18+**
* **npm 9+**
* **MongoDB** (running locally on port 27017 or a [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) cloud URI)
* **Git**

Check your versions:

```bash
node --version
npm --version
git --version
mongod --version # or verify MongoDB connection
```

---

## 1. Clone the Repository

```bash
git clone https://github.com/akashnls/SkillBridge.git
cd SkillBridge
```

---

## 2. Configure Environment Variables

### Backend Configuration

Copy the example environment template:

```bash
cp backend/.env.example backend/.env
```

Edit `backend/.env` to configure your settings:
* Set `MONGODB_URI` (defaults to `mongodb://localhost:27017/skillbridge`).
* Set `JWT_SECRET` to a secure random string.
* *(Optional)* Set `ANTHROPIC_API_KEY` (or `CLAUDE_API_KEY`) for live AI mock interview generation.
* *(Optional)* Set SMTP credentials if you wish to send emails.

### Frontend Configuration

Copy the frontend environment template:

```bash
cp frontend/.env.example frontend/.env
```

The default `VITE_API_URL=/api` works out-of-the-box for local development with the Vite proxy.

---

## 3. Install & Start Backend

```bash
cd backend
npm install
```

### Seed Initial Data (Optional but Recommended)

Seed default skills, assessments, badge templates, sample jobs, and demo users:

```bash
npm run seed
```

### Start Backend Development Server

```bash
npm run dev
```

The backend runs on:

```text
http://localhost:5001
```

Health-check endpoint:

```text
http://localhost:5001/api/health
```

---

## 4. Install & Start Frontend

Open a new terminal window:

```bash
cd frontend
npm install
npm run dev
```

The frontend will be available at:

```text
http://localhost:3000   (or http://localhost:5173)
```

---

# 🔄 Running Frontend & Backend

You need two terminals during development.

### Terminal 1 — Backend

```bash
cd backend
npm run dev
```

### Terminal 2 — Frontend

```bash
cd frontend
npm run dev
```

---

# 🔑 Environment Variables Reference

### Backend (`backend/.env`)

| Variable | Required | Default / Example | Description |
| :--- | :---: | :--- | :--- |
| `PORT` | No | `5001` | Port number for the Express API server |
| `NODE_ENV` | No | `development` | Environment mode (`development` / `production`) |
| `MONGODB_URI` | **Yes** | `mongodb://localhost:27017/skillbridge` | MongoDB connection URI (local or Atlas) |
| `MONGO_MAX_RETRIES` | No | `5` | Maximum retry attempts for MongoDB connection |
| `MONGO_RETRY_INTERVAL_MS` | No | `5000` | Delay (in ms) between MongoDB connection retries |
| `JWT_SECRET` | **Yes** | `change-me-to-a-long-random-secret` | Secret key used for signing JWT tokens |
| `BADGE_SECRET_KEY` | No | `SKILLBRIDGE_SECRET_KEY` | Secret key for signing/verifying badge HMAC tokens |
| `ANTHROPIC_API_KEY` | No | `your-anthropic-api-key` | Anthropic Claude API key for live AI mock interviews (heuristic fallback used if unset) |
| `CLAUDE_API_KEY` | No | `your-claude-api-key` | Alternative key name for Anthropic API |
| `SMTP_HOST` | No | `smtp.gmail.com` | SMTP server hostname for email notifications |
| `SMTP_PORT` | No | `587` | SMTP port (`587` for TLS or `465` for SSL) |
| `SMTP_SECURE` | No | `false` | `true` for port 465, `false` for other ports |
| `SMTP_USER` | No | `your-gmail@gmail.com` | SMTP authentication username / email |
| `SMTP_PASS` | No | `your-16-char-app-password` | SMTP authentication password / app password |
| `SMTP_FROM_EMAIL` | No | `your-gmail@gmail.com` | Outgoing sender email address |
| `SMTP_FROM_NAME` | No | `SkillBridge` | Display name for outgoing emails |
| `FRONTEND_ORIGIN` | No | `http://localhost:5173` | Allowed origin for WebAuthn/Passkey registration |
| `RP_ID` | No | `localhost` | Relying Party ID for WebAuthn authentication |

### Frontend (`frontend/.env`)

| Variable | Required | Default / Example | Description |
| :--- | :---: | :--- | :--- |
| `VITE_API_URL` | No | `/api` | Base URL for backend API requests (proxied by Vite in dev) |

---

# 📦 Available Backend Commands

Inside `backend`:

```bash
npm run dev
```

Starts the development server with live reload (`tsx watch`).

```bash
npm run build
```

Compiles TypeScript to JavaScript in `dist/`.

```bash
npm start
```

Starts the compiled production backend server (`node dist/server.js`).

```bash
npm run seed
```

Seeds the MongoDB database with initial skills, assessments, jobs, and accounts.

```bash
npm run test:email you@example.com
```

Sends a test email to verify SMTP configuration.

---

# 📦 Available Frontend Commands

Inside `frontend`:

```bash
npm run dev
```

Starts the Vite development server.

```bash
npm run build
```

Creates the production build with typechecking (`tsc -b && vite build`).

```bash
npm run lint
```

Runs the ESLint code quality linter.

```bash
npm run preview
```

Previews the production build locally.

---

# 🔌 API Overview

The backend exposes a structured REST API:

```text
/api/auth              - Registration, Login, WebAuthn/Passkeys, Password Reset
/api/candidate-profile - Profile details, skills, experience, portfolio, resume
/api/jobs              - Job listings, search, filtering, recruiter management
/api/applications      - Application submission, candidate tracking, ATS workflow
/api/assessments       - Quizzes, questions, attempt submission, scoring, badges
/api/interviews        - Interview scheduling, management, notifications
/api/mock-interviews   - AI & heuristic mock interviews, question generation, scoring
/api/match             - Skill-to-job matching & fit breakdown
/api/roadmaps          - Career pathways & learning milestones
/api/portfolio         - Candidate project showcase & verification
/api/platform          - Public platform stats, categories, top skills
/api/admin             - User/recruiter management, moderation, logs, analytics
/api/health            - Health check & server status endpoint
```

---

# 👥 User Roles

| Role            | Main Responsibilities                                                |
| --------------- | -------------------------------------------------------------------- |
| 👨‍💻 Candidate | Profile, skills, assessments, jobs, applications, portfolio, roadmap |
| 🏢 Employer     | Jobs, candidates, applications, recruitment pipeline                 |
| 🛡️ Admin       | Platform administration, users, jobs, skills, assessments            |

---

# 🔄 Main User Workflow

```text
                    SkillBridge
                         │
          ┌──────────────┼──────────────┐
          ↓              ↓              ↓
      Candidate       Employer        Admin
          │              │              │
          ↓              ↓              ↓
     Build Profile    Post Jobs     Manage Platform
          │              │
          ↓              ↓
      Add Skills     Review Candidates
          │              │
          ↓              ↓
     Take Assessment → Applications
          │              │
          ↓              ↓
     Skill Analysis → ATS Pipeline
          │
          ↓
       Roadmap
          │
          ↓
      Portfolio
          │
          ↓
     Job Application
```

---

# 🎯 Project Goals

SkillBridge aims to:

* Reduce skill mismatch between candidates and employers
* Make recruitment more skill-focused
* Help candidates identify areas for improvement
* Provide structured career development
* Encourage project-based portfolios
* Improve interview preparation
* Simplify employer candidate management
* Provide a centralized recruitment ecosystem

---

# 🔮 Future Improvements

Potential future enhancements include:

* AI-powered resume analysis
* Advanced semantic job matching
* Real-time chat between candidates and recruiters
* Video interview integration
* Advanced analytics and reporting
* Production email infrastructure
* Cloud database deployment
* Cloud storage for resumes and portfolios
* Mobile application
* Production deployment
* Automated testing and CI/CD
* Advanced recommendation engine

---

# 📊 Current Project Status

**Status:** 🚧 Active Development

SkillBridge currently provides a functional full-stack foundation containing:

* React frontend (TypeScript + Vite + Tailwind CSS)
* Express/TypeScript backend
* MongoDB database (via Mongoose)
* Authentication (JWT + WebAuthn Passkeys)
* Candidate workflows
* Employer workflows
* Admin dashboard
* Assessments & Quiz engine
* Job management & ATS pipeline
* Portfolios & Career Roadmaps
* Digital badges & Public badge verification
* AI-powered Mock Interview system
* Email and notification services
* Security middleware, rate limiting, and audit logging

---

# 👨‍💻 Author

**Akash SV**

GitHub:
https://github.com/akashnls

Project:
https://github.com/akashnls/SkillBridge

---

# 📄 License

This project is currently developed as an academic / portfolio project.

License terms can be added when the project is prepared for public open-source distribution.
