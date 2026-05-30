export type Assumption = { name: string; value: number; unit: string };

export type BlockStatus = "pending" | "active";

export type BuildingBlock = {
  id: string;
  initiative: string; // classified label, e.g. "Increase Line Speed"
  input: string; // operational summary, e.g. "+10% line speed"
  causalChain: string[]; // ordered, LLM-generated narrative steps
  assumptions: Assumption[];
  saving: number; // SIGNED euros — negative = cost saved
  status: BlockStatus;
};

/** Format a signed euro amount, e.g. -200000 -> "−€200,000", 0 -> "€0". */
export function formatEuro(n: number): string {
  const rounded = Math.round(n);
  const abs = new Intl.NumberFormat("en-IE", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(Math.abs(rounded));
  return rounded < 0 ? `−${abs}` : abs;
}

/* ── Block Construction panel ────────────────────────────────────────────────
   Premade, hardcoded "build trace" that documents how a building block is
   constructed. Used only by the scripted line-speed demo. */

export type ConstructionActor = "tamoa" | "tom";

export type ConstructionPhase =
  | "draft"
  | "validate"
  | "model"
  | "adjust"
  | "finalize";

export type ConstructionLineKind =
  | "input"
  | "source"
  | "model"
  | "result"
  | "constraint"
  | "risk"
  | "adjust"
  | "gate";

export type ConstructionLineStatus = "ok" | "warn" | "error" | "pending";

export type ConstructionLine = {
  kind: ConstructionLineKind;
  label: string;
  value?: string;
  status?: ConstructionLineStatus;
};

/** One beat's worth of trace lines, grouped under a heading in the panel. */
export type ConstructionTraceGroup = {
  stepId: string;
  actor: ConstructionActor;
  title: string;
  lines: ConstructionLine[];
};

export type ConstructionDraftStatus =
  | "drafting"
  | "risk"
  | "modeling"
  | "adjusting"
  | "finalizing"
  | "locked";

/** The live, evolving preview of the block being built. */
export type ConstructionDraft = {
  initiative?: string;
  title: string;
  subtitle?: string;
  /** Signed euros (negative = cost saved); null until the block is costed. */
  savings: number | null;
  utilizationFrom: number;
  utilizationTo: number;
  risk?: string;
  constraint?: string;
  dryingTunnel?: { tempDelta: number; note?: string };
  sensors?: { label: string; roi: string };
  status: ConstructionDraftStatus;
};
