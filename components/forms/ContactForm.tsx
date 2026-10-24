"use client";

import { useState } from "react";

// What the visitor sees when the server, the origin check or the network
// failed — nothing they can fix by retyping, so point them at the mailbox.
const SEND_FAILED = "Couldn't send — please email hello@marketcatalyst.ai instead.";

/** Maps a failed /api/contact response to the one thing worth telling the visitor. */
async function errorMessageFor(response: Response): Promise<string> {
  if (response.status === 400) {
    // The route passes the schema's own message through ("Message must be plain text").
    const data: { message?: unknown } | null = await response.json().catch(() => null);
    return typeof data?.message === "string" && data.message
      ? data.message
      : "Please check your details and try again.";
  }
  if (response.status === 429) return "Too many attempts — please wait a few minutes and try again.";
  return SEND_FAILED;
}

/**
 * The contact form, wearing the mcp-* surface the rest of the reading pages
 * use. Colours come from app/theme.css tokens, so it themes itself light/dark
 * with the page rather than carrying its own palette.
 *
 * Errors are shown inline and the success state replaces the form entirely —
 * there is nothing useful left to do on a sent message except read the
 * confirmation.
 */
export function ContactForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [company, setCompany] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<"idle" | "submitting" | "sent" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState(SEND_FAILED);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("submitting");

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, company, message }),
      });

      if (!response.ok) {
        setErrorMessage(await errorMessageFor(response));
        setStatus("error");
        return;
      }

      setStatus("sent");
      setName("");
      setEmail("");
      setCompany("");
      setMessage("");
    } catch {
      setErrorMessage(SEND_FAILED);
      setStatus("error");
    }
  }

  if (status === "sent") {
    return (
      <div className="mcp-formcard mcp-sent" role="status">
        <span className="mcp-sent-mark" aria-hidden="true">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4 12.5 9.5 18 20 6.5" />
          </svg>
        </span>
        <h2>Message received</h2>
        <p>
          Thanks — it is with the team that owns the answer, and you&apos;ll hear back from a single
          address rather than an autoresponder.
        </p>
        <button type="button" className="mcp-cta-ghost" onClick={() => setStatus("idle")}>
          Send another
        </button>
      </div>
    );
  }

  return (
    <form className="mcp-formcard" onSubmit={handleSubmit}>
      <div className="mcp-form-bar">
        <span className="mcp-chart-dots" aria-hidden="true">
          <i />
          <i />
          <i />
        </span>
        <span>NEW MESSAGE</span>
        <span className="mcp-chart-live">● SECURE</span>
      </div>

      <div className="mcp-form-body">
        <div className="mcp-row">
          <div className="mcp-field">
            <label htmlFor="cf-name">Name</label>
            <input
              id="cf-name"
              name="name"
              type="text"
              autoComplete="name"
              placeholder="Jane Okafor"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          <div className="mcp-field">
            <label htmlFor="cf-email">Email</label>
            <input
              id="cf-email"
              name="email"
              type="email"
              autoComplete="email"
              placeholder="jane@firm.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
        </div>

        <div className="mcp-field">
          <label htmlFor="cf-company">
            Company <span className="mcp-opt">optional</span>
          </label>
          <input
            id="cf-company"
            name="company"
            type="text"
            autoComplete="organization"
            placeholder="Where you work"
            value={company}
            onChange={(e) => setCompany(e.target.value)}
          />
        </div>

        <div className="mcp-field">
          <label htmlFor="cf-message">Message</label>
          <textarea
            id="cf-message"
            name="message"
            rows={6}
            placeholder="What are you trying to work out?"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            maxLength={5000}
            required
          />
          <span className="mcp-count-in">{message.length}/5000</span>
        </div>

        {status === "error" && (
          <p className="mcp-form-err" role="alert">
            {errorMessage}
          </p>
        )}

        <button type="submit" className="mcp-cta mcp-submit" disabled={status === "submitting"}>
          {status === "submitting" ? "Sending…" : "Send message"}
          {status === "submitting" ? null : <i>→</i>}
        </button>

        <p className="mcp-form-fine">
          Used only to answer you. Never resold, never added to a list you did not ask for.
        </p>
      </div>
    </form>
  );
}
