# Email Generator

Ferramentas para quem produz campanhas: um **gerador de emails HTML** que funcionam no Gmail e no Outlook e um **gerador de links de WhatsApp** com mensagem pronta.

**[emailgenerator.com.br](https://emailgenerator.com.br)** · [Case no portfólio](https://joaoa.com.br/projetos/sites/email-generator/)

![Email Generator](https://joaoa.com.br/assets/img/og-email-generator.jpg)

Criei para escalar a produção de campanhas de CRM: em vez de montar cada email à mão, o time preenche os campos e copia um HTML pronto, testado nos principais programas de email.

## O que faz

**Gerador de email**
- **Oito modelos** de layout (Cartões, Gradiente, Minimalista, Cupom, Newsletter, Vitrine, Convite e Carta pessoal): troque a estrutura do email sem perder textos, links e imagens. Cada modelo traz suas cores e combinações prontas.
- Editor em etapas (Modelos, Topo, Texto, Botão, Cores, Redes, Rodapé), um painel por vez, no estilo do Canva.
- Monta o email por blocos: logo, banner, título, textos, botões, redes sociais e rodapé legal com descadastro.
- Editor de texto com negrito, links, cores e tamanhos, e **variáveis** de personalização.
- Pré-cabeçalho (o texto que aparece ao lado do assunto no Gmail).
- Combinações de cores prontas e ajuste fino de cada cor.
- **Prévia ao vivo** em desktop e celular, e HTML pronto para copiar.
- **Avisos antes de enviar:** aponta o que falta (link de descadastro, texto alternativo, botão sem link, URLs inválidas) e leva ao campo com um clique.
- Blocos de texto podem ser reordenados e duplicados; "Novo" e "Remover" têm **Desfazer**.

**Gerador de link de WhatsApp**
- Número com máscara e validação (DDD, nono dígito), outros países, mensagem com formatação do WhatsApp e modelos prontos.
- **Prévia da conversa** com a formatação já aplicada.
- **Link curto no próprio domínio** (`emailgenerator.com.br/w/código`) com **contagem de cliques**.
- **QR Code** em PNG, apontando para o link curto quando ele existe.

## Decisões técnicas

- **HTML de email à prova de Outlook:** layout em tabelas, estilos inline e **botões em VML** dentro de comentários condicionais (`<!--[if mso]>`), com largura calculada pelo texto, para o Outlook clássico (motor do Word) mostrar o botão arredondado.
- **Segurança:** a prévia roda num `<iframe sandbox>` sem permissão de script; todo valor é escapado, URLs só passam com `https:`, `mailto:`, `tel:` ou variáveis de ESP, e o texto rico é limpo por uma lista de tags permitidas. A página não tem scripts nem handlers inline, o que permite uma **Content-Security-Policy** rígida (`netlify.toml`).
- **Encurtador que não vira arma de phishing:** a função recebe só número e mensagem e monta o destino `wa.me` ela mesma, então um link curto nunca leva para fora do WhatsApp. O código é derivado do conteúdo (SHA-256), então o mesmo link gera sempre o mesmo código. Há limite de requisições por IP.
- **Prévia fluida:** depois da primeira carga, só o `<body>` do iframe é trocado (com debounce), sem recarregar a página nem baixar as imagens de novo.
- **Acessibilidade:** campos com rótulo, botões de ícone com `aria-label`, estados com `aria-pressed`/`aria-invalid`, menu navegável pelo teclado e respeito a `prefers-reduced-motion`.
- **Listas repetíveis:** matérias e produtos usam o mesmo componente (adicionar, reordenar, duplicar, excluir com Desfazer), pronto para outros tipos de item.
- **Modelos plugáveis:** cada modelo é um arquivo em `gerador-de-email-html/templates/` que monta o layout com peças prontas (botão com VML, ícones, blocos de texto, rodapé), já escapadas e validadas.
- **Front sem dependências:** HTML, CSS e JavaScript puros. O backend é só o encurtador (Netlify Functions + Netlify Blobs).

## Stack

HTML · CSS · JavaScript · HTML de email (tabelas, CSS inline, VML) · Netlify Functions · Netlify Blobs · Lenis

## Rodar localmente

Com o encurtador (precisa da [Netlify CLI](https://docs.netlify.com/cli/get-started/)):

```bash
npm install
npx netlify dev
```

Só o front (o encurtador fica indisponível):

```bash
npx http-server .
```

Testes: `npm test`.

## Estrutura

```
index.html, style.css, script.js     página inicial
gerador-de-email-html/               gerador de email HTML
gerador-de-email-html/templates/     modelos de email (um arquivo por modelo)
gerador-link-whatsapp/               gerador de link de WhatsApp
guias/                               guias (e-mail HTML, botão VML no Outlook, link de WhatsApp)
404.html, robots.txt, sitemap.xml    página de erro e arquivos para buscadores
llms.txt                             descrição do site para buscadores com IA
assets/                              imagens, favicon e aviso de cookies
netlify/functions/                   encurtador: /api/shorten, /w/:código, /api/links/:código
netlify/lib/                         regras do encurtador (testadas em tests/)
scripts/build.mjs                    copia os arquivos públicos para dist/
```

---

Feito por **João Alberto** — designer e desenvolvedor front-end · [joaoa.com.br](https://joaoa.com.br) · [LinkedIn](https://www.linkedin.com/in/joaoa210/)
