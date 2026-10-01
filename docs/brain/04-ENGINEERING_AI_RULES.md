# 04 — ENGINEERING & AI DEVELOPMENT RULES

> **MANDATORY DIRECTIVE:**  
> BEFORE MODIFYING THIS REPOSITORY, READ:  
> 1. `docs/brain/01-PROJECT_MASTER.md`  
> 2. `docs/brain/02-UX_UI_SYSTEM.md`  
> 3. `docs/brain/03-SYSTEM_ARCHITECTURE.md`  
> 4. `docs/brain/04-ENGINEERING_AI_RULES.md`  
> 5. `docs/brain/05-EXECUTION_WORKFLOW.md`  

---

## 1. General Engineering Principles & Non-Negotiables

1. **Strict TypeScript:** All code must be strongly typed. The use of `any` is forbidden unless interfacing with untyped 3rd-party legacy buffers (and must be explicitly commented).
2. **Zero Dead Buttons or Fake Functionality:** Every visible button, tab, link, or switch in the interface must trigger a real, functional behavior (state change, modal open, API mutation, or route navigation). Never render decorative buttons that do nothing.
3. **No Unhandled Data States:** Every data-fetching view must implement:
   - `Loading` (via structural Skeleton)
   - `Empty` (with human explanation and direct recovery CTA)
   - `Error` (with sanitized user-friendly message and Retry button)
   - `Success` (with visual feedback or state refresh)
4. **Sanitized Error Messaging:** Never expose stack traces or raw HTTP status messages (e.g. `500 Internal Server Error`, `SQLITE_CONSTRAINT`) to the user. Always show contextual, actionable copy (e.g. *"We couldn't load your mentorship goals right now. Please check your connection and try again."*).
5. **Zero Secrets in Code:** Never commit passwords, private keys, API secrets, or database URLs in source code. All secrets reside in `.env` (or environment variables).
6. **Double Validation:** Validate inputs on the client for immediate UX feedback (via Zod + React Hook Form), and validate again on the server inside server actions or route handlers before performing any mutation.
7. **Server-Side Authorization:** Never rely on client-side state for role permissions. Re-verify the session and role permissions on the server before mutating or returning private records.
8. **Confirmation for Destructive Actions:** Deleting goals, declining mentorship requests, or disconnecting users must always trigger an explicit confirmation modal explaining the irreversible consequences.

---

## 2. Multi-Perspective Agent Review Framework

Before executing any change, the autonomous agent acts internally across six specialist reviewer personas:

