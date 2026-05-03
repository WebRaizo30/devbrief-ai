/** POST /api/brief için işlem bazlı kota (bellek içi sabit pencere). */

const WINDOW_MS = 60_000;
/** Aynı IP kaynağı için dakika başına en fazla istek — Groq/API maliyetini sınırlar */
const MAX_PER_WINDOW = 15;

type Entry = {
  /** Pencere başlangıcı (epoch ms) */
  windowStart: number;
  /** Bu pencerede sayılan istek sayısı */
  count: number;
};

const store = new Map<string, Entry>();
let pruneCounter = 0;

function pruneStale(now: number) {
  pruneCounter++;
  if (pruneCounter % 200 !== 0) return;
  const cutoff = now - WINDOW_MS * 3;
  for (const k of Array.from(store.keys())) {
    const v = store.get(k);
    if (v !== undefined && v.windowStart < cutoff) store.delete(k);
  }
}

/**
 * Köken (proxy/Vercel) başlıklarından olabildiğince güvenilir istemci ip/sürüm dizgesi.
 * Gerçek IP’leri proxy güvenilir ayarları olmadan sahte olabilir; yine de basit kota için yeterli.
 */
export function briefRequestIdentity(req: Request): string {
  const h = req.headers;
  const xff = h.get("x-forwarded-for");
  if (xff) {
    const first = xff.split(",")[0]?.trim();
    if (first) return `xf:${first}`;
  }
  const real = h.get("x-real-ip")?.trim();
  if (real) return `ri:${real}`;
  const cf = h.get("cf-connecting-ip")?.trim();
  if (cf) return `cf:${cf}`;
  return "unknown";
}

export function consumeBriefQuota(
  key: string
): { ok: true } | { ok: false; retryAfterSeconds: number } {
  const now = Date.now();
  pruneStale(now);

  const k = `brief:${key}`;
  const eExisting = store.get(k);

  if (!eExisting || now - eExisting.windowStart >= WINDOW_MS) {
    store.set(k, { windowStart: now, count: 1 });
    return { ok: true };
  }

  if (eExisting.count >= MAX_PER_WINDOW) {
    const waitMs = eExisting.windowStart + WINDOW_MS - now;
    return {
      ok: false,
      retryAfterSeconds: Math.max(1, Math.ceil(waitMs / 1000)),
    };
  }

  eExisting.count += 1;
  return { ok: true };
}
