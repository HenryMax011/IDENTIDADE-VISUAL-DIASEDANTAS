const webhookUrl = "COLOQUE_Sua_URL_AQUI";
const whatsappNumber = "NUMERO_AQUI";

function whatsappDigits() {
  return String(whatsappNumber).replace(/\D/g, "");
}

const form = document.getElementById("leadForm");
const submitBtn = document.getElementById("submitBtn");
const formStatus = document.getElementById("formStatus");

function sanitize(value) {
  return String(value || "").trim().replace(/\s+/g, " ");
}

function setStatus(message, type) {
  if (!formStatus) return;
  formStatus.textContent = message;
  formStatus.className = `form-status${type ? ` ${type}` : ""}`;
}

if (form && submitBtn) {
  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const nome = sanitize(document.getElementById("nome")?.value);
    const telefone = sanitize(document.getElementById("telefone")?.value);
    const email = sanitize(document.getElementById("email")?.value);
    const empresa = sanitize(document.getElementById("empresa")?.value);
    const faturamento = sanitize(document.getElementById("faturamento")?.value);

    if (!nome || !telefone || !email) {
      setStatus("Preencha nome, e-mail e telefone para continuarmos.", "error");
      return;
    }

    const payload = {
      nome,
      telefone,
      email,
      empresa: empresa || undefined,
      faturamento: faturamento || undefined,
      origem: "landing-page-dias-dantas",
    };

    submitBtn.disabled = true;
    submitBtn.classList.add("is-loading");
    setStatus("Enviando seus dados de forma segura...", "");

    try {
      const response = await fetch(webhookUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`Erro no webhook: ${response.status}`);
      }

      setStatus("Tudo certo! Redirecionando para o WhatsApp...", "success");

      const extra = [empresa && `Empresa: ${empresa}`, faturamento && `Faturamento: ${faturamento}`]
        .filter(Boolean)
        .join("\n");

      const waText = encodeURIComponent(
        `Olá, equipe Dias&Dantas! Sou ${nome} e quero entender o melhor caminho para regularizar meu negócio.\n\nE-mail: ${email}\nTelefone: ${telefone}${extra ? `\n${extra}` : ""}`
      );
      const n = whatsappDigits();
      const waUrl = n.length >= 10 ? `https://wa.me/${n}?text=${waText}` : "#contato";

      setTimeout(() => {
        window.location.href = waUrl;
      }, 800);
    } catch (error) {
      setStatus("Não foi possível enviar agora. Tente novamente ou fale direto no WhatsApp.", "error");
      submitBtn.disabled = false;
      submitBtn.classList.remove("is-loading");
      console.error(error);
    }
  });
}

const navToggle = document.getElementById("navToggle");
const navPanel = document.getElementById("siteMenu");

function closeNav() {
  if (!navPanel || !navToggle) return;
  navPanel.classList.remove("is-open");
  navToggle.setAttribute("aria-expanded", "false");
}

if (navToggle && navPanel) {
  navToggle.addEventListener("click", () => {
    const open = !navPanel.classList.contains("is-open");
    navPanel.classList.toggle("is-open", open);
    navToggle.setAttribute("aria-expanded", String(open));
  });

  navPanel.querySelectorAll("a").forEach((a) => {
    a.addEventListener("click", () => closeNav());
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeNav();
  });
}

const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

function initReveal() {
  if (reduceMotion) {
    document.querySelectorAll("[data-reveal]").forEach((el) => el.classList.add("is-visible"));
    return;
  }

  document.querySelectorAll("[data-reveal]").forEach((el) => {
    const d = el.getAttribute("data-reveal-delay");
    if (d) el.style.setProperty("--reveal-delay", `${Number(d) * 0.12}s`);
  });

  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          io.unobserve(entry.target);
        }
      });
    },
    { rootMargin: "0px 0px -8% 0px", threshold: 0.12 }
  );

  document.querySelectorAll("[data-reveal]").forEach((el) => io.observe(el));
}

