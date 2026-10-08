# Implementation Plan: To-Do List Life Dashboard

## Overview

The implementation files (`index.html`, `css/style.css`, `js/app.js`) already exist with a working baseline.
Each task below either verifies that the existing code satisfies the spec or extends it where gaps exist.
Property-based tests (Vitest + fast-check) are added as optional sub-tasks to validate the eleven
correctness properties defined in `design.md`.

---

## Tasks

- [x] 1. Set up test infrastructure
  - Create `package.json` at the project root with Vitest and fast-check as dev dependencies
  - Add a `test` script: `"test": "vitest --run"`
  - Create `__tests__/` directory at the project root
  - Create `__tests__/helpers.js` that re-exports the pure functions (`getGreeting`, `normaliseUrl`,
    `storageGet`, `storageSet`, `uid`, `sanitise`) extracted or mirrored from `app.js` for test isolation
  - _Requirements: 13.3_

- [x] 2. Verify and finalise HTML structure (`index.html`)
  - [x] 2.1 Audit `index.html` against design DOM dependencies
    - Confirm all required element IDs exist: `greeting-text`, `current-time`, `current-date`,
      `timer-display`, `timer-label`, `btn-start`, `btn-stop`, `btn-reset`,
      `todo-input`, `btn-add-todo`, `todo-list`, `todo-empty`,
      `modal-overlay`, `modal-input`, `btn-modal-save`, `btn-modal-cancel`,
      `link-name-input`, `link-url-input`, `btn-add-link`, `links-grid`, `links-empty`
    - Confirm `<script src="js/app.js">` is the last element before `</body>`
    - Confirm ARIA attributes on the modal (`role="dialog"`, `aria-modal`, `aria-labelledby`)
    - _Requirements: 1.1, 3.1, 5.1, 10.1, 13.1_
  - [x] 2.2 Fix any HTML gaps found during the audit
    - Apply the minimum changes needed; do not restructure working markup
    - _Requirements: 13.1, 13.4_

- [x] 3. Verify and finalise CSS (`css/style.css`)
  - [x] 3.1 Audit CSS against design component list
    - Confirm dark-theme CSS custom properties (`--bg`, `--surface`, `--accent`, etc.) are declared in `:root`
    - Confirm responsive dashboard grid (`grid-template-columns: repeat(auto-fit, minmax(320px, 1fr))`)
    - Confirm timer display colour classes: `.running`, `.warning`, `.done`
    - Confirm `.todo-item.done` strikethrough style
    - Confirm `.modal-overlay` and `.modal-overlay.open` transition styles
    - Confirm `@media (max-width: 480px)` responsive overrides
    - _Requirements: 1.1, 3.1, 6.2, 13.2_
  - [x] 3.2 Fix any CSS gaps found during the audit
    - Apply the minimum changes needed; preserve existing custom properties and class names
    - _Requirements: 13.2_

- [x] 4. Implement global utilities in `app.js`
  - [x] 4.1 Verify / implement `storageGet` and `storageSet`
    - `storageGet(key, fallback)` — reads `localStorage[key]`, parses JSON; returns `fallback` on missing
      key or parse error
    - `storageSet(key, value)` — serialises to JSON; catches and `console.warn`s on quota errors
    - Centralise storage keys as `STORAGE_KEYS = { TODOS: "dashboard_todos", LINKS: "dashboard_links" }`
    - _Requirements: 9.3, 12.3_
  - [ ]* 4.2 Write property test for storage roundtrip (Property 10)
    - **Property 10: Storage roundtrip preserves data**
    - Generate `fc.array(fc.record({ id: fc.string(), text: fc.string(), done: fc.boolean() }))` and assert
      `storageGet` after `storageSet` returns a deep-equal value
    - Also generate corrupted JSON strings and assert `storageGet` returns the fallback without throwing
    - **Validates: Requirements 9.3, 12.3**
  - [x] 4.3 Verify / implement `uid` and `sanitise`
    - `uid()` — returns `Date.now().toString(36) + Math.random().toString(36).slice(2, 7)`
    - `sanitise(str)` — creates a detached `<span>`, assigns `textContent`, returns `innerHTML`
    - _Requirements: 5.2, 7.3, 10.2_
  - [ ]* 4.4 Write property test for XSS prevention (Property 11)
    - **Property 11: `sanitise` prevents HTML injection**
    - Generate `fc.string()` containing `<`, `>`, `"`, `&` and assert the output contains none of those
      as raw characters (only their HTML entity equivalents)
    - **Validates: Requirements 5.2, 7.3, 10.2**

