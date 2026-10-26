# Content Hierarchy Refinement Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Simplify navigation and section headings while replacing the abstract featured card with real team work.

**Architecture:** Keep the existing static HTML/CSS/JavaScript architecture. Change only the affected markup and presentation rules; existing resource records and behavior remain untouched.

**Tech Stack:** HTML5, CSS3, Node.js `node:test`

**Spec:** `docs/superpowers/specs/2026-10-26-content-hierarchy-refinement-design.md`

## Global Constraints

- Preserve all 27 searchable resource records and all configured URLs.
- Preserve search, anchor activation, keyboard behavior, responsive layouts, and reduced-motion support.
- Use only existing local assets and no new runtime dependency.

## Review Focus

- The real featured image remains legible behind its text at desktop and mobile widths.
- Removing heading fragments must not remove resource counts or heading IDs.
- The anchor row must still align correctly without the leading caption.

---

### Task 1: Simplify content hierarchy

**Files:**
- Modify: `index.html`
- Modify: `styles.css`
- Test: `tests/site.test.mjs`

**Interfaces:**
- Consumes: existing `.featured-card`, `.anchor-nav`, and `.section-heading` markup.
- Produces: simplified markup while preserving stable section IDs and `.resource-item` records.

- [x] **Step 1: Add failing contract tests for the simplified anchor, headings, and real featured visual.**
- [x] **Step 2: Run `node --test tests/site.test.mjs` and verify the new tests fail.**
- [x] **Step 3: Update the featured card and heading markup.**
- [x] **Step 4: Update desktop and mobile CSS for the simplified structure.**
- [x] **Step 5: Run automated and browser verification.**
- [x] **Step 6: Commit and push the redesign branch.**
