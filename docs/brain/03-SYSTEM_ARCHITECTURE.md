# 03 — SYSTEM ARCHITECTURE & DATA SPECIFICATION

> **SYSTEM:** AlumniBridge Core Engine  
> **ARCHITECTURAL PATTERN:** Domain-Driven Modular Monolith with Relational Data Modeling  
> **VERSION:** 1.0.0 — SOURCE OF TRUTH  

---

## 1. System Topology & Technology Stack

```
┌────────────────────────────────────────────────────────────────────────┐
│                          CLIENT (BROWSER)                              │
│  React 18 • Next.js 14 App Router • Tailwind CSS • Lucide • Recharts   │
└───────────────────────────────────▲────────────────────────────────────┘
                                    │ HTTPS / HTTP-Only Session Cookie
┌───────────────────────────────────▼────────────────────────────────────┐
│                    NEXT.JS FULL-STACK SERVER TIER                      │
│                                                                        │
│ ┌───────────────────────────┐         ┌──────────────────────────────┐ │
│ │  Server Actions & Routes  │         │      Session Middleware      │ │
│ │  (Validated with Zod)     │         │  (HMAC-SHA256 Token Verify)  │ │
│ └─────────────┬─────────────┘         └──────────────┬───────────────┘ │
│               │                                      │                 │
│ ┌─────────────▼──────────────────────────────────────▼───────────────┐ │
│ │                      DOMAIN SERVICE LAYER                          │ │
│ │  • AuthService         • MentorshipService   • ReadinessService    │ │
│ │  • ProfileService     • GoalsService        • AnalyticsService    │ │
│ │  • MatchingService    • MilestoneService    • EarlyIntervention   │ │
│ └─────────────┬──────────────────────────────────────┬───────────────┘ │
│               │                                      │                 │
│ ┌─────────────▼─────────────┐         ┌──────────────▼───────────────┐ │
│ │   Deterministic Engines   │         │     AI Assistance Layer      │ │
│ │   • Match Formula (0-100) │         │     • Match Explainer        │ │
│ │   • Readiness Index (0-100│         │     • Goal Recommender       │ │
│ │   • Profile Completeness  │         │     • Session Summarizer     │ │
│ └─────────────┬─────────────┘         └──────────────┬───────────────┘ │
└───────────────┼──────────────────────────────────────┼─────────────────┘
                │                                      │
┌───────────────▼──────────────────────────────────────▼─────────────────┐
│                        DATA PERSISTENCE TIER                           │
│                                                                        │
│  [Runtime Adapter: lib/db/client.ts]                                   │
│  • In-Memory Fast Cache                                               │
│  • Atomic Synchronous Persistence (tmp file + atomic rename)           │
│  • Mirrors PostgreSQL/Supabase Relational DDL (database/schema.sql)    │
└────────────────────────────────────────────────────────────────────────┘
```

### 1.1 Core Technology Choices
- **Framework:** Next.js 14.2.x (App Router) + React 18.
- **Language:** TypeScript 5.6 (strict mode enabled, zero `any` policy).
- **Styling:** Tailwind CSS with custom design tokens (`canvas`, `ink`, `brand`, `line`).
- **Icons:** `lucide-react`.
- **Visualization:** `recharts` for funnel analytics, skill matrices, and cohort outcomes.
- **Schema Validation:** `zod` for client & server boundary validation.
- **Form Management:** `react-hook-form` + `@hookform/resolvers/zod`.
- **Date Handling:** `date-fns` for clean human-readable date formatting and group bucketing.
- **Persistence Layer:** Fully typed relational repository with atomic file persistence for zero-friction local/judge testing, engineered as a direct drop-in replacement for Supabase / PostgreSQL.

---

## 2. Relational Database Schema & Entities

The entity model is strictly relational with foreign-key referential integrity and audit trails:

