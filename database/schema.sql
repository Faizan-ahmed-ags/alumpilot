-- ============================================================
-- AlumniBridge: Production Relational Schema (PostgreSQL / Supabase)
-- "Turning alumni goodwill into structured, sustained mentorship."
-- ============================================================

CREATE TYPE user_role AS ENUM ('STUDENT', 'ALUMNI', 'ADMIN', 'CAREER_TEAM');
CREATE TYPE user_status AS ENUM ('ACTIVE', 'DISABLED');
CREATE TYPE mentorship_mode AS ENUM ('Video', 'Chat', 'In-person', 'Hybrid');
CREATE TYPE request_status AS ENUM ('PENDING', 'ACCEPTED', 'DECLINED', 'COMPLETED');
CREATE TYPE mentorship_status AS ENUM ('ACTIVE', 'COMPLETED', 'PAUSED');
CREATE TYPE goal_status AS ENUM ('TODO', 'IN_PROGRESS', 'COMPLETED', 'OVERDUE', 'AT_RISK', 'NOT_STARTED');
CREATE TYPE milestone_status AS ENUM ('TODO', 'IN_PROGRESS', 'DONE');
CREATE TYPE session_status AS ENUM ('SCHEDULED', 'COMPLETED', 'CANCELLED');
CREATE TYPE outcome_status AS ENUM ('STUDENT', 'INTERNSHIP', 'EMPLOYED', 'HIGHER_STUDIES', 'ENTREPRENEUR', 'SEEKING_OPPORTUNITY');

-- 1. Departments
CREATE TABLE departments (
    id VARCHAR(64) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    code VARCHAR(32) NOT NULL UNIQUE
);

-- 2. Skills Directory
CREATE TABLE skills (
    id VARCHAR(64) PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    category VARCHAR(64) NOT NULL
);

