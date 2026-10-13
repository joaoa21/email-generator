import { getStore } from "@netlify/blobs";
import { CODE_RE, json } from "../lib/links.mjs";

/* cliques de um link curto (não devolve número nem mensagem) */
export default async (req, context) => {
  const code = String(context.params.code || "").toLowerCase();
  if (!CODE_RE.test(code)) return json({ error: "Código inválido" }, 400);

  const entry = await getStore("wa-links").get(code, { type: "json" });
  if (!entry) return json({ error: "Link não encontrado" }, 404);

  return json({ code, clicks: entry.clicks || 0, created: entry.created });
};

export const config = { path: "/api/links/:code" };
