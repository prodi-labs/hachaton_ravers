/**
 * Premade, fully hardcoded script for the "Increase Line Speed" demo.
 *
 * Nothing here is computed — every number, risk, and constraint is fixed so the
 * agent only has to sequence the beats (via the `update_block_construction`
 * frontend tool) while the UI loads the matching premade state. Mirrors the
 * collaboration in `Line_Speed_Analysis.md`.
 */

import type {
  BuildingBlock,
  ConstructionActor,
  ConstructionDraft,
  ConstructionLine,
  ConstructionPhase,
} from "./types";

export type LineSpeedStep = {
  id: string;
  actor: ConstructionActor;
  phase: ConstructionPhase;
  /** Heading for this beat's group in the construction trace. */
  groupTitle: string;
  /** Partial draft merged into the running block preview (keys set to
   *  `undefined` are cleared). */
  draft: Partial<ConstructionDraft>;
  /** Trace lines appended to the log for this beat. */
  lines: ConstructionLine[];
};

export const LINE_SPEED_STEPS: LineSpeedStep[] = [
  {
    id: "speed_spike",
    actor: "tamoa",
    phase: "draft",
    groupTitle: "Sizing the +30% utilization spike",
    draft: {
      initiative: "Increase Line Speed",
      title: "The +30% Utilization Spike",
      subtitle: "1,000 → 1,600 u/h (+60% speed)",
      savings: -465_900,
      utilizationFrom: 50,
      utilizationTo: 80,
      status: "drafting",
    },
    lines: [
      { kind: "input", label: "Current line speed", value: "1,000 u/h" },
      { kind: "input", label: "Proposed utilization", value: "50% → 80% (+30pts)" },
      { kind: "model", label: "Resulting line speed", value: "1,600 u/h" },
      { kind: "source", label: "Blended labor rate", value: "€174 / hr" },
      { kind: "model", label: "Annual runtime reduced", value: "−2,678 hrs" },
      { kind: "result", label: "Theoretical annual savings", value: "−€465,900", status: "ok" },
      { kind: "result", label: "Design-limit utilization", value: "80%", status: "ok" },
    ],
  },
  {
    id: "resonance_risk",
    actor: "tom",
    phase: "validate",
    groupTitle: "Tom flags a floor-reality risk",
    draft: {
      risk: "Mechanical instability — resonance frequency at the labeling arm (since the fire)",
      status: "risk",
    },
    lines: [
      { kind: "risk", label: "Resonance at labeling arm @ 1,300 u/h", value: "micro-vibrations", status: "error" },
      { kind: "risk", label: "Incident history", value: "Fire 3 months ago", status: "error" },
      { kind: "constraint", label: "Recommended safe increase", value: "+10pts max", status: "warn" },
    ],
  },
  {
    id: "stable_increase",
    actor: "tamoa",
    phase: "model",
    groupTitle: "Modeling the +10% stable increase",
    draft: {
      title: "The +10% Stable Increase",
      subtitle: "Capped at 1,200 u/h — safety-first zone",
      savings: -207_400,
      utilizationTo: 60,
      risk: undefined,
      status: "modeling",
    },
    lines: [
      { kind: "input", label: "Safe utilization increase", value: "+10pts (60% total)" },
      { kind: "model", label: "Adjusted line speed", value: "1,200 u/h" },
      { kind: "source", label: "Blended labor rate", value: "€174 / hr" },
      { kind: "model", label: "Annual runtime reduced", value: "−1,192 hrs" },
      { kind: "result", label: "Projected annual savings", value: "−€207,400", status: "ok" },
      { kind: "result", label: "Design-limit utilization", value: "60%", status: "ok" },
    ],
  },
  {
    id: "lock_in",
    actor: "tamoa",
    phase: "finalize",
    groupTitle: "Locking in Production Efficiency v1.0",
    draft: {
      title: "Production Efficiency v1.0",
      subtitle: "60% utilization · safe zone · −€207,400",
      status: "locked",
    },
    lines: [
      { kind: "result", label: "Utilization increase", value: "+10pts (60%)", status: "ok" },
      { kind: "result", label: "Net annual savings", value: "−€207,400", status: "ok" },
      { kind: "gate", label: "Equipment protected", status: "ok" },
      { kind: "result", label: "Initiative status", value: "Locked", status: "ok" },
    ],
  },
];

/** The premade building block dropped onto the canvas at `lock_in`. */
export const LINE_SPEED_FINAL_BLOCK: Omit<BuildingBlock, "id" | "status"> = {
  initiative: "Increase Line Speed",
  input: "+10pts utilization (1,200 u/h)",
  causalChain: [
    "Run Bottler-X1 at 1,200 u/h (60% utilization) → same volume in less machine runtime",
    "Less runtime → lower energy and labor cost",
    "Stable operations maintained below resonance threshold",
  ],
  assumptions: [
    { name: "current_utilization", value: 50, unit: "%" },
    { name: "target_utilization", value: 60, unit: "%" },
    { name: "blended_labor_rate", value: 174, unit: "€/hour" },
  ],
  saving: -207_400,
};
