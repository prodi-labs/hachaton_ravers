## Product Description _(for written submission)_

> **Tamoa**
>
> Every year, large companies waste months on the annual budgeting cycle. Executives and finance teams set top-down cost targets in financial KPIs (euros, percentages, margins). Department heads receive those targets and should make a plan against it, but they think in operational terms: bottles per hour, machine downtime, shift patterns. The result is a painful back-and-forth of meetings, spreadsheets, and misaligned assumptions that nobody enjoys and that delays decision-making at a critical time.
>
> We built a conversational digital AI environment that bridges this gap. Connected to a company's ERP data and finance targets, it lets department heads plan cost-reduction initiatives entirely in their own language. They describe what they want to do operationally — "increase line speed by 10%" — and the tool instantly does the complex translation computation into a financial outcome using a pre-built causal chain and real company data. The result is a building block that shows them exactly how much cost they've covered and how far they still are from their target. They keep adding initiatives until the gap is closed — no finance degree required.
>
> This impactful tool doesn't replace the expertise of the department head. It securely captures it, structures it, and speaks finance back to the people who need to hear it.

---

### :dart: Impact — _will this actually change anything for real people?_

**Yes, for two very specific real people: the CFO and the department head.**

The annual budgeting cycle is a known, painful, universal problem in every large company. The bottom-up planning process — where department heads respond to top-down targets — is estimated to take 4-6 months in most corporates, with much of that time spent in translation meetings between finance and operations. We compress a significant part of that into a structured, guided conversation. The impact is measurable: fewer meetings, faster cycle time, better-quality initiatives because the department head is actually thinking through the operational logic rather than guessing at a number.

Brewery angle: the packaging department head can now close their portion of the budget gap in one session, not three weeks.

---

### :lock: Replicability — _what's your defensibility?_

**Three layers of defensibility:**

1. **Domain depth as a moat.** The causal chain templates (the operational → financial translation logic) are built with deep understanding of both FP&A processes and operational domains. A generic LLM cannot produce these reliably. We encode that domain knowledge as structured, auditable logic — that takes time and expertise to replicate.

2. **ERP integration as a lock-in.** Once connected to a company's ERP data (production volumes, labour rates, energy prices), the tool's outputs are specific to that company. A competitor starting from scratch doesn't just need to build the software — they need to re-integrate with every data source.

3. **Why us?** We sit at the intersection of finance process expertise and AI engineering. Most finance tools are built by engineers who don't understand FP&A. Most FP&A consultants can't build AI systems. We have both in the room.

---

### :bulb: Creativity — _does it make you stop and think?_

The insight is simple but non-obvious: **the bottleneck in budgeting isn't both the math, assumptions and the language gap.** Everyone has tried to solve this with better spreadsheets or dashboards. We solved it with a conversation and a standardized environment for all teams. The department head never sees a formula. They never touch a spreadsheet. They just describe what they're going to do, and the tool handles the rest. That's the creative leap.

---

### :sparkles: Vibes — _did they have fun, and does the project radiate it?_

The demo has a clear money shot: the building block appearing live, with a real number, after a natural language input. It's visual, it's satisfying, and it tells the story without needing any explanation. The brewery framing is relatable and concrete — everyone has heard of a brewery, everyone understands "bottles per hour."

---

### :closed*lock_with_key: Security — \_did they handle secrets, auth, and user input like adults?*

Security handled by Aikido - check the report for more details.
