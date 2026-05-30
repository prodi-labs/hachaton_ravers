![[Pasted image 20260530084623.png]]
Problem description:

Private Sandbox: Optimize operational cost to hit the target
Allow

1. Financial modelling - Quantitative - of operational cost
   1. Mathematical relations
   2. Assumptions
2. Natural language - Qualitative
3. Guide
   1. Strategy
   2. Rules/constraints

---

## Customer Journey: Target Setting & Building Block Creation

### Actors

| Actor              | Description                                                                        |
| ------------------ | ---------------------------------------------------------------------------------- |
| **Finance team**   | Financial Planning & Analysis team — sets targets at department level              |
| **PDH**            | Packaging Department Head — works in the sandbox to plan cost savings              |
| **AI Chat**        | Conversational interface inside the sandbox — guides the PDH through the flow      |
| **Formula Engine** | Backend engine — translates operational inputs into financial outputs in real-time |

---

### Step 1 — Finance team Sets a Yearly Target

- Finance team sets a yearly cost reduction target for the Packaging Department (e.g. "Cut €500K in costs").
- The system sends a notification to the Packaging Department Head via the chat interface inside the sandbox.

> **AI Chat → PDH:**
> _"Your yearly cost target has been set by Finance team: reduce operational costs by €500,000. Shall we start creating an initiative to work towards this target?"_

---

### Step 2 — PDH Starts an Initiative

- PDH responds affirmatively (e.g. "Yes, let's create an initiative").

> **AI Chat → PDH:**
> _"Great! Let's fill in the inputs for this initiative. What improvement are you planning to make? Feel free to describe it in your own words."_

- PDH responds in operational language (not financial language):
  e.g. _"We would increase the line speed by 10%."_

**Key design note:** The PDH speaks in their own domain language (line speed, shift patterns, throughput, etc.). The system is responsible for translating this into financial impact — the PDH is never asked to think in cost terms at this stage.

---

### Step 3 — AI Interprets the Input & Generates a Building Block

Upon receiving the PDH's input, the AI:

1. **Classifies the initiative** — assigns a label to the type of improvement (e.g. _"Increase Line Speed"_).
2. **Generates a causal chain** — a logical chain of effects that translates the operational input into a financial outcome. Example:
   > _Higher line speed → higher throughput → less machine runtime → lower energy cost + lower labour cost_
3. **Identifies relevant assumptions** — values required for the financial calculation (e.g. energy price per kWh, production volume, labour rate). These are pre-populated from a reference data source. The PDH may override them, but this is not required for the Hackathon.
4. **Triggers the Formula Engine** — the backend formula engine calculates the financial output in real-time based on the causal chain and the assumption values. This is a deterministic calculation, not an AI estimate.

> **AI Chat → PDH:**
> _"Great idea! The building block is being created."_

---

### Step 3 — Deep Dive: Causal Chain & Assumptions

#### 3.2 — The Causal Chain

**What it is:** A structured sequence of cause-and-effect relationships that connects the operational input given by the PDH (e.g. "+10% line speed") to one or more financial cost drivers (e.g. energy cost, labour cost). Each link in the chain must have a mathematical relationship so the formula engine can compute an output.

**Node structure:**

```
Operational Input → Intermediate Operational Effect(s) → Cost Driver Impact → Financial Outcome
```

**Worked example — _"Increase line speed by 10%"_:**

| #   | Node                                | Node Type              | Formula / Logic                                                          |
| --- | ----------------------------------- | ---------------------- | ------------------------------------------------------------------------ |
| 1   | Line speed +10%                     | **User input**         | Provided by PDH                                                          |
| 2   | Throughput increases proportionally | **Operational effect** | `new_throughput = current_line_speed × 1.10`                             |
| 3   | Annual machine runtime decreases    | **Operational effect** | `runtime_hrs = annual_volume / new_throughput`                           |
| 4   | Energy cost decreases               | **Financial outcome**  | `energy_saving = Δruntime_hrs × machine_power_kw × energy_price_per_kwh` |
| 5   | Labour hours decrease               | **Operational effect** | `labour_hrs_saved = Δruntime_hrs × workers_per_shift`                    |
| 6   | Labour cost decreases               | **Financial outcome**  | `labour_saving = labour_hrs_saved × hourly_rate`                         |

**Total financial output = Energy saving + Labour saving**

> With the hardcoded assumptions below, a +10% line speed gives: €68,182 (energy) + €181,818 (labour) = **−€250,000 in cost**

---

#### 3.3 — Assumptions

Assumptions are the constants the formula engine requires that the PDH does not provide. They are pre-populated from a reference data source. For the hackathon, they are hardcoded.

| Assumption                | Example Value | Unit       | Notes                          |
| ------------------------- | ------------- | ---------- | ------------------------------ |
| Annual production volume  | 10,000,000    | units/year | Fixed for the demo             |
| Current line speed        | 1,000         | units/hour | Baseline before the initiative |
| Machine power consumption | 500           | kW         | Per production line            |
| Energy price              | €0.15         | €/kWh      | Fixed for the demo             |
| Workers per shift         | 8             | FTE        | Assumed constant               |
| Hourly labour rate        | €25           | €/hour     | Blended rate                   |
| Operating hours per year  | 6,000         | hours      | ~3 shifts × 250 days           |

