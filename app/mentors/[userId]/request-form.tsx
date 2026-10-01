"use client";

import { useActionState, useState } from "react";
import { CheckCircle2, SendHorizonal } from "lucide-react";
import { createMentorshipRequestAction, type RequestState } from "@/lib/mentorship/actions";

export function MentorRequestForm({
  mentorUserId,
  defaultOpen,
}: {
  mentorUserId: string;
  defaultOpen: boolean;
}) {
  const [state, formAction, pending] = useActionState<RequestState, FormData>(createMentorshipRequestAction, {});
  const [sent, setSent] = useState(false);

  if (state.success || sent) {
    return (
      <div className="form-success" role="status">
        <CheckCircle2 size={18} />
        <div>
          <strong>Request sent!</strong>
          <p style={{ margin: "4px 0 0" }}>
            {state.success ?? "The mentor has been notified."} You'll get a notification the moment they respond —
            meanwhile, track it under <a href="/student/mentorship" style={{ fontWeight: 600 }}>Mentorship</a>.
          </p>
        </div>
      </div>
    );
  }

  return (
    <form action={formAction} className="stack-16">
      <input type="hidden" name="mentorUserId" value={mentorUserId} />
      <div className="field">
        <label htmlFor="mr-goal">Your mentorship goal</label>
        <input id="mr-goal" name="goal" className="input" required minLength={20}
          placeholder="e.g. Become a product engineer and land a 2026 placement" />
        <span className="hint">One clear sentence. Mentors accept goals they can actually help with.</span>
      </div>
      <div className="field">
        <label htmlFor="mr-message">Message</label>
        <textarea id="mr-message" name="message" className="textarea" required minLength={20}
          placeholder="Introduce yourself: year, department, what you're building, and why this mentor." />
      </div>
      <div className="form-grid">
        <div className="field">
          <label htmlFor="mr-pref">Meeting preference</label>
          <select id="mr-pref" name="meetingPreference" className="select">
            <option>Video call, bi-weekly</option>
            <option>Video call, weekly</option>
            <option>Video call, monthly</option>
            <option>Chat / async</option>
          </select>
        </div>
        <div className="field">
          <label htmlFor="mr-avail">Your availability</label>
          <input id="mr-avail" name="availability" className="input" required
            placeholder="e.g. Evenings and weekends (IST)" />
        </div>
      </div>
      {state.error && <div className="form-error" role="alert">{state.error}</div>}
      <button type="submit" className="btn btn-primary" disabled={pending}>
        <SendHorizonal size={15} /> {pending ? "Sending…" : "Send request"}
      </button>
    </form>
  );
}
