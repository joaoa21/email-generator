import { getStore } from "@netlify/blobs";
import { CODE_RE, waUrl } from "../lib/links.mjs";

const NOT_FOUND = `<!doctype html><html lang="pt-BR"><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1"><title>Link não encontrado</title>
<body style="font-family:system-ui,sans-serif;background:#f4f1ea;color:#191713;display:grid;place-items:center;min-height:100vh;margin:0;text-align:center;padding:24px">
<div><h1 style="font-weight:600">Link não encontrado</h1><p>Confira se o endereço foi copiado inteiro.</p>
<p><a href="/gerador-link-whatsapp/" style="color:#128c4b">Criar um link de WhatsApp</a></p></div></body></html>`;

export default async (req, context) => {
  const code = String(context.params.code || "").toLowerCase();
  const store = getStore("wa-links");
  const entry = CODE_RE.test(code) ? await store.get(code, { type: "json" }) : null;

  if (!entry) {
    return new Response(NOT_FOUND, { status: 404, headers: { "content-type": "text/html; charset=utf-8" } });
  }

  // conta o clique sem atrasar o redirecionamento
  const count = store.setJSON(code, { ...entry, clicks: (entry.clicks || 0) + 1 });
  if (context.waitUntil) context.waitUntil(count);
  else await count;

  return new Response(null, {
    status: 302,
    headers: { location: waUrl(entry), "cache-control": "no-store", "x-robots-tag": "noindex" },
  });
};

export const config = { path: "/w/:code" };
