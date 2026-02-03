import { NextRequest, NextResponse } from "next/server";

const MOLTBOOK_APP_KEY = process.env.MOLTBOOK_APP_KEY;
// Domain of your app - ensures the token was intended for us
const AUDIENCE = process.env.MOLTBOOK_AUDIENCE || "nexus-platform"; 

export interface MoltbookAgent {
  id: string;
  name: string;
  description?: string;
  karma: number;
  avatar_url?: string;
  is_claimed: boolean;
  owner?: {
    x_handle: string;
    x_verified: boolean;
  };
}

export interface VerifyResult {
  valid: boolean;
  agent?: MoltbookAgent;
  error?: string;
  hint?: string;
}

/**
 * Verifies the X-Moltbook-Identity header token with Moltbook API.
 */
export async function verifyMoltbookRequest(req: NextRequest): Promise<VerifyResult> {
  const token = req.headers.get("x-moltbook-identity");

  if (!token) {
    return { valid: false, error: "missing_token", hint: "Header X-Moltbook-Identity is required" };
  }

  if (!MOLTBOOK_APP_KEY) {
    console.error("MOLTBOOK_APP_KEY is not set in environment variables");
    return { valid: false, error: "server_configuration_error" };
  }

  try {
    const response = await fetch("https://moltbook.com/api/v1/agents/verify-identity", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Moltbook-App-Key": MOLTBOOK_APP_KEY,
      },
      body: JSON.stringify({
        token,
        audience: AUDIENCE,
      }),
    });

    const data = await response.json();

    if (!data.valid) {
      return { valid: false, error: data.error || "invalid_token" };
    }

    return { valid: true, agent: data.agent };
  } catch (err) {
    console.error("Moltbook verification failed:", err);
    return { valid: false, error: "verification_failed" };
  }
}
