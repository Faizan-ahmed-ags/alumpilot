import type {
  ActivityEvent,
  AlumniProfile,
  AppNotification,
  AuditLogEntry,
  CareerOutcome,
  Conversation,
  Db,
  Department,
  Goal,
  MentorFeedback,
  MentorRequest,
  Mentorship,
  MentorshipSession,
  Message,
  Milestone,
  NoteEntry,
  Resource,
  Skill,
  StudentProfile,
  User,
} from "./types";
import { hashPassword } from "@/lib/auth/password";
import { defaultReadinessConfig } from "@/lib/analytics/readiness";

const day = (n: number) => new Date(Date.now() + n * 86_400_000).toISOString();
const hour = (n: number) => new Date(Date.now() + n * 3_600_000).toISOString();
const demoPassword = hashPassword("demo1234");

export const INDUSTRIES = [
  "Technology",
  "Product",
  "Data Science",
  "Design",
  "Finance",
  "Consulting",
  "Healthcare",
  "Education",
  "Marketing",
  "Entrepreneurship",
  "Cloud Infrastructure",
  "Mobile",
];

export const MENTORSHIP_TOPICS = [
  "Product Management",
  "Software engineering",
  "System design interviews",
  "Interview preparation",
  "Portfolio projects",
  "Career planning",
  "Data science",
  "Machine learning",
  "UX design",
  "Product design",
  "Personal branding",
  "Resume review",
  "Entrepreneurship",
  "Startup careers",
];

function user(id: string, name: string, email: string, role: User["role"], extra: Partial<User> = {}): User {
  return {
    id,
    name,
    email,
    role,
    passwordHash: demoPassword,
    status: "ACTIVE",
    avatarColor: "bg-brand-600",
    createdAt: day(-120),
    updatedAt: day(-1),
    lastActiveAt: hour(-2),
    ...extra,
  };
}

function studentProfileBase(userId: string, p: Partial<StudentProfile> & Pick<StudentProfile, "headline" | "degree" | "graduationYear" | "location" | "departmentId">): StudentProfile {
  return {
    id: `sp_${userId}`,
    userId,
    visibility: "PUBLIC",
    bio: "",
    hasCV: true,
    skills: [],
    careerInterests: [],
    targetRoles: [],
    targetIndustries: [],
    mentorshipTopics: [],
    mentorshipPreferences: { mode: "Video", frequency: "Bi-weekly", language: "English" },
    onboardingCompleted: true,
    onboardingStep: 8,
    profileCompleteness: 100,
    readinessIndex: 0,
    readinessBreakdown: {},
    createdAt: day(-90),
    updatedAt: day(-1),
    ...p,
  };
}

type AlumniPreset = {
  headline: string;
  bio: string;
  company: string;
  role: string;
  industry: string;
  location: string;
  graduationYear: number;
  departmentId: string;
  workExperienceYears: number;
  availability: AlumniProfile["availability"];
  preferredMode: AlumniProfile["preferredMode"];
  responseRate?: number;
  studentsMentored?: number;
  sessionsCompleted?: number;
  goalsCompleted?: number;
  referralsMade?: number;
  skills: string[];
  mentorshipTopics: string[];
  languages: string[];
};

function alumniProfile(userId: string, p: AlumniPreset): AlumniProfile {
  return {
    id: `al_${userId}`,
    userId,
    isMentor: true,
    mentorshipAvailable: true,
    responseRate: p.responseRate ?? 92,
    studentsMentored: p.studentsMentored ?? 12,
    sessionsCompleted: p.sessionsCompleted ?? 38,
    goalsCompleted: p.goalsCompleted ?? 24,
    referralsMade: p.referralsMade ?? 5,
    verified: true,
    createdAt: day(-400),
    updatedAt: day(-1),
    ...p,
  };
}

const DEPARTMENTS: Department[] = [
  { id: "dept_cse", name: "Computer Science & Engineering", code: "CSE" },
  { id: "dept_ece", name: "Electronics & Communication", code: "ECE" },
  { id: "dept_mech", name: "Mechanical Engineering", code: "MECH" },
  { id: "dept_biz", name: "Business Administration", code: "MBA" },
  { id: "dept_design", name: "Design", code: "DES" },
];

