# Build Plan — Chat UI + "Say _block_, Get a Block"

**Goal:** A working web app with an AI chat (Google/Gemini via ADK) where, every time you say the word **"block"** in the chat, a new visual block appears on the page.

**Stack (chosen because a coding agent builds it reliably):** Google ADK + Gemini on the backend, wrapped in the AG-UI protocol, with a Next.js + CopilotKit frontend. This keeps your Google stack and puts you on the most heavily-documented generative-UI path.

**Budget:** ~5 hours, vibe-coded. Build riskiest integration first, polish last.

---

## 0. Prerequisites (10 min)

- [ ] Node.js 18+ and a package manager (pnpm recommended)
- [ ] Python 3.10+ installed (the ADK agent runs in Python)
- [ ] A **Gemini API key** from Google AI Studio (aistudio.google.com)
- [ ] Your coding agent of choice (Claude Code, Cursor, etc.)

---

## Phase 1 — Scaffold & run the starter (~30 min)

The whole point of this phase: get the _stock_ starter talking to Gemini **before changing anything**.

1. Scaffold the ADK + CopilotKit project:

   ```bash
   npx copilotkit@latest create -f adk
   ```

   Give it a project name when prompted.

2. Install dependencies:

   ```bash
   pnpm install   # or npm install
   ```

3. Add your Gemini key to a `.env` file in the project root:

   ```
   GEMINI_API_KEY=your_key_here
   ```

4. Start both processes (the starter has scripts for this — check its README):
   - Python ADK agent → usually `localhost:8000`
   - Next.js frontend → `localhost:3000`

5. **Checkpoint:** Open `localhost:3000`, type into the chat, get a Gemini reply. The starter ships with demo tools (set theme, weather, etc.) — try one to confirm the agent can drive the UI.

> ⚠️ The two-process setup (Python backend + Next frontend) is the single most likely thing to eat time. Do not move on until both run and the chat responds.

---

## Phase 2 — Confirm the chat UI (~15 min)

The starter already includes the chat component (`CopilotSidebar` or `CopilotChat`). You mostly just confirm and lightly customise.

- [ ] Locate the page that renders the chat (likely `app/page.tsx`).
- [ ] Optionally set a title/placeholder so it reads as _your_ app, not a demo.
- [ ] Confirm messages stream in token-by-token.

No new logic here — just make sure the chat surface is where you want it on screen, leaving room for the block canvas next to it.

---

## Phase 3 — The "block" behaviour (THE core feature, ~90 min)

This is the part that _is_ your demo. The pattern: a **frontend action** the agent can call, which mutates local state and renders blocks.

### 3a. Create the canvas + action component

Create `app/BlockCanvas.tsx`:

```tsx
"use client";
import { useCopilotAction } from "@copilotkit/react-core";
import { useState } from "react";

type Block = { id: string; label: string };

export function BlockCanvas() {
  const [blocks, setBlocks] = useState<Block[]>([]);

  useCopilotAction({
    name: "addBlock",
    description:
      "Add one new block to the canvas. Call this whenever the user says the word 'block'.",
    parameters: [
      {
        name: "label",
        type: "string",
        description: "Short label for the block (optional)",
        required: false,
      },
    ],
    handler: ({ label }) => {
      setBlocks((prev) => [
        ...prev,
        { id: crypto.randomUUID(), label: label || `Block ${prev.length + 1}` },
      ]);
    },
  });

  return (
    <div className="grid gap-3 p-6">
      {blocks.length === 0 && (
        <p className="text-sm text-gray-400">Say "block" in the chat…</p>
      )}
      {blocks.map((b) => (
        <div
          key={b.id}
          className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm"
        >
          {b.label}
        </div>
      ))}
    </div>
  );
}
```

### 3b. Mount it on the page

Render `<BlockCanvas />` alongside the chat (e.g. main area = canvas, sidebar = chat).

### 3c. Tell the agent _when_ to call it

In the Python agent file (likely `agent.py`), add a line to the agent's instruction string so it reliably triggers:

> "Whenever the user's message contains the word 'block', call the `addBlock` tool exactly once. Otherwise just chat normally."

- [ ] **Checkpoint:** Type "add a block" → a card appears. Type "another block" → a second card. Type "block called conveyor belt" → a card labelled "conveyor belt".

> If the agent isn't calling the frontend action, the fallback is to also define an `add_block` tool on the ADK backend and keep the frontend action as the renderer. Have your coding agent check the CopilotKit version's docs for the current frontend-action ↔ agent wiring.

---

## Phase 4 — Make it feel like a canvas (~60 min)

- [ ] Style the blocks (Tailwind is already set up): rounded cards, subtle shadow, consistent sizing.
- [ ] Add a **block-appears animation** with Framer Motion (`motion`) — fade + slide in. Coding agents do this reliably; don't reach for heavier libraries.
- [ ] Add a header bar showing a live count: "Blocks: N".

That's the demo. Everything below is optional.

---

## Verification checklist

- [ ] Both processes start cleanly
- [ ] Chat streams Gemini responses
- [ ] Saying "block" adds exactly one block
- [ ] Multiple blocks stack without layout breaking
- [ ] Blocks animate in
- [ ] Reload works (blocks reset is fine for a demo)

---

## Stretch goals (only if time remains)

These convert the toy into your real budget concept:

1. **Labelled initiatives:** add an `impactPct` parameter to `addBlock` so "speed up the conveyor belt by 10%" creates a block tagged _+10%_.
2. **Target bar:** show a progress bar of cumulative impact toward a target. Add a second tool `setTarget(amount)`.
3. **Proactive agent:** instruct the agent to suggest a _next_ initiative after each block ("Want to add packaging training, +3%?") so the stacking-toward-target story lands in a demo.
4. **Shared state:** swap local `useState` for CopilotKit shared state (`useCoAgent`) so the agent can read and reason about the current blocks, not just append.

---

## Kickoff prompt for your coding agent

Paste something like this to point it in the right direction:

> I've scaffolded a project with `npx copilotkit@latest create -f adk` — it's a Google ADK + Gemini agent wrapped in AG-UI, with a Next.js + CopilotKit frontend. Both run locally (agent on :8000, frontend on :3000).
>
> I want one feature: whenever I type the word "block" in the chat, a new visual block (a styled card) should appear on the page. Implement this as a CopilotKit frontend action called `addBlock` defined in a `BlockCanvas` component that holds the blocks in React state and renders them. Update the ADK agent's instructions so it calls `addBlock` once whenever my message contains "block". Then style the blocks as cards and animate them in with Framer Motion.
>
> Check the installed CopilotKit version's docs for the exact `useCopilotAction` signature and import paths before writing code — don't assume.

---

## Gotchas

- **Version churn:** CopilotKit import paths and the `useCopilotAction` signature have shifted across versions (e.g. some components moved to `/v2`). Always have the agent verify against the _installed_ version.
- **Two languages:** the backend is Python, the frontend is TypeScript. If the Python process becomes a time sink, the escape hatch is a pure Next.js + CopilotKit app calling Gemini directly — same frontend, no ADK — but try the starter first.
- **Reliability of triggering:** LLMs occasionally skip a tool call. The explicit "exactly once whenever the message contains 'block'" instruction makes it dependable enough for a demo.
