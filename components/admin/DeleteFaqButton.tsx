"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { deleteFaqAction } from "@/app/admin/(protected)/faqs/actions";

export function DeleteFaqButton({ id }: { id: string }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function handleDelete() {
    if (!window.confirm("Delete this FAQ? This cannot be undone.")) return;
    startTransition(async () => {
      await deleteFaqAction(id);
      router.refresh();
    });
  }

  return (
    <button
      onClick={handleDelete}
      disabled={pending}
      className="btn sm danger"
      style={{ opacity: pending ? 0.5 : 1 }}
    >
      Delete
    </button>
  );
}
