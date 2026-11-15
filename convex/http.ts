import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";
import { internal } from "./_generated/api";
import type { Id } from "./_generated/dataModel";
import { normalizePhone, replyForCrews, secretsMatch } from "./keiki";

declare const process: { env: Record<string, string | undefined> };

const http = httpRouter();

function json(status: number, body: unknown) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

http.route({
  path: "/checkin",
  method: "POST",
  handler: httpAction(async (ctx, req) => {
    const secret = process.env.KEIKI_SHARED_SECRET;
    if (!secret) return json(500, { ok: false, error: "KEIKI_SHARED_SECRET is not set on this deployment" });
    const auth = req.headers.get("Authorization") ?? "";
    const token = auth.startsWith("Bearer ") ? auth.slice(7) : "";
    if (!token || !(await secretsMatch(token, secret))) return json(401, { ok: false, error: "unauthorized" });

    let body: unknown;
    try {
      body = await req.json();
    } catch {
      return json(400, { ok: false, error: "invalid_json" });
    }
    if (typeof body !== "object" || body === null) return json(400, { ok: false, error: "invalid_json" });
    const { phone, text, mediaUrl } = body as Record<string, unknown>;
    if (typeof phone !== "string" || !phone.trim()) return json(400, { ok: false, error: "missing_phone" });
    const e164 = normalizePhone(phone);
    if (!e164) return json(400, { ok: false, error: "invalid_phone" });

    const found = await ctx.runQuery(internal.keiki.memberByPhone, { phone: e164 });
    if (found.status !== "ok") return json(404, { ok: false, error: found.status });

    let photoStorageId: Id<"_storage"> | undefined;
    if (typeof mediaUrl === "string" && mediaUrl) {
      try {
        const res = await fetch(mediaUrl);
        if (res.ok) photoStorageId = await ctx.storage.store(await res.blob());
      } catch {
        photoStorageId = undefined;
      }
    }

    const { name, results } = await ctx.runMutation(internal.keiki.recordTextCheckins, {
      userId: found.userId,
      note: typeof text === "string" ? text.trim() || undefined : undefined,
      photoStorageId,
    });
    if (results.length === 0) return json(404, { ok: false, error: "no_group" });
    return json(200, {
      ok: true,
      alreadyCheckedIn: results.every((r) => r.alreadyCheckedIn),
      results: results.map((r) => ({ group: r.group, alreadyCheckedIn: r.alreadyCheckedIn, day: r.day, streak: r.streak })),
      day: results[0].day,
      name,
      goal: results[0].goal,
      replyText: replyForCrews(results.map((r) => ({ groupName: r.group.name, alreadyCheckedIn: r.alreadyCheckedIn, streak: r.streak }))),
    });
  }),
});

export default http;
