"use client";

import { useSyncExternalStore } from "react";
import type { LiveTape } from "@/lib/market/tape-types";

/**
 * The landing page's live figures, as a module-level store.
 *
 * A store rather than a context because two unrelated parts of the page want
 * the same numbers — the hero HUD and the marquee — and threading a provider
 * between them would mean making their common ancestor a client component,
 * which is the whole page.
 *
 * Everything here is arranged so the visitor never waits:
 *
 *  - The first read happens AFTER hydration. The server already rendered the
 *    designed figures; this only ever replaces them.
 *  - One fetch serves every subscriber, and the route behind it is CDN-cached,
 *    so a hundred simultaneous visitors cost the backend one read.
 *  - Polling stops when the tab is hidden and catches up when it returns.
 *    A background tab should not be holding the market open.
 */

const ENDPOINT = "/api/market/tape";

/** Matches the route's cache window — polling faster would only re-read the
 *  CDN's own copy. */
const POLL_MS = 30_000;

let snapshot: LiveTape | null = null;
const listeners = new Set<() => void>();
let timer: ReturnType<typeof setInterval> | null = null;
let lastAt = 0;
let inFlight = false;

function emit() {
  for (const l of listeners) l();
}

async function pull() {
  if (inFlight || typeof document === "undefined" || document.hidden) return;
  inFlight = true;
  try {
    const res = await fetch(ENDPOINT, { headers: { accept: "application/json" } });
    if (!res.ok) return;
    const json = (await res.json()) as { ok: boolean } & LiveTape;
    // `ok: false` means the backend had nothing for us. Keep whatever is on
    // screen — the designed figures, or the last live ones.
    if (!json?.ok) return;
    snapshot = json;
    lastAt = Date.now();
    emit();
  } catch {
    // Offline, blocked, or navigating away. The page is already correct.
  } finally {
    inFlight = false;
  }
}

function onVisible() {
  if (document.hidden) return;
  // Away long enough that what is on screen is stale — refresh immediately
  // rather than waiting out the rest of the interval.
  if (Date.now() - lastAt >= POLL_MS) void pull();
}

function start() {
  if (timer) return;
  void pull();
  timer = setInterval(() => void pull(), POLL_MS);
  document.addEventListener("visibilitychange", onVisible);
}

function stop() {
  if (timer) clearInterval(timer);
  timer = null;
  document.removeEventListener("visibilitychange", onVisible);
}

function subscribe(fn: () => void) {
  listeners.add(fn);
  if (listeners.size === 1) start();
  return () => {
    listeners.delete(fn);
    // Last component unmounted — nothing is looking, so stop asking.
    if (listeners.size === 0) stop();
  };
}

/**
 * The current tape, or null until the first answer arrives.
 *
 * The server snapshot is always null: the markup the server sends must be the
 * designed figures, or hydration would mismatch against numbers that moved
 * between render and paint.
 */
export function useLiveTape(): LiveTape | null {
  return useSyncExternalStore(
    subscribe,
    () => snapshot,
    () => null,
  );
}
