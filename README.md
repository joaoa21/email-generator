# Email Generator

Ferramentas para quem produz campanhas: um **gerador de emails HTML** que funcionam no Gmail e no Outlook e um **gerador de links de WhatsApp** com mensagem pronta.

**[emailgenerator.com.br](https://emailgenerator.com.br)** · [Case no portfólio](https://joaoa.com.br/projetos/sites/email-generator/)

![Email Generator](https://joaoa.com.br/assets/img/og-email-generator.jpg)

Criei para escalar a produção de campanhas de CRM: em vez de montar cada email à mão, o time preenche os campos e copia um HTML pronto, testado nos principais programas de email.

## O que faz

**Gerador de email**
- Monta o email por blocos: logo, banner, título, textos, botões, redes sociais e rodapé legal com descadastro.
- Editor de texto com negrito, links, cores e tamanhos, e **variáveis** de personalização.
- Pré-cabeçalho (o texto que aparece ao lado do assunto no Gmail).
- Cores, fundos e estilo dos ícones configuráveis.
- **Prévia ao vivo** em desktop e celular, e HTML pronto para copiar.

**Gerador de link de WhatsApp**
- Número com máscara, mensagem com formatação do WhatsApp (negrito, itálico, riscado), modelos prontos e contador de caracteres.
- Copia o link `wa.me` ou abre direto no WhatsApp.

## Decisões técnicas

- **HTML de email à prova de Outlook:** layout em tabelas, estilos inline e **botões em VML** dentro de comentários condicionais (`<!--[if mso]>`), para o Outlook clássico, que usa o motor do Word, mostrar o botão arredondado.
- **Colar sem sujeira:** o texto colado de outros lugares é limpo (atributos e estilos removidos) antes de entrar no email.
- **Prévia isolada:** o email é renderizado num `<iframe>`, sem herdar o CSS da página.
- **Sem dependências e sem build:** HTML, CSS e JavaScript puros; abre rápido e é fácil de manter.

## Stack

HTML · CSS · JavaScript · HTML de email (tabelas, CSS inline, VML) · Lenis

## Rodar localmente

É um site estático. Sirva a pasta com qualquer servidor local, por exemplo:

```bash
npx http-server .
```

## Estrutura

```
index.html, style.css, script.js   página inicial
pages/gerador/                     gerador de email HTML
pages/whatsapp/                    gerador de link de WhatsApp
```

---

Feito por **João Alberto** — designer e desenvolvedor front-end · [joaoa.com.br](https://joaoa.com.br) · [LinkedIn](https://www.linkedin.com/in/joaoa210/)
