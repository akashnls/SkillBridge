# SkillBridge — Complete Project Context for AI Planning

> **Purpose of this document:** This is a comprehensive technical overview of the SkillBridge project. Copy-paste this to any AI assistant for planning, debugging, feature development, or architectural discussions.

---

## 1. Project Summary

**SkillBridge** is a full-stack AI-powered job and skill matching platform designed to connect **job seekers (candidates)**, **employers (recruiters)**, and **administrators**. Unlike traditional resume-first hiring boards, SkillBridge prioritizes **verifiable skill assessments, cryptographic digital badges, explainable AI job-fit matching, non-traditional project portfolios, personalized 4-step learning roadmaps, and an AI-powered mock interview engine**.

- **Status:** 🚧 Active Development (Academic / Advanced Portfolio Project)
- **Architecture Level:** Full-Stack Modular TypeScript (Node.js/Express + MongoDB/Mongoose + React 19/Vite + Tailwind CSS v4)
- **Version:** `2.0.0` (Backend API & MongoDB Schema v2)

---

## 2. Technology Stack

### Frontend
| Technology | Version | Purpose |
|---|---|---|
| React | 19.2.8 | Core component UI framework |
| React DOM | 19.2.8 | DOM rendering |
| TypeScript | ~6.0.2 | Strict client-side type definitions |
| Vite | 8.2.2 | Fast build tool, HMR dev server, proxy configuration |
| Tailwind CSS | 4.3.3 | Modern CSS styling via `@tailwindcss/vite` plugin |
| Axios | 1.20.0 | REST API client with Bearer token interceptor |
| Lucide React | 1.35.0 | Complete UI icon library |
| Canvas Confetti | 1.9.4 | Celebratory milestone & badge award animations |
| clsx + tailwind-merge | 2.1.1 / 3.6.0 | Utility class composition |
| oxlint | 1.79.0 | High-performance linter |

### Backend
| Technology | Version | Purpose |
|---|---|---|
| Node.js | 26.4+ runtime | Server runtime environment |
| Express | 5.2.1 | HTTP web server & middleware pipeline |
| TypeScript | 5.7.3 | Server-side static typing |
| MongoDB & Mongoose | 9.10.1 | Document database & schema-driven ODM |
| JWT (jsonwebtoken) | 9.0.3 | Stateless Bearer token authentication (7-day lifespan) |
| bcryptjs | 3.0.3 | Salted password hashing (10 rounds) |
| Zod | 4.5.2 | Schema & payload validation |
| Nodemailer | 10.0.0 | SMTP transactional email notification delivery |
| UUID | 14.0.2 | Universally unique identifiers (`uuidv4`) |
| CORS | 2.8.6 | Cross-origin resource sharing |
| tsx | 4.23.12 | Zero-config TypeScript execution & dev watch mode |
| dotenv | 17.4.2 | Environment variable management |

### AI / LLM & Intelligence Engine
- **Anthropic Claude API (`claude-3-5-sonnet-20241022`)**: Integrated dynamically in `mockInterviewAI.service.ts` to generate fresh, context-aware interview questions (situational scenarios, architecture challenges, panel rounds) based on job requirements and candidate profiles.
- **Algorithmic Fallback Engine**: High-fidelity rule-based generator for interview questions, keyword scoring, STAR methodology compliance evaluation, and career roadmapping when external LLM API keys are absent.
- **Deterministic Job-Fit Scoring Engine**: Transparent, explainable scoring algorithm combining weighted required skills (75%), preferred skills (15%), verified digital badge bonuses (+15%), and practical portfolio evidence bonuses (+12%).

### Database & Storage
- **MongoDB** accessed through **Mongoose 9.10.1** schemas with validation, defaults, and embedded subdocuments.
- Database connection handled in `backend/src/db/mongoose.ts` with auto-reconnection listeners.
- Initial seed data (skills taxonomy, assessments, badge templates, platform settings) auto-populated on first boot in `backend/src/db/seed.ts`.

---

## 3. Project Architecture & File Structure