const SKILLS: Skill[] = [
  { id: "sk_programming", name: "Programming (Python/JS)", category: "Technical" },
  { id: "sk_system", name: "System Design", category: "Technical" },
  { id: "sk_web", name: "Web Development", category: "Technical" },
  { id: "sk_cloud", name: "Cloud & DevOps", category: "Technical" },
  { id: "sk_data", name: "Data Analysis", category: "Technical" },
  { id: "sk_ml", name: "Machine Learning", category: "Technical" },
  { id: "sk_mobile", name: "Mobile Development", category: "Technical" },
  { id: "sk_pm", name: "Product Management", category: "Professional" },
  { id: "sk_agile", name: "Agile & Scrum", category: "Professional" },
  { id: "sk_comm", name: "Communication", category: "Communication" },
  { id: "sk_present", name: "Presentations", category: "Communication" },
  { id: "sk_leadership", name: "Leadership", category: "Professional" },
  { id: "sk_interview", name: "Interviewing", category: "Career" },
  { id: "sk_resume", name: "Resume Writing", category: "Career" },
  { id: "sk_linkedin", name: "Personal Branding", category: "Career" },
  { id: "sk_ux", name: "UX Research", category: "Technical" },
  { id: "sk_figma", name: "Figma / Prototyping", category: "Technical" },
  { id: "sk_sql", name: "SQL", category: "Technical" },
  { id: "sk_ds", name: "Data Structures", category: "Technical" },
  { id: "sk_networking", name: "Networking", category: "Communication" },
];

const USERS: User[] = [
  user("u_admin", "Aditi Rao", "admin@demo.com", "ADMIN", { avatarColor: "bg-slate-700", departmentId: "dept_cse" }),
  user("u_career", "Maya Krishnan", "career@demo.com", "CAREER_TEAM", { avatarColor: "bg-cyan-700", departmentId: "dept_biz" }),
  user("u_student", "Riya Sharma", "student@demo.com", "STUDENT", { avatarColor: "bg-brand-600", graduationYear: 2026, departmentId: "dept_cse" }),
  user("u_student2", "Aarav Patel", "aarav.p@demo.com", "STUDENT", { avatarColor: "bg-sky-600", graduationYear: 2026, departmentId: "dept_cse" }),
  user("u_student3", "Ishita Menon", "ishita.m@demo.com", "STUDENT", { avatarColor: "bg-rose-600", graduationYear: 2026, departmentId: "dept_ece" }),
  user("u_student4", "Kabir Mehta", "kabir.m@demo.com", "STUDENT", { avatarColor: "bg-emerald-600", graduationYear: 2025, departmentId: "dept_biz" }),
  user("u_student5", "Sana Khan", "sana.k@demo.com", "STUDENT", { avatarColor: "bg-amber-600", graduationYear: 2027, departmentId: "dept_design" }),
  user("u_student6", "Dev Malhotra", "dev.m@demo.com", "STUDENT", { avatarColor: "bg-indigo-600", graduationYear: 2026, departmentId: "dept_mech" }),
  user("u_alumni", "Ananya Iyer", "alumni@demo.com", "ALUMNI", { avatarColor: "bg-violet-600", graduationYear: 2018, departmentId: "dept_cse" }),
  user("u_alumni2", "Rahul Verma", "rahul.verma@demo.com", "ALUMNI", { avatarColor: "bg-sky-600", graduationYear: 2015, departmentId: "dept_cse" }),
  user("u_alumni3", "Meera Krishnan", "meera.k@demo.com", "ALUMNI", { avatarColor: "bg-rose-600", graduationYear: 2019, departmentId: "dept_cse" }),
  user("u_alumni4", "Arjun Nair", "arjun.nair@demo.com", "ALUMNI", { avatarColor: "bg-emerald-600", graduationYear: 2012, departmentId: "dept_cse" }),
  user("u_alumni5", "Priya Desai", "priya.d@demo.com", "ALUMNI", { avatarColor: "bg-amber-600", graduationYear: 2017, departmentId: "dept_design" }),
];

const riyaSkills = (): StudentProfile["skills"] => [
  { skillId: "sk_programming", level: 3, targetLevel: 5 },
  { skillId: "sk_ds", level: 3, targetLevel: 4 },
  { skillId: "sk_web", level: 4, targetLevel: 5 },
  { skillId: "sk_comm", level: 3, targetLevel: 4 },
  { skillId: "sk_interview", level: 2, targetLevel: 4 },
  { skillId: "sk_system", level: 2, targetLevel: 4 },
  { skillId: "sk_pm", level: 2, targetLevel: 4 },
  { skillId: "sk_present", level: 3, targetLevel: 4 },
];

