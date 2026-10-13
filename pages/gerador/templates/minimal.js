/* ═══════════════════════════════════════════════
   MODELO 3 — Minimalista
   Fundo branco, coluna estreita, tudo alinhado à esquerda, como uma carta.
   Bom para confirmações, boas-vindas e comunicados: pouca imagem e
   aparência de e-mail pessoal ajudam na entrega e na leitura.
   ═══════════════════════════════════════════════ */
(function () {
  (window.EmailTemplates = window.EmailTemplates || []).push({
    id: "minimal",
    name: "Minimalista",
    description: "Fundo branco e texto à esquerda, como uma carta.",

    preset: {
      fields: {
        bgHex: "#ffffff", textHex: "#3f3f46", titleColorHex: "#18181b", lineHex: "#e7e5e4",
        btnBgHex: "#18181b", btnTxtHex: "#ffffff", btnBorderHex: "#18181b",
        footerLegalColorHex: "#8a8a8a", footerSocialColorHex: "#8a8a8a", footerUnsubColorHex: "#8a8a8a",
        socialIconStyle: "mono", socialIconColorHex: "#a1a1aa", socialIconSize: "sm",
      },
      checks: { btnBorderOn: false, btnArrow: false, btnUppercase: false },
    },

    // a cor de destaque vai para o botão e os links
    palettes: [
      palette("Tinta", "#ffffff", "#18181b", "#e7e5e4"),
      palette("Azul", "#ffffff", "#2563eb", "#e5e7eb"),
      palette("Verde", "#ffffff", "#15803d", "#e5e7eb"),
      palette("Vinho", "#ffffff", "#9f1239", "#ece4e6"),
      palette("Papel", "#faf8f3", "#c8451f", "#e8e2d6"),
      palette("Cinza", "#f4f4f5", "#18181b", "#e4e4e7"),
    ],

    build: function (s, h) {
      var f = s.fields;
      var c = s.checks;
      var page = h.color(f.bgHex, "#ffffff");
      var text = h.color(f.textHex, "#3f3f46");
      var line = h.color(f.lineHex, "#e7e5e4");
      var accent = h.color(f.btnBgHex, "#18181b");
      var font = "font-family:'Inter',Arial,sans-serif;";
      var rows = "";

      function row(style, inner) {
        rows += '<tr><td style="' + style + '">' + inner + "</td></tr>";
      }

      var logo = c.logoEnabled ? h.logo(s, { width: 120, darkPlaceholder: true }) : "";
      if (logo) row("padding:0 0 24px;border-bottom:1px solid " + line + ";text-align:left;", logo);

      var banner = h.banner(s, { radius: 8 });
      if (banner) row("padding:28px 0 0;", banner);

      var title =
        c.titleEnabled && f.titleText.trim()
          ? '<h1 style="margin:0 0 8px;font-size:26px;line-height:130%;font-weight:700;letter-spacing:-0.01em;color:' +
            h.color(f.titleColorHex, "#18181b") + ';">' + h.esc(f.titleText.trim()) + "</h1>"
          : "";

      var signature =
        c.signatureEnabled && f.signatureText.trim()
          ? '<p style="margin:32px 0 0;font-size:16px;line-height:165%;color:' + text + ';">' + h.multiline(f.signatureText) + "</p>"
          : "";

      row(
        "padding:" + (logo || banner ? "32px" : "0") + " 0 40px;color:" + text + ";",
        title +
          h.blocks(s, accent) +
          h.button(s, { font: "'Inter',Arial,sans-serif", fontSize: 15, radius: 6, weight: 600, align: "left" }) +
          signature,
      );

      if (c.footerEnabled) {
        var muted = h.color(f.footerLegalColorHex, "#8a8a8a");
        var unsubColor = h.color(f.footerUnsubColorHex, "#8a8a8a");
        var icons = h.socialIcons(s, { align: "left" });
        var unsub = h.unsubscribe(s, unsubColor);
        row(
          "padding:24px 0 0;border-top:1px solid " + line + ";",
          '<p style="margin:0 0 12px;font-size:12px;line-height:20px;color:' + muted + ';">' + h.multiline(f.footerLegal) + "</p>" +
            (icons
              ? (f.footerSocialText.trim()
                  ? '<p style="margin:0 0 8px;font-size:12px;line-height:20px;color:' + h.color(f.footerSocialColorHex, "#8a8a8a") + ';">' +
                    h.esc(f.footerSocialText.trim()) + "</p>"
                  : "") + icons
              : "") +
            (unsub ? '<p style="margin:12px 0 0;font-size:12px;line-height:20px;color:' + unsubColor + ';">' + unsub + "</p>" : ""),
        );
      }

      return h.document(s, {
        background: page,
        body:
          '<table border="0" width="100%" cellpadding="0" cellspacing="0" role="presentation" align="center"><tbody><tr>' +
          '<td style="padding:48px 20px;background-color:' + page + ";" + font + '">' +
          "<table " + h.TABLE + ' style="max-width:560px;margin:0 auto;"><tbody>' + rows + "</tbody></table>" +
          "</td></tr></tbody></table>",
      });
    },
  });

  function palette(name, bg, accent, line) {
    return {
      name: name,
      swatches: [bg, accent, "#3f3f46", line],
      fields: { bgHex: bg, btnBgHex: accent, btnBorderHex: accent, lineHex: line },
    };
  }
})();
