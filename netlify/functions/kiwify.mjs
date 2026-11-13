import { getStore } from "@netlify/blobs";
import { json } from "../lib/links.mjs";
import { kiwifyRecord, mergeRecord, validKiwifySignature } from "../lib/access.mjs";

// Avisos da Kiwify (compra, renovação, atraso, cancelamento, reembolso, chargeback).
// URL cadastrada na Kiwify: https://emailgenerator.com.br/api/kiwify — o token vai em KIWIFY_TOKEN.
export default async (req) => {
  if (req.method !== "POST") return json({ error: "Método não permitido" }, 405);

  // a assinatura é sobre o corpo cru: ler como texto antes de interpretar o JSON
  const raw = await req.text();
  const signature = new URL(req.url).searchParams.get("signature");
  if (!(await validKiwifySignature(raw, signature, process.env.KIWIFY_TOKEN))) return json({ error: "Assinatura inválida" }, 401);

  let payload;
  try {
    payload = JSON.parse(raw);
  } catch {
    return json({ error: "Requisição inválida" }, 400);
  }

  const record = kiwifyRecord(payload);
  if (!record) return json({ ok: true, ignored: true }); // aviso que não muda o acesso

  const store = getStore("assinaturas");
  const key = encodeURIComponent(record.email);
  const current = await store.get(key, { type: "json" });
  await store.setJSON(key, { ...mergeRecord(current, record), updated: new Date().toISOString() });
  return json({ ok: true });
};

export const config = { path: "/api/kiwify" };
