import { database } from "../../../lib/supabase/database";
import { projectSchema } from "../../../lib/validation";
import { deleteObject } from "../../../lib/storage";
import { isAdmin, writeGuard, apiError, listProjects } from "../helpers";
export const dynamic = "force-dynamic";
export async function GET(r: Request) {
  try {
    const admin = await isAdmin();
    return Response.json(
      {
        projects: await listProjects(
          new URL(r.url).searchParams.get("admin") === "1" && admin,
        ),
        admin,
      },
      { headers: { "Cache-Control": "private, no-store" } },
    );
  } catch (e) {
    return apiError(e);
  }
}
export async function POST(r: Request) {
  try {
    const guard = await writeGuard(r);
    if (guard) return guard;
    const body = await r.json().catch(() => null);
    const parsed = projectSchema.safeParse(body);
    if (!parsed.success)
      return Response.json(
        {
          error: "Enter a title, valid year, tools, category and description.",
        },
        { status: 400 },
      );
    const { id, ...fields } = parsed.data;
    const db = database();
    const result = id
      ? await db
          .from("projects")
          .update(fields)
          .eq("id", id)
          .select("id")
          .single()
      : await db.from("projects").insert(fields).select("id").single();
    if (result.error) throw result.error;
    return Response.json(result.data);
  } catch (e) {
    return apiError(e);
  }
}
export async function DELETE(r: Request) {
  try {
    const guard = await writeGuard(r);
    if (guard) return guard;
    const id = new URL(r.url).searchParams.get("id");
    if (!id)
      return Response.json({ error: "Missing project." }, { status: 400 });
    const db = database();
    const { data, error } = await db
      .from("project_files")
      .select("storage_key")
      .eq("project_id", id);
    if (error) throw error;
    for (const a of data || []) await deleteObject(a.storage_key);
    const deleted = await db.from("projects").delete().eq("id", id);
    if (deleted.error) throw deleted.error;
    return Response.json({ ok: true });
  } catch (e) {
    return apiError(e);
  }
}
