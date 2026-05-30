"use client";

import { useSandbox } from "@/lib/sandboxStore";
import { formatEuro } from "@/lib/types";

export function TargetTracker() {
  const { target, planned, gap } = useSandbox();

  // Progress toward the (negative) target, clamped 0–100%.
  const progress = target === 0 ? 0 : Math.min(100, Math.max(0, (planned / target) * 100));

  return (
    <div className="border-b border-gray-200 bg-white px-8 py-5">
      <div className="flex items-end justify-between gap-8">
        <Stat label="Target" value={formatEuro(target)} tone="text-gray-800" />
        <Stat label="Planned" value={formatEuro(planned)} tone="text-emerald-600" />
        <Stat label="Gap remaining" value={formatEuro(gap)} tone="text-gray-800" />
      </div>
      <div className="mt-4 h-2 w-full overflow-hidden rounded-full bg-gray-100">
        <div
          className="h-full rounded-full bg-emerald-500 transition-all duration-500"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}

function Stat({ label, value, tone }: { label: string; value: string; tone: string }) {
  return (
    <div>
      <p className="text-xs uppercase tracking-wide text-gray-400">{label}</p>
      <p className={`text-2xl font-semibold ${tone}`}>{value}</p>
    </div>
  );
}
