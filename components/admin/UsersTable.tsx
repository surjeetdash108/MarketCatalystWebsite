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
    <table className="w-full text-sm">
      <thead>
        <tr className="border-b border-neutral-200 text-left text-neutral-500">
          <th className="py-2 font-medium">Email</th>
          <th className="py-2 font-medium">Role</th>
          <th className="py-2 font-medium" />
        </tr>
      </thead>
      <tbody>
        {members.map((member) => (
          <tr key={member.uid} className="border-b border-neutral-100">
            <td className="py-2">{member.email}</td>
            <td className="py-2 uppercase text-neutral-500">{member.role}</td>
            <td className="py-2 text-right">
              {/* An admin can never remove their own membership — see the
                  comment on removeMemberAction for why. */}
              {member.uid !== currentUid && (
                <button
                  onClick={() => remove(member)}
                  disabled={pending}
                  className="text-xs text-neutral-600 hover:underline disabled:opacity-50"
                >
                  Remove
                </button>
              )}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
