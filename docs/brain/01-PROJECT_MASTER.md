# 01 — PROJECT MASTER: ALUMNIBRIDGE

> **TAGLINE:** “Turning alumni goodwill into structured, sustained mentorship.”  
> **VERSION:** 1.0.0 (Production-Quality Hackathon MVP)  
> **STATUS:** SOURCE OF TRUTH — ACTIVE  

---

## 1. Executive Summary & Product Vision

### 1.1 Product Vision
**AlumniBridge** is a dedicated career-development and mentorship operating system for educational institutions. It transforms fragmented, informal, hit-or-miss alumni interactions into a structured, measurable, and sustainable institutional lifecycle:

$$\text{Student} \longrightarrow \text{Career Goals \& Skills} \longrightarrow \text{Transparent Match} \longrightarrow \text{Structured Mentorship} \longrightarrow \text{Milestone Evidence} \longrightarrow \text{Career Outcomes} \longrightarrow \text{Future Alumni Mentor}$$

AlumniBridge is:
- **NOT** a generic college portal with static links.
- **NOT** another social network or unmoderated chat platform.
- **NOT** a vanity dashboard of disconnected numbers.

It is a mission-critical platform where students acquire career clarity and verified milestones, alumni convert goodwill into quantifiable impact, and institutions gain aggregate visibility into skill development and career placement trajectories.

---

## 2. Problem Statement & Why It Matters

### 2.1 The Core Problem
1. **The Inequity of Informal Networks:** Traditional alumni mentorship heavily favors students who already possess social capital, confidence, or existing insider connections. First-generation or under-represented students rarely benefit from alumni networks.
2. **Lack of Institutional Infrastructure:** Colleges boast thousands of successful alumni on brochures, but career placement offices rely on ad-hoc spreadsheets, occasional guest lectures, and unmonitored email introductions.
3. **The Mentorship Abandonment Trap:** Well-intentioned mentorships fizzle out after one introductory coffee or call because there is no structured framework of milestones, agendas, or accountability.
4. **The Institutional Blind Spot:** Institutions have zero visibility into what happens between alumni and students. They cannot track skill gaps, session frequency, or direct correlations between alumni guidance and employment outcomes.

### 2.2 Why This Problem Matters
- **Employability Crisis:** Graduate underemployment stems from a gap between academic curricula and actual industry expectations. Alumni in the field understand exactly what skills are needed today.
- **Accreditation & Institutional Reputation:** Universities are increasingly judged on verified placement outcomes, median starting salaries, and active alumni engagement rates.
- **Alumni Retention:** Alumni want to give back meaningfully without being spammed or asked only for financial donations. Structured mentorship with measurable impact gives alumni deep emotional and professional satisfaction.

---

## 3. Target Users & Persona Problem Profiles

| User Persona | Core Identity | Primary Frustrations / Problems | Core Need in AlumniBridge |
| :--- | :--- | :--- | :--- |
| **Student** | Undergraduate / Postgraduate seeking internships or first jobs | • "I don't know anyone in my dream company or role."<br>• "Cold messages on LinkedIn get ignored."<br>• "I don't know what skills I am missing."<br>• "Mentorship chats feel aimless." | • Transparent matching based on target role, industry, and skills.<br>• Milestone-driven goals with mentor verification.<br>• Clear Career Readiness Index and visual Journey Timeline. |
| **Alumni / Mentor** | Working professional wanting to give back | • "Students reach out with vague 'tell me about your job' requests."<br>• "I don't have hours each week to waste on unfocused meetings."<br>• "I have no idea if my advice actually helped anyone." | • Clear boundaries (availability, topics, meeting mode).<br>• Goal-oriented sessions with shared agenda.<br>• An Alumni Impact Dashboard quantifying students guided, goals verified, and referrals made. |
| **Institution Administrator** | Dean, Director of Student Affairs, Academic Provost | • "We cannot prove the ROI of our alumni relations programs."<br>• "At-risk students fall through the cracks undetected."<br>• "We have no audit trail for student safety or program health." | • High-level dashboard of engagement, goal completion, and outcomes.<br>• Early Intervention alerting for disengaged or overdue students.<br>• Exportable compliance and institutional impact reports. |
| **Career / Placement Team** | Placement Officers, Career Counselors | • "We manage placements in siloed spreadsheets."<br>• "We don't know which industries or technical skills are trending among alumni employers." | • Skill gap analysis across departments.<br>• Direct visibility into internship-to-hire pipelines.<br>• Curated resource library aligned with real alumni requirements. |

---

## 4. Product Principles