```
SkillBridge/
├── package.json                          # Workspace root helper scripts
├── README.md                             # High-level product overview & setup guide
├── PROJECT_CONTEXT.md                    # THIS FILE: Exhaustive technical reference for AI agents
├── .gitignore
│
├── backend/
│   ├── package.json                      # Backend dependencies & npm scripts (dev, build, start, seed)
│   ├── tsconfig.json                     # TypeScript compilation configuration (ESNext, NodeNext)
│   ├── .env                              # Local environment variables (PORT, MONGODB_URI, SMTP, etc.)
│   └── src/
│       ├── server.ts                     # Express application entry point & MongoDB boot sequence
│       │
│       ├── db/
│       │   ├── mongoose.ts               # Mongoose connection management & reconnection logic
│       │   └── seed.ts                   # Idempotent database seeder (taxonomy, assessments, badges, settings)
│       │
│       ├── models/                       # 25 Mongoose Document Schemas & Interfaces
│       │   ├── Application.ts            # Job applications with fit score breakdown & status enum
│       │   ├── ApplicationEvent.ts       # Application audit timeline events (status transitions)
│       │   ├── Assessment.ts             # Timed quiz assessments with multi-choice question arrays
│       │   ├── AssessmentAttempt.ts      # User assessment submissions, score, pass/fail status
│       │   ├── AuditLog.ts               # Administrative audit trail
│       │   ├── Badge.ts                  # Issued digital badges with cryptographic verification hash
│       │   ├── BadgeTemplate.ts          # Master badge templates and issuance criteria
│       │   ├── CandidateSkill.ts         # Candidate skills with proficiency levels and verification status
│       │   ├── Company.ts                # Employer profile, company verification status, branding
│       │   ├── Conversation.ts           # Candidate-recruiter chat thread metadata
│       │   ├── InterviewPrepProgress.ts  # Tracked preparation checklist items & notes
│       │   ├── Job.ts                    # Job postings with weighted skill requirements and moderation status
│       │   ├── Message.ts                # Direct chat messages between participants
│       │   ├── MockInterview.ts          # AI mock interview sessions with category scores & feedback
│       │   ├── Notification.ts           # In-app notifications with read/unread tracking
│       │   ├── PasswordReset.ts          # Password reset tokens and expiration dates
│       │   ├── PlatformSetting.ts        # Dynamic platform configuration flags (e.g. moderation toggles)
│       │   ├── Portfolio.ts              # Non-traditional portfolio projects showcasing real-world work
│       │   ├── Report.ts                 # User/listing reports with admin resolution notes
│       │   ├── Resume.ts                 # Uploaded candidate resume text, primary flag, ATS scoring
│       │   ├── Roadmap.ts                # 4-stage personalized skill-gap learning roadmaps
│       │   ├── SavedJob.ts               # Bookmarked job listings
│       │   ├── ScheduledInterview.ts     # Recruiter-scheduled interviews with meeting links & feedback
│       │   ├── SkillTaxonomy.ts          # Central skills catalog with synonyms, categories, difficulty
│       │   └── User.ts                   # Core user schema with embedded Profile & CandidateSettings
│       │
│       ├── controllers/                  # 11 REST API Request Handlers
│       │   ├── admin.controller.ts       # Audit logs & skills taxonomy endpoints
│       │   ├── application.controller.ts # Candidate job application submission, candidate & recruiter listing
│       │   ├── assessment.controller.ts  # Quiz delivery, automated scoring, badge generation & public verification
│       │   ├── auth.controller.ts        # User registration, login, current user session, profile update
│       │   ├── candidateProfile.controller.ts # Dedicated candidate workspace CRUD (profile, skills, resumes, settings)
│       │   ├── job.controller.ts         # Job listing, creation, filtering, and detail retrieval
│       │   ├── match.controller.ts       # Explainable job-fit calculations & candidate recommendations
│       │   ├── mockInterview.controller.ts # Dynamic AI mock interview lifecycle (start, answer, complete, history)
│       │   ├── platform.controller.ts    # Central operations controller: ATS pipeline, company, recruiter jobs, moderation, reports, messaging, analytics (88KB)
│       │   ├── portfolio.controller.ts   # Project portfolio showcase CRUD
│       │   └── roadmap.controller.ts     # Personalized 4-stage skill-gap career roadmap generation & step toggling
│       │
│       ├── services/                     # Core Business Logic & External Integrations
│       │   ├── ai.service.ts             # Algorithmic roadmap generator & STAR interview answer evaluator
│       │   ├── email.service.ts          # Nodemailer transactional emails (application updates & admin alerts)
│       │   ├── matching.service.ts       # Deterministic weighted skill-matching engine & portfolio evidence linker
│       │   ├── mockInterviewAI.service.ts # Dynamic AI question generation (Claude 3.5 Sonnet + fallback) & evaluation
│       │   └── notify.service.ts         # In-app notification creation helper
│       │
│       ├── middleware/                   # Express Middlewares
│       │   ├── auth.middleware.ts        # JWT validation (`authenticateToken`, `optionalAuthenticateToken`, `requireRole`)
│       │   ├── audit.middleware.ts       # Fire-and-forget administrative audit logging
│       │   └── rateLimit.middleware.ts   # Sliding-window in-memory IP rate limiter
│       │
│       └── routes/
│           └── api.routes.ts             # Master router registering all 80+ endpoints under `/api`
│
└── frontend/
    ├── package.json                      # Frontend dependencies & npm scripts (dev, build, lint, preview)
    ├── vite.config.ts                    # Vite config (port 3000, proxies `/api` → `http://localhost:5001`)
    ├── index.html                        # HTML shell entry point
    ├── tsconfig.json                     # Client TypeScript configuration
    └── src/
        ├── main.tsx                      # React root mounting
        ├── App.tsx                       # Master view switcher coordinating layout shells and sub-views
        ├── index.css                     # Tailwind CSS imports & global dark theme custom utilities
        │
        ├── types/
        │   └── index.ts                  # Comprehensive TypeScript models for frontend (582 lines)
        │
        ├── services/
        │   └── api.ts                    # Axios API client grouped by domain (auth, jobs, candidate, recruiter, admin, mockInterview)
        │
        ├── context/
        │   ├── AuthContext.tsx           # Authentication state, login, register, logout, and token storage
        │   ├── LanguageContext.tsx       # Multi-language i18n switching and helper hooks
        │   └── RouterContext.tsx         # Custom HTML5 History API router (`pushState`, `popstate`, param extraction)
        │
        ├── i18n/
        │   └── translations.ts           # 5-language translation dictionary (en, hi, ta, kn, ml)
        │
        ├── components/                   # 12 Shared Reusable Components
        │   ├── ApplicantPipelineATS.tsx  # Kanban-style drag/column recruitment ATS board
        │   ├── AssessmentQuiz.tsx        # Interactive timed quiz runner with immediate feedback
        │   ├── Footer.tsx                # Consistent platform footer
        │   ├── JobCard.tsx               # Rich job card featuring company info, tags, and fit-score badge
        │   ├── JobFitExplanationModal.tsx # Transparent match breakdown modal showing verified bonuses
        │   ├── MockInterviewRoom.tsx     # Interactive AI interview room with audio/text responses & instant feedback
        │   ├── Navbar.tsx                # Responsive top navigation with active tab state & notification indicator
        │   ├── PageHeader.tsx            # Standardized page title & breadcrumb header
        │   ├── PortfolioEditor.tsx       # Interactive project builder with GitHub & live demo links
        │   ├── SkillBridgeLogo.tsx       # Vector brand logo component
        │   ├── SkillRoadmapView.tsx      # Step-by-step progress tracker for 4-stage learning roadmaps
        │   └── VerifiableBadgeCard.tsx   # Cryptographic badge showcase card with verification hash
        │
        └── pages/                        # Page Views Organized by Domain
            ├── LandingPage.tsx           # Public homepage with hero, value propositions, and metrics
            ├── LoginPage.tsx             # Candidate / recruiter login page with demo auto-fill
            ├── RegisterPage.tsx          # Multi-role account registration form
            ├── JobsExplorerPage.tsx      # Public job exploration and filtering board
            ├── SkillAssessmentsPage.tsx  # Public catalog of available skill assessment quizzes
            ├── RoadmapPage.tsx           # Skill-gap career roadmap generator view
            ├── PublicBadgeVerifyPage.tsx # Public badge verification portal by code/hash
            ├── MockInterviewPage.tsx     # Mock interview entry point
            ├── PortfolioPage.tsx         # Portfolio viewer entry point
            │
            ├── candidate/                # 17 Candidate Workspace Views
            │   ├── CandidateLayout.tsx             # Candidate sidebar navigation & layout shell
            │   ├── CandidateDashboardView.tsx      # Overview of applications, badges, recommendations, and metrics
            │   ├── CandidateProfileView.tsx        # Deep profile editor (education, experience, achievements)
            │   ├── CandidateSkillsView.tsx         # Skill management with self-rated proficiency levels
            │   ├── CandidateAssessmentsView.tsx    # Assessment catalog, quiz launcher, and earned badges
            │   ├── CandidateCareerRoadmapView.tsx  # Personalized career roadmap with actionable steps
            │   ├── CandidateJobsView.tsx           # Job discovery with inline match fit scores
            │   ├── CandidateJobDetailView.tsx      # In-depth job view, requirements breakdown, and application drawer
            │   ├── CandidateApplicationsView.tsx   # Live application status tracker with timeline events
            │   ├── CandidateSavedJobsView.tsx      # Bookmarked jobs
            │   ├── CandidatePortfolioView.tsx      # Showcase of non-traditional hands-on projects
            │   ├── CandidateResumeView.tsx         # Resume management, primary selection, text viewer
            │   ├── CandidateInterviewPrepView.tsx  # Interview question checklist & topic tracker
            │   ├── CandidateMockInterviewView.tsx  # Comprehensive AI interview simulator (73KB)
            │   ├── CandidateInterviewsView.tsx     # Scheduled recruiter interview calendar & meeting links
            │   ├── CandidateNotificationsView.tsx  # Notification inbox with read/unread toggles
            │   └── CandidateSettingsView.tsx       # Job preferences, privacy controls, notification preferences
            │
            ├── recruiter/                # 13 Recruiter Workspace Views
            │   ├── RecruiterLayout.tsx             # Recruiter workspace layout shell
            │   ├── RecruiterDashboardView.tsx      # Recruitment metrics, active listings, recent applicants
            │   ├── CompanyProfileView.tsx          # Organization branding, verification status, and details
            │   ├── PostJobView.tsx                 # Comprehensive job posting form with skill weighting (32KB)
            │   ├── MyJobsView.tsx                  # Recruiter's posted jobs with quick status toggles
            │   ├── RecruiterApplicationsView.tsx   # Full recruitment ATS pipeline & candidate filtering (26KB)
            │   ├── CandidateSearchView.tsx         # Candidate talent search with skill & experience filters
            │   ├── CandidateProfileDetailView.tsx  # Detailed candidate profile inspector with portfolio and badges
            │   ├── ShortlistedCandidatesView.tsx   # Shortlisted candidate pool
            │   ├── InterviewManagementView.tsx     # Interview scheduler with date/time, type, and meeting links
            │   ├── RecruiterMessagingView.tsx      # Direct messaging threads with candidates
            │   ├── RecruiterNotificationsView.tsx  # Recruiter notification feed
            │   └── RecruiterSettingsView.tsx       # Recruiter account settings
            │
            └── admin/                    # 15 Admin Portal Views
                ├── AdminLayout.tsx                 # Admin dashboard layout shell with navigation
                ├── AdminLoginPage.tsx              # Dedicated administrative login
                ├── AdminDashboardView.tsx          # Platform-wide statistics, user growth, recruitment funnel
                ├── AdminUsersView.tsx              # User accounts management (activate, suspend, delete, role change)
                ├── AdminRecruitersView.tsx         # Registered recruiter directory
                ├── AdminCompaniesView.tsx          # Company verification queue (approve, reject with notes)
                ├── AdminJobsModerationView.tsx     # Job moderation queue (approve, reject with notes)
                ├── AdminApplicationsView.tsx       # Platform-wide application monitoring
                ├── AdminSkillsView.tsx             # Platform skill taxonomy CRUD
                ├── AdminAssessmentsView.tsx        # Assessment quiz authoring & question management
                ├── AdminBadgesView.tsx             # Digital badge template management
                ├── AdminReportsView.tsx            # Flagged content & dispute resolution
                ├── AdminAnalyticsView.tsx          # Platform KPIs, skill demand charts, conversion rates
                ├── AdminActivityLogsView.tsx       # System-wide audit log inspector
                └── AdminSettingsView.tsx           # Global platform feature toggles & policies
