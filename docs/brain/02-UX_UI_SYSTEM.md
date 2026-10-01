# 02 — UX/UI SYSTEM SPECIFICATION: ALUMNIBRIDGE

> **TAGLINE:** “Turning alumni goodwill into structured, sustained mentorship.”  
> **DESIGN ETHOS:** Calm, Crisp, Professional, High-Density Clarity, Human-Centered  
> **VERSION:** 1.0.0 — SOURCE OF TRUTH  

---

## 1. Design Vision & Philosophy

AlumniBridge adopts the refined aesthetic of world-class productivity tools (Linear, Stripe Dashboard, Notion) while establishing its own distinguished identity:
- **Calm & Dignified:** Avoids neon saturation, playful gimmicks, or childish gamification. Mentorship is about high-stakes human careers.
- **High-Density Clarity:** Information is structured with crisp borders, generous whitespace, and sharp typographic hierarchy rather than heavy drop shadows or skeuomorphism.
- **Action-Oriented Intent:** Every view clearly answers four fundamental questions within 3 seconds:
  1. *Where am I?* (Clear breadcrumb, role badge, page title)
  2. *What can I do here?* (High-contrast primary CTA, contextual actions)
  3. *What should I do next?* (Explicit next-step recommendations and progress cues)
  4. *Why does this matter?* (Transparent metrics and plain-English explanations)

---

## 2. Brand & Token System

### 2.1 Color Palette
Built on subtle slate neutrals with high-contrast text and a commanding indigo brand accent:

| Token Name | Hex Code | Purpose & Usage |
| :--- | :--- | :--- |
| `canvas` | `#F7F8FA` | Platform background; cool neutral canvas that prevents eye strain |
| `card` | `#FFFFFF` | Elevated surfaces, cards, modals, table rows, drawers |
| `ink` | `#111827` | Headings, primary content text, active state icons (90% contrast) |
| `ink-soft` | `#344054` | Body text, table data, subheadings |
| `ink-mute` | `#667085` | Secondary metadata, timestamps, input placeholders, breadcrumbs |
| `ink-faint` | `#98A2B3` | Disabled text, decorative dividers, subtle borders |
| `brand` | `#4F46E5` | Primary buttons, active tab indicators, key focus highlights |
| `brand-50` | `#EEF2FF` | Active navigation item background, light badge tint |
| `brand-700`| `#4338CA` | Hover state for primary buttons |
| `success` | `#16A34A` | Completed goals, verified milestones, positive outcome indicators |
| `success-soft`| `#F0FDF4` | Success badge background, verified milestone pill |
| `warning` | `#D97706` | Pending requests, approaching deadlines, in-progress items |
| `warning-soft`| `#FFFBEB` | Warning banner and alert backgrounds |
| `danger` | `#DC2626` | Overdue milestones, disengagement alerts, destructive actions |
| `danger-soft` | `#FEF2F2` | Early intervention callouts, error toasts |
| `line` | `#E4E7EC` | Default card borders, table dividers, panel splitters |
| `line-strong`| `#D0D5DD` | Input borders, active dividers, table headers |

### 2.2 Typography Scale
Font Family: **Inter**, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif.

| Level | Size / Line Height | Weight | Tracking | Usage |
| :--- | :--- | :--- | :--- | :--- |
| **Hero Title** | `36px` / `44px` | `700` (Bold) | `-0.025em` | Landing page hero, major dashboard greeting |
| **Heading 1 (H1)** | `28px` / `36px` | `600` (Semibold) | `-0.02em` | Section headers, workspace titles |
| **Heading 2 (H2)** | `20px` / `28px` | `600` (Semibold) | `-0.015em` | Card titles, modal headers, timeline nodes |
| **Heading 3 (H3)** | `16px` / `24px` | `600` (Semibold) | `-0.01em` | Subsection headers, data table group headers |
| **Body (Default)** | `14px` / `20px` | `400` (Regular) | `normal` | General interface copy, table rows, form inputs |
| **Body Medium** | `14px` / `20px` | `500` (Medium) | `normal` | Interactive text, button labels, tabs |
| **Small / Label** | `12px` / `16px` | `500` (Medium) | `+0.01em` | Badges, input labels, metadata, chart legends |
| **Micro / Helper** | `11px` / `14px` | `400` (Regular) | `+0.015em` | Tooltips, timestamp footers, sub-captions |

