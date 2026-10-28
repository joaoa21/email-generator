/* ═══════════════════════════════════════════════
   MODELO 5 — Newsletter
   Barra de destaque no topo, cabeçalho com logo, edição e data, abertura
   (título + blocos de texto) e uma lista de matérias com imagem, título,
   resumo e link. As matérias vêm de s.articles (etapa "Matérias" do menu).
   Layout das imagens: "stack" (em cima, largura toda) ou "side" (ao lado).
   ═══════════════════════════════════════════════ */
(function () {
  (window.EmailTemplates = window.EmailTemplates || []).push({
    id: "newsletter",
    name: "Newsletter",
    description: "Edição com abertura e lista de matérias.",

    preset: {
      fields: {
        bgHex: "#f3f1ec", cardBgHex: "#ffffff", newsAccentHex: "#c8451f", lineHex: "#e7e2d8",
        titleColorHex: "#191713", textHex: "#4a463e",
        btnBgHex: "#191713", btnTxtHex: "#ffffff", btnBorderHex: "#191713",
        footerLegalColorHex: "#8a857a", footerSocialColorHex: "#8a857a", footerUnsubColorHex: "#8a857a",
        socialIconStyle: "mono", socialIconColorHex: "#8a857a", socialIconSize: "sm",
      },
      checks: { btnBorderOn: false, btnArrow: false, btnUppercase: false },
    },

    palettes: [
      palette("Jornal", "#f3f1ec", "#c8451f", "#e7e2d8"),
      palette("Azul", "#eef2f7", "#1d4ed8", "#dfe6f0"),
      palette("Verde", "#eef4ef", "#166534", "#dce8de"),
      palette("Vinho", "#f6f0f1", "#9f1239", "#ecdfe2"),
      palette("Roxo", "#f4f1fa", "#6d28d9", "#e5def3"),
      palette("Grafite", "#f4f4f5", "#18181b", "#e4e4e7"),
    ],

    build: function (s, h) {
      var f = s.fields;
      var c = s.checks;
      var page = h.color(f.bgHex, "#f3f1ec");
      var accent = h.color(f.newsAccentHex, "#c8451f");
      var line = h.color(f.lineHex, "#e7e2d8");
      var text = h.color(f.textHex, "#4a463e");
      var strong = h.color(f.titleColorHex, "#191713");
      var muted = h.color(f.footerLegalColorHex, "#8a857a");
      var font = "font-family:'Inter',Arial,sans-serif;";
      var mono = "font-family:'IBM Plex Mono','Courier New',monospace;";
      var side = f.newsLayout === "side";
      var rows = "";

      function row(style, inner) {
        rows += '<tr><td style="' + style + '">' + inner + "</td></tr>";
      }

      // barra fina de destaque
      rows += '<tr><td style="height:4px;line-height:4px;font-size:0;background-color:' + accent + ';">&nbsp;</td></tr>';

      /* cabeçalho: logo | edição e data */
      var logo = c.logoEnabled ? h.logo(s, { width: 140, darkPlaceholder: true }) : "";
      var meta = [f.newsEdition.trim(), f.newsDate.trim()].filter(Boolean).map(h.esc).join("<br />");
      if (logo || meta) {
        row(
          "padding:24px 32px;border-bottom:1px solid " + line + ";",
          '<table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%"><tr>' +
            '<td valign="middle" style="text-align:left;">' + logo + "</td>" +
            (meta
              ? '<td valign="middle" style="text-align:right;font-size:11px;line-height:17px;letter-spacing:0.08em;text-transform:uppercase;white-space:nowrap;' +
                mono + "color:" + muted + ';">' + meta + "</td>"
              : "") +
            "</tr></table>",
        );
      }

      var banner = h.banner(s);
      if (banner) row("padding:0;", banner);

      /* abertura */
      var title =
        c.titleEnabled && f.titleText.trim()
          ? '<h1 style="margin:0 0 4px;font-size:26px;line-height:130%;font-weight:700;letter-spacing:-0.01em;color:' + strong + ';">' +
            h.esc(f.titleText.trim()) + "</h1>"
          : "";
      var intro = title + h.blocks(s, accent);
      if (intro) row("padding:32px 32px 8px;color:" + text + ";", intro);

      /* matérias */
      (s.articles || []).forEach(function (a) {
        var t = (a.title || "").trim();
        var body = (a.text || "").trim();
        if (!t && !body) return;
        var link = h.safeUrl(a.link);
        var img = h.safeUrl(a.image, true);

        var titleHtml = t
          ? '<h2 style="margin:0 0 6px;font-size:' + (side ? 17 : 20) + 'px;line-height:135%;font-weight:700;color:' + strong + ';">' +
            (link
              ? '<a href="' + h.esc(link) + '" target="_blank" rel="noopener noreferrer" style="color:' + strong + ';text-decoration:none;">' + h.esc(t) + "</a>"
              : h.esc(t)) +
            "</h2>"
          : "";
        var bodyHtml = body ? '<p style="margin:0;font-size:15px;line-height:160%;color:' + text + ';">' + h.multiline(body) + "</p>" : "";
        var more = link
          ? '<p style="margin:10px 0 0;font-size:14px;line-height:150%;font-weight:700;">' +
            '<a href="' + h.esc(link) + '" target="_blank" rel="noopener noreferrer" style="color:' + accent + ';text-decoration:none;">' +
            h.esc((a.linkText || "").trim() || "Ler mais") + " &rarr;</a></p>"
          : "";
        var textCol = titleHtml + bodyHtml + more;

        var image = "";
        if (img) {
          var tag =
            '<img src="' + h.esc(img) + '" alt="' + h.esc(t) + '" width="' + (side ? 160 : 536) +
            '" style="display:block;width:100%;max-width:' + (side ? 160 : 536) + 'px;height:auto;border:0;outline:none;border-radius:8px;" />';
          image = link ? '<a href="' + h.esc(link) + '" target="_blank" rel="noopener noreferrer">' + tag + "</a>" : tag;
        }

        var inner =
          image && side
            ? '<table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%"><tr>' +
              '<td valign="top" width="160" class="nl-img" style="width:160px;padding-right:20px;">' + image + "</td>" +
              '<td valign="top" class="nl-text">' + textCol + "</td></tr></table>"
            : (image ? '<div style="margin-bottom:16px;">' + image + "</div>" : "") + textCol;

        row("padding:24px 32px;border-top:1px solid " + line + ";", inner);
      });

      var button = h.button(s, { font: "'Inter',Arial,sans-serif", fontSize: 15, radius: 8, weight: 700 });
      if (button) row("padding:0 32px 32px;", button);

      /* rodapé dentro do papel, separado por linha */
      if (c.footerEnabled) {
        var unsubColor = h.color(f.footerUnsubColorHex, "#8a857a");
        var icons = h.socialIcons(s);
        var unsub = h.unsubscribe(s, unsubColor);
        row(
          "padding:24px 32px 28px;border-top:1px solid " + line + ";text-align:center;",
          '<p style="margin:0 0 12px;font-size:12px;line-height:20px;color:' + muted + ';">' + h.multiline(f.footerLegal) + "</p>" +
            (icons
              ? (f.footerSocialText.trim()
                  ? '<p style="margin:0 0 8px;font-size:12px;line-height:20px;color:' + h.color(f.footerSocialColorHex, "#8a857a") + ';">' +
                    h.esc(f.footerSocialText.trim()) + "</p>"
                  : "") + icons
              : "") +
            (unsub ? '<p style="margin:12px 0 0;font-size:12px;line-height:20px;color:' + unsubColor + ';">' + unsub + "</p>" : ""),
        );
      }

      return h.document(s, {
        background: page,
        fonts: ["IBM+Plex+Mono:wght@500"],
        // no celular, imagem ao lado vira imagem em cima
        css:
          "@media only screen and (max-width:480px){" +
          ".nl-img,.nl-text{display:block!important;width:100%!important;padding:0!important;}" +
          ".nl-img{padding-bottom:14px!important;}.nl-img img{max-width:100%!important;}}",
        body:
          '<table border="0" width="100%" cellpadding="0" cellspacing="0" role="presentation" align="center"><tbody><tr>' +
          '<td style="padding:32px 12px;background-color:' + page + ";" + font + '">' +
          "<table " + h.TABLE + ' style="max-width:600px;margin:0 auto;background-color:' + h.color(f.cardBgHex, "#ffffff") + ';"><tbody>' +
          rows +
          "</tbody></table>" +
          "</td></tr></tbody></table>",
      });
    },
  });

  function palette(name, bg, accent, line) {
    return {
      name: name,
      swatches: [bg, accent, line, "#ffffff"],
      fields: { bgHex: bg, newsAccentHex: accent, lineHex: line },
    };
  }
})();