```
┌────────────────────────────────────────────────────────────────────────┐
│                        AGENT INTERNAL REVIEW                           │
│                                                                        │
│  [PRODUCT REVIEWER]  Does this solve a genuine AlumniBridge problem?   │
│                      Does it belong in the MVP? What is success?       │
│                                                                        │
│  [UX REVIEWER]       Is the flow clear? What happens on mobile?        │
│                      Are loading, empty, and error states handled?     │
│                                                                        │
│  [ARCHITECT]         Does this create spaghetti coupling?              │
│                      Can an existing service or component be reused?   │
│                                                                        │
│  [SECURITY]          Is validation on the server? Can roles leak?      │
│                      Is private student data protected?                │
│                                                                        │
│  [QA REVIEWER]       What edge cases break this? Malformed data?       │
│                      Does the primary hackathon demo flow stay intact? │
│                                                                        │
│  [ACCESSIBILITY]     Is keyboard navigation working? Visible focus?    │
│                      Does color alone convey state? Are labels clear?  │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 3. Pre-Flight Implementation Checklist

Before creating or editing files, complete the following analysis:
1. **Product Requirement:** Which requirement in `01-PROJECT_MASTER.md` does this address?
2. **User Role:** Who uses this (`STUDENT`, `ALUMNI`, `ADMIN`, `CAREER_TEAM`)?
3. **Affected Screens:** Which routes and views are touched?
4. **Affected Components:** Can we reuse existing components in `components/ui/`?
5. **Backend / API Changes:** Does this require a new server action or API route?
6. **Database Impact:** Does this read or write to `lib/db`? Are types updated?
7. **Security & RBAC:** Is server-side role verification required?
8. **Accessibility & Responsive:** How does this look and behave on a 375px mobile viewport?
9. **Testing Strategy:** How do we prove this feature works without manual clicking?

---

## 4. Change Classification & Protocol

Every proposed change must be classified into one of the following tags:

- `FEATURE`: New functional capability (e.g. Mentor request flow)
- `BUG`: Resolution of an unexpected failure or calculation error
- `UX`: Usability refinement, improved microinteraction, or clearer copy
- `DESIGN`: Alignment with brand tokens, typography, or spacing scales
- `REFACTOR`: Internal code restructuring without altering observable behavior
- `ARCHITECTURE`: Structural changes to services, storage adapters, or modules
- `DATABASE`: Schema, seed data, or entity type modifications
- `SECURITY`: Authentication, authorization, input sanitization, or secrets
- `PERFORMANCE`: Query caching, bundle optimization, or render reduction
- `ACCESSIBILITY`: Keyboard navigation, ARIA attributes, or contrast fixes
- `DOCUMENTATION`: Brain file updates, pitch scripts, or setup guides

### Internal Assessment Metadata:
```text
SCOPE: [Small / Medium / Comprehensive]
UI IMPACT: [Yes/No - which components]
API IMPACT: [Yes/No - endpoints modified]
DATABASE IMPACT: [Yes/No - schema/seed changes]
SECURITY IMPACT: [Yes/No - auth/RBAC checks]
ARCHITECTURE IMPACT: [Yes/No]
BREAKING CHANGE: [Yes/No]
TESTING REQUIRED: [Unit / Integration / E2E]
```

---

## 5. Coding Standards & Component Conventions

### 5.1 Component Organization
- **Maximum component size:** Keep React components under 250 lines. Decompose large views into focused sub-components.
- **Pure presentation:** Separate data-fetching from presentation where possible.
- **Props interface:** Every component must export an explicit TypeScript interface (e.g. `interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement>`).

### 5.2 Server Action Pattern
```typescript
"use server";

import { z } from "zod";
import { getAuthenticatedSession } from "@/lib/auth/session";
import { unauthorized, badRequest } from "@/lib/api/errors";

const RequestSchema = z.object({
  mentorUserId: z.string().min(1),
  goal: z.string().min(10).max(200),
  message: z.string().min(20).max(1000),
  meetingPreference: z.enum(["Video call", "Chat", "Hybrid"]),
});

export async function submitMentorshipRequestAction(formData: unknown) {
  const session = await getAuthenticatedSession();
  if (!session || session.role !== "STUDENT") {
    throw unauthorized("Only students can request mentorship.");
  }

  const parsed = RequestSchema.safeParse(formData);
  if (!parsed.success) {
    throw badRequest("Invalid mentorship request data", parsed.error.format());
  }

  // Execute database mutation through domain service
  return mentorshipService.createRequest({
    studentUserId: session.sub,
    ...parsed.data,
  });
}
```

---

## 6. Definition of Done (DoD)

A task is marked **DONE** if and only if all the following conditions are met:
- [ ] Requirement matches specifications in `01-PROJECT_MASTER.md`.
- [ ] Responsive design verified on desktop (`1280px`) and mobile (`375px`).
- [ ] All 4 UX states (Loading, Empty, Error, Success) are implemented.
- [ ] Server-side authorization (`requireRole`) protects all mutations.
- [ ] Form validation runs both on client and server.
- [ ] Zero TypeScript errors (`npm run typecheck` passes).
- [ ] Zero runtime console errors or unhandled promise rejections.
- [ ] All buttons and links have functional, working actions.
- [ ] Relevant unit or integration tests pass (`npm run test`).
- [ ] Documentation updated if database or architecture was modified.