const STUDENT_PROFILES: StudentProfile[] = [
  studentProfileBase("u_student", {
    headline: "Aspiring Product Engineer",
    degree: "B.Tech, Computer Science",
    graduationYear: 2026,
    location: "Bengaluru, India",
    departmentId: "dept_cse",
    bio: "Final-year CSE student who loves turning rough ideas into shipped products. Looking for structured guidance before placement season.",
    skills: riyaSkills(),
    careerInterests: [{ targetRole: "Product Manager", industry: "Product", interestLevel: "Primary" }],
    targetRoles: ["Product Engineer", "Associate Product Manager"],
    targetIndustries: ["Product", "Technology"],
    mentorshipTopics: ["Product Management", "Interview preparation", "Portfolio projects"],
    mentorshipPreferences: { mode: "Video", frequency: "Bi-weekly", language: "English" },
    readinessIndex: 68,
    readinessBreakdown: { skills: 66, projects: 55, mentorship: 0, goals: 40, interview: 35, profile: 100, internship: 0 },
    profileCompleteness: 100,
  }),
  studentProfileBase("u_student2", {
    headline: "Aspiring Software Engineer",
    degree: "B.Tech, Computer Science",
    graduationYear: 2026,
    location: "Pune, India",
    departmentId: "dept_cse",
    bio: "Dedicated to mastering system design and cracking software engineering interviews.",
    skills: [
      { skillId: "sk_programming", level: 4, targetLevel: 5 },
      { skillId: "sk_ds", level: 4, targetLevel: 5 },
      { skillId: "sk_system", level: 3, targetLevel: 5 },
      { skillId: "sk_sql", level: 3, targetLevel: 4 },
    ],
    careerInterests: [{ targetRole: "Software Engineer", industry: "Technology", interestLevel: "Primary" }],
    targetRoles: ["SDE 1", "Backend Engineer"],
    targetIndustries: ["Technology"],
    mentorshipTopics: ["Software engineering", "System design interviews"],
    readinessIndex: 81,
    profileCompleteness: 92,
  }),
  studentProfileBase("u_student3", {
    headline: "ECE student exploring embedded & IoT roles",
    degree: "B.Tech, Electronics & Communication",
    graduationYear: 2026,
    location: "Chennai, India",
    departmentId: "dept_ece",
    bio: "Interested in embedded systems and IoT product development.",
    skills: [
      { skillId: "sk_programming", level: 2, targetLevel: 4 },
      { skillId: "sk_web", level: 2, targetLevel: 3 },
      { skillId: "sk_comm", level: 3, targetLevel: 4 },
    ],
    careerInterests: [{ targetRole: "Embedded Engineer", industry: "Technology", interestLevel: "Primary" }],
    targetRoles: ["Embedded Engineer", "IoT Developer"],
    targetIndustries: ["Technology"],
    mentorshipTopics: ["Career planning"],
    readinessIndex: 42,
    profileCompleteness: 55,
    onboardingCompleted: false,
    onboardingStep: 3,
  }),
  studentProfileBase("u_student4", {
    headline: "Product & Operations Aspirant",
    degree: "MBA, Business Administration",
    graduationYear: 2025,
    location: "Mumbai, India",
    departmentId: "dept_biz",
    bio: "MBA candidate targeting product management roles in fintech and consumer tech.",
    skills: [
      { skillId: "sk_pm", level: 3, targetLevel: 5 },
      { skillId: "sk_comm", level: 4, targetLevel: 5 },
      { skillId: "sk_agile", level: 3, targetLevel: 4 },
    ],
    careerInterests: [{ targetRole: "Product Manager", industry: "Product", interestLevel: "Primary" }],
    targetRoles: ["APM", "Product Operations"],
    targetIndustries: ["Product", "Finance"],
    mentorshipTopics: ["Product Management", "Interview preparation"],
    readinessIndex: 69,
    profileCompleteness: 88,
  }),
  studentProfileBase("u_student5", {
    headline: "Product designer in the making",
    degree: "B.Des, Design",
    graduationYear: 2027,
    location: "Bengaluru, India",
    departmentId: "dept_design",
    bio: "Second-year design student building a UX portfolio from scratch.",
    skills: [
      { skillId: "sk_figma", level: 3, targetLevel: 5 },
      { skillId: "sk_ux", level: 2, targetLevel: 4 },
      { skillId: "sk_comm", level: 3, targetLevel: 4 },
    ],
    careerInterests: [{ targetRole: "Product Designer", industry: "Design", interestLevel: "Primary" }],
    targetRoles: ["Product Designer", "UX Designer"],
    targetIndustries: ["Design", "Product"],
    mentorshipTopics: ["UX design", "Portfolio projects"],
    readinessIndex: 38,
    profileCompleteness: 60,
    onboardingCompleted: false,
    onboardingStep: 5,
  }),
  studentProfileBase("u_student6", {
    headline: "Mechanical engineer pivoting to product",
    degree: "B.Tech, Mechanical Engineering",
    graduationYear: 2026,
    location: "Delhi, India",
    departmentId: "dept_mech",
    bio: "Exploring how mechanical engineering fundamentals transfer into product roles.",
    skills: [
      { skillId: "sk_programming", level: 2, targetLevel: 4 },
      { skillId: "sk_pm", level: 1, targetLevel: 4 },
      { skillId: "sk_comm", level: 3, targetLevel: 4 },
    ],
    careerInterests: [{ targetRole: "Product Analyst", industry: "Product", interestLevel: "Secondary" }],
    targetRoles: ["Product Analyst"],
    targetIndustries: ["Product"],
    mentorshipTopics: ["Career planning", "Product Management"],
    readinessIndex: 34,
    profileCompleteness: 48,
    onboardingCompleted: false,
    onboardingStep: 2,
  }),
];

