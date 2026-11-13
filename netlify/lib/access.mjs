// Acesso pago: assinatura da Kiwify + conta do Authik.
//
// 1. A Kiwify avisa (webhook) compra, renovação, atraso, cancelamento, reembolso e chargeback.
//    Guardamos por e-mail se a pessoa tem acesso e até quando (store "assinaturas").
// 2. O site manda o token curto do Authik (JWT); conferimos a assinatura do token e o e-mail.
// 3. Com assinatura ativa, entregamos um cookie assinado (HttpOnly) que libera o "motor"
//    das ferramentas e o encurtador por algumas horas, sem consultar o Authik a cada pedido.
import { createRemoteJWKSet, jwtVerify } from "jose";

export const AUTH_ORIGIN = process.env.AUTH_URL || "https://auth.emailgenerator.com.br";
export const COOKIE = "eg_acesso";
const COOKIE_HOURS = 12;
// tolerância depois do fim do período: a renovação pode cair algumas horas depois
const GRACE_MS = 24 * 60 * 60 * 1000;

const enc = new TextEncoder();

function hex(buf) {
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

async function hmac(algo, key, data) {
  const k = await crypto.subtle.importKey("raw", enc.encode(key), { name: "HMAC", hash: algo }, false, ["sign"]);
  return hex(await crypto.subtle.sign("HMAC", k, typeof data === "string" ? enc.encode(data) : data));
}

/** comparação em tempo constante (não revela quantos caracteres bateram) */
function sameText(a, b) {
  a = String(a || "");
  b = String(b || "");
  let diff = a.length ^ b.length;
  for (let i = 0; i < Math.max(a.length, b.length); i++) diff |= (a.charCodeAt(i) || 0) ^ (b.charCodeAt(i) || 0);
  return diff === 0;
}

export function normEmail(email) {
  return String(email || "").trim().toLowerCase();
}

/* ── Kiwify ── */

/** A Kiwify assina o corpo cru com HMAC-SHA1 (token do webhook) e manda em ?signature= */
export async function validKiwifySignature(rawBody, signature, token) {
  if (!token || !signature) return false;
  return sameText(await hmac("SHA-1", token, rawBody), String(signature).toLowerCase());
}

// datas da raiz do payload vêm no horário de Brasília, "YYYY-MM-DD HH:mm"
function brasilia(value) {
  const m = /^(\d{4}-\d{2}-\d{2}) (\d{2}:\d{2})/.exec(String(value || ""));
  return m ? Date.parse(`${m[1]}T${m[2]}:00-03:00`) : NaN;
}

/**
 * Resume um aviso da Kiwify no que importa para liberar o acesso.
 * Devolve { email, hasAccess, accessUntil, event, orderId, subscriptionId, at } ou null (aviso ignorado).
 */
export function kiwifyRecord(payload, now = Date.now()) {
  const event = payload?.webhook_event_type;
  const email = normEmail(payload?.Customer?.email ?? payload?.customer?.email);
  if (!event || !email) return null;

  const sub = payload.Subscription || {};
  const access = sub.customer_access || {};
  const base = {
    email,
    event,
    orderId: payload.order_id || null,
    subscriptionId: payload.subscription_id || sub.id || null,
    at: brasilia(payload.updated_at) || brasilia(payload.approved_date) || now,
  };
  const until = access.access_until || sub.next_payment || null;

  switch (event) {
    case "order_approved":
    case "subscription_renewed":
      // sem os dados da assinatura no aviso, libera um mês e espera a renovação
      return {
        ...base,
        hasAccess: access.has_access !== false,
        accessUntil: until || new Date(now + 31 * 24 * 60 * 60 * 1000).toISOString(),
      };
    case "subscription_canceled":
      // cancelou: acesso até o fim do período já pago; reembolso já vem com has_access false
      return { ...base, hasAccess: access.has_access === true, accessUntil: until };
    case "subscription_late":
      return { ...base, hasAccess: false, accessUntil: until };
    case "order_refunded":
    case "chargeback":
      // no chargeback a Kiwify não zera o customer_access: cortamos aqui
      return { ...base, hasAccess: false, accessUntil: null };
    default:
      return null; // pix/boleto gerado, recusada, carrinho, trial: não mudam o acesso
  }
}

/** Avisos podem chegar fora de ordem ou repetidos: o mais novo vale; corte de acesso sempre vale. */
export function mergeRecord(current, incoming) {
  if (!current) return incoming;
  const revokes = incoming.event === "order_refunded" || incoming.event === "chargeback";
  if (!revokes && current.at && incoming.at && incoming.at < current.at) return current;
  return incoming;
}

export function isActive(record, now = Date.now()) {
  if (!record || !record.hasAccess) return false;
  if (!record.accessUntil) return true;
  const until = Date.parse(record.accessUntil);
  return Number.isNaN(until) || now <= until + GRACE_MS;
}

/* ── Authik ── */

let jwks;
/** Confere o token curto do Authik; devolve { userId, email, emailVerified } ou null. */
export async function verifyAuthToken(token, { keys } = {}) {
  if (typeof token !== "string" || !token || token.length > 4096) return null;
  const audience = process.env.AUTH_AUDIENCE;
  if (!audience) throw new Error("AUTH_AUDIENCE não configurado");
  jwks = jwks || createRemoteJWKSet(new URL("/api/auth/jwks", AUTH_ORIGIN));
  try {
    const { payload } = await jwtVerify(token, keys || jwks, { issuer: AUTH_ORIGIN, audience, algorithms: ["EdDSA"] });
    if (typeof payload.sub !== "string" || !payload.sub) return null;
    return { userId: payload.sub, email: normEmail(payload.email), emailVerified: payload.email_verified === true };
  } catch {
    return null;
  }
}

export function bearer(req) {
  const m = /^Bearer ([A-Za-z0-9._-]+)$/.exec(req.headers.get("authorization") || "");
  return m ? m[1] : null;
}

/* ── cookie de acesso (assinado com ACCESS_SECRET) ── */

function b64url(text) {
  return btoa(unescape(encodeURIComponent(text))).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}
function unb64url(text) {
  return decodeURIComponent(escape(atob(text.replace(/-/g, "+").replace(/_/g, "/"))));
}

/** Valor do cookie: dados + assinatura. Vale até o fim do período pago ou COOKIE_HOURS, o que vier antes. */
export async function signAccess(email, accessUntil, secret, now = Date.now()) {
  let exp = now + COOKIE_HOURS * 60 * 60 * 1000;
  const until = accessUntil ? Date.parse(accessUntil) + GRACE_MS : NaN;
  if (!Number.isNaN(until)) exp = Math.min(exp, until);
  const body = b64url(JSON.stringify({ e: email, x: exp }));
  return { value: body + "." + (await hmac("SHA-256", secret, body)), exp };
}

export async function readAccess(value, secret, now = Date.now()) {
  const [body, sig] = String(value || "").split(".");
  if (!body || !sig || !secret) return null;
  if (!sameText(await hmac("SHA-256", secret, body), sig)) return null;
  try {
    const data = JSON.parse(unb64url(body));
    return data.x > now ? { email: data.e, exp: data.x } : null;
  } catch {
    return null;
  }
}

export function cookieFrom(req, name = COOKIE) {
  const m = new RegExp("(?:^|;\\s*)" + name + "=([^;]+)").exec(req.headers.get("cookie") || "");
  return m ? m[1] : null;
}

/** Quem tem acesso liberado agora (cookie válido), ou null. */
export async function accessFrom(req) {
  return readAccess(cookieFrom(req), process.env.ACCESS_SECRET);
}

export function accessCookie(value, exp) {
  const maxAge = Math.max(0, Math.floor((exp - Date.now()) / 1000));
  return `${COOKIE}=${value}; Path=/; Max-Age=${maxAge}; HttpOnly; Secure; SameSite=Lax`;
}
