"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useSandbox } from "@/lib/sandboxStore";
import { formatEuro, type BuildingBlock } from "@/lib/types";

function CalculatingCard() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm"
    >
      <div className="animate-pulse space-y-3">
        <div className="h-4 w-40 rounded bg-gray-200" />
        <div className="h-3 w-24 rounded bg-gray-100" />
        <div className="h-3 w-full rounded bg-gray-100" />
        <div className="h-3 w-2/3 rounded bg-gray-100" />
      </div>
      <p className="mt-3 text-xs font-medium text-gray-400">Calculating impact…</p>
    </motion.div>
  );
}

function BlockCard({
  block,
  onConfirm,
}: {
  block: BuildingBlock;
  onConfirm: (id: string) => void;
}) {
  const pending = block.status === "pending";
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
      className={`rounded-xl border p-5 shadow-sm transition-colors ${
        pending
          ? "border-dashed border-gray-300 bg-gray-50 opacity-70"
          : "border-emerald-200 bg-white"
      }`}
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-base font-semibold text-gray-800">{block.initiative}</h3>
          <p className="text-sm text-gray-500">{block.input}</p>
        </div>
        <span
          className={`shrink-0 rounded-full px-3 py-1 text-xs font-medium ${
            pending ? "bg-gray-200 text-gray-600" : "bg-emerald-100 text-emerald-700"
          }`}
        >
          {pending ? "Pending" : "Active"}
        </span>
      </div>

      <ol className="mt-4 space-y-1.5">
        {block.causalChain.map((step, i) => (
          <li key={i} className="flex gap-2 text-sm text-gray-600">
            <span className="text-gray-400">{i + 1}.</span>
            <span>{step}</span>
          </li>
        ))}
      </ol>

      {block.assumptions.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-1.5">
          {block.assumptions.map((a) => (
            <span
              key={a.name}
              className="rounded bg-gray-100 px-2 py-0.5 text-xs text-gray-500"
              title={a.name}
            >
              {a.name.replace(/_/g, " ")}: {a.value.toLocaleString()} {a.unit}
            </span>
          ))}
        </div>
      )}

      <div className="mt-4 flex items-center justify-between">
        <div>
          <span className="text-xs text-gray-400">Calculated saving</span>
          <p className="text-xl font-semibold text-emerald-600">{formatEuro(block.saving)}</p>
        </div>
        {pending && (
          <button
            onClick={() => onConfirm(block.id)}
            className="rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-gray-700"
          >
            Use Initiative
          </button>
        )}
      </div>
    </motion.div>
  );
}

export function BlockCanvas() {
  const { blocks, calculating, confirmBlock } = useSandbox();
  const empty = blocks.length === 0 && !calculating;

  return (
    <div className="flex flex-1 flex-col overflow-y-auto bg-gray-50 p-8">
      <h2 className="mb-6 text-lg font-semibold text-gray-700">Building Blocks</h2>

      {empty && (
        <p className="mt-16 text-center text-sm text-gray-400">
          Describe an operational improvement in the chat to create your first building block…
        </p>
      )}

      <div className="grid max-w-2xl gap-4">
        <AnimatePresence>
          {blocks.map((b) => (
            <BlockCard key={b.id} block={b} onConfirm={confirmBlock} />
          ))}
          {calculating && <CalculatingCard key="calculating" />}
        </AnimatePresence>
      </div>
    </div>
  );
}
