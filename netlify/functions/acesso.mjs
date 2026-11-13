import { getStore } from "@netlify/blobs";
import { json } from "../lib/links.mjs";
import { accessCookie, bearer, isActive, signAccess, verifyAuthToken } from "../lib/access.mjs";

// O site manda o token curto do Authik; se o e-mail da conta tem assinatura ativa,
// devolve um cookie que libera o motor das ferramentas e o encurtador.
export default async (req) => {
  if (req.method !== "POST") return json({ error: "Método não permitido" }, 405);

  const account = await verifyAuthToken(bearer(req));
  if (!account || !account.email) return json({ active: false, reason: "login" }, 401);
  if (!account.emailVerified) return json({ active: false, reason: "email" }, 403);

  const record = await getStore("assinaturas").get(encodeURIComponent(account.email), { type: "json" });
  if (!isActive(record)) return json({ active: false, reason: "assinatura", email: account.email });

  const { value, exp } = await signAccess(account.email, record.accessUntil, process.env.ACCESS_SECRET);
  const res = json({ active: true, until: record.accessUntil });
  res.headers.set("set-cookie", accessCookie(value, exp));
  return res;
};

export const config = {
  path: "/api/acesso",
  rateLimit: { windowLimit: 30, windowSize: 60, aggregateBy: ["ip", "domain"] },
};
