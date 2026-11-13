/* Telas de conta: entrar, criar conta, verificar e-mail e redefinir senha.
   A tela é escolhida por <body data-page="...">; as chamadas ficam em auth.js. */
(function () {
  var $ = function (id) {
    return document.getElementById(id);
  };
  var page = document.body.dataset.page;

  function alertBox(id, text, kind) {
    var box = $(id);
    box.textContent = text || "";
    box.className = "auth-alert " + (kind || "error");
    box.hidden = !text;
  }

  function busy(form, on, label) {
    var btn = form.querySelector('button[type="submit"]');
    if (!btn.dataset.label) btn.dataset.label = btn.textContent;
    btn.disabled = on;
    btn.textContent = on ? label : btn.dataset.label;
  }

  /* campo obrigatório vazio ou e-mail mal escrito: aponta qual é */
  function firstInvalid(form, alertId) {
    Array.prototype.forEach.call(form.querySelectorAll("input"), function (i) {
      i.removeAttribute("aria-invalid");
    });
    var bad = form.querySelector("input:invalid");
    if (!bad) return false;
    var label = form.querySelector('label[for="' + bad.id + '"]');
    bad.setAttribute("aria-invalid", "true");
    bad.focus();
    alertBox(alertId, bad.type === "email" && bad.value ? "Confira o e-mail digitado." : "Preencha o campo " + (label ? "“" + label.textContent.trim() + "”" : "destacado") + ".");
    return true;
  }

  /* mostrar/ocultar senha */
  document.addEventListener("click", function (e) {
    var b = e.target.closest(".auth-show");
    if (!b) return;
    var input = b.parentNode.querySelector("input");
    var show = input.type === "password";
    input.type = show ? "text" : "password";
    b.textContent = show ? "Ocultar" : "Mostrar";
    b.setAttribute("aria-pressed", show ? "true" : "false");
  });

  /* checklist ao vivo da senha */
  function liveRules(input, list) {
    function paint() {
      list.innerHTML = "";
      Auth.passwordRules(input.value).forEach(function (r) {
        var li = document.createElement("li");
        li.textContent = r.label;
        if (r.met) li.className = "met";
        list.appendChild(li);
      });
    }
    input.addEventListener("input", paint);
    paint();
    return function () {
      return Auth.passwordRules(input.value).every(function (r) {
        return r.met;
      });
    };
  }

  /* link de verificação/redefinição: tira o token da barra de endereço logo de cara */
  function takeToken() {
    var token = new URLSearchParams(location.search).get("token");
    if (token) history.replaceState(null, "", location.pathname);
    return token;
  }

  /* reenviar confirmação (entrar e criar conta) */
  function resendFor(email, alertId) {
    Auth.resendVerification(email).then(function (r) {
      alertBox(alertId, r.ok ? "Enviamos um novo link. Confira a caixa de entrada e o spam." : r.message, r.ok ? "ok" : "error");
    });
  }

  /* ── ENTRAR ── */
  if (page === "entrar") {
    var back = Auth.backTo();
    // já logado: segue direto
    Auth.getUser().then(function (r) {
      if (r.ok && r.data) location.replace(back);
    });

    $("loginForm").addEventListener("submit", function (e) {
      e.preventDefault();
      var form = this;
      alertBox("loginAlert", "");
      $("resendBtn").hidden = true;
      if (firstInvalid(form, "loginAlert")) return;
      busy(form, true, "Entrando…");
      Auth.login($("email").value.trim(), $("password").value).then(function (r) {
        if (r.ok) return location.replace(back);
        busy(form, false);
        alertBox("loginAlert", r.message);
        if (r.code === "EMAIL_NOT_VERIFIED") $("resendBtn").hidden = false;
      });
    });
    $("resendBtn").addEventListener("click", function () {
      resendFor($("email").value.trim(), "loginAlert");
    });

    // esqueci a senha: troca o formulário na mesma tela
    function showForgot(on) {
      $("loginForm").hidden = on;
      $("forgotForm").hidden = !on;
      $("authTitle").textContent = on ? "Redefinir senha" : "Entrar";
      $("authSub").textContent = on ? "Informe o e-mail da conta. Se ele estiver cadastrado, enviamos um link para criar uma senha nova." : $("authSub").dataset.text;
      (on ? $("forgotEmail") : $("email")).focus();
      if (on && $("email").value) $("forgotEmail").value = $("email").value;
    }
    $("authSub").dataset.text = $("authSub").textContent;
    $("forgotBtn").addEventListener("click", function () {
      showForgot(true);
    });
    $("forgotBack").addEventListener("click", function () {
      showForgot(false);
    });
    $("forgotForm").addEventListener("submit", function (e) {
      e.preventDefault();
      var form = this;
      if (firstInvalid(form, "forgotAlert")) return;
      busy(form, true, "Enviando…");
      Auth.requestPasswordReset($("forgotEmail").value.trim()).then(function (r) {
        busy(form, false);
        // resposta igual com ou sem conta (não revela quem está cadastrado)
        alertBox("forgotAlert", r.ok ? "Se houver uma conta com esse e-mail, o link chega em alguns minutos. Confira também o spam." : r.message, r.ok ? "ok" : "error");
      });
    });
    var signupLink = $("signupLink");
    signupLink.href = "/criar-conta/" + location.search;
  }

  /* ── CRIAR CONTA ── */
  if (page === "criar-conta") {
    var strong = liveRules($("password"), $("rules"));
    $("loginLink").href = "/entrar/" + location.search;

    $("signupForm").addEventListener("submit", function (e) {
      e.preventDefault();
      var form = this;
      alertBox("signupAlert", "");
      if (firstInvalid(form, "signupAlert")) return;
      if (!strong()) {
        $("password").setAttribute("aria-invalid", "true");
        $("password").focus();
        return alertBox("signupAlert", "A senha ainda não atende a todos os requisitos da lista.");
      }
      if ($("password").value !== $("password2").value) {
        $("password2").setAttribute("aria-invalid", "true");
        $("password2").focus();
        return alertBox("signupAlert", "As duas senhas não são iguais.");
      }
      $("password").removeAttribute("aria-invalid");
      $("password2").removeAttribute("aria-invalid");
      busy(form, true, "Criando conta…");
      var email = $("email").value.trim();
      Auth.register($("name").value.trim(), email, $("password").value, $("marketing").checked).then(function (r) {
        busy(form, false);
        if (!r.ok) return alertBox("signupAlert", r.message);
        // mesma mensagem para e-mail novo ou já cadastrado
        $("sentTo").textContent = email;
        form.hidden = true;
        $("signupDone").hidden = false;
        $("authTitle").textContent = "Confira seu e-mail";
        $("authSub").hidden = true;
        $("signupDone").querySelector("button").focus();
      });
    });
    $("resendBtn").addEventListener("click", function () {
      resendFor($("email").value.trim(), "doneAlert");
    });
  }

  /* ── VERIFICAR E-MAIL ── */
  if (page === "verificar-email") {
    var token = takeToken();
    var failVerify = function (text) {
      $("authTitle").textContent = "Não foi possível confirmar";
      $("authSub").hidden = true;
      alertBox("verifyAlert", text);
    };
    if (!token) {
      failVerify("Abra esta página pelo link que enviamos para o seu e-mail.");
    } else {
      Auth.verifyEmail(token).then(function (r) {
        if (!r.ok) return failVerify(r.message);
        $("authTitle").textContent = "E-mail confirmado";
        $("authSub").textContent = "Pronto, sua conta está ativa.";
        // depois de confirmar o Authik pode já deixar a pessoa logada: oferece o caminho certo
        Auth.getUser().then(function (u) {
          var logged = u.ok && u.data;
          var go = $("verifyGo");
          go.href = logged ? "/gerador-de-email-html/" : "/entrar/";
          go.textContent = logged ? "Abrir o gerador" : "Entrar";
          go.hidden = false;
          go.focus();
        });
      });
    }
  }

  /* ── REDEFINIR SENHA ── */
  if (page === "redefinir-senha") {
    var resetToken = takeToken();
    var strongNew = liveRules($("password"), $("rules"));
    if (!resetToken) {
      $("resetForm").hidden = true;
      alertBox("resetAlert", "Abra esta página pelo link que enviamos para o seu e-mail.");
    }
    $("resetForm").addEventListener("submit", function (e) {
      e.preventDefault();
      var form = this;
      if (!strongNew()) return alertBox("resetAlert", "A senha ainda não atende a todos os requisitos da lista.");
      if ($("password").value !== $("password2").value) return alertBox("resetAlert", "As duas senhas não são iguais.");
      busy(form, true, "Salvando…");
      Auth.resetPassword(resetToken, $("password").value).then(function (r) {
        busy(form, false);
        if (!r.ok) return alertBox("resetAlert", r.message);
        form.hidden = true;
        $("authTitle").textContent = "Senha alterada";
        $("authSub").textContent = "Use a senha nova para entrar. Por segurança, encerramos as outras sessões da conta.";
        $("resetGo").hidden = false;
        $("resetGo").focus();
        alertBox("resetAlert", "");
      });
    });
  }
})();
