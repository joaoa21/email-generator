/* ═══════════════════════════════════════════════
   MODELO 1 — Cartões
   Logo, banner, conteúdo e rodapé em cartões arredondados.

   Como criar um modelo novo: copie este arquivo, troque id/name/description,
   monte o corpo em build() usando as peças de `h` e inclua o <script> no index.html.
   `s` é o estado do editor ({ fields, checks, blocks }); `h` traz as peças prontas
   e já seguras (escape, URLs validadas, botão com VML para o Outlook etc.).
   ═══════════════════════════════════════════════ */
(function () {
  (window.EmailTemplates = window.EmailTemplates || []).push({
    id: "cards",
    name: "Cartões",
    description: "Logo, conteúdo e rodapé em cartões arredondados.",

    // cores e opções aplicadas ao escolher o modelo (o conteúdo não muda)
    preset: {
      fields: {
        bgHex: "#f0f0f0", cardAccentHex: "#1e293b", cardBgHex: "#ffffff", cardBorderHex: "#e1e1e6",
        titleColorHex: "#242424", textHex: "#242424",
        btnBgHex: "#2563eb", btnTxtHex: "#ffffff", btnBorderHex: "#1d4ed8",
        footerLegalColorHex: "#dadada", footerSocialColorHex: "#ffffff", footerUnsubColorHex: "#999999",
        socialIconColorHex: "#ffffff", socialIconSize: "md",
      },
      checks: { btnBorderOn: true, btnArrow: false },
    },

    palettes: [
      palette("Grafite", "#f0f0f0", "#1e293b", "#ffffff", "#e1e1e6", "#2563eb", "#1d4ed8", "#242424"),
      palette("Floresta", "#eef2ee", "#14532d", "#ffffff", "#d7e3d9", "#15803d", "#166534", "#14532d"),
      palette("Vinho", "#f6efef", "#5b1a2a", "#ffffff", "#ead8dc", "#9f1239", "#881337", "#5b1a2a"),
      palette("Papel", "#f4f1ea", "#191713", "#fffdf8", "#e3ddcf", "#c8451f", "#a8381a", "#191713"),
      palette("Oceano", "#eaf2f8", "#0c4a6e", "#ffffff", "#d3e3ee", "#0284c7", "#0369a1", "#0c4a6e"),
      palette("Lavanda", "#f3f0fa", "#3b2a6b", "#ffffff", "#e2dcf2", "#7c3aed", "#6d28d9", "#3b2a6b"),
    ],

    build: function (s, h) {
      var f = s.fields;
      var c = s.checks;
      var accent = h.color(f.cardAccentHex, "#1e293b");
      var bg = h.color(f.bgHex, "#f0f0f0");
      var linkColor = h.color(f.btnBgHex, "#2563eb");

      function card(style, inner) {
        return (
          "<table " + h.TABLE + ' style="max-width:600px;margin:0 auto 10px;border-radius:15px;overflow:hidden;' + style + '">' +
          '<tbody><tr style="width:100%">' + inner + "</tr></tbody></table>"
        );
      }

      var logo = c.logoEnabled ? h.logo(s, { width: 250 }) : "";
      var logoCard = logo
        ? card("background-color:" + accent + ";color:#f0f0f0;", '<td style="padding:20px 0 10px;text-align:center;">' + logo + "</td>")
        : "";

      var banner = h.banner(s);
      var bannerCard = banner
        ? card("background-color:#eeeeee;border:1px solid " + accent + ";", '<td style="text-align:center;">' + banner + "</td>")
        : "";

      var title =
        c.titleEnabled && f.titleText.trim()
          ? '<p style="font-size:24px;line-height:150%;font-weight:900;margin:16px 0 15px;text-align:center;color:' +
            h.color(f.titleColorHex, "#242424") + ';">' + h.esc(f.titleText.trim()) + "</p>"
          : "";

      var content = card(
        "background-color:" + h.color(f.cardBgHex, "#ffffff") + ";color:" + h.color(f.textHex, "#242424") + ";border:1px solid " + h.color(f.cardBorderHex, "#e1e1e6") + ";",
        '<td style="padding:40px 25px;">' + title + h.blocks(s, linkColor) + h.button(s) + "</td>",
      );

      var footerCard = "";
      if (c.footerEnabled) {
        var unsubColor = h.color(f.footerUnsubColorHex, "#999999");
        var icons = h.socialIcons(s);
        var unsub = h.unsubscribe(s, unsubColor);
        footerCard = card(
          "background-color:" + accent + ";color:#f0f0f0;",
          "<td>" +
            '<p style="font-size:14px;line-height:24px;color:' + h.color(f.footerLegalColorHex, "#dadada") +
            ';margin:20px 0 10px;text-align:center;padding:0 40px;">' + h.multiline(f.footerLegal) + "</p>" +
            (icons
              ? '<div style="text-align:center;">' +
                (f.footerSocialText.trim()
                  ? '<p style="font-size:15px;line-height:24px;color:' + h.color(f.footerSocialColorHex, "#ffffff") +
                    ';margin:16px 0;padding:0 40px;">' + h.esc(f.footerSocialText.trim()) + "</p>"
                  : "") +
                icons + "</div>"
              : "") +
            (unsub
              ? '<p style="font-size:12px;line-height:24px;color:' + unsubColor + ';margin:16px 0;padding:12px 10px;text-align:center;">' + unsub + "</p>"
              : '<div style="height:12px;line-height:12px;font-size:12px;">&nbsp;</div>') +
            "</td>",
        );
      }

      return h.document(s, {
        background: bg,
        body:
          '<table border="0" width="100%" cellpadding="0" cellspacing="0" role="presentation" align="center"><tbody><tr>' +
          '<td style="margin:0;padding:50px 10px;background-color:' + bg + ";font-family:'Inter',Arial,sans-serif;\">" +
          logoCard + bannerCard + content + footerCard +
          "</td></tr></tbody></table>",
      });
    },
  });

  function palette(name, bg, accent, card, border, btn, btnBorder, title) {
    return {
      name: name,
      swatches: [bg, accent, btn, card],
      fields: {
        bgHex: bg, cardAccentHex: accent, cardBgHex: card, cardBorderHex: border,
        btnBgHex: btn, btnTxtHex: "#ffffff", btnBorderHex: btnBorder, titleColorHex: title,
      },
    };
  }
})();