```

---

## 4. MongoDB Database Models (Mongoose)

All database entities are modeled as Mongoose collections with schema enforcement and typed documents located in `backend/src/models/`.

### Core Platform Models

| Model File | Collection | Description | Key Fields |
|---|---|---|---|
| `User.ts` | `users` | All system users across all roles | `id` (UUID), `name`, `email`, `password_hash`, `role` (`job_seeker`/`employer`/`admin`), `avatar_url`, `status`, `account_deleted`, `created_at`, embedded `profile` (`ProfileSchema`), embedded `candidate_settings` (`CandidateSettingsSchema`) |
| `Company.ts` | `companies` | Employer company profiles | `id`, `user_id`, `name`, `industry`, `website`, `description`, `location`, `company_size`, `founded_year`, `verification_status` (`pending`/`verified`/`rejected`), `rejection_reason`, `benefits`, `social_links`, `logo_url` |
| `Job.ts` | `jobs` | Job postings | `id`, `employer_id`, `company_name`, `title`, `description`, `location`, `job_type`, `experience_level`, `salary_range`, `required_skills` (array of `{ skill, weight }`), `preferred_skills` (`[String]`), `status` (`open`/`closed`), `work_mode`, `education_requirement`, `openings`, `application_deadline`, `responsibilities`, `benefits_text`, `moderation_status` (`approved`/`pending`/`rejected`), `rejection_reason`, `views_count` |
| `SkillTaxonomy.ts` | `skilltaxonomies` | Standardized skills catalog | `id`, `name`, `category`, `description`, `synonyms` (`[String]`), `aliases` (`[String]`), `difficulty_level`, `is_active`, `created_at` |

### Assessment & Micro-Credentials Models

| Model File | Collection | Description | Key Fields |
|---|---|---|---|
| `Assessment.ts` | `assessments` | Timed skill assessment quizzes | `id`, `skill_name`, `title`, `category`, `duration_minutes`, `pass_percentage`, `questions` (array of `{ id, question, options, correct_index, explanation }`) |
| `AssessmentAttempt.ts` | `assessmentattempts` | Candidate quiz attempts | `id`, `assessment_id`, `user_id`, `score_percentage`, `passed`, `answers` (array of `{ question_id, selected_index }`), `skill_level`, `time_taken_seconds`, `attempted_at` |
| `Badge.ts` | `badges` | Earned digital badges | `id`, `badge_code` (e.g. `SKB-REACT-8921`), `user_id`, `skill_name`, `assessment_id`, `score_percentage`, `level`, `verification_hash`, `status` (`active`/`revoked`), `issued_at` |
| `BadgeTemplate.ts` | `badgetemplates` | Badge criteria & templates | `id`, `name`, `skill_name`, `level`, `description`, `criteria`, `icon`, `is_active`, `created_at` |

### Application & ATS Recruitment Models

| Model File | Collection | Description | Key Fields |
|---|---|---|---|
| `Application.ts` | `applications` | Candidate job applications | `id`, `job_id`, `user_id`, `fit_score`, `fit_score_breakdown` (object with matched skills, missing skills, bonuses), `status` (`Applied` → `Under Review` → `Shortlisted` → `Interviewing` → `Offered` / `Rejected`), `cover_letter`, `additional_info`, `resume_id`, `created_at`, `updated_at` |
| `ApplicationEvent.ts` | `applicationevents` | Application status timeline | `id`, `application_id`, `status`, `actor_id`, `note`, `created_at` |
| `ScheduledInterview.ts` | `scheduledinterviews` | Interviews scheduled by recruiters | `id`, `application_id`, `job_id`, `candidate_id`, `recruiter_id`, `interview_date`, `interview_time`, `interview_type`, `meeting_link`, `location`, `status`, `notes`, `feedback`, `rating`, `created_at`, `updated_at` |
| `CandidateSkill.ts` | `candidateskills` | Candidate-managed skills | `id`, `user_id`, `skill_name`, `category`, `proficiency` (`Beginner`/`Intermediate`/`Advanced`/`Expert`), `is_verified`, `source`, `created_at`, `updated_at` |
| `SavedJob.ts` | `savedjobs` | Bookmarked jobs | `id`, `user_id`, `job_id`, `created_at` |

### Career Development & AI Models

| Model File | Collection | Description | Key Fields |
|---|---|---|---|
| `MockInterview.ts` | `mockinterviews` | AI mock interview sessions | `id`, `user_id`, `role`/`target_role`, `difficulty`, `interview_type` (`Technical`/`Behavioral`/`Panel`), `duration_minutes`, `status`, `overall_score`, `category_scores` (object with technical, communication, problem solving, relevance, confidence), `questions` (array of questions), `answers` (array of answers & evaluations), `feedback`, `strengths`, `areas_to_improve`, `recommendations`, `conversation_log`, `created_at`, `completed_at` |
| `Roadmap.ts` | `roadmaps` | Skill-gap career roadmaps | `id`, `user_id`, `target_role`, `target_job_id`, `overall_progress`, `stages` (4 distinct stages with step items and completion toggles), `ai_coaching_advice`, `created_at`, `updated_at` |
| `Portfolio.ts` | `portfolios` | Project showcase items | `id`, `user_id`, `title`, `description`, `problem_solved`, `skills_used` (`[String]`), `github_url`, `live_demo_url`, `metrics`, `created_at`, `updated_at` |
| `Resume.ts` | `resumes` | Candidate uploaded resumes | `id`, `user_id`, `file_name`, `content_text`, `is_primary`, `score`, `suggestions`, `created_at`, `updated_at` |
| `InterviewPrepProgress.ts` | `interviewprepprogresses` | Checklist progress tracking | `id`, `user_id`, `question_id`, `category`, `is_completed`, `notes`, `updated_at` |

### Platform Operations Models

| Model File | Collection | Description | Key Fields |
|---|---|---|---|
| `Conversation.ts` | `conversations` | Messaging threads | `id`, `participant_a`, `participant_b`, `last_message_at`, `created_at` |
| `Message.ts` | `messages` | Direct chat messages | `id`, `conversation_id`, `sender_id`, `body`, `created_at` |
| `Notification.ts` | `notifications` | In-app notification alerts | `id`, `user_id`, `type`, `title`, `body`, `link`, `is_read`, `created_at` |
| `Report.ts` | `reports` | User-submitted dispute reports | `id`, `reporter_id`, `target_type`, `target_id`, `reason`, `details`, `status` (`pending`/`investigating`/`resolved`/`dismissed`), `admin_note`, `created_at`, `resolved_at` |
| `AuditLog.ts` | `auditlogs` | Admin activity audit trail | `id`, `user_id`, `action`, `category`, `ip_address`, `details`, `timestamp` |
| `PlatformSetting.ts` | `platformsettings` | Key-value platform switches | `key` (e.g. `job_approval_required`, `company_verification_required`, `feature_messaging`), `value` |
| `PasswordReset.ts` | `passwordresets` | Password reset tokens | `id`, `user_id`, `token_hash`, `expires_at`, `used`, `created_at` |

---

## 5. API Endpoints Reference (All under `/api/`)

### System & Health Check
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/api/health` | None | Returns server status, version (`2.0.0`), timestamp, and database engine (`MongoDB`) |

