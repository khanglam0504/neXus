#!/usr/bin/env tsx

/**
 * EVOX Agent Heartbeat CLI
 *
 * Usage:
 *   npx tsx scripts/heartbeat.ts --agent-id sam --status online
 *   npx tsx scripts/heartbeat.ts --agent-id sam --status online --task "AGT-74"
 *   npx tsx scripts/heartbeat.ts --agent-id leo --status idle --watch
 */

import * as fs from "fs";
import * as path from "path";

// Parse command line arguments
function parseArgs() {
  const args = process.argv.slice(2);
  const parsed: Record<string, string | boolean> = {};

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg.startsWith("--")) {
      const key = arg.slice(2);
      const nextArg = args[i + 1];

      if (nextArg && !nextArg.startsWith("--")) {
        parsed[key] = nextArg;
        i++;
      } else {
        // Flag without value
        parsed[key] = true;
      }
    }
  }

  return parsed;
}

// Load Convex URL from .env.local
function loadConvexUrl(): string {
  const envPath = path.join(process.cwd(), ".env.local");

  if (!fs.existsSync(envPath)) {
    throw new Error(".env.local not found. Run 'npx convex dev' first.");
  }

  const envContent = fs.readFileSync(envPath, "utf-8");
  const match = envContent.match(/NEXT_PUBLIC_CONVEX_SITE_URL=(.+)/);

  if (!match) {
    throw new Error("NEXT_PUBLIC_CONVEX_SITE_URL not found in .env.local");
  }

  return match[1].trim();
}

// Send heartbeat to Convex HTTP endpoint
async function sendHeartbeat(
  agentId: string,
  status: string,
  currentTask?: string
) {
  const convexUrl = loadConvexUrl();
  const url = `${convexUrl}/api/heartbeat`;

  const body = {
    agentId,
    status,
    ...(currentTask && { currentTask }),
  };

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Heartbeat failed");
    }

    const data = await response.json();
    return data;
  } catch (error) {
    throw new Error(`Failed to send heartbeat: ${error}`);
  }
}

// Main function
async function main() {
  const args = parseArgs();

  // Validate required arguments
  if (!args["agent-id"]) {
    console.error("Error: --agent-id is required");
    console.log("\nUsage:");
    console.log("  npx tsx scripts/heartbeat.ts --agent-id <name> --status <status> [--task <task>] [--watch]");
    console.log("\nExample:");
    console.log('  npx tsx scripts/heartbeat.ts --agent-id sam --status online --task "AGT-74"');
    process.exit(1);
  }

  if (!args["status"]) {
    console.error("Error: --status is required");
    console.log("\nValid statuses: online, idle, offline, busy");
    process.exit(1);
  }

  const agentId = args["agent-id"] as string;
  const status = args["status"] as string;
  const task = args["task"] as string | undefined;
  const watch = args["watch"] === true;

  // Validate status
  const validStatuses = ["online", "idle", "offline", "busy"];
  if (!validStatuses.includes(status)) {
    console.error(`Error: Invalid status '${status}'`);
    console.log(`Valid statuses: ${validStatuses.join(", ")}`);
    process.exit(1);
  }

  // Send initial heartbeat
  try {
    console.log(`📡 Sending heartbeat for ${agentId.toUpperCase()}...`);
    const result = await sendHeartbeat(agentId, status, task);
    console.log(`✓ Heartbeat sent successfully`);
    console.log(`  Status: ${result.status}`);
    console.log(`  Last seen: ${new Date(result.lastSeen).toLocaleString()}`);
    if (result.currentTask) {
      console.log(`  Current task: ${result.currentTask}`);
    }
  } catch (error) {
    console.error(`✗ ${error}`);
    process.exit(1);
  }

  // Watch mode: send heartbeat every 30 seconds
  if (watch) {
    console.log("\n👁️  Watch mode enabled. Sending heartbeat every 30s...");
    console.log("Press Ctrl+C to stop.\n");

    setInterval(async () => {
      try {
        const timestamp = new Date().toLocaleTimeString();
        await sendHeartbeat(agentId, status, task);
        console.log(`[${timestamp}] ✓ Heartbeat sent`);
      } catch (error) {
        const timestamp = new Date().toLocaleTimeString();
        console.error(`[${timestamp}] ✗ ${error}`);
      }
    }, 30000); // 30 seconds
  }
}

// Run main function
main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
