import { listSubmissions } from "@/lib/contact/submissions";
import { ContactSubmissionsTable } from "@/components/admin/ContactSubmissionsTable";

export default async function ContactSubmissionsPage() {
  const submissions = await listSubmissions();

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-lg font-semibold">Contact submissions</h1>
      <ContactSubmissionsTable submissions={submissions} />
    </div>
  );
}
