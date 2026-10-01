export type Persona = "student" | "alumni" | "admin" | "career";

export const demoPersonas = [
  { id: "student", label: "Student", name: "Riya Sharma", email: "student@demo.com" },
  { id: "alumni", label: "Alumni", name: "Ananya Desai", email: "alumni@demo.com" },
  { id: "admin", label: "Admin", name: "Aditi Rao", email: "admin@demo.com" },
  { id: "career", label: "Career Team", name: "Maya Krishnan", email: "career@demo.com" },
] as const;

export const mentorMatches = [
  {
    id: "ananya",
    name: "Ananya Desai",
    role: "Senior Product Manager",
    company: "Stripe",
    industry: "Product",
    match: 94,
    tags: ["Product Management", "Interview preparation", "Portfolio review"],
    reason:
      "Direct alignment with product goals, strong product communication skills, and evening availability for video mentorship.",
  },
  {
    id: "rahul",
    name: "Rahul Verma",
    role: "Senior Software Engineer",
    company: "Google",
    industry: "Technology",
    match: 89,
    tags: ["System design", "Cloud", "Resume review"],
    reason:
      "Strong software engineering background with technical mentoring fit for product and system design skill gaps.",
  },
  {
    id: "meera",
    name: "Meera Krishnan",
    role: "Senior Data Scientist",
    company: "Microsoft",
    industry: "Data Science",
    match: 82,
    tags: ["Data analysis", "Research", "Career strategy"],
    reason:
      "Excellent match for analytical growth and role exploration, especially if you are interested in data-led roles.",
  },
];

export const studentProfile = {
  name: "Riya Sharma",
  readiness: 74,
  headline: "Aspiring Product Engineer",
  gradYear: 2026,
  degree: "B.Tech, Computer Science",
  location: "Bengaluru, India",
  nextAction: "Complete portfolio case study and request final resume review.",
  mentor: "Ananya Desai",
  mentorCompany: "Stripe",
};

export const goals = [
  {
    title: "Build and ship a full-stack portfolio app",
    progress: 72,
    status: "In progress",
    due: "This month",
    milestones: 5,
    verified: 3,
  },
  {
    title: "Prepare for product interviews",
    progress: 58,
    status: "On track",
    due: "Next 2 weeks",
    milestones: 3,
    verified: 1,
  },
  {
    title: "Improve communication and storytelling",
    progress: 90,
    status: "Almost done",
    due: "This week",
    milestones: 4,
    verified: 4,
  },
];

export const sessionHistory = [
  { title: "Portfolio strategy review", date: "Today, 6:00 PM", mode: "Video" },
  { title: "Resume and LinkedIn optimization", date: "Wed, 4:30 PM", mode: "Video" },
  { title: "Interview prep sprint", date: "Mon, 3:00 PM", mode: "Chat" },
];

export const adminStats = [
  { label: "Students active", value: "1,280" },
  { label: "Active mentorships", value: "324" },
  { label: "Goal completion", value: "82%" },
  { label: "Verified mentors", value: "161" },
];

export const resources = [
  {
    title: "Product career roadmap",
    category: "Guide",
    description: "A structured framework for transitioning from student to product-focused roles.",
  },
  {
    title: "Resume storytelling checklist",
    category: "Checklist",
    description: "Use this to turn internship work into a strong, credible story for recruiters.",
  },
  {
    title: "Mock interview playbook",
    category: "Template",
    description: "Practice behavior and technical storytelling for emerging career conversations.",
  },
  {
    title: "Alumni mentor guide",
    category: "Guide",
    description: "A concise framework for providing targeted, high-value mentorship support.",
  },
];

export const journey = [
  { stage: "Profile onboarded", completed: true },
  { stage: "Matched with mentor", completed: true },
  { stage: "First mentorship session", completed: true },
  { stage: "Portfolio milestone verified", completed: true },
  { stage: "Applied for internship", completed: true },
  { stage: "Career outcome recorded", completed: false },
];

export const mentorRequests = [
  {
    student: "Riya Sharma",
    title: "Product Engineering track",
    status: "Pending",
    message: "I want to improve product thinking and portfolio storytelling before my final interviews.",
  },
  {
    student: "Aarav Patel",
    title: "Career clarity",
    status: "Pending",
    message: "I want help choosing between backend and product-focused roles for my next internship.",
  },
];

export const interventionList = [
  { name: "Sana Khan", reason: "No mentor assigned for 14 days", score: 62 },
  { name: "Kabir Mehta", reason: "Goal overdue by 11 days", score: 58 },
  { name: "Ishita Menon", reason: "Low engagement in last 2 sessions", score: 64 },
];
