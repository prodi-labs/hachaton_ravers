"use client";

import { BlockCanvas } from "@/components/BlockCanvas";
import { ConstructionPanel } from "@/components/ConstructionPanel";
import { SandboxTools } from "@/components/SandboxTools";
import { TargetTracker } from "@/components/TargetTracker";
import { SandboxProvider } from "@/lib/sandboxStore";
import { CopilotSidebar } from "@copilotkit/react-core/v2";

export default function Page() {
  return (
    <SandboxProvider>
      <SandboxTools />
      <main className="flex h-screen flex-col">
        <TargetTracker />
        <div className="flex min-h-0 flex-1">
          <BlockCanvas />
          <ConstructionPanel />
        </div>
      </main>
      <CopilotSidebar
        defaultOpen={true}
        labels={{
          modalHeaderTitle: "Sandbox Assistant",
        }}
        input={{ showDisclaimer: false }}
      />
    </SandboxProvider>
  );
}