### Authentication (`/api/auth/`)
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/api/auth/register` | None | Register candidate or recruiter account |
| POST | `/api/auth/login` | None | Authenticate with email and password, receives JWT token |
| GET | `/api/auth/me` | JWT | Get current authenticated user profile, badges, and company details |
| PUT | `/api/auth/profile` | JWT | Update current user basic profile |

### Jobs & Matching (`/api/jobs/`)
| Method | Endpoint | Auth | Role | Description |
|---|---|---|---|---|
| GET | `/api/jobs` | Optional JWT | Any | List active jobs with optional search, filters, and user fit score |
| GET | `/api/jobs/:id` | Optional JWT | Any | Get single job details with company profile and fit score |
| GET | `/api/jobs/recommendations` | JWT | Any | Get top-recommended jobs sorted by candidate fit score |
| GET | `/api/jobs/:jobId/match-explanation` | JWT | Any | Get explainable breakdown of match score, verified bonus, and gaps |
| POST | `/api/jobs` | JWT | employer, admin | Create a new job listing |
| GET | `/api/employer/my-jobs` | JWT | employer, admin | Get jobs posted by the authenticated employer |

### Skill Assessments & Badges (`/api/assessments/`, `/api/badges/`)
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/api/assessments` | None | List all available skill assessments |
| GET | `/api/assessments/:id` | JWT | Get assessment details and quiz questions |
| POST | `/api/assessments/:id/submit` | JWT | Submit answers, calculate score, and auto-award badge if passed |
| GET | `/api/badges/my` | JWT | Get all earned active badges for current candidate |
| GET | `/api/badges/verify/:badgeCode` | None | **Public verification portal** for any badge by code |

