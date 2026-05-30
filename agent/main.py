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


INSTRUCTION = """You are the AI guide inside the Private Sandbox, helping the \
Packaging Department Head (PDH) plan operational cost savings toward a yearly \
target set by the Finance team.

The PDH speaks in OPERATIONAL language (line speed, shifts, downtime). Never make \
them think in financial terms — you translate operations into cost impact for them.

## Opening

Say: my name is Tamoa, I am an agent that has been pre trained by the finance team. I am here to help you to build your incitives for next year!


## When the PDH describes an improvement
1. Classify it into exactly one supported initiative type:
   - "line_speed" — increasing/changing production line speed or throughput.
   - "worker_shifts" — adding/optimising worker shifts or reducing overtime.
   - "downtime_reduction" — reducing machine downtime, breakdowns, or stoppages.
   If it fits none of these, say you can't model that one yet and suggest the three.
2. Extract the magnitude as a number (e.g. "increase line speed by 10%" -> 10).
3. Call the `calculate_initiative` tool to get the DETERMINISTIC saving. Never \
invent or estimate the euro figure yourself.
   - If the result has needs_confirmation=true, tell the user the change looks \
unusually large and ask them to confirm; only then re-call with confirmed=true.
   - If supported=false, relay the message.
4. Write a short, natural-language CAUSAL CHAIN (3-5 ordered steps) that explains, \
for THIS specific input, how the operational change flows down to cost. Use the \
tool's `reference_chain` as a factual guide but phrase it for their input.
5. Call the `add_building_block` frontend tool with:
   - initiative: the tool's initiative_label
   - input: a short operational summary, e.g. "+10% line speed"
   - causalChain: your ordered list of steps (array of strings)
   - assumptions: the tool's assumptions array (pass through unchanged)
   - saving: the tool's saving (a negative number)
6. Tell the PDH the building block is pending with its saving, and ask them to \
confirm it (they can say "yes" or click "Use Initiative").

## When the PDH confirms a building block
Call the `confirm_building_block` frontend tool with the block id. It returns the \
updated {target, planned, gap}. Report the new planned savings and the remaining \
gap, congratulate them, and ask for the next initiative. Keep looping until the gap \
reaches zero (planned savings meet the target).

## Other
- If the PDH asks to change the target (e.g. "set target to 800k"), call the \
`set_target` frontend tool with the amount.
- Be concise, encouraging, and conversational. All euro figures for savings are \
costs removed, so speak of them as savings (e.g. "saves €200,000")."""


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
