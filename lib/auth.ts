import "server-only";
import { serverSupabase } from "./supabase/server";
import { adminEmailAllowed, supabaseConfigured } from "./config";
export async function currentUser() {
  if (!supabaseConfigured()) return null;
  const client = await serverSupabase();
  const { data, error } = await client.auth.getUser();
  return error ? null : data.user;
}
export async function isAdmin() {
  const user = await currentUser();
  return !!user && adminEmailAllowed(user.email);
}
export async function writeGuard(request: Request) {
  const origin = request.headers.get("origin");
  if (!origin || origin !== new URL(request.url).origin)
    return Response.json({ error: "Invalid request origin." }, { status: 403 });
  if (!(await isAdmin()))
    return Response.json(
      { error: "Administrator access required." },
      { status: 403 },
    );
  return null;
}
export function apiError(error: unknown) {
  console.error(
    error instanceof Error ? error.message : "Portfolio request failed",
  );
  return Response.json(
    {
      error:
        "Unable to complete the request. Check the service configuration or try again.",
    },
    { status: 503 },
  );
}
