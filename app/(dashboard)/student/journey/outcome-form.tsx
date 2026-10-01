"use client";

import { useActionState, useState } from "react";
import { saveCareerOutcomeAction } from "@/lib/mentorship/actions";
import { CheckCircle2 } from "lucide-react";

const STATUSES = [
  { value: "INTERNSHIP", label: "Internship" },
  { value: "EMPLOYED", label: "Employed" },
  { value: "HIGHER_STUDIES", label: "Higher studies" },
  { value: "ENTREPRENEUR", label: "Entrepreneurship" },
  { value: "SEEKING_OPPORTUNITY", label: "Seeking opportunity" },
  { value: "STUDENT", label: "Still studying" },
];

export interface OutcomeInitial {
  status: string;
  company: string;
  role: string;
  industry: string;
  location: string;
  joiningDate: string;
  salaryRange: string;
  internshipDuration: string;
  higherEducation: string;
}

export function CareerOutcomeForm({ industries, initial }: { industries: string[]; initial?: OutcomeInitial }) {
  const [status, setStatus] = useState(initial?.status ?? "STUDENT");
  const [state, formAction, pending] = useActionState<{ error?: string }, FormData>(saveCareerOutcomeAction, {});

  return (
    <form action={formAction} className="stack-16">
      <div className="field">
        <label htmlFor="co-status">Current status</label>
        <select id="co-status" name="status" className="select" value={status} onChange={(e) => setStatus(e.target.value)}>
          {STATUSES.map((s) => (
            <option key={s.value} value={s.value}>{s.label}</option>
          ))}
        </select>
      </div>

      {(status === "INTERNSHIP" || status === "EMPLOYED" || status === "ENTREPRENEUR") && (
        <div className="form-grid">
          <div className="field">
            <label htmlFor="co-company">Company / venture</label>
            <input id="co-company" name="company" className="input" defaultValue={initial?.company} placeholder="e.g. Google" />
          </div>
          <div className="field">
            <label htmlFor="co-role">Role</label>
            <input id="co-role" name="role" className="input" defaultValue={initial?.role} placeholder="e.g. SDE Intern" />
          </div>
          <div className="field">
            <label htmlFor="co-industry">Industry</label>
            <input id="co-industry" name="industry" className="input" defaultValue={initial?.industry} list="co-industries" placeholder="e.g. Technology" />
            <datalist id="co-industries">
              {industries.map((i) => <option key={i} value={i} />)}
            </datalist>
          </div>
          <div className="field">
            <label htmlFor="co-location">Location</label>
            <input id="co-location" name="location" className="input" defaultValue={initial?.location} placeholder="e.g. Bengaluru, India" />
          </div>
          <div className="field">
            <label htmlFor="co-joining">Joining date</label>
            <input id="co-joining" name="joiningDate" type="date" className="input" defaultValue={initial?.joiningDate} />
          </div>
          {status === "INTERNSHIP" && (
            <div className="field">
              <label htmlFor="co-duration">Internship duration</label>
              <input id="co-duration" name="internshipDuration" className="input" defaultValue={initial?.internshipDuration} placeholder="e.g. 12 weeks" />
            </div>
          )}
          <div className="field">
            <label htmlFor="co-salary">Salary range (optional)</label>
            <input id="co-salary" name="salaryRange" className="input" defaultValue={initial?.salaryRange} placeholder="Optional — never shown to other students" />
          </div>
        </div>
      )}

      {status === "HIGHER_STUDIES" && (
        <div className="field">
          <label htmlFor="co-higher">Program & university</label>
          <input id="co-higher" name="higherEducation" className="input" defaultValue={initial?.higherEducation} placeholder="e.g. M.S. Computer Science, Georgia Tech" />
        </div>
      )}

      {status === "SEEKING_OPPORTUNITY" && (
        <p className="hint" style={{ margin: 0 }}>
          Your placement team sees a support indicator (never a public label) and can connect you with mentors
          who specialize in active job searches.
        </p>
      )}

      {state.error && <div className="form-error" role="alert">{state.error}</div>}

      <button type="submit" className="btn btn-primary" disabled={pending}>
        <CheckCircle2 size={15} /> {initial ? "Update outcome" : "Save outcome"}
      </button>
    </form>
  );
}
