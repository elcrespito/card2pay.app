import { runSandboxE2ETest } from "@/lib/sandbox-demo";
import { env } from "@/lib/env";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Sandbox-only: run hash → order → simulate PAID → callback in one shot.
export async function POST() {
  if (!env.sandbox) {
    return new Response("sandbox disabled", { status: 404 });
  }
  const result = await runSandboxE2ETest();
  return Response.json(result);
}
