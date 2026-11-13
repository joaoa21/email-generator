// O front não tem build: este script só copia os arquivos públicos para dist/,
// para que package.json, funções e afins não sejam publicados junto com o site.
// (cópia manual: o fs.cpSync do Node 22 trava no Windows com acentos no caminho)
import { copyFileSync, mkdirSync, readFileSync, readdirSync, rmSync, statSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const PUBLIC = [
  "index.html", "404.html", "style.css", "script.js", "robots.txt", "sitemap.xml", "llms.txt",
  "favicon.ico", "favicon.svg", "apple-touch-icon.png", "site.webmanifest",
  "gerador-de-email-html", "gerador-link-whatsapp", "guias",
  "entrar",
  "criar-conta",
  "verificar-email",
  "redefinir-senha", "assets",
];

// "Motor" das ferramentas: não vai para dist/. Fica dentro da função /api/motor/:tool,
// que só entrega o código a quem tem assinatura ativa (cookie de acesso).
const MOTOR = {
  email: [
    ...["cards", "gradient", "minimal", "coupon", "newsletter", "vitrine", "invite", "letter"].map(
      (t) => `gerador-de-email-html/templates/${t}.js`
    ),
    "gerador-de-email-html/script.js",
  ],
  whatsapp: ["gerador-link-whatsapp/script.js"],
};
const PRIVATE = new Set(Object.values(MOTOR).flat().concat("gerador-de-email-html/templates").map((p) => join(p)));

function copy(src, dest) {
  if (PRIVATE.has(join(src))) return;
  if (statSync(src).isDirectory()) {
    mkdirSync(dest, { recursive: true });
    for (const name of readdirSync(src)) copy(join(src, name), join(dest, name));
  } else {
    copyFileSync(src, dest);
  }
}

rmSync("dist", { recursive: true, force: true });
mkdirSync("dist");
for (const path of PUBLIC) copy(path, join("dist", path));

const bundles = Object.fromEntries(
  Object.entries(MOTOR).map(([tool, files]) => [tool, files.map((f) => readFileSync(f, "utf8")).join("\n;\n")])
);
writeFileSync(
  "netlify/lib/motor.generated.mjs",
  "// Gerado por scripts/build.mjs. Não editar.\nexport const MOTOR = " + JSON.stringify(bundles) + ";\n"
);

console.log("dist/ pronto:", PUBLIC.join(", "));
console.log("motor:", Object.entries(bundles).map(([t, code]) => `${t} ${Math.round(code.length / 1024)} KB`).join(", "));
