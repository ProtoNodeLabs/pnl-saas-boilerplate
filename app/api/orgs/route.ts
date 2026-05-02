import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { createOrg } from "@/lib/org";
import { z } from "zod";

const schema = z.object({
  name: z.string().min(2).max(64),
});

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message }, { status: 422 });
  }

  const org = await createOrg(parsed.data.name, userId);
  return NextResponse.json(org, { status: 201 });
}
