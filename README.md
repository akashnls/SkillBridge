# SkillBridge: AI-Powered Job & Skill Matching Platform
> **Solving Youth Unemployment & Skill Mismatch through Explainable AI, Micro-Credentials, and Inclusive Pathways**
> *Master of Science / Master of Technology in Computer Science Project*

---

## 🌟 Overview & Problem Statement

Unemployment among educated and non-traditional youth is driven by structural **skill mismatch** — where conventional job portals rely on superficial resume keyword matching. 

**SkillBridge** solves this by operationalizing:
1. **Explainable AI Job-Fit Scoring** (with transparent mathematical and credential-weighted breakdowns).
2. **Personalized 4-Stage Skill Gap Roadmaps** (`Course` → `Capstone Project` → `Micro-Credential Badge` → `Target Job Application`).
3. **Cryptographic Micro-Credentialing Engine** (Timed assessments issuing verifiable HMAC-SHA256 digital badges).
4. **AI-Powered Mock Interview Simulator** (Conversational voice/text simulation with STAR method coaching).
5. **Practical Portfolio Showcase** (Project-first evidence for non-traditional, self-taught, and bootcamp learners).
6. **Skill-Weighted Employer ATS** (Pipeline sorted by verified competence rather than college pedigree).
7. **Regional Language Localization (i18n)**: English, Hindi (`हिन्दी`), Tamil (`தமிழ்`), Kannada (`ಕನ್ನಡ`), and Malayalam (`മലയാളം`).
8. **Security & Biometrics**: WebAuthn/FIDO2 biometric passkey authentication, password hashing, and audit logging.

---

## 🚀 Quick Start Guide

### Prerequisites
- Node.js (v18+)
- npm (v9+)

### 1. Run the Backend API Server
```bash
cd backend
npm install
npm run dev
```
*Backend runs on `http://localhost:5000` with SQLite database auto-seeded with test users, taxonomy, jobs, and assessments.*

### 2. Run the Frontend Client
```bash
cd frontend
npm install
npm run dev
```
*Frontend runs on `http://localhost:3000`.*

---

## 👥 Demo Accounts (One-Click Switch in Top Navigation)

| Role | Name | Email | Password | Description |
|---|---|---|---|---|
| **Candidate (Job Seeker)** | Arjun Sharma | `arjun@example.com` | `password123` | Self-Taught Full Stack Dev (has React & Python Badges + AgriMarket portfolio) |
| **Candidate (Data Analyst)** | Priya Patel | `priya@example.com` | `password123` | Certified Data Analyst (has SQL Badge + Churn Analytics portfolio) |
| **Employer / Recruiter** | Sarah Jenkins | `recruiter@techcorp.io` | `password123` | TechCorp Solutions (Job postings & candidate pipeline ATS) |
| **System Administrator** | Admin | `admin@skillbridge.org` | `admin123` | Platform Governance, Skill Mismatch Heatmaps, Audit Logs |

---

## 🌐 Public Micro-Credential Verification URL
Anyone or any employer can independently verify a candidate's digital badge without logging in:
- Try opening: `/verify/SKB-REACT-8921` or `/verify/SKB-SQL-3918`
- Computes SHA-256 HMAC signature against registry metadata to prove authenticity.

---

## 🏛️ System Architecture

```
d:/AG/
├── backend/
│   ├── data/skillbridge.db       # Relational SQLite database
│   ├── src/
│   │   ├── controllers/          # Auth, Job, Match, Assessment, Roadmap, Interview, Portfolio, ATS, Admin
│   │   ├── services/             # AI Service, Weighted Matching Service, WebAuthn Biometrics
│   │   ├── db/                   # Schema migrations & Seed generator
│   │   ├── middleware/           # JWT verification, RBAC, Security Audit Logger
│   │   └── server.ts             # Express entrypoint
└── frontend/
    ├── src/
    │   ├── components/           # JobCard, JobFitExplanationModal, AssessmentQuiz, BadgeCard, RoadmapView, MockInterviewRoom, PortfolioEditor, ATS
    │   ├── context/              # AuthContext (WebAuthn/JWT), LanguageContext (EN, HI, TA, KN, ML)
    │   ├── i18n/                 # Localization dictionaries
    │   ├── pages/                # Landing, JobsExplorer, Assessments, Roadmap, MockInterview, Portfolio, Dashboard, ATS, Admin, Verify
    │   └── App.tsx
```
