import { PostEditor } from "@/components/admin/PostEditor";

export default function NewPostPage() {
  return (
    <div className="flex flex-col gap-4">
      <h1 className="a-h1">New post</h1>
      <PostEditor />
    </div>
  );
}
