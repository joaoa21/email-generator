(function () {
  "use strict";

  function $(id) {
    return document.getElementById(id);
  }
  function each(list, fn) {
    Array.prototype.forEach.call(list, fn);
  }

  var YEAR = new Date().getFullYear();
  var SAVE_KEY = "emailgen_state";

  /* ── ESTADO PADRÃO ── */
  var DEFAULT_BLOCK =
    "Olá, {{nome}}! Escreva aqui o conteúdo do seu e-mail. Você pode usar <b>negrito</b>, <i>itálico</i>, listas e links.<br><br>Adicione quantos blocos de texto quiser usando o botão abaixo.";

  var PLACEHOLDER_LOGO = "https://placehold.co/250x70/transparent/ffffff/png?text=Sua+Logo";
  var OLD_PLACEHOLDERS = /^https:\/\/(via\.placeholder\.com\/200x60\/1e293b|placehold\.co\/250x70\/1e293b)/;

  var DEFAULTS = {
    fields: {
      previewText: "",
      // fundo transparente: o exemplo combina com qualquer cor de cartão
      logoUrl: PLACEHOLDER_LOGO,
      logoLink: "",
      logoAlt: "Sua Empresa",
      bannerUrl: "",
      bannerLink: "",
      bannerAlt: "",
      titleText: "Seu título aqui",
      titleColorHex: "#242424",
      btnText: "Saiba mais",
      btnLink: "",
      btnBgHex: "#2563eb",
      btnTxtHex: "#ffffff",
      btnBorderHex: "#1d4ed8",
      bgHex: "#f0f0f0",
      cardAccentHex: "#1e293b",
      cardBgHex: "#ffffff",
      cardBorderHex: "#e1e1e6",
      footerLegal:
        "Este e-mail foi enviado para você porque você se cadastrou em nossa lista.\n© " +
        YEAR +
        " Sua Empresa. Todos os direitos reservados.",
      footerLegalColorHex: "#dadada",
      footerSocialText: "Siga nossas redes sociais!",
      footerSocialColorHex: "#ffffff",
      footerUnsub: "Para cancelar o recebimento destes e-mails,",
      footerUnsubColorHex: "#999999",
      footerUnsubUrl: "",
      instaUrl: "",
      teleUrl: "",
      ytUrl: "",
      waUrl: "",
      socialIconStyle: "mono",
      socialIconSize: "md",
      socialIconColorHex: "#ffffff",
      textHex: "#242424",
      nav1Text: "",
      nav1Url: "",
      nav2Text: "",
      nav2Url: "",
      warningText: "",
      footerLogoUrl: "",
      gradBaseHex: "#021619",
      gradGlowHex: "#0a4048",
      gradBorderHex: "#2a6a73",
      footerBgHex: "#eaedee",
      lineHex: "#e7e5e4",
      couponEyebrow: "Presente para você",
      couponValue: "20% OFF",
      couponCode: "BEMVINDO20",
      couponExpiry: "Válido até 30/11",
      couponRules: "Válido para compras acima de R$ 100. Não cumulativo com outras promoções.",
      couponAccentHex: "#c8451f",
      couponBoxHex: "#fff6ef",
      newsEdition: "Edição #12",
      newsDate: "Outubro de 2026",
      newsLayout: "stack",
      newsAccentHex: "#c8451f",
      vitrineHeading: "Mais vendidos da semana",
      vitrineCols: "2",
      vitrineAccentHex: "#191713",
      eventEyebrow: "Você está convidado",
      eventDate: "2026-11-26",
      eventStart: "19:00",
      eventEnd: "22:00",
      eventWhere: "Espaço Cultural Centro",
      eventAddress: "Rua da Paz, 120 · São Paulo, SP",
      eventMapUrl: "",
      inviteAccentHex: "#9a6b2f",
      letterClosing: "Um abraço,",
      letterName: "Ana Souza",
      letterRole: "Head de Marketing",
      letterCompany: "Sua Empresa",
      letterPhoto: "https://placehold.co/96x96/e7e2d8/6b6459/png?text=AS",
      letterPs: "P.S.: se tiver qualquer dúvida, é só responder este e-mail. Eu leio todos.",
      letterCta: "link",
      signatureText: "Abraços,\nEquipe Sua Empresa",
    },
    checks: {
      logoEnabled: true,
      titleEnabled: true,
      btnEnabled: true,
      btnNewTab: true,
      btnBorderOn: true,
      btnUppercase: true,
      footerEnabled: true,
      unsubEnabled: true,
      btnArrow: false,
      warningEnabled: false,
      eventCalendar: true,
      signatureEnabled: true,
      instaOn: true,
      teleOn: false,
      ytOn: false,
      waOn: true,
    },
    blocks: [{ align: "left", content: DEFAULT_BLOCK }],
    products: [
      {
        image: "https://placehold.co/600x600/efe9df/8a857a/png?text=Foto+do+produto",
        name: "Tênis Corrida Leve",
        oldPrice: "R$ 399,90",
        price: "R$ 299,90",
        buttonText: "Comprar",
        link: "",
      },
      {
        image: "https://placehold.co/600x600/efe9df/8a857a/png?text=Foto+do+produto",
        name: "Mochila Urbana 20L",
        oldPrice: "",
        price: "R$ 189,90",
        buttonText: "Comprar",
        link: "",
      },
      {
        image: "https://placehold.co/600x600/efe9df/8a857a/png?text=Foto+do+produto",
        name: "Garrafa Térmica 750ml",
        oldPrice: "R$ 129,90",
        price: "R$ 89,90",
        buttonText: "Comprar",
        link: "",
      },
      {
        image: "https://placehold.co/600x600/efe9df/8a857a/png?text=Foto+do+produto",
        name: "Boné Esportivo",
        oldPrice: "",
        price: "R$ 79,90",
        buttonText: "Comprar",
        link: "",
      },
    ],
    articles: [
      {
        image: "https://placehold.co/1200x630/e7e2d8/8a857a/png?text=Imagem+da+mat%C3%A9ria",
        title: "O que mudou neste mês",
        text: "Um resumo curto do assunto principal da edição, com o suficiente para despertar a curiosidade.",
        link: "",
        linkText: "Ler mais",
      },
      {
        image: "https://placehold.co/1200x630/e7e2d8/8a857a/png?text=Imagem+da+mat%C3%A9ria",
        title: "Bastidores do nosso time",
        text: "Duas ou três linhas sobre a segunda matéria. Quem quiser mais detalhes clica no link.",
        link: "",
        linkText: "Ler mais",
      },
      {
        image: "",
        title: "Agenda: o que vem por aí",
        text: "Uma matéria também pode não ter imagem, como esta.",
        link: "",
        linkText: "Ver agenda",
      },
    ],
    template: "cards",
  };

  /* ── SEGURANÇA: escape, cores e URLs ── */
  function esc(s) {
    return String(s == null ? "" : s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  var HEX_RE = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i;
  function color(v, fallback) {
    v = String(v || "").trim();
    return HEX_RE.test(v) ? v : fallback;
  }
  function hex6(v) {
    return v.length === 4 ? "#" + v[1] + v[1] + v[2] + v[2] + v[3] + v[3] : v;
  }

  // variáveis de ESP: {{unsubscribe}}, *|UNSUB|*, %%unsub_url%%, [unsubscribe]
  var VAR_RE = /^(\{\{\s*[\w.\-]+\s*\}\}|\*\|[\w\-]+\|\*|%%[\w\-]+%%|\[[\w\-]+\])$/;

  /* "" = vazio, null = inválido (ex.: javascript:), string = URL segura */
  function safeUrl(raw, imageOnly) {
    var u = String(raw || "").trim();
    if (!u) return "";
    if (VAR_RE.test(u)) return u;
    if (/\s/.test(u)) return null;
    if (/^https?:\/\//i.test(u)) return u;
    if (!imageOnly && /^(mailto|tel):/i.test(u)) return u;
    if (/^[a-z][\w+.\-]*:/i.test(u)) return null; // outro esquema (javascript:, data:, ...)
    if (/^(www\.)?[\w\-]+(\.[\w\-]+)+([\/?#].*)?$/i.test(u)) return "https://" + u;
    return null;
  }

  /* ── SANITIZAÇÃO DO TEXTO RICO ──
     Só passam as tags e estilos que o editor produz; o resto é removido. */
  var KEEP_TAGS = { B: 1, STRONG: 1, I: 1, EM: 1, U: 1, S: 1, STRIKE: 1, BR: 1, SPAN: 1, FONT: 1, A: 1, UL: 1, OL: 1, LI: 1, DIV: 1, P: 1 };
  var DROP_TAGS = { SCRIPT: 1, STYLE: 1, IFRAME: 1, OBJECT: 1, EMBED: 1, TEMPLATE: 1, SVG: 1, MATH: 1, LINK: 1, META: 1, NOSCRIPT: 1, TITLE: 1, IMG: 1, VIDEO: 1, AUDIO: 1, FORM: 1, INPUT: 1, BUTTON: 1, TEXTAREA: 1, SELECT: 1 };
  var CSS_COLOR_RE = /^(#[0-9a-f]{3,6}|rgba?\(\s*[\d.\s,%]+\)|[a-z]{3,20})$/i;

  function cleanAttrs(el, tag) {
    var keep = {};
    var css = [];
    if (tag === "A") {
      var href = safeUrl(el.getAttribute("href"));
      if (href) keep.href = href;
    }
    if (tag === "FONT") {
      var c = el.getAttribute("color");
      if (c && CSS_COLOR_RE.test(c.trim())) keep.color = c.trim();
    }
    var st = el.style;
    if (st.color && CSS_COLOR_RE.test(st.color)) css.push("color:" + st.color);
    if (/^\d{1,2}px$/.test(st.fontSize)) css.push("font-size:" + st.fontSize);
    if (/^(bold|[6-9]00)$/.test(st.fontWeight)) css.push("font-weight:" + st.fontWeight);
    if (st.fontStyle === "italic") css.push("font-style:italic");
    if (/^(underline|line-through)$/.test(st.textDecorationLine || st.textDecoration))
      css.push("text-decoration:" + (st.textDecorationLine || st.textDecoration));

    each(Array.prototype.slice.call(el.attributes), function (a) {
      el.removeAttribute(a.name);
    });
    Object.keys(keep).forEach(function (k) {
      el.setAttribute(k, keep[k]);
    });
    if (css.length) el.setAttribute("style", css.join(";"));
  }

  function cleanTree(node) {
    each(Array.prototype.slice.call(node.childNodes), function (n) {
      if (n.nodeType === 3) return;
      if (n.nodeType !== 1) return n.parentNode.removeChild(n);
      var tag = n.tagName.toUpperCase();
      if (DROP_TAGS[tag]) return n.parentNode.removeChild(n);
      cleanTree(n);
      if (KEEP_TAGS[tag]) return cleanAttrs(n, tag);
      while (n.firstChild) n.parentNode.insertBefore(n.firstChild, n);
      n.parentNode.removeChild(n);
    });
  }

  /* <template> é inerte: nada é carregado nem executado enquanto limpamos */
  function parse(html) {
    var tpl = document.createElement("template");
    tpl.innerHTML = html || "";
    return tpl;
  }
  function serialize(tpl) {
    var box = document.createElement("div");
    box.appendChild(tpl.content);
    return box.innerHTML;
  }
  function sanitizeRich(html) {
    var tpl = parse(html);
    cleanTree(tpl.content);
    return serialize(tpl);
  }

  /* versão para o e-mail: estilos inline em listas e links (Outlook/Gmail ignoram CSS externo) */
  function emailRich(html, linkColor) {
    var tpl = parse(sanitizeRich(html));
    each(tpl.content.querySelectorAll("ul,ol"), function (el) {
      el.setAttribute("style", "margin:0 0 0 24px;padding:0;");
    });
    each(tpl.content.querySelectorAll("li"), function (el) {
      el.setAttribute("style", "margin:0 0 6px;");
    });
    each(tpl.content.querySelectorAll("a"), function (el) {
      el.setAttribute("target", "_blank");
      el.setAttribute("rel", "noopener noreferrer");
      el.setAttribute("style", "color:" + linkColor + ";text-decoration:underline;");
    });
    return serialize(tpl);
  }

  /* ── LER O ESTADO DA TELA ── */
  function read() {
    var state = { fields: {}, checks: {}, blocks: [] };
    Object.keys(DEFAULTS.fields).forEach(function (id) {
      state.fields[id] = $(id).value;
    });
    Object.keys(DEFAULTS.checks).forEach(function (id) {
      state.checks[id] = $(id).checked;
    });
    each(document.querySelectorAll(".block-wrap"), function (block) {
      state.blocks.push({
        align: block.dataset.align || "left",
        content: block.querySelector(".editor").innerHTML,
      });
    });
    LISTS.forEach(function (list) {
      state[list.key] = list.read();
    });
    state.template = currentTemplate;
    return state;
  }

  /* ── PEÇAS DO E-MAIL ──
     Usadas pelos modelos (templates/*.js). Tudo aqui já sai escapado e com URLs validadas. */
  var TABLE = 'align="center" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation"';
  var ALIGNS = { left: 1, center: 1, right: 1 };
  var SOCIAL = [
    { key: "insta", label: "Instagram", color: "https://cdn-icons-png.flaticon.com/512/2111/2111463.png", mono: "instagram-new", radius: "100%", w: 35 },
    { key: "tele", label: "Telegram", color: "https://cdn-icons-png.flaticon.com/512/2111/2111644.png", mono: "telegram-app", radius: "10%", w: 32 },
    { key: "yt", label: "YouTube", color: "https://cdn-icons-png.flaticon.com/512/1384/1384060.png", mono: "youtube-play", radius: "10%", w: 35 },
    { key: "wa", label: "WhatsApp", color: "https://cdn-icons-png.flaticon.com/512/733/733585.png", mono: "whatsapp", radius: "10%", w: 34 },
  ];

  function image(src, alt, link, width, style) {
    var img = '<img alt="' + esc(alt) + '" src="' + esc(src) + '" style="' + style + '" width="' + width + '" />';
    var href = safeUrl(link);
    return href ? '<a href="' + esc(href) + '" target="_blank" rel="noopener noreferrer" style="display:inline-block;">' + img + "</a>" : img;
  }

  var H = {
    TABLE: TABLE,
    esc: esc,
    color: color,
    safeUrl: safeUrl,

    /* imagem com link opcional; "" se a URL for vazia ou inválida */
    image: function (url, alt, link, width, style) {
      var src = safeUrl(url, true);
      return src ? image(src, alt, link, width, style || "display:inline-block;outline:none;border:none;text-decoration:none;max-width:100%;height:auto;") : "";
    },

    /* texto com quebras de linha (escapado) */
    multiline: function (text) {
      return esc(String(text || "").trim()).replace(/\n/g, "<br />");
    },

    /* opts.darkPlaceholder: em fundos claros, troca só a logo de exemplo por uma de texto escuro */
    logo: function (s, opts) {
      var src = safeUrl(s.fields.logoUrl, true);
      if (!src) return "";
      if (opts && opts.darkPlaceholder && src === PLACEHOLDER_LOGO) src = PLACEHOLDER_LOGO.replace("/ffffff/", "/3f3f46/");
      return image(src, s.fields.logoAlt.trim() || "Logo", s.fields.logoLink, (opts && opts.width) || 250,
        "display:inline-block;outline:none;border:none;text-decoration:none;max-width:100%;height:auto;");
    },

    banner: function (s, opts) {
      var src = safeUrl(s.fields.bannerUrl, true);
      if (!src) return "";
      return image(src, s.fields.bannerAlt.trim(), s.fields.bannerLink, 600,
        "display:block;outline:none;border:none;text-decoration:none;width:100%;height:auto;" +
          (opts && opts.radius ? "border-radius:" + opts.radius + "px;" : ""));
    },

    /* blocos de texto; <div> e não <p>, porque listas dentro de <p> quebram em alguns clientes.
       opts.fontSize e opts.weight mudam o corpo do texto (padrão 16 e 500). */
    blocks: function (s, linkColor, opts) {
      var size = (opts && opts.fontSize) || 16;
      var weight = (opts && opts.weight) || (size > 16 ? 400 : 500);
      var out = "";
      s.blocks.forEach(function (b) {
        var content = emailRich(b.content, linkColor).trim();
        if (!content || !content.replace(/<br\s*\/?>/g, "").trim()) return;
        out +=
          '<div style="font-size:' + size + 'px;line-height:165%;font-weight:' + weight + ';margin:16px 0;text-align:' +
          (ALIGNS[b.align] ? b.align : "left") + ';">' + content + "</div>";
      });
      return out;
    },

    /* botão com versão VML para o Outlook clássico (motor do Word).
       opts: { font, fontSize, radius } para cada modelo ter o seu estilo. */
    button: function (s, opts) {
      opts = opts || {};
      var f = s.fields;
      var c = s.checks;
      var text = f.btnText.trim();
      if (!c.btnEnabled || !text) return "";
      var link = safeUrl(f.btnLink);
      var href = esc(link || "#");
      var target = c.btnNewTab && link ? ' target="_blank" rel="noopener noreferrer"' : "";
      var bg = color(f.btnBgHex, "#2563eb");
      var fg = color(f.btnTxtHex, "#ffffff");
      var border = color(f.btnBorderHex, "#000000");
      var borderCss = c.btnBorderOn ? "border:2px solid " + border + ";" : "border:none;";
      var caps = c.btnUppercase ? "text-transform:uppercase;letter-spacing:0.02em;" : "";
      var font = opts.font || "Arial,sans-serif";
      var size = opts.fontSize || 16;
      var radius = opts.radius || 10;
      var weight = opts.weight || 900;
      var align = opts.align || "center";
      // o VML não estica com o texto: a largura é estimada
      var arrow = c.btnArrow;
      var vmlWidth = Math.min(560, Math.max(160, Math.round(text.length * size * 0.72) + (arrow ? 96 : 64)));
      var label = '<span style="max-width:100%;display:inline-block;vertical-align:middle;line-height:120%;">' + esc(text) + "</span>";
      // com seta: texto + quadradinho com o ícone, alinhados por tabela (funciona nos principais clientes)
      if (arrow) {
        var box = Math.round(size * 1.65);
        var icon = Math.round(box * 0.56);
        var pad = Math.round((box - icon) / 2);
        label =
          '<table role="presentation" border="0" cellpadding="0" cellspacing="0"><tr>' +
          '<td valign="middle" style="font-family:' + font + ";font-size:" + size + "px;font-weight:" + weight + ";color:" + fg + ";line-height:120%;white-space:nowrap;padding-right:14px;" + caps + '">' +
          esc(text) + "</td>" +
          '<td valign="middle" style="background-color:' + fg + ";border-radius:" + Math.max(4, radius - 4) + "px;padding:" + pad + 'px;line-height:0;font-size:0;">' +
          '<img src="https://img.icons8.com/material-rounded/96/' + hex6(bg).slice(1) + '/right.png" width="' + icon + '" height="' + icon +
          '" alt="" style="display:block;border:0;outline:none;" /></td>' +
          "</tr></table>";
      }
      return (
        '<div style="margin-top:30px;text-align:' + align + ';">' +
        "<!--[if mso]>" +
        '<v:roundrect xmlns:v="urn:schemas-microsoft-com:vml" xmlns:w="urn:schemas-microsoft-com:office:word" href="' + href + '"' +
        ' style="height:' + Math.max(46, Math.round(size * 2.4)) + 'px;v-text-anchor:middle;width:' + vmlWidth + 'px;" arcsize="15%"' +
        (c.btnBorderOn ? ' strokecolor="' + border + '"' : ' stroked="f"') +
        ' fillcolor="' + bg + '"><w:anchorlock/>' +
        '<center style="color:' + fg + ";font-family:Arial,sans-serif;font-size:" + size + 'px;font-weight:' + weight + ';' + caps + '">' +
        esc(text) + (arrow ? " &rarr;" : "") + "</center></v:roundrect><![endif]-->" +
        "<!--[if !mso]><!-->" +
        '<a href="' + href + '"' + target +
        ' style="line-height:100%;text-decoration:none;display:inline-block;max-width:100%;background-color:' + bg +
        ";color:" + fg + ";font-weight:" + weight + ";padding:" + (arrow ? "8px 8px 8px 24px" : "12px 30px") + ";font-size:" + size +
        "px;border-radius:" + radius + "px;" + borderCss +
        "font-family:" + font + ";" + caps + '">' + label + "</a><!--<![endif]-->" +
        "</div>"
      );
    },

    /* tabela com os ícones ativos (centralizada, ou opts.align "left"); "" se nenhum */
    socialIcons: function (s, opts) {
      var f = s.fields;
      var iconColor = hex6(color(f.socialIconColorHex, "#ffffff")).slice(1);
      var scale = f.socialIconSize === "sm" ? 0.7 : 1;
      var cells = "";
      SOCIAL.forEach(function (ic) {
        if (!s.checks[ic.key + "On"]) return;
        var src = f.socialIconStyle === "mono" ? "https://img.icons8.com/ios-filled/70/" + iconColor + "/" + ic.mono + ".png" : ic.color;
        cells +=
          '<td style="padding:' + (scale < 1 ? "0 10px" : "0 15px") + ';"><a href="' + esc(safeUrl(f[ic.key + "Url"]) || "#") +
          '" target="_blank" rel="noopener noreferrer"><img alt="' + ic.label + '" src="' + src +
          '" style="display:block;outline:none;border:none;text-decoration:none;border-radius:' + ic.radius +
          ';" width="' + Math.round(ic.w * scale) + '" /></a></td>';
      });
      var margin = opts && opts.align === "left" ? "margin:0 0 0 -10px" : "margin:0 auto";
      return cells ? '<table style="' + margin + '" cellpadding="0" cellspacing="0" role="presentation"><tr>' + cells + "</tr></table>" : "";
    },

    /* "" quando o descadastro está desligado */
    unsubscribe: function (s, linkColor) {
      if (!s.checks.unsubEnabled) return "";
      return (
        esc(s.fields.footerUnsub.trim()) +
        ' <a href="' + esc(safeUrl(s.fields.footerUnsubUrl) || "#") + '" style="color:' + linkColor + ';text-decoration:underline;">clique aqui</a>.'
      );
    },

    /* documento completo: doctype, head compatível com Outlook e o preview text oculto.
       opts.fonts: famílias extras do Google Fonts (ex.: "Oswald:wght@500;700").
       opts.css: regras extras no <head> (ex.: @media para celular). */
    document: function (s, opts) {
      var f = s.fields;
      var preview = f.previewText.trim()
        ? '<div style="display:none;overflow:hidden;line-height:1px;opacity:0;max-height:0;max-width:0;" data-skip-in-text="true">' +
          esc(f.previewText.trim()) + "<div>" + Array(91).join("&zwnj;&nbsp;") + "</div></div>"
        : "";
      return (
        '<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">' +
        '<html xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office" style="margin:0;padding:0" dir="ltr" lang="pt-BR">' +
        '<head><meta content="text/html; charset=UTF-8" http-equiv="Content-Type" /><meta name="viewport" content="width=device-width, initial-scale=1.0" /><meta name="x-apple-disable-message-reformatting" />' +
        "<title>" + esc(f.titleText.trim() || f.previewText.trim()) + "</title>" +
        "<!--[if mso]><xml><o:OfficeDocumentSettings><o:PixelsPerInch>96</o:PixelsPerInch></o:OfficeDocumentSettings></xml><![endif]-->" +
        '<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;700;900' +
        (opts.fonts || []).map(function (f) {
          return "&amp;family=" + esc(f);
        }).join("") +
        '&amp;display=swap" rel="stylesheet" />' +
        (opts.css ? "<style>" + opts.css + "</style>" : "") +
        "</head>" +
        '<body style="margin:0;padding:0;background-color:' + color(opts.background, "#ffffff") + '">' +
        preview + opts.body +
        "</body></html>"
      );
    },
  };

  /* ── MODELOS ── */
  var TEMPLATES = window.EmailTemplates || [];
  function getTemplate(id) {
    for (var i = 0; i < TEMPLATES.length; i++) if (TEMPLATES[i].id === id) return TEMPLATES[i];
    return TEMPLATES[0];
  }
  var currentTemplate = TEMPLATES.length ? TEMPLATES[0].id : "";

  function buildEmail(s) {
    return getTemplate(s.template).build(s, H);
  }

  /* ── AVISOS ANTES DE ENVIAR ── */
  var URL_FIELDS = {
    logoLink: "Link da logo",
    bannerLink: "Link do banner",
    btnLink: "Link do botão",
    footerUnsubUrl: "Link de descadastro",
    instaUrl: "Link do Instagram",
    teleUrl: "Link do Telegram",
    ytUrl: "Link do YouTube",
    waUrl: "Link do WhatsApp",
    nav1Url: "Primeiro link do topo",
    nav2Url: "Segundo link do topo",
  };

  function collectIssues(s) {
    var f = s.fields;
    var c = s.checks;
    var list = [];
    var invalid = {};
    function add(field, msg) {
      list.push({ field: field, msg: msg });
    }

    if (!f.previewText.trim()) add("previewText", "Preview text vazio: a caixa de entrada vai mostrar o começo do e-mail no lugar.");

    if (c.logoEnabled) {
      if (!f.logoUrl.trim()) add("logoUrl", "Logo ativada, mas sem URL da imagem.");
      else if (!safeUrl(f.logoUrl, true)) { invalid.logoUrl = 1; add("logoUrl", "URL da logo inválida: use um endereço https://."); }
      if (!f.logoAlt.trim()) add("logoAlt", "Logo sem texto alternativo.");
    }
    if (f.bannerUrl.trim()) {
      if (!safeUrl(f.bannerUrl, true)) { invalid.bannerUrl = 1; add("bannerUrl", "URL do banner inválida: use um endereço https://."); }
      else if (!f.bannerAlt.trim()) add("bannerAlt", "Banner sem texto alternativo: muitos programas bloqueiam imagens por padrão.");
    }

    if (!outOfTemplate("footerLogoUrl") && f.footerLogoUrl.trim() && !safeUrl(f.footerLogoUrl, true)) {
      invalid.footerLogoUrl = 1;
      add("footerLogoUrl", "URL da logo do rodapé inválida: use um endereço https://.");
    }

    Object.keys(URL_FIELDS).forEach(function (id) {
      if (outOfTemplate(id)) return;
      if (f[id].trim() && safeUrl(f[id]) === null) {
        invalid[id] = 1;
        add(id, URL_FIELDS[id] + " inválido: use https://, mailto: ou uma variável do ESP.");
      }
    });

    var hasText = s.blocks.some(function (b) {
      return parse(b.content).content.textContent.trim();
    });
    if (!hasText) add(null, "O corpo do e-mail está vazio.");
    if (currentTemplate === "coupon" && !f.couponCode.trim()) add("couponCode", "Cupom sem código.");
    if (currentTemplate === "newsletter") listIssues(ARTICLES, "title", add, invalid);
    if (currentTemplate === "vitrine") listIssues(PRODUCTS, "name", add, invalid);
    if (currentTemplate === "letter") {
      if (!f.letterName.trim()) add("letterName", "Carta sem o nome de quem assina.");
      if (f.letterPhoto.trim() && !safeUrl(f.letterPhoto, true)) {
        invalid.letterPhoto = 1;
        add("letterPhoto", "URL da foto inválida: use um endereço https://.");
      }
    }
    if (currentTemplate === "invite") {
      if (!f.eventDate) add("eventDate", "Evento sem data.");
      if (!f.eventWhere.trim()) add("eventWhere", "Evento sem local.");
      if (f.eventMapUrl.trim() && safeUrl(f.eventMapUrl) === null) {
        invalid.eventMapUrl = 1;
        add("eventMapUrl", "Link do mapa inválido: use um endereço https://.");
      }
    }

    if (c.btnEnabled && f.btnText.trim() && !f.btnLink.trim()) add("btnLink", "Botão sem link: ele não vai levar a lugar nenhum.");

    if (c.footerEnabled) {
      if (c.unsubEnabled && !f.footerUnsubUrl.trim())
        add("footerUnsubUrl", "Sem link de descadastro. Ele é exigido pela LGPD e pelas regras do Gmail e do Yahoo para envios em massa.");
      var missing = SOCIAL.filter(function (ic) {
        return c[ic.key + "On"] && !f[ic.key + "Url"].trim();
      });
      if (missing.length)
        add(missing[0].key + "Url", "Redes sociais sem link: " + missing.map(function (ic) { return ic.label; }).join(", ") + ".");
    }

    return { list: list, invalid: invalid };
  }

  /* painel do menu lateral em que um campo está */
  function panelOf(el) {
    var panel = el && el.closest(".panel");
    return panel ? panel.id.replace("panel-", "") : "texto";
  }

  function renderIssues(issues) {
    Object.keys(URL_FIELDS).concat(["logoUrl", "bannerUrl", "footerLogoUrl", "eventMapUrl", "letterPhoto"]).forEach(function (id) {
      if (issues.invalid[id]) $(id).setAttribute("aria-invalid", "true");
      else $(id).removeAttribute("aria-invalid");
    });
    each(document.querySelectorAll('.item-card [data-key="image"], .item-card [data-key="link"]'), function (el) {
      if (issues.invalid[el.id]) el.setAttribute("aria-invalid", "true");
      else el.removeAttribute("aria-invalid");
    });

    var box = $("issues");
    var ul = $("issuesList");
    ul.innerHTML = "";
    issues.list.forEach(function (it) {
      var li = document.createElement("li");
      var b = document.createElement("button");
      b.type = "button";
      b.textContent = it.msg;
      b.addEventListener("click", function () {
        var el = it.field ? $(it.field) : document.querySelector(".editor");
        if (!el) return;
        openPanel(panelOf(el));
        el.scrollIntoView({ block: "center", behavior: "smooth" });
        el.focus({ preventScroll: true });
      });
      li.appendChild(b);
      ul.appendChild(li);
    });
    $("issuesTitle").textContent =
      issues.list.length === 1 ? "1 ponto para revisar antes de enviar" : issues.list.length + " pontos para revisar antes de enviar";
    box.hidden = !issues.list.length;

    // marca no menu lateral as etapas com pendências
    var flagged = {};
    issues.list.forEach(function (it) {
      flagged[panelOf(it.field ? $(it.field) : null)] = 1;
    });
    each(document.querySelectorAll(".rail-btn"), function (btn) {
      btn.classList.toggle("has-issue", !!flagged[btn.dataset.panel]);
    });
  }

  /* ── PRÉVIA ──
     srcdoc + sandbox sem allow-scripts: o HTML do e-mail nunca roda como código da página. */
  var frame = $("previewFrame");
  var lastHtml = "";
  var lastHead = "";
  var frameReady = false;
  var BODY_RE = /^([\s\S]*?)<body([^>]*)>([\s\S]*)<\/body>/;

  /* Desempenho: depois da primeira carga, só o <body> é trocado.
     Sem recarregar o iframe, a prévia não pisca e as imagens não são baixadas de novo. */
  function renderPreview(html) {
    if (html === lastHtml) return;
    lastHtml = html;
    var m = html.match(BODY_RE);
    var head = m ? m[1].replace(/<title>[\s\S]*?<\/title>/, "") : "";
    var doc = frame.contentDocument;

    if (m && frameReady && head === lastHead && doc && doc.body) {
      var style = (m[2].match(/style="([^"]*)"/) || [])[1] || "";
      doc.body.setAttribute("style", style.replace(/&quot;/g, '"'));
      doc.body.innerHTML = m[3]; // o sandbox sem allow-scripts impede qualquer execução
      watchImages(doc);
      fitFrame();
      return;
    }
    lastHead = head;
    frameReady = false;
    frame.srcdoc = html.replace("<head>", '<head><base target="_blank" />');
  }

  function watchImages(doc) {
    each(doc.images, function (img) {
      if (!img.complete) {
        img.addEventListener("load", fitFrame);
        img.addEventListener("error", fitFrame);
      }
    });
  }

  function fitFrame() {
    var doc = frame.contentDocument;
    if (!doc || !doc.body) return;
    // mede o body (e não o documento), para a prévia também encolher quando o conteúdo diminui
    var cs = doc.defaultView.getComputedStyle(doc.body);
    var h = doc.body.getBoundingClientRect().height + parseFloat(cs.marginTop) + parseFloat(cs.marginBottom);
    frame.style.height = Math.ceil(h) + "px";
  }

  frame.addEventListener("load", function () {
    if (!frame.srcdoc) return;
    frameReady = true;
    fitFrame();
    if (frame.contentDocument) watchImages(frame.contentDocument);
  });
  $("previewWrap").addEventListener("transitionend", fitFrame);

  var resizeRaf = 0;
  window.addEventListener("resize", function () {
    cancelAnimationFrame(resizeRaf);
    resizeRaf = requestAnimationFrame(fitFrame);
  });

  /* ── RENDER + AUTO-SAVE ── */
  var renderTimer = null;
  var saveTimer = null;

  function render() {
    var s = read();
    renderPreview(buildEmail(s));
    renderIssues(collectIssues(s));
  }

  function update(quiet) {
    clearTimeout(renderTimer);
    renderTimer = setTimeout(render, 150);
    clearTimeout(saveTimer);
    saveTimer = setTimeout(function () {
      save(quiet);
    }, 700);
  }

  function save(quiet) {
    try {
      localStorage.setItem(SAVE_KEY, JSON.stringify(read()));
    } catch (e) {
      return;
    }
    if (quiet) return;
    var badge = $("saveBadge");
    badge.classList.add("show");
    clearTimeout(badge._t);
    badge._t = setTimeout(function () {
      badge.classList.remove("show");
    }, 2000);
  }

  function load() {
    try {
      var state = JSON.parse(localStorage.getItem(SAVE_KEY));
      return state && typeof state === "object" ? state : null;
    } catch (e) {
      return null;
    }
  }

  /* ── APLICAR UM ESTADO NA TELA ── */
  function applyState(state) {
    currentTemplate = getTemplate(state.template).id;
    var fields = state.fields || {};
    // versões antigas salvavam a cor dos cards como "cardVerdeHex"
    if (fields.cardVerdeHex && !fields.cardAccentHex) fields.cardAccentHex = fields.cardVerdeHex;
    // a logo de exemplo antiga tinha fundo azul fixo, que destoava ao trocar as cores
    if (OLD_PLACEHOLDERS.test(fields.logoUrl || "")) fields.logoUrl = PLACEHOLDER_LOGO;

    Object.keys(DEFAULTS.fields).forEach(function (id) {
      $(id).value = id in fields ? String(fields[id]) : DEFAULTS.fields[id];
    });
    var checks = state.checks || {};
    Object.keys(DEFAULTS.checks).forEach(function (id) {
      $(id).checked = id in checks ? !!checks[id] : DEFAULTS.checks[id];
    });

    each(document.querySelectorAll("#sidebar .color-row .hex-input"), syncColorRow);
    each(document.querySelectorAll("[data-autoresize]"), autoResize);
    syncToggles();
    syncIconColor();
    updatePreviewCount();

    var container = $("blocksContainer");
    container.innerHTML = "";
    var blocks = state.blocks && state.blocks.length ? state.blocks : [{ align: "left", content: "" }];
    blocks.forEach(function (b) {
      container.appendChild(createBlock(b));
    });
    renumber();
    LISTS.forEach(function (list) {
      list.render(state[list.key]);
    });
    syncSegments();
    syncTemplateFields();
    renderPalettes();
    if (currentPanel === "modelos") renderGallery();
    update(true);
  }

  function clone(obj) {
    return JSON.parse(JSON.stringify(obj));
  }

  /* ── CAMPOS ── */
  function syncColorRow(input) {
    var row = input.closest(".color-row");
    var hex = row.querySelector(".hex-input");
    var picker = row.querySelector('input[type="color"]');
    if (input === picker) {
      hex.value = picker.value;
      hex.removeAttribute("aria-invalid");
      return;
    }
    var v = hex.value.trim();
    if (HEX_RE.test(v)) {
      picker.value = hex6(v).toLowerCase();
      hex.removeAttribute("aria-invalid");
    } else {
      hex.setAttribute("aria-invalid", "true");
    }
  }

  function syncToggles() {
    each(document.querySelectorAll("[data-toggles]"), function (cb) {
      $(cb.dataset.toggles).hidden = !cb.checked;
      var block = cb.closest(".optional-block");
      if (block) block.classList.toggle("enabled", cb.checked);
    });
    $("redesNotice").hidden = $("footerEnabled").checked;
  }

  function syncIconColor() {
    $("iconColorField").hidden = $("socialIconStyle").value !== "mono";
  }

  function autoResize(el) {
    el.style.height = "auto";
    el.style.height = el.scrollHeight + "px";
  }

  function updatePreviewCount() {
    var n = $("previewText").value.trim().length;
    var el = $("previewCount");
    el.textContent = n + (n === 1 ? " caractere" : " caracteres") + " · o ideal é entre 40 e 90";
    el.classList.toggle("warn", n > 0 && (n < 40 || n > 90));
  }

  var sidebar = $("sidebar");
  sidebar.addEventListener("submit", function (e) {
    e.preventDefault();
  });
  sidebar.addEventListener("input", function (e) {
    var t = e.target;
    if (t.closest && t.closest(".color-row")) {
      syncColorRow(t);
      markPalette();
    }
    if (t.hasAttribute && t.hasAttribute("data-autoresize")) autoResize(t);
    if (t.id === "previewText") updatePreviewCount();
    update();
  });
  sidebar.addEventListener("change", function (e) {
    var t = e.target;
    if (t.dataset.toggles) syncToggles();
    if (t.id === "socialIconStyle") syncIconColor();
    if (t.hasAttribute("data-segmented")) syncSegments();
    update();
  });

  /* ── BLOCOS DE TEXTO ── */
  function icon(d, extra) {
    return (
      '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
      (d ? '<path d="' + d + '"/>' : "") + (extra || "") + "</svg>"
    );
  }

  var ICONS = {
    bold: icon("M7 5h6.5a3.5 3.5 0 010 7H7zM7 12h7.5a3.5 3.5 0 010 7H7z"),
    italic: icon("M19 4h-9M14 20H5M15 4L9 20"),
    underline: icon("M6 4v6a6 6 0 0012 0V4M4 20h16"),
    size: icon("M3 7V5h11v2M8.5 5v14M6.5 19h4M14 13v-1.5h7V13M17.5 11.5V19M16 19h3"),
    ul: icon("M9 6h11M9 12h11M9 18h11", '<circle cx="4.5" cy="6" r="1.3" fill="currentColor" stroke="none"/><circle cx="4.5" cy="12" r="1.3" fill="currentColor" stroke="none"/><circle cx="4.5" cy="18" r="1.3" fill="currentColor" stroke="none"/>'),
    ol: icon("M10 6h11M10 12h11M10 18h11M4 4.5h1.5V9M4 9h3M7 19.5H4c0-1.5 3-2 3-3.5a1.4 1.4 0 00-2.8-.3"),
    left: icon("M4 6h16M4 12h10M4 18h14"),
    center: icon("M4 6h16M7 12h10M5 18h14"),
    right: icon("M4 6h16M10 12h10M6 18h14"),
    link: icon("M10 13a5 5 0 007.5.5l3-3a5 5 0 00-7-7l-1.7 1.7M14 11a5 5 0 00-7.5-.5l-3 3a5 5 0 007 7l1.7-1.7"),
    variable: icon("M8 4H7a2 2 0 00-2 2v4a2 2 0 01-2 2 2 2 0 012 2v4a2 2 0 002 2h1M16 4h1a2 2 0 012 2v4a2 2 0 002 2 2 2 0 00-2 2v4a2 2 0 01-2 2h-1"),
    up: icon("M12 19V5M5.5 11.5L12 5l6.5 6.5"),
    down: icon("M12 5v14M18.5 12.5L12 19l-6.5-6.5"),
    dup: icon("M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1", '<rect x="9" y="9" width="13" height="13" rx="2"/>'),
    trash: icon("M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6M10 11v5M14 11v5"),
  };

  var ALIGN_LABEL = { left: "à esquerda", center: "centralizado", right: "à direita" };
  var ALIGN_NEXT = { left: "center", center: "right", right: "left" };

  function tbBtn(cmd, ico, label, extra) {
    return (
      '<button type="button" class="tb-btn" data-cmd="' + cmd + '" aria-label="' + label + '" title="' + label + '"' + (extra || "") + ">" +
      ico + "</button>"
    );
  }

  var TOOLBAR =
    tbBtn("bold", ICONS.bold, "Negrito (Ctrl+B)", ' aria-pressed="false"') +
    tbBtn("italic", ICONS.italic, "Itálico (Ctrl+I)", ' aria-pressed="false"') +
    tbBtn("underline", ICONS.underline, "Sublinhado (Ctrl+U)", ' aria-pressed="false"') +
    '<span class="tb-sep"></span>' +
    '<button type="button" class="tb-btn tb-color" data-cmd="color" aria-haspopup="dialog" aria-label="Cor do texto" title="Cor do texto">' +
    '<span class="tb-a" aria-hidden="true">A</span><span class="tb-bar" aria-hidden="true"></span></button>' +
    tbBtn("size", ICONS.size, "Tamanho do texto", ' aria-haspopup="menu"') +
    '<span class="tb-sep"></span>' +
    tbBtn("insertUnorderedList", ICONS.ul, "Lista com marcadores", ' aria-pressed="false"') +
    tbBtn("insertOrderedList", ICONS.ol, "Lista numerada", ' aria-pressed="false"') +
    tbBtn("align", ICONS.left, "Alinhamento") +
    '<span class="tb-sep"></span>' +
    tbBtn("link", ICONS.link, "Link", ' aria-haspopup="dialog"') +
    tbBtn("var", ICONS.variable, "Inserir variável", ' aria-haspopup="menu"');

  function blockBtn(cmd, ico, label, extra) {
    return '<button type="button" class="block-icon' + (extra || "") + '" data-cmd="' + cmd + '" aria-label="' + label + '" title="' + label + '">' + ico + "</button>";
  }

  function createBlock(data) {
    var wrap = document.createElement("div");
    wrap.className = "block-wrap";
    wrap.dataset.align = ALIGNS[data.align] ? data.align : "left";
    wrap.innerHTML =
      '<div class="block-header">' +
      '<span class="block-label"></span>' +
      '<div class="block-header-right">' +
      blockBtn("up", ICONS.up, "Mover bloco para cima") +
      blockBtn("down", ICONS.down, "Mover bloco para baixo") +
      blockBtn("dup", ICONS.dup, "Duplicar bloco") +
      blockBtn("remove", ICONS.trash, "Excluir bloco", " block-remove") +
      "</div></div>" +
      '<div class="rich-toolbar" role="toolbar" aria-label="Formatação do texto">' + TOOLBAR + "</div>" +
      '<div class="editor" contenteditable="true" role="textbox" aria-multiline="true" data-placeholder="Escreva o texto deste bloco…"></div>';
    wrap.querySelector(".editor").innerHTML = sanitizeRich(data.content || "");
    setAlignUI(wrap);
    return wrap;
  }

  function setAlignUI(wrap) {
    var a = wrap.dataset.align;
    var btn = wrap.querySelector('[data-cmd="align"]');
    btn.innerHTML = ICONS[a];
    btn.setAttribute("aria-label", "Alinhamento: " + ALIGN_LABEL[a] + ". Clique para mudar");
    btn.title = "Alinhamento: " + ALIGN_LABEL[a];
    wrap.querySelector(".editor").style.textAlign = a;
  }

  function renumber() {
    var blocks = document.querySelectorAll(".block-wrap");
    each(blocks, function (wrap, i) {
      wrap.querySelector(".block-label").textContent = "Bloco " + (i + 1);
      wrap.querySelector(".editor").setAttribute("aria-label", "Texto do bloco " + (i + 1));
      wrap.querySelector('[data-cmd="up"]').disabled = i === 0;
      wrap.querySelector('[data-cmd="down"]').disabled = i === blocks.length - 1;
      wrap.querySelector('[data-cmd="remove"]').disabled = blocks.length === 1;
    });
  }

  function addBlock() {
    var wrap = createBlock({ align: "left", content: "" });
    $("blocksContainer").appendChild(wrap);
    renumber();
    wrap.querySelector(".editor").focus();
    update();
  }

  /* guarda a última seleção de cada editor, para a barra de ferramentas agir sobre ela */
  var lastRange = new WeakMap();
  function editorOf(node) {
    var el = node && (node.nodeType === 1 ? node : node.parentElement);
    return el ? el.closest(".editor") : null;
  }
  document.addEventListener("selectionchange", function () {
    var sel = window.getSelection();
    if (!sel.rangeCount) return;
    var r = sel.getRangeAt(0);
    var ed = editorOf(r.commonAncestorContainer);
    if (!ed) return;
    lastRange.set(ed, r.cloneRange());
    syncToolbar(ed);
  });
  function restoreSel(ed) {
    ed.focus();
    var r = lastRange.get(ed);
    if (r) {
      var sel = window.getSelection();
      sel.removeAllRanges();
      sel.addRange(r);
    }
    return r;
  }
  function hasSelection(ed) {
    var r = lastRange.get(ed);
    return r && !r.collapsed;
  }

  /* botões acendem conforme a formatação do trecho onde está o cursor */
  var STATEFUL = ["bold", "italic", "underline", "insertUnorderedList", "insertOrderedList"];
  function syncToolbar(ed) {
    var bar = ed.parentNode.querySelector(".rich-toolbar");
    STATEFUL.forEach(function (cmd) {
      var on = false;
      try {
        on = document.queryCommandState(cmd);
      } catch (e) {}
      var b = bar.querySelector('[data-cmd="' + cmd + '"]');
      b.classList.toggle("on", on);
      b.setAttribute("aria-pressed", on ? "true" : "false");
    });
    bar.querySelector('[data-cmd="link"]').classList.toggle("on", !!linkAt(ed));
  }

  function insertPlainText(text) {
    // escapado: colar "<img onerror=...>" vira texto, não HTML
    var html = text.split(/\r?\n/).map(esc).join("<br>");
    document.execCommand("insertHTML", false, html);
  }

  function applySize(ed, size) {
    if (!hasSelection(ed)) {
      toast("Selecione um trecho do texto antes de mudar o tamanho", { error: true });
      return;
    }
    var r = restoreSel(ed);
    var span = document.createElement("span");
    span.style.fontSize = size;
    span.appendChild(r.extractContents());
    r.insertNode(span);
    var sel = window.getSelection();
    var nr = document.createRange();
    nr.selectNodeContents(span);
    sel.removeAllRanges();
    sel.addRange(nr);
    update();
  }

  /* ── LISTAS REPETÍVEIS (matérias da Newsletter, produtos da Vitrine) ──
     makeList() cria um editor de itens: cada item é um cartão com campos simples,
     que pode ser reordenado, duplicado e excluído (com Desfazer). O conteúdo vira
     texto escapado e URL validada na hora de gerar o e-mail. */
  var itemSeq = 0;

  function itemInput(f, id) {
    var ph = f.placeholder ? ' placeholder="' + f.placeholder + '"' : "";
    var aria = f.aria ? ' aria-label="' + f.aria + '"' : "";
    return f.type === "textarea"
      ? '<textarea id="' + id + '" data-key="' + f.key + '" rows="2" data-autoresize' + ph + aria + "></textarea>"
      : '<input type="' + (f.type || "text") + '" id="' + id + '" data-key="' + f.key + '"' + ph + aria + " />";
  }

  function makeList(cfg) {
    var box = $(cfg.container);
    var keys = [];
    cfg.fields.forEach(function (f) {
      (f.pair || [f]).forEach(function (x) {
        keys.push(x.key);
      });
    });

    function create(data) {
      var p = "item" + ++itemSeq + "_";
      var card = document.createElement("div");
      card.className = "item-card";
      var body = cfg.fields
        .map(function (f) {
          if (f.pair) {
            return (
              (f.label ? '<span class="pair-label">' + f.label + "</span>" : "") +
              '<div class="link-pair">' + f.pair.map(function (x) { return itemInput(x, p + x.key); }).join("") + "</div>"
            );
          }
          return (
            '<div class="field"><label for="' + p + f.key + '">' + f.label +
            (f.optional ? ' <span class="optional-label">opcional</span>' : "") + "</label>" +
            itemInput(f, p + f.key) + (f.hint ? '<span class="field-hint">' + f.hint + "</span>" : "") + "</div>"
          );
        })
        .join("");
      card.innerHTML =
        '<div class="block-header">' +
        '<span class="block-label"></span>' +
        '<div class="block-header-right">' +
        blockBtn("up", ICONS.up, "Mover " + cfg.noun + " para cima") +
        blockBtn("down", ICONS.down, "Mover " + cfg.noun + " para baixo") +
        blockBtn("dup", ICONS.dup, "Duplicar " + cfg.noun) +
        blockBtn("remove", ICONS.trash, "Excluir " + cfg.noun, " block-remove") +
        "</div></div>" +
        '<div class="item-body">' + body + "</div>";
      keys.forEach(function (k) {
        card.querySelector('[data-key="' + k + '"]').value = (data && data[k]) || "";
      });
      return card;
    }

    function cards() {
      return box.querySelectorAll(".item-card");
    }

    function renumber() {
      var list = cards();
      each(list, function (card, i) {
        card.querySelector(".block-label").textContent = cfg.label + " " + (i + 1);
        card.querySelector('[data-cmd="up"]').disabled = i === 0;
        card.querySelector('[data-cmd="down"]').disabled = i === list.length - 1;
        card.querySelector('[data-cmd="dup"]').disabled = list.length >= cfg.max;
        card.querySelector('[data-cmd="remove"]').disabled = list.length === 1;
      });
      document.querySelector('[data-action="' + cfg.addAction + '"]').disabled = list.length >= cfg.max;
    }

    function dataOf(card) {
      var item = {};
      keys.forEach(function (k) {
        item[k] = card.querySelector('[data-key="' + k + '"]').value;
      });
      return item;
    }

    function read() {
      return Array.prototype.map.call(cards(), dataOf);
    }

    function render(list) {
      box.innerHTML = "";
      (list && list.length ? list : DEFAULTS[cfg.key]).slice(0, cfg.max).forEach(function (item) {
        box.appendChild(create(item));
      });
      each(box.querySelectorAll("[data-autoresize]"), autoResize);
      renumber();
    }

    function add() {
      if (cards().length >= cfg.max) return;
      var card = create(cfg.blank);
      box.appendChild(card);
      renumber();
      card.querySelector("input, textarea").focus();
      update();
    }

    box.addEventListener("click", function (e) {
      var btn = e.target.closest("button[data-cmd]");
      if (!btn) return;
      var card = btn.closest(".item-card");
      var cmd = btn.dataset.cmd;
      if (cmd === "up" || cmd === "down") {
        var sib = cmd === "up" ? card.previousElementSibling : card.nextElementSibling;
        if (!sib) return;
        box.insertBefore(card, cmd === "up" ? sib : sib.nextElementSibling);
        renumber();
        btn.disabled ? card.querySelector("input").focus() : btn.focus();
      } else if (cmd === "dup") {
        var copy = create(dataOf(card));
        box.insertBefore(copy, card.nextElementSibling);
        each(copy.querySelectorAll("[data-autoresize]"), autoResize);
        renumber();
        copy.querySelector("input, textarea").focus();
      } else if (cmd === "remove") {
        var next = card.nextElementSibling;
        box.removeChild(card);
        renumber();
        toast(cfg.removed, {
          action: "Desfazer",
          onAction: function () {
            box.insertBefore(card, next && next.parentNode === box ? next : null);
            renumber();
            update();
          },
        });
      }
      update();
    });

    return { key: cfg.key, label: cfg.label, plural: cfg.plural, cards: cards, read: read, render: render, add: add };
  }

  var ARTICLES = makeList({
    key: "articles",
    container: "articlesContainer",
    addAction: "add-article",
    label: "Matéria",
    plural: "Matérias",
    noun: "matéria",
    removed: "Matéria excluída",
    max: 8,
    blank: { linkText: "Ler mais" },
    fields: [
      { key: "title", label: "Título", placeholder: "Título da matéria" },
      { key: "text", label: "Resumo", optional: true, type: "textarea", placeholder: "Duas ou três linhas sobre o assunto" },
      { key: "image", label: "Imagem", optional: true, type: "url", placeholder: "https://...", hint: "Proporção 16:9 funciona melhor." },
      {
        label: "Link",
        pair: [
          { key: "linkText", placeholder: "Ler mais", aria: "Texto do link da matéria" },
          { key: "link", type: "url", placeholder: "https://...", aria: "Endereço da matéria" },
        ],
      },
    ],
  });

  var PRODUCTS = makeList({
    key: "products",
    container: "productsContainer",
    addAction: "add-product",
    label: "Produto",
    plural: "Produtos",
    noun: "produto",
    removed: "Produto excluído",
    max: 12,
    blank: { buttonText: "Comprar" },
    fields: [
      { key: "name", label: "Nome", placeholder: "Nome do produto" },
      { key: "image", label: "Foto", optional: true, type: "url", placeholder: "https://...", hint: "Foto quadrada (1:1) fica melhor na grade." },
      {
        label: "Preço",
        pair: [
          { key: "oldPrice", placeholder: "De (opcional)", aria: "Preço antigo, riscado" },
          { key: "price", placeholder: "Por: R$ 99,90", aria: "Preço atual" },
        ],
      },
      {
        label: "Botão",
        pair: [
          { key: "buttonText", placeholder: "Comprar", aria: "Texto do botão do produto" },
          { key: "link", type: "url", placeholder: "https://...", aria: "Endereço do produto" },
        ],
      },
    ],
  });

  var LISTS = [ARTICLES, PRODUCTS];

  /* avisos de uma lista: item sem nome, imagem ou link inválidos, itens sem link */
  function listIssues(list, nameKey, add, invalid) {
    var noLink = [];
    each(list.cards(), function (card, i) {
      var n = list.label + " " + (i + 1);
      var el = function (k) {
        return card.querySelector('[data-key="' + k + '"]');
      };
      if (!el(nameKey).value.trim()) add(el(nameKey).id, n + " sem " + (nameKey === "name" ? "nome." : "título."));
      if (el("image").value.trim() && !safeUrl(el("image").value, true)) {
        invalid[el("image").id] = 1;
        add(el("image").id, n + ": URL da imagem inválida.");
      }
      if (el("link").value.trim() && safeUrl(el("link").value) === null) {
        invalid[el("link").id] = 1;
        add(el("link").id, n + ": link inválido.");
      } else if (!el("link").value.trim()) noLink.push({ id: el("link").id, n: i + 1 });
    });
    if (noLink.length)
      add(noLink[0].id, (noLink.length === 1 ? list.label + " " : list.plural + " ") + noLink.map(function (x) { return x.n; }).join(", ") + " sem link.");
  }

  /* ── PAINÉIS FLUTUANTES (cor, link, menus) ── */
  var openPop = null;
  var popTrigger = null;
  var popEditor = null;

  function showPop(pop, trigger, ed) {
    closePop(false);
    openPop = pop;
    popTrigger = trigger;
    popEditor = ed;
    pop.hidden = false;
    trigger.setAttribute("aria-expanded", "true");
    var r = trigger.getBoundingClientRect();
    var top = r.bottom + 6;
    if (top + pop.offsetHeight > window.innerHeight - 8) top = Math.max(8, r.top - pop.offsetHeight - 6);
    pop.style.top = top + "px";
    pop.style.left = Math.max(8, Math.min(r.left, window.innerWidth - pop.offsetWidth - 8)) + "px";
  }

  function closePop(returnFocus) {
    if (!openPop) return;
    openPop.hidden = true;
    popTrigger.setAttribute("aria-expanded", "false");
    var t = popTrigger;
    openPop = null;
    if (returnFocus) t.focus();
  }

  document.addEventListener("mousedown", function (e) {
    if (openPop && !openPop.contains(e.target) && e.target.closest("button") !== popTrigger) closePop(false);
  });
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") closePop(true);
  });
  $("sidebar").addEventListener("scroll", function () {
    closePop(false);
  });

  /* menu simples: tamanho e variáveis */
  var menu = $("menuPopup");
  var menuPick = null;

  function openMenu(trigger, ed, items, onPick) {
    menu.innerHTML = "";
    items.forEach(function (it) {
      var b = document.createElement("button");
      b.type = "button";
      b.setAttribute("role", "menuitem");
      b.dataset.value = it.value;
      b.innerHTML = '<span class="menu-label"></span>' + (it.hint ? '<span class="menu-hint"></span>' : "");
      b.querySelector(".menu-label").textContent = it.label;
      if (it.style) b.querySelector(".menu-label").setAttribute("style", it.style);
      if (it.hint) b.querySelector(".menu-hint").textContent = it.hint;
      menu.appendChild(b);
    });
    menuPick = onPick;
    showPop(menu, trigger, ed);
    menu.firstChild.focus();
  }

  menu.addEventListener("mousedown", function (e) {
    e.preventDefault();
  });
  menu.addEventListener("click", function (e) {
    var b = e.target.closest("[data-value]");
    if (!b) return;
    var ed = popEditor;
    closePop(false);
    menuPick(ed, b.dataset.value);
  });
  menu.addEventListener("keydown", function (e) {
    var step = { ArrowDown: 1, ArrowUp: -1 }[e.key];
    if (!step) return;
    e.preventDefault();
    var items = Array.prototype.slice.call(menu.children);
    var i = items.indexOf(document.activeElement);
    items[(i + step + items.length) % items.length].focus();
  });

  var SIZES = [
    { label: "Pequeno", hint: "14", value: "14px", style: "font-size:13px" },
    { label: "Normal", hint: "16", value: "16px", style: "font-size:15px" },
    { label: "Médio", hint: "18", value: "18px", style: "font-size:17px" },
    { label: "Grande", hint: "22", value: "22px", style: "font-size:19px" },
    { label: "Destaque", hint: "28", value: "28px", style: "font-size:22px;font-weight:700" },
  ];
  var VARIABLES = [
    { label: "Nome", hint: "{{nome}}", value: "{{nome}}" },
    { label: "E-mail", hint: "{{email}}", value: "{{email}}" },
    { label: "Empresa", hint: "{{empresa}}", value: "{{empresa}}" },
  ];

  /* ── LINK ── */
  var linkPop = $("linkPopup");

  function linkAt(ed) {
    var r = lastRange.get(ed);
    if (!r) return null;
    var n = r.commonAncestorContainer;
    var el = n.nodeType === 1 ? n : n.parentElement;
    var a = el && el.closest("a");
    return a && ed.contains(a) ? a : null;
  }

  function openLink(trigger, ed) {
    var a = linkAt(ed);
    $("linkInput").value = a ? a.getAttribute("href") : "";
    $("linkInput").removeAttribute("aria-invalid");
    $("linkRemove").hidden = !a;
    $("linkTitle").textContent = a ? "Editar link" : hasSelection(ed) ? "Link no trecho selecionado" : "Inserir link";
    showPop(linkPop, trigger, ed);
    $("linkInput").focus();
  }

  function applyLink() {
    var raw = $("linkInput").value.trim();
    var url = safeUrl(raw);
    if (!url || /^https?:\/\/$/i.test(raw)) {
      $("linkInput").setAttribute("aria-invalid", "true");
      $("linkInput").focus();
      return;
    }
    var ed = popEditor;
    var a = linkAt(ed);
    var selected = hasSelection(ed);
    closePop(false);
    restoreSel(ed);
    if (a) a.setAttribute("href", url);
    else if (selected) document.execCommand("createLink", false, url);
    else document.execCommand("insertHTML", false, '<a href="' + esc(url) + '">' + esc(raw) + "</a>");
    syncToolbar(ed);
    update();
  }

  function removeLink() {
    var ed = popEditor;
    var a = linkAt(ed);
    closePop(false);
    if (a) {
      while (a.firstChild) a.parentNode.insertBefore(a.firstChild, a);
      a.parentNode.removeChild(a);
    }
    ed.focus();
    syncToolbar(ed);
    update();
  }

  $("linkInput").addEventListener("keydown", function (e) {
    if (e.key === "Enter") {
      e.preventDefault();
      applyLink();
    }
  });
  $("linkInput").addEventListener("input", function () {
    this.removeAttribute("aria-invalid");
  });

  /* ── COR ── */
  var colorPop = $("colorPopup");
  var SWATCHES = ["#191713", "#4a463e", "#8a857a", "#ffffff", "#c8451f", "#e11d48", "#f59e0b", "#fff43d", "#16a34a", "#0284c7", "#2563eb", "#7c3aed"];

  (function buildSwatches() {
    var box = $("swatches");
    SWATCHES.forEach(function (c) {
      var b = document.createElement("button");
      b.type = "button";
      b.className = "swatch";
      b.dataset.color = c;
      b.style.background = c;
      b.setAttribute("aria-label", "Cor " + c);
      b.title = c;
      box.appendChild(b);
    });
  })();

  colorPop.addEventListener("mousedown", function (e) {
    if (e.target.closest(".swatch, .pop-btn, .pop-link")) e.preventDefault();
  });
  colorPop.addEventListener("click", function (e) {
    var sw = e.target.closest(".swatch");
    if (sw) applyColorValue(sw.dataset.color);
  });

  function openColor(trigger, ed) {
    var c = trigger.closest(".block-wrap").dataset.color || "#c8451f";
    $("popupColor").value = hex6(c);
    $("popupColorHex").value = c;
    $("popupColorHex").removeAttribute("aria-invalid");
    showPop(colorPop, trigger, ed);
    colorPop.querySelector(".swatch").focus();
  }

  colorPop.addEventListener("input", function (e) {
    if (e.target.id === "popupColor") {
      $("popupColorHex").value = e.target.value;
    } else if (e.target.id === "popupColorHex") {
      var v = e.target.value.trim();
      if (HEX_RE.test(v)) $("popupColor").value = hex6(v).toLowerCase();
      e.target.toggleAttribute("aria-invalid", !HEX_RE.test(v));
    }
  });
  colorPop.addEventListener("keydown", function (e) {
    if (e.key === "Enter" && e.target.id === "popupColorHex") {
      e.preventDefault();
      applyColor();
    }
  });

  function applyColorValue(c) {
    var ed = popEditor;
    if (!hasSelection(ed)) {
      closePop(true);
      toast("Selecione um trecho do texto antes de escolher a cor", { error: true });
      return;
    }
    closePop(false);
    restoreSel(ed);
    document.execCommand("foreColor", false, c);
    var wrap = ed.closest(".block-wrap");
    wrap.dataset.color = c;
    wrap.querySelector(".tb-bar").style.background = c;
    update();
  }

  function applyColor() {
    var c = color($("popupColorHex").value, null);
    if (!c) {
      $("popupColorHex").setAttribute("aria-invalid", "true");
      return;
    }
    applyColorValue(c);
  }

  function resetColor() {
    var ed = popEditor;
    closePop(false);
    if (hasSelection(ed)) {
      restoreSel(ed);
      document.execCommand("removeFormat", false, null);
      syncToolbar(ed);
      update();
    }
  }

  /* ── EVENTOS DOS BLOCOS ── */
  var container = $("blocksContainer");

  // os botões da barra não roubam o foco do editor (a seleção continua lá)
  container.addEventListener("mousedown", function (e) {
    if (e.target.closest(".rich-toolbar button")) e.preventDefault();
  });

  container.addEventListener("click", function (e) {
    var btn = e.target.closest("button[data-cmd]");
    if (!btn) return;
    var wrap = btn.closest(".block-wrap");
    var ed = wrap.querySelector(".editor");
    var cmd = btn.dataset.cmd;

    if (cmd === "align") {
      wrap.dataset.align = ALIGN_NEXT[wrap.dataset.align] || "left";
      setAlignUI(wrap);
    } else if (cmd === "up" || cmd === "down") {
      var sib = cmd === "up" ? wrap.previousElementSibling : wrap.nextElementSibling;
      if (!sib) return;
      container.insertBefore(wrap, cmd === "up" ? sib : sib.nextElementSibling);
      renumber();
      btn.disabled ? ed.focus() : btn.focus();
    } else if (cmd === "dup") {
      var copy = createBlock({ align: wrap.dataset.align, content: ed.innerHTML });
      container.insertBefore(copy, wrap.nextElementSibling);
      renumber();
      copy.querySelector(".editor").focus();
    } else if (cmd === "remove") {
      var next = wrap.nextElementSibling;
      container.removeChild(wrap);
      renumber();
      toast("Bloco excluído", {
        action: "Desfazer",
        onAction: function () {
          container.insertBefore(wrap, next && next.parentNode === container ? next : null);
          renumber();
          update();
        },
      });
    } else if (cmd === "color") {
      return openPop === colorPop ? closePop(true) : openColor(btn, ed);
    } else if (cmd === "link") {
      return openPop === linkPop ? closePop(true) : openLink(btn, ed);
    } else if (cmd === "size") {
      if (openPop === menu && popTrigger === btn) return closePop(true);
      return openMenu(btn, ed, SIZES, applySize);
    } else if (cmd === "var") {
      if (openPop === menu && popTrigger === btn) return closePop(true);
      return openMenu(btn, ed, VARIABLES, function (target, v) {
        restoreSel(target);
        document.execCommand("insertText", false, v);
        update();
      });
    } else {
      restoreSel(ed);
      document.execCommand(cmd, false, null);
      syncToolbar(ed);
    }
    update();
  });

  container.addEventListener("paste", function (e) {
    if (!editorOf(e.target)) return;
    e.preventDefault();
    insertPlainText((e.clipboardData || window.clipboardData).getData("text/plain"));
    update();
  });

  container.addEventListener("drop", function (e) {
    if (!editorOf(e.target)) return;
    e.preventDefault();
    var text = e.dataTransfer.getData("text/plain");
    if (!text) return;
    if (document.caretRangeFromPoint) {
      var r = document.caretRangeFromPoint(e.clientX, e.clientY);
      if (r) {
        var sel = window.getSelection();
        sel.removeAllRanges();
        sel.addRange(r);
      }
    }
    insertPlainText(text);
    update();
  });

  container.addEventListener("keydown", function (e) {
    if (e.key !== "Enter" || !editorOf(e.target)) return;
    var sel = window.getSelection();
    var node = sel.rangeCount ? sel.getRangeAt(0).startContainer : null;
    var el = node && (node.nodeType === 1 ? node : node.parentElement);
    if (el && el.closest("li")) return; // dentro de lista: Enter cria um novo item
    e.preventDefault();
    document.execCommand("insertLineBreak");
    update();
  });

  /* ── TOAST (com ação opcional, ex.: Desfazer) ── */
  function toast(msg, opts) {
    opts = opts || {};
    var zone = $("toastZone");
    var life = opts.action ? 6000 : 3000;
    var t = document.createElement("div");
    t.className = "toast" + (opts.error ? " error" : "") + (opts.action ? " has-action" : "");
    t.style.setProperty("--toast-life", life + "ms");
    var span = document.createElement("span");
    span.textContent = msg;
    t.appendChild(span);
    if (opts.action) {
      var b = document.createElement("button");
      b.type = "button";
      b.className = "toast-action";
      b.textContent = opts.action;
      b.addEventListener("click", function () {
        opts.onAction();
        t.remove();
      });
      t.appendChild(b);
    }
    zone.appendChild(t);
    setTimeout(function () {
      t.remove();
    }, life + 300);
  }

  /* ── EXPORTAR ── */
  function currentEmail() {
    var s = read();
    return { html: buildEmail(s), issues: collectIssues(s).list.length };
  }

  function copiedMsg(base, issues) {
    if (!issues) return base;
    return base + " · " + (issues === 1 ? "1 ponto para revisar" : issues + " pontos para revisar");
  }

  function copyText(text) {
    if (navigator.clipboard && window.isSecureContext) return navigator.clipboard.writeText(text);
    return new Promise(function (resolve, reject) {
      var ta = document.createElement("textarea");
      ta.value = text;
      ta.setAttribute("readonly", "");
      ta.style.position = "fixed";
      ta.style.opacity = "0";
      document.body.appendChild(ta);
      ta.select();
      var ok = document.execCommand("copy");
      ta.remove();
      ok ? resolve() : reject();
    });
  }

  function copyHTML() {
    var email = currentEmail();
    copyText(email.html).then(
      function () {
        toast(copiedMsg("Código HTML copiado. Cole no seu ESP", email.issues));
      },
      function () {
        toast("Não foi possível copiar. Use o botão Baixar.", { error: true });
      },
    );
  }

  function copyForGmail() {
    var email = currentEmail();
    var fail = function () {
      toast("Seu navegador não permitiu. Use Baixar, abra o arquivo e copie de lá.", { error: true });
    };
    try {
      var item = new ClipboardItem({
        "text/html": new Blob([email.html], { type: "text/html" }),
        "text/plain": new Blob([parse(email.html).content.textContent || ""], { type: "text/plain" }),
      });
      navigator.clipboard.write([item]).then(function () {
        toast(copiedMsg("Copiado! Cole no corpo da mensagem do Gmail", email.issues));
      }, fail);
    } catch (e) {
      fail();
    }
  }

  function slug(s) {
    return String(s || "")
      .normalize("NFD")
      .replace(/[̀-ͯ]/g, "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 40);
  }

  function downloadHTML() {
    var email = currentEmail();
    var name = "email" + (slug($("titleText").value) ? "-" + slug($("titleText").value) : "") + ".html";
    var a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([email.html], { type: "text/html;charset=utf-8" }));
    a.download = name;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(function () {
      URL.revokeObjectURL(a.href);
    }, 2000);
    toast(copiedMsg("Arquivo " + name + " baixado", email.issues));
  }

  /* novo e-mail sem modal: aplica o padrão e oferece desfazer */
  function newEmail() {
    var snapshot = read();
    applyState(clone(DEFAULTS));
    toast("Novo e-mail criado", {
      action: "Desfazer",
      onAction: function () {
        applyState(snapshot);
      },
    });
  }

  function setView(mode) {
    each(document.querySelectorAll("[data-view]"), function (b) {
      var on = b.dataset.view === mode;
      b.classList.toggle("active", on);
      b.setAttribute("aria-pressed", on ? "true" : "false");
    });
    $("previewWrap").classList.toggle("mobile", mode === "mobile");
  }

  /* ── MENU LATERAL: um painel por vez ── */
  var PANEL_KEY = "emailgen_panel";
  var workspace = $("workspace");
  var currentPanel = "texto";

  function openPanel(id) {
    if (!$("panel-" + id)) id = "texto";
    var railTab = document.querySelector('.rail-btn[data-panel="' + id + '"]');
    if (railTab && railTab.hidden) id = "modelos"; // etapa de outro modelo
    currentPanel = id;
    each(document.querySelectorAll(".rail-btn"), function (btn) {
      var on = btn.dataset.panel === id;
      btn.classList.toggle("active", on);
      btn.setAttribute("aria-selected", on ? "true" : "false");
      btn.tabIndex = on ? 0 : -1;
    });
    each(document.querySelectorAll(".panel"), function (p) {
      p.hidden = p.id !== "panel-" + id;
    });
    setCollapsed(false);
    $("sidebar").scrollTop = 0;
    // textareas em painéis ocultos medem altura zero: ajusta ao mostrar
    each($("panel-" + id).querySelectorAll("[data-autoresize]"), autoResize);
    if (id === "modelos") renderGallery();
    if (id === "cores") markPalette();
    try {
      localStorage.setItem(PANEL_KEY, id);
    } catch (e) {}
  }

  function setCollapsed(collapsed) {
    workspace.classList.toggle("panel-collapsed", collapsed);
    var btn = $("panelToggle");
    btn.setAttribute("aria-label", collapsed ? "Abrir painel" : "Recolher painel");
    btn.title = btn.getAttribute("aria-label");
    btn.setAttribute("aria-expanded", collapsed ? "false" : "true");
    setTimeout(fitFrame, 260);
  }

  $("rail").addEventListener("click", function (e) {
    var btn = e.target.closest(".rail-btn");
    if (!btn) return;
    // clicar de novo na etapa aberta recolhe o painel (mais espaço para a prévia)
    if (btn.dataset.panel === currentPanel && !workspace.classList.contains("panel-collapsed")) setCollapsed(true);
    else openPanel(btn.dataset.panel);
  });

  $("rail").addEventListener("keydown", function (e) {
    var keys = { ArrowDown: 1, ArrowRight: 1, ArrowUp: -1, ArrowLeft: -1 };
    if (!keys[e.key]) return;
    e.preventDefault();
    var btns = Array.prototype.slice.call(document.querySelectorAll(".rail-btn")).filter(function (b) {
      return !b.hidden;
    });
    var i = btns.indexOf(document.activeElement);
    var next = btns[(i + keys[e.key] + btns.length) % btns.length];
    openPanel(next.dataset.panel);
    next.focus();
  });

  /* ── GALERIA DE MODELOS ── */
  function renderGallery() {
    var grid = $("tplGrid");
    var s = read();
    grid.innerHTML = "";
    TEMPLATES.forEach(function (tpl) {
      var on = tpl.id === currentTemplate;
      var card = document.createElement("button");
      card.type = "button";
      card.className = "tpl-card" + (on ? " active" : "");
      card.dataset.template = tpl.id;
      card.setAttribute("aria-pressed", on ? "true" : "false");
      card.innerHTML =
        '<span class="tpl-thumb"><iframe tabindex="-1" aria-hidden="true" sandbox="" loading="lazy"></iframe></span>' +
        '<span class="tpl-name"></span><span class="tpl-desc"></span>';
      card.querySelector(".tpl-name").textContent = tpl.name;
      card.querySelector(".tpl-desc").textContent = tpl.description;
      // miniatura com o conteúdo atual do usuário
      card.querySelector("iframe").srcdoc = tpl.build(withPreset(s, tpl), H);
      grid.appendChild(card);
    });
    scaleThumbs();
  }

  function scaleThumbs() {
    each(document.querySelectorAll(".tpl-thumb iframe"), function (frame) {
      frame.style.transform = "scale(" + frame.parentNode.clientWidth / 600 + ")";
    });
  }

  /* estado com as cores e opções padrão de um modelo (o conteúdo não muda) */
  function withPreset(state, tpl) {
    var preset = tpl.preset || {};
    return {
      fields: Object.assign({}, state.fields, preset.fields),
      checks: Object.assign({}, state.checks, preset.checks),
      blocks: state.blocks,
      articles: state.articles,
      products: state.products,
      template: tpl.id,
    };
  }

  $("tplGrid").addEventListener("click", function (e) {
    var card = e.target.closest("[data-template]");
    if (!card || card.dataset.template === currentTemplate) return;
    var snapshot = read();
    var tpl = getTemplate(card.dataset.template);
    applyState(withPreset(snapshot, tpl));
    toast("Modelo “" + tpl.name + "” aplicado", {
      action: "Desfazer",
      onAction: function () {
        applyState(snapshot);
      },
    });
  });

  /* ── SELETORES SEGMENTADOS ──
     Menus de poucas opções viram botões na identidade da página; o <select> continua
     guardando o valor (oculto), então leitura, salvamento e eventos não mudam. */
  function buildSegments() {
    each(document.querySelectorAll("select[data-segmented]"), function (select) {
      var group = document.createElement("div");
      group.className = "seg-control";
      group.setAttribute("role", "radiogroup");
      group.setAttribute("aria-labelledby", select.getAttribute("aria-labelledby"));
      each(select.options, function (opt) {
        var b = document.createElement("button");
        b.type = "button";
        b.setAttribute("role", "radio");
        b.dataset.value = opt.value;
        b.textContent = opt.textContent;
        b.addEventListener("click", function () {
          if (select.value === opt.value) return;
          select.value = opt.value;
          select.dispatchEvent(new Event("change", { bubbles: true }));
        });
        group.appendChild(b);
      });
      // setas trocam a opção, como num grupo de rádio
      group.addEventListener("keydown", function (e) {
        var step = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 }[e.key];
        if (!step) return;
        e.preventDefault();
        var i = (select.selectedIndex + step + select.options.length) % select.options.length;
        group.children[i].click();
        group.children[i].focus();
      });
      select.hidden = true;
      select.parentNode.insertBefore(group, select.nextSibling);
    });
  }

  function syncSegments() {
    each(document.querySelectorAll("select[data-segmented]"), function (select) {
      each(select.nextElementSibling.children, function (b) {
        var on = b.dataset.value === select.value;
        b.setAttribute("aria-checked", on ? "true" : "false");
        b.tabIndex = on ? 0 : -1;
      });
    });
  }

  /* ── COMBINAÇÕES DE CORES ──
     Cada modelo traz as suas: { name, swatches: [4 cores], fields: { campo: valor } }. */
  function palettes() {
    return getTemplate(currentTemplate).palettes || [];
  }

  function renderPalettes() {
    var grid = $("paletteGrid");
    grid.innerHTML = "";
    palettes().forEach(function (p, i) {
      var b = document.createElement("button");
      b.type = "button";
      b.className = "palette";
      b.dataset.palette = i;
      b.setAttribute("aria-pressed", "false");
      b.innerHTML =
        '<span class="palette-sw" aria-hidden="true">' +
        p.swatches.map(function (c) {
          return '<span style="background:' + color(c, "#cccccc") + '"></span>';
        }).join("") +
        '</span><span class="palette-name"></span>';
      b.querySelector(".palette-name").textContent = p.name;
      grid.appendChild(b);
    });
    markPalette();
  }

  function markPalette() {
    var list = palettes();
    each(document.querySelectorAll("[data-palette]"), function (b) {
      var p = list[b.dataset.palette];
      var on = !!p && Object.keys(p.fields).every(function (k) {
        return $(k).value.toLowerCase() === p.fields[k].toLowerCase();
      });
      b.classList.toggle("active", on);
      b.setAttribute("aria-pressed", on ? "true" : "false");
    });
  }

  function setFields(values) {
    Object.keys(values).forEach(function (k) {
      $(k).value = values[k];
      syncColorRow($(k));
    });
    markPalette();
    update();
  }

  $("paletteGrid").addEventListener("click", function (e) {
    var b = e.target.closest("[data-palette]");
    if (!b) return;
    var p = palettes()[b.dataset.palette];
    var before = {};
    Object.keys(p.fields).forEach(function (k) {
      before[k] = $(k).value;
    });
    setFields(p.fields);
    toast("Cores “" + p.name + "” aplicadas", {
      action: "Desfazer",
      onAction: function () {
        setFields(before);
      },
    });
  });

  /* mostra só as opções que o modelo atual usa (atributo data-templates="id id") */
  function syncTemplateFields() {
    each(document.querySelectorAll("[data-templates]"), function (el) {
      el.hidden = el.dataset.templates.split(" ").indexOf(currentTemplate) === -1;
    });
    var tab = document.querySelector('.rail-btn[data-panel="' + currentPanel + '"]');
    if (tab && tab.hidden) openPanel("modelos");
  }

  /* campo pertence a uma opção escondida pelo modelo atual? */
  function outOfTemplate(id) {
    var el = $(id);
    var owner = el && el.closest("[data-templates]");
    return !!owner && owner.dataset.templates.split(" ").indexOf(currentTemplate) === -1;
  }

  var ACTIONS = {
    new: newEmail,
    download: downloadHTML,
    gmail: copyForGmail,
    copy: copyHTML,
    "add-block": addBlock,
    "add-article": ARTICLES.add,
    "add-product": PRODUCTS.add,
    "color-apply": applyColor,
    "color-reset": resetColor,
    "link-apply": applyLink,
    "link-remove": removeLink,
    "toggle-panel": function () {
      setCollapsed(!workspace.classList.contains("panel-collapsed"));
    },
    "enable-footer": function () {
      $("footerEnabled").checked = true;
      syncToggles();
      update();
    },
  };

  document.addEventListener("click", function (e) {
    var a = e.target.closest("[data-action]");
    if (a && ACTIONS[a.dataset.action]) return ACTIONS[a.dataset.action]();
    var v = e.target.closest("[data-view]");
    if (v) setView(v.dataset.view);
  });

  /* ── INIT ── */
  buildSegments();
  applyState(load() || clone(DEFAULTS));
  var savedPanel = null;
  try {
    savedPanel = localStorage.getItem(PANEL_KEY);
  } catch (e) {}
  openPanel(savedPanel || "texto");
})();