1. **Structure Over Serendipity:** Every mentorship interaction has a defined goal, milestones, and verifiable evidence.
2. **Transparent, Explainable Intelligence:** Matching scores and readiness indicators are deterministic, transparently weighted, and explained in plain English. No black-box automated gatekeeping.
3. **No Dead Ends / Action-Oriented UI:** Every screen answers: *Where am I? What can I do here? What should I do next? Why does this information matter?* Every button performs a real action.
4. **Safety & Privacy by Design:** Role-based access control (RBAC) enforced server-side. Contact information is shielded; meetings and communications occur within institutional boundaries.
5. **Human Review for High Stakes:** AI suggests, summarizes, and explains, but humans approve mentorship requests, verify milestones, and certify career outcomes.

---

## 5. Core Product Loop

```
[Student Profile Created] 
       │
       ▼
[Career Goal & Skill Assessment] 
       │
       ▼
[Deterministic Match Engine: 0-100% Score + Plain-English Breakdown]
       │
       ▼
[Structured Request & Mentor Acceptance]
       │
       ▼
[Mentorship Workspace: Milestones, Sessions & Actionable Feedback]
       │
       ▼
[Evidence Verified & Career Readiness Index Dynamic Update]
       │
       ▼
[Career Outcome Recorded (Internship / Job / Higher Ed / Venture)]
       │
       ▼
[Institutional Analytics Updated & Student Transitions to Future Alumni Mentor]
```

---

## 6. MVP Scope vs. Out-of-Scope

### In-Scope (Hackathon MVP):
- **Role-Based Authentication & Session Management:** Student, Alumni, Admin, Career Team roles with secure HTTP-only cookies and cryptographic session verification.
- **Judge Mode / Fast Persona Switcher:** One-click instant switching between demo accounts (`student@demo.com`, `alumni@demo.com`, `admin@demo.com`, `career@demo.com`) with zero friction.
- **Student Onboarding Vertical Slice:** Multi-step guided career profile setup with skill assessment, target roles, industries, and baseline readiness calculation.
- **Transparent Mentor Discovery & Matching:** Multi-faceted search and filtering (industry, role, skills, mode, availability) with a weighted deterministic match score and clear "Why this mentor?" explanations.
- **Mentorship Request Lifecycle:** Request submission with structured goal, acceptance/decline flow, and instant workspace provisioning.
- **Mentorship Workspace:** Central hub for goals, milestones, sessions, notes, messaging, and progress tracking.
- **Goal & Milestone System:** Measurable SMART goals with progress indicators, evidence links, and mentor verification checkmarks.
- **Signature Wow #1: Career Journey Timeline:** Visual chronological progression from profile creation to first job outcome.
- **Signature Wow #2: AlumniBridge Readiness Index:** Multi-factor weighted readiness gauge (0-100%) with category breakdown and transparent explanation.
- **Signature Wow #3: Alumni Impact Dashboard:** Quantified volunteer impact (Students Mentored, Sessions Completed, Goals Verified, Referrals).
- **Signature Wow #4: Institutional & Early Intervention Analytics:** Funnel analytics, department trends, skill gaps, and support indicators for students needing attention.
- **Mentorship Messaging & Notification Center:** Mentorship-specific threads with contextual goal tags, and categorized activity notifications (Today, Yesterday, Earlier).
- **Curated Resource Library:** Institutional guides, interview frameworks, resume checklists, and technical roadmaps.
- **AI Copilot Layer:** Natural-language match justification, personalized goal recommendations, and session summarization.

### Explicitly Out-of-Scope (Deferred to Post-MVP):
- Real-time video WebRTC call streaming (MVP provides calendar links and meeting mode coordination).
- Direct payment/stipend processing (mentorship is voluntary institutional goodwill).
- Native iOS/Android app store binaries (mobile-first responsive PWA approach used).
- Full enterprise SSO / SAML integration (session + password auth with easy demo switcher used for hackathon).

---

## 7. Role Permissions Matrix (RBAC)

| Resource / Capability | STUDENT | ALUMNI / MENTOR | CAREER TEAM | ADMIN |
| :--- | :---: | :---: | :---: | :---: |
| Complete / Edit Own Profile | ✅ | ✅ | ✅ | ✅ |
| Search & Discover Mentors | ✅ | ✅ | ✅ | ✅ |
| Submit Mentorship Request | ✅ | ❌ | ❌ | ❌ |
| Accept / Decline Mentorship Request | ❌ | ✅ | ❌ | ✅ (Override) |
| Manage Mentorship Workspace & Goals | ✅ (Participant) | ✅ (Participant) | 👁️ (Read-only) | ✅ (Full) |
| Verify Milestones & Provide Feedback | ❌ | ✅ (Assigned Mentee) | ❌ | ✅ |
| Record Career Outcome | ✅ (Own) | ❌ | ✅ | ✅ |
| View Personal Impact Dashboard | ❌ | ✅ | ❌ | ❌ |
| View Early Intervention Dashboard | ❌ | ❌ | ✅ | ✅ |
| View Institutional Analytics & Export CSV | ❌ | ❌ | ✅ | ✅ |
| Create / Edit Resources | ❌ | ✅ (Contribute) | ✅ | ✅ |
| Manage System Users & Seed Data | ❌ | ❌ | ❌ | ✅ |

