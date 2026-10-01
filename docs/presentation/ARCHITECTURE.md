# 🏗️ TECHNICAL ARCHITECTURE FOR JUDGES

## High-Level System Architecture

AlumniBridge is built as a **Domain-Driven Modular Monolith** using Next.js 14 App Router, React 18, TypeScript 5.6, Tailwind CSS, and Recharts.

```
┌────────────────────────────────────────────────────────┐
│               PRESENTATION / CLIENT TIER               │
│ • Next.js 14 App Router (React Server & Client Comps)  │
│ • Custom Tailwind Tokens (Canvas, Ink, Brand, Line)   │
│ • Recharts Data Visualizations                         │
│ • Lucide Icons & WCAG Accessible Components            │
└───────────────────────────▲────────────────────────────┘
                            │
┌───────────────────────────▼────────────────────────────┐
│              SERVER ACTIONS & API GATEWAY              │
│ • Cryptographic Session Verification (HMAC-SHA256)     │
│ • Role-Based Access Control (RBAC Server-Enforced)     │
│ • Zod Double-Validation (Client & Server)              │
│ • Standardized Error Sanitization                      │
└───────────────────────────▲────────────────────────────┘
                            │
┌───────────────────────────▼────────────────────────────┐
│                  DOMAIN SERVICES TIER                  │
│ • Deterministic Matching Engine (Multi-Factor Scoring) │
│ • Career Readiness Index Engine (Weighted 7 Factors)   │
│ • Mentorship Lifecycle Manager (SMART Goals/Evidence)  │
│ • Institutional Analytics & Early Intervention Filter  │
└───────────────────────────▲────────────────────────────┘
                            │
┌───────────────────────────▼────────────────────────────┐
│                 DATA PERSISTENCE LAYER                 │
│ • Fully Normalized Relational Entities                 │
│ • Runtime Atomic JSON Adapter (Zero-Config Hackathon)  │
│ • 1-to-1 Schema Parity with PostgreSQL/Supabase DDL   │
└────────────────────────────────────────────────────────┘
```

## Key Technical Decisions & Highlights

1. **Deterministic Matching Engine (`lib/matching/engine.ts`):**  
   - Avoids the opacity and hallucination risks of pure vector search.
   - Evaluates target roles (25%), industry (20%), skill gaps (20%), mentorship topics (15%), availability (10%), and mode (10%).
   - Transparent, plain-English explanation for every match.

2. **Career Readiness Index Engine (`lib/analytics/readiness.ts`):**  
   - Synthesizes student skill levels, project evidence, mentorship engagement, goal progress, and interview preparation into a single 0-100 score.
   - Fully explains the computation factors to the student.

3. **Security by Design:**  
   - RBAC enforced strictly server-side.
   - Passwords hashed with Node's salted `scrypt`.
   - Signed HMAC-SHA256 session cookies.
   - Zero client secrets exposed.

4. **Production Database DDL (`database/schema.sql`):**  
   - Production PostgreSQL/Supabase schema with foreign keys, constraints, and indexes.
