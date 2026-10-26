# Linear Resource Library Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild the existing UED resource portal as a polished, single-page Linear-inspired resource library while preserving all real content and configured links.

**Architecture:** Replace the 1.2 MB monolithic document with a static three-file site: semantic HTML, standalone CSS, and dependency-free JavaScript. Extract only the embedded images used by the new page into `assets/`, and cover structure and search behavior with Node's built-in test runner.

**Tech Stack:** HTML5, CSS3, vanilla JavaScript, Node.js `node:test`, GitHub Pages

**Spec:** `docs/superpowers/specs/2026-10-26-linear-resource-library.md`

## Global Constraints

- Preserve the five single-page sections and use tabs only as scroll anchors.
- Preserve real resource names, configured URLs, author names, and unavailable states.
- Use a near-black Linear-inspired visual system with one restrained indigo accent, thin borders, subtle grid lines, and reduced-motion support.
- No runtime dependencies, build step, backend, authentication, or multi-page routing.
- Keep `main` unchanged until the redesign branch is verified.

## Review Focus

- Empty or whitespace-only search must restore every resource and hide the empty state.
- Chinese and Latin queries must match case-insensitively across titles, categories, descriptions, and authors.
- Missing resource URLs must never navigate and must be visibly marked as pending.
- Sticky anchor navigation must not obscure section headings at desktop or mobile widths.
- Motion and glow effects must be disabled or reduced when `prefers-reduced-motion` is active.

---

### Task 1: Content contract and extracted assets

**Files:**
- Create: `tests/site.test.mjs`
- Create: `scripts/extract-embedded-assets.mjs`
- Create: `assets/*`

**Interfaces:**
- Consumes: the upstream `index.html` data URIs and resource inventory.
- Produces: named image files and structural assertions used by later tasks.

- [ ] **Step 1: Write failing tests for required sections, resource counts, configured links, pending states, and local asset references.**
- [ ] **Step 2: Run `node --test tests/site.test.mjs` and verify it fails because the redesigned structure does not exist.**
- [ ] **Step 3: Implement the one-time asset extractor and generate the named assets needed by the redesigned cards.**
- [ ] **Step 4: Run the asset checks and confirm every referenced local asset exists.**
- [ ] **Step 5: Commit with `test: define resource library content contract`.**

### Task 2: Semantic single-page structure

**Files:**
- Replace: `index.html`
- Create: `styles.css`
- Create: `app.js`

**Interfaces:**
- Consumes: the image files and content contract from Task 1.
- Produces: stable section IDs, `.resource-item` search records, anchor links, and `window.UEDPortal` search helpers.

- [ ] **Step 1: Extend tests with semantic landmark, navigation, disabled-link, and search-helper assertions.**
- [ ] **Step 2: Run the tests and verify the new assertions fail for the legacy document.**
- [ ] **Step 3: Build the semantic HTML using all real resource content and links.**
- [ ] **Step 4: Implement dependency-free search, keyboard shortcuts, active anchors, and safe external navigation.**
- [ ] **Step 5: Run the full test suite and confirm it passes.**
- [ ] **Step 6: Commit with `feat: rebuild resource library structure`.**

### Task 3: Linear-inspired responsive visual system

**Files:**
- Modify: `styles.css`
- Modify: `tests/site.test.mjs`

**Interfaces:**
- Consumes: the semantic classes and state attributes from Task 2.
- Produces: responsive presentation for desktop, tablet, mobile, focus states, and reduced motion.

- [ ] **Step 1: Add failing CSS contract tests for palette variables, 1px borders, sticky anchors, breakpoints, focus visibility, and reduced motion.**
- [ ] **Step 2: Run the tests and verify they fail before the full style system exists.**
- [ ] **Step 3: Implement the near-black grid, restrained indigo glow, typography, section layouts, responsive rules, and motion fallbacks.**
- [ ] **Step 4: Run the full test suite and confirm it passes.**
- [ ] **Step 5: Commit with `feat: add Linear-inspired visual system`.**

### Task 4: Browser verification and GitHub handoff

**Files:**
- Modify: `docs/superpowers/plans/2026-10-26-linear-resource-library.md`

**Interfaces:**
- Consumes: the completed static site.
- Produces: browser screenshots, responsive verification, and a pushed redesign branch.

- [x] **Step 1: Serve the site locally and verify desktop rendering, anchor navigation, search, configured links, and pending states.**
- [x] **Step 2: Verify tablet and mobile layouts and reduced-motion behavior.**
- [x] **Step 3: Run `node --test tests/site.test.mjs` and confirm a clean final result.**
- [x] **Step 4: Push `redesign/linear-resource-library` to `BitPan666/ued-portal-locked`.**
- [x] **Step 5: Present the local/branch preview and ask before publishing or merging to GitHub Pages.**
