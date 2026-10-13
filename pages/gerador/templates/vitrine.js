/* ═══════════════════════════════════════════════
   MODELO 6 — Vitrine
   Logo centralizada, abertura e uma grade de produtos (2 ou 3 colunas) com
   foto, nome, preço "de/por" e botão. No celular a grade vira uma coluna.
   Os produtos vêm de s.products (etapa "Produtos" do menu).
   ═══════════════════════════════════════════════ */
(function () {
  (window.EmailTemplates = window.EmailTemplates || []).push({
    id: "vitrine",
    name: "Vitrine",
    description: "Grade de produtos com foto, preço e botão.",

    preset: {
      fields: {
        bgHex: "#f5f3ef", cardBgHex: "#ffffff", vitrineAccentHex: "#191713",
        titleColorHex: "#191713", textHex: "#4a463e",
        btnBgHex: "#191713", btnTxtHex: "#ffffff", btnBorderHex: "#191713",
        footerLegalColorHex: "#8a857a", footerSocialColorHex: "#8a857a", footerUnsubColorHex: "#8a857a",
        socialIconStyle: "mono", socialIconColorHex: "#8a857a", socialIconSize: "sm",
      },
      checks: { btnBorderOn: false, btnArrow: false, btnUppercase: false },
    },

    palettes: [
      palette("Grafite", "#f5f3ef", "#191713"),
      palette("Terracota", "#f6f1ea", "#c8451f"),
      palette("Verde", "#eef5f0", "#15803d"),
      palette("Azul", "#eef3fb", "#2563eb"),
      palette("Rosa", "#fdf2f6", "#db2777"),
      palette("Roxo", "#f5f1fb", "#7c3aed"),
    ],

    build: function (s, h) {
      var f = s.fields;
      var c = s.checks;
      var page = h.color(f.bgHex, "#f5f3ef");
      var accent = h.color(f.vitrineAccentHex, "#191713");
      var onAccent = isLight(accent) ? "#191713" : "#ffffff";
      var text = h.color(f.textHex, "#4a463e");
      var strong = h.color(f.titleColorHex, "#191713");
      var muted = h.color(f.footerLegalColorHex, "#8a857a");
      var font = "font-family:'Inter',Arial,sans-serif;";
      var cols = f.vitrineCols === "3" ? 3 : 2;
      var rows = "";

      function row(style, inner) {
        rows += '<tr><td style="' + style + '">' + inner + "</td></tr>";
      }

      var logo = c.logoEnabled ? h.logo(s, { width: 160, darkPlaceholder: true }) : "";
      if (logo) row("padding:28px 24px 20px;text-align:center;", logo);

      var banner = h.banner(s);
      if (banner) row("padding:0;", banner);

      var title =
        c.titleEnabled && f.titleText.trim()
          ? '<h1 style="margin:0 0 4px;font-size:26px;line-height:130%;font-weight:800;letter-spacing:-0.01em;text-align:center;color:' + strong + ';">' +
            h.esc(f.titleText.trim()) + "</h1>"
          : "";
      var intro = title + h.blocks(s, accent);
      if (intro) row("padding:28px 32px 8px;color:" + text + ";", intro);

      if (f.vitrineHeading.trim()) {
        row(
          "padding:20px 24px 4px;text-align:center;",
          '<h2 style="margin:0;font-size:13px;line-height:150%;font-weight:700;letter-spacing:0.12em;text-transform:uppercase;color:' + accent + ';">' +
            h.esc(f.vitrineHeading.trim()) + "</h2>",
        );
      }

      /* grade: tabelas de N colunas; a margem entre cartões vem do padding das células */
      var items = (s.products || []).filter(function (p) {
        return (p.name || "").trim() || h.safeUrl(p.image, true);
      });
      var pct = Math.floor(100 / cols);
      var cellW = cols === 3 ? 168 : 260;
      var grid = "";
      for (var i = 0; i < items.length; i += cols) {
        var cells = "";
        for (var k = 0; k < cols; k++) {
          var p = items[i + k];
          cells += p
            ? '<td class="vt-col" valign="top" width="' + pct + '%" style="width:' + pct + '%;padding:0 8px 28px;text-align:center;">' + product(p) + "</td>"
            : '<td class="vt-col vt-empty" width="' + pct + '%" style="width:' + pct + '%;">&nbsp;</td>';
        }
        grid += '<table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%"><tr>' + cells + "</tr></table>";
      }
      if (grid) row("padding:20px 16px 0;", grid);

      function product(p) {
        var link = h.safeUrl(p.link);
        var img = h.safeUrl(p.image, true);
        var name = (p.name || "").trim();
        var open = link ? '<a href="' + h.esc(link) + '" target="_blank" rel="noopener noreferrer" style="text-decoration:none;">' : "";
        var close = link ? "</a>" : "";
        var out = "";
        if (img) {
          out +=
            open + '<img src="' + h.esc(img) + '" alt="' + h.esc(name) + '" width="' + cellW +
            '" style="display:block;width:100%;max-width:' + cellW + 'px;height:auto;margin:0 auto;border:0;outline:none;border-radius:10px;" />' + close;
        }
        if (name) {
          out +=
            '<p style="margin:12px 0 4px;font-size:15px;line-height:140%;font-weight:600;color:' + strong + ';">' +
            (link ? open.replace('style="', 'style="color:' + strong + ";") + h.esc(name) + close : h.esc(name)) + "</p>";
        }
        var old = (p.oldPrice || "").trim();
        var price = (p.price || "").trim();
        if (old || price) {
          out +=
            '<p style="margin:0 0 12px;font-size:14px;line-height:150%;">' +
            (old ? '<span style="color:' + muted + ';text-decoration:line-through;">' + h.esc(old) + "</span>" + (price ? "&nbsp;&nbsp;" : "") : "") +
            (price ? '<span style="font-size:17px;font-weight:800;color:' + accent + ';">' + h.esc(price) + "</span>" : "") +
            "</p>";
        }
        var label = (p.buttonText || "").trim();
        // sem link o botão aparece com "#", e o aviso "Produtos sem link" cobra o endereço
        if (label) {
          out +=
            '<a href="' + h.esc(link || "#") + '" target="_blank" rel="noopener noreferrer" style="display:inline-block;padding:9px 18px;border-radius:8px;background-color:' +
            accent + ";color:" + onAccent + ';font-size:13px;line-height:100%;font-weight:700;text-decoration:none;">' + h.esc(label) + "</a>";
        }
        return out;
      }

      var button = h.button(s, { font: "'Inter',Arial,sans-serif", fontSize: 15, radius: 8, weight: 700 });
      if (button) row("padding:0 32px 36px;", button.replace("margin-top:30px;", "margin-top:4px;"));

      var card =
        "<table " + h.TABLE + ' style="max-width:600px;margin:0 auto;background-color:' + h.color(f.cardBgHex, "#ffffff") +
        ';border-radius:16px;overflow:hidden;"><tbody>' + rows + "</tbody></table>";

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
        // no celular, a grade vira uma coluna e as células vazias somem
        css:
          "@media only screen and (max-width:480px){" +
          ".vt-col{display:block!important;width:100%!important;padding:0 8px 32px!important;}" +
          ".vt-empty{display:none!important;}}",
        body:
          '<table border="0" width="100%" cellpadding="0" cellspacing="0" role="presentation" align="center"><tbody><tr>' +
          '<td style="padding:32px 12px;background-color:' + page + ";" + font + '">' + card + footer + "</td></tr></tbody></table>",
      });
    },
  });

  function palette(name, bg, accent) {
    return {
      name: name,
      swatches: [bg, accent, "#ffffff", "#e7e2d8"],
      fields: { bgHex: bg, vitrineAccentHex: accent, btnBgHex: accent, btnBorderHex: accent },
    };
  }

  /* cor clara pede texto escuro no botão do produto */
  function isLight(hex) {
    var v = hex.replace("#", "");
    if (v.length === 3) v = v[0] + v[0] + v[1] + v[1] + v[2] + v[2];
    var r = parseInt(v.slice(0, 2), 16);
    var g = parseInt(v.slice(2, 4), 16);
    var b = parseInt(v.slice(4, 6), 16);
    return 0.299 * r + 0.587 * g + 0.114 * b > 170;
  }
})();