### Career Roadmaps (`/api/roadmap/`)
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/api/roadmap/generate` | JWT | Generate personalized 4-stage learning roadmap based on skill gaps |
| GET | `/api/roadmap/my` | JWT | Get all saved roadmaps for the authenticated candidate |
| PUT | `/api/roadmap/:id/step` | JWT | Toggle completion status of a roadmap stage step item |

### Dedicated AI Mock Interview Engine (`/api/mock-interview/`)
| Method | Endpoint | Auth | Role | Description |
|---|---|---|---|---|
| POST | `/api/mock-interview/start` | JWT | job_seeker, admin | Start a session, dynamically generates role-tailored questions |
| POST | `/api/mock-interview/:id/answer` | JWT | job_seeker, admin | Submit answer to current question, returns instant AI score & feedback |
| POST | `/api/mock-interview/:id/complete` | JWT | job_seeker, admin | Finalize interview session, generate overall category scores & advice |
| GET | `/api/mock-interview/history` | JWT | job_seeker, admin | Get candidate's past interview session history |
| GET | `/api/mock-interview/:id` | JWT | Any | Get detailed view of an interview session and its conversation log |
| DELETE | `/api/mock-interview/:id` | JWT | job_seeker, admin | Delete an interview session record |

### Project Portfolio Showcase (`/api/portfolio/`)
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/api/portfolio/my` | JWT | Get all portfolio projects created by current candidate |
| GET | `/api/portfolio/user/:userId` | JWT | Get public portfolio projects for a specific candidate |
| POST | `/api/portfolio` | JWT | Create a new project showcase (title, problem solved, skills, URLs) |
| DELETE | `/api/portfolio/:id` | JWT | Delete a portfolio project |

### Applications & Recruitment Pipeline (`/api/applications/`)
| Method | Endpoint | Auth | Role | Description |
|---|---|---|---|---|
| POST | `/api/applications/apply` | JWT | job_seeker | Apply to a job listing with optional cover letter |
| GET | `/api/applications/my` | JWT | job_seeker | Get all jobs applied to by the candidate |
| GET | `/api/applications/job/:jobId` | JWT | employer, admin | Get all applicants for a specific job posting |
| PUT | `/api/applications/:id/status` | JWT | employer, admin | Update application status (triggers timeline event & notification email) |
| GET | `/api/applications/:id/timeline` | JWT | Any | Get chronological timeline history of application status changes |
| POST | `/api/applications/:id/withdraw` | JWT | job_seeker | Withdraw an existing job application |

### Candidate Dedicated Workspace (`/api/candidate/`)
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/api/candidate/dashboard` | JWT | Comprehensive candidate dashboard stats, recommendations, badges |
| GET | `/api/candidate/profile` | JWT | Get detailed candidate profile with completion percentage and gaps |
| PUT | `/api/candidate/profile` | JWT | Update detailed profile (education, experience, achievements, soft skills) |
| GET | `/api/candidate/skills` | JWT | List candidate-added skills and earned badges |
| POST | `/api/candidate/skills` | JWT | Add a skill with self-rated proficiency |
| PUT | `/api/candidate/skills/:id/proficiency` | JWT | Update proficiency level of an existing skill |
| DELETE | `/api/candidate/skills/:id` | JWT | Remove a skill from candidate profile |
| GET | `/api/candidate/saved-jobs` | JWT | List bookmarked jobs |
| POST | `/api/candidate/saved-jobs` | JWT | Bookmark a job |
| DELETE | `/api/candidate/saved-jobs/:jobId` | JWT | Remove a bookmarked job |
| GET | `/api/candidate/resumes` | JWT | Get all uploaded candidate resumes |
| POST | `/api/candidate/resumes` | JWT | Upload and store candidate resume text |
| PUT | `/api/candidate/resumes/:id/primary` | JWT | Set a resume as the primary application resume |
| DELETE | `/api/candidate/resumes/:id` | JWT | Delete a resume |
| GET | `/api/candidate/settings` | JWT | Get candidate job preferences, notification, and privacy preferences |
| PUT | `/api/candidate/settings` | JWT | Update candidate preferences |
| GET | `/api/candidate/interview-prep/progress` | JWT | Get progress on interview preparation checklist |
| POST | `/api/candidate/interview-prep/toggle` | JWT | Toggle completion status of an interview preparation question |
| GET | `/api/candidate/interviews` | JWT | List upcoming and past recruiter-scheduled interviews |

### Recruiter Dedicated Workspace (`/api/recruiter/`)
| Method | Endpoint | Auth | Role | Description |
|---|---|---|---|---|
| GET | `/api/recruiter/dashboard` | JWT | employer, admin | Recruiter KPIs, active job listings, and recent applicants |
| GET | `/api/recruiter/company` | JWT | employer, admin | Get company profile details |
| PUT | `/api/recruiter/company` | JWT | employer, admin | Update company profile (branding, size, website, benefits) |
| GET | `/api/recruiter/jobs` | JWT | employer, admin | List all jobs posted by the recruiter |
| POST | `/api/recruiter/jobs` | JWT | employer, admin | Create a new job listing with required/preferred skills |
| PUT | `/api/recruiter/jobs/:id` | JWT | employer, admin | Edit an existing job listing |
| DELETE | `/api/recruiter/jobs/:id` | JWT | employer, admin | Delete a job listing |
| PUT | `/api/recruiter/jobs/:id/status` | JWT | employer, admin | Open or close a job listing |
| GET | `/api/recruiter/applications` | JWT | employer, admin | View all applicants across all posted jobs with ATS filtering |
| GET | `/api/recruiter/candidates` | JWT | employer, admin | Search talent pool by skills, location, role, and experience |
| GET | `/api/recruiter/candidates/:candidateId` | JWT | employer, admin | View full candidate profile with portfolio, badges, and resumes |
| POST | `/api/recruiter/shortlist` | JWT | employer, admin | Shortlist an application |
| GET | `/api/recruiter/shortlisted` | JWT | employer, admin | View all shortlisted applications |
| POST | `/api/recruiter/interviews` | JWT | employer, admin | Schedule an interview (date, time, type, meeting link, notes) |
| GET | `/api/recruiter/interviews` | JWT | employer, admin | List all scheduled recruiter interviews |
| PUT | `/api/recruiter/interviews/:id` | JWT | employer, admin | Update interview status, feedback, or rating |
| GET | `/api/recruiter/conversations` | JWT | Any | Get message conversation threads |
| GET | `/api/recruiter/messages/:id` | JWT | Any | Get messages in a conversation thread |
| POST | `/api/recruiter/messages` | JWT | Any | Send a message in a conversation thread |

### Admin Portal & Governance (`/api/admin/`)
| Method | Endpoint | Auth | Role | Description |
|---|---|---|---|---|
| GET | `/api/admin/dashboard` | JWT | admin | Platform metrics, funnel stats, pending verifications, recent activity |
| GET | `/api/admin/users` | JWT | admin | List all platform users with role and status filtering |
| PUT | `/api/admin/users/:id/status` | JWT | admin | Update user status (`active`, `suspended`) or role (sends notification email) |
| DELETE | `/api/admin/users/:id` | JWT | admin | Delete user account (sends notification email) |
| GET | `/api/admin/recruiters` | JWT | admin | List registered recruiter accounts |
| GET | `/api/admin/companies` | JWT | admin | List registered companies with verification status |
| PUT | `/api/admin/companies/:id/verify` | JWT | admin | Approve or reject company verification (sends notification email) |
| GET | `/api/admin/jobs` | JWT | admin | List jobs across platform with moderation status |
| PUT | `/api/admin/jobs/:id/moderate` | JWT | admin | Approve or reject job posting (sends notification email) |
| GET | `/api/admin/applications` | JWT | admin | Overview of all applications platform-wide |
| GET | `/api/admin/skills` | JWT | admin | List all skills in taxonomy |
| POST | `/api/admin/skills` | JWT | admin | Add new skill to taxonomy |
| PUT | `/api/admin/skills/:id` | JWT | admin | Update skill in taxonomy |
| DELETE | `/api/admin/skills/:id` | JWT | admin | Delete skill from taxonomy |
| GET | `/api/admin/assessments` | JWT | admin | List all assessment quizzes |
| POST | `/api/admin/assessments` | JWT | admin | Create or update assessment quiz |
| DELETE | `/api/admin/assessments/:id` | JWT | admin | Delete assessment quiz |
| GET | `/api/admin/badges` | JWT | admin | List badge templates and issuance counts |
| POST | `/api/admin/badges` | JWT | admin | Create or update badge template |
| DELETE | `/api/admin/badges/:id` | JWT | admin | Delete badge template |
| GET | `/api/admin/reports` | JWT | admin | List all user-submitted reports |
| PUT | `/api/admin/reports/:id` | JWT | admin | Resolve or dismiss report with admin notes |
| GET | `/api/admin/analytics` | JWT | admin | Deep analytics on users, hiring pipeline, and in-demand skills |
| GET | `/api/admin/audit-logs` | JWT | admin | Retrieve audit trail entries |
| GET | `/api/admin/settings` | JWT | admin | Get platform configuration switches |
| PUT | `/api/admin/settings` | JWT | admin | Update platform configuration switches |
| GET | `/api/skills/taxonomy` | Optional | Any | Public skills taxonomy catalog |
| POST | `/api/skills/taxonomy` | JWT | admin | Compatibility endpoint to add skill |

### In-App Notifications & Reporting
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/api/notifications` | JWT | Get user notifications |
| PUT | `/api/notifications/:id/read` | JWT | Mark specific notification as read |
| PUT | `/api/notifications/read-all` | JWT | Mark all notifications as read |
| POST | `/api/reports` | JWT | Submit a report against a user, job, or message |

