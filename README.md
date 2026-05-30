# Block Canvas

A chat app where saying the word **"block"** makes a new visual block appear on the canvas.

The frontend is Next.js + [CopilotKit](https://copilotkit.ai); the agent is a Python [Google ADK](https://google.github.io/adk-docs/) agent running Gemini, wired to the UI over the AG-UI protocol.

## Setup

1. Install frontend deps (this also runs `uv sync` for the agent via `postinstall`):

   ```bash
   npm install
   ```

2. Get a Google AI API key from [Google AI Studio](https://aistudio.google.com/app/apikey).

3. Copy `.env.example` to `.env` and set your key:

   ```env
   GOOGLE_API_KEY=your-api-key-here
   ```

## Running

```bash
npm run dev
```

This starts both processes:

- **Agent** (Python ADK + Gemini) → `http://localhost:8000`
- **UI** (Next.js) → `http://localhost:3000`

Open `http://localhost:3000` and type a message containing "block".

## Structure

- `src/app/page.tsx` — chat sidebar + canvas.
- `src/components/BlockCanvas.tsx` — holds the blocks in React state; defines the `addBlock` frontend tool the agent calls.
- `src/app/api/copilotkit/[[...slug]]/route.ts` — CopilotKit runtime proxying to the agent.
- `agent/main.py` — the ADK agent and its instructions.
