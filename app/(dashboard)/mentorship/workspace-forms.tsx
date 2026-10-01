"use client";

import { useActionState, useState } from "react";
import { Check, CheckCircle2, MessageSquarePlus, Plus, StickyNote, Star, Trash2 } from "lucide-react";
import {
  addFeedbackAction, addNoteAction, completeMentorshipAction, completeSessionAction,
  createGoalAction, createMilestoneAction, scheduleSessionAction, sendMessageAction,
  updateMilestoneAction,
} from "@/lib/mentorship/actions";
import { Progress } from "@/components/ui";

/* ---------------- Goal creation ---------------- */

export function GoalCreateForm({ mentorshipId, suggested }: { mentorshipId: string; suggested: string[] }) {
  const [state, formAction, pending] = useActionState<{ error?: string }, FormData>(createGoalAction, {});
  const milestoneCount = 3;

  return (
    <form action={formAction} className="stack-16">
      <input type="hidden" name="mentorshipId" value={mentorshipId} />
      <div className="field">
        <label htmlFor="g-title">Goal title</label>
        <input id="g-title" name="title" className="input" required minLength={8}
          placeholder="e.g. Build a strong product-engineering portfolio" />
      </div>
      {suggested.length > 0 && (
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          <span className="ai-tag">Suggestions</span>
          {suggested.map((s) => (
            <span key={s} className="chip">{s}</span>
          ))}
        </div>
      )}
      <div className="form-grid">
        <div className="field">
          <label htmlFor="g-category">Category</label>
          <select id="g-category" name="category" className="select">
            <option>Portfolio project</option>
            <option>Interview preparation</option>
            <option>Skill development</option>
            <option>Career planning</option>
            <option>Internship search</option>
          </select>
        </div>
        <div className="field">
          <label htmlFor="g-date">Target date</label>
          <input id="g-date" name="targetDate" type="date" className="input" required />
        </div>
      </div>
      <div className="field">
        <label htmlFor="g-desc">Description (optional)</label>
        <textarea id="g-desc" name="description" className="textarea" style={{ minHeight: 64 }}
          placeholder="What does 'done' look like?" />
      </div>
      <div className="field">
        <label htmlFor="g-ms">Milestones — one per line</label>
        <textarea id="g-ms" name="milestones" className="textarea" style={{ minHeight: 84 }}
          placeholder={"e.g.\nWrite project brief\nBuild MVP\nDeploy and record demo"} />
        <span className="hint">Mentors verify these one by one — that's what makes progress trustworthy.</span>
      </div>
      {state.error && <div className="form-error" role="alert">{state.error}</div>}
      <button type="submit" className="btn btn-primary" disabled={pending}>
        <Plus size={15} /> Create goal
      </button>
    </form>
  );
}

/* ---------------- Milestones ---------------- */

export function MilestoneRow({
  milestone,
  isMentor,
}: {
  milestone: { id: string; title: string; status: string; evidence?: string };
  isMentor: boolean;
}) {
  const done = milestone.status === "DONE";
  return (
    <form action={updateMilestoneAction} className="row-item" style={{ padding: 0 }}>
      <input type="hidden" name="milestoneId" value={milestone.id} />
      <input type="hidden" name="status" value={done ? "IN_PROGRESS" : "DONE"} />
      <label style={{ display: "flex", gap: 8, alignItems: "flex-start", cursor: "pointer" }}>
        <span
          className="t-dot"
          style={{
            width: 22, height: 22, flexBasis: 22,
            background: done ? "var(--success)" : "transparent",
            borderColor: done ? "#bbf7d0" : "var(--line-strong)",
            color: "#fff",
          }}
          aria-hidden
        >
          {done && <Check size={12} />}
        </span>
        <span style={{ fontSize: "0.8438rem" }}>
          {milestone.title}
          {milestone.evidence && (
            <small style={{ display: "block", color: "var(--ink-mute)" }}>Evidence: {milestone.evidence}</small>
          )}
        </span>
      </label>
      <button
        type="submit"
        className={`btn btn-sm ${done ? "btn-ghost" : isMentor ? "btn-primary" : "btn-secondary"}`}
        title={done ? "Reopen milestone" : isMentor ? "Verify & complete (counts as mentor verification)" : "Mark complete"}
      >
        {done ? "Reopen" : "Complete"}
      </button>
    </form>
  );
}

export function MilestoneCreateInline({ goalId }: { goalId: string }) {
  const [open, setOpen] = useState(false);
  if (!open) {
    return (
      <button type="button" className="btn btn-ghost btn-sm" onClick={() => setOpen(true)}>
        <Plus size={13} /> Add milestone
      </button>
    );
  }
  return (
    <form action={createMilestoneAction} className="row-item" style={{ padding: 0 }}>
      <input type="hidden" name="goalId" value={goalId} />
      <input name="title" className="input" required minLength={4} placeholder="Milestone title" autoFocus />
      <button type="submit" className="btn btn-primary btn-sm">Add</button>
    </form>
  );
}

/* ---------------- Sessions ---------------- */