### 2.3 Spacing & Layout Rhythm
Values: `4px`, `8px`, `12px`, `16px`, `20px`, `24px`, `32px`, `40px`, `48px`, `64px`.
- Micro spacing (badges, icons, tags): `4px` - `8px`
- Form fields and list items: `12px` - `16px`
- Card padding and grid gutters: `20px` - `24px`
- Section separation: `32px` - `48px`

### 2.4 Corner Radii & Elevation
- **Input / Tag / Badge:** `6px` – `8px` (`rounded-md`)
- **Card / Dropdown / Popover:** `12px` (`rounded-xl`)
- **Modal Dialog / Sheet:** `16px` (`rounded-2xl`)
- **Shadows:** Extremely restrained. Standard cards use `box-shadow: 0 1px 2px rgba(16,24,40,0.05)` accompanied by a crisp `1px solid #E4E7EC` border.

---

## 3. Global Navigation & App Shell

```
┌────────────────────────────────────────────────────────────────────────┐
│ TOP BAR: Logo | Judge Mode Persona Switcher | Notifications | UserMenu │
├──────────────┬─────────────────────────────────────────────────────────┤
│ SIDEBAR      │ MAIN CONTENT CONTAINER                                  │
│ • Dashboard  │ Breadcrumbs / Page Title / Action Header                │
│ • Mentors    ├─────────────────────────────────────────────────────────┤
│ • Workspace  │ [Dynamic Screen Content Grid]                           │
│ • Goals      │                                                         │
│ • Journey    │                                                         │
│ • Resources  │                                                         │
│ • Settings   │                                                         │
└──────────────┴─────────────────────────────────────────────────────────┘
```

### 3.1 Role-Specific Navigation Structures

#### Student Navigation
1. **Dashboard** (`/student/dashboard`): Readiness score, recommended action, goals snapshot, mentor quick links.
2. **Discover Mentors** (`/mentors`): Full search, filter, matching algorithm score, and mentor profile inspection.
3. **My Mentorship** (`/student/mentorship`): Active mentorship workspace, sessions, milestone checklists, and notes.
4. **Goals & Progress** (`/student/goals`): Measurable SMART goals, evidence submissions, and mentor verifications.
5. **Career Journey** (`/student/journey`): Visual interactive timeline of career trajectory, readiness breakdown, and outcome recording.
6. **Resources** (`/resources`): Curated guides, interview prep, resume checklists.

#### Alumni / Mentor Navigation
1. **Alumni Dashboard** (`/alumni/dashboard`): Pending mentee requests, active mentees, upcoming sessions, recent activity.
2. **Mentorship Workspace** (`/alumni/mentorship`): Mentee tracking, milestone approvals, session notes, feedback logging.
3. **My Impact** (`/alumni/impact`): Quantified volunteer metrics (students mentored, sessions held, goals verified, referrals).
4. **Resources & Community** (`/resources`): Browse and contribute guides for students.

#### Institution Administrator Navigation
1. **Admin Overview** (`/admin/dashboard`): High-level KPI metrics, mentorship funnels, department health, placement trends.
2. **Early Intervention** (`/admin/intervention`): Operational support list flagging students with overdue goals, zero sessions, or incomplete profiles.
3. **Analytics & Reports** (`/admin/analytics`): Deep dive charts (skill gaps, industry distribution, outcome tracking, CSV export).
4. **User & Resource Management** (`/admin/management`): Student roster, alumni verification, resource publishing.

#### Career / Placement Team Navigation
1. **Placement Dashboard** (`/career/dashboard`): Active student readiness distribution, internship tracking, hiring pipeline.
2. **Employer & Industry Trends** (`/career/trends`): Skill demand by industry, top hiring alumni companies.
3. **Student Directory & Intervention** (`/career/students`): Student readiness profiles and counseling notes.

---

## 4. Reusable Component Specifications

### 4.1 Button Hierarchy
- **Primary:** High-emphasis solid brand background (`bg-brand-600 text-white hover:bg-brand-700 shadow-sm`). Used for the single primary task per view (e.g., "Request Mentorship", "Create Goal", "Verify Milestone").
- **Secondary:** Neutral bordered button (`bg-white text-ink border border-line hover:bg-canvas hover:border-line-strong`). Used for supporting actions ("Filter", "Export CSV", "Cancel").
- **Tertiary / Ghost:** No border, transparent background (`text-ink-soft hover:bg-canvas hover:text-ink`). Used for pagination, minor controls, view toggles.
- **Destructive:** Bordered or solid warning red (`bg-white text-danger border border-danger/30 hover:bg-danger-soft`). Requires confirmation modal.

