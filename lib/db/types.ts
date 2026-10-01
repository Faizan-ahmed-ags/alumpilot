export type Role = "STUDENT" | "ALUMNI" | "ADMIN" | "CAREER_TEAM";
export type Entity =
  | "USER"
  | "STUDENT_PROFILE"
  | "ALUMNI_PROFILE"
  | "GOAL"
  | "MILESTONE"
  | "MENTOR_REQUEST"
  | "MENTORSHIP"
  | "SESSION"
  | "MESSAGE"
  | "NOTIFICATION"
  | "CAREER_OUTCOME"
  | "RESOURCE"
  | "TASK"
  | "FEEDBACK"
  | "PROGRESS_UPDATE";

export const ROLES: Role[] = ["STUDENT", "ALUMNI", "ADMIN", "CAREER_TEAM"];

export interface User {
  id: string;
  email: string;
  passwordHash: string;
  name: string;
  role: Role;
  status: "ACTIVE" | "DISABLED";
  avatarColor: string;
  departmentId?: string;
  graduationYear?: number;
  createdAt: string;
  updatedAt: string;
  lastActiveAt: string;
}

export interface Department {
  id: string;
  name: string;
  code: string;
}

export interface Skill {
  id: string;
  name: string;
  category: "Technical" | "Professional" | "Communication" | "Career" | "Academic";
}

export interface SkillAssessment {
  skillId: string;
  level: number;
  targetLevel: number;
}

export type Availability = "High" | "Medium" | "Low";
export type MentorshipMode = "Video" | "Chat" | "In-person" | "Hybrid";

export interface CareerInterest {
  targetRole: string;
  industry: string;
  interestLevel: "Primary" | "Secondary";
}

export interface StudentProfile {
  id: string;
  userId: string;
  /** Visibility of the student's full profile to mentors. */
  visibility: "PUBLIC" | "PRIVATE";
  headline: string;
  bio: string;
  departmentId: string;
  degree: string;
  graduationYear: number;
  location: string;
  hasCV: boolean;
  skills: SkillAssessment[];
  careerInterests: CareerInterest[];
  targetRoles: string[];
  targetIndustries: string[];
  mentorshipTopics: string[];
  mentorshipPreferences: { mode: MentorshipMode; frequency: string; language: string };
  onboardingCompleted: boolean;
  onboardingStep: number;
  profileCompleteness: number;
  readinessIndex: number;
  readinessBreakdown: Record<string, number>;
  createdAt: string;
  updatedAt: string;
}

export interface AlumniProfile {
  id: string;
  userId: string;
  headline: string;
  bio: string;
  company: string;
  role: string;
  industry: string;
  location: string;
  graduationYear: number;
  departmentId: string;
  workExperienceYears: number;
  isMentor: boolean;
  mentorshipAvailable: boolean;
  availability: Availability;
  preferredMode: MentorshipMode;
  responseRate: number;
  studentsMentored: number;
  sessionsCompleted: number;
  goalsCompleted: number;
  referralsMade: number;
  skills: string[];
  mentorshipTopics: string[];
  languages: string[];
  verified: boolean;
  createdAt: string;
  updatedAt: string;
}

export type CareerOutcomeStatus = "STUDENT" | "INTERNSHIP" | "EMPLOYED" | "HIGHER_STUDIES" | "ENTREPRENEUR" | "SEEKING_OPPORTUNITY";

