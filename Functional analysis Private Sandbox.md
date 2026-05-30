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

| Actor | Description |
|---|---|
| **FP&A** | Financial Planning & Analysis team — sets targets at department level |
| **PDH** | Packaging Department Head — works in the sandbox to plan cost savings |
| **AI Chat** | Conversational interface inside the sandbox — guides the PDH through the flow |
| **Formula Engine** | Backend engine — translates operational inputs into financial outputs in real-time |

---

### Step 1 — FP&A Sets a Yearly Target

- FP&A sets a yearly cost reduction target for the Packaging Department (e.g. "Cut €500K in costs").
- The system sends a notification to the Packaging Department Head via the chat interface inside the sandbox.

> **AI Chat → PDH:**
> *"Your yearly cost target has been set by FP&A: reduce operational costs by €500,000. Shall we start creating an initiative to work towards this target?"*

---

### Step 2 — PDH Starts an Initiative

- PDH responds affirmatively (e.g. "Yes, let's create an initiative").

> **AI Chat → PDH:**
> *"Great! Let's fill in the inputs for this initiative. What improvement are you planning to make? Feel free to describe it in your own words."*

- PDH responds in operational language (not financial language):
  e.g. *"We would increase the line speed by 10%."*

**Key design note:** The PDH speaks in their own domain language (line speed, shift patterns, throughput, etc.). The system is responsible for translating this into financial impact — the PDH is never asked to think in cost terms at this stage.

---

### Step 3 — AI Interprets the Input & Generates a Building Block

Upon receiving the PDH's input, the AI:

1. **Classifies the initiative** — assigns a label to the type of improvement (e.g. *"Increase Line Speed"*).
2. **Generates a causal chain** — a logical chain of effects that translates the operational input into a financial outcome. Example:
   > *Higher line speed → higher throughput → less machine runtime → lower energy cost + lower labour cost*
3. **Identifies relevant assumptions** — values required for the financial calculation (e.g. energy price per kWh, production volume, labour rate). These are pre-populated from a reference data source. The PDH may override them, but this is not required for the Hackathon.
4. **Triggers the Formula Engine** — the backend formula engine calculates the financial output in real-time based on the causal chain and the assumption values. This is a deterministic calculation, not an AI estimate.

> **AI Chat → PDH:**
> *"Great idea! The building block is being created."*

---

### Step 4 — Building Block Appears in the UI (Pending State)

- A **Building Block card** appears on the left-hand panel of the screen in a **grayed-out / pending state**.
- The card displays:
  - **Initiative:** Increase Line Speed
  - **Input:** +10% line speed
  - **Causal chain:** Higher throughput → less machine runtime → lower energy & labour cost
  - **Assumptions:** [pre-populated, e.g. energy price, volume]
  - **Calculated output:** −€200,000 (cost saved)
  - **Status:** Pending confirmation
  - **CTA button:** `Use Initiative`

> **AI Chat → PDH:**
> *"Your building block has been created with a calculated saving of €200,000. Would you like to confirm it and add it to your plan?"*

---

### Step 5 — PDH Confirms the Building Block

- PDH clicks **`Use Initiative`** or confirms via chat (e.g. *"Yes"*).
- The building block transitions from **grayed-out** to **active** in the left-hand panel.
- The building block is now added to the department's planned savings within the sandbox.
- The **sandbox target tracker** updates:

| | Amount |
|---|---|
| **Target** | −€500,000 |
| **Planned (confirmed building blocks)** | −€200,000 |
| **Gap remaining** | −€300,000 |

---

### Step 6 — AI Prompts the Next Initiative (Gap Loop)

- The chat automatically surfaces the remaining gap and prompts the PDH to continue.

> **AI Chat → PDH:**
> *"Great, your building block has been confirmed! As you can see, the gap is still €300,000. Do you have another initiative in mind, or shall we create one together?"*

- The PDH can now describe another operational improvement (e.g. *"We could increase worker shifts"*), and the flow repeats from **Step 2** with a new building block.
- This loop continues until either:
  - The gap is fully closed (planned savings ≥ target), or
  - The PDH chooses to stop and revisit later.

---

### Summary Flow Diagram

```
FP&A sets target (€500K)
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