- [x] 5. Implement `initClock()` IIFE in `app.js`
  - [x] 5.1 Verify / implement real-time clock and date display
    - `tick()` writes `HH:MM:SS` to `#current-time` and long-form date to `#current-date`
    - Call `tick()` immediately on init, then `setInterval(tick, 1000)`
    - Date format: `"Rabu, 08 Oktober 2026"` style (Indonesian locale per requirements 1.2)
    - _Requirements: 1.1, 1.2, 1.3, 1.4_
  - [x] 5.2 Verify / implement time-based greeting logic (`getGreeting`)
    - `h ∈ [5, 11]` → `"Selamat Pagi 🌅"`
    - `h ∈ [12, 17]` → `"Selamat Siang ☀️"`
    - `h ∈ [18, 21]` → `"Selamat Sore 🌇"`
    - `h ∈ [22..23, 0..4]` → `"Selamat Malam 🌙"`
    - Write updated text to `#greeting-text` on every `tick()` call
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5_
  - [ ]* 5.3 Write property test for greeting coverage (Property 1)
    - **Property 1: Greeting covers all 24 hours without gaps or overlaps**
    - Generate `fc.integer({ min: 0, max: 23 })` and assert `getGreeting(h)` returns exactly one of the
      four expected greeting strings for every possible hour
    - **Validates: Requirements 2.1, 2.2, 2.3, 2.4**

- [ ] 6. Implement `initTimer()` IIFE in `app.js`
  - [x] 6.1 Verify / implement timer state variables and `render()`
    - State: `remaining` (init `1500`), `intervalId` (init `null`), `isRunning` (init `false`)
    - `render()` formats `remaining` as `MM:SS`; applies `.running` / `.warning` / `.done` CSS classes;
      updates `#timer-label`; sets `btnStart.disabled = isRunning || remaining === 0`;
      sets `btnStop.disabled = !isRunning`; mirrors `.disabled` as `opacity: 0.4`
    - _Requirements: 3.1, 4.1, 4.2, 4.3_
  - [ ]* 6.2 Write property test for timer button state machine (Property 3)
    - **Property 3: Timer button state machine consistency**
    - Enumerate all valid `(isRunning, remaining)` combos and assert `btnStart.disabled` and
      `btnStop.disabled` match the three rules in Property 3
    - **Validates: Requirements 4.1, 4.2, 4.3**
  - [ ] 6.3 Verify / implement `tick()` and Start / Stop / Reset event handlers
    - `tick()`: if `remaining <= 0` clear interval and call `render()`; else decrement `remaining` by 1
      and call `render()`
    - Start: set `isRunning = true`, schedule `setInterval(tick, 1000)`
    - Stop: clear interval, set `isRunning = false`
    - Reset: clear interval, set `isRunning = false`, set `remaining = TIMER_DURATION`
    - _Requirements: 3.2, 3.3, 3.4, 3.5, 3.6_
  - [ ]* 6.4 Write property test for timer tick decrement (Property 2)
    - **Property 2: Timer tick decrements `remaining` by exactly 1**
    - Generate `fc.integer({ min: 1, max: 1500 })` as initial `remaining` with `isRunning = true`;
      call `tick()` and assert `remaining` decreased by exactly 1 and never goes below 0
    - **Validates: Requirements 3.3, 3.6**