-- 3. Users Table (Core Identity)
CREATE TABLE users (
    id VARCHAR(64) PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    role user_role NOT NULL DEFAULT 'STUDENT',
    status user_status NOT NULL DEFAULT 'ACTIVE',
    avatar_color VARCHAR(32) DEFAULT 'bg-brand-600',
    department_id VARCHAR(64) REFERENCES departments(id) ON DELETE SET NULL,
    graduation_year INT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    last_active_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. Student Profiles
CREATE TABLE student_profiles (
    id VARCHAR(64) PRIMARY KEY,
    user_id VARCHAR(64) NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    headline VARCHAR(255) NOT NULL,
    bio TEXT NOT NULL DEFAULT '',
    department_id VARCHAR(64) REFERENCES departments(id) ON DELETE RESTRICT,
    degree VARCHAR(128) NOT NULL,
    graduation_year INT NOT NULL,
    location VARCHAR(128) NOT NULL,
    has_cv BOOLEAN NOT NULL DEFAULT FALSE,
    skills JSONB NOT NULL DEFAULT '[]'::jsonb,
    career_interests JSONB NOT NULL DEFAULT '[]'::jsonb,
    target_roles TEXT[] NOT NULL DEFAULT '{}',
    target_industries TEXT[] NOT NULL DEFAULT '{}',
    mentorship_topics TEXT[] NOT NULL DEFAULT '{}',
    mentorship_preferences JSONB NOT NULL DEFAULT '{"mode": "Video", "frequency": "Bi-weekly", "language": "English"}'::jsonb,
    onboarding_completed BOOLEAN NOT NULL DEFAULT FALSE,
    onboarding_step INT NOT NULL DEFAULT 1,
    profile_completeness INT NOT NULL DEFAULT 0,
    readiness_index INT NOT NULL DEFAULT 0,
    readiness_breakdown JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. Alumni Profiles
CREATE TABLE alumni_profiles (
    id VARCHAR(64) PRIMARY KEY,
    user_id VARCHAR(64) NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    headline VARCHAR(255) NOT NULL,
    bio TEXT NOT NULL DEFAULT '',
    company VARCHAR(128) NOT NULL,
    role VARCHAR(128) NOT NULL,
    industry VARCHAR(128) NOT NULL,
    location VARCHAR(128) NOT NULL,
    graduation_year INT NOT NULL,
    department_id VARCHAR(64) REFERENCES departments(id) ON DELETE RESTRICT,
    work_experience_years INT NOT NULL DEFAULT 0,
    is_mentor BOOLEAN NOT NULL DEFAULT TRUE,
    mentorship_available BOOLEAN NOT NULL DEFAULT TRUE,
    availability VARCHAR(32) NOT NULL DEFAULT 'High',
    preferred_mode mentorship_mode NOT NULL DEFAULT 'Video',
    response_rate INT NOT NULL DEFAULT 100,
    students_mentored INT NOT NULL DEFAULT 0,
    sessions_completed INT NOT NULL DEFAULT 0,
    goals_completed INT NOT NULL DEFAULT 0,
    referrals_made INT NOT NULL DEFAULT 0,
    skills TEXT[] NOT NULL DEFAULT '{}',
    mentorship_topics TEXT[] NOT NULL DEFAULT '{}',
    languages TEXT[] NOT NULL DEFAULT '{}',
    verified BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 6. Mentorship Requests
CREATE TABLE mentorship_requests (
    id VARCHAR(64) PRIMARY KEY,
    student_user_id VARCHAR(64) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    mentor_user_id VARCHAR(64) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    goal TEXT NOT NULL,
    reason TEXT NOT NULL,
    message TEXT NOT NULL,
    meeting_preference VARCHAR(64) NOT NULL,
    availability VARCHAR(128) NOT NULL,
    status request_status NOT NULL DEFAULT 'PENDING',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 7. Active Mentorships
CREATE TABLE mentorships (
    id VARCHAR(64) PRIMARY KEY,
    request_id VARCHAR(64) NOT NULL REFERENCES mentorship_requests(id) ON DELETE CASCADE,
    student_user_id VARCHAR(64) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    mentor_user_id VARCHAR(64) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    status mentorship_status NOT NULL DEFAULT 'ACTIVE',
    started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    completed_at TIMESTAMPTZ,
    progress INT NOT NULL DEFAULT 0,
    goals_completed INT NOT NULL DEFAULT 0,
    session_count INT NOT NULL DEFAULT 0,
    last_activity_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 8. Career Goals
CREATE TABLE career_goals (
    id VARCHAR(64) PRIMARY KEY,
    mentorship_id VARCHAR(64) REFERENCES mentorships(id) ON DELETE SET NULL,
    student_user_id VARCHAR(64) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    mentor_user_id VARCHAR(64) REFERENCES users(id) ON DELETE SET NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL DEFAULT '',
    category VARCHAR(64) NOT NULL,
    target_date TIMESTAMPTZ NOT NULL,
    status goal_status NOT NULL DEFAULT 'IN_PROGRESS',
    progress INT NOT NULL DEFAULT 0,
    mentor_verified BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 9. Goal Milestones
CREATE TABLE goal_milestones (
    id VARCHAR(64) PRIMARY KEY,
    goal_id VARCHAR(64) NOT NULL REFERENCES career_goals(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    status milestone_status NOT NULL DEFAULT 'TODO',
    evidence TEXT,
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 10. Mentorship Sessions
CREATE TABLE mentorship_sessions (
    id VARCHAR(64) PRIMARY KEY,
    mentorship_id VARCHAR(64) NOT NULL REFERENCES mentorships(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    scheduled_at TIMESTAMPTZ NOT NULL,
    duration_minutes INT NOT NULL DEFAULT 45,
    mode VARCHAR(32) NOT NULL DEFAULT 'Video',
    status session_status NOT NULL DEFAULT 'SCHEDULED',
    agenda TEXT,
    notes TEXT,
    student_notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 11. Mentor Feedback
CREATE TABLE mentor_feedback (
    id VARCHAR(64) PRIMARY KEY,
    mentorship_id VARCHAR(64) NOT NULL REFERENCES mentorships(id) ON DELETE CASCADE,
    session_id VARCHAR(64) REFERENCES mentorship_sessions(id) ON DELETE SET NULL,
    mentor_user_id VARCHAR(64) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    student_user_id VARCHAR(64) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
    strengths TEXT NOT NULL,
    areas_to_improve TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 12. Career Outcomes
CREATE TABLE career_outcomes (
    id VARCHAR(64) PRIMARY KEY,
    student_user_id VARCHAR(64) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    status outcome_status NOT NULL DEFAULT 'STUDENT',
    company VARCHAR(128),
    role VARCHAR(128),
    industry VARCHAR(128),
    location VARCHAR(128),
    joining_date TIMESTAMPTZ,
    salary_range VARCHAR(64),
    internship_duration VARCHAR(64),
    higher_education TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 13. Curated Career Resources
CREATE TABLE resources (
    id VARCHAR(64) PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    category VARCHAR(64) NOT NULL,
    content_type VARCHAR(32) NOT NULL,
    body TEXT,
    external_url TEXT,
    author_id VARCHAR(64) REFERENCES users(id) ON DELETE SET NULL,
    tags TEXT[] NOT NULL DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 14. Audit Logs
CREATE TABLE audit_logs (
    id VARCHAR(64) PRIMARY KEY,
    actor_user_id VARCHAR(64) REFERENCES users(id) ON DELETE SET NULL,
    action VARCHAR(128) NOT NULL,
    entity VARCHAR(64) NOT NULL,
    entity_id VARCHAR(64),
    detail TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_student_profiles_user ON student_profiles(user_id);
CREATE INDEX idx_alumni_profiles_user ON alumni_profiles(user_id);
CREATE INDEX idx_mentorship_requests_student ON mentorship_requests(student_user_id);
CREATE INDEX idx_mentorship_requests_mentor ON mentorship_requests(mentor_user_id);
CREATE INDEX idx_mentorships_student ON mentorships(student_user_id);
CREATE INDEX idx_mentorships_mentor ON mentorships(mentor_user_id);
CREATE INDEX idx_career_goals_student ON career_goals(student_user_id);
CREATE INDEX idx_career_goals_mentorship ON career_goals(mentorship_id);
CREATE INDEX idx_milestones_goal ON goal_milestones(goal_id);
CREATE INDEX idx_sessions_mentorship ON mentorship_sessions(mentorship_id);
CREATE INDEX idx_career_outcomes_student ON career_outcomes(student_user_id);
