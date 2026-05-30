"use client";

import { useEffect } from "react";

/**
 * Removes CopilotKit's fixed "Powered by CopilotKit" license banner, which the
 * provider renders at the viewport bottom when no license key is set and which
 * overlaps the last line of chat responses. It has no class/data hook and
 * mounts asynchronously (after the runtime reports license status), so we watch
 * for it and strip it out. Identified via its unique "Get a license" link.
 */
export function HideCopilotBanner() {
  useEffect(() => {
    const strip = () => {
      document
        .querySelectorAll<HTMLAnchorElement>(
          'a[href^="https://copilotkit.ai/pricing"]',
        )
        .forEach((link) => {
          const banner =
            link.closest("div[style*='fixed']") ??
            link.parentElement?.parentElement;
          banner?.remove();
        });
    };

    strip();
    const observer = new MutationObserver(strip);
    observer.observe(document.body, { childList: true, subtree: true });
    return () => observer.disconnect();
  }, []);

  return null;
}
