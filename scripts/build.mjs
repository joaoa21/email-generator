// O front não tem build: este script só copia os arquivos públicos para dist/,
// para que package.json, funções e afins não sejam publicados junto com o site.
// (cópia manual: o fs.cpSync do Node 22 trava no Windows com acentos no caminho)
import { copyFileSync, mkdirSync, readdirSync, rmSync, statSync } from "node:fs";
import { join } from "node:path";

const PUBLIC = ["index.html", "style.css", "script.js", "pages", "assets"];

function copy(src, dest) {
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

console.log("dist/ pronto:", PUBLIC.join(", "));
