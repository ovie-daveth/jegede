import { database } from "../../../../lib/supabase/database";
import { writeGuard, apiError } from "../../../../lib/auth";
import { inspectObject, deleteObject } from "../../../../lib/storage";
import { uploadMatches } from "../../../../lib/validation";
export async function POST(r: Request) {
  try {
    const guard = await writeGuard(r);
    if (guard) return guard;
    const body = await r.json().catch(() => null);
    if (!body || typeof body.id !== "string")
      return Response.json({ error: "Missing upload ID." }, { status: 400 });
    const db = database(),
      a = await db
        .from("project_files")
        .select("id,size,mime,storage_key,status")
        .eq("id", body.id)
        .maybeSingle();
    if (a.error) throw a.error;
    if (!a.data)
      return Response.json({ error: "Upload not found." }, { status: 404 });
    if (a.data.status === "ready") return Response.json({ ok: true });
    const info = await inspectObject(a.data.storage_key);
    if (!uploadMatches(a.data, info)) {
      await deleteObject(a.data.storage_key);
      await db.from("project_files").delete().eq("id", body.id);
      return Response.json(
        {
          error:
            "Uploaded file does not match its declared size or format. Try again.",
        },
        { status: 400 },
      );
    }
    const updated = await db
      .from("project_files")
      .update({ status: "ready" })
      .eq("id", body.id);
    if (updated.error) throw updated.error;
    return Response.json({ ok: true });
  } catch (e) {
    return apiError(e);
  }
}
