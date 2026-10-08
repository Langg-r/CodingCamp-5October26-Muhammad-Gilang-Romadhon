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
   THEME — Light / Dark toggle
   ========================================================= */
(function initTheme() {
  const btn  = document.getElementById("btn-theme-toggle");
  const root = document.documentElement;

  // Load saved theme or default to dark
  const saved = storageGet(STORAGE_KEYS.THEME, "dark");
  root.setAttribute("data-theme", saved);

  btn.addEventListener("click", () => {
    const current = root.getAttribute("data-theme");
    const next    = current === "dark" ? "light" : "dark";
    root.setAttribute("data-theme", next);
    storageSet(STORAGE_KEYS.THEME, next);
  });
})();

/* =========================================================
   GREETING & CLOCK
   ========================================================= */
(function initClock() {
  const greetingEl  = document.getElementById("greeting-text");
  const timeEl      = document.getElementById("current-time");
  const dateEl      = document.getElementById("current-date");
  const btnEditName = document.getElementById("btn-edit-name");
  const nameOverlay = document.getElementById("name-modal-overlay");
  const nameInput   = document.getElementById("name-modal-input");
  const btnSave     = document.getElementById("btn-name-save");
  const btnCancel   = document.getElementById("btn-name-cancel");

  const DAYS   = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];
  const MONTHS = ["Januari", "Februari", "Maret", "April", "Mei", "Juni",
                  "Juli", "Agustus", "September", "Oktober", "November", "Desember"];

  function pad(n) { return String(n).padStart(2, "0"); }

  function getGreeting(h) {
    if (h >= 5  && h <= 11) return "Selamat Pagi 🌅";
    if (h >= 12 && h <= 17) return "Selamat Siang ☀️";
    if (h >= 18 && h <= 21) return "Selamat Sore 🌇";
    return "Selamat Malam 🌙";
  }

  function buildGreeting(h) {
    const base = getGreeting(h);
    const name = storageGet(STORAGE_KEYS.USERNAME, "");
    // e.g. "Selamat Pagi, Gilang 🌅"  or just "Selamat Pagi 🌅"
    if (!name) return base;
    // Insert name before the emoji: "Selamat Pagi, Gilang 🌅"
    return base.replace(/(\s[\p{Emoji}]+)$/u, `, ${sanitise(name)}$1`);
  }

  function tick() {
    const now = new Date();
    timeEl.textContent = `${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;
    dateEl.textContent = `${DAYS[now.getDay()]}, ${pad(now.getDate())} ${MONTHS[now.getMonth()]} ${now.getFullYear()}`;
    greetingEl.textContent = buildGreeting(now.getHours());
  }

  tick();
  setInterval(tick, 1000);

  /* --- Edit name modal --- */
  function openNameModal() {
    const saved = storageGet(STORAGE_KEYS.USERNAME, "");
    nameInput.value = saved;
    nameOverlay.classList.add("open");
    setTimeout(() => { nameInput.focus(); nameInput.select(); }, 50);
  }

  function closeNameModal() {
    nameOverlay.classList.remove("open");
  }

  function saveNameModal() {
    const val = nameInput.value.trim();
    storageSet(STORAGE_KEYS.USERNAME, val); // save even if empty (clears name)
    closeNameModal();
    tick(); // refresh greeting immediately
  }

  btnEditName.addEventListener("click", openNameModal);
  btnSave.addEventListener("click", saveNameModal);
  btnCancel.addEventListener("click", closeNameModal);
  nameOverlay.addEventListener("click", e => { if (e.target === nameOverlay) closeNameModal(); });
  nameInput.addEventListener("keydown", e => {
    if (e.key === "Enter") saveNameModal();
    if (e.key === "Escape") closeNameModal();
  });
})();

/* =========================================================
   FOCUS TIMER
   ========================================================= */
(function initTimer() {
  const displayEl   = document.getElementById("timer-display");
  const labelEl     = document.getElementById("timer-label");
  const btnStart    = document.getElementById("btn-start");
  const btnStop     = document.getElementById("btn-stop");
  const btnReset    = document.getElementById("btn-reset");
  const durationInput = document.getElementById("pomodoro-duration");
  const btnSetDur   = document.getElementById("btn-set-duration");

  // Load saved duration (minutes), default 25
  let timerMinutes = storageGet(STORAGE_KEYS.POMODORO_MINUTES, 25);
  let TIMER_DURATION = timerMinutes * 60;

  let remaining  = TIMER_DURATION;
  let intervalId = null;
  let isRunning  = false;

  // Sync input field to saved value
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
    btnStart.style.opacity = btnStart.disabled ? "0.4" : "1";
    btnStop.style.opacity  = btnStop.disabled  ? "0.4" : "1";
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

  /* --- Set custom duration --- */
  function applyDuration() {
    const val = parseInt(durationInput.value, 10);
    if (isNaN(val) || val < 1 || val > 99) {
      // Reset input to current valid value
      durationInput.value = timerMinutes;
      return;
    }
    // Stop timer if running
    clearInterval(intervalId);
    intervalId = null;
    isRunning  = false;

    timerMinutes   = val;
    TIMER_DURATION = val * 60;
    remaining      = TIMER_DURATION;

    storageSet(STORAGE_KEYS.POMODORO_MINUTES, timerMinutes);
    render();
  }

  btnSetDur.addEventListener("click", applyDuration);
  durationInput.addEventListener("keydown", e => { if (e.key === "Enter") applyDuration(); });

  /* --- Timer controls --- */
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

    if (todos.length === 0) {
      emptyEl.style.display = "block";
      return;
    }
    emptyEl.style.display = "none";

    // Active tasks first, completed at bottom
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
          <button class="btn-icon btn-edit"   title="Edit"   aria-label="Edit tugas">&#9998;</button>
          <button class="btn-icon btn-delete" title="Hapus"  aria-label="Hapus tugas">&#128465;</button>
        </div>
      `;

      li.querySelector(".todo-checkbox").addEventListener("change", (e) => {
        const item = todos.find(t => t.id === todo.id);
        if (item) { item.done = e.target.checked; save(); render(); }
      });

      li.querySelector(".btn-edit").addEventListener("click", () => openModal(todo.id, todo.text));

      li.querySelector(".btn-delete").addEventListener("click", () => {
        todos = todos.filter(t => t.id !== todo.id);
        save();
        render();
      });

      listEl.appendChild(li);
    });
  }

  function addTodo() {
    const text = inputEl.value.trim();
    if (!text) { inputEl.focus(); return; }
    todos.push({ id: uid(), text, done: false });
    save();
    render();
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

  function closeModal() {
    overlayEl.classList.remove("open");
    editingId = null;
  }

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

    if (links.length === 0) {
      emptyEl.style.display = "block";
      return;
    }
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
          onerror="this.style.display='none'"
        />
        ${sanitise(link.name)}
        <button class="link-chip-delete" title="Hapus" aria-label="Hapus ${sanitise(link.name)}">&#10005;</button>
      `;

      anchor.querySelector(".link-chip-delete").addEventListener("click", e => {
        e.preventDefault();
        links = links.filter(l => l.id !== link.id);
        save();
        render();
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
    save();
    render();
    nameInputEl.value = "";
    urlInputEl.value  = "";
    nameInputEl.focus();
  }

  btnAdd.addEventListener("click", addLink);
  urlInputEl.addEventListener("keydown", e => { if (e.key === "Enter") addLink(); });
  nameInputEl.addEventListener("keydown", e => { if (e.key === "Enter") urlInputEl.focus(); });

  render();
})();
