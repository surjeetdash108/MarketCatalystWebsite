import { permanentRedirect } from "next/navigation";

// The blog index moved to /posts (renamed "Blogs"). 308-redirect so existing
// links and search-engine equity carry over.
export default function BlogIndexRedirect() {
  permanentRedirect("/posts");
}
