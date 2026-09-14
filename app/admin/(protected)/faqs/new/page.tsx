import { FaqEditor } from "@/components/admin/FaqEditor";

export default function NewFaqPage() {
  return (
    <div className="flex flex-col gap-4">
      <h1 className="a-h1">New FAQ</h1>
      <FaqEditor />
    </div>
  );
}
