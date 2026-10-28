(function () {
  "use strict";

  function $(id) {
    return document.getElementById(id);
  }

  var SAVE_KEY = "wagen_state";
  var MAX_TEXT = 1000;

  // DDDs em uso no Brasil
  var DDDS = [
    11, 12, 13, 14, 15, 16, 17, 18, 19, 21, 22, 24, 27, 28, 31, 32, 33, 34, 35, 37, 38,
    41, 42, 43, 44, 45, 46, 47, 48, 49, 51, 53, 54, 55, 61, 62, 63, 64, 65, 66, 67, 68, 69,
    71, 73, 74, 75, 77, 79, 81, 82, 83, 84, 85, 86, 87, 88, 89, 91, 92, 93, 94, 95, 96, 97, 98, 99,
  ];

  var link = null; // { phone, text, url }
  var short = null; // { key, code, url, clicks }
  var saveTimer = 0;

  function esc(s) {
    return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  }

  /* ── NÚMERO ── */
  function isBR() {
    return $("country").value === "55";
  }

  function ddi() {
    var c = $("country").value;
    return c === "other" ? $("ddi").value.replace(/\D/g, "") : c;
  }

  function formatPhone(input) {
    var v = input.value.replace(/\D/g, "");
    if (!isBR()) {
      input.value = v.slice(0, 14);
      return;
    }
    v = v.slice(0, 11);
    if (v.length <= 2) input.value = v;
    else if (v.length <= 6) input.value = v.slice(0, 2) + " " + v.slice(2);
    else if (v.length <= 10) input.value = v.slice(0, 2) + " " + v.slice(2, 6) + "-" + v.slice(6);
    else input.value = v.slice(0, 2) + " " + v.slice(2, 7) + "-" + v.slice(7);
  }

  /* { ok, phone, error, hint } — error só aparece quando o número já parece completo */
  function validate() {
    var local = $("phoneNumber").value.replace(/\D/g, "");
    var code = ddi();

    if (!isBR()) {
      if (!code) return { ok: false, error: local ? "Informe o código do país (DDI)." : "" };
      var total = code.length + local.length;
      if (local.length < 6) return { ok: false };
      if (total > 15) return { ok: false, error: "Número longo demais para o padrão internacional." };
      return { ok: true, phone: code + local, hint: "Confira o número com o código de área do país." };
    }

    if (local.length < 10) return { ok: false };
    if (DDDS.indexOf(+local.slice(0, 2)) === -1) return { ok: false, error: "DDD " + local.slice(0, 2) + " não existe. Confira o número." };
    if (local.length === 11 && local[2] !== "9") return { ok: false, error: "Celular com 11 dígitos começa com 9 depois do DDD." };
    // o +55 é fixo na tela, então o DDI é sempre acrescentado (DDD 55 também existe)
    if (local.length === 10)
      return { ok: true, phone: "55" + local, hint: "Número fixo: só funciona se tiver WhatsApp Business." };
    return { ok: true, phone: "55" + local };
  }

  function prettyPhone(phone) {
    if (phone.indexOf("55") === 0 && isBR()) {
      var l = phone.slice(2);
      return "+55 " + l.slice(0, 2) + " " + (l.length === 11 ? l.slice(2, 7) + "-" + l.slice(7) : l.slice(2, 6) + "-" + l.slice(6));
    }
    return "+" + ddi() + " " + phone.slice(ddi().length);
  }

  /* ── MENSAGEM ── */
  function updateCharCount() {
    var len = $("msgText").value.length;
    var el = $("charCount");
    el.textContent = len + " / " + MAX_TEXT;
    el.classList.toggle("warn", len > 800);
  }

  function wrapSelection(mark) {
    var ta = $("msgText");
    var start = ta.selectionStart;
    var end = ta.selectionEnd;
    var selected = ta.value.slice(start, end);
    ta.value = ta.value.slice(0, start) + mark + selected + mark + ta.value.slice(end);
    ta.selectionStart = start + mark.length;
    ta.selectionEnd = end + mark.length;
    ta.focus();
    onChange();
  }

  /* formatação do WhatsApp para a prévia (sobre texto já escapado) */
  function waFormat(text) {
    var h = esc(text);
    var edge = "(^|[\\s([{\"'])";
    var after = "(?=$|[\\s)\\]}.,!?:;\"'])";
    h = h.replace(/```([\s\S]+?)```/g, "<code>$1</code>");
    h = h.replace(/`([^`\n]+)`/g, "<code>$1</code>");
    h = h.replace(new RegExp(edge + "\\*(?!\\s)([^*\\n]+?)\\*" + after, "g"), "$1<strong>$2</strong>");
    h = h.replace(new RegExp(edge + "_(?!\\s)([^_\\n]+?)_" + after, "g"), "$1<em>$2</em>");
    h = h.replace(new RegExp(edge + "~(?!\\s)([^~\\n]+?)~" + after, "g"), "$1<s>$2</s>");
    return h.replace(/\n/g, "<br>");
  }

  function renderBubble(text) {
    var now = new Date();
    var time = String(now.getHours()).padStart(2, "0") + ":" + String(now.getMinutes()).padStart(2, "0");
    $("bubble").innerHTML = text
      ? waFormat(text) + '<span class="bubble-time">' + time + "</span>"
      : '<span class="bubble-empty">Sem mensagem: a conversa abre com o campo vazio.</span>';
  }

  /* ── GERAR ── */
  function onChange() {
    updateCharCount();
    var v = validate();
    var hint = $("phoneHint");
    var row = $("phoneRow");

    row.classList.toggle("invalid", !!v.error);
    $("phoneNumber").setAttribute("aria-invalid", v.error ? "true" : "false");
    hint.classList.toggle("error", !!v.error);
    hint.textContent = v.error || v.hint || (isBR() ? "Inclua o DDD. Ex: 81 99999-0000" : "Número com código de área, sem o DDI.");

    var text = $("msgText").value.trim();
    clearTimeout(saveTimer);
    saveTimer = setTimeout(save, 500);

    if (!v.ok) {
      link = null;
      $("emptyState").hidden = false;
      $("resultCard").hidden = true;
      $("btnCopy").disabled = true;
      return;
    }

    var url = "https://wa.me/" + v.phone + (text ? "?text=" + encodeURIComponent(text) : "");
    link = { phone: v.phone, text: text, url: url };

    $("linkDisplay").textContent = url;
    $("linkLen").textContent = url.length + " caracteres";
    $("btnOpen").href = url;
    $("chatNumber").textContent = prettyPhone(v.phone);
    renderBubble(text);

    // o link curto vale só para o número + mensagem em que foi gerado
    if (short && short.key !== key()) short = null;
    renderShort();

    $("emptyState").hidden = true;
    $("resultCard").hidden = false;
    $("btnCopy").disabled = false;
  }

  function key() {
    return link ? link.phone + "\n" + link.text : "";
  }

  function currentUrl() {
    return short ? short.url : link ? link.url : "";
  }

  /* ── LINK CURTO ── */
  function renderShort() {
    $("shortResult").hidden = !short;
    $("btnShorten").hidden = !!short;
    if (short) {
      $("shortDisplay").textContent = short.url.replace(/^https?:\/\//, "");
      renderClicks();
    }
    $("copyLabel").textContent = short ? "Copiar link curto" : "Copiar link";
    scheduleQr();
  }

  /* desempenho: o QR e o rascunho só são refeitos quando a digitação pausa */
  var qrTimer = 0;
  function scheduleQr() {
    clearTimeout(qrTimer);
    qrTimer = setTimeout(renderQr, 120);
  }

  function renderClicks() {
    $("clicks").textContent = short.clicks === 1 ? "1 clique" : short.clicks + " cliques";
  }

  function apiError(status, data) {
    if (status === 404) return "O encurtador só funciona no site publicado (ou rodando com netlify dev).";
    if (status === 429) return "Muitos links em pouco tempo. Espere um minuto e tente de novo.";
    return (data && data.error) || "Não foi possível encurtar agora. Tente de novo.";
  }

  function request(url, opts) {
    return fetch(url, opts).then(function (res) {
      return res
        .json()
        .catch(function () {
          return null;
        })
        .then(function (data) {
          if (!res.ok) throw new Error(apiError(res.status, data));
          return data;
        });
    });
  }

  function shorten() {
    if (!link) return;
    var k = key();
    var btn = $("btnShorten");
    btn.disabled = true;
    btn.classList.add("loading");
    request("/api/shorten", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ phone: link.phone, text: link.text }),
    })
      .then(function (data) {
        if (k !== key()) return; // o usuário mudou o texto enquanto esperava
        short = { key: k, code: data.code, url: data.url, clicks: data.clicks || 0 };
        renderShort();
        toast("Link curto pronto");
      })
      .catch(function (e) {
        toast(e.message || "Sem conexão. Tente de novo.", true);
      })
      .then(function () {
        btn.disabled = false;
        btn.classList.remove("loading");
      });
  }

  function refreshClicks() {
    if (!short) return;
    var s = short;
    request("/api/links/" + encodeURIComponent(s.code))
      .then(function (data) {
        s.clicks = data.clicks || 0;
        if (short === s) renderClicks();
      })
      .catch(function (e) {
        toast(e.message, true);
      });
  }

  /* ── QR CODE ── */
  function renderQr() {
    var canvas = $("qrCanvas");
    var ctx = canvas.getContext("2d");
    var text = currentUrl();
    var note = $("qrText");
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (!text || typeof window.qrcode !== "function") {
      canvas.hidden = true;
      $("btnQr").hidden = true;
      note.textContent = text ? "Não foi possível carregar o gerador de QR Code." : "";
      return;
    }

    var qr;
    try {
      qr = window.qrcode(0, "M");
      qr.addData(text);
      qr.make();
    } catch (e) {
      // links com mensagens longas não cabem num QR legível
      canvas.hidden = true;
      $("btnQr").hidden = true;
      note.textContent = "O link é longo demais para virar QR Code. Encurte o link para gerar o QR.";
      return;
    }

    var count = qr.getModuleCount();
    var cells = count + 8; // margem de 4 módulos em cada lado
    var scale = Math.max(2, Math.floor(480 / cells));
    canvas.width = canvas.height = cells * scale;
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "#000000";
    for (var r = 0; r < count; r++) {
      for (var c = 0; c < count; c++) {
        if (qr.isDark(r, c)) ctx.fillRect((c + 4) * scale, (r + 4) * scale, scale, scale);
      }
    }
    canvas.hidden = false;
    $("btnQr").hidden = false;
    note.textContent = short
      ? "Aponta para o link curto, então os cliques também são contados."
      : "Para cartões, cardápios e material impresso. Encurte o link para um QR mais simples de ler.";
  }

  function downloadQr() {
    $("qrCanvas").toBlob(function (blob) {
      var a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = "qrcode-whatsapp" + (short ? "-" + short.code : "") + ".png";
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(function () {
        URL.revokeObjectURL(a.href);
      }, 2000);
    }, "image/png");
  }

  /* ── TOAST ── */
  function toast(msg, isError) {
    var zone = $("toastZone");
    var t = document.createElement("div");
    t.className = "toast" + (isError ? " error" : "");
    t.textContent = msg;
    zone.appendChild(t);
    setTimeout(function () {
      t.remove();
    }, 3100);
  }

  /* ── COPIAR ── */
  function copyLink() {
    var url = currentUrl();
    if (!url) return;
    var done = function () {
      toast(short ? "Link curto copiado. Cole onde quiser" : "Link copiado. Cole onde quiser");
    };
    var fail = function () {
      toast("Não foi possível copiar. Selecione o link e copie manualmente.", true);
    };
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(url).then(done, fail);
      return;
    }
    var ta = document.createElement("textarea");
    ta.value = url;
    ta.style.position = "fixed";
    ta.style.opacity = "0";
    document.body.appendChild(ta);
    ta.select();
    document.execCommand("copy") ? done() : fail();
    ta.remove();
  }

  /* ── SALVAR O RASCUNHO ── */
  function save() {
    try {
      localStorage.setItem(
        SAVE_KEY,
        JSON.stringify({ country: $("country").value, ddi: $("ddi").value, phone: $("phoneNumber").value, text: $("msgText").value }),
      );
    } catch (e) {}
  }

  function restore() {
    try {
      var s = JSON.parse(localStorage.getItem(SAVE_KEY));
      if (!s) return;
      if ($("country").querySelector('option[value="' + String(s.country).replace(/[^\w]/g, "") + '"]')) $("country").value = s.country;
      $("ddi").value = String(s.ddi || "").replace(/\D/g, "").slice(0, 4);
      $("phoneNumber").value = String(s.phone || "");
      $("msgText").value = String(s.text || "").slice(0, MAX_TEXT);
    } catch (e) {}
  }

  function onCountry() {
    var other = $("country").value === "other";
    $("ddi").hidden = !other;
    $("phoneNumber").placeholder = isBR() ? "81 99999-0000" : "Número";
    formatPhone($("phoneNumber"));
  }

  /* ── EVENTOS ── */
  $("form").addEventListener("submit", function (e) {
    e.preventDefault();
  });
  $("phoneNumber").addEventListener("input", function () {
    formatPhone(this);
    onChange();
  });
  $("ddi").addEventListener("input", function () {
    this.value = this.value.replace(/\D/g, "");
    onChange();
  });
  $("country").addEventListener("change", function () {
    onCountry();
    if ($("country").value === "other") $("ddi").focus();
    onChange();
  });
  $("msgText").addEventListener("input", onChange);

  document.addEventListener("click", function (e) {
    var fmt = e.target.closest("[data-fmt]");
    if (fmt) return wrapSelection(fmt.dataset.fmt);

    var tpl = e.target.closest("[data-template]");
    if (tpl) {
      $("msgText").value = tpl.dataset.template;
      onChange();
      return;
    }

    var action = e.target.closest("[data-action]");
    if (!action) return;
    var fn = { copy: copyLink, shorten: shorten, "refresh-clicks": refreshClicks, "download-qr": downloadQr }[action.dataset.action];
    if (fn) fn();
  });

  restore();
  onCountry();
  onChange();
})();