---

## 6. Frontend Routing & Page Hierarchy

The frontend uses a **custom HTML5 History API router** (`RouterContext.tsx`) with zero third-party router bloat. It synchronizes URL pathnames via `window.history.pushState` and `window.addEventListener('popstate')`, supporting clean URLs, query parameters, and dynamic parameter parsing.

### Public & Shell Routes
| Path | Component | Description |
|---|---|---|
| `/` or `/home` | `LandingPage.tsx` | Platform introduction, value proposition, and key metrics |
| `/jobs` | `JobsExplorerPage.tsx` | Searchable job board with filters and fit-score previews |
| `/jobs/:jobId` | `CandidateJobDetailView.tsx` | Detailed job posting with requirements breakdown |
| `/assessments` | `SkillAssessmentsPage.tsx` | Catalog of available skill assessment quizzes |
| `/roadmap` | `RoadmapPage.tsx` | Career roadmap generator launcher |
| `/portfolio` | `PortfolioPage.tsx` | Public project portfolio showcases |
| `/verify/:badgeCode` | `PublicBadgeVerifyPage.tsx` | Public badge verification page |
| `/login` | `LoginPage.tsx` | Authentication login page |
| `/register` | `RegisterPage.tsx` | User registration page |

### Candidate Workspace Routes (Requires `job_seeker` Role)
| Path | Component | Description |
|---|---|---|
| `/candidate/dashboard` | `CandidateDashboardView.tsx` | Candidate home with summary cards, recommended jobs, and badges |
| `/candidate/profile` | `CandidateProfileView.tsx` | Multi-section profile editor (education, experience, achievements) |
| `/candidate/skills` | `CandidateSkillsView.tsx` | Skills manager with proficiency self-ratings and verified badges |
| `/candidate/assessments` | `CandidateAssessmentsView.tsx` | Interactive quiz interface and earned digital credential showcase |
| `/candidate/roadmap` | `CandidateCareerRoadmapView.tsx` | Step-by-step career path with progress checkboxes |
| `/candidate/jobs` | `CandidateJobsView.tsx` | Job board displaying calculated match scores for candidate profile |
| `/candidate/jobs/:jobId` | `CandidateJobDetailView.tsx` | In-depth job specification with match explanation and apply button |
| `/candidate/applications` | `CandidateApplicationsView.tsx` | Tracker for active and past applications with status timelines |
| `/candidate/saved-jobs` | `CandidateSavedJobsView.tsx` | Bookmarked opportunities |
| `/candidate/portfolio` | `CandidatePortfolioView.tsx` | Portfolio project editor with live links and problem statements |
| `/candidate/resumes` | `CandidateResumeView.tsx` | Resume text management and primary resume selector |
| `/candidate/interview-prep` | `CandidateMockInterviewView.tsx` | Interview prep & mock interview launcher |
| `/candidate/mock-interview` | `CandidateMockInterviewView.tsx` | Interactive AI-powered mock interview simulator |
| `/candidate/interviews` | `CandidateInterviewsView.tsx` | Calendar of recruiter-scheduled live interviews |
| `/candidate/notifications` | `CandidateNotificationsView.tsx` | Inbox for application status alerts and system messages |
| `/candidate/settings` | `CandidateSettingsView.tsx` | Job preferences, privacy settings, and notifications |

