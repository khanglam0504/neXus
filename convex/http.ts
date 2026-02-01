import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";
import { api } from "./_generated/api";
import { Id } from "./_generated/dataModel";
import { internal } from "./_generated/api";

const http = httpRouter();

// POST /api/heartbeat - Update agent heartbeat
http.route({
  path: "/api/heartbeat",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    try {
      const body = await request.json();
      const { agentId, status, currentTask } = body;

      // Validate required fields
      if (!agentId || !status) {
        return new Response(
          JSON.stringify({ error: "agentId and status are required" }),
          { status: 400, headers: { "Content-Type": "application/json" } }
        );
      }

      // Validate status
      const validStatuses = ["online", "idle", "offline", "busy"];
      if (!validStatuses.includes(status)) {
        return new Response(
          JSON.stringify({ error: "Invalid status. Must be: online, idle, offline, or busy" }),
          { status: 400, headers: { "Content-Type": "application/json" } }
        );
      }

      // Find agent by name (case-insensitive)
      const agents = await ctx.runQuery(api.agents.list);
      const agent = agents.find(
        (a: any) => a.name.toLowerCase() === agentId.toLowerCase()
      );

      if (!agent) {
        return new Response(
          JSON.stringify({ error: `Agent '${agentId}' not found` }),
          { status: 404, headers: { "Content-Type": "application/json" } }
        );
      }

      // Parse currentTask if provided
      let taskId: Id<"tasks"> | undefined = undefined;
      if (currentTask) {
        // If currentTask is a task ID, use it directly
        if (currentTask.startsWith("j")) {
          taskId = currentTask as Id<"tasks">;
        }
        // Otherwise, find task by title
        else {
          const allTasks = await ctx.runQuery(api.tasks.list, {});
          const task = allTasks.find((t: any) =>
            t.title.toLowerCase().includes(currentTask.toLowerCase())
          );
          if (task) {
            taskId = task._id;
          }
        }
      }

      // Update agent status and currentTask
      await ctx.runMutation(api.agents.updateStatus, {
        id: agent._id,
        status,
      });

      if (taskId !== undefined || currentTask === null) {
        await ctx.runMutation(api.agents.assignTask, {
          id: agent._id,
          taskId,
        });
      }

      // Record heartbeat
      await ctx.runMutation(api.agents.heartbeat, {
        id: agent._id,
        status,
        metadata: { currentTask: currentTask || null },
      });

      // Get updated agent data
      const updatedAgent = await ctx.runQuery(api.agents.get, {
        id: agent._id,
      });

      return new Response(JSON.stringify(updatedAgent), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    } catch (error) {
      console.error("Heartbeat error:", error);
      return new Response(
        JSON.stringify({ error: "Internal server error" }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }
  }),
});

// GET /api/heartbeat?agentId=<name> - Get single agent status
http.route({
  path: "/api/heartbeat",
  method: "GET",
  handler: httpAction(async (ctx, request) => {
    try {
      const url = new URL(request.url);
      const agentId = url.searchParams.get("agentId");

      if (!agentId) {
        return new Response(
          JSON.stringify({ error: "agentId query parameter is required" }),
          { status: 400, headers: { "Content-Type": "application/json" } }
        );
      }

      // Find agent by name (case-insensitive)
      const agents = await ctx.runQuery(api.agents.list);
      const agent = agents.find(
        (a: any) => a.name.toLowerCase() === agentId.toLowerCase()
      );

      if (!agent) {
        return new Response(
          JSON.stringify({ error: `Agent '${agentId}' not found` }),
          { status: 404, headers: { "Content-Type": "application/json" } }
        );
      }

      // Get recent heartbeats for this agent
      const allHeartbeats = await ctx.runQuery(api.agents.list);

      return new Response(JSON.stringify(agent), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    } catch (error) {
      console.error("Get heartbeat error:", error);
      return new Response(
        JSON.stringify({ error: "Internal server error" }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }
  }),
});

// POST /api/linear-sync - Trigger Linear sync
http.route({
  path: "/api/linear-sync",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    try {
      // Trigger Linear sync action
      const result = await ctx.runAction(api.linearSync.triggerSync, {});

      return new Response(JSON.stringify(result), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    } catch (error) {
      console.error("Linear sync trigger error:", error);
      return new Response(
        JSON.stringify({
          success: false,
          error: error instanceof Error ? error.message : "Internal server error"
        }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }
  }),
});

// ============================================================
// WEBHOOK ENDPOINTS (AGT-128: Max Visibility Pipeline)
// ============================================================

/**
 * POST /github-webhook — Handle GitHub push events
 * Parses commit messages for AGT-XX and posts comments to Linear
 */
http.route({
  path: "/github-webhook",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    try {
      const body = await request.text();
      const payload = JSON.parse(body);

      // Verify GitHub signature if secret is configured (using Web Crypto API)
      const githubSecret = process.env.GITHUB_WEBHOOK_SECRET;
      if (githubSecret) {
        const signature = request.headers.get("x-hub-signature-256");
        if (signature) {
          const encoder = new TextEncoder();
          const key = await crypto.subtle.importKey(
            "raw",
            encoder.encode(githubSecret),
            { name: "HMAC", hash: "SHA-256" },
            false,
            ["sign"]
          );
          const signatureBuffer = await crypto.subtle.sign(
            "HMAC",
            key,
            encoder.encode(body)
          );
          const hashArray = Array.from(new Uint8Array(signatureBuffer));
          const expectedSignature = `sha256=${hashArray.map((b) => b.toString(16).padStart(2, "0")).join("")}`;
          if (signature !== expectedSignature) {
            console.error("Invalid GitHub webhook signature");
            return new Response(
              JSON.stringify({ error: "Invalid signature" }),
              { status: 401, headers: { "Content-Type": "application/json" } }
            );
          }
        }
      }

      // Check event type
      const eventType = request.headers.get("x-github-event");
      if (eventType !== "push") {
        return new Response(
          JSON.stringify({ message: `Ignoring event type: ${eventType}` }),
          { status: 200, headers: { "Content-Type": "application/json" } }
        );
      }

      // Process the push event
      const result = await ctx.runAction(api.webhooks.processGitHubPush, {
        payload,
      });

      return new Response(JSON.stringify(result), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    } catch (error) {
      console.error("GitHub webhook error:", error);
      return new Response(
        JSON.stringify({ error: "Internal server error" }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }
  }),
});

/**
 * POST /vercel-webhook — Handle Vercel deployment events
 * Posts status updates to Linear and creates P0 bug tickets on failure
 */
http.route({
  path: "/vercel-webhook",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    try {
      const payload = await request.json();

      // Vercel sends different payload structures for different events
      // We handle: deployment.created, deployment.ready, deployment.error
      const eventType = payload.type || "deployment";

      // Process the deployment event
      const result = await ctx.runAction(api.webhooks.processVercelDeploy, {
        payload,
      });

      return new Response(JSON.stringify(result), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    } catch (error) {
      console.error("Vercel webhook error:", error);
      return new Response(
        JSON.stringify({ error: "Internal server error" }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }
  }),
});

export default http;
