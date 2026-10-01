import { reseed } from "../lib/db/client";

console.log("Seeding AlumniBridge database store...");
const db = reseed();
console.log(`Database seeded successfully!`);
console.log(`- Users: ${db.users.length}`);
console.log(`- Student Profiles: ${db.studentProfiles.length}`);
console.log(`- Alumni Profiles: ${db.alumniProfiles.length}`);
console.log(`- Mentorship Requests: ${db.mentorRequests.length}`);
console.log(`- Mentorships: ${db.mentorships.length}`);
console.log(`- Goals: ${db.goals.length}`);
console.log(`- Milestones: ${db.milestones.length}`);
console.log(`- Sessions: ${db.sessions.length}`);
console.log(`- Outcomes: ${db.careerOutcomes.length}`);
console.log(`- Resources: ${db.resources.length}`);
