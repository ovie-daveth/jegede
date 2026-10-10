import test from "node:test";
import assert from "node:assert/strict";
import {
  projectSchema,
  uploadSchema,
  fileMime,
  uploadMatches,
  MAX_FILE_SIZE,
} from "../lib/validation";
import { adminEmailAllowed } from "../lib/config";
const id = "4b831dfd-9d87-4b70-9005-499a6133b5f8";
const project = {
  title: " AdBlue plant ",
  year: "2025",
  tools: "AutoCAD",
  category: "Plant design",
  description: "Engineering model",
  published: false,
};
test("project schema accepts and trims genuine project metadata", () => {
  const p = projectSchema.parse(project);
  assert.equal(p.title, "AdBlue plant");
  assert.equal(p.published, false);
});
test("project schema rejects invalid year, blank tools and unsupported categories", () => {
  for (const invalid of [
    { year: "invalid" },
    { year: "1800" },
    { year: "9999" },
    { tools: " " },
    { category: "Other" },
    { title: "" },
    { published: "true" },
  ])
    assert.equal(
      projectSchema.safeParse({ ...project, ...invalid }).success,
      false,
    );
});
test("admin allowlist is case insensitive and excludes unknown emails", () => {
  assert.equal(adminEmailAllowed("MICHEALJEGEDE3@GMAIL.COM"), true);
  assert.equal(adminEmailAllowed("attacker@example.com"), false);
  assert.equal(adminEmailAllowed(null), false);
});
test("supported video and engineering file formats are accepted", () => {
  for (const name of [
    "video.mp4",
    "video.webm",
    "model.STEP",
    "model.dwg",
    "drawing.pdf",
    "archive.zip",
  ])
    assert.equal(
      uploadSchema.safeParse({ projectId: id, name, size: 1000 }).success,
      true,
    );
});
test("active/executable uploads and invalid sizes are rejected", () => {
  for (const name of ["script.html", "drawing.svg", "program.exe", "x.mp4\n"])
    assert.equal(
      uploadSchema.safeParse({ projectId: id, name, size: 1000 }).success,
      false,
    );
  for (const size of [0, -1, 1.5, MAX_FILE_SIZE + 1])
    assert.equal(
      uploadSchema.safeParse({ projectId: id, name: "x.mp4", size }).success,
      false,
    );
});
test("server selects MIME by extension, not untrusted browser MIME", () => {
  assert.equal(fileMime("video.mp4"), "video/mp4");
  assert.equal(fileMime("model.step"), "application/octet-stream");
});
test("completion requires both matching size and type", () => {
  const expected = { size: 100, mime: "video/mp4" };
  assert.equal(
    uploadMatches(expected, { ContentLength: 100, ContentType: "video/mp4" }),
    true,
  );
  assert.equal(
    uploadMatches(expected, { ContentLength: 1000, ContentType: "video/mp4" }),
    false,
  );
  assert.equal(
    uploadMatches(expected, { ContentLength: 100, ContentType: "text/html" }),
    false,
  );
});
