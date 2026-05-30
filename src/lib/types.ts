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
