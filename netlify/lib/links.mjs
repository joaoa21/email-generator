// Regras compartilhadas pelo encurtador de links de WhatsApp.

export const MAX_TEXT = 1000;

// sem 0/o e 1/l/i: o código pode ser lido em voz alta ou digitado sem confusão
const ALPHABET = "23456789abcdefghjkmnpqrstuvwxyz";
export const CODE_RE = /^[23456789abcdefghjkmnpqrstuvwxyz]{6,12}$/;

/* valida e limpa a entrada; lança Error com mensagem para o usuário */
export function normalize(input) {
  const phone = String(input?.phone ?? "").replace(/\D/g, "");
  const text = String(input?.text ?? "").trim();
  if (phone.length < 8 || phone.length > 15) throw new Error("Número inválido");
  if (text.length > MAX_TEXT) throw new Error(`A mensagem passa de ${MAX_TEXT} caracteres`);
  return { phone, text };
}

/* o destino é sempre montado aqui: o encurtador só redireciona para o WhatsApp */
export function waUrl({ phone, text }) {
  return "https://wa.me/" + phone + (text ? "?text=" + encodeURIComponent(text) : "");
}

/* código determinístico: o mesmo número + mensagem gera sempre o mesmo link curto */
export async function codeFor({ phone, text }, length = 7) {
  const data = new TextEncoder().encode(phone + "\n" + text);
  const hash = new Uint8Array(await crypto.subtle.digest("SHA-256", data));
  let code = "";
  for (let i = 0; i < length; i++) code += ALPHABET[hash[i] % ALPHABET.length];
  return code;
}

export function json(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" },
  });
}
