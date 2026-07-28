"use client";

import dynamic from "next/dynamic";

// `dynamic(..., { ssr: false })` may only be called from within a Client
// Component module — this thin wrapper exists so `app/page.tsx` (a Server
// Component) can pull in the WebGL background without ever rendering it
// on the server.
const GlBackground = dynamic(() => import("./GlBackground").then((m) => m.GlBackground), { ssr: false });

export default GlBackground;
