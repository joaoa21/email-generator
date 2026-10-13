/* ═══════════════════════════════════════════════
   MODELO 4 — Cupom
   Logo centralizada, cartão com a oferta em destaque, caixa tracejada com o
   código, validade, botão e regras em letra pequena. Rodapé fora do cartão.
   Campos próprios na etapa "Cupom" do menu (couponEyebrow, couponValue,
   couponCode, couponExpiry, couponRules).
   ═══════════════════════════════════════════════ */
(function () {
  (window.EmailTemplates = window.EmailTemplates || []).push({
    id: "coupon",
    name: "Cupom",
    description: "Oferta em destaque com código de desconto.",

    preset: {
      fields: {
        bgHex: "#f4efe6", cardBgHex: "#ffffff", couponAccentHex: "#c8451f", couponBoxHex: "#fff6ef",
        titleColorHex: "#191713", textHex: "#4a463e",
        btnBgHex: "#c8451f", btnTxtHex: "#ffffff", btnBorderHex: "#c8451f",
        footerLegalColorHex: "#8a857a", footerSocialColorHex: "#8a857a", footerUnsubColorHex: "#8a857a",
        socialIconStyle: "mono", socialIconColorHex: "#8a857a", socialIconSize: "sm",
      },
      checks: { btnBorderOn: false, btnArrow: false, btnUppercase: true },
    },

    palettes: [
      palette("Terracota", "#f4efe6", "#c8451f", "#fff6ef"),
      palette("Rosa", "#fdf2f4", "#e11d48", "#fff1f3"),
      palette("Verde", "#eef6f0", "#15803d", "#effaf2"),
      palette("Azul", "#eef3fb", "#2563eb", "#f0f5ff"),
      palette("Roxo", "#f5f1fb", "#7c3aed", "#f7f2ff"),
      palette("Preto", "#f4f4f5", "#18181b", "#fafafa"),
    ],

    build: function (s, h) {
      var f = s.fields;
      var c = s.checks;
      var page = h.color(f.bgHex, "#f4efe6");
      var accent = h.color(f.couponAccentHex, "#c8451f");
      var box = h.color(f.couponBoxHex, "#fff6ef");
      var text = h.color(f.textHex, "#4a463e");
      var strong = h.color(f.titleColorHex, "#191713");
      var muted = h.color(f.footerLegalColorHex, "#8a857a");
      var font = "font-family:'Inter',Arial,sans-serif;";
      var mono = "font-family:'IBM Plex Mono','Courier New',monospace;";

      var logo = c.logoEnabled ? h.logo(s, { width: 160, darkPlaceholder: true }) : "";
      var banner = h.banner(s);

      var eyebrow = f.couponEyebrow.trim()
        ? '<p style="margin:0 0 6px;font-size:13px;line-height:150%;font-weight:700;letter-spacing:0.14em;text-transform:uppercase;color:' + accent + ';">' +
          h.esc(f.couponEyebrow.trim()) + "</p>"
        : "";

      var value = f.couponValue.trim()
        ? '<p style="margin:0 0 10px;font-size:52px;line-height:105%;font-weight:900;letter-spacing:-0.02em;color:' + accent + ';">' +
          h.esc(f.couponValue.trim()) + "</p>"
        : "";

      var title =
        c.titleEnabled && f.titleText.trim()
          ? '<h1 style="margin:0 0 4px;font-size:22px;line-height:135%;font-weight:700;color:' + strong + ';">' + h.esc(f.titleText.trim()) + "</h1>"
          : "";

      // caixa tracejada com o código (a borda tracejada também funciona no Outlook)
      var code = f.couponCode.trim();
      var couponBox = code
        ? "<table " + h.TABLE + ' style="max-width:420px;margin:28px auto 0;"><tr>' +
          '<td style="border:2px dashed ' + accent + ";background-color:" + box + ';border-radius:12px;padding:20px 24px;text-align:center;">' +
          '<p style="margin:0 0 6px;font-size:12px;line-height:150%;letter-spacing:0.12em;text-transform:uppercase;color:' + muted + ';">Use o código</p>' +
          '<p style="margin:0;font-size:30px;line-height:120%;font-weight:600;letter-spacing:0.12em;' + mono + "color:" + strong + ';">' + h.esc(code) + "</p>" +
          (f.couponExpiry.trim()
            ? '<p style="margin:8px 0 0;font-size:13px;line-height:150%;color:' + muted + ';">' + h.esc(f.couponExpiry.trim()) + "</p>"
            : "") +
          "</td></tr></table>"
        : "";

      var rules = f.couponRules.trim()
        ? '<p style="margin:24px 0 0;font-size:12px;line-height:160%;color:' + muted + ';">' + h.multiline(f.couponRules) + "</p>"
        : "";

      var card =
        "<table " + h.TABLE + ' style="max-width:600px;margin:0 auto;background-color:' + h.color(f.cardBgHex, "#ffffff") +
        ';border-radius:16px;overflow:hidden;">' +
        (banner ? "<tr><td>" + banner + "</td></tr>" : "") +
        '<tr><td style="padding:40px 32px 36px;text-align:center;color:' + text + ';">' +
        eyebrow + value + title +
        h.blocks(s, accent) +
        couponBox +
        h.button(s, { font: "'Inter',Arial,sans-serif", fontSize: 16, radius: 10, weight: 800 }) +
        rules +
        "</td></tr></table>";

      var footer = "";
      if (c.footerEnabled) {
        var unsubColor = h.color(f.footerUnsubColorHex, "#8a857a");
        var icons = h.socialIcons(s);
        var unsub = h.unsubscribe(s, unsubColor);
        footer =
          '<div style="max-width:520px;margin:0 auto;padding:28px 20px 0;text-align:center;">' +
          '<p style="margin:0 0 12px;font-size:12px;line-height:20px;color:' + muted + ';">' + h.multiline(f.footerLegal) + "</p>" +
          (icons
            ? (f.footerSocialText.trim()
                ? '<p style="margin:0 0 8px;font-size:12px;line-height:20px;color:' + h.color(f.footerSocialColorHex, "#8a857a") + ';">' +
                  h.esc(f.footerSocialText.trim()) + "</p>"
                : "") + icons
            : "") +
          (unsub ? '<p style="margin:12px 0 0;font-size:12px;line-height:20px;color:' + unsubColor + ';">' + unsub + "</p>" : "") +
          "</div>";
      }

      return h.document(s, {
        background: page,
        fonts: ["IBM+Plex+Mono:wght@600"],
        body:
          '<table border="0" width="100%" cellpadding="0" cellspacing="0" role="presentation" align="center"><tbody><tr>' +
          '<td style="padding:40px 16px;background-color:' + page + ";" + font + '">' +
          (logo ? '<div style="text-align:center;padding:0 0 24px;">' + logo + "</div>" : "") +
          card + footer +
          "</td></tr></tbody></table>",
      });
    },
  });

  function palette(name, bg, accent, box) {
    return {
      name: name,
      swatches: [bg, accent, box, "#ffffff"],
      fields: { bgHex: bg, couponAccentHex: accent, couponBoxHex: box, btnBgHex: accent, btnBorderHex: accent },
    };
  }
})();