- [ ] 7. Checkpoint — Ensure timer and clock tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 8. Implement `initTodo()` IIFE in `app.js`
  - [x] 8.1 Verify / implement `addTodo()` and input validation
    - Trim input; reject empty/whitespace-only by calling `inputEl.focus()` and returning
    - On success: push `{ id: uid(), text, done: false }`, call `save()` then `render()`,
      clear input and refocus
    - Bind to `#btn-add-todo` click and `#todo-input` Enter keydown
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5_
  - [ ]* 8.2 Write property test for task add roundtrip (Property 4)
    - **Property 4: Task add roundtrip persists to storage**
    - Generate `fc.string({ minLength: 1 }).filter(s => s.trim().length > 0)`; call `addTodo()`;
      assert `todos` grows by 1 with correct `text` and `done: false`; assert `storageGet` returns
      deep-equal array
    - **Validates: Requirements 5.2, 5.5, 9.1**
  - [ ]* 8.3 Write property test for whitespace rejection (Property 5)
    - **Property 5: Whitespace input is rejected for tasks and links**
    - Generate `fc.stringOf(fc.constantFrom(' ', '\t', '\n'))` and assert `todos.length` and
      `links.length` do not increase, and `localStorage` is not written
    - **Validates: Requirements 5.4, 10.3**
  - [ ] 8.4 Verify / implement `render()` for the to-do list
    - Sort: active tasks (`done === false`) before completed
    - Each `<li>` contains: checkbox (toggles `done`, calls `save()` + `render()`),
      `sanitise`d task text, edit button (opens modal), delete button (filters array)
    - Show `#todo-empty` when array is empty; hide otherwise
    - _Requirements: 6.1, 6.2, 6.3, 6.4_
  - [ ]* 8.5 Write property test for completed tasks sort order (Property 8)
    - **Property 8: Completed tasks always sort after active tasks**
    - Generate `fc.array(fc.record({ id: fc.string(), text: fc.string(), done: fc.boolean() }))`;
      call `render()` with that array; query the DOM and assert every `.done` `<li>` appears after
      every non-done `<li>` in document order
    - **Validates: Requirements 6.1, 6.2**
  - [ ] 8.6 Verify / implement the edit modal (`openModal`, `saveModal`, `closeModal`)
    - `openModal(id, text)` — sets `editingId`, fills `#modal-input`, adds `.open` to `#modal-overlay`
    - `saveModal()` — trims `#modal-input`; if empty, returns without change; otherwise updates
      `todos[].text`, calls `save()` + `render()`, then `closeModal()`
    - `closeModal()` — removes `.open`, sets `editingId = null`
    - Dismiss via: Save button, Enter in `#modal-input`, Cancel button, Escape key, backdrop click
    - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5, 7.6_
  - [ ]* 8.7 Write property test for task edit roundtrip (Property 6)
    - **Property 6: Task edit roundtrip**
    - Seed `todos` with one task; generate valid replacement text via `fc.string().filter(...)`; call
      `saveModal()`; assert `todos.find(t => t.id === X).text === newText.trim()` and storage is updated
    - **Validates: Requirements 7.3, 7.6**
  - [ ] 8.8 Verify / implement task deletion
    - Delete button filters `todos` by id, calls `save()` + `render()`
    - _Requirements: 8.1, 8.2, 8.3_
  - [ ]* 8.9 Write property test for task delete (Property 7)
    - **Property 7: Task delete removes item completely**
    - Seed `todos` with one or more tasks; trigger delete on a known id; assert `todos.find(t => t.id === X)`
      is `undefined` and `localStorage["dashboard_todos"]` no longer contains that id
    - **Validates: Requirements 8.2, 8.3**
  - [ ] 8.10 Verify / implement localStorage load on init
    - `todos = storageGet(STORAGE_KEYS.TODOS, [])` at IIFE init; call `render()` immediately
    - If key is missing or JSON is invalid, start with empty array without throwing
    - _Requirements: 9.1, 9.2, 9.3_

