/* ═══════════════════════════════════════════════
   MODELO 8 — Carta pessoal
   Parece um e-mail escrito por uma pessoa: fundo branco, fonte padrão,
   alinhado à esquerda, chamada como link no texto (ou botão discreto),
   assinatura com foto, nome e cargo, e P.S. opcional.
   Campos próprios na etapa "Remetente" do menu.
   ═══════════════════════════════════════════════ */
(function () {
  (window.EmailTemplates = window.EmailTemplates || []).push({
    id: "letter",
    name: "Carta pessoal",
    description: "Parece escrito à mão: texto simples e assinatura.",

    preset: {
      fields: {
        bgHex: "#ffffff", textHex: "#222222", titleColorHex: "#111111",
        btnBgHex: "#1a56db", btnTxtHex: "#ffffff", btnBorderHex: "#1a56db",
        footerLegalColorHex: "#9a9a9a", footerSocialColorHex: "#9a9a9a", footerUnsubColorHex: "#9a9a9a",
        socialIconStyle: "mono", socialIconColorHex: "#b0b0b0", socialIconSize: "sm",
      },
      checks: { btnBorderOn: false, btnArrow: false, btnUppercase: false },
    },

    // a cor vai para os links e o botão
    palettes: [
      palette("Clássico", "#ffffff", "#1a56db"),
      palette("Tinta", "#ffffff", "#191713"),
      palette("Verde", "#ffffff", "#15803d"),
      palette("Terracota", "#ffffff", "#c8451f"),
      palette("Papel", "#fbf9f4", "#8a5a2b"),
      palette("Roxo", "#ffffff", "#6d28d9"),
    ],

    build: function (s, h) {
      var f = s.fields;
      var c = s.checks;
      var page = h.color(f.bgHex, "#ffffff");
      var text = h.color(f.textHex, "#222222");
      var strong = h.color(f.titleColorHex, "#111111");
      var accent = h.color(f.btnBgHex, "#1a56db");
      var muted = h.color(f.footerLegalColorHex, "#9a9a9a");
      var font = "font-family:Arial,Helvetica,sans-serif;";
      var out = "";

      var banner = h.banner(s, { radius: 6 });
      if (banner) out += '<div style="margin:0 0 24px;">' + banner + "</div>";

      if (c.titleEnabled && f.titleText.trim()) {
        out += '<p style="margin:0 0 4px;font-size:17px;line-height:150%;font-weight:700;color:' + strong + ';">' + h.esc(f.titleText.trim()) + "</p>";
      }

      out += h.blocks(s, accent, { fontSize: 15, weight: 400 });

      /* chamada: link no meio do texto (padrão) ou botão discreto */
      var label = f.btnText.trim();
      if (c.btnEnabled && label) {
        if (f.letterCta === "button") {
          out += h.button(s, { font: "Arial,Helvetica,sans-serif", fontSize: 15, radius: 6, weight: 700, align: "left" }).replace("margin-top:30px;", "margin-top:20px;");
        } else {
          var link = h.safeUrl(f.btnLink);
          out +=
            '<p style="margin:20px 0;font-size:15px;line-height:160%;">' +
            '<a href="' + h.esc(link || "#") + '" target="_blank" rel="noopener noreferrer" style="color:' + accent + ';font-weight:700;text-decoration:underline;">' +
            h.esc(label) + " &rarr;</a></p>";
        }
      }

      /* assinatura */
      if (f.letterClosing.trim()) {
        out += '<p style="margin:28px 0 16px;font-size:15px;line-height:160%;color:' + text + ';">' + h.esc(f.letterClosing.trim()) + "</p>";
      }
      var name = f.letterName.trim();
      var role = [f.letterRole.trim(), f.letterCompany.trim()].filter(Boolean).map(h.esc).join(" · ");
      var photo = h.safeUrl(f.letterPhoto, true);
      var logo = c.logoEnabled ? h.logo(s, { width: 90, darkPlaceholder: true }) : "";
      if (name || role || photo) {
        out +=
          '<table role="presentation" border="0" cellpadding="0" cellspacing="0"><tr>' +
          (photo
            ? '<td valign="middle" style="padding-right:14px;"><img src="' + h.esc(photo) + '" alt="' + h.esc(name) +
              '" width="52" height="52" style="display:block;width:52px;height:52px;border-radius:50%;border:0;outline:none;" /></td>'
            : "") +
          '<td valign="middle">' +
          (name ? '<p style="margin:0;font-size:15px;line-height:140%;font-weight:700;color:' + strong + ';">' + h.esc(name) + "</p>" : "") +
          (role ? '<p style="margin:2px 0 0;font-size:13px;line-height:140%;color:' + muted + ';">' + role + "</p>" : "") +
          "</td></tr></table>";
      }
      if (logo) out += '<div style="margin:16px 0 0;">' + logo + "</div>";

      if (f.letterPs.trim()) {
        out += '<p style="margin:28px 0 0;font-size:15px;line-height:160%;color:' + text + ';">' + h.multiline(f.letterPs) + "</p>";
      }

      /* rodapé mínimo */
      if (c.footerEnabled) {
        var unsubColor = h.color(f.footerUnsubColorHex, "#9a9a9a");
        var icons = h.socialIcons(s, { align: "left" });
        var unsub = h.unsubscribe(s, unsubColor);
        out +=
          '<div style="margin:40px 0 0;padding:16px 0 0;border-top:1px solid #eeeeee;">' +
          '<p style="margin:0 0 10px;font-size:11px;line-height:18px;color:' + muted + ';">' + h.multiline(f.footerLegal) + "</p>" +
          (icons ? icons : "") +
          (unsub ? '<p style="margin:10px 0 0;font-size:11px;line-height:18px;color:' + unsubColor + ';">' + unsub + "</p>" : "") +
          "</div>";
      }

      // alinhado à esquerda, como um e-mail escrito no próprio programa
      return h.document(s, {
        background: page,
        body:
          '<table border="0" width="100%" cellpadding="0" cellspacing="0" role="presentation"><tbody><tr>' +
          '<td style="padding:28px 24px;background-color:' + page + ";" + font + "color:" + text + ';">' +
          '<table border="0" width="100%" cellpadding="0" cellspacing="0" role="presentation" style="max-width:600px;"><tbody><tr><td>' +
          out +
          "</td></tr></tbody></table>" +
          "</td></tr></tbody></table>",
      });
    },
  });

  function palette(name, bg, accent) {
    return {
      name: name,
      swatches: [bg, accent, "#222222", "#eeeeee"],
      fields: { bgHex: bg, btnBgHex: accent, btnBorderHex: accent },
    };
  }
})();
