"use client";
import { useEffect, useState, useRef } from "react";
import {
  Plus,
  ArrowUpRight,
  Upload,
  Trash2,
  Save,
  CheckCircle2,
  X,
  FileText,
  Loader2,
} from "lucide-react";
import type { Project } from "../portfolio";
import { directUpload } from "../../lib/direct-upload";
const blank = {
  title: "",
  year: String(new Date().getFullYear()),
  tools: "",
  category: "3D modelling",
  description: "",
  published: false,
};
export default function Admin() {
  const [projects, setProjects] = useState<Project[]>([]),
    [form, setForm] = useState<any>(blank),
    [editing, setEditing] = useState(false),
    [files, setFiles] = useState<File[]>([]),
    [busy, setBusy] = useState(false),
    [message, setMessage] = useState(""),
    [error, setError] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);
  async function load() {
    const r = await fetch("/api/projects?admin=1");
    if (!r.ok) throw Error("Unable to load projects.");
    const d: any = await r.json();
    if (!d.admin) throw Error("Administrator access required.");
    setProjects(d.projects);
  }
  useEffect(() => {
    load().catch((e) => setError(e.message));
  }, []);
  const field = (k: string, v: any) => setForm((p: any) => ({ ...p, [k]: v }));
  async function save(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    setMessage("");
    try {
      for (const f of files)
        if (f.size > 250 * 1024 * 1024)
          throw Error(f.name + " exceeds the 250 MB file limit.");
      const r = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, published: false }),
      });
      const d: any = await r.json();
      if (!r.ok) throw Error(d.error || "Could not save project.");
      setForm((p: any) => ({ ...p, id: d.id }));
      for (let i = 0; i < files.length; i++) {
        setMessage(
          "Uploading " + (i + 1) + " of " + files.length + ": " + files[i].name,
        );
        const f = files[i];
        try {
          await directUpload(d.id, f, (percentage) =>
            setMessage(
              "Uploading " +
                (i + 1) +
                " of " +
                files.length +
                ": " +
                f.name +
                " (" +
                percentage +
                "%)",
            ),
          );
        } catch (uploadError) {
          setFiles(files.slice(i));
          await load();
          throw Error(
            (uploadError instanceof Error
              ? uploadError.message
              : "Upload failed.") +
              " The project remains a draft; retry remaining files.",
          );
        }
      }
      const finish = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, id: d.id }),
      });
      if (!finish.ok)
        throw Error(
          "Files saved, but project status could not be updated. Open the draft and retry.",
        );
      await load();
      setFiles([]);
      setEditing(false);
      setMessage(
        form.published
          ? "Project published successfully."
          : "Draft saved successfully.",
      );
    } catch (e: any) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }
  async function remove(p: Project) {
    if (!confirm("Delete “" + p.title + "” and all its uploaded files?"))
      return;
    setBusy(true);
    try {
      const r = await fetch("/api/projects?id=" + p.id, { method: "DELETE" });
      if (!r.ok) throw Error("Could not delete project.");
      await load();
      setMessage("Project deleted.");
    } catch (e: any) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }
  async function removeAsset(id: string) {
    if (!confirm("Remove this file?")) return;
    setBusy(true);
    try {
      const r = await fetch("/api/upload?id=" + id, { method: "DELETE" });
      if (!r.ok) throw Error("Could not remove file.");
      setForm((p: any) => ({
        ...p,
        assets: p.assets.filter((a: any) => a.id !== id),
      }));
      await load();
    } catch (e: any) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <div className="adminlayout">
      <aside className="adminside">
        <a className="monogram" href="/">
          MJ<span>·</span>
        </a>
        <div>
          <p className="eyebrow">PORTFOLIO STUDIO</p>
          <h3>Micheal Jegede</h3>
          <p>Engineering work, organised.</p>
        </div>
        <a className="sidelink" href="/admin">
          ▦ &nbsp; Projects
        </a>
        <a href="/" className="textlink">
          View portfolio <ArrowUpRight size={16} />
        </a>
        <button
          type="button"
          className="signout"
          disabled={busy}
          onClick={async () => {
            try {
              const r = await fetch("/api/auth/logout", { method: "POST" });
              if (!r.ok) throw Error("Could not sign out.");
              window.location.assign("/login");
            } catch (e) {
              setError(e instanceof Error ? e.message : "Could not sign out.");
            }
          }}
        >
          Sign out
        </button>
      </aside>
      <main className="adminmain">
        <div className="adminhead">
          <div>
            <p className="eyebrow">YOUR DESIGN ARCHIVE</p>
            <h1>Portfolio projects</h1>
            <p>Upload your work. Tell its story. Share it with employers.</p>
          </div>
          <button
            className="button"
            disabled={busy}
            onClick={() => {
              setForm({ ...blank });
              setFiles([]);
              setEditing(true);
              setMessage("");
              setError("");
            }}
          >
            <Plus size={18} /> Add project
          </button>
        </div>
        <div className="stats">
          <div>
            <span>{projects.length}</span>Total projects
          </div>
          <div>
            <span>{projects.filter((p) => p.published).length}</span>Published
          </div>
          <div>
            <span>{projects.reduce((n, p) => n + p.assets.length, 0)}</span>
            Uploaded files
          </div>
        </div>
        {error && (
          <p className="alert error" role="alert">
            {error}
          </p>
        )}
        {message && (
          <p className="alert" role="status">
            {message}
          </p>
        )}
        {editing ? (
          <form className="editor" onSubmit={save}>
            <div className="editorhead">
              <h2>{form.id ? "Edit project" : "New project"}</h2>
              <button
                type="button"
                className="iconbutton"
                disabled={busy}
                aria-label="Close editor"
                onClick={() => setEditing(false)}
              >
                <X />
              </button>
            </div>
            <div className="formgrid">
              <label>
                Project title
                <input
                  required
                  maxLength={150}
                  value={form.title}
                  onChange={(e) => field("title", e.target.value)}
                  placeholder="e.g. AdBlue production plant"
                />
              </label>
              <label>
                Year created
                <input
                  type="number"
                  min="1900"
                  max={new Date().getFullYear() + 1}
                  required
                  value={form.year}
                  onChange={(e) => field("year", e.target.value)}
                />
              </label>
              <label>
                Software / instruments used
                <input
                  required
                  maxLength={500}
                  value={form.tools}
                  onChange={(e) => field("tools", e.target.value)}
                  placeholder="e.g. AutoCAD, SolidWorks"
                />
              </label>
              <label>
                Category
                <select
                  value={form.category}
                  onChange={(e) => field("category", e.target.value)}
                >
                  {[
                    "3D modelling",
                    "CAD drafting",
                    "Plant design",
                    "Engineering projects",
                  ].map((c) => (
                    <option key={c}>{c}</option>
                  ))}
                </select>
              </label>
              <label className="full">
                Project description
                <textarea
                  required
                  maxLength={10000}
                  rows={5}
                  value={form.description}
                  onChange={(e) => field("description", e.target.value)}
                  placeholder="Describe the design, your role, approach and deliverables."
                />
              </label>
            </div>
            <label className="uploadzone">
              <Upload size={30} />
              <strong>Add project files</strong>
              <span>
                Videos, images, PDF, CAD, documents and archives · up to 250 MB
                per file
              </span>
              <input
                ref={fileRef}
                disabled={busy}
                type="file"
                multiple
                onChange={(e) =>
                  setFiles((p) => [...p, ...Array.from(e.target.files || [])])
                }
              />
            </label>
            {files.map((f, i) => (
              <div className="assetrow" key={i}>
                <span>
                  {f.name} · {(f.size / 1024 / 1024).toFixed(1)} MB
                </span>
                <button
                  type="button"
                  disabled={busy}
                  className="iconbutton"
                  aria-label={"Remove " + f.name}
                  onClick={() => setFiles(files.filter((_, n) => n !== i))}
                >
                  <X size={16} />
                </button>
              </div>
            ))}
            {form.assets?.map((a: any) => (
              <div className="assetrow" key={a.id}>
                <a href={"/api/media/" + a.id + "?download=1"}>{a.name}</a>
                <button
                  className="iconbutton"
                  type="button"
                  disabled={busy}
                  aria-label={"Delete " + a.name}
                  onClick={() => removeAsset(a.id)}
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
            <div className="editbottom">
              <label className="checkbox">
                <input
                  type="checkbox"
                  checked={!!form.published}
                  onChange={(e) => field("published", e.target.checked)}
                />{" "}
                Publish to portfolio
              </label>
              <button className="button" disabled={busy}>
                {busy ? (
                  <Loader2 className="spin" size={18} />
                ) : (
                  <Save size={18} />
                )}{" "}
                {busy ? "Saving…" : "Save project"}
              </button>
            </div>
            <p className="subtle">
              Videos play on the site without YouTube or Vimeo. MP4 and WebM
              have the widest browser support; other formats remain
              downloadable.
            </p>
          </form>
        ) : (
          <div className="adminprojects">
            <div className="editorhead">
              <h2>Your projects</h2>
              <span className="subtle">Manage published work and drafts</span>
            </div>
            {projects.length === 0 ? (
              <div className="empty">
                <Upload size={32} />
                <h3>Your portfolio starts here.</h3>
                <p>
                  Add the AdBlue production plant model, a video walkthrough or
                  a CAD drawing.
                </p>
                <button
                  className="button"
                  onClick={() => {
                    setForm({
                      ...blank,
                      title: "AdBlue production plant",
                      category: "Plant design",
                    });
                    setFiles([]);
                    setEditing(true);
                  }}
                >
                  Add your first project <Plus size={16} />
                </button>
              </div>
            ) : (
              projects.map((p) => (
                <article className="adminrow" key={p.id}>
                  <div className="projecticon">
                    <FileText />
                  </div>
                  <div>
                    <h3>{p.title}</h3>
                    <p>
                      {p.year} · {p.tools} · {p.assets.length} files
                    </p>
                  </div>
                  <span
                    className={"status " + (p.published ? "published" : "")}
                  >
                    {p.published ? "Published" : "Draft"}
                  </span>
                  <button
                    disabled={busy}
                    onClick={() => {
                      setForm({ ...p, published: !!p.published });
                      setFiles([]);
                      setEditing(true);
                    }}
                  >
                    Edit
                  </button>
                  <button
                    disabled={busy}
                    className="iconbutton"
                    aria-label={"Delete " + p.title}
                    onClick={() => remove(p)}
                  >
                    <Trash2 size={17} />
                  </button>
                </article>
              ))
            )}
          </div>
        )}
      </main>
    </div>
  );
}
