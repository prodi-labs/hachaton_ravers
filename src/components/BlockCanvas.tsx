"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
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

function Chevron({ open }: { open: boolean }) {
  return (
    <svg
      className={`h-5 w-5 shrink-0 text-gray-400 transition-transform duration-200 ${
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

function BlockCard({
  block,
  onConfirm,
}: {
  block: BuildingBlock;
  onConfirm: (id: string) => void;
}) {
  const pending = block.status === "pending";
  const [open, setOpen] = useState(false);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
      className={`overflow-hidden rounded-xl border shadow-sm transition-colors ${
        pending ? "border-dashed border-gray-300 bg-gray-50" : "border-emerald-200 bg-white"
      }`}
    >
      {/* Always-visible summary header (click to expand/collapse) */}
      <div
        role="button"
        tabIndex={0}
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            setOpen((v) => !v);
          }
        }}
        className="flex w-full cursor-pointer items-center gap-3 px-5 py-4 text-left"
      >
        <div className="min-w-0 flex-1">
          <h3 className="truncate text-base font-semibold text-gray-800">{block.initiative}</h3>
          <p className="truncate text-sm text-gray-500">{block.input}</p>
        </div>
        <div className="flex shrink-0 items-center gap-3">
          <span
            className={`rounded-full px-3 py-1 text-xs font-medium ${
              pending ? "bg-gray-200 text-gray-600" : "bg-emerald-100 text-emerald-700"
            }`}
          >
            {pending ? "Pending" : "Active"}
          </span>
          {pending && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onConfirm(block.id);
              }}
              className="rounded-lg bg-gray-900 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-gray-700"
            >
              Use Initiative
            </button>
          )}
          <span className="text-lg font-semibold text-emerald-600">{formatEuro(block.saving)}</span>
          <Chevron open={open} />
        </div>
      </div>

      {/* Expanded detail */}
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
            <div className="space-y-5 border-t border-gray-200 px-5 py-4">
              {/* How it works → outcome */}
              <section>
                <h4 className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-400">
                  How it works
                </h4>
                <ol className="space-y-1.5">
                  {block.causalChain.map((step, i) => (
                    <li key={i} className="flex gap-2 text-sm text-gray-600">
                      <span className="text-gray-400">{i + 1}.</span>
                      <span>{step}</span>
                    </li>
                  ))}
                </ol>
                <div className="mt-3 flex items-center justify-between rounded-lg bg-emerald-50 px-3 py-2">
                  <span className="text-sm font-medium text-emerald-800">Outcome — cost saving</span>
                  <span className="text-base font-semibold text-emerald-700">
                    {formatEuro(block.saving)}
                  </span>
                </div>
              </section>

              {/* Assumptions */}
              {block.assumptions.length > 0 && (
                <section>
                  <h4 className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-400">
                    Based on assumptions
                  </h4>
                  <dl className="grid gap-x-6 gap-y-1.5 sm:grid-cols-2">
                    {block.assumptions.map((a) => (
                      <div key={a.name} className="flex items-baseline justify-between gap-2">
                        <dt className="text-sm capitalize text-gray-500">
                          {a.name.replace(/_/g, " ")}
                        </dt>
                        <dd className="text-sm font-medium text-gray-700">
                          {a.value.toLocaleString()} {a.unit}
                        </dd>
                      </div>
                    ))}
                  </dl>
                </section>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export function BlockCanvas() {
  const { blocks, calculating, confirmBlock } = useSandbox();
  const empty = blocks.length === 0 && !calculating;

  return (
    <div className="flex min-w-0 flex-1 flex-col overflow-y-auto bg-gray-50 p-8">
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
