"""Block Canvas Agent — calls addBlock on the frontend whenever the user says 'block'."""

from __future__ import annotations

import os

from ag_ui_adk import ADKAgent, AGUIToolset, add_adk_fastapi_endpoint
from dotenv import load_dotenv
from fastapi import FastAPI
from google.adk.agents import LlmAgent
from google.adk.apps import App, ResumabilityConfig

load_dotenv()

block_agent = LlmAgent(
    name="BlockAgent",
    model="gemini-2.5-flash",
    instruction="""You are a friendly assistant that manages a block canvas.

CRITICAL RULE: Whenever the user's message contains the word "block" (case-insensitive),
you MUST call the addBlock tool exactly once before replying. The label should be a short,
descriptive phrase derived from the context of what the user said (e.g. "Speed Block",
"Conveyor Belt", "Block 1"). If no specific label is implied, use something creative.

After calling the tool, confirm what you added in a short, friendly message.

For all other messages, just chat normally — be helpful and conversational.""",
    # Exposes the frontend tools (e.g. addBlock) forwarded over AG-UI so the
    # model can actually call them instead of just narrating the action.
    tools=[AGUIToolset()],
)

# Resumability is required for client-side (long-running) tools like addBlock:
# ADK pauses after emitting the tool call and persists it, so when the frontend
# returns the result it can be matched to the original call. Without this, the
# block renders but the run errors with "No function call event found".
block_app = App(
    name="block_canvas",
    root_agent=block_agent,
    resumability_config=ResumabilityConfig(is_resumable=True),
)

adk_agent = ADKAgent.from_app(
    block_app,
    user_id="demo_user",
    session_timeout_seconds=3600,
    use_in_memory_services=True,
)

app = FastAPI(title="Block Canvas Agent")

add_adk_fastapi_endpoint(app, adk_agent, path="/")


@app.get("/health")
async def health():
    return {"status": "ok"}


if __name__ == "__main__":
    import uvicorn

    if not os.getenv("GOOGLE_API_KEY"):
        print("Warning: GOOGLE_API_KEY not set. Get one from aistudio.google.com")

    port = int(os.getenv("PORT", 8000))
    uvicorn.run(app, host="0.0.0.0", port=port)