```
┌─────────────┐       ┌──────────────────────┐       ┌──────────────────────┐
│    users    │──────<│   student_profiles   │──────<│   career_outcomes    │
└──────┬──────┘       └──────────┬───────────┘       └──────────────────────┘
       │                         │
       │                         ├──────────────────<│   goal_milestones    │
       │                         │                   └──────────▲───────────┘
       │                         ▼                              │
       │              ┌──────────────────────┐                  │
       │              │     career_goals     │──────────────────┤
       │              └──────────▲───────────┘                  │
       │                         │                              │
       │                         ▼                              │
       │              ┌──────────────────────┐                  │
       ├─────────────<│     mentorships      │──────────────────┘
       │              └──────────▲───────────┘
       │                         │
       │              ┌──────────┴───────────┐
       ├─────────────<│  mentorship_requests │
       │              └──────────────────────┘
       │
       ▼
┌─────────────────────┐       ┌──────────────────────┐
│   alumni_profiles   │──────<│  mentorship_sessions │
└─────────────────────┘       └──────────────────────┘
```

### 2.1 Entity Definitions & Relationships

1. **`users`**
   - Primary user identity table.
   - Fields: `id`, `name`, `email`, `passwordHash`, `role` (`STUDENT`, `ALUMNI`, `ADMIN`, `CAREER_TEAM`), `status` (`ACTIVE`, `DISABLED`), `avatarColor`, `departmentId`, `graduationYear`, `createdAt`, `updatedAt`, `lastActiveAt`.

2. **`student_profiles`**
   - Extends `users` (1-to-1 where `userId` = `user.id`).
   - Fields: `id`, `userId`, `headline`, `bio`, `departmentId`, `degree`, `graduationYear`, `location`, `hasCV`, `skills` (Array of `{ skillId, level: 1..5, targetLevel: 1..5 }`), `careerInterests`, `targetRoles`, `targetIndustries`, `mentorshipTopics`, `mentorshipPreferences` (`mode`, `frequency`, `language`), `onboardingCompleted`, `onboardingStep`, `profileCompleteness`, `readinessIndex`, `readinessBreakdown`, `createdAt`, `updatedAt`.

3. **`alumni_profiles`**
   - Extends `users` (1-to-1 where `userId` = `user.id`).
   - Fields: `id`, `userId`, `headline`, `bio`, `company`, `role`, `industry`, `location`, `graduationYear`, `departmentId`, `workExperienceYears`, `isMentor`, `mentorshipAvailable`, `availability` (`High`, `Medium`, `Low`), `preferredMode`, `responseRate`, `studentsMentored`, `sessionsCompleted`, `goalsCompleted`, `referralsMade`, `skills` (string[]), `mentorshipTopics` (string[]), `languages` (string[]), `verified`, `createdAt`, `updatedAt`.

4. **`mentorship_requests`**
   - Captures student-to-mentor connection applications.
   - Fields: `id`, `studentUserId`, `mentorUserId`, `goal`, `reason`, `message`, `meetingPreference`, `availability`, `status` (`PENDING`, `ACCEPTED`, `DECLINED`, `COMPLETED`), `createdAt`, `updatedAt`.

5. **`mentorships`**
   - The active collaborative engagement established upon request acceptance.
   - Fields: `id`, `requestId`, `studentUserId`, `mentorUserId`, `status` (`ACTIVE`, `COMPLETED`, `PAUSED`), `startedAt`, `completedAt`, `progress` (0-100), `goalsCompleted`, `sessionCount`, `lastActivityAt`, `createdAt`.

6. **`career_goals`**
   - SMART goals owned by a student within a mentorship or independently.
   - Fields: `id`, `mentorshipId`, `studentUserId`, `mentorUserId`, `title`, `description`, `category` (`Portfolio project`, `Resume & LinkedIn`, `Technical skills`, `Interview preparation`, `Industry networking`), `targetDate`, `status` (`TODO`, `IN_PROGRESS`, `COMPLETED`, `OVERDUE`), `progress` (0-100), `mentorVerified`, `createdAt`, `updatedAt`.

7. **`goal_milestones`**
   - Step-by-step deliverable sub-tasks under a goal.
   - Fields: `id`, `goalId`, `title`, `status` (`TODO`, `IN_PROGRESS`, `DONE`), `evidence` (URL, repository link, or document reference), `completedAt`, `createdAt`.

8. **`mentorship_sessions`**
   - Formal mentorship meetings and check-ins.
   - Fields: `id`, `mentorshipId`, `title`, `scheduledAt`, `durationMinutes`, `meetingUrl`, `status` (`SCHEDULED`, `COMPLETED`, `CANCELLED`), `agenda`, `notes`, `studentNotes`, `createdAt`.

