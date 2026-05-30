# Concrete Demo Requirements

Based on the functional description (Option B - AI-Generated Causal Chain + Hardcoded Formulas), here are the concrete, actionable requirements for the hackathon demo, structured by the application's lifecycle phases:

### 1. Initialization (App Start)
*   **State:** The application must initialize with a hardcoded yearly target of **−€500,000**.
*   **Data Store:** A configuration object must be loaded containing hardcoded assumptions:
    *   `annual_volume`: 10,000,000
    *   `current_speed`: 1,000
    *   `machine_kw`: 500
    *   `energy_price`: 0.15
    *   `workers`: 8
    *   `hourly_rate`: 25
*   **Templates:** The system must load pre-defined initiative templates (e.g., `line_speed`, `worker_shifts`, `downtime_reduction`). Each template must contain its required assumptions and a hardcoded calculation formula.
*   **UI Trigger:** The AI chat must automatically send the first message notifying the user of the €500k target and asking to start an initiative.

### 2. User Interaction & Processing (Creating an Initiative)
*   **Input Handling:** The chat interface must accept free-text operational input from the user (e.g., "increase line speed by 10%").
*   **Intent Matching:** The backend must parse the text to match it to a pre-defined template (e.g., mapping "speed" to the `line_speed` formula).
*   **Value Extraction:** The backend must extract the numerical value/percentage provided by the user.
*   **Guardrails:** If the extracted percentage exceeds a hardcoded threshold (e.g., >50%), the AI must pause the calculation and ask the user for confirmation.
*   **Dynamic Causal Chain (Option B):** The backend MUST trigger an LLM call to generate a dynamic, natural language causal chain description based on the user's specific phrasing. This replaces static template strings.
*   **Calculation Engine:** The backend must calculate the financial impact using the extracted value, the matched template's hardcoded formula, and the hardcoded assumptions.
*   **Formatting Requirement:** The calculated output must always be formatted as a negative number (e.g., −€250,000) to denote cost savings.
*   **UX Delay:** The system must enforce an artificial delay of 1–2 seconds before returning the result to simulate complex processing.

### 3. UI Rendering (Pending State)
*   **AI Chat Update:** The chat must send a message confirming the calculation (e.g., "...calculated saving of €250,000. Would you like to confirm...").
*   **Building Block Card:** A UI card must appear in a side panel in a **pending/grayed-out state**.
*   **Card Data:** The pending card must explicitly display:
    *   Initiative Label (determined via intent matching)
    *   The user's original input (e.g., +10% line speed)
    *   The **AI-generated causal chain** description.
    *   The assumptions used (pre-populated)
    *   The calculated savings
*   **Interactive Element:** The card must contain a CTA button labeled **"Use Initiative"**.

### 4. Confirmation & State Update (Active State)
*   **Confirmation Handlers:** The application must listen for confirmation via either the "Use Initiative" button click OR an affirmative reply in the AI chat ("Yes").
*   **Visual State Change:** Upon confirmation, the building block card must transition from grayed-out to visually active.
*   **Target Tracker Update:** A global UI tracker must immediately recalculate and display:
    *   **Target:** (Static: −€500,000)
    *   **Planned:** (Sum of all active building blocks)
    *   **Gap remaining:** (Target - Planned)

### 5. Loop & Completion
*   **Automatic Prompt:** Immediately after a block is confirmed, if a gap still exists to reach the target, the AI chat must automatically send a message stating the remaining gap and asking for the next initiative.
*   **Completion Condition:** The system must stop prompting for new initiatives once the target is met or exceeded (gap ≤ 0).
