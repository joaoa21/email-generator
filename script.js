(function () {
  /* rolagem suave (Lenis), só para quem não pediu menos movimento */
  if (window.Lenis && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    var lenis = new Lenis({ duration: 1.2, smoothWheel: true, lerp: 0.08 });
    var raf = function (time) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    };
    requestAnimationFrame(raf);

    /* âncoras do menu passam pelo Lenis */
    document.querySelectorAll('a[href^="#"]').forEach(function (a) {
      a.addEventListener("click", function (e) {
        var target = document.querySelector(a.getAttribute("href"));
        if (target) {
          e.preventDefault();
          lenis.scrollTo(target, { offset: -70 });
        }
      });
    });
  }

  /* FAQ: abre e fecha com animação de altura (o <details> nativo pula direto) */
  var calm = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  document.querySelectorAll(".faq details").forEach(function (d) {
    var summary = d.querySelector("summary");
    var body = d.querySelector("p");
    // o ícone acompanha o clique, não o fim da animação
    d.addEventListener("toggle", function () {
      if (!d._anim) d.classList.toggle("is-open", d.open);
    });
    summary.addEventListener("click", function (e) {
      if (calm || !d.animate) return;
      e.preventDefault();
      if (d._anim) d._anim.cancel();
      var closing = d.classList.contains("is-open");
      d.classList.toggle("is-open", !closing);
      var border = d.offsetHeight - d.clientHeight;
      var start = d.offsetHeight;
      if (!closing) d.open = true;
      var end = closing ? summary.offsetHeight + border : d.offsetHeight;
      d.style.overflow = "hidden";
      d._anim = d.animate({ height: [start + "px", end + "px"] }, { duration: 280, easing: "cubic-bezier(.2,.7,.2,1)" });
      body.animate({ opacity: closing ? [1, 0] : [0, 1], transform: closing ? ["none", "translateY(-4px)"] : ["translateY(-4px)", "none"] }, { duration: 220, easing: "ease-out" });
      d._anim.onfinish = function () {
        d._anim = null;
        d.style.overflow = "";
        if (closing) d.open = false;
      };
    });
  });

  /* nav: sombra ao rolar */
  var nav = document.querySelector(".nav");
  window.addEventListener("scroll", function () {
    nav.classList.toggle("scrolled", window.scrollY > 10);
  }, { passive: true });

  /* menu mobile */
  var burger = document.getElementById("navBurger");
  var mobile = document.getElementById("navMobile");

  burger.addEventListener("click", function () {
    var open = mobile.classList.toggle("open");
    burger.setAttribute("aria-expanded", open ? "true" : "false");
    burger.setAttribute("aria-label", open ? "Fechar menu" : "Abrir menu");
  });

  /* fechar o menu ao clicar em qualquer link */
  mobile.querySelectorAll("a").forEach(function (a) {
    a.addEventListener("click", function () {
      mobile.classList.remove("open");
      burger.setAttribute("aria-expanded", "false");
    });
  });

  /* reveal on scroll */
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (e) {
          if (e.isIntersecting) {
            e.target.classList.add("in");
            io.unobserve(e.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
    );
    document.querySelectorAll(".reveal").forEach(function (el) {
      io.observe(el);
    });
  } else {
    document.querySelectorAll(".reveal").forEach(function (el) {
      el.classList.add("in");
    });
  }

  /* ano no footer */
  var year = document.getElementById("year");
  if (year) year.textContent = new Date().getFullYear();

  /* tilt 3D no mockup do hero */
  var mock = document.querySelector(".hero-mock");
  var win = document.querySelector(".mock-window");
  var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (mock && win && !reduced && window.matchMedia("(pointer: fine)").matches) {
    /* no máximo um cálculo por quadro, mesmo com o mouse disparando dezenas de eventos */
    var tiltFrame = 0;
    mock.addEventListener("mousemove", function (e) {
      if (tiltFrame) return;
      tiltFrame = requestAnimationFrame(function () {
        tiltFrame = 0;
        var r = mock.getBoundingClientRect();
        var x = (e.clientX - r.left) / r.width - 0.5;
        var y = (e.clientY - r.top) / r.height - 0.5;
        win.style.transform =
          "rotateY(" + x * 4 + "deg) rotateX(" + -y * 4 + "deg) translate(-3px,-3px)";
      });
    });
    mock.addEventListener("mouseleave", function () {
      win.style.transform = "";
    });
  }
})();