- [ ] 9. Checkpoint — Ensure to-do list tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 10. Implement `initLinks()` IIFE in `app.js`
  - [x] 10.1 Verify / implement `normaliseUrl(raw)`
    - Trim input; if empty return `null`
    - If no `http://` or `https://` prefix, prepend `"https://"`
    - Validate with `new URL()`; return the normalised string on success or `null` on failure
    - _Requirements: 10.4_
  - [ ]* 10.2 Write property test for URL normalisation (Property 9)
    - **Property 9: URL normalisation adds protocol and rejects invalids**
    - Generate strings without protocol prefix; assert valid domains return a string starting with
      `"https://"`; generate whitespace-only or gibberish strings and assert `null` is returned
    - **Validates: Requirements 10.4**
  - [ ] 10.3 Verify / implement `addLink()` and input validation
    - Check `name` (trim, reject empty); check `url` via `normaliseUrl` (reject `null`)
    - On success: push `{ id: uid(), name, url }`, call `save()` + `render()`,
      clear both inputs and focus name input
    - Bind to `#btn-add-link` click; Enter in `#link-url-input` triggers `addLink()`;
      Enter in `#link-name-input` focuses URL input
    - _Requirements: 10.1, 10.2, 10.3, 10.4, 10.5_
  - [ ] 10.4 Verify / implement `render()` for Quick Links
    - Each link renders as `<a class="link-chip" target="_blank" rel="noopener noreferrer">`
    - Include favicon `<img>` via Google S2 with `onerror="this.style.display='none'"`
    - Include `<button class="link-chip-delete">` that calls `e.preventDefault()`, filters `links`,
      calls `save()` + `render()`
    - Show `#links-empty` when array is empty; hide otherwise
    - _Requirements: 11.1, 11.2, 11.3, 11.4, 11.5_
  - [ ] 10.5 Verify / implement localStorage load on init
    - `links = storageGet(STORAGE_KEYS.LINKS, [])` at IIFE init; call `render()` immediately
    - If key is missing or JSON is invalid, start with empty array without throwing
    - _Requirements: 12.1, 12.2, 12.3_

- [ ] 11. Checkpoint — Ensure Quick Links tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 12. Wire everything together and run full test suite
  - [ ] 12.1 Confirm execution order in `app.js`
    - `<script src="js/app.js">` at end of `<body>` (DOM ready when script runs)
    - IIFEs run in order: global utilities → `initClock()` → `initTimer()` → `initTodo()` → `initLinks()`
    - No global-namespace pollution; all state is scoped inside IIFEs
    - _Requirements: 13.3, 13.4_
  - [ ]* 12.2 Write unit tests for edge cases across all modules
    - `getGreeting`: boundary hours 5, 12, 18, 22 and midnight 0
    - `normaliseUrl`: already-prefixed URL, bare domain, whitespace-only, gibberish
    - `storageGet` / `storageSet`: normal roundtrip, missing key returns fallback, corrupted JSON recovery
    - `sanitise`: `<script>alert(1)</script>`, `&`, `"`, combined injection string
    - Timer: Idle → Running → Paused → Done → Idle full state cycle
    - Modal keyboard: Enter saves, Escape cancels, backdrop click cancels
    - _Requirements: 1.1–13.4 (cross-cutting)_
  - [ ] 12.3 Run full test suite and fix any failures
    - Execute `npx vitest --run` and resolve all failing tests
    - _Requirements: 13.4_

- [ ] 13. Final checkpoint — Cross-browser verification
  - Open `index.html` directly in Chrome, Firefox, and Edge using a `file://` URL
  - Verify all four widgets render correctly with no console errors
  - Verify localStorage persistence across page reloads
  - Ensure all tests pass, ask the user if questions arise.

---

## Notes

- Tasks marked with `*` are optional and can be skipped for a faster MVP
- All property-based tests use fast-check with at least 100 iterations per property (`numRuns: 100`)
- Pure functions (`getGreeting`, `normaliseUrl`, `storageGet`, `storageSet`, `sanitise`) must be
  importable by the test files — either export them from `app.js` behind a guard, or mirror them in
  `__tests__/helpers.js`
- The project requires no build step; `npx vitest --run` handles test execution independently
- Each PBT task references its property number from `design.md` for full traceability

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["1"] },
    { "id": 1, "tasks": ["2.1", "3.1", "4.1", "4.3"] },
    { "id": 2, "tasks": ["2.2", "3.2", "4.2", "4.4", "5.1"] },
    { "id": 3, "tasks": ["5.2", "6.1", "8.1", "10.1"] },
    { "id": 4, "tasks": ["5.3", "6.2", "6.3", "8.2", "8.3", "10.2"] },
    { "id": 5, "tasks": ["6.4", "8.4", "8.6", "10.3"] },
    { "id": 6, "tasks": ["8.5", "8.7", "8.8", "10.4", "10.5"] },
    { "id": 7, "tasks": ["8.9", "8.10", "12.1"] },
    { "id": 8, "tasks": ["12.2"] },
    { "id": 9, "tasks": ["12.3"] }
  ]
}
```