const ALUMNI_PROFILES: AlumniProfile[] = [
  alumniProfile("u_alumni", {
    headline: "Senior Product Manager · ex-founder",
    bio: "I help students turn ideas into shipped products — from first sketch to interview-ready portfolio.",
    company: "Stripe",
    role: "Senior Product Manager",
    industry: "Product",
    location: "Bengaluru, India",
    graduationYear: 2018,
    departmentId: "dept_cse",
    workExperienceYears: 8,
    availability: "High",
    preferredMode: "Video",
    skills: ["Product Management", "System Design", "SQL", "Communication"],
    mentorshipTopics: ["Product Management", "Interview preparation", "Career planning", "Portfolio projects"],
    languages: ["English", "Hindi", "Tamil"],
    studentsMentored: 14,
    sessionsCompleted: 52,
    goalsCompleted: 31,
    referralsMade: 6,
  }),
  alumniProfile("u_alumni2", {
    headline: "Senior Software Engineer",
    bio: "9 years building large-scale systems. I mentor on backend engineering and interview craft.",
    company: "Google",
    role: "Senior Software Engineer",
    industry: "Technology",
    location: "Bengaluru, India",
    graduationYear: 2015,
    departmentId: "dept_cse",
    workExperienceYears: 9,
    availability: "Medium",
    preferredMode: "Video",
    skills: ["System Design", "Data Structures", "Programming (Python/JS)", "Cloud & DevOps"],
    mentorshipTopics: ["Software engineering", "System design interviews", "Resume review"],
    languages: ["English", "Hindi"],
    studentsMentored: 11,
    sessionsCompleted: 34,
    goalsCompleted: 19,
    referralsMade: 4,
  }),
  alumniProfile("u_alumni3", {
    headline: "Senior Data Scientist",
    bio: "I help students build the analytical foundation for data science careers.",
    company: "Microsoft",
    role: "Senior Data Scientist",
    industry: "Data Science",
    location: "Hyderabad, India",
    graduationYear: 2019,
    departmentId: "dept_cse",
    workExperienceYears: 5,
    availability: "High",
    preferredMode: "Chat",
    skills: ["Machine Learning", "Data Analysis", "SQL", "Programming (Python/JS)"],
    mentorshipTopics: ["Data science", "Machine learning", "Career planning"],
    languages: ["English", "Telugu", "Hindi"],
    studentsMentored: 9,
    sessionsCompleted: 22,
    goalsCompleted: 12,
    referralsMade: 2,
  }),
  alumniProfile("u_alumni4", {
    headline: "Engineering Manager",
    bio: "I've hired 40+ engineers and enjoy coaching early-career engineers on leadership and startup careers.",
    company: "Amazon",
    role: "Engineering Manager",
    industry: "Technology",
    location: "Bengaluru, India",
    graduationYear: 2012,
    departmentId: "dept_cse",
    workExperienceYears: 13,
    availability: "Low",
    preferredMode: "In-person",
    responseRate: 71,
    skills: ["Leadership", "Product Management", "Communication", "Networking"],
    mentorshipTopics: ["Entrepreneurship", "Startup careers", "Career planning"],
    languages: ["English", "Hindi"],
    studentsMentored: 17,
    sessionsCompleted: 41,
    goalsCompleted: 26,
    referralsMade: 8,
  }),
  alumniProfile("u_alumni5", {
    headline: "Design Lead",
    bio: "I mentor designers and marketers in storytelling, portfolios and product craft.",
    company: "Swiggy",
    role: "Design Lead",
    industry: "Design",
    location: "Bengaluru, India",
    graduationYear: 2017,
    departmentId: "dept_design",
    workExperienceYears: 8,
    availability: "High",
    preferredMode: "Hybrid",
    skills: ["Figma / Prototyping", "UX Research", "Communication", "Personal Branding"],
    mentorshipTopics: ["UX design", "Product design", "Personal branding", "Portfolio projects"],
    languages: ["English", "Kannada", "Hindi"],
    studentsMentored: 7,
    sessionsCompleted: 18,
    goalsCompleted: 9,
    referralsMade: 1,
  }),
];

