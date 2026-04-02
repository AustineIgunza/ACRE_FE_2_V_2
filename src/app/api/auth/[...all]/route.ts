// NextAuth.js auth handler
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || "",
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""
);

export async function GET(request: Request) {
  return new Response(
    JSON.stringify({ message: "Auth endpoint" }),
    { status: 200, headers: { "Content-Type": "application/json" } }
  );
}

export async function POST(request: Request) {
  return new Response(
    JSON.stringify({ message: "Auth endpoint" }),
    { status: 200, headers: { "Content-Type": "application/json" } }
  );
}
