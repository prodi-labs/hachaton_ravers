"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
} from "react";
import type {
  Assumption,
  BuildingBlock,
  ConstructionDraft,
  ConstructionPhase,
  ConstructionTraceGroup,
} from "./types";
import { LINE_SPEED_FINAL_BLOCK, LINE_SPEED_STEPS } from "./lineSpeedScenario";

const SEED_TARGET = -500_000; // signed negative: a cost-reduction target

export type ConstructionState = {
  started: boolean;
  draft: ConstructionDraft | null;
  trace: ConstructionTraceGroup[];
  phase: ConstructionPhase | null;
  lastStepId: string | null;
};

const BASE_DRAFT: ConstructionDraft = {
  initiative: "Increase Line Speed",
  title: "New Building Block",
  savings: null,
  utilizationFrom: 50,
  utilizationTo: 50,
  status: "drafting",
};

const INITIAL_CONSTRUCTION: ConstructionState = {
  started: false,
  draft: null,
  trace: [],
  phase: null,
  lastStepId: null,
};

export type AddBlockInput = {
  initiative: string;
  input: string;
  causalChain: string[];
  assumptions: Assumption[];
  saving: number;
};

export type Tracker = { target: number; planned: number; gap: number };

type SandboxContextValue = {
  target: number;
  blocks: BuildingBlock[];
  calculating: boolean;
  planned: number;
  gap: number;
  /** Adds a pending block after a short "calculating" delay; resolves with its id. */
  addBlock: (data: AddBlockInput) => Promise<string>;
  /** Flips a block to active; returns the updated tracker. */
  confirmBlock: (id: string) => Tracker;
  /** Overrides the target (stored as a signed-negative amount); returns the tracker. */
  setTargetAmount: (amount: number) => Tracker;
  /** Live state of the Block Construction panel (line-speed demo). */
  construction: ConstructionState;
  /** Loads a premade line-speed construction beat into the panel; returns a status string. */
  playLineSpeedStep: (stepId: string) => string;
  /** Adds + confirms the final premade line-speed block; returns the updated tracker. */
  finalizeLineSpeedBlock: () => Promise<Tracker>;
  /** Clears the construction panel so the demo can be re-run. */
  resetConstruction: () => void;
};

const SandboxContext = createContext<SandboxContextValue | null>(null);

const sumActive = (blocks: BuildingBlock[]) =>
  blocks.filter((b) => b.status === "active").reduce((acc, b) => acc + b.saving, 0);

export function SandboxProvider({ children }: { children: React.ReactNode }) {
  const [target, setTarget] = useState<number>(SEED_TARGET);
  const [blocks, setBlocks] = useState<BuildingBlock[]>([]);
  const [calculating, setCalculating] = useState(false);
  const [construction, setConstruction] = useState<ConstructionState>(INITIAL_CONSTRUCTION);

  // Refs mirror the latest state so tool handlers can compute return values
  // synchronously after a mutation.
  const blocksRef = useRef<BuildingBlock[]>(blocks);
  const targetRef = useRef<number>(target);

  const tracker = useCallback((): Tracker => {
    const planned = sumActive(blocksRef.current);
    return { target: targetRef.current, planned, gap: targetRef.current - planned };
  }, []);

  const addBlock = useCallback(async (data: AddBlockInput): Promise<string> => {
    setCalculating(true);
    // Simulate the formula engine doing real-time work.
    await new Promise((r) => setTimeout(r, 1300));
    const id =
      typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : `block-${Date.now()}`;
    const block: BuildingBlock = { ...data, id, status: "pending" };
    const next = [...blocksRef.current, block];
    blocksRef.current = next;
    setBlocks(next);
    setCalculating(false);
    return id;
  }, []);

  const confirmBlock = useCallback(
    (id: string): Tracker => {
      const next = blocksRef.current.map((b) =>
        b.id === id ? { ...b, status: "active" as const } : b,
      );
      blocksRef.current = next;
      setBlocks(next);
      return tracker();
    },
    [tracker],
  );

  const setTargetAmount = useCallback(
    (amount: number): Tracker => {
      const t = -Math.abs(amount);
      targetRef.current = t;
      setTarget(t);
      return tracker();
    },
    [tracker],
  );

  const playLineSpeedStep = useCallback((stepId: string): string => {
    const step = LINE_SPEED_STEPS.find((s) => s.id === stepId);
    if (!step) return `Unknown construction step "${stepId}".`;
    setConstruction((prev) => {
      const base = prev.draft ?? BASE_DRAFT;
      const draft: ConstructionDraft = { ...base, ...step.draft };
      const alreadyShown = prev.trace.some((g) => g.stepId === step.id);
      const trace: ConstructionTraceGroup[] = alreadyShown
        ? prev.trace
        : [
            ...prev.trace,
            {
              stepId: step.id,
              actor: step.actor,
              title: step.groupTitle,
              lines: step.lines,
            },
          ];
      return { started: true, draft, trace, phase: step.phase, lastStepId: step.id };
    });
    return `Loaded construction step "${stepId}" into the Block Construction panel.`;
  }, []);

  const finalizeLineSpeedBlock = useCallback(async (): Promise<Tracker> => {
    const id = await addBlock(LINE_SPEED_FINAL_BLOCK);
    return confirmBlock(id);
  }, [addBlock, confirmBlock]);

  const resetConstruction = useCallback(() => {
    setConstruction(INITIAL_CONSTRUCTION);
  }, []);

  const planned = useMemo(() => sumActive(blocks), [blocks]);
  const gap = target - planned;

  const value: SandboxContextValue = {
    target,
    blocks,
    calculating,
    planned,
    gap,
    addBlock,
    confirmBlock,
    setTargetAmount,
    construction,
    playLineSpeedStep,
    finalizeLineSpeedBlock,
    resetConstruction,
  };

  return <SandboxContext.Provider value={value}>{children}</SandboxContext.Provider>;
}

export function useSandbox(): SandboxContextValue {
  const ctx = useContext(SandboxContext);
  if (!ctx) throw new Error("useSandbox must be used within a SandboxProvider");
  return ctx;
}
