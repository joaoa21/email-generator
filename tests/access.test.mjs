import { test } from "node:test";
import assert from "node:assert/strict";
import { SignJWT, exportJWK, generateKeyPair, createLocalJWKSet } from "jose";
import {
  isActive,
  kiwifyRecord,
  mergeRecord,
  readAccess,
  signAccess,
  validKiwifySignature,
  verifyAuthToken,
} from "../netlify/lib/access.mjs";

const NOW = Date.parse("2026-11-12T12:00:00Z");
const DAY = 24 * 60 * 60 * 1000;

test("assinatura da Kiwify confere com o vetor de teste da documentação", async () => {
  const body = '{"order_id":"9b1c2d3e-0000-4000-8000-000000000001","order_status":"paid","webhook_event_type":"order_approved"}';
  assert.equal(await validKiwifySignature(body, "bf18f352a4f981b91dfa3f6d8742a81080ab8c86", "kiwify-token-de-teste"), true);
  assert.equal(await validKiwifySignature(body + " ", "bf18f352a4f981b91dfa3f6d8742a81080ab8c86", "kiwify-token-de-teste"), false);
  assert.equal(await validKiwifySignature(body, "bf18f352a4f981b91dfa3f6d8742a81080ab8c86", ""), false);
  assert.equal(await validKiwifySignature(body, null, "kiwify-token-de-teste"), false);
});

const sale = (event, extra = {}) => ({
  webhook_event_type: event,
  order_id: "o1",
  subscription_id: "s1",
  updated_at: "2026-11-12 09:00",
  Customer: { email: " Ana@Exemplo.com " },
  ...extra,
});

test("compra e renovação liberam até o fim do período", () => {
  const r = kiwifyRecord(sale("subscription_renewed", { Subscription: { customer_access: { has_access: true, access_until: "2026-12-12T03:00:00.000Z" } } }), NOW);
  assert.equal(r.email, "ana@exemplo.com");
  assert.equal(r.hasAccess, true);
  assert.equal(r.accessUntil, "2026-12-12T03:00:00.000Z");
  assert.equal(r.at, Date.parse("2026-11-12T09:00:00-03:00"));
  // compra sem os dados da assinatura: libera um mês
  const approved = kiwifyRecord(sale("order_approved"), NOW);
  assert.equal(approved.hasAccess, true);
  assert.equal(Date.parse(approved.accessUntil), NOW + 31 * DAY);
});

test("cancelamento mantém até o fim do período; reembolso, atraso e chargeback cortam", () => {
  const until = "2026-12-12T03:00:00.000Z";
  assert.equal(kiwifyRecord(sale("subscription_canceled", { Subscription: { customer_access: { has_access: true, access_until: until } } }), NOW).hasAccess, true);
  assert.equal(kiwifyRecord(sale("subscription_canceled", { Subscription: { customer_access: { has_access: false } } }), NOW).hasAccess, false);
  assert.equal(kiwifyRecord(sale("subscription_late"), NOW).hasAccess, false);
  assert.equal(kiwifyRecord(sale("order_refunded"), NOW).hasAccess, false);
  // no chargeback a Kiwify não zera customer_access: cortamos mesmo assim
  assert.equal(kiwifyRecord(sale("chargeback", { Subscription: { customer_access: { has_access: true } } }), NOW).hasAccess, false);
});

test("avisos que não mudam o acesso ou sem e-mail são ignorados", () => {
  assert.equal(kiwifyRecord(sale("pix_created"), NOW), null);
  assert.equal(kiwifyRecord(sale("order_rejected"), NOW), null);
  assert.equal(kiwifyRecord({ webhook_event_type: "order_approved" }, NOW), null);
});

test("aviso antigo que chega depois não desfaz o mais novo; corte sempre vale", () => {
  const renewed = { event: "subscription_renewed", hasAccess: true, at: 200 };
  const lateOld = { event: "subscription_late", hasAccess: false, at: 100 };
  assert.equal(mergeRecord(renewed, lateOld), renewed);
  const refund = { event: "order_refunded", hasAccess: false, at: 50 };
  assert.equal(mergeRecord(renewed, refund), refund);
  assert.equal(mergeRecord(null, lateOld), lateOld);
});

test("acesso ativo respeita a data final com um dia de tolerância", () => {
  const until = new Date(NOW).toISOString();
  assert.equal(isActive({ hasAccess: true, accessUntil: until }, NOW + DAY - 1), true);
  assert.equal(isActive({ hasAccess: true, accessUntil: until }, NOW + DAY + 1), false);
  assert.equal(isActive({ hasAccess: false, accessUntil: until }, NOW), false);
  assert.equal(isActive(null, NOW), false);
});

test("cookie de acesso: assinado, expira e não aceita adulteração", async () => {
  const { value, exp } = await signAccess("ana@exemplo.com", new Date(NOW + 30 * DAY).toISOString(), "segredo", NOW);
  assert.equal(exp, NOW + 12 * 60 * 60 * 1000);
  assert.deepEqual(await readAccess(value, "segredo", NOW), { email: "ana@exemplo.com", exp });
  assert.equal(await readAccess(value, "outro-segredo", NOW), null);
  assert.equal(await readAccess(value, "segredo", exp + 1), null);
  const [body, sig] = value.split(".");
  const forged = Buffer.from(JSON.stringify({ e: "eva@exemplo.com", x: exp })).toString("base64url");
  assert.equal(await readAccess(forged + "." + sig, "segredo", NOW), null);
  assert.equal(await readAccess(body, "segredo", NOW), null);
  // período pago acaba antes das 12 h: o cookie acompanha
  const short = await signAccess("ana@exemplo.com", new Date(NOW - DAY + 60 * 60 * 1000).toISOString(), "segredo", NOW);
  assert.equal(short.exp, NOW + 60 * 60 * 1000);
});

test("token do Authik: confere assinatura, emissor e público", async () => {
  process.env.AUTH_AUDIENCE = "emailgenerator";
  const { publicKey, privateKey } = await generateKeyPair("EdDSA", { crv: "Ed25519" });
  const jwk = { ...(await exportJWK(publicKey)), alg: "EdDSA", kid: "k1" };
  const keys = createLocalJWKSet({ keys: [jwk] });
  const sign = (claims, iss = "https://auth.emailgenerator.com.br", aud = "emailgenerator") =>
    new SignJWT(claims).setProtectedHeader({ alg: "EdDSA", kid: "k1" }).setSubject("u1").setIssuer(iss).setAudience(aud).setExpirationTime("5m").sign(privateKey);

  const ok = await verifyAuthToken(await sign({ email: "Ana@Exemplo.com", email_verified: true }), { keys });
  assert.deepEqual(ok, { userId: "u1", email: "ana@exemplo.com", emailVerified: true });
  assert.equal(await verifyAuthToken(await sign({ email: "a@b.c" }, "https://auth.outro.com.br"), { keys }), null);
  assert.equal(await verifyAuthToken(await sign({ email: "a@b.c" }, undefined, "trackik"), { keys }), null);
  assert.equal(await verifyAuthToken("nao-e-um-token", { keys }), null);
  assert.equal(await verifyAuthToken(null, { keys }), null);
});
