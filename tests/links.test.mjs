import { test } from "node:test";
import assert from "node:assert/strict";
import { CODE_RE, codeFor, normalize, waUrl } from "../netlify/lib/links.mjs";

test("normalize limpa o número e valida tamanhos", () => {
  assert.deepEqual(normalize({ phone: "+55 (81) 98878-0144", text: "  oi  " }), { phone: "5581988780144", text: "oi" });
  assert.throws(() => normalize({ phone: "123" }), /Número inválido/);
  assert.throws(() => normalize({ phone: "5581988780144", text: "x".repeat(1001) }), /1000/);
  assert.throws(() => normalize(null), /Número inválido/);
});

test("waUrl sempre aponta para wa.me", () => {
  assert.equal(waUrl({ phone: "5581988780144", text: "" }), "https://wa.me/5581988780144");
  assert.equal(
    waUrl({ phone: "5581988780144", text: "Olá! 💬" }),
    "https://wa.me/5581988780144?text=Ol%C3%A1!%20%F0%9F%92%AC",
  );
});

test("codeFor é determinístico e casa com CODE_RE", async () => {
  const link = { phone: "5581988780144", text: "Olá" };
  const a = await codeFor(link);
  assert.equal(a, await codeFor(link));
  assert.equal(a.length, 7);
  assert.match(a, CODE_RE);
  assert.notEqual(a, await codeFor({ ...link, text: "Oi" }));
});