9. **`career_outcomes`**
   - Verified post-mentorship career placement record.
   - Fields: `id`, `studentUserId`, `status` (`INTERNSHIP`, `EMPLOYED`, `HIGHER_STUDIES`, `ENTREPRENEUR`, `SEEKING_OPPORTUNITY`), `company`, `role`, `industry`, `location`, `joiningDate`, `salaryRange`, `internshipDuration`, `higherEducation`, `createdAt`, `updatedAt`.

10. **`messages` & `conversations`**
    - Contextual mentorship messaging tied to active goals and sessions.

11. **`resources`**
    - Institutional career guides, checklists, and interview blueprints.

12. **`audit_logs` & `activity`**
    - Immutable operational audit log capturing every security, status, and milestone event.

---

## 3. The Deterministic Engines

AlumniBridge strictly adheres to the principle: **Deterministic First, AI Second**. Core scoring never breaks, hallucinates, or depends on external API limits.

### 3.1 Transparent Mentor Matching Engine Formula

The match score is calculated transparently from 0 to 100 based on quantifiable alignment:

$$\text{Score} = \sum (\text{Weight}_i \times \text{Factor}_i)$$

| Dimension | Weight | Deterministic Evaluation Rule |
| :--- | :---: | :--- |
| **Career Goal / Target Role** | `25%` | Full points if student target role matches mentor current or past role; partial match on substring / token overlap. |
| **Target Industry** | `20%` | Exact match on industry domain (e.g. "Technology", "Fintech", "Healthcare"). |
| **Skill Relevance & Gaps** | `20%` | Overlap between student's desired target skills (where `targetLevel > level`) and mentor's verified skills. |
| **Mentorship Topics** | `15%` | Overlap in focus areas (e.g., "Interview Preparation", "Portfolio Review", "System Design"). |
| **Availability & Mode** | `10%` | High availability = 100%, Medium = 75%, Low = 40%; matching meeting mode preference (Video/Chat/Hybrid). |
| **Department / Background** | `10%` | Shared academic department or common alma mater foundation. |

Every match card explicitly displays its calculated score alongside an itemized bulleted list of factors:
> **94% Match — Why This Mentor?**  
> ✓ Both focused on **Software Engineering** and **Technology**  
> ✓ Mentor possesses 3 skills you are actively developing: **System Design**, **Cloud**, **React**  
> ✓ Matching availability: **Evenings & Weekends (Video)**  
> ✓ Alumnus from **Computer Science & Engineering**

---

### 3.2 AlumniBridge Career Readiness Index Engine

Informational composite indicator (0-100%) that measures observable student progress across 7 dimensions:

$$\text{Readiness Index} = \sum_{k} w_k \cdot S_k$$

Default institutional weights:
- **Skills Score ($w = 0.25$):** Average rating of current technical and professional skills relative to target benchmarks.
- **Mentorship Engagement ($w = 0.20$):** Frequency of sessions held, attendance consistency, and active response rate.
- **Goal Completion Pace ($w = 0.15$):** Percentage of milestones and goals delivered on or before deadlines.
- **Projects & Portfolio Evidence ($w = 0.15$):** Verified repository links, live demos, and artifacts attached to milestones.
- **Interview Preparation ($w = 0.10$):** Mock sessions completed, feedback ratings, and interview guides reviewed.
- **Profile Completeness ($w = 0.10$):** Completion of bio, education, resume flag, target roles, and preferences.
- **Internship / Work Experience ($w = 0.05$):** Recorded real-world internship or industry project outcome.

*Guardrail:* The score is accompanied by an educational breakdown and suggestions on how to improve. It is never used to rank students against each other.

---

## 4. AI Assistance Layer Architecture

AI functions as an accelerator on top of the deterministic foundation. All AI calls are centralized in `lib/ai/` and wrapped with strict fallback behavior:

```
lib/ai/
├── providers/        # LLM client abstractions (Gemini / Anthropic / Local fallback)
├── prompts/          # Structured markdown prompt templates
├── schemas/          # Zod schemas for validated structured JSON outputs
├── services/         # Domain-specific AI services:
│   ├── match-explainer.service.ts
│   ├── goal-suggester.service.ts
│   ├── session-summary.service.ts
│   └── admin-insights.service.ts
└── fallbacks/        # Guaranteed deterministic template fallbacks if LLM is offline
```

