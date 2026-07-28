"use client";

import { useActionState } from "react";
import { inviteEditorAction, type ActionState } from "@/app/admin/(protected)/users/actions";

export function InviteEditorForm() {
  const [state, formAction, pending] = useActionState<ActionState, FormData>(inviteEditorAction, null);

  return (
    <form action={formAction} className="flex flex-wrap items-end gap-3 rounded border border-neutral-200 p-4">
      <label className="flex flex-col gap-1">
        <span className="text-sm font-medium">Email</span>
        <input name="email" type="email" required className="rounded border border-neutral-300 px-3 py-2" />
      </label>
      <label className="flex flex-col gap-1">
        <span className="text-sm font-medium">Display name</span>
        <input name="displayName" className="rounded border border-neutral-300 px-3 py-2" />
      </label>
      <button
        type="submit"
        disabled={pending}
        className="rounded bg-neutral-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
      >
        {pending ? "Inviting…" : "Invite editor"}
      </button>
      {state?.error && <p className="w-full text-sm text-red-600">{state.error}</p>}
    </form>
  );
}
