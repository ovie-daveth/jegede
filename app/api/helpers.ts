import { database } from "../../lib/supabase/database";
export { isAdmin, writeGuard, apiError } from "../../lib/auth";
export async function listProjects(admin = false) {
  let query = database()
    .from("projects")
    .select(
      "id,title,year,tools,category,description,published,created_at,project_files(id,name,mime,size,status)",
    )
    .order("created_at", { ascending: false });
  if (!admin) query = query.eq("published", true);
  const { data, error } = await query;
  if (error) throw error;
  return (data || []).map(({ project_files, ...p }) => ({
    ...p,
    assets: project_files
      .filter((a) => a.status === "ready")
      .map(({ status, ...a }) => a),
  }));
}
