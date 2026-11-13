/* ═══════════════════════════════════════════════
   TRAVA DAS FERRAMENTAS (plano Pro)
   A página carrega só a "casca" (o Google lê e indexa normalmente). O código da ferramenta
   (<body data-motor="email|whatsapp">) vem de /api/motor/..., que só entrega com assinatura ativa:
   1. conta logada no Authik?           não → "Entre para usar"
   2. token curto → /api/acesso          sem assinatura → "Assine o Pro"
   3. cookie de acesso → carrega o motor e libera a página; o cabeçalho ganha o botão da conta.
   ═══════════════════════════════════════════════ */
(function () {
  // link do checkout da assinatura na Kiwify
  var CHECKOUT_URL = "https://pay.kiwify.com.br/v20hAKz";

  var tool = document.body.dataset.motor;
  var here = location.pathname + location.search;
  var motorLoaded = false;

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

  function closeGate() {
    var old = document.querySelector(".auth-gate");
    if (old) old.remove();
  }

  /* janela: { title, text, actions: [{ label, href | onClick, primary }], foot: [{ label, href | onClick }] } */
  function showGate(opts) {
    closeGate();
    var gate = el("div", "auth-gate");
    var box = el("div", "auth-gate-box");
    box.setAttribute("role", "dialog");
    box.setAttribute("aria-modal", "true");
    box.setAttribute("aria-labelledby", "authGateTitle");
    var mark = el("span", "auth-mark", "e.");
    mark.setAttribute("aria-hidden", "true");
    var title = el("h2", "auth-gate-title", opts.title);
    title.id = "authGateTitle";
    box.appendChild(mark);
    box.appendChild(title);
    (Array.isArray(opts.text) ? opts.text : [opts.text]).forEach(function (t) {
      box.appendChild(el("p", "auth-gate-text", t));
    });
    var actions = el("div", "auth-gate-actions");
    opts.actions.forEach(function (a) {
      var b = el(a.href ? "a" : "button", "auth-btn" + (a.primary ? " auth-btn-primary" : ""), a.label);
      if (a.href) b.href = a.href;
      else {
        b.type = "button";
        b.addEventListener("click", function () {
          a.onClick(b);
        });
      }
      actions.appendChild(b);
    });
    box.appendChild(actions);
    var foot = el("p", "auth-gate-foot");
    (opts.foot || [{ label: "Voltar para o início", href: "/" }]).forEach(function (f) {
      var l = el(f.href ? "a" : "button", "auth-gate-back", f.label);
      if (f.href) l.href = f.href;
      else {
        l.type = "button";
        l.addEventListener("click", f.onClick);
      }
      foot.appendChild(l);
    });
    box.appendChild(foot);
    gate.appendChild(box);
    document.body.appendChild(gate);
    lockPage(true);
    actions.firstChild.focus();
  }

  function logout() {
    Auth.logout().then(function () {
      location.href = "/";
    });
  }

  function retry(btn) {
    btn.disabled = true;
    btn.textContent = "Conferindo…";
    check();
  }

  function failed() {
    showGate({
      title: "Não foi possível conferir seu acesso",
      text: "Confira sua internet e tente de novo. Se continuar, aguarde alguns minutos.",
      actions: [{ label: "Tentar de novo", primary: true, onClick: retry }],
    });
  }

  function askLogin() {
    showGate({
      title: "Entre para usar o gerador",
      text: "Use sua conta para abrir a ferramenta. Ainda não tem? Crie em um minuto e assine o plano Pro.",
      actions: [
        { label: "Entrar", primary: true, href: "/entrar/?volta=" + encodeURIComponent(here) },
        { label: "Criar conta", href: "/criar-conta/?volta=" + encodeURIComponent(here) },
      ],
    });
  }

  function askSubscribe(user) {
    showGate({
      title: "Assine o Pro para usar",
      text: [
        "O plano Pro custa R$ 59,90 por mês e libera tudo: os 8 modelos de e-mail, a exportação e o link curto do WhatsApp.",
        "Na compra, use o mesmo e-mail da sua conta: " + user.email + ". O acesso é liberado assim que o pagamento for aprovado.",
      ],
      actions: [
        { label: "Assinar o Pro", primary: true, href: CHECKOUT_URL },
        { label: "Já assinei", onClick: retry },
      ],
      foot: [
        { label: "Sair da conta", onClick: logout },
        { label: "Voltar para o início", href: "/" },
      ],
    });
  }

  function initials(user) {
    return (user.name || user.email || "?").trim().charAt(0).toUpperCase();
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
    menu.appendChild(el("p", "account-plan", "Plano Pro"));
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
      logout();
    });
  }

  /* o código da ferramenta: só chega com o cookie de acesso */
  function loadMotor(user) {
    if (motorLoaded) return unlock(user);
    var s = document.createElement("script");
    s.src = "/api/motor/" + tool;
    s.onload = function () {
      motorLoaded = true;
      unlock(user);
    };
    s.onerror = function () {
      s.remove();
      askSubscribe(user); // cookie venceu ou assinatura caiu entre uma conferência e outra
    };
    document.body.appendChild(s);
  }

  function unlock(user) {
    closeGate();
    lockPage(false);
    showAccount(user);
  }

  function access() {
    return Auth.getToken().then(function (t) {
      if (!t.ok) return { error: true };
      return fetch("/api/acesso", { method: "POST", headers: { Authorization: "Bearer " + t.data } }).then(
        function (res) {
          return res.json().catch(function () {
            return {};
          }).then(function (data) {
            data.status = res.status;
            return data;
          });
        },
        function () {
          return { error: true };
        }
      );
    });
  }

  function check() {
    Auth.getUser().then(function (r) {
      if (!r.ok) return failed();
      if (!r.data) return askLogin();
      var user = r.data;
      access().then(function (a) {
        if (a.active) return loadMotor(user);
        if (a.reason === "assinatura") return askSubscribe(user);
        if (a.status === 401) return askLogin();
        failed();
      });
    });
  }

  if (!tool) return;
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", check);
  else check();
})();
