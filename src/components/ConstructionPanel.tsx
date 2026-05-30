"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useSandbox } from "@/lib/sandboxStore";
import { formatEuro } from "@/lib/types";
import type {
  ConstructionActor,
  ConstructionDraft,
  ConstructionDraftStatus,
  ConstructionLine,
  ConstructionLineKind,
  ConstructionPhase,
  ConstructionTraceGroup,
} from "@/lib/types";

const TARGET_ABS = 500_000; // scale for the savings gauge

const PHASE_LABEL: Record<ConstructionPhase, string> = {
  draft: "Drafting",
  validate: "Validating",
  model: "Modeling",
  adjust: "Adjusting",
  finalize: "Finalizing",
};

const KIND_LABEL: Record<ConstructionLineKind, string> = {
  input: "INPUT",
  source: "SOURCE",
  model: "MODEL",
  result: "RESULT",
  constraint: "CONSTRAINT",
  risk: "RISK",
  adjust: "ADJUST",
  gate: "GATE",
};

const KIND_TAG_CLASS: Record<ConstructionLineKind, string> = {
  input: "bg-gray-100 text-gray-500",
  source: "bg-gray-100 text-gray-500",
  model: "bg-gray-100 text-gray-500",
  result: "bg-emerald-100 text-emerald-700",
  constraint: "bg-amber-100 text-amber-700",
  risk: "bg-red-100 text-red-600",
  adjust: "bg-orange-100 text-orange-700",
  gate: "bg-indigo-100 text-indigo-600",
};

const STATUS_VALUE_CLASS: Record<string, string> = {
  ok: "text-emerald-600",
  warn: "text-amber-600",
  error: "text-red-600",
  pending: "text-indigo-500",
};

const STATUS_PILL: Record<ConstructionDraftStatus, { label: string; cls: string }> = {
  drafting: { label: "Draft", cls: "bg-gray-100 text-gray-600" },
  risk: { label: "Risk", cls: "bg-red-100 text-red-700" },
  modeling: { label: "Modeling", cls: "bg-indigo-100 text-indigo-700" },
  adjusting: { label: "Adjusting", cls: "bg-amber-100 text-amber-700" },
  finalizing: { label: "Finalizing", cls: "bg-indigo-100 text-indigo-700" },
  locked: { label: "Locked", cls: "bg-emerald-100 text-emerald-700" },
};

export function ConstructionPanel() {
  const { construction } = useSandbox();
  const { started, draft, trace, phase } = construction;
  const scrollRef = useRef<HTMLDivElement>(null);

  // Keep the newest interaction in view (the block summary stays pinned above).
  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
  }, [trace.length]);

  return (
    <aside className="flex min-w-0 flex-[2] flex-col border-l border-gray-200 bg-white">
      <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
        <div>
          <h2 className="text-sm font-semibold text-gray-800">Block Construction</h2>
          <p className="text-xs text-gray-400">How this building block is built</p>
        </div>
        {phase && (
          <span className="shrink-0 rounded-full bg-indigo-50 px-3 py-1 text-xs font-medium text-indigo-600">
            {PHASE_LABEL[phase]}
          </span>
        )}
      </div>

      {!started || !draft ? (
        <div className="flex-1 overflow-y-auto p-6">
          <IdleState />
        </div>
      ) : (
        <>
          {/* Always-visible block summary */}
          <div className="border-b border-gray-100 px-6 py-5">
            <div className="mx-auto max-w-3xl">
              <DraftPreview draft={draft} />
            </div>
          </div>

          {/* Interactions — collapsed by default, open on demand */}
          <div ref={scrollRef} className="flex-1 overflow-y-auto px-6 py-5">
            <div className="mx-auto max-w-3xl">
              <TraceLog trace={trace} />
            </div>
          </div>
        </>
      )}
    </aside>
  );
}

function IdleState() {
  return (
    <div className="flex h-full flex-col items-center justify-center text-center">
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gray-100 text-2xl">
        🛠️
      </div>
      <p className="max-w-[16rem] text-sm text-gray-400">
        As Tamoa builds the line-speed initiative with you, the block summary and each
        construction step appear here.
      </p>
    </div>
  );
}

