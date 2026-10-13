/* ═══════════════════════════════════════════════
   MODELO 7 — Convite
   Para eventos, lançamentos e webinars: chamada, nome do evento em serifa,
   bloco de calendário (mês, dia, dia da semana) ao lado de "Quando" e "Onde",
   descrição, botão de confirmação e link "Adicionar ao Google Agenda"
   gerado a partir da data e dos horários (etapa "Evento" do menu).
   ═══════════════════════════════════════════════ */
(function () {
  var MONTHS = ["janeiro", "fevereiro", "março", "abril", "maio", "junho", "julho", "agosto", "setembro", "outubro", "novembro", "dezembro"];
  var WEEKDAYS = ["Domingo", "Segunda-feira", "Terça-feira", "Quarta-feira", "Quinta-feira", "Sexta-feira", "Sábado"];
  var SERIF = "font-family:Georgia,'Times New Roman',serif;";

  (window.EmailTemplates = window.EmailTemplates || []).push({
    id: "invite",
    name: "Convite",
    description: "Evento com data em destaque e link para a agenda.",

    preset: {
      fields: {
        bgHex: "#f6f1e7", cardBgHex: "#ffffff", inviteAccentHex: "#9a6b2f",
        titleColorHex: "#1f1a14", textHex: "#4a4339",
        btnBgHex: "#9a6b2f", btnTxtHex: "#ffffff", btnBorderHex: "#9a6b2f",
        footerLegalColorHex: "#8a8275", footerSocialColorHex: "#8a8275", footerUnsubColorHex: "#8a8275",
        socialIconStyle: "mono", socialIconColorHex: "#8a8275", socialIconSize: "sm",
      },
      checks: { btnBorderOn: false, btnArrow: false, btnUppercase: false },
    },

    palettes: [
      palette("Champanhe", "#f6f1e7", "#9a6b2f"),
      palette("Terracota", "#f6efe8", "#b4532a"),
      palette("Oliva", "#f1f2ea", "#5b6b2f"),
      palette("Marinho", "#eef1f6", "#1e3a6b"),
      palette("Rosé", "#f8eff0", "#a8435a"),
      palette("Grafite", "#f2f2f2", "#262626"),
    ],

    build: function (s, h) {
      var f = s.fields;
      var c = s.checks;
      var page = h.color(f.bgHex, "#f6f1e7");
      var accent = h.color(f.inviteAccentHex, "#9a6b2f");
      var text = h.color(f.textHex, "#4a4339");
      var strong = h.color(f.titleColorHex, "#1f1a14");
      var muted = h.color(f.footerLegalColorHex, "#8a8275");
      var font = "font-family:'Inter',Arial,sans-serif;";
      var date = parseDate(f.eventDate);
      var rows = "";

      function row(style, inner) {
        rows += '<tr><td style="' + style + '">' + inner + "</td></tr>";
      }

      var logo = c.logoEnabled ? h.logo(s, { width: 130, darkPlaceholder: true }) : "";
      if (logo) row("padding:32px 32px 0;text-align:center;", logo);

      var eyebrow = f.eventEyebrow.trim()
        ? '<p style="margin:0 0 12px;font-size:12px;line-height:150%;font-weight:700;letter-spacing:0.2em;text-transform:uppercase;color:' + accent + ';">' +
          h.esc(f.eventEyebrow.trim()) + "</p>"
        : "";
      var title =
        c.titleEnabled && f.titleText.trim()
          ? '<h1 style="margin:0;' + SERIF + "font-size:34px;line-height:120%;font-weight:400;color:" + strong + ';">' + h.esc(f.titleText.trim()) + "</h1>"
          : "";
      if (eyebrow || title) row("padding:36px 32px 28px;text-align:center;", eyebrow + title);

      var banner = h.banner(s);
      if (banner) row("padding:0;", banner);

      /* calendário + quando/onde */
      var when = [];
      if (date) when.push(WEEKDAYS[date.getDay()] + ", " + date.getDate() + " de " + MONTHS[date.getMonth()]);
      var hours = timeRange(f.eventStart, f.eventEnd);
      if (hours) when.push(hours);

      var calendar = date
        ? '<td class="iv-date" valign="top" width="96" style="width:96px;padding-right:24px;">' +
          '<table role="presentation" border="0" cellpadding="0" cellspacing="0" width="96" style="width:96px;border:1px solid ' + accent + ';border-radius:12px;">' +
          '<tr><td style="padding:10px 0 0;text-align:center;font-size:12px;line-height:120%;font-weight:700;letter-spacing:0.16em;text-transform:uppercase;color:' + accent + ';">' +
          MONTHS[date.getMonth()].slice(0, 3) + "</td></tr>" +
          '<tr><td style="padding:2px 0;text-align:center;' + SERIF + "font-size:40px;line-height:110%;color:" + strong + ';">' + date.getDate() + "</td></tr>" +
          '<tr><td style="padding:0 0 10px;text-align:center;font-size:11px;line-height:120%;color:' + muted + ';">' + WEEKDAYS[date.getDay()].slice(0, 3) + "</td></tr>" +
          "</table></td>"
        : "";

      function info(label, lines) {
        return (
          '<p style="margin:0 0 4px;font-size:11px;line-height:150%;font-weight:700;letter-spacing:0.14em;text-transform:uppercase;color:' + muted + ';">' + label + "</p>" +
          '<p style="margin:0 0 16px;font-size:15px;line-height:155%;color:' + strong + ';">' + lines.join("<br />") + "</p>"
        );
      }

      var whereLines = [];
      if (f.eventWhere.trim()) whereLines.push("<strong>" + h.esc(f.eventWhere.trim()) + "</strong>");
      if (f.eventAddress.trim()) whereLines.push('<span style="color:' + text + ';">' + h.esc(f.eventAddress.trim()) + "</span>");
      var map = h.safeUrl(f.eventMapUrl);
      if (map) {
        whereLines.push(
          '<a href="' + h.esc(map) + '" target="_blank" rel="noopener noreferrer" style="color:' + accent + ';font-weight:700;text-decoration:none;font-size:14px;">Ver no mapa &rarr;</a>',
        );
      }

      var details = (when.length ? info("Quando", when.map(h.esc)) : "") + (whereLines.length ? info("Onde", whereLines) : "");
      if (calendar || details) {
        row(
          "padding:0 32px 8px;",
          '<table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="border-top:1px solid ' + line(accent) +
            ";border-bottom:1px solid " + line(accent) + ';"><tr><td style="padding:24px 0 8px;">' +
            '<table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%"><tr>' +
            calendar +
            '<td class="iv-info" valign="top">' + details + "</td>" +
            "</tr></table></td></tr></table>",
        );
      }

      /* descrição, confirmação e agenda */
      var body = h.blocks(s, accent);
      var button = h.button(s, { font: "'Inter',Arial,sans-serif", fontSize: 15, radius: 999, weight: 700 });
      var cal =
        c.eventCalendar && date
          ? '<p style="margin:16px 0 0;text-align:center;font-size:14px;line-height:150%;">' +
            '<a href="' + h.esc(calendarUrl(f, date)) + '" target="_blank" rel="noopener noreferrer" style="color:' + accent + ';font-weight:700;text-decoration:underline;">Adicionar ao Google Agenda</a></p>'
          : "";
      if (body || button || cal) row("padding:16px 32px 40px;color:" + text + ";", body + button + cal);

      var card =
        "<table " + h.TABLE + ' style="max-width:600px;margin:0 auto;background-color:' + h.color(f.cardBgHex, "#ffffff") +
        ';border-radius:16px;overflow:hidden;"><tbody>' + rows + "</tbody></table>";

      var footer = "";
      if (c.footerEnabled) {
        var unsubColor = h.color(f.footerUnsubColorHex, "#8a8275");
        var icons = h.socialIcons(s);
        var unsub = h.unsubscribe(s, unsubColor);
        footer =
          '<div style="max-width:520px;margin:0 auto;padding:28px 20px 0;text-align:center;">' +
          '<p style="margin:0 0 12px;font-size:12px;line-height:20px;color:' + muted + ';">' + h.multiline(f.footerLegal) + "</p>" +
          (icons
            ? (f.footerSocialText.trim()
                ? '<p style="margin:0 0 8px;font-size:12px;line-height:20px;color:' + h.color(f.footerSocialColorHex, "#8a8275") + ';">' +
                  h.esc(f.footerSocialText.trim()) + "</p>"
                : "") + icons
            : "") +
          (unsub ? '<p style="margin:12px 0 0;font-size:12px;line-height:20px;color:' + unsubColor + ';">' + unsub + "</p>" : "") +
          "</div>";
      }

      return h.document(s, {
        background: page,
        // no celular, o calendário fica acima das informações
        css:
          "@media only screen and (max-width:480px){" +
          ".iv-date,.iv-info{display:block!important;width:100%!important;padding:0!important;}" +
          ".iv-date{padding-bottom:20px!important;}}",
        body:
          '<table border="0" width="100%" cellpadding="0" cellspacing="0" role="presentation" align="center"><tbody><tr>' +
          '<td style="padding:32px 12px;background-color:' + page + ";" + font + '">' + card + footer + "</td></tr></tbody></table>",
      });
    },
  });

  function palette(name, bg, accent) {
    return {
      name: name,
      swatches: [bg, accent, "#ffffff", "#1f1a14"],
      fields: { bgHex: bg, inviteAccentHex: accent, btnBgHex: accent, btnBorderHex: accent },
    };
  }

  /* "2026-11-26" → Date local (meio-dia, para não virar o dia anterior por fuso) */
  function parseDate(v) {
    var m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(v || ""));
    return m ? new Date(+m[1], +m[2] - 1, +m[3], 12) : null;
  }

  /* "19:00" → "19h", "19:30" → "19h30" */
  function hour(v) {
    var m = /^(\d{2}):(\d{2})/.exec(String(v || ""));
    return m ? +m[1] + "h" + (m[2] === "00" ? "" : m[2]) : "";
  }

  function timeRange(start, end) {
    var a = hour(start);
    var b = hour(end);
    if (a && b) return "das " + a + " às " + b;
    return a ? "às " + a : "";
  }

  /* linha suave: a cor de destaque misturada com branco */
  function line(hex) {
    var v = hex.replace("#", "");
    if (v.length === 3) v = v[0] + v[0] + v[1] + v[1] + v[2] + v[2];
    var out = "#";
    for (var i = 0; i < 6; i += 2) {
      var n = Math.round(parseInt(v.slice(i, i + 2), 16) * 0.25 + 255 * 0.75);
      out += ("0" + n.toString(16)).slice(-2);
    }
    return out;
  }

  /* link do Google Agenda no fuso de São Paulo; sem horário vira evento de dia inteiro */
  function calendarUrl(f, date) {
    var ymd = f.eventDate.replace(/-/g, "");
    var dates;
    var start = /^(\d{2}):(\d{2})/.exec(f.eventStart || "");
    if (start) {
      var end = /^(\d{2}):(\d{2})/.exec(f.eventEnd || "");
      var endH = end ? end[1] + end[2] : ("0" + Math.min(23, +start[1] + 2)).slice(-2) + start[2];
      dates = ymd + "T" + start[1] + start[2] + "00/" + ymd + "T" + endH + "00";
    } else {
      var next = new Date(date.getTime() + 864e5);
      dates = ymd + "/" + next.getFullYear() + ("0" + (next.getMonth() + 1)).slice(-2) + ("0" + next.getDate()).slice(-2);
    }
    var where = [f.eventWhere.trim(), f.eventAddress.trim()].filter(Boolean).join(" · ");
    return (
      "https://calendar.google.com/calendar/render?action=TEMPLATE" +
      "&text=" + encodeURIComponent(f.titleText.trim() || "Evento") +
      "&dates=" + dates +
      "&ctz=America/Sao_Paulo" +
      (where ? "&location=" + encodeURIComponent(where) : "")
    );
  }
})();
