/* ═══════════════════════════════════════════════
   TRAVA DAS FERRAMENTAS
   A página carrega inteira (o Google lê e indexa normalmente); se não houver conta
   logada, uma janela pede para entrar ou criar conta e o resto da página fica inerte.
   Logado: o cabeçalho ganha o botão da conta, com o e-mail e "Sair".
   ═══════════════════════════════════════════════ */
(function () {
  var params = new URLSearchParams(location.search);
  if (params.has("preview")) return; // prévia dos modelos usada na página inicial

  var here = location.pathname + location.search;

  function el(tag, cls, text) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text) e.textContent = text;
    return e;
  }

  function lockPage(lock) {
    Array.prototype.forEach.call(document.body.children, function (child) {
      // o aviso de cookies continua clicável por cima de tudo
      if (!child.classList.contains("auth-gate") && !child.classList.contains("cookie-aviso")) child.inert = lock;
    });
  }

  function showGate(failed) {
    var old = document.querySelector(".auth-gate");
    if (old) old.remove();
    var gate = el("div", "auth-gate");
    var box = el("div", "auth-gate-box");
    box.setAttribute("role", "dialog");
    box.setAttribute("aria-modal", "true");
    box.setAttribute("aria-labelledby", "authGateTitle");
    var mark = el("span", "auth-mark", "e.");
    mark.setAttribute("aria-hidden", "true");
    var title = el("h2", "auth-gate-title", failed ? "Não foi possível conferir seu login" : "Entre para usar o gerador");
    title.id = "authGateTitle";
    var text = el(
      "p",
      "auth-gate-text",
      failed
        ? "Confira sua internet e tente de novo. Se continuar, aguarde alguns minutos."
        : "Crie sua conta em um minuto para montar e-mails e links de WhatsApp. O que você já fez neste navegador continua aqui."
    );
    box.appendChild(mark);
    box.appendChild(title);
    box.appendChild(text);
    var actions = el("div", "auth-gate-actions");
    if (failed) {
      var retry = el("button", "auth-btn auth-btn-primary", "Tentar de novo");
      retry.type = "button";
      retry.addEventListener("click", check);
      actions.appendChild(retry);
    } else {
      var signup = el("a", "auth-btn auth-btn-primary", "Criar conta");
      signup.href = "/criar-conta/?volta=" + encodeURIComponent(here);
      var login = el("a", "auth-btn", "Já tenho conta");
      login.href = "/entrar/?volta=" + encodeURIComponent(here);
      actions.appendChild(signup);
      actions.appendChild(login);
    }
    box.appendChild(actions);
    var back = el("a", "auth-gate-back", "Voltar para o início");
    back.href = "/";
    box.appendChild(back);
    gate.appendChild(box);
    document.body.appendChild(gate);
    lockPage(true);
    actions.firstChild.focus();
  }

  function initials(user) {
    var base = (user.name || user.email || "?").trim();
    return base.charAt(0).toUpperCase();
  }

  function showAccount(user) {
    var header = document.querySelector(".header");
    if (!header || header.querySelector(".account")) return;
    var wrap = el("div", "account");
    var btn = el("button", "account-btn", initials(user));
    btn.type = "button";
    btn.setAttribute("aria-haspopup", "true");
    btn.setAttribute("aria-expanded", "false");
    btn.setAttribute("aria-label", "Sua conta: " + (user.email || ""));
    btn.title = user.email || "Sua conta";
    var menu = el("div", "account-menu");
    menu.hidden = true;
    menu.appendChild(el("p", "account-name", user.name || "Sua conta"));
    menu.appendChild(el("p", "account-email", user.email || ""));
    var out = el("button", "account-out", "Sair");
    out.type = "button";
    menu.appendChild(out);
    wrap.appendChild(btn);
    wrap.appendChild(menu);
    header.appendChild(wrap);

    function toggle(open) {
      menu.hidden = !open;
      btn.setAttribute("aria-expanded", open ? "true" : "false");
    }
    btn.addEventListener("click", function () {
      toggle(menu.hidden);
    });
    document.addEventListener("click", function (e) {
      if (!wrap.contains(e.target)) toggle(false);
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && !menu.hidden) {
        toggle(false);
        btn.focus();
      }
    });
    out.addEventListener("click", function () {
      out.disabled = true;
      out.textContent = "Saindo…";
      Auth.logout().then(function () {
        location.href = "/";
      });
    });
  }

  function check() {
    Auth.getUser().then(function (r) {
      if (!r.ok) return showGate(true);
      if (!r.data) return showGate(false);
      var gate = document.querySelector(".auth-gate");
      if (gate) gate.remove();
      lockPage(false);
      showAccount(r.data);
    });
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", check);
  else check();
})();
