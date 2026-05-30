"use client";

import { BlockCanvas } from "@/components/BlockCanvas";
import { SandboxTools } from "@/components/SandboxTools";
import { TargetTracker } from "@/components/TargetTracker";
import { SandboxProvider } from "@/lib/sandboxStore";
import { CopilotSidebar } from "@copilotkit/react-core/v2";

export default function Page() {
  return (
    <SandboxProvider>
      <SandboxTools />
      <main className="flex h-screen flex-col">
        <header className="border-b border-gray-200 bg-white px-8 py-4">
          <h1 className="text-xl font-semibold text-gray-900">Private Sandbox</h1>
          <p className="text-sm text-gray-500">Packaging Department — cost optimization</p>
        </header>
        <TargetTracker />
        <BlockCanvas />
      </main>
      <CopilotSidebar
        defaultOpen={true}
        labels={{
          modalHeaderTitle: "Sandbox Assistant",
          welcomeMessageText:
            "Hi! FP&A set your yearly target: cut operational costs by €500,000. Shall we create an initiative to get there?",
        }}
        input={{ showDisclaimer: false }}
      />
    </SandboxProvider>
  );
}
