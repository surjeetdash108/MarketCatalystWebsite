import { ReaderShell } from "@/components/chrome/ReaderShell";
import "./careers.css";

export default function CareersLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <ReaderShell>{children}</ReaderShell>;
}
