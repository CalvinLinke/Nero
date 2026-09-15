import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["@react-pdf/renderer", "@electric-sql/pglite"],
  // Next 16 würde sonst bei jedem Start eine CLAUDE.md erzeugen und die Projektdoku überschreiben.
  agentRules: false,
};

export default nextConfig;