function formatCounterValue(el, value) {
  const format = el.dataset.format;
  const decimals = Number(el.dataset.decimals ?? 0);
  const prefix = el.dataset.prefix ?? "";
  const suffix = el.dataset.suffix ?? "";

  if (format === "currency-full") {
    const brl = value.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
    return `${brl}${suffix}`;
  }

  const hasDecimals = String(el.dataset.target).includes(".") || decimals > 0;
  const num = hasDecimals
    ? value.toLocaleString("pt-BR", {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
      })
    : Math.round(value).toLocaleString("pt-BR");

  return `${prefix}${num}${suffix}`;
}

function animateCounter(el) {
  if (el.dataset.animated === "1") return;
  el.dataset.animated = "1";

  const target = Number(el.dataset.target);
  if (Number.isNaN(target)) return;

  const duration = 1400;
  const start = performance.now();

  const tick = (now) => {
    const t = Math.min(1, (now - start) / duration);
    const eased = 1 - (1 - t) ** 3;
    const current = target * eased;
    el.textContent = formatCounterValue(el, current);
    if (t < 1) requestAnimationFrame(tick);
    else el.textContent = formatCounterValue(el, target);
  };

  requestAnimationFrame(tick);
}

function initCounters() {
  const els = document.querySelectorAll("[data-counter]");
  if (!els.length) return;

  if (reduceMotion) {
    els.forEach((el) => {
      const target = Number(el.dataset.target);
      if (!Number.isNaN(target)) el.textContent = formatCounterValue(el, target);
    });
    return;
  }

  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          animateCounter(entry.target);
          io.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.35 }
  );

  els.forEach((el) => io.observe(el));
}

function initSlider() {
  const slides = Array.from(document.querySelectorAll(".chat-slide"));
  const prev = document.querySelector("[data-slider-prev]");
  const next = document.querySelector("[data-slider-next]");
  const dotsRoot = document.getElementById("sliderDots");
  if (!slides.length || !prev || !next || !dotsRoot) return;

  let index = 0;

  const dots = slides.map((_, i) => {
    const b = document.createElement("button");
    b.type = "button";
    b.className = "slider-dot";
    b.setAttribute("aria-label", `Depoimento ${i + 1}`);
    b.addEventListener("click", () => go(i));
    dotsRoot.appendChild(b);
    return b;
  });

  function render() {
    slides.forEach((s, i) => s.classList.toggle("is-active", i === index));
    dots.forEach((d, i) => d.setAttribute("aria-current", i === index ? "true" : "false"));
  }

  function go(i) {
    index = (i + slides.length) % slides.length;
    render();
  }

  prev.addEventListener("click", () => go(index - 1));
  next.addEventListener("click", () => go(index + 1));

  let timer = window.setInterval(() => go(index + 1), 6500);
  const root = document.querySelector(".phone-slider");
  root?.addEventListener("mouseenter", () => {
    window.clearInterval(timer);
  });
  root?.addEventListener("mouseleave", () => {
    timer = window.setInterval(() => go(index + 1), 6500);
  });

  render();
}

function initAccordion() {
  const root = document.getElementById("valueAccordion");
  if (!root) return;

  const items = Array.from(root.querySelectorAll(".accordion__item"));

  function setOpen(target) {
    items.forEach((item) => {
      const btn = item.querySelector(".accordion__trigger");
      const panel = item.querySelector(".accordion__panel");
      const open = item === target;
      item.classList.toggle("is-open", open);
      btn?.setAttribute("aria-expanded", String(open));
      if (panel) {
        if (open) panel.removeAttribute("hidden");
        else panel.setAttribute("hidden", "");
      }
    });
  }

  items.forEach((item) => {
    const btn = item.querySelector(".accordion__trigger");
    btn?.addEventListener("click", () => {
      const willOpen = !item.classList.contains("is-open");
      if (willOpen) setOpen(item);
      else {
        item.classList.remove("is-open");
        btn.setAttribute("aria-expanded", "false");
        item.querySelector(".accordion__panel")?.setAttribute("hidden", "");
      }
    });
  });

  setOpen(items.find((i) => i.classList.contains("is-open")) || items[0]);
}