### 4.1 AI Feature Implementations
1. **Natural Language Match Explanation:** Translates raw matching scores into a personalized 2-sentence rationale for the student.
2. **SMART Goal & Milestone Suggester:** Given a student's target role and current skill gaps, suggests 3 structured goals with pre-filled milestones.
3. **Session Notes Summarizer:** Extracts action items and next-step commitments from raw mentor-student session notes.
4. **Institutional Macro Insights:** Generates executive bullet summaries from aggregate placement and engagement analytics for administrators.

---

## 5. Security & Authorization Architecture

### 5.1 Server-Side RBAC Enforcement
Client-side role checks are treated strictly as UI presentation conveniences. Every server action and API route invokes `requireRole()`:

```typescript
// Pattern enforced on every mutation:
export async function verifyMilestoneAction(milestoneId: string) {
  const session = await getAuthenticatedSession();
  if (!session) throw unauthorized();
  
  // Re-verify against database
  const user = await db.users.find(session.sub);
  if (user.role !== "ALUMNI" && user.role !== "ADMIN") {
    throw forbidden("Only mentors or administrators can verify milestones.");
  }
  // Proceed with business logic...
}
```

### 5.2 Cryptographic Session Tokens
- Tokens are signed with HMAC-SHA256 (`crypto.subtle`) using `AUTH_SECRET`.
- Stored in `httpOnly`, `sameSite: "lax"`, `secure` (in production) cookies.
- Payload contains subject user ID (`sub`), validated role (`role`), and Unix expiry timestamp (`exp`).

---

## 6. Directory Structure

```
Alumpilot/
├── app/
│   ├── (auth)/
│   │   ├── login/page.tsx
│   │   └── register/page.tsx
│   ├── (dashboard)/
│   │   ├── layout.tsx                # App shell, sidebar, top bar, demo switcher
│   │   ├── student/
│   │   │   ├── dashboard/page.tsx
│   │   │   ├── onboarding/page.tsx
│   │   │   ├── mentorship/page.tsx
│   │   │   ├── goals/page.tsx
│   │   │   └── journey/page.tsx
│   │   ├── alumni/
│   │   │   ├── dashboard/page.tsx
│   │   │   ├── mentorship/page.tsx
│   │   │   └── impact/page.tsx
│   │   ├── admin/
│   │   │   ├── dashboard/page.tsx
│   │   │   ├── intervention/page.tsx
│   │   │   └── analytics/page.tsx
│   │   ├── career/
│   │   │   └── dashboard/page.tsx
│   │   ├── mentors/
│   │   │   ├── page.tsx              # Mentor discovery & search
│   │   │   └── [id]/page.tsx         # Detailed profile & request modal
│   │   └── resources/page.tsx        # Career guides & checklists
│   ├── api/
│   │   ├── auth/
│   │   ├── mentors/
│   │   ├── mentorships/
│   │   ├── goals/
│   │   └── analytics/
│   ├── layout.tsx                    # Root layout with font and metadata
│   └── page.tsx                      # Modern presentation landing page
├── components/
│   ├── ui/                           # Reusable design system primitives
│   │   ├── button.tsx
│   │   ├── input.tsx
│   │   ├── card.tsx
│   │   ├── badge.tsx
│   │   ├── modal.tsx
│   │   ├── skeleton.tsx
│   │   └── empty-state.tsx
│   ├── layout/                       # Sidebar, header, navigation, demo bar
│   ├── student/                      # Student widgets (Readiness gauge, Goal cards)
│   ├── alumni/                       # Impact widgets, mentee cards
│   ├── admin/                        # Funnels, early-intervention tables
│   └── shared/                       # Journey timeline, matching breakdown
├── lib/
│   ├── analytics/                    # Readiness index calculation & metrics
│   ├── api/                          # Error handling & HTTP response builders
│   ├── auth/                         # Session signing, verification, passwords
│   ├── db/                           # Types, relational client, compute, seed data
│   ├── ai/                           # AI services, prompts, fallbacks
│   └── utils/                        # Tailwind cn, formatting, dates, ids
└── docs/
    └── brain/                        # 5 Permanent Brain files
```

