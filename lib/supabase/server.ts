import "server-only";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { required } from "../config";
export async function serverSupabase() {
  const jar = await cookies();
  return createServerClient(
    required("SUPABASE_URL"),
    required("SUPABASE_PUBLISHABLE_KEY"),
    {
      cookies: {
        getAll() {
          return jar.getAll();
        },
        setAll(items) {
          try {
            items.forEach(({ name, value, options }) =>
              jar.set(name, value, options),
            );
          } catch {
            /* Server Components are read-only; proxy refreshes their cookies. */
          }
        },
      },
    },
  );
}