> **Note for devs:** Store assumptions in a single config object (JSON or dict). This makes it easy to swap in real values later without touching the formula logic.

---

#### 3.4 — Hackathon Implementation Options

Three approaches, ordered from simplest to most complex. **Option A is recommended for the hackathon.**

---

##### ⭐ Option A — Fully Hardcoded (Dummy Data) — _Recommended_

**How it works:**

- Pre-define a small set of initiative types (suggest 3 for the demo: `line_speed`, `worker_shifts`, `downtime_reduction`).
- For each type, store a hardcoded causal chain template and formula in a config file (JSON or similar).
- The AI does simple keyword/intent matching on the PDH's input to pick the right template.
- The formula engine plugs in the user's number (e.g. 10%) and the hardcoded assumptions to compute the output.

**Example config structure:**

```json
{
  "line_speed": {
    "label": "Increase Line Speed",
    "causal_chain": [
      "Higher line speed → higher throughput",
      "Higher throughput → less machine runtime",
      "Less machine runtime → lower energy cost",
      "Less machine runtime → fewer labour hours → lower labour cost"
    ],
    "formula": "delta_pct * annual_volume / current_speed * (machine_kw * energy_price + workers * hourly_rate)",
    "assumptions": [
      "annual_volume",
      "current_speed",
      "machine_kw",
      "energy_price",
      "workers",
      "hourly_rate"
    ]
  }
}
```

**Pros:** Fast to build, fully deterministic, easy to demo, zero risk of wrong outputs.
**Cons:** Only works for pre-defined initiative types — anything outside the list won't match.

---

##### Option B — AI-Generated Causal Chain + Hardcoded Formulas

**How it works:**

- The LLM generates the causal chain _description_ in natural language based on the PDH's input — this makes the UI feel dynamic.
- The actual financial formula is still looked up from a hardcoded template (same as Option A), matched by intent classification.
- Assumptions remain hardcoded.

**Pros:** More flexible wording in the UI, handles slight variations in how the PDH describes the initiative, still fully deterministic output.
**Cons:** Requires prompt engineering for the causal chain generation step; adds one LLM call to the flow.

---

---

#### 3.5 — Additional Considerations for the Hackathon

- **Simulating "real-time" calculation:** Add a short artificial delay (1–2 seconds) after the PDH submits their input before showing the building block. This makes the formula engine feel like it's doing real work and improves the demo experience.
- **Causal chain display in the UI:** For Option A/B, the causal chain shown on the building block card is simply the ordered list of strings from the config template — no dynamic generation needed in the UI layer.
- **Negative vs. positive framing:** Cost _savings_ should always be displayed as a negative number (−€200K) to align with how Finance team reads cost reduction. Make sure the formula engine outputs a signed value.
- **Edge case — input outside expected range:** For the hackathon, add a simple guard: if the PDH enters a percentage above a threshold (e.g. >50%), the chat can flag it as unrealistic and ask for confirmation rather than computing silently.

---

### Step 4 — Building Block Appears in the UI (Pending State)

- A **Building Block card** appears on the left-hand panel of the screen in a **grayed-out / pending state**.
- The card displays:
  - **Initiative:** Increase Line Speed
  - **Input:** +10% line speed
  - **Causal chain:** Higher throughput → less machine runtime → lower energy & labour cost
  - **Assumptions:** [pre-populated, e.g. energy price, volume]
  - **Calculated output:** −€250,000 (cost saved)
  - **Status:** Pending confirmation
  - **CTA button:** `Use Initiative`

> **AI Chat → PDH:**
> _"Your building block has been created with a calculated saving of €250,000. Would you like to confirm it and add it to your plan?"_

---

### Step 5 — PDH Confirms the Building Block

- PDH clicks **`Use Initiative`** or confirms via chat (e.g. _"Yes"_).
- The building block transitions from **grayed-out** to **active** in the left-hand panel.
- The building block is now added to the department's planned savings within the sandbox.
- The **sandbox target tracker** updates:

|                                         | Amount    |
| --------------------------------------- | --------- |
| **Target**                              | −€500,000 |
| **Planned (confirmed building blocks)** | −€250,000 |
| **Gap remaining**                       | −€250,000 |

---

### Step 6 — AI Prompts the Next Initiative (Gap Loop)

- The chat automatically surfaces the remaining gap and prompts the PDH to continue.

> **AI Chat → PDH:**
> _"Great, your building block has been confirmed! As you can see, the gap is still €250,000. Do you have another initiative in mind, or shall we create one together?"_

- The PDH can now describe another operational improvement (e.g. _"We could increase worker shifts"_), and the flow repeats from **Step 2** with a new building block.
- This loop continues until either:
  - The gap is fully closed (planned savings ≥ target), or
  - The PDH chooses to stop and revisit later.

---

### Summary Flow Diagram

```
Finance team sets target (€500K)
        ↓
AI Chat notifies PDH + asks to start initiative
        ↓
PDH says yes → AI asks for input
        ↓
PDH describes improvement in operational language
        ↓
AI generates: Initiative label + Causal chain + Assumptions
        ↓
Formula Engine calculates financial output (real-time)
        ↓
Building Block appears (grayed out) on left panel
        ↓
PDH clicks "Use Initiative" → Building Block confirmed (active)
        ↓
Target tracker updates → Gap is surfaced
        ↓
AI prompts next initiative → loop repeats until gap = 0
```