const GOALS: Goal[] = [
  {
    id: "goal_portfolio",
    mentorshipId: "mentorship_aa",
    studentUserId: "u_student2",
    mentorUserId: "u_alumni2",
    title: "Build a distributed-systems portfolio",
    description: "Ship two production-quality system-design projects with architecture docs and demo write-ups.",
    category: "Portfolio project",
    targetDate: day(30),
    status: "IN_PROGRESS",
    progress: 67,
    mentorVerified: true,
    createdAt: day(-70),
    updatedAt: day(-3),
  },
  {
    id: "goal_interview",
    mentorshipId: "mentorship_aa",
    studentUserId: "u_student2",
    mentorUserId: "u_alumni2",
    title: "Ace system-design interviews",
    description: "Master scaling, sharding and consistency trade-offs for SDE-1 interviews.",
    category: "Interview preparation",
    targetDate: day(45),
    status: "IN_PROGRESS",
    progress: 40,
    mentorVerified: false,
    createdAt: day(-35),
    updatedAt: day(-2),
  },
  {
    id: "goal_kabir_pm",
    mentorshipId: "mentorship_kabir",
    studentUserId: "u_student4",
    mentorUserId: "u_alumni",
    title: "Land an APM internship",
    description: "Convert product-sense practice and a fintech case study into a summer APM offer.",
    category: "Internship search",
    targetDate: day(25),
    status: "IN_PROGRESS",
    progress: 55,
    mentorVerified: false,
    createdAt: day(-50),
    updatedAt: day(-5),
  },
];

const MILESTONES: Milestone[] = [
  { id: "ms1", goalId: "goal_portfolio", title: "Write system-design project brief", status: "DONE", evidence: "Architecture doc + trade-off notes", completedAt: day(-32), createdAt: day(-70) },
  { id: "ms2", goalId: "goal_portfolio", title: "Build URL-shortener MVP", status: "DONE", evidence: "github.com/aarav/url-shortener", completedAt: day(-18), createdAt: day(-70) },
  { id: "ms3", goalId: "goal_portfolio", title: "Deploy demo with load-test writeup", status: "IN_PROGRESS", createdAt: day(-18) },
  { id: "ms4", goalId: "goal_portfolio", title: "Record 5-minute demo walkthrough", status: "TODO", createdAt: day(-18) },
  { id: "ms5", goalId: "goal_interview", title: "Complete 10 mock design rounds", status: "IN_PROGRESS", createdAt: day(-35) },
  { id: "ms6", goalId: "goal_kabir_pm", title: "Ship fintech case study", status: "DONE", evidence: "Notion case study v2", completedAt: day(-20), createdAt: day(-50) },
  { id: "ms7", goalId: "goal_kabir_pm", title: "3 mock product-sense interviews", status: "IN_PROGRESS", createdAt: day(-20) },
];

