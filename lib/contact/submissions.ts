import "server-only";
import { FieldValue, Timestamp } from "firebase-admin/firestore";
import { adminFirestore } from "@/lib/firebase/admin";
import type { ContactFormInput } from "@/lib/validation/contact";

export type SubmissionStatus = "new" | "read" | "archived";

export type ContactSubmission = {
  id: string;
  name: string;
  email: string;
  company: string | null;
  message: string;
  status: SubmissionStatus;
  createdAt: string;
  userAgent: string | null;
  submittedFromPath: string | null;
};

const COLLECTION = "contactSubmissions";

function mapSubmission(id: string, data: FirebaseFirestore.DocumentData): ContactSubmission {
  const createdAt = data.createdAt as Timestamp | undefined;
  return {
    id,
    name: data.name,
    email: data.email,
    company: data.company ?? null,
    message: data.message,
    status: data.status ?? "new",
    createdAt: createdAt ? createdAt.toDate().toISOString() : new Date(0).toISOString(),
    userAgent: data.userAgent ?? null,
    submittedFromPath: data.submittedFromPath ?? null,
  };
}

export async function createSubmission(
  input: ContactFormInput,
  meta: { userAgent: string | null; submittedFromPath: string | null },
): Promise<void> {
  await adminFirestore.collection(COLLECTION).add({
    name: input.name,
    email: input.email,
    company: input.company || null,
    message: input.message,
    status: "new",
    createdAt: FieldValue.serverTimestamp(),
    userAgent: meta.userAgent,
    submittedFromPath: meta.submittedFromPath,
  });
}

export async function listSubmissions(): Promise<ContactSubmission[]> {
  const snap = await adminFirestore.collection(COLLECTION).orderBy("createdAt", "desc").get();
  return snap.docs.map((doc) => mapSubmission(doc.id, doc.data()));
}

export async function setSubmissionStatus(id: string, status: SubmissionStatus): Promise<void> {
  await adminFirestore.collection(COLLECTION).doc(id).update({ status });
}
