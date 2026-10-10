import { serverSupabase } from "../../../../lib/supabase/server";
import { adminEmailAllowed } from "../../../../lib/config";
import { apiError } from "../../../../lib/auth";
export async function POST(r: Request) {
  try {
    if (r.headers.get("origin") !== new URL(r.url).origin)
      return Response.json(
        { error: "Invalid request origin." },
        { status: 403 },
      );
    const b = await r.json().catch(() => null);
    if (
      !b ||
      typeof b.email !== "string" ||
      typeof b.password !== "string" ||
      b.password.length > 1024 ||
      !adminEmailAllowed(b.email.trim())
    )
      return Response.json(
        { error: "Invalid administrator credentials." },
        { status: 401 },
      );
    const client = await serverSupabase();
    const { data, error } = await client.auth.signInWithPassword({
      email: b.email.trim(),
      password: b.password,
    });
    if (error || !data.user || !adminEmailAllowed(data.user.email))
      return Response.json(
        { error: "Invalid administrator credentials." },
        { status: 401 },
      );
    return Response.json(
      { ok: true },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (e) {
    return apiError(e);
  }
}
