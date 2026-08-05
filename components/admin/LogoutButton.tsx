"use client";

import { useRouter } from "next/navigation";
import { firebaseAuth } from "@/lib/firebase/client";

export function LogoutButton() {
  const router = useRouter();

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    await firebaseAuth.signOut().catch(() => undefined);
    router.push("/admin/login");
    router.refresh();
  }

  return (
    <button onClick={handleLogout} className="btn" style={{ width: "100%", justifyContent: "center" }}>
      Sign out
    </button>
  );
}