const MENTOR_REQUESTS: MentorRequest[] = [
  {
    id: "mreq_riya_pending",
    studentUserId: "u_student",
    mentorUserId: "u_alumni",
    goal: "Become a product engineer and land a 2026 placement",
    reason: "Riya's target role (Product Engineer → APM), industry focus and skill gaps map directly onto Ananya's mentoring topics.",
    message: "Hi Ananya! I'm Riya, final-year CSE. I'd love help turning my class projects into a strong product portfolio and preparing for APM interviews. I saw you mentor on exactly this and would be grateful for your guidance.",
    meetingPreference: "Video call, bi-weekly",
    availability: "Evenings and weekends (IST)",
    status: "PENDING",
    createdAt: day(-2),
    updatedAt: hour(-20),
  },
  {
    id: "mreq_kabir_pending",
    studentUserId: "u_student4",
    mentorUserId: "u_alumni",
    goal: "Land a summer APM internship",
    reason: "Kabir is preparing for APM interviews and needs structured product-sense practice.",
    message: "Hi Ananya — I'm an MBA candidate targeting APM roles in fintech. Could you mentor me on product-sense interviews over the next two months?",
    meetingPreference: "Video call",
    availability: "Weekday evenings",
    status: "PENDING",
    createdAt: day(-4),
    updatedAt: day(-4),
  },
  {
    id: "mreq_aarav_completed",
    studentUserId: "u_student2",
    mentorUserId: "u_alumni2",
    goal: "Land a software engineering internship",
    reason: "Aarav completed a 12-week mentorship and converted to full-time.",
    message: "Preparing for SDE role interviews with a focus on system design.",
    meetingPreference: "Video call",
    availability: "Evenings",
    status: "COMPLETED",
    createdAt: day(-160),
    updatedAt: day(-20),
  },
];

const MENTORSHIPS: Mentorship[] = [
  {
    id: "mentorship_aa",
    requestId: "mreq_aarav_completed",
    studentUserId: "u_student2",
    mentorUserId: "u_alumni2",
    status: "ACTIVE",
    startedAt: day(-150),
    progress: 58,
    goalsCompleted: 0,
    sessionCount: 9,
    lastActivityAt: hour(-26),
    createdAt: day(-150),
  },
  {
    id: "mentorship_kabir",
    requestId: "mreq_kabir_declined_hist",
    studentUserId: "u_student4",
    mentorUserId: "u_alumni",
    status: "ACTIVE",
    startedAt: day(-48),
    progress: 55,
    goalsCompleted: 0,
    sessionCount: 4,
    lastActivityAt: day(-5),
    createdAt: day(-48),
  },
];

const SESSIONS: MentorshipSession[] = [
  { id: "sess_1", mentorshipId: "mentorship_aa", title: "Kickoff & goal planning", scheduledAt: day(-44), durationMinutes: 45, mode: "Video", status: "COMPLETED", agenda: "Align on goals, cadence and portfolio direction.", notes: "Set bi-weekly cadence. Aarav to draft project brief.", createdAt: day(-46) },
  { id: "sess_2", mentorshipId: "mentorship_aa", title: "System design deep dive", scheduledAt: day(-30), durationMinutes: 60, mode: "Video", status: "COMPLETED", agenda: "Review URL-shortener architecture; scaling trade-offs.", notes: "Add caching layer discussion to write-up.", createdAt: day(-32) },
  { id: "sess_3", mentorshipId: "mentorship_aa", title: "Portfolio review + demo prep", scheduledAt: hour(72), durationMinutes: 45, mode: "Video", status: "SCHEDULED", agenda: "Walk through deployed demo; rehearse walkthrough.", createdAt: day(-2) },
  { id: "sess_4", mentorshipId: "mentorship_kabir", title: "Product-sense mock #2", scheduledAt: hour(24), durationMinutes: 45, mode: "Video", status: "SCHEDULED", agenda: "Improve fintech case study; practice estimation.", createdAt: day(-6) },
  { id: "sess_5", mentorshipId: "mentorship_kabir", title: "Kickoff & APM roadmap", scheduledAt: day(-46), durationMinutes: 45, mode: "Video", status: "COMPLETED", agenda: "Map the APM interview funnel.", notes: "Kabir to ship case study v2 first.", createdAt: day(-47) },
];

const FEEDBACK: MentorFeedback[] = [
  {
    id: "fb_1",
    mentorshipId: "mentorship_aa",
    sessionId: "sess_2",
    mentorUserId: "u_alumni2",
    studentUserId: "u_student2",
    rating: 5,
    strengths: "Excellent self-direction; came prepared with architecture questions and had already shipped the MVP.",
    areasToImprove: "Slow down on trade-off explanations — practice narrating the 'why' behind each scaling decision.",
    createdAt: day(-29),
  },
  {
    id: "fb_2",
    mentorshipId: "mentorship_kabir",
    mentorUserId: "u_alumni",
    studentUserId: "u_student4",
    rating: 4,
    strengths: "Case study shows strong structured thinking and real fintech research.",
    areasToImprove: "Estimation answers need faster back-of-envelope math; practice 2 drills per week.",
    createdAt: day(-19),
  },
];

