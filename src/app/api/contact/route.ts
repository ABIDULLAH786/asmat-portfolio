import { NextResponse } from "next/server";
import { z } from "zod";
import { supabaseAdmin } from "@/lib/supabase/server";

const Schema = z.object({
  name: z.string().min(1).max(120),
  email: z.string().email().max(200),
  subject: z.string().max(200).optional().or(z.literal("")),
  message: z.string().min(1).max(4000),
});

export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  const parsed = Schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }
  const { name, email, subject, message } = parsed.data;

  const sb = supabaseAdmin();
  const { error } = await sb.from("contact_messages").insert({
    name,
    email,
    subject: subject || null,
    message,
  });
  if (error) {
    return NextResponse.json({ error: "Could not save message." }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}
