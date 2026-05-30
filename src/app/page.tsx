"use client";

import { BlockCanvas } from "@/components/BlockCanvas";
import { CopilotSidebar } from "@copilotkit/react-core/v2";

export default function Page() {
  return (
    <main className="h-screen">
      <CopilotSidebar
        defaultOpen={true}
        labels={{
          modalHeaderTitle: "Block Chat",
          welcomeMessageText: 'Say "block" and watch the canvas grow!',
        }}
        input={{ showDisclaimer: false }}
      />
      <BlockCanvas />
    </main>
  );
}
