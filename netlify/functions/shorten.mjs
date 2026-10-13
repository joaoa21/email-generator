import { getStore } from "@netlify/blobs";
import { codeFor, json, normalize } from "../lib/links.mjs";

export default async (req) => {
  if (req.method !== "POST") return json({ error: "Método não permitido" }, 405);

  let link;
  try {
    link = normalize(await req.json());
  } catch (e) {
    return json({ error: e instanceof SyntaxError ? "Requisição inválida" : e.message }, 400);
  }

  const store = getStore("wa-links");
  const origin = new URL(req.url).origin;

  // em caso de colisão (outro link com o mesmo código), aumenta o tamanho do código
  for (let len = 7; len <= 12; len++) {
    const code = await codeFor(link, len);
    const existing = await store.get(code, { type: "json" });
    if (existing && (existing.phone !== link.phone || existing.text !== link.text)) continue;

    if (!existing) {
      await store.setJSON(code, { ...link, created: new Date().toISOString(), clicks: 0 });
    }
    return json({ code, url: `${origin}/w/${code}`, clicks: existing?.clicks ?? 0 }, existing ? 200 : 201);
  }

  return json({ error: "Não foi possível gerar o link. Tente novamente." }, 500);
};

export const config = {
  path: "/api/shorten",
  rateLimit: { windowLimit: 30, windowSize: 60, aggregateBy: ["ip", "domain"] },
};