const CONVERSATIONS: Conversation[] = [
  { id: "conv_aa", mentorshipId: "mentorship_aa", participantIds: ["u_student2", "u_alumni2"], createdAt: day(-150), updatedAt: hour(-26) },
  { id: "conv_kabir", mentorshipId: "mentorship_kabir", participantIds: ["u_student4", "u_alumni"], createdAt: day(-48), updatedAt: day(-5) },
];

const MESSAGES: Message[] = [
  { id: "msg_1", conversationId: "conv_aa", senderUserId: "u_student2", body: "Deployed the shortener on Fly.io — load test write-up is in the repo README.", createdAt: hour(-30) },
  { id: "msg_2", conversationId: "conv_aa", senderUserId: "u_alumni2", body: "Great pace. Before Friday's demo, add a short section on what you'd change at 10x traffic.", createdAt: hour(-26) },
  { id: "msg_3", conversationId: "conv_kabir", senderUserId: "u_student4", body: "Case study v2 is done — could we use Thursday's session for a mock product-sense round?", createdAt: day(-5) },
  { id: "msg_4", conversationId: "conv_kabir", senderUserId: "u_alumni", body: "Yes. I'll bring two estimation drills. Re-read your case study metrics and be ready to defend them.", createdAt: day(-5) },
];

const NOTES: NoteEntry[] = [
  { id: "note_1", mentorshipId: "mentorship_aa", authorUserId: "u_student2", authorRole: "STUDENT", body: "Added the 10x-traffic section Rahul suggested. Ready for demo rehearsal.", createdAt: hour(-25) },
  { id: "note_2", mentorshipId: "mentorship_kabir", authorUserId: "u_alumni", authorRole: "ALUMNI", body: "Shared two estimation drill sets for Thursday's mock.", createdAt: day(-5) },
];

const NOTIFICATIONS: AppNotification[] = [
  { id: "n_1", userId: "u_alumni", title: "New mentorship request", body: "Riya Sharma requested mentorship: “Become a product engineer and land a 2026 placement”.", type: "MENTOR_REQUEST", read: false, createdAt: hour(-20) },
  { id: "n_2", userId: "u_alumni", title: "New mentorship request", body: "Kabir Mehta requested mentorship: “Land a summer APM internship”.", type: "MENTOR_REQUEST", read: false, createdAt: day(-4) },
  { id: "n_3", userId: "u_student2", title: "Upcoming session", body: "“Portfolio review + demo prep” with Rahul Verma is coming up.", type: "SESSION", read: false, createdAt: day(-2) },
  { id: "n_4", userId: "u_student", title: "Your profile is live", body: "Mentors can now discover you. Your readiness baseline was computed from your onboarding.", type: "SYSTEM", read: true, createdAt: day(-30) },
];

const CAREER_OUTCOMES: CareerOutcome[] = [
  { id: "co_1", studentUserId: "u_student2", status: "INTERNSHIP", company: "Google", role: "SDE Intern", industry: "Technology", location: "Bengaluru, India", joiningDate: day(60), internshipDuration: "12 weeks", createdAt: day(-15), updatedAt: day(-15) },
  { id: "co_2", studentUserId: "u_student4", status: "EMPLOYED", company: "Paytm", role: "Associate Product Manager", industry: "Finance", location: "Mumbai, India", joiningDate: day(-5), salaryRange: "₹18L-₹22L", createdAt: day(-10), updatedAt: day(-10) },
];

