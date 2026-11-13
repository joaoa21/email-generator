import { accessFrom } from "../lib/access.mjs";
import { MOTOR } from "../lib/motor.generated.mjs";

// Código das ferramentas (modelos de e-mail, editor, gerador de link): só sai daqui com
// o cookie de acesso. O arquivo motor.generated.mjs é montado pelo scripts/build.mjs.
export default async (req, context) => {
  const tool = context.params.tool;
  if (!Object.prototype.hasOwnProperty.call(MOTOR, tool)) return new Response("// não encontrado", { status: 404 });
  if (!(await accessFrom(req))) {
    return new Response("// assinatura necessária", { status: 403, headers: { "content-type": "text/javascript; charset=utf-8", "cache-control": "no-store" } });
  }
  return new Response(MOTOR[tool], {
    headers: {
      "content-type": "text/javascript; charset=utf-8",
      "cache-control": "private, no-store",
      "x-robots-tag": "noindex",
    },
  });
};

export const config = { path: "/api/motor/:tool" };
