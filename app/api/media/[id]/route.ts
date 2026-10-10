import { database } from "../../../../lib/supabase/database";
import { isAdmin, apiError } from "../../../../lib/auth";
import { presignRead } from "../../../../lib/storage";
export const dynamic = "force-dynamic";
export async function GET(
  r: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const { data, error } = await database()
      .from("project_files")
      .select("name,mime,status,storage_key,projects!inner(published)")
      .eq("id", id)
      .maybeSingle();
    if (error) throw error;
    if (!data || data.status !== "ready")
      return new Response("Not found", { status: 404 });
    const project = data.projects as unknown as { published: boolean };
    if (!project.published && !(await isAdmin()))
      return new Response("Not found", { status: 404 });
    const location = await presignRead(
      data.storage_key,
      data.name,
      data.mime,
      new URL(r.url).searchParams.has("download"),
    );
    return new Response(null, {
      status: 307,
      headers: {
        Location: location,
        "Cache-Control": "private, no-store",
        "Referrer-Policy": "no-referrer",
      },
    });
  } catch (e) {
    return apiError(e);
  }
}