### Recruiter Workspace Routes (Requires `employer` Role)
| Path | Component | Description |
|---|---|---|
| `/recruiter/dashboard` | `RecruiterDashboardView.tsx` | High-level recruitment metrics, active jobs, and recent applicants |
| `/recruiter/company` | `CompanyProfileView.tsx` | Organization profile editor and verification status badge |
| `/recruiter/jobs` | `MyJobsView.tsx` | Manage posted jobs (open, close, edit, delete) |
| `/recruiter/jobs/create` | `PostJobView.tsx` | Rich job creation form with weighted required & preferred skills |
| `/recruiter/jobs/edit/:id` | `PostJobView.tsx` | Edit existing job posting |
| `/recruiter/applications` | `RecruiterApplicationsView.tsx` | Recruitment ATS pipeline with stage columns and fit score sorting |
| `/recruiter/candidates` | `CandidateSearchView.tsx` | Talent search across platform candidates by skills and location |
| `/recruiter/candidates/:id` | `CandidateProfileDetailView.tsx` | Deep view into candidate profile, verified badges, and portfolio |
| `/recruiter/shortlisted` | `ShortlistedCandidatesView.tsx` | Filtered list of shortlisted candidates |
| `/recruiter/interviews` | `InterviewManagementView.tsx` | Schedule interviews and record feedback |
| `/recruiter/messages` | `RecruiterMessagingView.tsx` | Candidate communication channel |
| `/recruiter/notifications` | `RecruiterNotificationsView.tsx` | Recruiter-specific alerts |
| `/recruiter/settings` | `RecruiterSettingsView.tsx` | Recruiter account settings |

### Admin Portal Routes (Requires `admin` Role)
| Path | Component | Description |
|---|---|---|
| `/admin/login` | `AdminLoginPage.tsx` | Dedicated administrator login screen |
| `/admin/dashboard` | `AdminDashboardView.tsx` | Platform overview, KPI counters, moderation queues |
| `/admin/users` | `AdminUsersView.tsx` | User management (suspend, activate, delete, change roles) |
| `/admin/recruiters` | `AdminRecruitersView.tsx` | Recruiter directory and status |
| `/admin/companies` | `AdminCompaniesView.tsx` | Company verification queue (approve, reject with notes) |
| `/admin/jobs` | `AdminJobsModerationView.tsx` | Job moderation queue (approve, reject with reason) |
| `/admin/applications` | `AdminApplicationsView.tsx` | Complete view of applications platform-wide |
| `/admin/skills` | `AdminSkillsView.tsx` | Skills taxonomy manager (add, edit, categorize) |
| `/admin/assessments` | `AdminAssessmentsView.tsx` | Assessment quiz authoring and question editor |
| `/admin/badges` | `AdminBadgesView.tsx` | Badge templates and issuance metrics |
| `/admin/reports` | `AdminReportsView.tsx` | User dispute and report moderation |
| `/admin/analytics` | `AdminAnalyticsView.tsx` | Advanced charts on skill demand, funnel drops, and user activity |
| `/admin/activity-logs` | `AdminActivityLogsView.tsx` | System audit trail viewer |
| `/admin/settings` | `AdminSettingsView.tsx` | Global feature toggles (e.g. require job approval) |

---

## 7. Key Business Logic & Algorithms

### 1. Deterministic Job-Fit Matching Algorithm (`matching.service.ts`)
SkillBridge uses an explainable, deterministic matching algorithm rather than an opaque black box:
- **Required Skills Base (up to 75 points):**
  - Each job defines required skills with individual weights.
  - If a candidate claims a required skill: awards `weight * 0.85`.
  - If the skill is backed by an **earned digital badge**: awards full `weight * 1.0` plus **+5 verified bonus points**.
- **Preferred Skills Base (up to 15 points):**
  - Proportional match of preferred skills.
  - Backed by an earned digital badge: awards **+3 verified bonus points**.
- **Portfolio Evidence Bonus (up to 12 points):**
  - Automatically scans candidate's non-traditional portfolio projects.
  - For each project whose `skills_used` match required or preferred skills: awards **+4 practical portfolio points**.
- **Verified Badge Bonus Cap:** Up to 15 bonus points max.
- **Confidence Level Classification:**
  - **High:** $\ge 2$ verified badges and at least 1 matching portfolio project.
  - **Medium:** At least 50% of required skills matched.
  - **Low:** Fewer than 50% of required skills matched.
- **AI Match Explanation:** Generates human-readable summary detailing matched skills, missing skills, verified credentials, and portfolio projects.

### 2. AI Mock Interview Engine (`mockInterviewAI.service.ts` & `ai.service.ts`)
- **Dynamic Question Generation:**
  - Connects to Anthropic Claude API (`claude-3-5-sonnet-20241022`) when `ANTHROPIC_API_KEY` or `CLAUDE_API_KEY` is present.
  - Dynamically synthesizes situational questions, edge-case failure scenarios, and architectural deep-dives tailored to the job description and candidate background.
  - Algorithmic fallback generates role-specific technical and behavioral questions when no API key is set.
- **Real-Time Answer Evaluation:**
  - Immediate evaluation after each submitted response across 5 distinct axes:
    1. **Technical Knowledge** (0–100)
    2. **Communication & Articulation** (0–100)
    3. **Problem-Solving Ability** (0–100)
    4. **Answer Relevance** (0–100)
    5. **Confidence & Tone** (0–100)
  - Evaluates **STAR method** compliance (Situation, Task, Action, Result markers).
  - Produces structured constructive feedback: Identified Strengths, Areas for Improvement, and a Concrete Suggested Better Answer.
- **Session Finalization:**
  - Synthesizes cumulative category scores, an overall rating out of 10, and personalized preparation recommendations.

### 3. Personalized 4-Step Career Roadmaps (`ai.service.ts` & `roadmap.controller.ts`)
Generates actionable learning roadmaps specifically targeting missing job requirements:
- **Stage 1: Foundational Conceptual Learning** — Curated courses and tutorials for identified skill gaps.
- **Stage 2: Hands-On Milestone Project** — Concrete specification for a portfolio capstone project implementing the missing technologies.
- **Stage 3: Micro-Credential Verification** — Automated SkillBridge assessment quiz to earn a verifiable digital badge.
- **Stage 4: Targeted Job Application** — Applying to verified openings with elevated fit scores.

### 4. Transactional Email Notification Service (`email.service.ts`)
- Implements a responsive, branded HTML email layout.
- **Application Status Changes:** Dispatches formatted emails whenever an application moves between stages (`Applied`, `Under Review`, `Shortlisted`, `Interviewing`, `Offered`, `Rejected`).
- **Administrative Governance Actions:** Dispatches notification emails when administrators suspend/activate accounts, verify/reject companies, or approve/reject job postings.

---

## 8. Authentication, Authorization & Security

- **Stateless JWT Authentication:**
  - Tokens signed with `JWT_SECRET` (default fallback provided for local dev).
  - Token payload carries `id`, `name`, `email`, and `role`.
  - Expiration: **7 days**.
  - Stored in browser `localStorage` as `skillbridge_token` and automatically attached by Axios interceptors.
- **Role-Based Access Control (RBAC):**
  - Three distinct roles: `job_seeker`, `employer`, `admin`.
  - Enforced server-side via `requireRole(['employer', 'admin'])` middleware.
  - Enforced client-side through routing guards in `App.tsx`.