export interface CareerOutcome {
  id: string;
  studentUserId: string;
  status: CareerOutcomeStatus;
  company?: string;
  role?: string;
  industry?: string;
  location?: string;
  joiningDate?: string;
  salaryRange?: string;
  internshipDuration?: string;
  higherEducation?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Resource {
  id: string;
  title: string;
  description: string;
  category: string;
  contentType: "guide" | "template" | "video" | "link" | "checklist";
  body?: string;
  externalUrl?: string;
  authorId: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export type  TaskStatus_UNUSED = never;
export type TaskPriority = "LOW" | "MEDIUM" | "HIGH" | "URGENT";
export type TaskCategory = "Research" | "Architecture" | "Design" | "Development" | "Testing" | "Security" | "Accessibility" | "Data" | "Deployment";

export interface ProjectTask {
  id: string;
  title: string;
  description: string;
  priority: TaskPriority;
  status: TaskStatus;
  assignee: string;
  category: TaskCategory;
  progress: number;
  startDate: string;
  dueDate: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuditLogEntry {
  id: string;
  actorUserId: string | null;
  action: string;
  entity: Entity;
  entityId?: string;
  detail: string;
  createdAt: string;
}

export interface ReadinessConfig {
  weights: {
    skills: number;
    projects: number;
    mentorship: number;
    goals: number;
    interview: number;
    profile: number;
    internship: number;
  };
  version: number;
}

export interface PairSkillRow {
  skill: Skill;
  level: number;
  targetLevel: number;
}

export interface ActivityEvent {
  id: string;
  userId: string;
  type: "MENTOR_REQUEST" | "SESSION" | "GOAL" | "FEEDBACK" | "OUTCOME" | "MILESTONE" | "MESSAGE";
  description: string;
  createdAt: string;
}

export interface Goal {
  id: string;
  mentorshipId: string;
  studentUserId: string;
  mentorUserId: string;
  title: string;
  description: string;
  category: string;
  targetDate: string;
  status: "TODO" | "IN_PROGRESS" | "COMPLETED" | "OVERDUE" | "AT_RISK" | "NOT_STARTED";
  progress: number;
  mentorVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Milestone {
  id: string;
  goalId: string;
  title: string;
  status: "TODO" | "IN_PROGRESS" | "DONE";
  evidence?: string;
  completedAt?: string;
  createdAt: string;
}

export interface MentorRequest {
  id: string;
  studentUserId: string;
  mentorUserId: string;
  goal: string;
  reason: string;
  message: string;
  meetingPreference: string;
  availability: string;
  status: "PENDING" | "ACCEPTED" | "DECLINED" | "COMPLETED";
  createdAt: string;
  updatedAt: string;
}

export interface Mentorship {
  id: string;
  requestId: string;
  studentUserId: string;
  mentorUserId: string;
  status: "ACTIVE" | "COMPLETED" | "PAUSED";
  startedAt: string;
  completedAt?: string;
  progress: number;
  goalsCompleted: number;
  sessionCount: number;
  lastActivityAt: string;
  createdAt: string;
}

export interface MentorshipSession {
  id: string;
  mentorshipId: string;
  title: string;
  scheduledAt: string;
  durationMinutes: number;
  mode: "Video" | "Chat" | "In-person" | "Hybrid";
  status: "SCHEDULED" | "COMPLETED" | "CANCELLED";
  agenda?: string;
  notes?: string;
  studentNotes?: string;
  createdAt: string;
}

export interface ProgressUpdate {
  id: string;
  mentorshipId: string;
  userId: string;
  type: "MENTOR_REQUEST" | "SESSION" | "GOAL" | "FEEDBACK" | "OUTCOME" | "MILESTONE" | "MESSAGE";
  message: string;
  createdAt: string;
}

/** Evidence-free note appended by student/mentor to the workspace activity feed. */
export interface NoteEntry {
  id: string;
  mentorshipId: string;
  authorUserId: string;
  authorRole: "STUDENT" | "ALUMNI";
  body: string;
  createdAt: string;
}

export interface MentorFeedback {
  id: string;
  mentorshipId: string;
  sessionId?: string;
  mentorUserId: string;
  studentUserId: string;
  rating: number;
  strengths: string;
  areasToImprove: string;
  createdAt: string;
}

export interface Conversation {
  id: string;
  mentorshipId: string;
  participantIds: string[];
  createdAt: string;
  updatedAt: string;
}

export interface Message {
  id: string;
  conversationId: string;
  senderUserId: string;
  body: string;
  createdAt: string;
}

export interface AppNotification {
  id: string;
  userId: string;
  title: string;
  body: string;
  type: "MENTOR_REQUEST" | "SESSION" | "GOAL" | "OUTCOME" | "SYSTEM";
  read: boolean;
  createdAt: string;
}

export interface Db {
  schemaVersion: number;
  seededAt: string;
  meta: { institutionName: string; readinessConfig: ReadinessConfig };
  departments: Department[];
  skills: Skill[];
  industries: string[];
  users: User[];
  studentProfiles: StudentProfile[];
  alumniProfiles: AlumniProfile[];
  goals: Goal[];
  milestones: Milestone[];
  mentorRequests: MentorRequest[];
  mentorships: Mentorship[];
  sessions: MentorshipSession[];
  progressUpdates: ProgressUpdate[];
  notes: NoteEntry[];
  feedback: MentorFeedback[];
  conversations: Conversation[];
  messages: Message[];
  notifications: AppNotification[];
  careerOutcomes: CareerOutcome[];
  resources: Resource[];
  tasks: ProjectTask[];
  auditLogs: AuditLogEntry[];
  activity: ActivityEvent[];
}