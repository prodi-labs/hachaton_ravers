"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
} from "react";
import type { Assumption, BuildingBlock } from "./types";

const SEED_TARGET = -500_000; // signed negative: a cost-reduction target

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
};

const SandboxContext = createContext<SandboxContextValue | null>(null);

const sumActive = (blocks: BuildingBlock[]) =>
  blocks.filter((b) => b.status === "active").reduce((acc, b) => acc + b.saving, 0);

export function SandboxProvider({ children }: { children: React.ReactNode }) {
  const [target, setTarget] = useState<number>(SEED_TARGET);
  const [blocks, setBlocks] = useState<BuildingBlock[]>([]);
  const [calculating, setCalculating] = useState(false);

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
  };

  return <SandboxContext.Provider value={value}>{children}</SandboxContext.Provider>;
}

export function useSandbox(): SandboxContextValue {
  const ctx = useContext(SandboxContext);
  if (!ctx) throw new Error("useSandbox must be used within a SandboxProvider");
  return ctx;
}
