import { serverSupabase } from "../../../../lib/supabase/server";
import { apiError } from "../../../../lib/auth";
export async function POST(r: Request) {
  try {
    if (r.headers.get("origin") !== new URL(r.url).origin)
      return Response.json(
        { error: "Invalid request origin." },
        { status: 403 },
      );
    const client = await serverSupabase();
    const { error } = await client.auth.signOut();
    if (error) throw error;
    return Response.json({ ok: true });
  } catch (e) {
    return apiError(e);
  }
}