function initTilt() {
  if (reduceMotion) return;

  document.querySelectorAll("[data-tilt]").forEach((card) => {
    card.addEventListener("pointermove", (e) => {
      const r = card.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width - 0.5;
      const py = (e.clientY - r.top) / r.height - 0.5;
      const rx = (-py * 10).toFixed(2);
      const ry = (px * 12).toFixed(2);
      card.style.transform = `perspective(900px) rotateX(${rx}deg) rotateY(${ry}deg) translateZ(0)`;
    });

    card.addEventListener("pointerleave", () => {
      card.style.transform = "";
    });
  });
}

function initHeroParallax() {
  const art = document.getElementById("heroArt");
  const zone = document.querySelector(".hero");
  if (!art || !zone || reduceMotion) return;

  zone.addEventListener("pointermove", (e) => {
    const r = zone.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - 0.5;
    const y = (e.clientY - r.top) / r.height - 0.5;
    art.style.transform = `translate3d(${x * 18}px, ${y * 14}px, 0) rotateX(${-y * 6}deg) rotateY(${x * 8}deg)`;
  });

  zone.addEventListener("pointerleave", () => {
    art.style.transform = "";
  });
}

function initScrollScene() {
  const sections = document.querySelectorAll("[data-scroll-scene]");
  const progressBar = document.getElementById("scrollProgressBar");
  const globe = document.getElementById("scrollGlobe");
  const links = document.querySelectorAll("[data-scroll-nav]");
  if (!sections.length || !progressBar) return;

  const globePositions = [
    { x: 80, y: 48, s: 1.06, o: 0.22 },
    { x: 72, y: 54, s: 0.98, o: 0.15 },
    { x: 58, y: 32, s: 0.88, o: 0.18 },
    { x: 82, y: 26, s: 1.18, o: 0.2 },
    { x: 50, y: 52, s: 1.28, o: 0.14 },
    { x: 76, y: 42, s: 1.02, o: 0.17 },
    { x: 44, y: 34, s: 1.08, o: 0.15 },
  ];

  let ticking = false;

  function update() {
    const doc = document.documentElement.scrollHeight - window.innerHeight;
    const p = doc > 0 ? Math.min(Math.max(window.scrollY / doc, 0), 1) : 0;
    progressBar.style.setProperty("--scroll-p", String(p));

    const mid = window.innerHeight * 0.5;
    let best = 0;
    let bestDist = Infinity;
    sections.forEach((sec, i) => {
      const r = sec.getBoundingClientRect();
      const c = r.top + r.height * 0.5;
      const d = Math.abs(c - mid);
      if (d < bestDist) {
        bestDist = d;
        best = i;
      }
    });

    links.forEach((a, i) => {
      const on = i === best;
      a.classList.toggle("is-active", on);
      if (on) a.setAttribute("aria-current", "true");
      else a.removeAttribute("aria-current");
    });

    if (globe) {
      const pos = globePositions[best] ?? globePositions[0];
      if (reduceMotion) {
        globe.style.opacity = "0.09";
        globe.style.transform = "translate3d(78vw, 46vh, 0) scale3d(1, 1, 1)";
      } else {
        globe.style.opacity = String(pos.o);
        globe.style.transform = `translate3d(${pos.x}vw, ${pos.y}vh, 0) scale3d(${pos.s}, ${pos.s}, 1)`;
      }
    }

    ticking = false;
  }

  function onScroll() {
    if (!ticking) {
      ticking = true;
      requestAnimationFrame(update);
    }
  }

  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onScroll, { passive: true });
  update();
}

initReveal();
initCounters();
initSlider();
initAccordion();
initTilt();
initHeroParallax();
initScrollScene();