export function SessionScheduleForm({ mentorshipId }: { mentorshipId: string }) {
  const [state, formAction, pending] = useActionState<{ error?: string }, FormData>(scheduleSessionAction, {});
  return (
    <form action={formAction} className="stack-16">
      <input type="hidden" name="mentorshipId" value={mentorshipId} />
      <div className="field">
        <label htmlFor="s-title">Session title</label>
        <input id="s-title" name="title" className="input" required minLength={4} placeholder="e.g. Portfolio review" />
      </div>
      <div className="form-grid">
        <div className="field">
          <label htmlFor="s-when">Date & time</label>
          <input id="s-when" name="scheduledAt" type="datetime-local" className="input" required />
        </div>
        <div className="field">
          <label htmlFor="s-mode">Mode</label>
          <select id="s-mode" name="mode" className="select">
            <option>Video</option>
            <option>Chat</option>
            <option>In-person</option>
            <option>Hybrid</option>
          </select>
        </div>
      </div>
      <div className="field">
        <label htmlFor="s-agenda">Agenda (optional)</label>
        <input id="s-agenda" name="agenda" className="input" placeholder="What should this session accomplish?" />
      </div>
      {state.error && <div className="form-error" role="alert">{state.error}</div>}
      <button type="submit" className="btn btn-secondary" disabled={pending}>
        <Plus size={15} /> Schedule session
      </button>
    </form>
  );
}

export function SessionCompleteInline({ sessionId, isMentor }: { sessionId: string; isMentor: boolean }) {
  return (
    <form action={completeSessionAction}>
      <input type="hidden" name="sessionId" value={sessionId} />
      <button type="submit" className={`btn btn-sm ${isMentor ? "btn-primary" : "btn-secondary"}`}>
        <CheckCircle2 size={13} /> Mark done
      </button>
    </form>
  );
}

/* ---------------- Messages & notes ---------------- */

export function MessageComposer({ conversationId }: { conversationId: string }) {
  return (
    <form action={sendMessageAction} style={{ display: "flex", gap: 8, marginTop: 12 }}>
      <input type="hidden" name="conversationId" value={conversationId} />
      <input name="body" className="input" required maxLength={2000} placeholder="Write a message…" aria-label="Message" />
      <button type="submit" className="btn btn-primary" aria-label="Send message">
        <MessageSquarePlus size={16} />
      </button>
    </form>
  );
}

export function NoteComposer({ mentorshipId }: { mentorshipId: string }) {
  return (
    <form action={addNoteAction} style={{ display: "flex", gap: 8 }}>
      <input type="hidden" name="mentorshipId" value={mentorshipId} />
      <input name="body" className="input" required maxLength={600} placeholder="Add a shared note…" aria-label="Note" />
      <button type="submit" className="btn btn-secondary" aria-label="Add note"><StickyNote size={15} /></button>
    </form>
  );
}

/* ---------------- Feedback ---------------- */

export function FeedbackForm({ mentorshipId }: { mentorshipId: string }) {
  const [state, formAction, pending] = useActionState<{ error?: string }, FormData>(addFeedbackAction, {});
  const [rating, setRating] = useState(4);
  return (
    <form action={formAction} className="stack-16">
      <input type="hidden" name="mentorshipId" value={mentorshipId} />
      <input type="hidden" name="rating" value={rating} />
      <div className="field">
        <label>Overall rating</label>
        <div style={{ display: "flex", gap: 4 }}>
          {[1, 2, 3, 4, 5].map((i) => (
            <button key={i} type="button" onClick={() => setRating(i)} aria-label={`${i} star${i > 1 ? "s" : ""}`}
              style={{ background: "none", border: "none", cursor: "pointer", padding: 2 }}>
              <Star size={20} color={i <= rating ? "#f59e0b" : "#d1d5db"} fill={i <= rating ? "#f59e0b" : "none"} />
            </button>
          ))}
        </div>
      </div>
      <div className="field">
        <label htmlFor="fb-strengths">Strengths observed</label>
        <textarea id="fb-strengths" name="strengths" className="textarea" style={{ minHeight: 64 }} required minLength={10}
          placeholder="What did the student do well since last session?" />
      </div>
      <div className="field">
        <label htmlFor="fb-growth">Areas to improve</label>
        <textarea id="fb-growth" name="areasToImprove" className="textarea" style={{ minHeight: 64 }} required minLength={10}
          placeholder="One or two concrete things to practice next." />
      </div>
      {state.error && <div className="form-error" role="alert">{state.error}</div>}
      <button type="submit" className="btn btn-primary" disabled={pending}>Save feedback</button>
    </form>
  );
}

/* ---------------- Complete mentorship ---------------- */

export function CompleteMentorshipButton({ mentorshipId }: { mentorshipId: string }) {
  const [confirming, setConfirming] = useState(false);
  if (!confirming) {
    return (
      <button type="button" className="btn btn-ghost btn-sm" onClick={() => setConfirming(true)}>
        Complete mentorship
      </button>
    );
  }
  return (
    <form action={completeMentorshipAction} style={{ display: "flex", gap: 8 }}>
      <input type="hidden" name="mentorshipId" value={mentorshipId} />
      <span style={{ fontSize: "0.78rem", alignSelf: "center", color: "var(--ink-mute)" }}>Mark as completed?</span>
      <button type="submit" className="btn btn-danger btn-sm">Yes, complete</button>
      <button type="button" className="btn btn-ghost btn-sm" onClick={() => setConfirming(false)}>Cancel</button>
    </form>
  );
}