- **Password Security:** Salted hashing with `bcryptjs` (10 rounds).
- **Rate Limiting:** In-memory sliding-window IP rate limiter (`rateLimit.middleware.ts`) protecting against brute-force attacks.
- **Audit Trail:** Fire-and-forget `logAuditEvent()` writing to MongoDB `AuditLog` collection for administrative actions (logins, status changes, deletions).
- **CORS:** Configured for cross-origin client interaction with custom header support.

---

## 9. Internationalization (i18n)

SkillBridge features built-in multi-language translation support:
- **Supported Languages:**
  - English (`en`) — Default
  - Hindi (`hi`)
  - Tamil (`ta`)
  - Kannada (`kn`)
  - Malayalam (`ml`)
- **Implementation:**
  - Translations managed in `frontend/src/i18n/translations.ts` (36KB file).
  - Managed via `LanguageContext.tsx` with user preference persistence.

---

## 10. Running the Project Locally

### Prerequisites
- **Node.js:** v18.0.0+ (v20+ recommended)
- **npm:** v9.0.0+
- **MongoDB:** Local instance running at `mongodb://localhost:27017` or a MongoDB Atlas URI

### 1. Installation
```bash
# Install root, backend, and frontend dependencies
cd backend && npm install
cd ../frontend && npm install
```

### 2. Environment Configuration
Create or edit `backend/.env`:
```env
PORT=5001
MONGODB_URI=mongodb://localhost:27017/skillbridge
JWT_SECRET=YOUR_SECURE_JWT_SECRET_KEY

# Optional: Anthropic Claude API for dynamic AI mock interviews
ANTHROPIC_API_KEY=sk-ant-api03-...

# Optional: SMTP Configuration for transactional emails
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
SMTP_FROM_NAME=SkillBridge
SMTP_FROM_EMAIL=noreply@skillbridge.com
```

### 3. Development Server Launch
```bash
# Terminal 1: Start backend dev server (port 5001)
cd backend && npm run dev

# Terminal 2: Start frontend dev server (port 3000)
cd frontend && npm run dev
```

*Note:* Vite automatically proxies all requests from `http://localhost:3000/api/*` to `http://localhost:5001/api/*`.

### 4. Standalone Database Seeding
The database auto-seeds on first server launch. To manually run or re-seed:
```bash
cd backend && npm run seed
```

---

## 11. Key Architectural Decisions & Insights

1. **MongoDB Migration (v2.0.0):**
   - The platform migrated from SQLite (`better-sqlite3`) to **MongoDB via Mongoose**.
   - Flexible document schemas cleanly support nested user profiles, complex question arrays, fit-score breakdowns, and timeline events without requiring manual `JSON.parse()` / `JSON.stringify()` string conversions in SQL columns.
2. **HTML5 History API Router:**
   - Replaced heavy router dependencies with a lightweight custom router (`RouterContext.tsx`) that leverages `window.history.pushState` and `popstate` events while parsing clean URL paths and parameters.
3. **Dedicated Candidate & Recruiter Workspaces:**
   - Candidate views are fully separated into `/candidate/*` and recruiter views into `/recruiter/*`, each with tailored sidebar layouts, statistics, and domain workflows.
4. **Hybrid AI Architecture:**
   - Combines cutting-edge LLMs (Claude 3.5 Sonnet) for creative question generation with deterministic, auditable algorithms for job-fit scoring, ensuring fairness and full explainability.
5. **No Ad-Hoc Utilities:**
   - Clean color system designed around dark mode (`#0B0D0C`), neon accents (`#B6FF3B`), and consistent glassmorphic cards.

---

## 12. Notable File Sizes (Complexity Indicators)

| File | Size | Domain | Notes |
|---|---|---|---|
| `backend/src/controllers/platform.controller.ts` | 88.4 KB | Backend | Core platform controller: ATS pipeline, recruiter jobs, company verification, reports, moderation, messaging, analytics |
| `frontend/src/pages/candidate/CandidateMockInterviewView.tsx` | 73.5 KB | Frontend | Largest UI component: complete interactive AI mock interview room, timers, live scoring, voice/text modes |
| `frontend/src/pages/candidate/CandidateProfileView.tsx` | 42.0 KB | Frontend | Deep candidate profile editor (education entries, experience, soft skills, certifications) |
| `frontend/src/i18n/translations.ts` | 36.5 KB | Frontend | 5-language translation dictionary |
| `backend/src/controllers/candidateProfile.controller.ts` | 33.3 KB | Backend | Candidate workspace CRUD, resumes, skills, and preference management |
| `frontend/src/pages/recruiter/PostJobView.tsx` | 31.9 KB | Frontend | Multi-step job posting form with interactive skill weighting and requirements |
| `frontend/src/pages/recruiter/RecruiterApplicationsView.tsx` | 26.6 KB | Frontend | Full ATS pipeline view with status transitions and candidate filtering |
| `backend/src/services/mockInterviewAI.service.ts` | 23.9 KB | Backend | Anthropic Claude API integration + algorithmic question generation and evaluation engine |
| `frontend/src/pages/recruiter/CandidateProfileDetailView.tsx` | 23.9 KB | Frontend | Detailed candidate inspector for recruiters |
| `frontend/src/pages/candidate/CandidateDashboardView.tsx` | 22.6 KB | Frontend | Candidate dashboard with recommendations, stats, and badge widgets |
| `frontend/src/pages/recruiter/CompanyProfileView.tsx` | 20.7 KB | Frontend | Recruiter company profile and branding management |
| `frontend/src/pages/candidate/CandidateJobDetailView.tsx` | 19.1 KB | Frontend | Detailed job specification with match breakdown |
| `frontend/src/pages/candidate/CandidateSettingsView.tsx` | 19.2 KB | Frontend | Candidate settings and preference controls |
| `frontend/src/services/api.ts` | 18.4 KB | Frontend | Central Axios API client containing all typed API functions |
| `frontend/src/components/MockInterviewRoom.tsx` | 18.4 KB | Frontend | Audio/text interview room UI component |
| `backend/src/services/email.service.ts` | 16.2 KB | Backend | Branded responsive HTML transactional emails |
| `frontend/src/components/AssessmentQuiz.tsx` | 16.0 KB | Frontend | Timed interactive quiz engine |
| `frontend/src/components/ApplicantPipelineATS.tsx` | 15.3 KB | Frontend | Reusable Kanban ATS pipeline board |
| `backend/src/db/seed.ts` | 14.5 KB | Backend | Database seed data for skills taxonomy, quizzes, and badges |
