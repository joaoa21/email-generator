import { getStore } from "@netlify/blobs";
import { json } from "../lib/links.mjs";
import { customerEmail, kiwifyRecord, mergeRecord, validKiwifySignature } from "../lib/access.mjs";

// Avisos da Kiwify (compra, renovação, atraso, cancelamento, reembolso, chargeback).
// URL cadastrada na Kiwify: https://emailgenerator.com.br/api/kiwify — o token vai em KIWIFY_TOKEN.
export default async (req) => {
  if (req.method !== "POST") return json({ error: "Método não permitido" }, 405);

  // a assinatura é sobre o corpo cru: ler como texto antes de interpretar o JSON
  const raw = await req.text();
  const signature = new URL(req.url).searchParams.get("signature");
  if (!(await validKiwifySignature(raw, signature, process.env.KIWIFY_TOKEN))) {
    console.log("kiwify: assinatura inválida");
    return json({ error: "Assinatura inválida" }, 401);
  }

  let payload;
  try {
    payload = JSON.parse(raw);
  } catch {
    return json({ error: "Requisição inválida" }, 400);
  }

  const record = kiwifyRecord(payload);
  // log sem dados pessoais: tipo do aviso, se achou o e-mail e o resultado
  const found = !!customerEmail(payload);
  if (!record) {
    console.log("kiwify:", payload.webhook_event_type || "sem tipo", "| e-mail:", found ? "sim" : "não", "| ignorado",
      found ? "" : "| campos: " + Object.keys(payload).join(",") + (payload.Customer ? " | Customer: " + Object.keys(payload.Customer).join(",") : ""));
    return json({ ok: true, ignored: true }); // aviso que não muda o acesso
  }

  const store = getStore("assinaturas");
  const key = encodeURIComponent(record.email);
  const current = await store.get(key, { type: "json" });
  const saved = mergeRecord(current, record);
  await store.setJSON(key, { ...saved, updated: new Date().toISOString() });
  console.log("kiwify:", record.event, "| e-mail: sim | acesso:", saved.hasAccess ? "liberado até " + saved.accessUntil : "cortado",
    saved === current ? "| (aviso antigo, mantido o mais novo)" : "");
  return json({ ok: true });
};

export const config = { path: "/api/kiwify" };