---

## 8. Success Metrics & Judging Criteria Alignment

1. **Problem Relevance (10/10):** Direct solution to the acute youth employability crisis and broken institutional alumni relations.
2. **Innovation (10/10):** Moves beyond ad-hoc chatting to an accountable milestone-and-evidence engine linked to verified career outcomes.
3. **Technical Implementation (10/10):** Modular Next.js 14 App Router monolith, full TypeScript type safety, deterministic scoring + explainable AI, atomic persistence layer, zero console errors.
4. **User Experience (10/10):** Polished, calm, modern interface inspired by Stripe/Linear design sensibilities, responsive layout, accessible typography, loading skeletons, and robust empty states.
5. **Practical Feasibility (10/10):** Ready to deploy today for any university or college with zero external database cost or complex microservices.
6. **Social Impact (10/10):** Democratizes access to high-value professional networks for students lacking personal connections.

---

## 9. Privacy & Responsible AI Principles

- **No Public Ranking of Students:** The Readiness Index is an individual educational diagnostic to help students improve, never a public leaderboard or exclusionary filter.
- **Deterministic First, AI Second:** Every critical decision (matching calculation, readiness index, milestone verification) functions with 100% reliability through deterministic algorithms. AI is strictly additive for natural language explanations, synthesis, and guidance.
- **Demographic Neutrality:** Matching never factors in race, gender, religion, or sensitive demographic attributes.
- **Data Minimization:** No sensitive salary or financial figures are mandatory; students retain granular control over what is visible.

---

## 10. Key Architecture Constraints & Decision Log

| Decision ID | Choice Made | Alternatives Considered | Rationale |
| :--- | :--- | :--- | :--- |
| **DEC-001** | Next.js 14 + React 18 + Tailwind | Remix, Vite SPA, NestJS + React | Next.js App Router provides unified server actions, API routes, fast SSR, and zero-config deployment. |
| **DEC-002** | Atomic File-backed Relational JSON Store with In-Memory Cache | Direct Supabase / PostgreSQL only | Guarantees the demo and testing suite work out of the box with zero external credential dependencies or cloud outages during hackathon presentations, while strictly matching PostgreSQL schema types. |
| **DEC-003** | HMAC-SHA256 Signed Session Cookies | JWT library, NextAuth/Auth.js | Zero third-party dependency bloat, ultra-fast server-side verification, transparent role decoding, full offline testability. |
| **DEC-004** | Deterministic Match Engine (Weighted Score) + AI Explanation | Pure Vector Search (Embeddings) | Vector embeddings alone hallucinate similarity and fail basic constraint filtering (e.g. matching an ECE student with a Finance mentor). Deterministic weights guarantee predictability; LLM adds natural language justification. |
| **DEC-005** | Instant Judge Mode Switcher | Forcing registration / login forms | Hackathon judges evaluate in 30 seconds; forcing them to create new passwords and verify emails leads to abandonment. Judge mode allows instant persona shifts with zero security bypass. |

---

## 11. Acceptance Criteria for Hackathon Demo

- [x] Clear Landing Page explaining the problem, product loop, and institutional ROI within 10 seconds.
- [x] Instant Demo Persona Switcher at top of the screen (Student, Alumni, Admin, Career Team).
- [x] Student can view Readiness Index (with breakdown), Goal Progress, and recommended mentors.
- [x] Mentor discovery allows live keyword search, industry filtering, and transparent "Why this mentor?" breakdown.
- [x] Student can send mentorship request -> Mentor accepts -> Mentorship workspace reflects active status.
- [x] Goals and Milestones can be created, marked in progress, verified, and reflect in the Readiness Index.
- [x] Career Journey visually maps the chronological trajectory.
- [x] Alumni Impact Dashboard displays verified mentorship statistics.
- [x] Admin Dashboard provides institutional funnel analytics, early intervention list, and CSV export.
- [x] Responsive layout functions seamlessly across desktop, tablet, and mobile views.