const RESOURCES: Resource[] = [
  { id: "res_1", title: "The portfolio case-study framework", description: "How to structure a compelling project story: problem, constraints, decisions, measurable impact.", category: "Portfolio", contentType: "guide", body: "Use STAR for narrative, lead with the user problem, quantify outcomes, and rehearse a 5-minute demo. Give recruiters impact in the first two lines.", authorId: "u_alumni", tags: ["portfolio", "case study", "storytelling"], createdAt: day(-20), updatedAt: day(-5) },
  { id: "res_2", title: "System design interview playbook", description: "A 10-step checklist for backend and distributed-systems interview rounds.", category: "Interview", contentType: "template", body: "1. Clarify requirements 2. Estimate scale 3. Sketch API 4. Data model 5. Draw the architecture 6. Identify bottlenecks 7. Discuss trade-offs 8. Address failure modes 9. Add caching 10. Wrap with monitoring.", authorId: "u_alumni2", tags: ["system design", "interview", "backend"], createdAt: day(-40), updatedAt: day(-8) },
  { id: "res_3", title: "Product-sense drills for APM interviews", description: "Two-week drill plan with 12 classic product questions and rubrics.", category: "Interview", contentType: "template", body: "Practice one question daily; time-box to 25 minutes; always structure as users → problems → solutions → metrics → trade-offs.", authorId: "u_alumni", tags: ["product", "apm", "interview"], createdAt: day(-33), updatedAt: day(-12) },
  { id: "res_4", title: "Resume storytelling checklist", description: "Turn coursework and projects into resume bullets recruiters actually read.", category: "Resume", contentType: "checklist", body: "Every bullet: strong verb + what you built + measurable outcome. One page. No photo. Tailor the headline to the role you want, not the degree you have.", authorId: "u_career", tags: ["resume", "career"], createdAt: day(-60), updatedAt: day(-30) },
  { id: "res_5", title: "UX portfolio: 6 projects that get interviews", description: "What design hiring managers look for in early-career UX portfolios.", category: "Portfolio", contentType: "guide", body: "Show process, not just screens: research notes, journey maps, iterations and the metric each design moved.", authorId: "u_alumni5", tags: ["ux", "design", "portfolio"], createdAt: day(-25), updatedAt: day(-25) },
  { id: "res_6", title: "From college to data science: a 6-month map", description: "Month-by-month skill plan for students targeting analytics and DS roles.", category: "Career Planning", contentType: "guide", body: "Months 1-2: SQL + statistics. Months 3-4: Python + one ML project. Months 5-6: Kaggle + interviews. Publish everything.", authorId: "u_alumni3", tags: ["data science", "career"], createdAt: day(-50), updatedAt: day(-50) },
  { id: "res_7", title: "How to be a great first-time mentor", description: "A concise framework for alumni giving high-value mentorship in 45-minute sessions.", category: "Mentorship", contentType: "guide", body: "Set the goal first, listen 60/40, always end sessions with one concrete next milestone, and give feedback within 24 hours while it's fresh.", authorId: "u_admin", tags: ["mentorship", "guide"], createdAt: day(-70), updatedAt: day(-70) },
  { id: "res_8", title: "Behavioral interview story bank", description: "Build 8 reusable STAR stories that cover 90% of behavioral questions.", category: "Interview", contentType: "template", body: "Map one story to each: conflict, failure, leadership, ambiguity, impact, teamwork, initiative, learning speed. Rehearse out loud.", authorId: "u_career", tags: ["interview", "behavioral"], createdAt: day(-15), updatedAt: day(-15) },
];

const AUDIT_LOGS: AuditLogEntry[] = [
  { id: "audit_1", actorUserId: null, action: "SEED", entity: "USER", detail: "Demo dataset generated for AlumniBridge presentation", createdAt: new Date().toISOString() },
];

const ACTIVITY: ActivityEvent[] = [
  { id: "act_1", userId: "u_student2", type: "SESSION", description: "Completed “System design deep dive” with Rahul Verma", createdAt: day(-30) },
  { id: "act_2", userId: "u_alumni2", type: "FEEDBACK", description: "Left feedback on Aarav Patel's system-design session", createdAt: day(-29) },
  { id: "act_3", userId: "u_student4", type: "MILESTONE", description: "Completed milestone “Ship fintech case study”", createdAt: day(-20) },
  { id: "act_4", userId: "u_student2", type: "OUTCOME", description: "Recorded internship offer: SDE Intern at Google", createdAt: day(-15) },
  { id: "act_5", userId: "u_student", type: "MENTOR_REQUEST", description: "Requested mentorship from Ananya Iyer", createdAt: day(-2) },
];

export function buildSeedDb(): Db {
  return {
    schemaVersion: 2,
    seededAt: new Date().toISOString(),
    meta: { institutionName: "AlumniBridge Demo University", readinessConfig: defaultReadinessConfig() },
    departments: DEPARTMENTS,
    skills: SKILLS,
    industries: INDUSTRIES,
    users: USERS,
    studentProfiles: STUDENT_PROFILES,
    alumniProfiles: ALUMNI_PROFILES,
    goals: GOALS,
    milestones: MILESTONES,
    mentorRequests: MENTOR_REQUESTS,
    mentorships: MENTORSHIPS,
    sessions: SESSIONS,
    progressUpdates: [],
    notes: NOTES,
    feedback: FEEDBACK,
    conversations: CONVERSATIONS,
    messages: MESSAGES,
    notifications: NOTIFICATIONS,
    careerOutcomes: CAREER_OUTCOMES,
    resources: RESOURCES,
    tasks: [],
    auditLogs: AUDIT_LOGS,
    activity: ACTIVITY,
  };
}
