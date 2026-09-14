"use client";

import { useActionState } from "react";
import { inviteEditorAction, type ActionState } from "@/app/admin/(protected)/users/actions";

export function InviteEditorForm() {
  const [state, formAction, pending] = useActionState<ActionState, FormData>(inviteEditorAction, null);

  return (
    <form action={formAction} className="a-panel flex flex-wrap items-end gap-3">
      <label className="a-label" style={{ flex: "1 1 200px" }}>
        Email
        <input name="email" type="email" required className="a-input" />
      </label>
      <label className="a-label" style={{ flex: "1 1 200px" }}>
        Display name
        <input name="displayName" className="a-input" />
      </label>
      <button type="submit" disabled={pending} className="btn primary" style={{ opacity: pending ? 0.6 : 1 }}>
        {pending ? "Inviting…" : "Invite editor"}
      </button>
      {state?.error && <p className="a-danger" style={{ width: "100%" }}>{state.error}</p>}
    </form>
  );
}