### 4.2 Form Inputs & Validation
- **Label:** `text-xs font-semibold text-ink-soft mb-1.5 flex justify-between`
- **Field:** `h-10 px-3 rounded-lg border border-line bg-white text-sm text-ink placeholder:text-ink-mute focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand`
- **Error Message:** `text-xs text-danger mt-1 flex items-center gap-1 font-medium`
- **Helper Text:** `text-xs text-ink-mute mt-1`

### 4.3 Badge & Status Indicator System
- **Verified / Completed:** `bg-success-soft text-success border border-success/20`
- **In Progress / Pending:** `bg-warning-soft text-warning border border-warning/20`
- **High Priority / Overdue:** `bg-danger-soft text-danger border border-danger/20`
- **Informational / Category:** `bg-brand-50 text-brand-700 border border-brand-200`
- **Neutral:** `bg-canvas text-ink-soft border border-line`

### 4.4 Data States & Feedback Architecture
Every data-driven container handles 6 mandatory states:
1. **Loading / Fetching:** Animated skeleton blocks replicating the real content geometry (no generic bouncing spinners).
2. **Empty State:** Clean illustration/icon, clear header, explanatory helper, and a direct CTA (e.g., "No active goals yet. Add your first goal to kick off your mentorship.").
3. **Error State:** Friendly human-language explanation, recovery instructions, and an explicit "Try Again" retry button. Raw HTTP errors (500, 404) are sanitized.
4. **Success State:** Immediate visual feedback (toast notification or inline banner) with contextual link.
5. **Confirmation Modal:** Non-reversible actions (decline request, delete goal) trigger a modal detailing exact consequences.

---

## 5. Screen-by-Screen Specifications

### Screen 1: Landing Page (`/`)
- **Purpose:** Introduce AlumniBridge value proposition in 30 seconds; demonstrate product loop and institutional ROI; provide immediate demo access.
- **Primary Action:** "Explore Platform" / "Launch Interactive Demo"
- **Hero Headline:** “Your career journey shouldn't depend on who you already know.”
- **Hero Subtitle:** “AlumniBridge connects students with experienced alumni, turns mentorship into measurable goals, and helps institutions understand career outcomes.”
- **Visual:** Interactive preview showing the Student → Mentor → Goal → Outcome lifecycle.
- **Sections:**
  1. *Hero with Quick Demo Switcher*
  2. *How It Works (4-Step Lifecycle)*
  3. *Three Portals: Students, Mentors, Institutions*
  4. *Signature Features Preview (Readiness Index, Career Timeline, Impact Dashboard)*
  5. *Live Demonstration Sandbox (instant login links)*

### Screen 2: Student Dashboard (`/student/dashboard`)
- **Purpose:** Daily command center for the student; answers "What should I do today to progress my career?".
- **Header:** "Good morning, [Name]" • "Let's move your career forward."
- **Key Widgets:**
  - **Career Readiness Index Card:** Score gauge (e.g. 74%), category breakdown bars, and "How to increase score" tips.
  - **Recommended Next Action:** High-priority banner (e.g., "Next session with Ananya is tomorrow at 5:00 PM. Prepare your agenda.").
  - **Active Mentorship Card:** Mentor quick card, recent milestone progress, and link to Workspace.
  - **Active Goals Progress:** Quick checklist of current milestones.
  - **Recommended Mentors:** Top 3 algorithmic matches with match percentages.

### Screen 3: Mentor Discovery & Matching (`/mentors`)
- **Purpose:** Search, filter, and discover alumni mentors with total transparency.
- **Search Bar:** Real-time debounced query (`"Search mentors by skill, role, company or industry..."`).
- **Filters:** Industry dropdown, Target Role, Technical Skills, Meeting Mode (Video/Chat/Hybrid), Availability.
- **Mentor Card:**
  - Photo / Initials avatar with company badge
  - Headline: Role at Company (e.g., "Senior Product Manager at Google")
  - Badges: Experience (e.g. "8 yrs exp"), Location, Response Rate ("98%"), Students Mentored ("12")
  - **Match Badge:** e.g. `94% Match`
  - **"Why This Mentor?" Tagline:** Transparent deterministic criteria (e.g., "Matched on Target Role, Cloud Skills, and Evening Availability").
  - CTAs: "View Profile" & "Request Mentorship".

