
(function () {
  "use strict";

  const PRODUCTS = [
    { id: "veg-carrots", name: "Carrots (1 lb)", category: "Vegetables", price: 1.99, organic: false, containsWheat: false, tags: ["vegetarian"] },
    { id: "veg-carrots-org", name: "Carrots (1 lb) — Organic", category: "Vegetables", price: 3.29, organic: true, containsWheat: false, tags: ["vegetarian"] },
    { id: "veg-broccoli", name: "Broccoli", category: "Vegetables", price: 2.49, organic: false, containsWheat: false, tags: ["vegetarian"] },
    { id: "veg-spinach-org", name: "Spinach — Organic", category: "Vegetables", price: 3.99, organic: true, containsWheat: false, tags: ["vegetarian"] },
    { id: "fruit-apples", name: "Apples (3)", category: "Fruits", price: 2.50, organic: false, containsWheat: false, tags: ["vegetarian"] },
    { id: "fruit-apples-org", name: "Apples (3) — Organic", category: "Fruits", price: 3.80, organic: true, containsWheat: false, tags: ["vegetarian"] },
    { id: "fruit-bananas", name: "Bananas (5)", category: "Fruits", price: 1.75, organic: false, containsWheat: false, tags: ["vegetarian"] },
    { id: "fruit-berries", name: "Mixed berries", category: "Fruits", price: 4.25, organic: false, containsWheat: false, tags: ["vegetarian"] },
    { id: "dairy-milk", name: "Milk (2L)", category: "Dairy & Alternatives", price: 4.49, organic: false, containsWheat: false, tags: ["vegetarian"] },
    { id: "dairy-milk-org", name: "Milk (2L) — Organic", category: "Dairy & Alternatives", price: 6.49, organic: true, containsWheat: false, tags: ["vegetarian"] },
    { id: "dairy-yogurt", name: "Plain yogurt", category: "Dairy & Alternatives", price: 3.25, organic: false, containsWheat: false, tags: ["vegetarian"] },
    { id: "dairy-oat", name: "Oat drink", category: "Dairy & Alternatives", price: 3.79, organic: false, containsWheat: true, tags: ["vegetarian"] },
    { id: "pantry-rice", name: "Rice (1 kg)", category: "Pantry", price: 3.99, organic: false, containsWheat: false, tags: ["vegetarian"] },
    { id: "pantry-pasta", name: "Pasta", category: "Pantry", price: 2.29, organic: false, containsWheat: true, tags: ["vegetarian"] },
    { id: "pantry-bread", name: "Sandwich bread", category: "Pantry", price: 2.99, organic: false, containsWheat: true, tags: ["vegetarian"] },
    { id: "pantry-beans", name: "Canned beans", category: "Pantry", price: 1.39, organic: false, containsWheat: false, tags: ["vegetarian"] },
    { id: "snack-chips", name: "Potato chips", category: "Snacks", price: 2.99, organic: false, containsWheat: false, tags: ["vegetarian"] },
    { id: "snack-granola", name: "Granola bars", category: "Snacks", price: 4.99, organic: false, containsWheat: true, tags: ["vegetarian"] },
    { id: "snack-nuts", name: "Mixed nuts", category: "Snacks", price: 5.49, organic: false, containsWheat: false, tags: ["vegetarian"] },
    { id: "meat-chicken", name: "Chicken breast", category: "Meat & Fish", price: 9.49, organic: false, containsWheat: false, tags: ["meat"] },
    { id: "fish-salmon", name: "Salmon fillet", category: "Meat & Fish", price: 12.99, organic: false, containsWheat: false, tags: ["fish"] },
    { id: "drink-oj", name: "Orange juice", category: "Drinks", price: 3.49, organic: false, containsWheat: false, tags: ["vegetarian"] },
    { id: "drink-coffee", name: "Coffee", category: "Drinks", price: 8.99, organic: false, containsWheat: false, tags: ["vegetarian"] },
  ];

  const STORAGE_KEY = "lab3_freshcart_bootstrap_state_v1";

  const defaultState = () => ({
    step: "prefs",
    prefs: {
      vegetarian: false,
      noWheat: false,
      preferOrganic: false,
      organicLimit: 1.5,
      sortMode: "price",
      search: "",
      showPictures: true,
    },
    cart: {}, // id -> qty
    fontScale: 1,
    highContrast: false,
  });

  function loadState() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return defaultState();
      const parsed = JSON.parse(raw);
      return { ...defaultState(), ...parsed, prefs: { ...defaultState().prefs, ...(parsed.prefs || {}) } };
    } catch {
      return defaultState();
    }
  }

  function saveState() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }

  let state = loadState();

  const $ = (sel) => document.querySelector(sel);
  const $$ = (sel) => Array.from(document.querySelectorAll(sel));

  function money(n) {
    return `$${n.toFixed(2)}`;
  }

  function clampInt(n, min, max) {
    const x = Number.parseInt(String(n), 10);
    if (Number.isNaN(x)) return min;
    return Math.max(min, Math.min(max, x));
  }

  function groupByCategory(items) {
    const map = new Map();
    for (const it of items) {
      if (!map.has(it.category)) map.set(it.category, []);
      map.get(it.category).push(it);
    }
    return map;
  }

  function svgDataUri(label) {
    const safe = label.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
    const svg = `
      <svg xmlns="http://www.w3.org/2000/svg" width="180" height="180">
        <defs>
          <linearGradient id="g" x1="0" x2="1" y1="0" y2="1">
            <stop offset="0" stop-color="#0dcaf0" stop-opacity="0.35"/>
            <stop offset="1" stop-color="#198754" stop-opacity="0.25"/>
          </linearGradient>
        </defs>
        <rect width="100%" height="100%" rx="22" fill="url(#g)"/>
        <rect x="12" y="12" width="156" height="156" rx="18" fill="rgba(0,0,0,0.18)" stroke="rgba(255,255,255,0.25)"/>
        <text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle"
          fill="white" font-family="system-ui,Segoe UI,Roboto,Arial" font-weight="800" font-size="18">
          ${safe}
        </text>
      </svg>
    `.trim();
    return "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svg);
  }

  function applyOrganicPreference(items, preferOrganic, limit) {
    if (!preferOrganic) return items;

    const byBase = new Map();
    for (const it of items) {
      const base = it.name.replace(/\s+—\s+Organic\s*$/i, "").trim();
      if (!byBase.has(base)) byBase.set(base, []);
      byBase.get(base).push(it);
    }

    const chosen = [];
    for (const options of byBase.values()) {
      if (options.length === 1) {
        chosen.push(options[0]);
        continue;
      }
      const organic = options.find(o => o.organic);
      const regular = options.find(o => !o.organic);
      if (!organic || !regular) {
        chosen.push(...options);
        continue;
      }
      const diff = organic.price - regular.price;
      chosen.push(diff <= limit ? organic : regular);
    }
    return chosen;
  }

  function passesDietFilters(item, prefs) {
    if (prefs.vegetarian) {
      if (item.tags.includes("meat") || item.tags.includes("fish")) return false;
      if (item.category === "Meat & Fish") return false;
    }
    if (prefs.noWheat) {
      if (item.containsWheat) return false;
    }
    return true;
  }

  function getVisibleProducts() {
    const prefs = state.prefs;
    let items = PRODUCTS.filter(p => passesDietFilters(p, prefs));
    items = applyOrganicPreference(items, prefs.preferOrganic, prefs.organicLimit);

    const q = (prefs.search || "").trim().toLowerCase();
    if (q) items = items.filter(p => p.name.toLowerCase().includes(q));

    if (prefs.sortMode === "name") items.sort((a, b) => a.name.localeCompare(b.name));
    else items.sort((a, b) => a.price - b.price || a.name.localeCompare(b.name));

    return items;
  }

  function cartCount() {
    return Object.values(state.cart).reduce((a, b) => a + b, 0);
  }

  function cartTotal() {
    let total = 0;
    for (const [id, qty] of Object.entries(state.cart)) {
      const p = PRODUCTS.find(x => x.id === id);
      if (!p) continue;
      total += p.price * qty;
    }
    return total;
  }

  function setToast(msg) {
    const toastEl = $("#toast");
    const body = $("#toastBody");
    body.textContent = msg;
    toastEl.hidden = false;

    if (window.bootstrap && bootstrap.Toast) {
      const t = bootstrap.Toast.getOrCreateInstance(toastEl, { delay: 1600 });
      t.show();
    } else {
      clearTimeout(setToast._t);
      setToast._t = setTimeout(() => { toastEl.hidden = true; }, 1600);
    }
  }

  function setStep(step) {
    state.step = step;
    saveState();

    $("#step-prefs").hidden = step !== "prefs";
    $("#step-browse").hidden = step !== "browse";
    $("#step-cart").hidden = step !== "cart";

    $$("#breadcrumb .crumbs__step").forEach(btn => {
      btn.classList.remove("fw-semibold");
      btn.setAttribute("aria-current", "false");
      if (btn.dataset.step === step) {
        btn.classList.add("fw-semibold");
        btn.setAttribute("aria-current", "step");
      }
    });

    if (step === "browse") renderBrowse();
    if (step === "cart") renderCart();
  }

  function renderPrefsPill() {
    const p = state.prefs;
    const parts = [];
    if (p.vegetarian) parts.push("Vegetarian");
    if (p.noWheat) parts.push("Avoid wheat");
    if (p.preferOrganic) parts.push(`Prefer organic (≤ ${money(p.organicLimit)} diff)`);
    if (!parts.length) parts.push("No dietary filters");
    parts.push(`Sort: ${p.sortMode === "price" ? "Price" : "Name"}`);
    if (p.search.trim()) parts.push(`Search: “${p.search.trim()}”`);
    $("#activePrefsPill").textContent = parts.join(" • ");
  }

  function shortLabel(name) {
    const n = name.replace(/\s+\(.*?\)\s*/g, " ").replace(/\s+—\s+Organic\s*$/i, "");
    return n.trim().split(/\s+/).slice(0, 2).join(" ");
  }

  function productCard(p) {
    const showPic = !!state.prefs.showPictures;

    const col = document.createElement("div");
    col.className = "col-12 col-md-6 col-xl-4";

    const card = document.createElement("div");
    card.className = "card bg-dark bg-opacity-25 border-light border-opacity-10 h-100";

    const body = document.createElement("div");
    body.className = "card-body d-flex gap-3";

    if (showPic) {
      const img = document.createElement("img");
      img.alt = `Picture for ${p.name}`;
      img.width = 84;
      img.height = 84;
      img.loading = "lazy";
      img.className = "rounded-3 border border-light border-opacity-10 flex-shrink-0";


      const exts = ["jpeg", "jpg", "png", "webp"];
      const idBase = p.id;
      const labelBase = shortLabel(p.name).toLowerCase().replace(/\s+/g, "-").replace(/[^\w-]/g, "");
      const candidates = [];
      exts.forEach(e => candidates.push(`images/${idBase}.${e}`));
      exts.forEach(e => candidates.push(`images/${labelBase}.${e}`));

      let tryIndex = 0;
      const tryNext = () => {
        if (tryIndex >= candidates.length) {
          img.src = svgDataUri(shortLabel(p.name));
          return;
        }
        img.src = candidates[tryIndex++];
      };

      img.addEventListener("error", tryNext);
      tryNext();

      body.appendChild(img);
    }

    const meta = document.createElement("div");
    meta.className = "flex-grow-1";

    const title = document.createElement("div");
    title.className = "fw-bold";
    title.textContent = p.name;

    const badges = document.createElement("div");
    badges.className = "d-flex flex-wrap gap-1 mt-2";
    badges.innerHTML = `
      <span class="badge text-bg-secondary">${p.organic ? "Organic" : "Standard"}</span>
      ${p.containsWheat ? '<span class="badge text-bg-warning text-dark">Contains wheat</span>' : ""}
      ${p.tags.includes("vegetarian") ? '<span class="badge text-bg-success">Vegetarian-friendly</span>' : ""}
    `;

    const row = document.createElement("div");
    row.className = "d-flex justify-content-between align-items-center mt-3";

    const price = document.createElement("div");
    price.className = "fw-bold";
    price.textContent = money(p.price);

    const btn = document.createElement("button");
    btn.className = "btn btn-info text-dark fw-semibold btn-sm";
    btn.type = "button";
    btn.textContent = "Add";
    btn.addEventListener("click", () => {
      state.cart[p.id] = (state.cart[p.id] || 0) + 1;
      saveState();
      $("#cartCountTop").textContent = String(cartCount());
      setToast(`Added: ${p.name}`);
    });

    row.appendChild(price);
    row.appendChild(btn);

    meta.appendChild(title);
    meta.appendChild(badges);
    meta.appendChild(row);

    body.appendChild(meta);
    card.appendChild(body);
    col.appendChild(card);
    return col;
  }

  function renderBrowse() {
    renderPrefsPill();
    $("#cartCountTop").textContent = String(cartCount());

    const items = getVisibleProducts();
    const grouped = groupByCategory(items);

    const container = $("#categoryAccordion");
    container.innerHTML = "";

    const preferredOrder = ["Vegetables", "Fruits", "Dairy & Alternatives", "Pantry", "Snacks", "Drinks", "Meat & Fish"];
    const categories = Array.from(grouped.keys()).sort((a, b) => {
      const ia = preferredOrder.indexOf(a);
      const ib = preferredOrder.indexOf(b);
      return (ia === -1 ? 999 : ia) - (ib === -1 ? 999 : ib) || a.localeCompare(b);
    });

    if (categories.length === 0) {
      container.innerHTML = `
        <div class="alert alert-dark border border-light border-opacity-10 mt-3">
          <strong>No items match your current preferences.</strong>
          <div class="text-muted">Try turning off a preference or clearing the search.</div>
        </div>
      `;
      return;
    }

    categories.forEach((cat, i) => {
      const catItems = grouped.get(cat) || [];
      const headingId = `accHeading_${i}`;
      const collapseId = `accCollapse_${i}`;

      const item = document.createElement("div");
      item.className = "accordion-item bg-transparent border-0";

      item.innerHTML = `
        <h2 class="accordion-header" id="${headingId}">
          <button class="accordion-button collapsed bg-dark bg-opacity-25 text-light border border-light border-opacity-10 rounded-3"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#${collapseId}"
            aria-expanded="false"
            aria-controls="${collapseId}">
            <div class="d-flex w-100 justify-content-between align-items-center">
              <span class="fw-semibold">${escapeHtml(cat)}</span>
              <span class="badge text-bg-dark border border-light border-opacity-10 ms-2">${catItems.length} item${catItems.length === 1 ? "" : "s"}</span>
            </div>
          </button>
        </h2>
        <div id="${collapseId}" class="accordion-collapse collapse" aria-labelledby="${headingId}" data-bs-parent="#categoryAccordion">
          <div class="accordion-body px-0">
            <div class="row g-2" id="grid_${i}"></div>
          </div>
        </div>
      `;

      container.appendChild(item);

      const grid = document.getElementById(`grid_${i}`);
      catItems.forEach(p => grid.appendChild(productCard(p)));
    });
  }

  function renderCart() {
    $("#summaryItems").textContent = String(cartCount());
    $("#summaryTotal").textContent = money(cartTotal());

    const empty = cartCount() === 0;
    $("#cartEmpty").hidden = !empty;
    $("#cartTableWrap").hidden = empty;

    const tbody = $("#cartTbody");
    tbody.innerHTML = "";
    if (empty) return;

    const rows = Object.entries(state.cart)
      .map(([id, qty]) => ({ id, qty, p: PRODUCTS.find(x => x.id === id) }))
      .filter(x => !!x.p)
      .sort((a, b) => (a.p.category.localeCompare(b.p.category)) || a.p.name.localeCompare(b.p.name));

    for (const row of rows) {
      const tr = document.createElement("tr");

      const tdItem = document.createElement("td");
      tdItem.innerHTML = `<div class="fw-semibold">${escapeHtml(row.p.name)}</div><div class="text-muted small">${escapeHtml(row.p.category)}</div>`;

      const tdPrice = document.createElement("td");
      tdPrice.className = "text-end";
      tdPrice.textContent = money(row.p.price);

      const tdQty = document.createElement("td");
      tdQty.className = "text-center";
      tdQty.appendChild(qtyControl(row.id, row.qty));

      const tdSub = document.createElement("td");
      tdSub.className = "text-end";
      tdSub.textContent = money(row.p.price * row.qty);

      const tdRemove = document.createElement("td");
      tdRemove.className = "text-center";
      const rm = document.createElement("button");
      rm.className = "btn btn-outline-light btn-sm";
      rm.type = "button";
      rm.textContent = "✕";
      rm.setAttribute("aria-label", `Remove ${row.p.name}`);
      rm.addEventListener("click", () => {
        delete state.cart[row.id];
        saveState();
        renderCart();
        setToast(`Removed: ${row.p.name}`);
      });
      tdRemove.appendChild(rm);

      tr.appendChild(tdItem);
      tr.appendChild(tdPrice);
      tr.appendChild(tdQty);
      tr.appendChild(tdSub);
      tr.appendChild(tdRemove);
      tbody.appendChild(tr);
    }
  }

  function qtyControl(id, qty) {
    const wrap = document.createElement("div");
    wrap.className = "input-group input-group-sm justify-content-center";
    wrap.style.maxWidth = "150px";

    const minus = document.createElement("button");
    minus.className = "btn btn-outline-light";
    minus.type = "button";
    minus.textContent = "−";
    minus.setAttribute("aria-label", "Decrease quantity");
    minus.addEventListener("click", () => {
      state.cart[id] = clampInt((state.cart[id] || 1) - 1, 0, 99);
      if (state.cart[id] <= 0) delete state.cart[id];
      saveState();
      renderCart();
    });

    const input = document.createElement("input");
    input.className = "form-control text-center bg-black bg-opacity-25 text-light border-light border-opacity-10";
    input.type = "number";
    input.min = "0";
    input.max = "99";
    input.value = String(qty);
    input.setAttribute("aria-label", "Quantity");
    input.addEventListener("change", () => {
      const v = clampInt(input.value, 0, 99);
      if (v <= 0) delete state.cart[id];
      else state.cart[id] = v;
      saveState();
      renderCart();
    });

    const plus = document.createElement("button");
    plus.className = "btn btn-outline-light";
    plus.type = "button";
    plus.textContent = "+";
    plus.setAttribute("aria-label", "Increase quantity");
    plus.addEventListener("click", () => {
      state.cart[id] = clampInt((state.cart[id] || 0) + 1, 0, 99);
      saveState();
      renderCart();
    });

    wrap.appendChild(minus);
    wrap.appendChild(input);
    wrap.appendChild(plus);
    return wrap;
  }

  function escapeHtml(s) {
    return String(s)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  function hydratePrefsUI() {
    $("#prefVegetarian").checked = !!state.prefs.vegetarian;
    $("#prefNoWheat").checked = !!state.prefs.noWheat;
    $("#prefPreferOrganic").checked = !!state.prefs.preferOrganic;
    $("#organicLimit").value = String(state.prefs.organicLimit);
    $("#organicLimitLabel").textContent = money(state.prefs.organicLimit);
    $("#searchBox").value = state.prefs.search || "";
    $("#showPictures").checked = !!state.prefs.showPictures;

    $$('input[name="sortMode"]').forEach(r => {
      r.checked = r.value === state.prefs.sortMode;
    });
  }

  function applyA11yState() {
    document.documentElement.style.setProperty("--fontScale", String(state.fontScale || 1));
    document.body.classList.toggle("high-contrast", !!state.highContrast);
    $("#contrastBtn").setAttribute("aria-pressed", state.highContrast ? "true" : "false");
  }

  function bindEvents() {
    $$("#breadcrumb .crumbs__step").forEach(btn => {
      btn.addEventListener("click", () => setStep(btn.dataset.step));
    });

    $("#goBrowseBtn").addEventListener("click", () => setStep("browse"));
    $("#backToPrefsBtn").addEventListener("click", () => setStep("prefs"));
    $("#toCartBtn").addEventListener("click", () => setStep("cart"));
    $("#backToBrowseBtn").addEventListener("click", () => setStep("browse"));
    $("#goBrowseFromEmpty").addEventListener("click", () => setStep("browse"));

    $("#prefVegetarian").addEventListener("change", (e) => {
      state.prefs.vegetarian = e.target.checked; saveState();
      if (state.step === "browse") renderBrowse();
    });
    $("#prefNoWheat").addEventListener("change", (e) => {
      state.prefs.noWheat = e.target.checked; saveState();
      if (state.step === "browse") renderBrowse();
    });
    $("#prefPreferOrganic").addEventListener("change", (e) => {
      state.prefs.preferOrganic = e.target.checked; saveState();
      if (state.step === "browse") renderBrowse();
    });
    $("#organicLimit").addEventListener("input", (e) => {
      state.prefs.organicLimit = Number(e.target.value);
      $("#organicLimitLabel").textContent = money(state.prefs.organicLimit);
      saveState();
      if (state.step === "browse") renderBrowse();
    });

    $$('input[name="sortMode"]').forEach(r => {
      r.addEventListener("change", (e) => {
        if (e.target.checked) {
          state.prefs.sortMode = e.target.value;
          saveState();
          if (state.step === "browse") renderBrowse();
        }
      });
    });

    $("#searchBox").addEventListener("input", (e) => {
      state.prefs.search = e.target.value;
      saveState();
      if (state.step === "browse") renderBrowse();
    });

    $("#showPictures").addEventListener("change", (e) => {
      state.prefs.showPictures = e.target.checked;
      saveState();
      if (state.step === "browse") renderBrowse();
    });

    $("#fontUpBtn").addEventListener("click", () => {
      state.fontScale = Math.min(1.4, Math.round((state.fontScale + 0.05) * 100) / 100);
      applyA11yState(); saveState();
    });
    $("#fontDownBtn").addEventListener("click", () => {
      state.fontScale = Math.max(0.9, Math.round((state.fontScale - 0.05) * 100) / 100);
      applyA11yState(); saveState();
    });
    $("#contrastBtn").addEventListener("click", () => {
      state.highContrast = !state.highContrast;
      applyA11yState(); saveState();
    });

    $("#toastClose").addEventListener("click", () => {
      const toastEl = $("#toast");
      if (window.bootstrap && bootstrap.Toast) {
        const t = bootstrap.Toast.getOrCreateInstance(toastEl);
        t.hide();
      } else {
        toastEl.hidden = true;
      }
    });

    $("#checkoutBtn").addEventListener("click", () => {
      const total = cartTotal();
      if (total <= 0) {
        setToast("Add items before checkout.");
        return;
      }
      alert(`Demo checkout complete!\n\nItems: ${cartCount()}\nTotal: ${money(total)}\n\n(For the lab, take a screenshot of this.)`);
    });
  }

  function init() {
    applyA11yState();
    hydratePrefsUI();
    bindEvents();
    setStep(state.step || "prefs");
  }

  document.addEventListener("DOMContentLoaded", init);
})();
