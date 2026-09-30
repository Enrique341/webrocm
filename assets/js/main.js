
"use strict";
(() => {
  const intro = document.getElementById("brand-intro");
  if (intro) {
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reducedMotion) intro.remove();
    else window.setTimeout(() => intro.remove(), 2700);
  }


  // Videos verticales: reproducción silenciosa cuando están visibles y pausa fuera de pantalla.
  const motionVideos = [...document.querySelectorAll("[data-motion-video]")];
  if (motionVideos.length) {
    const motionObserver = "IntersectionObserver" in window ? new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        const video = entry.target;
        if (entry.isIntersecting && document.visibilityState === "visible") {
          const playAttempt = video.play();
          if (playAttempt && typeof playAttempt.catch === "function") playAttempt.catch(() => {});
        } else {
          video.pause();
        }
      });
    }, { threshold: 0.2 }) : null;
    motionVideos.forEach((video) => {
      video.muted = true;
      video.defaultMuted = true;
      video.playsInline = true;
      if (motionObserver) motionObserver.observe(video);
      else { const playAttempt = video.play(); if (playAttempt?.catch) playAttempt.catch(() => {}); }
      video.addEventListener("error", () => { video.pause(); }, { once: true });
    });
    document.addEventListener("visibilitychange", () => {
      if (document.visibilityState === "hidden") motionVideos.forEach((video) => video.pause());
    });
  }

  // Al seguir un enlace a otra página, el documento nuevo vuelve a mostrar la entrada de marca.

  const WHATSAPP_NUMBER = "51939017959";
  const whatsappUrl = (product = "") => {
    const cleanProduct = String(product).replace(/[\u0000-\u001f\u007f]/g, "").slice(0, 120);
    const message = cleanProduct
      ? `Hola, Importadora de Repuestos La Roca. Quisiera consultar por ${cleanProduct}.`
      : "Hola, Importadora de Repuestos La Roca. Quisiera información sobre sus productos.";
    return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
  };

  // Fichas individuales: los datos viajan en la URL y se insertan con textContent.
  document.querySelectorAll("[data-product-card]").forEach((card) => {
    const info = card.querySelector(".product-info");
    const title = card.querySelector("h3")?.textContent?.trim();
    const description = card.querySelector(".product-info p")?.textContent?.trim() || "Consulta detalles y disponibilidad directamente con la tienda.";
    const image = card.querySelector(".product-image img")?.getAttribute("src") || "assets/img/ing.png";
    const category = card.dataset.category || "productos";
    if (!info || !title || info.querySelector(".detail-link")) return;
    const link = document.createElement("a");
    link.className = "btn detail-link";
    link.href = `producto.html?nombre=${encodeURIComponent(title)}&categoria=${encodeURIComponent(category)}&descripcion=${encodeURIComponent(description)}&imagen=${encodeURIComponent(image)}`;
    link.textContent = "Ver ficha del producto";
    const existingButton = info.querySelector("[data-whatsapp]");
    if (existingButton) {
      const actions = document.createElement("div");
      actions.className = "product-actions";
      info.insertBefore(actions, existingButton);
      actions.append(link, existingButton);
      existingButton.textContent = "Consultar por WhatsApp ";
    } else {
      info.append(link);
    }
  });

  const detailRoot = document.querySelector("[data-product-detail]");
  if (detailRoot) {
    const params = new URLSearchParams(window.location.search);
    const safe = (value, fallback, max = 180) => (value || "").replace(/[\u0000-\u001f\u007f<>]/g, "").trim().slice(0, max) || fallback;
    const name = safe(params.get("nombre"), "Producto La Roca");
    const categoryValue = safe(params.get("categoria"), "productos", 50);
    const description = safe(params.get("descripcion"), "Consulta con nuestro equipo para confirmar características y disponibilidad.", 350);
    const imageValue = params.get("imagen") || "assets/img/ing.png";
    const image = /^(assets\/img\/[a-zA-Z0-9._-]+)$/.test(imageValue) ? imageValue : "assets/img/ing.png";
    const setText = (selector, value) => { const el = detailRoot.querySelector(selector); if (el) el.textContent = value; };
    setText("[data-detail-name]", name);
    setText("[data-detail-category]", categoryValue.replace(/-/g, " "));
    setText("[data-detail-description]", description);
    setText("[data-detail-breadcrumb]", name);
    const img = detailRoot.querySelector("[data-detail-image]");
    if (img) { img.src = image; img.alt = name; }
    const consult = detailRoot.querySelector("[data-detail-whatsapp]");
    if (consult) consult.dataset.product = name;
    const specs = detailRoot.querySelector("[data-detail-specs]");
    const guidance = categoryValue === "motos"
      ? ["Consulta modelos y versiones disponibles.", "Solicita ficha técnica, garantía y condiciones de entrega.", "Confirma precio y stock antes de visitar la tienda."]
      : categoryValue === "repuestos"
      ? ["Comparte marca, modelo, año y cilindrada de tu moto.", "Envía una foto o código de la pieza si lo tienes.", "Verificaremos compatibilidad y disponibilidad contigo."]
      : ["Consulta marcas, medidas, tallas o presentaciones disponibles.", "Confirma compatibilidad con tu motocicleta.", "Precio y disponibilidad sujetos a confirmación de la tienda."];
    if (specs) guidance.forEach((line) => { const li = document.createElement("li"); li.textContent = line; specs.append(li); });
    document.title = `${name} | Importadora La Roca`;
  }

  document.querySelectorAll("[data-whatsapp]").forEach((el) => {
    el.addEventListener("click", (event) => {
      event.preventDefault();
      const url = whatsappUrl(el.dataset.product || "");
      const opened = window.open(url, "_blank", "noopener,noreferrer");
      if (!opened) window.location.href = url;
    });
  });

  const toggle = document.querySelector(".menu-toggle");
  const nav = document.querySelector(".nav-links");
  if (toggle && nav) {
    const closeMenu = () => {
      nav.classList.remove("open");
      toggle.setAttribute("aria-expanded", "false");
      toggle.textContent = "Menú";
    };
    toggle.addEventListener("click", () => {
      const isOpen = nav.classList.toggle("open");
      toggle.setAttribute("aria-expanded", String(isOpen));
      toggle.textContent = isOpen ? "Cerrar menú" : "Menú";
    });
    nav.querySelectorAll("a").forEach((link) => link.addEventListener("click", closeMenu));
    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") closeMenu();
    });
    document.addEventListener("click", (event) => {
      if (nav.classList.contains("open") && !nav.contains(event.target) && !toggle.contains(event.target)) closeMenu();
    });
  }

  const reveals = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -35px 0px" });
    reveals.forEach((el) => observer.observe(el));
  } else {
    reveals.forEach((el) => el.classList.add("visible"));
  }

  const backTop = document.querySelector(".back-top");
  const updateBackTop = () => backTop?.classList.toggle("show", window.scrollY > 450);
  window.addEventListener("scroll", updateBackTop, { passive: true });
  updateBackTop();
  backTop?.addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));

  const search = document.querySelector("#catalog-search");
  const category = document.querySelector("#catalog-category");
  const cards = [...document.querySelectorAll("[data-product-card]")];
  function filterCatalog() {
    if (!cards.length) return;
    const query = (search?.value || "").toLocaleLowerCase("es").trim();
    const selectedCategory = category?.value || "all";
    let count = 0;
    cards.forEach((card) => {
      const text = (card.dataset.search || card.textContent || "").toLocaleLowerCase("es");
      const visible = text.includes(query) && (selectedCategory === "all" || card.dataset.category === selectedCategory);
      card.hidden = !visible;
      if (visible) count += 1;
    });
    const counter = document.querySelector("#catalog-count");
    if (counter) counter.textContent = `${count} ${count === 1 ? "producto encontrado" : "productos encontrados"}`;
    const empty = document.querySelector("#catalog-empty");
    if (empty) empty.hidden = count !== 0;
  }
  search?.addEventListener("input", filterCatalog);
  category?.addEventListener("change", filterCatalog);
  filterCatalog();

  document.querySelectorAll("[data-year]").forEach((el) => {
    el.textContent = String(new Date().getFullYear());
  });

  // External links should not receive a reference to the originating page.
  document.querySelectorAll('a[target="_blank"]').forEach((link) => {
    link.rel = "noopener noreferrer";
  });
})();
