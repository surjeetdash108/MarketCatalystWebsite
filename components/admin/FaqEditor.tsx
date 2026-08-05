"use client";

import { useActionState } from "react";
import { createFaqAction, updateFaqAction, type ActionState } from "@/app/admin/(protected)/faqs/actions";
import type { Faq } from "@/lib/faq/faqs";

export function FaqEditor({ faq }: { faq?: Faq }) {
  const isEdit = Boolean(faq);
  const action = isEdit ? updateFaqAction : createFaqAction;
  const [state, formAction, pending] = useActionState<ActionState, FormData>(action, null);

  return (
    <form action={formAction} className="flex max-w-3xl flex-col gap-4">
      {isEdit && <input type="hidden" name="id" value={faq!.id} />}

      <label className="a-label">
        Question
        <input name="question" defaultValue={faq?.question} required className="a-input" />
      </label>

      <label className="a-label">
        Answer
        <textarea name="answer" defaultValue={faq?.answer} required rows={8} className="a-textarea" />
      </label>

      {state?.error && <p className="a-danger">{state.error}</p>}

      <div className="flex items-center gap-3">
        <button type="submit" disabled={pending} className="btn primary" style={{ opacity: pending ? 0.6 : 1 }}>
          {pending ? "Saving…" : isEdit ? "Save" : "Create FAQ"}
        </button>
      </div>
    </form>
  );
}
