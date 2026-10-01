import { beforeEach, describe, expect, it, vi } from "vitest";

// What updatePage writes to the pages table, captured per test
let updatePayload: Record<string, unknown> | null = null;

/** Minimal stand-in for the Supabase query builder: every call chains, awaiting resolves */
function chain(result: unknown) {
  const q: Record<string, unknown> = {
    eq: () => q,
    neq: () => q,
    single: () => Promise.resolve(result),
    then: (resolve: (v: unknown) => unknown) => Promise.resolve(result).then(resolve),
  };
  return q;
}

vi.mock("@/lib/supabase/server", () => ({
  createClient: async () => ({
    auth: { getUser: async () => ({ data: { user: { id: "user-1" } } }) },
    from: () => ({
      select: () => chain({ data: { id: "page-1", slug: "mia" }, count: 0 }),
      update: (payload: Record<string, unknown>) => {
        updatePayload = payload;
        return chain({ error: null });
      },
    }),
  }),
}));
vi.mock("@/lib/team", () => ({ getActiveOwnerId: async () => "user-1" }));
vi.mock("@/lib/rate-limit", () => ({ rateLimit: async () => ({ ok: true }), getClientIp: () => "127.0.0.1" }));
vi.mock("next/cache", () => ({ revalidatePath: () => {} }));
vi.mock("next/navigation", () => ({
  redirect: () => {
    throw new Error("redirect");
  },
}));

const { updatePage } = await import("./pages");

function form(fields: Record<string, string>) {
  const fd = new FormData();
  for (const [k, v] of Object.entries({ slug: "mia", title: "Mia", is_active: "true", ...fields })) fd.set(k, v);
  return fd;
}

describe("updatePage", () => {
  beforeEach(() => {
    updatePayload = null;
  });

  it("leaves the age gate alone when the form doesn't send it", async () => {
    expect(await updatePage("page-1", null, form({}))).toEqual({ ok: true });
    expect(updatePayload).not.toHaveProperty("age_gate_enabled");
  });

  it("turns the age gate on and off when the form sends it", async () => {
    await updatePage("page-1", null, form({ age_gate_enabled: "true" }));
    expect(updatePayload).toMatchObject({ age_gate_enabled: true });

    await updatePage("page-1", null, form({ age_gate_enabled: "false" }));
    expect(updatePayload).toMatchObject({ age_gate_enabled: false });
  });
});
