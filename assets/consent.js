/* Aviso de cookies (LGPD).
   Sem escolha ou com "Recusar": nada é guardado no navegador e o Google Analytics não carrega
   (o Trackik continua contando de forma anônima, 1 vez por dia, sem cookies).
   Com "Aceitar": carrega o Google Analytics e liga a contagem precisa do Trackik
   (trackik.consentir(): um código anônimo para reconhecer quem volta em outros dias).
   Fica num arquivo porque a CSP do site não permite JavaScript dentro do HTML.
   Guia: trackik/docs/instalar-em-um-site.md */
(() => {
  const KEY = "emailgenerator-cookies";
  const GA_ID = "G-6XZ57LGL1Q";

  const read = () => { try { return localStorage.getItem(KEY); } catch { return null; } };
  const save = (value) => { try { localStorage.setItem(KEY, value); } catch {} };

  function loadGoogleAnalytics() {
    if (window.__emailgenGA) return;
    window.__emailgenGA = true;
    window.dataLayer = window.dataLayer || [];
    window.gtag = function () { window.dataLayer.push(arguments); };
    window.gtag("js", new Date());
    window.gtag("config", GA_ID);
    const script = document.createElement("script");
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_ID}`;
    document.head.appendChild(script);
  }

  // Recusou depois de ter aceitado: apaga os cookies do Google Analytics (_ga, _ga_*).
  function clearGoogleAnalyticsCookies() {
    const host = location.hostname;
    const domains = ["", host, `.${host}`, `.${host.replace(/^www\./, "")}`];
    for (const name of document.cookie.split(";").map((c) => c.split("=")[0].trim())) {
      if (!/^_ga(_|$)/.test(name)) continue;
      for (const domain of domains) {
        document.cookie = `${name}=; Max-Age=0; path=/${domain ? `; domain=${domain}` : ""}`;
      }
    }
  }

  // O script do Trackik carrega com defer: se ainda não existir, espera a página carregar.
  function trackik(action) {
    const run = () => window.trackik?.[action]();
    if (window.trackik) run();
    else window.addEventListener("load", run, { once: true });
  }

  let banner = null;

  function buildBanner() {
    banner = document.createElement("div");
    banner.className = "cookie-aviso";
    banner.setAttribute("role", "dialog");
    banner.setAttribute("aria-label", "Preferência de cookies");
    banner.hidden = true;

    const text = document.createElement("p");
    text.textContent =
      "Usamos estatísticas anônimas para melhorar o site. Se você aceitar, ativamos o Google Analytics e guardamos um código anônimo no seu navegador para reconhecer quando você volta.";

    const actions = document.createElement("div");
    actions.className = "cookie-aviso-acoes";
    const accept = document.createElement("button");
    accept.type = "button";
    accept.className = "cookie-aviso-btn cookie-aviso-btn--aceitar";
    accept.textContent = "Aceitar";
    accept.addEventListener("click", () => choose("aceito"));
    const reject = document.createElement("button");
    reject.type = "button";
    reject.className = "cookie-aviso-btn";
    reject.textContent = "Recusar";
    reject.addEventListener("click", () => choose("recusado"));
    actions.append(accept, reject);

    banner.append(text, actions);
    document.body.appendChild(banner);
  }

  function showBanner() {
    if (!banner) buildBanner();
    banner.hidden = false;
  }

  function choose(value) {
    const before = read();
    save(value);
    if (banner) banner.hidden = true;
    if (value === "aceito") {
      loadGoogleAnalytics();
      trackik("consentir");
    } else {
      trackik("revogar");
      if (before === "aceito") clearGoogleAnalyticsCookies();
    }
  }

  // Link no rodapé (página inicial) para mudar de ideia a qualquer momento.
  function addFooterLink() {
    const footer = document.querySelector(".footer-inner");
    if (!footer) return;
    const link = document.createElement("button");
    link.type = "button";
    link.className = "footer-cookies mono";
    link.textContent = "Preferências de cookies";
    link.addEventListener("click", showBanner);
    footer.appendChild(link);
  }

  function start() {
    const choice = read();
    if (choice === "aceito") {
      loadGoogleAnalytics();
      trackik("consentir");
    } else if (!choice) {
      showBanner();
    }
    addFooterLink();
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start, { once: true });
  else start();
})();
