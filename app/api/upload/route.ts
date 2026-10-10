import { database } from "../../../lib/supabase/database";
import { writeGuard, apiError } from "../../../lib/auth";
import { uploadSchema, fileMime } from "../../../lib/validation";
import { presignUpload, deleteObject } from "../../../lib/storage";
export async function POST(r: Request) {
  try {
    const guard = await writeGuard(r);
    if (guard) return guard;
    const parsed = uploadSchema.safeParse(await r.json().catch(() => null));
    if (!parsed.success)
      return Response.json(
        {
          error:
            "Use a supported video, image, PDF, CAD, document or archive file under 250 MB.",
        },
        { status: 400 },
      );
    const b = parsed.data,
      db = database();
    const p = await db
      .from("projects")
      .select("id")
      .eq("id", b.projectId)
      .maybeSingle();
    if (p.error) throw p.error;
    if (!p.data)
      return Response.json({ error: "Project not found." }, { status: 404 });
    const id = crypto.randomUUID(),
      key = `projects/${b.projectId}/${id}`,
      mime = fileMime(b.name);
    const url = await presignUpload(key, mime, b.size);
    const inserted = await db
      .from("project_files")
      .insert({
        id,
        project_id: b.projectId,
        name: b.name,
        mime,
        size: b.size,
        storage_key: key,
        status: "pending",
      });
    if (inserted.error) throw inserted.error;
    return Response.json(
      { id, url, mime },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (e) {
    return apiError(e);
  }
}
export async function DELETE(r: Request) {
  try {
    const guard = await writeGuard(r);
    if (guard) return guard;
    const id = new URL(r.url).searchParams.get("id");
    if (!id) return Response.json({ error: "Missing file." }, { status: 400 });
    const db = database();
    const a = await db
      .from("project_files")
      .select("storage_key")
      .eq("id", id)
      .maybeSingle();
    if (a.error) throw a.error;
    if (a.data) {
      await deleteObject(a.data.storage_key);
      const deleted = await db.from("project_files").delete().eq("id", id);
      if (deleted.error) throw deleted.error;
    }
    return Response.json({ ok: true });
  } catch (e) {
    return apiError(e);
  }
}
