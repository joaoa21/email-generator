/* ═══════════════════════════════════════════════
   LOGIN (Authik)
   A conta vive em auth.emailgenerator.com.br: a sessão é um cookie HttpOnly de lá,
   que o navegador só manda com credentials: "include". Aqui nada guarda senha nem token.
   Toda ação devolve { ok: true, data } ou { ok: false, code, message } — nunca lança.
   ═══════════════════════════════════════════════ */
(function () {
  var AUTH_URL = "https://auth.emailgenerator.com.br/api/auth";

  // mensagens em português; nunca revelam se um e-mail tem conta
  var MESSAGES = {
    INVALID_EMAIL_OR_PASSWORD: "E-mail ou senha inválidos.",
    INVALID_EMAIL: "Confira o e-mail digitado.",
    INVALID_PASSWORD: "E-mail ou senha inválidos.",
    EMAIL_NOT_VERIFIED: "Confirme seu e-mail antes de entrar. Enviamos um link para a sua caixa de entrada.",
    PASSWORD_TOO_SHORT: "A senha precisa ter pelo menos 8 caracteres.",
    PASSWORD_TOO_WEAK: "Use pelo menos 8 caracteres, com letras, números e um caractere especial.",
    PASSWORD_COMPROMISED: "Essa senha já apareceu em vazamentos de outros sites. Escolha uma senha diferente.",
    PASSWORD_TOO_LONG: "A senha é longa demais.",
    INVALID_TOKEN: "Este link é inválido ou já foi usado. Peça um novo.",
    TOKEN_EXPIRED: "Este link expirou. Peça um novo.",
    ACCOUNT_UNAVAILABLE: "Não foi possível entrar nesta conta. Fale com o suporte.",
    ACCOUNT_DELETED: "Esta conta foi excluída.",
    TRY_AGAIN_LATER: "Muitas tentativas. Aguarde um pouco e tente de novo.",
    RATE_LIMITED: "Muitas tentativas. Aguarde um pouco e tente de novo.",
    NETWORK_ERROR: "Não foi possível conectar. Confira sua internet e tente de novo.",
  };

  function message(code, status) {
    if (MESSAGES[code]) return MESSAGES[code];
    if (status === 429) return MESSAGES.RATE_LIMITED;
    return "Algo deu errado. Tente de novo em instantes.";
  }

  function call(path, body, method) {
    var init = { method: method || (body ? "POST" : "GET"), credentials: "include", headers: {} };
    if (body) {
      init.headers["Content-Type"] = "application/json";
      init.body = JSON.stringify(body);
    }
    return fetch(AUTH_URL + path, init).then(
      function (res) {
        return res.text().then(function (text) {
          var data = null;
          try {
            data = text ? JSON.parse(text) : null;
          } catch (e) {}
          if (res.ok) return { ok: true, data: data };
          var code = (data && data.code) || (res.status === 429 ? "RATE_LIMITED" : "HTTP_" + res.status);
          return { ok: false, code: code, message: message(code, res.status) };
        });
      },
      function () {
        return { ok: false, code: "NETWORK_ERROR", message: MESSAGES.NETWORK_ERROR };
      }
    );
  }

  /** Requisitos da senha (a mesma regra do servidor), para o checklist ao vivo. */
  function passwordRules(value) {
    return [
      { key: "length", label: "Pelo menos 8 caracteres", met: value.length >= 8 },
      { key: "letter", label: "Uma letra", met: /\p{L}/u.test(value) },
      { key: "number", label: "Um número", met: /\p{N}/u.test(value) },
      { key: "special", label: "Um caractere especial", met: /[\p{P}\p{S}]/u.test(value) },
    ];
  }

  /** Para onde voltar depois de entrar: só caminhos deste site (nada de //outro-site). */
  function backTo(fallback) {
    var v = new URLSearchParams(location.search).get("volta") || "";
    return /^\/(?!\/)[^\\]*$/.test(v) ? v : fallback || "/gerador-de-email-html/";
  }

  window.Auth = {
    /** Conta logada agora, ou null (consulta o servidor, sem cache). */
    getUser: function () {
      return call("/get-session").then(function (r) {
        return r.ok ? { ok: true, data: (r.data && r.data.user) || null } : r;
      });
    },
    /** Token curto (JWT, 5 minutos) para o servidor do site saber quem está pedindo. Não guardar. */
    getToken: function () {
      return call("/token").then(function (r) {
        return r.ok && r.data && r.data.token ? { ok: true, data: r.data.token } : r.ok ? { ok: false, code: "NO_TOKEN", message: message() } : r;
      });
    },
    login: function (email, password) {
      return call("/sign-in/email", { email: email, password: password });
    },
    /** Com verificação obrigatória, responde igual para e-mail novo ou já cadastrado. */
    register: function (name, email, password, marketingOptIn) {
      return call("/sign-up/email", { name: name, email: email, password: password, marketingOptIn: !!marketingOptIn });
    },
    logout: function () {
      return call("/sign-out", {});
    },
    requestPasswordReset: function (email) {
      return call("/request-password-reset", { email: email });
    },
    resetPassword: function (token, newPassword) {
      return call("/reset-password", { token: token, newPassword: newPassword });
    },
    verifyEmail: function (token) {
      return call("/verify-email?token=" + encodeURIComponent(token));
    },
    resendVerification: function (email) {
      return call("/send-verification-email", { email: email });
    },
    passwordRules: passwordRules,
    backTo: backTo,
  };
})();
