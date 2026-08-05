"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { deletePostAction } from "@/app/admin/(protected)/posts/actions";

export function DeletePostButton({ id }: { id: string }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function handleDelete() {
    if (!window.confirm("Delete this post? This cannot be undone.")) return;
    startTransition(async () => {
      await deletePostAction(id);
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