function DraftPreview({ draft }: { draft: ConstructionDraft }) {
  const savingsPct =
    draft.savings === null ? 0 : Math.min(100, (Math.abs(draft.savings) / TARGET_ABS) * 100);
  const locked = draft.status === "locked";

  return (
    <motion.div
      layout
      className={`rounded-xl border p-5 shadow-sm ${
        locked ? "border-emerald-300 bg-emerald-50/40" : "border-gray-200 bg-white"
      }`}
    >
      <div>
        {draft.initiative && (
          <span className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-indigo-500">
            {draft.initiative}
          </span>
        )}
        <h3 className="text-xl font-semibold leading-snug text-gray-800">{draft.title}</h3>
        {draft.subtitle && <p className="mt-1 text-sm text-gray-500">{draft.subtitle}</p>}
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <StatusPill status={draft.status} />
        </div>
      </div>

      <div className="mt-5 grid gap-5 sm:grid-cols-2">
        <div>
          <div className="flex items-baseline justify-between">
            <span className="text-xs uppercase tracking-wide text-gray-400">Annual savings</span>
            <span className="text-2xl font-semibold text-emerald-600">
              <AnimatedEuro value={draft.savings} />
            </span>
          </div>
          <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-gray-100">
            <div
              className="h-full rounded-full bg-emerald-500 transition-all duration-700"
              style={{ width: `${savingsPct}%` }}
            />
          </div>
          <p className="mt-1 text-[11px] text-gray-400">of €500,000 target</p>
        </div>

        <div>
          <div className="flex items-baseline justify-between">
            <span className="text-xs uppercase tracking-wide text-gray-400">
              Design-limit utilization
            </span>
            <span className="text-sm font-medium text-gray-600">
              {draft.utilizationFrom}% → {draft.utilizationTo}%
            </span>
          </div>
          <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-gray-100">
            <div
              className="h-full rounded-full bg-indigo-400 transition-all duration-700"
              style={{ width: `${draft.utilizationTo}%` }}
            />
          </div>
        </div>
      </div>

      <AnimatePresence initial={false}>
        {draft.risk && <Banner key="risk" tone="risk" text={draft.risk} />}
        {draft.constraint && <Banner key="constraint" tone="constraint" text={draft.constraint} />}
        {draft.dryingTunnel && (
          <DryingTunnel
            key="drying"
            tempDelta={draft.dryingTunnel.tempDelta}
            note={draft.dryingTunnel.note}
          />
        )}
        {draft.sensors && (
          <SensorChip key="sensors" label={draft.sensors.label} roi={draft.sensors.roi} />
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function StatusPill({ status }: { status: ConstructionDraftStatus }) {
  const m = STATUS_PILL[status];
  return (
    <span className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-medium ${m.cls}`}>
      {m.label}
    </span>
  );
}

function Banner({ tone, text }: { tone: "risk" | "constraint"; text: string }) {
  const cls =
    tone === "risk"
      ? "border-red-200 bg-red-50 text-red-700"
      : "border-amber-200 bg-amber-50 text-amber-800";
  const label = tone === "risk" ? "Risk" : "Constraint";
  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "auto" }}
      exit={{ opacity: 0, height: 0 }}
      className="overflow-hidden"
    >
      <div className={`mt-3 flex items-start gap-2 rounded-lg border px-3 py-2 text-xs ${cls}`}>
        <span className="font-semibold">{label}:</span>
        <span>{text}</span>
      </div>
    </motion.div>
  );
}

function DryingTunnel({ tempDelta, note }: { tempDelta: number; note?: string }) {
  const pct = Math.min(100, (tempDelta / 20) * 100); // 0…+20 °C scale
  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "auto" }}
      exit={{ opacity: 0, height: 0 }}
      className="overflow-hidden"
    >
      <div className="mt-3 rounded-lg border border-gray-200 bg-gray-50 px-3 py-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-gray-700">Drying Tunnel</span>
          <span className="text-xs font-medium text-gray-500">+{tempDelta} °C</span>
        </div>
        <div className="relative mt-2 h-1.5 w-full rounded-full bg-gray-200">
          <div
            className="absolute left-0 top-0 h-full rounded-full bg-orange-400 transition-all duration-700"
            style={{ width: `${pct}%` }}
          />
          <div
            className="absolute top-1/2 h-3.5 w-3.5 -translate-y-1/2 rounded-full border-2 border-orange-400 bg-white shadow transition-all duration-700"
            style={{ left: `calc(${pct}% - 7px)` }}
          />
        </div>
        {note && <p className="mt-2 text-[11px] text-gray-500">{note}</p>}
      </div>
    </motion.div>
  );
}

function SensorChip({ label, roi }: { label: string; roi: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "auto" }}
      exit={{ opacity: 0, height: 0 }}
      className="overflow-hidden"
    >
      <div className="mt-3 rounded-lg border border-indigo-200 bg-indigo-50 px-3 py-2">
        <p className="text-xs font-semibold text-indigo-700">{label}</p>
        <p className="mt-0.5 text-[11px] text-indigo-600">{roi}</p>
      </div>
    </motion.div>
  );
}

function TraceLog({ trace }: { trace: ConstructionTraceGroup[] }) {
  return (
    <div>
      <h4 className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-400">
        Construction steps
      </h4>
      <div className="space-y-2">
        {trace.map((group) => (
          <TraceGroupRow key={group.stepId} group={group} />
        ))}
      </div>
    </div>
  );
}

function TraceGroupRow({ group }: { group: ConstructionTraceGroup }) {
  const [open, setOpen] = useState(false);
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="overflow-hidden rounded-lg border border-gray-200 bg-white"
    >
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="flex w-full items-center gap-2 px-3 py-2.5 text-left transition-colors hover:bg-gray-50"
      >
        <ActorBadge actor={group.actor} />
        <span className="min-w-0 flex-1 truncate text-sm font-medium text-gray-700">
          {group.title}
        </span>
        <span className="shrink-0 text-[11px] text-gray-400">{group.lines.length} steps</span>
        <Chevron open={open} />
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            key="detail"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="overflow-hidden"
          >
            <div className="space-y-1.5 border-t border-gray-100 px-3 py-2.5">
              {group.lines.map((line, i) => (
                <LineRow key={i} line={line} />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function ActorBadge({ actor }: { actor: ConstructionActor }) {
  return actor === "tamoa" ? (
    <span className="shrink-0 rounded-full bg-indigo-100 px-2 py-0.5 text-[11px] font-semibold text-indigo-700">
      Tamoa
    </span>
  ) : (
    <span className="shrink-0 rounded-full bg-gray-200 px-2 py-0.5 text-[11px] font-semibold text-gray-700">
      Tom
    </span>
  );
}

function LineRow({ line }: { line: ConstructionLine }) {
  const valueClass = line.status ? STATUS_VALUE_CLASS[line.status] : "text-gray-700";
  return (
    <div className="flex items-start justify-between gap-3">
      <div className="flex min-w-0 items-start gap-2">
        <span
          className={`mt-0.5 shrink-0 rounded px-1.5 py-0.5 text-[9px] font-bold tracking-wider ${
            KIND_TAG_CLASS[line.kind]
          }`}
        >
          {KIND_LABEL[line.kind]}
        </span>
        <span className="text-[13px] leading-snug text-gray-700">{line.label}</span>
      </div>
      {line.value && (
        <span className={`shrink-0 font-mono text-[12px] font-semibold ${valueClass}`}>
          {line.value}
        </span>
      )}
    </div>
  );
}

function Chevron({ open }: { open: boolean }) {
  return (
    <svg
      className={`h-4 w-4 shrink-0 text-gray-400 transition-transform duration-200 ${
        open ? "rotate-180" : ""
      }`}
      viewBox="0 0 20 20"
      fill="currentColor"
      aria-hidden
    >
      <path
        fillRule="evenodd"
        d="M5.23 7.21a.75.75 0 0 1 1.06.02L10 11.17l3.71-3.94a.75.75 0 1 1 1.08 1.04l-4.25 4.5a.75.75 0 0 1-1.08 0l-4.25-4.5a.75.75 0 0 1 .02-1.06Z"
        clipRule="evenodd"
      />
    </svg>
  );
}

/** Counts the displayed euro figure from its previous value to the new one. */
function AnimatedEuro({ value }: { value: number | null }) {
  const [display, setDisplay] = useState(0);
  const prevRef = useRef(0);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    if (value === null) return;
    const start = prevRef.current;
    const end = value;
    prevRef.current = end;
    if (start === end) {
      setDisplay(end);
      return;
    }
    const t0 = performance.now();
    const dur = 700;
    const tick = (now: number) => {
      const p = Math.min(1, (now - t0) / dur);
      const eased = 1 - Math.pow(1 - p, 3);
      setDisplay(start + (end - start) * eased);
      if (p < 1) rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [value]);

  if (value === null) return <span>—</span>;
  return <span>{formatEuro(display)}</span>;
}
