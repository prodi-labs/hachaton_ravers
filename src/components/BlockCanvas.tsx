"use client";

import { useFrontendTool } from "@copilotkit/react-core/v2";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { z } from "zod";

type Block = { id: string; label: string };

const addBlockSchema = z.object({
  label: z.string().optional(),
});

export function BlockCanvas() {
  const [blocks, setBlocks] = useState<Block[]>([]);

  useFrontendTool({
    name: "addBlock",
    description:
      "Add one new block to the canvas. Call this exactly once whenever the user says the word 'block'.",
    parameters: addBlockSchema,
    handler: async ({ label }) => {
      setBlocks((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          label: label || `Block ${prev.length + 1}`,
        },
      ]);
    },
  });

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 p-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-semibold text-gray-800">Canvas</h1>
        <span className="text-sm font-medium text-gray-500 bg-white border border-gray-200 rounded-full px-4 py-1 shadow-sm">
          Blocks: {blocks.length}
        </span>
      </div>

      {blocks.length === 0 && (
        <p className="text-sm text-gray-400 text-center mt-16">
          Say &ldquo;block&rdquo; in the chat to add one&hellip;
        </p>
      )}

      <div className="grid gap-3 max-w-2xl">
        <AnimatePresence>
          {blocks.map((b) => (
            <motion.div
              key={b.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm text-gray-800 font-medium"
            >
              {b.label}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
