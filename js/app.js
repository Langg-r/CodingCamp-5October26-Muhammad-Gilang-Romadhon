/* =========================================================
   LIFE DASHBOARD - app.js
   Vanilla JS only, no frameworks, no build step.
   ========================================================= */

"use strict";

/* =========================================================
   STORAGE KEYS
   ========================================================= */
const STORAGE_KEYS = {
  TODOS:            "dashboard_todos",
  LINKS:            "dashboard_links",
  THEME:            "dashboard_theme",
  USERNAME:         "dashboard_username",
  POMODORO_MINUTES: "dashboard_pomodoro_minutes",
};

/* =========================================================
   UTILITIES
   ========================================================= */

function storageGet(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw !== null ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function storageSet(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.warn("localStorage write failed:", e);
  }
}

function uid() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

function sanitise(str) {
  const el = document.createElement("span");
  el.textContent = str;
  return el.innerHTML;
}

/* =========================================================
   THEME — terapkan sebelum apapun render agar tidak flash
   ========================================================= */
(function initTheme() {
  const saved = storageGet(STORAGE_KEYS.THEME, "dark");
  document.documentElement.setAttribute("data-theme", saved);
})();

/* =========================================================
   WELCOME SCREEN
   - Tampil jika belum ada nama tersimpan
   - Setelah konfirmasi, fade out lalu tampilkan dashboard
   ========================================================= */
(function initWelcome() {
  const overlay   = document.getElementById("welcome-overlay");
  const nameInput = document.getElementById("welcome-name-input");
  const btnConfirm = document.getElementById("btn-welcome-confirm");

  const saved = storageGet(STORAGE_KEYS.USERNAME, "");

  if (saved) {
    // Sudah pernah isi nama — langsung sembunyikan welcome screen
    overlay.style.display = "none";
    return;
  }

  // Tampilkan welcome screen, fokus input
  setTimeout(() => nameInput.focus(), 300);

  function confirm() {
    const val = nameInput.value.trim();
    if (!val) { nameInput.focus(); return; }
    storageSet(STORAGE_KEYS.USERNAME, val);
    // Fade out then hide
    overlay.classList.add("fade-out");
    overlay.addEventListener("transitionend", () => {
      overlay.style.display = "none";
    }, { once: true });
    // Refresh greeting
    const greetingEl = document.getElementById("greeting-text");
    if (greetingEl) greetingEl.dispatchEvent(new Event("refresh-name"));
  }

  btnConfirm.addEventListener("click", confirm);
  nameInput.addEventListener("keydown", e => { if (e.key === "Enter") confirm(); });
})();

/* =========================================================
   SETTINGS MODAL
   - Buka via tombol ⚙️ di pojok kanan atas header
   - Isi: edit nama + pilih tema dark/light
   ========================================================= */
(function initSettings() {
  const overlay       = document.getElementById("settings-overlay");
  const btnOpen       = document.getElementById("btn-settings-open");
  const btnClose      = document.getElementById("btn-settings-close");
  const nameInput     = document.getElementById("settings-name-input");
  const btnNameSave   = document.getElementById("btn-settings-name-save");
  const btnDark       = document.getElementById("btn-theme-dark");
  const btnLight      = document.getElementById("btn-theme-light");
  const root          = document.documentElement;

  function syncThemeButtons() {
    const current = root.getAttribute("data-theme");
    btnDark.classList.toggle("active",  current === "dark");
    btnLight.classList.toggle("active", current === "light");
    btnDark.setAttribute("aria-pressed",  String(current === "dark"));
    btnLight.setAttribute("aria-pressed", String(current === "light"));
  }

  function openSettings() {
    nameInput.value = storageGet(STORAGE_KEYS.USERNAME, "");
    syncThemeButtons();
    overlay.classList.add("open");
    setTimeout(() => nameInput.focus(), 50);
  }

  function closeSettings() {
    overlay.classList.remove("open");
  }

  function setTheme(val) {
    root.setAttribute("data-theme", val);
    storageSet(STORAGE_KEYS.THEME, val);
    syncThemeButtons();
  }

  function saveName() {
    const val = nameInput.value.trim();
    storageSet(STORAGE_KEYS.USERNAME, val);
    // Trigger greeting refresh
    document.getElementById("greeting-text").dispatchEvent(new Event("refresh-name"));
    closeSettings();
  }

  btnOpen.addEventListener("click", openSettings);
  btnClose.addEventListener("click", closeSettings);
  overlay.addEventListener("click", e => { if (e.target === overlay) closeSettings(); });
  document.addEventListener("keydown", e => { if (e.key === "Escape" && overlay.classList.contains("open")) closeSettings(); });

  btnNameSave.addEventListener("click", saveName);
  nameInput.addEventListener("keydown", e => { if (e.key === "Enter") saveName(); });

  btnDark.addEventListener("click",  () => setTheme("dark"));
  btnLight.addEventListener("click", () => setTheme("light"));
})();

