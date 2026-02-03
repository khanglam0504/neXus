import { NextRequest, NextResponse } from "next/server";
import { verifyMoltbookRequest } from "@/lib/moltbook-auth";

export async function POST(req: NextRequest) {
  const result = await verifyMoltbookRequest(req);

  if (!result.valid) {
    return NextResponse.json(
      { error: result.error, hint: result.hint },
      { status: 401 }
    );
  }

  const agent = result.agent!;
  
  // Here you would typically:
  // 1. Create/Update user in your database (Convex)
  // 2. Issue a session token for your app
  
  return NextResponse.json({
    success: true,
    message: `Welcome, ${agent.name}!`,
    agent: {
      id: agent.id,
      name: agent.name,
      karma: agent.karma,
      owner: agent.owner?.x_handle
    }
  });
}
