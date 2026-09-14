"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { removeMemberAction } from "@/app/admin/(protected)/users/actions";
import type { WebsiteMember } from "@/lib/auth/members";

export function UsersTable({ members, currentUid }: { members: WebsiteMember[]; currentUid: string }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function remove(member: WebsiteMember) {
    startTransition(async () => {
      await removeMemberAction(member.uid);
      router.refresh();
    });
  }

  return (
    <div className="a-panel" style={{ padding: "6px 14px" }}>
      <table className="tbl">
        <thead>
          <tr>
            <th>Email</th>
            <th>Role</th>
            <th />
          </tr>
        </thead>
        <tbody>
          {members.map((member) => (
            <tr key={member.uid}>
              <td style={{ color: "var(--text-hi)" }}>{member.email}</td>
              <td>
                <span className={`pill ${member.role === "ADMIN" ? "opt" : "flat"}`}>{member.role}</span>
              </td>
              <td style={{ textAlign: "right" }}>
                {/* An admin can never remove their own membership — see the
                    comment on removeMemberAction for why. */}
                {member.uid !== currentUid && (
                  <button onClick={() => remove(member)} disabled={pending} className="btn sm danger" style={{ opacity: pending ? 0.5 : 1 }}>
                    Remove
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