/* =========================================================
   GREETING & CLOCK
   ========================================================= */
(function initClock() {
  const greetingEl = document.getElementById("greeting-text");
  const timeEl     = document.getElementById("current-time");
  const dateEl     = document.getElementById("current-date");

  const DAYS   = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];
  const MONTHS = ["Januari", "Februari", "Maret", "April", "Mei", "Juni",
                  "Juli", "Agustus", "September", "Oktober", "November", "Desember"];

  function pad(n) { return String(n).padStart(2, "0"); }

  // h = jam (0-23), m = menit (0-59)
  function getGreeting(h, m) {
    const total = h * 60 + m; // total menit sejak tengah malam
    if (total <= 10 * 60 + 59) return "Selamat Pagi 🌅";    // 00:00 - 10:59
    if (total <= 14 * 60 + 59) return "Selamat Siang ☀️";   // 11:00 - 14:59
    if (total <= 18 * 60 + 30) return "Selamat Sore 🌇";    // 15:00 - 18:30
    return "Selamat Malam 🌙";                                // 18:31 - 23:59
  }

  function buildGreeting(h, m) {
    const base = getGreeting(h, m);
    const name = storageGet(STORAGE_KEYS.USERNAME, "");
    if (!name) return base;
    // "Selamat Pagi, Gilang 🌅"
    return base.replace(/(\s[\p{Emoji}]+)$/u, `, ${sanitise(name)}$1`);
  }

  function tick() {
    const now = new Date();
    timeEl.textContent     = `${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;
    dateEl.textContent     = `${DAYS[now.getDay()]}, ${pad(now.getDate())} ${MONTHS[now.getMonth()]} ${now.getFullYear()}`;
    greetingEl.textContent = buildGreeting(now.getHours(), now.getMinutes());
  }

  // Refresh nama saat event dari welcome/settings
  greetingEl.addEventListener("refresh-name", () => tick());

  tick();
  setInterval(tick, 1000);
})();

/* =========================================================
   FOCUS TIMER
   ========================================================= */
(function initTimer() {
  const displayEl     = document.getElementById("timer-display");
  const labelEl       = document.getElementById("timer-label");
  const btnStart      = document.getElementById("btn-start");
  const btnStop       = document.getElementById("btn-stop");
  const btnReset      = document.getElementById("btn-reset");
  const durationInput = document.getElementById("pomodoro-duration");
  const btnSetDur     = document.getElementById("btn-set-duration");

  let timerMinutes   = storageGet(STORAGE_KEYS.POMODORO_MINUTES, 25);
  let TIMER_DURATION = timerMinutes * 60;
  let remaining      = TIMER_DURATION;
  let intervalId     = null;
  let isRunning      = false;

  durationInput.value = timerMinutes;

  function pad(n) { return String(n).padStart(2, "0"); }

  function render() {
    const m = Math.floor(remaining / 60);
    const s = remaining % 60;
    displayEl.textContent = `${pad(m)}:${pad(s)}`;

    displayEl.classList.remove("running", "warning", "done");
    if (remaining === 0) {
      displayEl.classList.add("done");
      labelEl.textContent = "🎉 Sesi selesai! Waktunya istirahat.";
    } else if (isRunning && remaining <= 5 * 60) {
      displayEl.classList.add("warning");
      labelEl.textContent = "⚠️ Hampir selesai, tetap fokus!";
    } else if (isRunning) {
      displayEl.classList.add("running");
      labelEl.textContent = "🔥 Tetap fokus...";
    } else if (remaining < TIMER_DURATION) {
      labelEl.textContent = "⏸ Dijeda";
    } else {
      labelEl.textContent = "Siap fokus?";
    }

    btnStart.disabled = isRunning || remaining === 0;
    btnStop.disabled  = !isRunning;
  }

  function tick() {
    if (remaining <= 0) {
      clearInterval(intervalId);
      intervalId = null;
      isRunning  = false;
      remaining  = 0;
      render();
      return;
    }
    remaining--;
    render();
  }

  function applyDuration() {
    const val = parseInt(durationInput.value, 10);
    if (isNaN(val) || val < 1 || val > 99) {
      durationInput.value = timerMinutes;
      return;
    }
    clearInterval(intervalId);
    intervalId     = null;
    isRunning      = false;
    timerMinutes   = val;
    TIMER_DURATION = val * 60;
    remaining      = TIMER_DURATION;
    storageSet(STORAGE_KEYS.POMODORO_MINUTES, timerMinutes);
    render();
  }

  btnSetDur.addEventListener("click", applyDuration);
  durationInput.addEventListener("keydown", e => { if (e.key === "Enter") applyDuration(); });

  btnStart.addEventListener("click", () => {
    if (isRunning || remaining === 0) return;
    isRunning  = true;
    intervalId = setInterval(tick, 1000);
    render();
  });

  btnStop.addEventListener("click", () => {
    if (!isRunning) return;
    clearInterval(intervalId);
    intervalId = null;
    isRunning  = false;
    render();
  });

  btnReset.addEventListener("click", () => {
    clearInterval(intervalId);
    intervalId = null;
    isRunning  = false;
    remaining  = TIMER_DURATION;
    render();
  });

  render();
})();

/* =========================================================
   TO-DO LIST
   ========================================================= */
(function initTodo() {
  const listEl     = document.getElementById("todo-list");
  const inputEl    = document.getElementById("todo-input");
  const btnAdd     = document.getElementById("btn-add-todo");
  const emptyEl    = document.getElementById("todo-empty");
  const overlayEl  = document.getElementById("modal-overlay");
  const modalInput = document.getElementById("modal-input");
  const btnSave    = document.getElementById("btn-modal-save");
  const btnCancel  = document.getElementById("btn-modal-cancel");

  let todos     = storageGet(STORAGE_KEYS.TODOS, []);
  let editingId = null;

  function save() { storageSet(STORAGE_KEYS.TODOS, todos); }

  function render() {
    listEl.innerHTML = "";
    if (todos.length === 0) { emptyEl.style.display = "block"; return; }
    emptyEl.style.display = "none";

    const sorted = [...todos].sort((a, b) => {
      if (a.done === b.done) return 0;
      return a.done ? 1 : -1;
    });

    sorted.forEach(todo => {
      const li = document.createElement("li");
      li.className  = "todo-item" + (todo.done ? " done" : "");
      li.dataset.id = todo.id;

      li.innerHTML = `
        <input type="checkbox" class="todo-checkbox" aria-label="Tandai tugas selesai" ${todo.done ? "checked" : ""} />
        <span class="todo-text">${sanitise(todo.text)}</span>
        <div class="todo-actions">
          <button class="btn-icon btn-edit"   title="Edit"  aria-label="Edit tugas">&#9998;</button>
          <button class="btn-icon btn-delete" title="Hapus" aria-label="Hapus tugas">&#128465;</button>
        </div>
      `;

      li.querySelector(".todo-checkbox").addEventListener("change", e => {
        const item = todos.find(t => t.id === todo.id);
        if (item) { item.done = e.target.checked; save(); render(); }
      });
      li.querySelector(".btn-edit").addEventListener("click", () => openModal(todo.id, todo.text));
      li.querySelector(".btn-delete").addEventListener("click", () => {
        todos = todos.filter(t => t.id !== todo.id);
        save(); render();
      });

      listEl.appendChild(li);
    });
  }

  function addTodo() {
    const text = inputEl.value.trim();
    if (!text) { inputEl.focus(); return; }
    todos.push({ id: uid(), text, done: false });
    save(); render();
    inputEl.value = "";
    inputEl.focus();
  }

  btnAdd.addEventListener("click", addTodo);
  inputEl.addEventListener("keydown", e => { if (e.key === "Enter") addTodo(); });

  function openModal(id, currentText) {
    editingId        = id;
    modalInput.value = currentText;
    overlayEl.classList.add("open");
    setTimeout(() => { modalInput.focus(); modalInput.select(); }, 50);
  }

  function closeModal() { overlayEl.classList.remove("open"); editingId = null; }

  function saveModal() {
    const newText = modalInput.value.trim();
    if (!newText) return;
    const item = todos.find(t => t.id === editingId);
    if (item) { item.text = newText; save(); render(); }
    closeModal();
  }

  btnSave.addEventListener("click", saveModal);
  btnCancel.addEventListener("click", closeModal);
  overlayEl.addEventListener("click", e => { if (e.target === overlayEl) closeModal(); });
  modalInput.addEventListener("keydown", e => { if (e.key === "Enter") saveModal(); });
  document.addEventListener("keydown", e => { if (e.key === "Escape" && editingId) closeModal(); });

  render();
})();

/* =========================================================
   QUICK LINKS
   ========================================================= */
(function initLinks() {
  const gridEl      = document.getElementById("links-grid");
  const nameInputEl = document.getElementById("link-name-input");
  const urlInputEl  = document.getElementById("link-url-input");
  const btnAdd      = document.getElementById("btn-add-link");
  const emptyEl     = document.getElementById("links-empty");

  let links = storageGet(STORAGE_KEYS.LINKS, []);

  function save() { storageSet(STORAGE_KEYS.LINKS, links); }

  function render() {
    gridEl.innerHTML = "";
    if (links.length === 0) { emptyEl.style.display = "block"; return; }
    emptyEl.style.display = "none";

    links.forEach(link => {
      const anchor = document.createElement("a");
      anchor.className = "link-chip";
      anchor.href      = link.url;
      anchor.target    = "_blank";
      anchor.rel       = "noopener noreferrer";
      anchor.title     = link.url;
      anchor.setAttribute("aria-label", "Buka " + sanitise(link.name));

      const faviconSrc = "https://www.google.com/s2/favicons?sz=16&domain_url=" + encodeURIComponent(link.url);
      anchor.innerHTML = `
        <img src="${faviconSrc}" alt="" width="14" height="14"
          style="border-radius:2px;flex-shrink:0"
          onerror="this.style.display='none'" />
        ${sanitise(link.name)}
        <button class="link-chip-delete" title="Hapus" aria-label="Hapus ${sanitise(link.name)}">&#10005;</button>
      `;

      anchor.querySelector(".link-chip-delete").addEventListener("click", e => {
        e.preventDefault();
        links = links.filter(l => l.id !== link.id);
        save(); render();
      });

      gridEl.appendChild(anchor);
    });
  }

  function normaliseUrl(raw) {
    const trimmed = raw.trim();
    if (!trimmed) return null;
    const withProto = /^https?:\/\//i.test(trimmed) ? trimmed : "https://" + trimmed;
    try { new URL(withProto); return withProto; }
    catch { return null; }
  }

  function addLink() {
    const name = nameInputEl.value.trim();
    const url  = normaliseUrl(urlInputEl.value);
    if (!name) { nameInputEl.focus(); return; }
    if (!url)  { urlInputEl.focus();  return; }
    links.push({ id: uid(), name, url });
    save(); render();
    nameInputEl.value = "";
    urlInputEl.value  = "";
    nameInputEl.focus();
  }

  btnAdd.addEventListener("click", addLink);
  urlInputEl.addEventListener("keydown", e => { if (e.key === "Enter") addLink(); });
  nameInputEl.addEventListener("keydown", e => { if (e.key === "Enter") urlInputEl.focus(); });

  render();
})();

