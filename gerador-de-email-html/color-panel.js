/* ═══════════════════════════════════════════════
   SELETOR DE COR — no jeito de ferramentas para leigos (como o Canva)
   1. "Cores deste e-mail": as que já estão em uso, para repetir a mesma cor;
   2. "Do seu logo": as cores principais tiradas da imagem do logo;
   3. uma paleta pronta, de claras a escuras;
   4. "+": cor qualquer, com quadro de tom, barra de matiz, código e conta-gotas.
   Embaixo, um aviso quando o texto fica difícil de ler sobre o fundo.

   Uso: ColorPanel.mount(elemento, { value, onPick, mode, docColors, logos, against })
   mode "live": cada escolha já vale e o painel fica aberto (campos de cor);
   mode "apply": amostra aplica e fecha; a cor livre tem o botão Aplicar (cor do trecho).
   ═══════════════════════════════════════════════ */
(function () {
  var PALETTE = [
    ["#111111", "Preto"], ["#343a40", "Grafite"], ["#6c757d", "Cinza"], ["#ced4da", "Cinza claro"],
    ["#f1f3f5", "Gelo"], ["#ffffff", "Branco"], ["#f4f1ea", "Areia"], ["#fff8e1", "Creme"],
    ["#c92a2a", "Vermelho"], ["#e8590c", "Laranja"], ["#f59f00", "Amarelo"], ["#2b8a3e", "Verde"],
    ["#0b7285", "Azul-petróleo"], ["#1e5aa8", "Azul"], ["#5f3dc4", "Roxo"], ["#c2255c", "Rosa"],
    ["#862e3c", "Vinho"], ["#8a5a1c", "Caramelo"], ["#5c6b1e", "Verde-oliva"], ["#1b4332", "Verde-escuro"],
    ["#0f2c4c", "Azul-marinho"], ["#2b2d42", "Ardósia"], ["#3b0764", "Roxo-escuro"], ["#5c3d2e", "Marrom"],
    ["#ffe3e3", "Rosa claro"], ["#ffe8cc", "Pêssego"], ["#fff3bf", "Amarelo claro"], ["#d3f9d8", "Verde claro"],
    ["#c5f6fa", "Água"], ["#d0ebff", "Azul claro"], ["#e5dbff", "Lilás"], ["#f3d9fa", "Lavanda"],
  ];
  var NAMES = {};
  PALETTE.forEach(function (p) {
    NAMES[p[0]] = p[1];
  });

  /* ---------- contas de cor ---------- */
  function norm(hex) {
    hex = String(hex || "").trim().toLowerCase();
    if (/^#[0-9a-f]{3}$/.test(hex)) hex = "#" + hex[1] + hex[1] + hex[2] + hex[2] + hex[3] + hex[3];
    return /^#[0-9a-f]{6}$/.test(hex) ? hex : null;
  }
  function toRgb(hex) {
    return [1, 3, 5].map(function (i) {
      return parseInt(hex.slice(i, i + 2), 16);
    });
  }
  function toHex(r, g, b) {
    return "#" + [r, g, b].map(function (v) {
      return Math.round(Math.max(0, Math.min(255, v))).toString(16).padStart(2, "0");
    }).join("");
  }
  /** matiz 0–360, saturação e brilho 0–1 (o quadro de tom trabalha nesses três números) */
  function toHsv(hex) {
    var c = toRgb(hex).map(function (v) {
      return v / 255;
    });
    var max = Math.max(c[0], c[1], c[2]);
    var d = max - Math.min(c[0], c[1], c[2]);
    var h = d === 0 ? 0 : max === c[0] ? ((c[1] - c[2]) / d + 6) % 6 : max === c[1] ? (c[2] - c[0]) / d + 2 : (c[0] - c[1]) / d + 4;
    return { h: h * 60, s: max === 0 ? 0 : d / max, v: max };
  }
  function fromHsv(h, s, v) {
    function f(n) {
      var k = (n + h / 60) % 6;
      return (v - v * s * Math.max(0, Math.min(k, 4 - k, 1))) * 255;
    }
    return toHex(f(5), f(3), f(1));
  }
  function luminance(hex) {
    var c = toRgb(hex).map(function (v) {
      v /= 255;
      return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
    });
    return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
  }
  function contrast(a, b) {
    var l1 = luminance(a), l2 = luminance(b);
    return (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
  }

  /* ---------- cores do logo (lidas da imagem, quando o site dela deixa) ---------- */
  var logoCache = {};
  function logoColors(url) {
    if (logoCache[url]) return logoCache[url];
    logoCache[url] = new Promise(function (ok, fail) {
      var img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = function () {
        ok(img);
      };
      img.onerror = fail;
      img.src = url;
    }).then(function (img) {
      var side = 64;
      var canvas = document.createElement("canvas");
      canvas.width = canvas.height = side;
      var ctx = canvas.getContext("2d", { willReadFrequently: true });
      ctx.drawImage(img, 0, 0, side, side);
      var data = ctx.getImageData(0, 0, side, side).data; // logo de outro site sem permissão: erro → sem cores
      // agrupa em "baldes" de cores parecidas, guardando a média de cada um
      var buckets = {};
      var total = 0;
      for (var i = 0; i < data.length; i += 4) {
        var r = data[i], g = data[i + 1], b = data[i + 2];
        if (data[i + 3] < 200) continue;
        var hi = Math.max(r, g, b), lo = Math.min(r, g, b);
        if (lo > 225 || (hi - lo < 24 && hi > 110)) continue; // fundo branco e cinzas claros
        var key = ((r >> 5) << 6) | ((g >> 5) << 3) | (b >> 5);
        var k = buckets[key] || (buckets[key] = { n: 0, r: 0, g: 0, b: 0 });
        k.n++;
        k.r += r;
        k.g += g;
        k.b += b;
        total++;
      }
      var picked = [];
      Object.keys(buckets).map(function (k) {
        return buckets[k];
      }).sort(function (x, y) {
        return y.n - x.n;
      }).some(function (k) {
        // tons que aparecem pouco (a borda suavizada das letras) não são cor da marca
        if (k.n < Math.max(12, total * 0.06)) return true;
        var c = [k.r / k.n, k.g / k.n, k.b / k.n];
        var hsv = toHsv(toHex(c[0], c[1], c[2]));
        // pula a quase igual a uma já escolhida e a versão "lavada" dela (mesmo tom, mais apagado)
        var repeated = picked.some(function (e) {
          var other = toHsv(toHex(e[0], e[1], e[2]));
          var sameHue = Math.min(Math.abs(other.h - hsv.h), 360 - Math.abs(other.h - hsv.h)) < 18;
          return Math.hypot(e[0] - c[0], e[1] - c[1], e[2] - c[2]) < 60 || (sameHue && hsv.s < other.s);
        });
        if (!repeated) picked.push(c);
        return picked.length === 5;
      });
      return picked.map(function (c) {
        return toHex(c[0], c[1], c[2]);
      });
    });
    logoCache[url].catch(function () {});
    return logoCache[url];
  }

  /* ---------- montagem ---------- */
  function el(tag, cls, text) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text) e.textContent = text;
    return e;
  }

  function swatch(hex, name, current) {
    var b = el("button", "cp-swatch");
    b.type = "button";
    b.dataset.color = hex;
    b.style.background = hex;
    b.setAttribute("aria-label", name + " " + hex.toUpperCase());
    b.title = name + " · " + hex.toUpperCase();
    b.setAttribute("aria-pressed", hex === current ? "true" : "false");
    if (luminance(hex) > 0.8) b.classList.add("is-light");
    return b;
  }

  function group(title, colors, current) {
    var g = el("div", "cp-group");
    g.appendChild(el("p", "cp-label", title));
    var grid = el("div", "cp-grid");
    colors.forEach(function (c) {
      grid.appendChild(swatch(c[0], c[1], current));
    });
    g.appendChild(grid);
    return g;
  }

  /**
   * Monta o painel dentro de `root` (o conteúdo anterior é trocado).
   * opts: value, onPick(hex), mode "live"|"apply", docColors [hex], logos [url],
   *       against { hex, label, min } para o aviso de contraste.
   */
  function mount(root, opts) {
    var mode = opts.mode || "live";
    var current = norm(opts.value) || "#000000";
    var hsv = toHsv(current);
    root.innerHTML = "";
    root.classList.add("cp");

    var groups = el("div", "cp-groups");
    root.appendChild(groups);

    function inSwatches(hex) {
      return !!groups.querySelector('.cp-swatch[data-color="' + hex + '"]');
    }

    function renderGroups(logoHex) {
      groups.innerHTML = "";
      var seen = {};
      function fresh(list, name) {
        return list.filter(function (c) {
          if (!c || seen[c]) return false;
          seen[c] = 1;
          return true;
        }).map(function (c) {
          return [c, NAMES[c] || name];
        });
      }
      // "+" abre na frente das cores deste e-mail (como no Canva): 7 cores + o botão fecham uma linha
      var doc = fresh((opts.docColors || []).map(norm), "Cor do e-mail").slice(0, 7);
      var first = group("Cores deste e-mail", doc, current);
      groups.appendChild(first);
      var logo = fresh(logoHex || [], "Cor do logo");
      if (logo.length) groups.appendChild(group("Do seu logo", logo, current));
      groups.appendChild(group("Paleta", PALETTE, current));
      // "+": outra cor. Quando a atual não está em nenhuma amostra, é ela que aparece aqui, marcada.
      var plus = el("button", "cp-plus");
      plus.type = "button";
      plus.setAttribute("aria-expanded", custom.hidden ? "false" : "true");
      var grid = first.querySelector(".cp-grid");
      grid.insertBefore(plus, grid.firstChild);
      syncPlus();
    }

    function syncPlus() {
      var plus = groups.querySelector(".cp-plus");
      if (!plus) return;
      var listed = inSwatches(current);
      plus.classList.toggle("is-custom", !listed);
      plus.style.setProperty("--cp-current", current);
      plus.setAttribute("aria-label", listed ? "Outra cor" : "Outra cor " + current.toUpperCase() + ", escolhida. Ajustar");
      plus.title = "Outra cor";
    }

    /* cor livre: quadro (mais viva para a direita, mais escura para baixo), matiz, código */
    var custom = el("div", "cp-custom");
    custom.hidden = true;
    custom.innerHTML =
      '<div class="cp-square" role="slider" tabindex="0" aria-label="Tom: para a direita fica mais viva, para baixo mais escura" aria-valuemin="0" aria-valuemax="100"><span class="cp-knob"></span></div>' +
      '<input type="range" class="cp-hue" min="0" max="359" aria-label="Matiz: escolhe a cor de base">' +
      '<div class="cp-code"><span class="cp-chip" aria-hidden="true"></span>' +
      '<input type="text" class="cp-hex" maxlength="7" spellcheck="false" autocomplete="off" aria-label="Código da cor, por exemplo #1E5AA8">' +
      (window.EyeDropper ? '<button type="button" class="cp-drop" aria-label="Pegar uma cor da tela" title="Conta-gotas: pegar uma cor da tela"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M14.5 6.5l3 3M4 20l1.5-4.5L15 6l3 3-9.5 9.5z"/><path d="M14 3.5l6.5 6.5-1.8 1.8-6.5-6.5z"/></svg></button>' : "") +
      (mode === "apply" ? '<button type="button" class="cp-apply">Aplicar</button>' : "") +
      "</div>";
    root.appendChild(custom);

    var warn = el("p", "cp-warn");
    warn.setAttribute("role", "status");
    root.appendChild(warn);

    var square = custom.querySelector(".cp-square");
    var knob = custom.querySelector(".cp-knob");
    var hue = custom.querySelector(".cp-hue");
    var hexIn = custom.querySelector(".cp-hex");
    var chip = custom.querySelector(".cp-chip");

    function paintCustom() {
      square.style.background = "linear-gradient(to top, #000, transparent), linear-gradient(to right, #fff, hsl(" + hsv.h + " 100% 50%))";
      knob.style.left = hsv.s * 100 + "%";
      knob.style.top = (1 - hsv.v) * 100 + "%";
      knob.style.background = current;
      square.setAttribute("aria-valuenow", Math.round(hsv.s * 100));
      square.setAttribute("aria-valuetext", "intensidade " + Math.round(hsv.s * 100) + "%, brilho " + Math.round(hsv.v * 100) + "%");
      hue.value = Math.round(hsv.h);
      chip.style.background = current;
      if (document.activeElement !== hexIn) hexIn.value = current.toUpperCase();
    }

    function paintWarn() {
      var a = opts.against;
      var ratio = a && norm(a.hex) ? contrast(current, norm(a.hex)) : 99;
      var low = ratio < (a && a.min ? a.min : 4.5);
      warn.hidden = !low;
      if (low) warn.textContent = "Contraste baixo com " + a.label + " (" + ratio.toFixed(1).replace(".", ",") + ":1): fica difícil de ler. Teste um tom mais escuro ou mais claro.";
    }

    function select(hex, fromCustom) {
      current = hex;
      if (!fromCustom) {
        var keepHue = hsv.h;
        hsv = toHsv(hex);
        if (hsv.s === 0) hsv.h = keepHue; // cinza/preto não têm matiz: a barra não pula para o vermelho
      }
      each(groups.querySelectorAll(".cp-swatch"), function (b) {
        b.setAttribute("aria-pressed", b.dataset.color === hex ? "true" : "false");
      });
      syncPlus();
      paintCustom();
      paintWarn();
    }

    function each(list, fn) {
      Array.prototype.forEach.call(list, fn);
    }

    function pickCustom() {
      var hex = fromHsv(hsv.h, hsv.s, hsv.v);
      select(hex, true);
      if (mode === "live") opts.onPick(hex);
    }

    function fromPointer(e) {
      var r = square.getBoundingClientRect();
      hsv.s = Math.min(1, Math.max(0, (e.clientX - r.left) / r.width));
      hsv.v = 1 - Math.min(1, Math.max(0, (e.clientY - r.top) / r.height));
      pickCustom();
    }

    // não tira o foco/seleção do editor de texto ao clicar nas amostras e no quadro
    root.addEventListener("mousedown", function (e) {
      if (!e.target.closest("input")) e.preventDefault();
    });

    root.addEventListener("click", function (e) {
      var sw = e.target.closest(".cp-swatch");
      if (sw) {
        select(sw.dataset.color);
        opts.onPick(sw.dataset.color);
        return;
      }
      if (e.target.closest(".cp-plus")) {
        custom.hidden = !custom.hidden;
        e.target.closest(".cp-plus").setAttribute("aria-expanded", custom.hidden ? "false" : "true");
        if (!custom.hidden) {
          paintCustom();
          square.focus();
        }
        if (opts.onResize) opts.onResize();
        return;
      }
      if (e.target.closest(".cp-apply")) {
        var v = norm(hexIn.value);
        if (!v) return hexIn.setAttribute("aria-invalid", "true");
        opts.onPick(v);
        return;
      }
      if (e.target.closest(".cp-drop")) {
        new window.EyeDropper().open().then(function (res) {
          var v = norm(res.sRGBHex);
          if (!v) return;
          select(v);
          if (mode === "live") opts.onPick(v);
        }, function () {});
      }
    });

    square.addEventListener("pointerdown", function (e) {
      square.setPointerCapture(e.pointerId);
      fromPointer(e);
    });
    square.addEventListener("pointermove", function (e) {
      if (e.buttons === 1) fromPointer(e);
    });
    square.addEventListener("keydown", function (e) {
      var step = e.shiftKey ? 0.1 : 0.02;
      var mv = { ArrowLeft: [-step, 0], ArrowRight: [step, 0], ArrowUp: [0, step], ArrowDown: [0, -step] }[e.key];
      if (!mv) return;
      e.preventDefault();
      hsv.s = Math.min(1, Math.max(0, hsv.s + mv[0]));
      hsv.v = Math.min(1, Math.max(0, hsv.v + mv[1]));
      pickCustom();
    });
    hue.addEventListener("input", function () {
      hsv.h = Number(hue.value);
      if (!hsv.s) hsv.s = 0.6; // num cinza a matiz não aparece: dá cor ao mexer na barra
      if (!hsv.v) hsv.v = 0.6;
      pickCustom();
    });
    hexIn.addEventListener("input", function () {
      var t = hexIn.value.trim();
      var v = norm(t.charAt(0) === "#" ? t : "#" + t);
      hexIn.toggleAttribute("aria-invalid", !v && t.length >= 6);
      if (v && v.length === 7 && t.replace("#", "").length === 6) {
        select(v);
        if (mode === "live") opts.onPick(v);
      }
    });
    hexIn.addEventListener("keydown", function (e) {
      if (e.key === "Enter") {
        e.preventDefault();
        var v = norm(hexIn.value.charAt(0) === "#" ? hexIn.value : "#" + hexIn.value);
        if (v) opts.onPick(v);
      }
    });
    hexIn.addEventListener("blur", function () {
      hexIn.value = current.toUpperCase();
      hexIn.removeAttribute("aria-invalid");
    });

    renderGroups([]);
    // cor fora das amostras: já abre a cor livre
    if (!inSwatches(current) && mode === "live") {
      custom.hidden = false;
      groups.querySelector(".cp-plus").setAttribute("aria-expanded", "true");
    }
    paintCustom();
    paintWarn();

    // cores do logo chegam depois (a imagem precisa carregar)
    var logos = (opts.logos || []).filter(Boolean);
    Promise.all(logos.map(function (u) {
      return logoColors(u).catch(function () {
        return [];
      });
    })).then(function (lists) {
      var all = [].concat.apply([], lists);
      if (!all.length || !root.isConnected) return;
      var focused = document.activeElement && root.contains(document.activeElement) ? document.activeElement.dataset.color : null;
      renderGroups(all);
      if (focused) {
        var again = groups.querySelector('.cp-swatch[data-color="' + focused + '"]');
        if (again) again.focus();
      }
      if (opts.onResize) opts.onResize();
    });

    return {
      focus: function () {
        var on = groups.querySelector('.cp-swatch[aria-pressed="true"]') || groups.querySelector(".cp-swatch");
        (custom.hidden ? on : square).focus();
      },
    };
  }

  window.ColorPanel = { mount: mount, contrast: contrast, norm: norm };
})();
