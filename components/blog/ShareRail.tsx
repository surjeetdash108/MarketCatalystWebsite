"use client";

import { useEffect, useState } from "react";

/**
 * The article's static share rail (WhatsApp / X / LinkedIn / Telegram + copy
 * link). The intent URLs need the live page URL, so this is a client component
 * that reads window.location after mount; the copy button uses the clipboard.
 * Same behaviour as the v2 template's inline script, as a reusable component.
 */
export function ShareRail({ title }: { title: string }) {
  const [url, setUrl] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => setUrl(window.location.href), []);

  const e = encodeURIComponent;
  const links = url
    ? {
        wa: `https://wa.me/?text=${e(`${title} ${url}`)}`,
        x: `https://twitter.com/intent/tweet?text=${e(title)}&url=${e(url)}`,
        li: `https://www.linkedin.com/sharing/share-offsite/?url=${e(url)}`,
        tg: `https://t.me/share/url?url=${e(url)}&text=${e(title)}`,
      }
    : { wa: "#", x: "#", li: "#", tg: "#" };

  async function copy() {
    try {
      await navigator.clipboard.writeText(url || window.location.href);
    } catch {
      /* clipboard blocked — still show the hint below */
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  }

  return (
    <div className="share">
      <span className="lab">Share</span>
      <a href={links.wa} target="_blank" rel="noopener" aria-label="Share on WhatsApp" title="WhatsApp">
        <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2a10 10 0 00-8.6 15L2 22l5.2-1.4A10 10 0 1012 2zm0 18a8 8 0 01-4.1-1.1l-.3-.2-3 .8.8-2.9-.2-.3A8 8 0 1112 20zm4.4-5.8c-.2-.1-1.4-.7-1.6-.8s-.4-.1-.5.1-.6.8-.7.9-.3.2-.5 0a6.5 6.5 0 01-1.9-1.2 7.2 7.2 0 01-1.4-1.7c-.1-.3 0-.4.1-.5l.4-.5a1.8 1.8 0 00.2-.4.4.4 0 000-.4c0-.1-.5-1.3-.7-1.7s-.4-.4-.5-.4h-.4a.9.9 0 00-.6.3 2.6 2.6 0 00-.8 1.9A4.5 4.5 0 008.4 13a10.2 10.2 0 003.9 3.4c.5.2 1 .4 1.3.5a3.1 3.1 0 001.4.1 2.3 2.3 0 001.5-1.1 1.9 1.9 0 00.1-1c0-.1-.2-.2-.4-.3z" /></svg>
      </a>
      <a href={links.x} target="_blank" rel="noopener" aria-label="Share on X" title="X">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d="M18.2 2h3.3l-7.2 8.3L23 22h-6.7l-5.2-6.8L5.1 22H1.8l7.7-8.8L1 2h6.8l4.7 6.2L18.2 2zm-1.2 18h1.8L7.1 3.9H5.1L17 20z" /></svg>
      </a>
      <a href={links.li} target="_blank" rel="noopener" aria-label="Share on LinkedIn" title="LinkedIn">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M4.98 3.5A2.5 2.5 0 102.5 6 2.5 2.5 0 004.98 3.5zM3 8.5h4V21H3zM9.5 8.5h3.8v1.7h.05a4.2 4.2 0 013.75-2c4 0 4.75 2.6 4.75 6V21h-4v-5.6c0-1.35 0-3.1-1.9-3.1s-2.2 1.5-2.2 3V21h-4z" /></svg>
      </a>
      <a href={links.tg} target="_blank" rel="noopener" aria-label="Share on Telegram" title="Telegram">
        <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor"><path d="M21.8 4.3L18.9 19c-.2 1-.8 1.2-1.6.8l-4.4-3.2-2.1 2c-.2.3-.4.5-.9.5l.3-4.5 8.2-7.4c.4-.3-.1-.5-.6-.2L7.7 13.2 3.4 11.9c-.9-.3-.9-.9.2-1.3L20.6 3.4c.8-.3 1.4.2 1.2.9z" /></svg>
      </a>
      <button type="button" onClick={copy} aria-label="Copy link" title="Copy link">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10 13a5 5 0 007.5.5l2-2a5 5 0 00-7-7l-1 1" /><path d="M14 11a5 5 0 00-7.5-.5l-2 2a5 5 0 007 7l1-1" /></svg>
      </button>
      <span id="copied" role="status">{copied ? "Copied" : ""}</span>
    </div>
  );
}
