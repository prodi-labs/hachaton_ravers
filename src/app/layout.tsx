import type { Metadata } from "next";

import { CopilotKit } from "@copilotkit/react-core/v2";
import { HideCopilotBanner } from "@/components/HideCopilotBanner";
import "./globals.css";
import "@copilotkit/react-core/v2/styles.css";

export const metadata: Metadata = {
  title: "Block Canvas",
  description: 'A chat where saying "block" adds a block to the canvas.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={"antialiased"}>
        <CopilotKit runtimeUrl="/api/copilotkit" agent="my_agent" enableInspector={false}>
          {children}
        </CopilotKit>
        <HideCopilotBanner />
      </body>
    </html>
  );
}
