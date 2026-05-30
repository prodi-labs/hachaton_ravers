# Private Sandbox

Optimize operational cost to hit a target. The Packaging Department Head describes
operational improvements in plain language; the AI classifies each one, computes its
financial impact with a **deterministic formula engine**, and turns it into a
**building block** tracked against the yearly target until the gap closes.

Google ADK + Gemini agent (AG-UI) ⇄ Next.js + CopilotKit frontend.

## Run

1. Install: `npm install` (also runs `uv sync` for the Python agent).
2. Add your key to `agent/.env`:
   ```
   GOOGLE_API_KEY=your_key_here
   ```
3. Start both processes: `npm run dev`
   - UI → http://localhost:3000
   - Agent → http://localhost:8000

## How it works

- **Formula engine** (`agent/formula_engine.py`): hardcoded assumptions + per-initiative
  formulas (`line_speed`, `worker_shifts`, `downtime_reduction`). Computes a
  deterministic, signed-negative euro saving — never an AI estimate. Flags changes >50%
  as unrealistic before computing.
- **Agent** (`agent/main.py`): a Gemini `LlmAgent` that greets with the €500,000 target,
  classifies the operational input, calls the `calculate_initiative` backend tool for the
  number, writes a natural-language causal chain (Option B), then calls the
  `add_building_block` frontend tool. Confirms blocks and loops on the remaining gap.
- **Frontend** (`src/`): `sandboxStore` holds `{ target, blocks }` (planned/gap derived);
  `SandboxTools` registers the frontend tools (`add_building_block`,
  `confirm_building_block`, `set_target`) via `useFrontendTool`; `BlockCanvas` renders the
  building-block cards (pending → active via **Use Initiative**); `TargetTracker` shows
  Target / Planned / Gap. Chat UI is `CopilotSidebar`.
- **Runtime** (`src/app/api/copilotkit/[[...slug]]/route.ts`): CopilotKit runtime bridging
  the browser to the Python agent over AG-UI.

## Demo flow

1. On load the assistant states the €500,000 target and offers to start.
2. *"Increase line speed by 10%"* → a pending building block appears with its causal chain,
   assumptions, and a deterministic saving; confirm it (chat "yes" or **Use Initiative**).
3. The tracker updates (Target / Planned / Gap) and the assistant prompts the next
   initiative, looping until the gap closes. Try also *"set target to 800k"*.
