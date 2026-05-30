# Private Sandbox

Optimize operational cost to hit a target. The Packaging Department Head describes
operational improvements in plain language; the AI classifies each one, computes its
financial impact with a **deterministic formula engine**, and turns it into a
**building block** tracked against the yearly target until the gap closes.

Google ADK + Gemini agent (AG-UI) ⇄ Next.js + CopilotKit frontend.

## Run

1. Install: `npm install` (also runs `uv sync` for the Python agent).
2. Start both processes: `npm run dev`
   - UI → http://localhost:3000
   - Agent → http://localhost:8000

## Applying changes while running

- **Frontend** (`src/`): Next.js hot-reloads automatically — save the file and the
  browser updates. No restart needed.
- **Agent** (`agent/`): uvicorn watches the `agent/` folder (`reload=True` in
  `agent/main.py`), so editing the agent prompt or logic (`main.py`, `formula_engine.py`)
  and saving restarts the server automatically. Refresh the browser to start a new chat
  session against the updated agent.
  - If you ever need a manual restart: stop `npm run dev` (Ctrl+C) and start it again, or
    restart only the agent with `npm run dev:agent`.

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
