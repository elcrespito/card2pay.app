import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ reference: string }> }
) {
  const { reference } = await params;
  const order = await prisma.order.findUnique({
    where: { reference },
    select: { status: true },
  });
  if (!order) {
    return NextResponse.json({ error: "not found" }, { status: 404 });
  }
  return NextResponse.json(
    { status: order.status },
    { headers: { "Cache-Control": "no-store" } }
  );
}
