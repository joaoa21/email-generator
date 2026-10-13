/* ═══════════════════════════════════════════════
   MODELO 2 — Gradiente
   Fundo escuro com brilho no canto, barra com logo e links, texto claro,
   botão claro com seta, faixa de aviso opcional e rodapé claro.
   Baseado num e-mail feito para uma casa de apostas.

   Compatibilidade: Gmail e Outlook ignoram o gradiente e mostram a cor de fundo
   sólida; a fonte Oswald do botão cai para Arial Narrow onde não carrega.
   ═══════════════════════════════════════════════ */
(function () {
  (window.EmailTemplates = window.EmailTemplates || []).push({
    id: "gradient",
    name: "Gradiente",
    description: "Fundo escuro com brilho, links no topo e rodapé claro.",

    preset: {
      fields: {
        bgHex: "#ffffff", gradBaseHex: "#021619", gradGlowHex: "#0a4048", gradBorderHex: "#2a6a73", footerBgHex: "#eaedee",
        titleColorHex: "#f9f9fa", textHex: "#f9f9fa",
        btnBgHex: "#fcfefd", btnTxtHex: "#06272c", btnBorderHex: "#fcfefd",
        footerLegalColorHex: "#6b6b6b", footerSocialColorHex: "#6b6b6b", footerUnsubColorHex: "#6b6b6b",
        socialIconStyle: "mono", socialIconColorHex: "#8a8f91", socialIconSize: "sm",
      },
      checks: { btnBorderOn: false, btnUppercase: true, btnArrow: true },
    },

    palettes: [
      palette("Petróleo", "#021619", "#0a4048", "#2a6a73", "#06272c"),
      palette("Esmeralda", "#001e0e", "#043d20", "#276243", "#082712"),
      palette("Meia-noite", "#050b1f", "#14306b", "#2b4a8f", "#0b1736"),
      palette("Vinho", "#1a0509", "#4a0f1f", "#7a2a3c", "#3a0a16"),
      palette("Ametista", "#0f0820", "#34175e", "#5b3a8e", "#24113f"),
      palette("Grafite", "#0d0d0d", "#2b2b2b", "#4a4a4a", "#111111"),
    ],

    build: function (s, h) {
      var f = s.fields;
      var c = s.checks;
      var base = h.color(f.gradBaseHex, "#021619");
      var glow = h.color(f.gradGlowHex, "#0a4048");
      var border = h.color(f.gradBorderHex, "#2a6a73");
      var text = h.color(f.textHex, "#f9f9fa");
      var linkColor = h.color(f.btnBgHex, "#fcfefd");
      var font = "font-family:'Inter',Arial,sans-serif;";

      /* barra do topo: logo à esquerda, links à direita */
      var logo = c.logoEnabled ? h.logo(s, { width: 160 }) : "";
      var nav = [[f.nav1Text, f.nav1Url], [f.nav2Text, f.nav2Url]]
        .map(function (n) {
          var label = n[0].trim();
          if (!label) return "";
          var url = h.safeUrl(n[1]);
          var style = "color:" + text + ";text-decoration:none;font-size:14px;font-weight:600;letter-spacing:0.6px;margin-left:16px;";
          return url
            ? '<a href="' + h.esc(url) + '" target="_blank" rel="noopener noreferrer" style="' + style + '">' + h.esc(label) + "</a>"
            : '<span style="' + style + '">' + h.esc(label) + "</span>";
        })
        .join("");
      var topbar =
        logo || nav
          ? "<table " + h.TABLE + ' style="max-width:550px;margin:0 auto 10px;border:1px solid ' + border + ';border-radius:15px;"><tr>' +
            '<td style="padding:16px 28px;text-align:' + (nav ? "left" : "center") + ';">' + logo + "</td>" +
            (nav ? '<td style="padding:16px 28px 16px 0;text-align:right;white-space:nowrap;">' + nav + "</td>" : "") +
            "</tr></table>"
          : "";

      var banner = h.banner(s);
      var bannerRow = banner ? '<div style="padding-top:20px;">' + banner + "</div>" : "";

      var title =
        c.titleEnabled && f.titleText.trim()
          ? '<p style="font-size:28px;line-height:150%;font-weight:900;letter-spacing:0.6px;margin:16px 0 15px;text-align:center;color:' +
            h.color(f.titleColorHex, "#f9f9fa") + ';">' + h.esc(f.titleText.trim()) + "</p>"
          : "";

      var content =
        '<div style="padding:10px 25px 40px;color:' + text + ';letter-spacing:0.3px;">' +
        title +
        h.blocks(s, linkColor, { fontSize: 18 }) +
        h.button(s, { font: "'Oswald','Arial Narrow',Arial,sans-serif", fontSize: 22, radius: 12 }) +
        "</div>";

      // a faixa usa a cor de fundo escurecida (rgba não funciona no Outlook)
      var warning =
        c.warningEnabled && f.warningText.trim()
          ? '<div style="background-color:' + shade(base, 0.45) + ';padding:14px 24px;text-align:center;font-size:14px;line-height:150%;color:#ffffff;font-style:italic;">' +
            h.esc(f.warningText.trim()) + "</div>"
          : "";

      var main =
        "<table " + h.TABLE + ' style="max-width:600px;margin:0 auto;background-color:' + base +
        ";background-image:radial-gradient(ellipse at top right, " + glow + " 5%, " + base + ' 50%);">' +
        '<tr><td style="padding:40px 0 0;' + font + 'color:' + text + ';">' +
        topbar + bannerRow + content + warning +
        "</td></tr></table>";

      /* rodapé claro, alinhado à esquerda */
      var footer = "";
      if (c.footerEnabled) {
        var muted = h.color(f.footerLegalColorHex, "#6b6b6b");
        var unsubColor = h.color(f.footerUnsubColorHex, "#6b6b6b");
        var footerLogo = h.image(f.footerLogoUrl, f.logoAlt.trim() || "Logo", f.logoLink, 160,
          "display:inline-block;outline:none;border:none;text-decoration:none;opacity:0.6;max-width:100%;height:auto;");
        var icons = h.socialIcons(s, { align: "left" });
        var unsub = h.unsubscribe(s, unsubColor);
        footer =
          "<table " + h.TABLE + ' style="max-width:600px;margin:0 auto;background-color:' + h.color(f.footerBgHex, "#eaedee") + ';">' +
          '<tr><td style="padding:40px 40px 24px;' + font + '">' +
          (footerLogo ? '<div style="margin-bottom:24px;">' + footerLogo + "</div>" : "") +
          '<p style="font-size:13px;line-height:24px;color:' + muted + ';margin:0 0 16px;">' + h.multiline(f.footerLegal) + "</p>" +
          (icons
            ? (f.footerSocialText.trim()
                ? '<p style="font-size:13px;line-height:20px;color:' + h.color(f.footerSocialColorHex, "#6b6b6b") + ';margin:0 0 10px;">' +
                  h.esc(f.footerSocialText.trim()) + "</p>"
                : "") + icons
            : "") +
          (unsub ? '<p style="font-size:12px;line-height:24px;color:' + unsubColor + ';margin:16px 0 0;">' + unsub + "</p>" : "") +
          "</td></tr></table>";
      }

      // como no original: uma coluna de 600px sobre fundo claro, sem "degrau" nas laterais
      var page = h.color(f.bgHex, "#ffffff");
      return h.document(s, {
        background: page,
        fonts: ["Oswald:wght@500;600;700"],
        body:
          '<table border="0" width="100%" cellpadding="0" cellspacing="0" role="presentation" align="center"><tbody><tr>' +
          '<td style="padding:24px 0;background-color:' + page + ';">' + main + footer + "</td></tr></tbody></table>",
      });
    },
  });

  function palette(name, base, glow, border, btnText) {
    return {
      name: name,
      swatches: [base, glow, border, "#fcfefd"],
      fields: { gradBaseHex: base, gradGlowHex: glow, gradBorderHex: border, btnTxtHex: btnText },
    };
  }

  /* mistura a cor com preto (amount 0–1) */
  function shade(hex, amount) {
    var v = hex.replace("#", "");
    if (v.length === 3) v = v[0] + v[0] + v[1] + v[1] + v[2] + v[2];
    var out = "#";
    for (var i = 0; i < 6; i += 2) {
      var n = Math.round(parseInt(v.slice(i, i + 2), 16) * (1 - amount));
      out += ("0" + n.toString(16)).slice(-2);
    }
    return out;
  }
})();
