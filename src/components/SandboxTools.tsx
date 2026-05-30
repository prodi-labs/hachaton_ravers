"use client";

import { useFrontendTool } from "@copilotkit/react-core/v2";
import { z } from "zod";
import { useSandbox } from "@/lib/sandboxStore";
import { formatEuro } from "@/lib/types";

const assumptionSchema = z.object({
  name: z.string(),
  value: z.number(),
  unit: z.string(),
});

const addBlockSchema = z.object({
  initiative: z.string().describe("The classified initiative label, e.g. 'Increase Line Speed'"),
  input: z.string().describe("Short operational summary, e.g. '+10% line speed'"),
  causalChain: z
    .array(z.string())
    .describe("Ordered natural-language steps from operational change to cost impact"),
  assumptions: z.array(assumptionSchema).describe("Assumptions used (pass through from calculate_initiative)"),
  saving: z.number().describe("Deterministic saving from the engine (a negative number)"),
});

const confirmSchema = z.object({
  id: z.string().describe("The id of the pending building block to confirm"),
});

const setTargetSchema = z.object({
  amount: z.number().describe("New yearly target amount in euros, e.g. 800000"),
});

/** Registers the sandbox frontend tools. Renders nothing. */
export function SandboxTools() {
  const { addBlock, confirmBlock, setTargetAmount } = useSandbox();

  useFrontendTool({
    name: "add_building_block",
    description:
      "Create a pending building block on the canvas from a costed initiative. Call after calculate_initiative returns a saving.",
    parameters: addBlockSchema,
    handler: async (args) => {
      const id = await addBlock(args);
      return `Created a pending building block (id "${id}") for "${args.initiative}" saving ${formatEuro(
        args.saving,
      )}. Ask the user to confirm it.`;
    },
  });

  useFrontendTool({
    name: "confirm_building_block",
    description:
      "Confirm a pending building block, adding its saving to the plan. Returns the updated target, planned savings, and remaining gap.",
    parameters: confirmSchema,
    handler: async ({ id }) => {
      const { target, planned, gap } = confirmBlock(id);
      return `Confirmed. Target ${formatEuro(target)}, planned ${formatEuro(
        planned,
      )}, remaining gap ${formatEuro(gap)}.`;
    },
  });

  useFrontendTool({
    name: "set_target",
    description: "Override the yearly cost-reduction target.",
    parameters: setTargetSchema,
    handler: async ({ amount }) => {
      const { target, planned, gap } = setTargetAmount(amount);
      return `Target set to ${formatEuro(target)}. Planned ${formatEuro(
        planned,
      )}, remaining gap ${formatEuro(gap)}.`;
    },
  });

  return null;
}
