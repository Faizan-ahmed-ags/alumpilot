# 05 — EXECUTION WORKFLOW & BUILD SEQUENCE

> **PROJECT:** AlumniBridge  
> **STRATEGY:** Vertical Slice First • Relational Integrity • Zero-Friction Judge Experience  
> **VERSION:** 1.0.0 — SOURCE OF TRUTH  

---

## 1. Phased Execution Roadmap

The implementation is structured into 10 sequential phases. Each phase builds a testable layer that compounds into the full end-to-end hackathon demonstration.

```
┌────────────────────────────────────────────────────────────────────────┐
│ PHASE 0: Permanent Brain Files & Architecture Groundwork               │
├────────────────────────────────────────────────────────────────────────┤
│ PHASE 1: Design System Primitives & Data Store Stability               │
├────────────────────────────────────────────────────────────────────────┤
│ PHASE 2: Landing Page & Top-Bar Judge Persona Switcher                 │
├────────────────────────────────────────────────────────────────────────┤
│ PHASE 3: Student Journey (Onboarding, Dashboard, Readiness Index)      │
├────────────────────────────────────────────────────────────────────────┤
│ PHASE 4: Mentor Discovery & Deterministic Match Engine                 │
├────────────────────────────────────────────────────────────────────────┤
│ PHASE 5: Mentorship Lifecycle (Request, Acceptance, Workspace)         │
├────────────────────────────────────────────────────────────────────────┤
│ PHASE 6: Goals, Milestones, Evidence & Verification                    │
├────────────────────────────────────────────────────────────────────────┤
│ PHASE 7: Career Journey Timeline & Outcome Recording                   │
├────────────────────────────────────────────────────────────────────────┤
│ PHASE 8: Alumni Impact & Institutional Admin Analytics                 │
├────────────────────────────────────────────────────────────────────────┤
│ PHASE 9: Polish, Hardening, Presentation Assets & E2E Validation      │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Phase-by-Phase Execution Details

### Phase 0: Foundation & Brain Repository (Current Phase)
- [x] Inspect existing workspace, package.json, configuration, and data structures.
- [x] Identify syntax and typing discrepancies in `lib/db/seed-data.ts` and `lib/db/types.ts`.
- [x] Author all 5 permanent brain files in `docs/brain/`:
  - `01-PROJECT_MASTER.md`
  - `02-UX_UI_SYSTEM.md`
  - `03-SYSTEM_ARCHITECTURE.md`
  - `04-ENGINEERING_AI_RULES.md`
  - `05-EXECUTION_WORKFLOW.md`

### Phase 1: Design System Primitives & Data Store Stability
- Fix type definitions in `lib/db/types.ts` (`Goal`, `Milestone`, `MentorRequest`, `Mentorship`, `MentorshipSession`, `ProgressUpdate`, `MentorFeedback`, `Conversation`, `AppNotification`).
- Fix `lib/db/seed-data.ts` syntax errors so `npm run typecheck` passes cleanly.
- Build reusable UI primitives in `components/ui/`:
  - `Button` (primary, secondary, ghost, destructive, with loading spinner)
  - `Input`, `Textarea`, `Select`
  - `Badge` (verified, in-progress, overdue, neutral)
  - `Card` and `CardHeader`, `CardTitle`, `CardContent`
  - `Modal` and `ConfirmationDialog`
  - `Skeleton` and `EmptyState`
- Implement global application layout shell (`app/layout.tsx`) with Inter font, toast system, and metadata.

### Phase 2: High-Impact Landing Page & Judge Mode Switcher
- Build the presentation-ready Landing Page (`app/page.tsx`):
  - Hero with high-contrast headline: *“Your career journey shouldn't depend on who you already know.”*
  - Interactive visual depicting the Student → Mentor → Goals → Outcome lifecycle.
  - Quick Feature Matrix: For Students, For Alumni, For Institutions.
- Build the **Judge Mode Top Bar** (`components/layout/judge-bar.tsx`):
  - One-click instant switcher across 4 demo personas:
    - 🎓 **Student:** `Riya Sharma` (`student@demo.com`)
    - 💼 **Alumni Mentor:** `Ananya Desai` (`alumni@demo.com`)
    - 🏛️ **Admin:** `Aditi Rao` (`admin@demo.com`)
    - 🎯 **Career Team:** `Maya Krishnan` (`career@demo.com`)
  - No typing, no password friction for hackathon evaluators.

### Phase 3: Student Journey (Onboarding, Dashboard, Readiness)
- Route: `/student/dashboard`
- Components:
  - `ReadinessGauge`: Interactive 0-100% circle with breakdown bars and transparent formula explanation.
  - `RecommendedAction`: High-visibility callout answering *"What should I do today?"*.
  - `ActiveMentorshipPreview`: Current mentor card, next upcoming session, active goals count.
  - `RecentActivityTimeline`: Real-time audit log of student milestone events.
- Route: `/student/onboarding`
  - 8-step clean progress stepper (Education, Target Roles, Industry, Skills, Mentorship Preferences).

### Phase 4: Mentor Discovery & Deterministic Match Engine
- Route: `/mentors`
- Real-time search with debounced text input.
- Multi-faceted filters (Industry, Target Role, Technical Skills, Availability, Meeting Mode).
- Transparent Match Card:
  - Match percentage pill (e.g. `94% Match`).
  - Itemized "Why this mentor?" breakdown explaining the deterministic factors.
- Route: `/mentors/[id]`
  - Detailed mentor profile with career history, previous student testimonials, and verified badges.
  - "Request Mentorship" modal with structured goal and cadence selector.

### Phase 5: Mentorship Lifecycle & Collaborative Workspace
- Student submits mentorship request -> Status `PENDING`.
- Switch to Alumni Mentor persona (`Ananya Desai`):
  - Request appears in Alumni Dashboard under "Pending Requests".
  - One-click "Accept Mentorship" -> Instantly provisions active `Mentorship` record.
- Shared Workspace: `/student/mentorship` and `/alumni/mentorship`
  - Header: Mentor + Student profiles, start date, session count, overall progress.
  - Tab 1: **Goals & Milestones**
  - Tab 2: **Sessions** (Scheduled check-ins with calendar time, meeting mode, agenda)
  - Tab 3: **Messages** (Contextual chat tied to active goals)
  - Tab 4: **Feedback** (Mentor session reflections and ratings)

### Phase 6: Goals, Milestones & Evidence Verification
- Route: `/student/goals`
- Student creates a SMART goal (e.g. *"Build and deploy full-stack portfolio application"*).
- Add actionable milestones (e.g. *"Wireframes"*, *"API backend"*, *"Live deployment on Vercel"*).
- Student submits evidence (link to repository or live demo).
- Mentor reviews and clicks "Verify Milestone" with green checkmark.
- Dynamic recalculation: Goal progress updates to 100%, and Student's Career Readiness Index increases in real time.

### Phase 7: Career Journey Timeline & Outcome Recording
- Route: `/student/journey`
- Signature visual interactive vertical timeline:
  - 🟢 Profile Onboarded
  - 🟢 Matched with Mentor (Ananya Desai)
  - 🟢 First Mentorship Session Completed
  - 🟢 Portfolio Goal Completed & Verified
  - 🟡 Applied for Summer Placement
  - ⚪ Record Career Outcome (Internship, Full-time Job, Higher Studies, Founder)
- Modal to record verified career placement:
  - Select status (e.g. `EMPLOYED`), Company (`Stripe`), Role (`Software Engineer`), Joining Date.
  - Instantly links student to the alumni network as a future mentor!

### Phase 8: Alumni Impact & Institutional Admin Analytics
- Route: `/alumni/impact`
  - Quantified volunteer impact: Students Mentored (12), Sessions Completed (38), Goals Verified (24), Referrals (5).
  - Mentee alumni conversion roster.
- Route: `/admin/dashboard` & `/admin/analytics`
  - Institutional KPIs: Total Students, Active Mentorships, Verified Mentors, Goal Completion Rate.
  - Funnel Chart: Requested → Matched → Active → Completed.
  - Skill Gap Matrix: High-demand industry skills vs. student cohort proficiency.
  - **Early Intervention Module:** Filterable list of students who require attention (e.g. Inactive > 14 days, Overdue goals, No mentor).
  - One-click "Export CSV" for institutional reporting.

### Phase 9: AI Layer, Presentation Assets & Hardening
- Centralized AI helpers in `lib/ai/` with fallback guarantees:
  - Match Explanation Generator (converts deterministic factors into natural language).
  - SMART Goal Suggester (suggests tailored milestones for specific target roles).
- Create presentation assets in `docs/presentation/`:
  - `PITCH.md` (3-minute hackathon pitch script).
  - `DEMO_SCRIPT.md` (Step-by-step judge walkthrough script).
  - `ARCHITECTURE.md` (Technical architecture summary for judges).
- Verify cross-device responsiveness, keyboard accessibility, and run comprehensive test suite.

---

## 3. The Primary 3-Minute Hackathon Demo Flow

This exact sequence is rehearsed and guaranteed to work with zero errors:

| Step | Persona | Action | Wow Factor / Observable Outcome |
| :---: | :--- | :--- | :--- |
| **1** | Public / Judge | Open `/` (Landing Page) | Understands problem & institutional value proposition within 15 seconds. |
| **2** | Judge Switcher | Click "Student (Riya Sharma)" | Instantly enters Student Dashboard without entering passwords. |
| **3** | Student | View Dashboard | Sees 74% Career Readiness Index, breakdown, and "Recommended Next Action". |
| **4** | Student | Navigate to `/mentors` | Searches "product", filters by "Technology", views **94% Match** with transparent bulleted breakdown. |
| **5** | Student | Request Mentorship | Submits structured goal request to mentor Ananya Desai. |
| **6** | Judge Switcher | Click "Alumni (Ananya Desai)" | Instantly switches to mentor persona. |
| **7** | Alumni | View Dashboard | Sees pending request from Riya Sharma. Clicks **Accept Request**. |
| **8** | Alumni | View Mentorship Workspace | Mentorship is active! Views shared goals, schedules next session. |
| **9** | Alumni | Verify Milestone | Reviews Riya's portfolio milestone evidence and clicks **Verify Milestone**. |
| **10**| Judge Switcher | Switch back to "Student" | Riya's Readiness Index immediately jumps from **74% → 79%**! |
| **11**| Student | Open Career Journey (`/student/journey`) | Views beautiful chronological timeline showing full trajectory. |
| **12**| Student | Record Career Outcome | Submits placement at "Acme Cloud" as Junior Software Engineer. |
| **13**| Judge Switcher | Click "Admin (Aditi Rao)" | Instantly switches to Institutional Admin view. |
| **14**| Admin | View Admin Analytics (`/admin/dashboard`) | New placement is aggregated live! Funnel and skill gap charts reflect update. |
| **15**| Admin | Early Intervention Table | Demonstrates proactive student support system. Downloads CSV report. |

---

## 4. Fictional Demo Accounts (Pre-Seeded & Ready)

| Role | Name | Email | Password | Key Context |
| :--- | :--- | :--- | :--- | :--- |
| **Student** | Riya Sharma | `student@demo.com` | `demo1234` | Final-year CSE student targeting Product Engineering; active mentee of Ananya Desai. |
| **Alumni Mentor** | Ananya Desai | `alumni@demo.com` | `demo1234` | Senior PM at Google (Class of '19); 12 students mentored; high availability. |
| **Admin** | Aditi Rao | `admin@demo.com` | `demo1234` | Dean of Career Services; oversees institutional mentorship and placements. |
| **Career Team** | Maya Krishnan | `career@demo.com` | `demo1234` | Placement Officer; analyzes skill gaps and industry hiring trends. |

*Safety Note:* All demo data is strictly fictional. No real personal identities or private contact details are utilized.

