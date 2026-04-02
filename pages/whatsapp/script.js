(function () {
  var generatedUrl = "";

  /* ── FORMATAR TELEFONE ── */
  window.formatPhone = function (input) {
    var v = input.value.replace(/\D/g, "").slice(0, 11);
    if (v.length <= 2) {
      input.value = v;
    } else if (v.length <= 6) {
      input.value = v.slice(0, 2) + " " + v.slice(2);
    } else if (v.length <= 10) {
      input.value = v.slice(0, 2) + " " + v.slice(2, 6) + "-" + v.slice(6);
    } else {
      input.value = v.slice(0, 2) + " " + v.slice(2, 7) + "-" + v.slice(7);
    }
  };

  /* ── CONTADOR DE CARACTERES ── */
  window.updateCharCount = function () {
    var len = document.getElementById("msgText").value.length;
    var el = document.getElementById("charCount");
    el.textContent = len + " / 1000";
    el.classList.toggle("warn", len > 800);
  };

  /* ── FORMATAR MENSAGEM (WhatsApp markdown) ── */
  window.formatMsg = function (type) {
    var ta = document.getElementById("msgText");
    var start = ta.selectionStart;
    var end = ta.selectionEnd;
    var selected = ta.value.slice(start, end);
    var before = ta.value.slice(0, start);
    var after = ta.value.slice(end);

    var wrap = { bold: "*", italic: "_", strike: "~", mono: "`" };
    var char = wrap[type];

    if (!char) return;

    if (selected.length > 0) {
      ta.value = before + char + selected + char + after;
      ta.selectionStart = start + 1;
      ta.selectionEnd = end + 1;
    } else {
      ta.value = before + char + char + after;
      ta.selectionStart = start + 1;
      ta.selectionEnd = start + 1;
    }

    ta.focus();
    updateCharCount();
    updateLink();
  };

  /* ── USAR TEMPLATE ── */
  window.useTemplate = function (text) {
    document.getElementById("msgText").value = text;
    updateCharCount();
    updateLink();
  };

  /* ── GERAR LINK ── */
  window.updateLink = function () {
    var raw = document.getElementById("phoneNumber").value.replace(/\D/g, "");
    var msg = document.getElementById("msgText").value.trim();

    var emptyState = document.getElementById("emptyState");
    var resultCard = document.getElementById("resultCard");
    var btnCopy = document.getElementById("btnCopy");

    if (raw.length < 10) {
      emptyState.style.display = "flex";
      resultCard.style.display = "none";
      btnCopy.disabled = true;
      generatedUrl = "";
      return;
    }

    // Montar número com DDI 55
    var number = raw.startsWith("55") ? raw : "55" + raw;

    // Montar URL
    var url = "https://wa.me/" + number;
    if (msg) {
      url += "?text=" + encodeURIComponent(msg);
    }

    generatedUrl = url;

    // Exibir resultado
    var display = url.length > 60 ? url.slice(0, 60) + "…" : url;
    document.getElementById("linkDisplay").textContent = display;

    emptyState.style.display = "none";
    resultCard.style.display = "flex";
    btnCopy.disabled = false;
  };

  /* ── COPIAR LINK ── */
  window.copyLink = function () {
    if (!generatedUrl) return;
    navigator.clipboard.writeText(generatedUrl).then(function () {
      var btnHeader = document.getElementById("btnCopy");
      var btnFull = document.querySelector(".btn-copy-full");

      btnHeader.classList.add("copied");
      btnHeader.textContent = "Copiado!";

      if (btnFull) {
        var orig = btnFull.innerHTML;
        btnFull.textContent = "✓ Copiado!";
        setTimeout(function () {
          btnFull.innerHTML = orig;
        }, 2500);
      }

      setTimeout(function () {
        btnHeader.classList.remove("copied");
        btnHeader.innerHTML =
          '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/></svg> Copiar Link';
      }, 2500);
    });
  };

  /* ── ABRIR WHATSAPP ── */
  window.openWhatsApp = function () {
    if (generatedUrl) window.open(generatedUrl, "_blank");
  };
})();