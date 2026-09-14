import "server-only";
import { FieldValue, Timestamp } from "firebase-admin/firestore";
import { adminFirestore } from "@/lib/firebase/admin";
import type { CreateFaqInput, UpdateFaqInput } from "@/lib/validation/faq";

export type Faq = {
  id: string;
  question: string;
  answer: string;
  authorId: string;
  editorId: string | null;
  createdAt: string;
  updatedAt: string;
};

const FAQS = "faqs";

function toIso(value: Timestamp | undefined | null): string | null {
  return value ? value.toDate().toISOString() : null;
}

function mapFaq(id: string, data: FirebaseFirestore.DocumentData): Faq {
  return {
    id,
    question: data.question ?? "",
    answer: data.answer ?? "",
    authorId: data.authorId ?? "",
    editorId: data.editorId ?? null,
    createdAt: toIso(data.createdAt) ?? new Date(0).toISOString(),
    updatedAt: toIso(data.updatedAt) ?? new Date(0).toISOString(),
  };
}

/**
 * Public site — FAQs have no draft state (unlike blog posts), so every FAQ is
 * public. Ordered oldest-first so the list is stable as new ones are appended.
 */
export async function getPublicFaqs(): Promise<Faq[]> {
  const snap = await adminFirestore.collection(FAQS).orderBy("createdAt", "asc").get();
  return snap.docs.map((doc) => mapFaq(doc.id, doc.data()));
}

/** Admin list — most-recently-edited first. */
export async function getAllFaqsForAdmin(): Promise<Faq[]> {
  const snap = await adminFirestore.collection(FAQS).orderBy("updatedAt", "desc").get();
  return snap.docs.map((doc) => mapFaq(doc.id, doc.data()));
}

export async function getFaqById(id: string): Promise<Faq | null> {
  const doc = await adminFirestore.collection(FAQS).doc(id).get();
  if (!doc.exists) return null;
  return mapFaq(doc.id, doc.data()!);
}

export async function createFaq(input: CreateFaqInput, authorId: string): Promise<Faq> {
  const ref = adminFirestore.collection(FAQS).doc();
  const now = FieldValue.serverTimestamp();
  await ref.set({
    question: input.question,
    answer: input.answer,
    authorId,
    editorId: authorId,
    createdAt: now,
    updatedAt: now,
  });
  const created = await getFaqById(ref.id);
  return created!;
}

export async function updateFaq(input: UpdateFaqInput, editorId: string): Promise<void> {
  const ref = adminFirestore.collection(FAQS).doc(input.id);
  const existing = await getFaqById(input.id);
  if (!existing) throw new Error("faq_not_found");
  await ref.update({
    ...(input.question !== undefined ? { question: input.question } : {}),
    ...(input.answer !== undefined ? { answer: input.answer } : {}),
    editorId,
    updatedAt: FieldValue.serverTimestamp(),
  });
}

export async function deleteFaq(id: string): Promise<void> {
  await adminFirestore.collection(FAQS).doc(id).delete();
}
