(function () {
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
    mock.addEventListener("mousemove", function (e) {
      var r = mock.getBoundingClientRect();
      var x = (e.clientX - r.left) / r.width - 0.5;
      var y = (e.clientY - r.top) / r.height - 0.5;
      win.style.transform =
        "rotateY(" + x * 4 + "deg) rotateX(" + -y * 4 + "deg) translate(-3px,-3px)";
    });
    mock.addEventListener("mouseleave", function () {
      win.style.transform = "";
    });
  }
})();
