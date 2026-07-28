"use client";

import dynamic from "next/dynamic";

// See GlBackgroundLoader.tsx — same reasoning: the scroll/DOM-measuring
// carousel needs the browser, so it's kept out of the server render via a
// client-only dynamic import performed from inside a Client Component.
const WorkspaceCarousel = dynamic(() => import("./WorkspaceCarousel").then((m) => m.WorkspaceCarousel), { ssr: false });

export default WorkspaceCarousel;
