"""Private Sandbox Agent — guides the Packaging Dept Head (PDH) through turning
operational improvements into deterministically-costed building blocks that close
a yearly cost-reduction target."""

from __future__ import annotations

import os

from ag_ui_adk import ADKAgent, AGUIToolset, add_adk_fastapi_endpoint
from dotenv import load_dotenv
from fastapi import FastAPI
from google.adk.agents import LlmAgent
from google.adk.apps import App, ResumabilityConfig

from formula_engine import calculate

load_dotenv()


def calculate_initiative(
    initiative_type: str,
    magnitude_pct: float,
    confirmed: bool = False,
) -> dict:
    """Deterministically compute the financial impact of an operational initiative.

    Always call this to get the euro saving — never estimate the number yourself.

    Args:
        initiative_type: one of 'line_speed', 'worker_shifts', 'downtime_reduction'.
        magnitude_pct: size of the change as a number, e.g. 10 for "+10%".
        confirmed: set True only after the user has confirmed an unusually large
            (>50%) change.

    Returns:
        A dict with the deterministic 'saving' (signed negative euros = cost saved),
        the 'assumptions' used, a 'reference_chain' to ground your wording, and the
        'initiative_label'. If 'supported' is False or 'needs_confirmation' is True,
        relay the 'message' to the user instead of creating a block.
    """
    return calculate(initiative_type, magnitude_pct, confirmed)


INSTRUCTION = """You are Tamoa, an AI agent pre-trained by the Finance team. You help Tom, the Packaging Department Head, turn an operational improvement into a costed "building block" toward Finance's yearly target of reducing operational cost by EUR 500,000.

# DEMO CONSTRAINTS — READ CAREFULLY
- This build models ONLY ONE initiative: increasing the packaging line speed. If Tom asks for anything else (worker shifts, downtime, etc.), briefly say this sandbox build currently only models the line-speed initiative, and steer him back to it.
- You NEVER calculate or invent numbers. Use ONLY the exact figures written in the script below.
- The right-hand "Block Construction" panel is driven entirely by the `update_block_construction` tool. At each beat you MUST call it with the correct `step` so the UI updates. Use these step ids strictly in order: speed_spike, resonance_risk, stable_increase, lock_in.
- Do NOT call `calculate_initiative` or `add_building_block` in this demo. The final building block is created automatically by the `lock_in` step.
- Keep each message short (1-4 sentences), warm and conversational. You may lightly rephrase the suggested wording, but keep ALL numbers, percentages and named risks EXACTLY.

# OPENING (your first message)
"Hi Tom — I'm Tamoa, pre-trained by the Finance team. They've set a target to cut EUR 500,000 from packaging's operational cost next year, and the biggest lever I see is line speed. Want to model an increase together?"

# SCRIPTED COLLABORATION (follow in order)
For each beat: reply to Tom, then call `update_block_construction` with the listed step(s). Then wait for Tom's next message.

## Beat 1 — Tom agrees to start / asks to increase line speed
Reply: "Modeling a 30% utilization increase now (to 80%). It's a huge lever—nearly hitting our entire target—and looks feasible given the design limits."
Then call: update_block_construction(step="speed_spike")

## Beat 2 — Tom warns 1,300 u/h is risky (fire history / resonance)
Reply: "Floor reality comes first—that resonance risk is critical. Given the equipment state, how much of a utilization increase do you think is safe?"
Then call: update_block_construction(step="resonance_risk")

## Beat 3 — Tom says 10% (or "not much", etc.)
Reply: "Modeling a stable 10% increase (to 60%) now. It keeps us in the safe zone while still delivering solid savings. Ready to lock this in?"
Then call: update_block_construction(step="stable_increase")

## Beat 4 — Tom says to lock it in / "yes"
Reply: "Locked in. That's a safe +10% and a great start toward our target."
Then call: update_block_construction(step="lock_in")

# AFTER LOCK-IN
If Tom wants to run it again, call `reset_construction`. Otherwise remind him this build only models the line-speed initiative."""


sandbox_agent = LlmAgent(
    name="SandboxAgent",
    model="gemini-2.5-flash",
    instruction=INSTRUCTION,
    # calculate_initiative runs on the backend (deterministic engine);
    # AGUIToolset forwards the frontend tools (add_building_block, etc.).
    tools=[calculate_initiative, AGUIToolset()],
)

# Resumability is required for client-side (long-running) frontend tools: ADK
# pauses after emitting the tool call and persists it so the frontend result can
# be matched to the original call.
sandbox_app = App(
    name="private_sandbox",
    root_agent=sandbox_agent,
    resumability_config=ResumabilityConfig(is_resumable=True),
)

adk_agent = ADKAgent.from_app(
    sandbox_app,
    user_id="demo_user",
    session_timeout_seconds=3600,
    use_in_memory_services=True,
)

app = FastAPI(title="Private Sandbox Agent")

add_adk_fastapi_endpoint(app, adk_agent, path="/")


@app.get("/health")
async def health():
    return {"status": "ok"}


if __name__ == "__main__":
    import uvicorn

    if not os.getenv("GOOGLE_API_KEY"):
        print("Warning: GOOGLE_API_KEY not set. Get one from aistudio.google.com")

    port = int(os.getenv("PORT", 8000))
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=port,
        reload=True,
        reload_dirs=[os.path.dirname(os.path.abspath(__file__))],
    )
