import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";
import ts from "typescript";
function load(file: string, mocks: Record<string, unknown>) {
  const code = ts.transpileModule(fs.readFileSync(file, "utf8"), {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2022,
    },
  }).outputText;
  const m = { exports: {} as any };
  vm.runInNewContext(code, {
    exports: m.exports,
    module: m,
    require: (name: string) => {
      if (!(name in mocks)) throw Error("Missing mock " + name);
      return mocks[name];
    },
    Response,
    URL,
    crypto,
    console,
  });
  return m.exports;
}
test("authenticated headers alone do not grant administrator access", async () => {
  const auth = load("lib/auth.ts", {
    "server-only": {},
    "./config": {
      supabaseConfigured: () => true,
      adminEmailAllowed: () => false,
    },
    "./supabase/server": {
      serverSupabase: async () => ({
        auth: { getUser: async () => ({ data: { user: null }, error: null }) },
      }),
    },
  });
  const request = new Request("https://portfolio.test/api/projects", {
    method: "POST",
    headers: {
      origin: "https://portfolio.test",
      "oai-authenticated-user-email": "michealjegede3@gmail.com",
    },
  });
  assert.equal((await auth.writeGuard(request)).status, 403);
});
test("write APIs reject cross-origin requests even with valid administrator session", async () => {
  const auth = load("lib/auth.ts", {
    "server-only": {},
    "./config": {
      supabaseConfigured: () => true,
      adminEmailAllowed: () => true,
    },
    "./supabase/server": {
      serverSupabase: async () => ({
        auth: {
          getUser: async () => ({
            data: { user: { id: "admin", email: "admin@test" } },
            error: null,
          }),
        },
      }),
    },
  });
  assert.equal(
    (
      await auth.writeGuard(
        new Request("https://portfolio.test/api/projects", {
          headers: { origin: "https://evil.test" },
        }),
      )
    ).status,
    403,
  );
  assert.equal(
    await auth.writeGuard(
      new Request("https://portfolio.test/api/projects", {
        headers: { origin: "https://portfolio.test" },
      }),
    ),
    null,
  );
});
test("private draft media is hidden from anonymous users", async () => {
  const media = load("app/api/media/[id]/route.ts", {
    "../../../../lib/supabase/database": {
      database: () => ({
        from: () => ({
          select: () => ({
            eq: () => ({
              maybeSingle: async () => ({
                data: { status: "ready", projects: { published: false } },
                error: null,
              }),
            }),
          }),
        }),
      }),
    },
    "../../../../lib/auth": {
      isAdmin: async () => false,
      apiError: () => new Response(null, { status: 503 }),
    },
    "../../../../lib/storage": {
      presignRead: () => {
        throw Error("Must not issue a URL for a draft");
      },
    },
  });
  const result = await media.GET(
    new Request("https://portfolio.test/api/media/x"),
    { params: Promise.resolve({ id: "x" }) },
  );
  assert.equal(result.status, 404);
});
test("pending upload cannot be viewed even by an administrator", async () => {
  const media = load("app/api/media/[id]/route.ts", {
    "../../../../lib/supabase/database": {
      database: () => ({
        from: () => ({
          select: () => ({
            eq: () => ({
              maybeSingle: async () => ({
                data: { status: "pending", projects: { published: true } },
                error: null,
              }),
            }),
          }),
        }),
      }),
    },
    "../../../../lib/auth": {
      isAdmin: async () => true,
      apiError: () => new Response(null, { status: 503 }),
    },
    "../../../../lib/storage": {
      presignRead: () => {
        throw Error("Must not sign pending uploads");
      },
    },
  });
  assert.equal(
    (
      await media.GET(new Request("https://portfolio.test/api/media/x"), {
        params: Promise.resolve({ id: "x" }),
      })
    ).status,
    404,
  );
});
test("published media redirects to R2 and never streams the file through Vercel", async () => {
  const media = load("app/api/media/[id]/route.ts", {
    "../../../../lib/supabase/database": {
      database: () => ({
        from: () => ({
          select: () => ({
            eq: () => ({
              maybeSingle: async () => ({
                data: {
                  status: "ready",
                  name: "v.mp4",
                  mime: "video/mp4",
                  storage_key: "key",
                  projects: { published: true },
                },
                error: null,
              }),
            }),
          }),
        }),
      }),
    },
    "../../../../lib/auth": {
      isAdmin: async () => false,
      apiError: () => new Response(null, { status: 503 }),
    },
    "../../../../lib/storage": {
      presignRead: async () => "https://storage.test/signed",
    },
  });
  const result = await media.GET(
    new Request("https://portfolio.test/api/media/x"),
    { params: Promise.resolve({ id: "x" }) },
  );
  assert.equal(result.status, 307);
  assert.equal(result.headers.get("location"), "https://storage.test/signed");
  assert.equal(result.headers.get("cache-control"), "private, no-store");
});

test("public project queries apply published filtering and exclude pending files", async () => {
  let filter: any;
  const chain: any = {
    select() {
      return this;
    },
    order() {
      return this;
    },
    eq(field: string, value: any) {
      filter = [field, value];
      return this;
    },
    then(resolve: any) {
      resolve({
        data: [
          {
            id: "p",
            published: true,
            project_files: [
              { id: "ready", status: "ready", name: "model" },
              { id: "pending", status: "pending", name: "unfinished" },
            ],
          },
        ],
        error: null,
      });
    },
  };
  const helpers = load("app/api/helpers.ts", {
    "../../lib/supabase/database": { database: () => ({ from: () => chain }) },
    "../../lib/auth": {},
  });
  const projects = await helpers.listProjects(false);
  assert.deepEqual(filter, ["published", true]);
  assert.equal(projects[0].assets.length, 1);
  assert.equal(projects[0].assets[0].id, "ready");
  assert.equal("status" in projects[0].assets[0], false);
});

test("upload completion rejects mismatched objects and does not mark them ready", async () => {
  let removed = false,
    updated = false;
  const db = {
    from: () => ({
      select: () => ({
        eq: () => ({
          maybeSingle: async () => ({
            data: {
              id: "x",
              size: 10,
              mime: "video/mp4",
              storage_key: "key",
              status: "pending",
            },
            error: null,
          }),
        }),
      }),
      delete: () => ({ eq: async () => ({ error: null }) }),
      update: () => {
        updated = true;
        return { eq: async () => ({ error: null }) };
      },
    }),
  };
  const route = load("app/api/upload/complete/route.ts", {
    "../../../../lib/supabase/database": { database: () => db },
    "../../../../lib/auth": {
      writeGuard: async () => null,
      apiError: () => new Response(null, { status: 503 }),
    },
    "../../../../lib/storage": {
      inspectObject: async () => ({
        ContentLength: 100,
        ContentType: "video/mp4",
      }),
      deleteObject: async () => {
        removed = true;
      },
    },
    "../../../../lib/validation": {
      uploadMatches: (e: any, a: any) =>
        e.size === a.ContentLength && e.mime === a.ContentType,
    },
  });
  const result = await route.POST(
    new Request("https://portfolio.test/api/upload/complete", {
      method: "POST",
      body: JSON.stringify({ id: "x" }),
    }),
  );
  assert.equal(result.status, 400);
  assert.equal(removed, true);
  assert.equal(updated, false);
});