### Screen 4: Mentor Profile & Request Modal (`/mentors/[id]`)
- **Purpose:** Deep dive into alumni background, mentoring style, and structured request submission.
- **Details:** Comprehensive career timeline, verified credentials, mentoring focus areas, testimonials from previous mentees.
- **Request Form:**
  - Mentorship Goal (e.g., "Prepare for APM interviews and polish design portfolio")
  - Why this mentor? (Specific connection points)
  - Preferred meeting cadence (Weekly, Bi-weekly)
  - Time commitment & introductory note.

### Screen 5: Mentorship Workspace (`/student/mentorship` or `/alumni/mentorship`)
- **Purpose:** Collaborative operating system for mentor and mentee.
- **Tabs:**
  - **Overview:** Shared milestones, next session card, recent notes.
  - **Goals & Milestones:** Milestone checklist with evidence upload/links and mentor verification buttons.
  - **Sessions:** Log past sessions, schedule upcoming sessions with agenda items.
  - **Notes & Messaging:** Direct contextual chat with attached goal references.
  - **Feedback:** Qualitative session feedback and ratings.

### Screen 6: Career Journey & Outcome (`/student/journey`)
- **Purpose:** Signature visual chronological progression showing the long-term impact of mentorship.
- **Timeline Nodes:**
  - Profile Onboarding Completed
  - First Mentor Matched
  - Milestone Completed: "System Design Portfolio Published"
  - Internship Secured at Top Firm
  - Graduation Milestone
  - Verified Career Outcome (Employment / Higher Studies / Founder)
- **Record Outcome Modal:** Allows student to record role, company, industry, joining date, and reflective testimonial.

### Screen 7: Alumni Impact Dashboard (`/alumni/impact`)
- **Purpose:** Celebrate and quantify alumni volunteer contribution.
- **Key Metrics:**
  - Students Mentored (total count)
  - Sessions Hosted (hours contributed)
  - Goals & Milestones Verified
  - Referrals & Job Offers Facilitated
- **Mentee Roster:** List of current and past mentees with their career destinations.

### Screen 8: Institution Admin & Analytics (`/admin/dashboard` & `/admin/analytics`)
- **Purpose:** Macro-level oversight of institutional career health and alumni engagement.
- **Metric Cards:** Total Enrolled Students, Active Mentorships, Verified Alumni Mentors, Goal Completion Rate (%), Reported Placements.
- **Analytics Charts:**
  - Mentorship Participation Funnel (Requested → Matched → Active → Completed)
  - Skill Gap Matrix (In-demand skills vs. current student readiness)
  - Department Placements & Average Readiness by Cohort
- **Early Intervention Module:** Filterable table of students who require proactive outreach (e.g., "No mentor requested", "Goal overdue > 14 days", "Incomplete profile").
- **Action:** One-click CSV export of engagement and placement datasets.

---

## 6. Accessibility & Responsive Standards

- **Color Contrast:** Minimum `4.5:1` ratio for all text against backgrounds; minimum `3:1` for UI controls and borders.
- **Non-Color Dependence:** Status is always communicated via text label and distinct icon alongside color.
- **Keyboard Navigation:** Logical tab order (`tabindex`), visible focus rings (`focus:ring-2 focus:ring-brand focus:outline-none`), Esc key closes modals and drawers.
- **Screen Reader Support:** Semantic HTML tags (`<nav>`, `<main>`, `<aside>`, `<header>`), `aria-expanded` on accordion/dropdowns, descriptive `aria-label` on icon-only buttons.
- **Touch Targets:** Minimum `44px × 44px` on mobile for all interactive touch elements.
- **Responsive Layout:**
  - **Desktop (>= 1024px):** Fixed sidebar (240px) + flexible central canvas (max-w-7xl).
  - **Tablet (768px - 1023px):** Collapsible sidebar icon rail + responsive cards.
  - **Mobile (< 768px):** Sticky bottom navigation bar for primary tabs, top header with hamburger drawer for settings/profile, single-column full-width cards.

