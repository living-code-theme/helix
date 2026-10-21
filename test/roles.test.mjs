// Port-owned role-contract tests, exercising generated files and real grammars.
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import test from 'node:test';
import {resolveAll} from '../scripts/palette.mjs';
import {generate} from '../src/generate.mjs';
import {CAPTURE_UI,captureRole} from './contract.mjs';

const root = new URL("../", import.meta.url);

const read = (path) => readFileSync(new URL(path, root), "utf8");

const captures = JSON.parse(read("test/fixtures/captures.json"));

const flavors = resolveAll();

async function helixTable(f) {

  const toml = generate([f])[0].content;
  const palette = Object.fromEntries([...toml.slice(toml.indexOf("[palette]")).matchAll(/^(\w+)\s*=\s*"(#[0-9a-f]{6})"/gim)].map((m) => [m[1], m[2]]));
  const table = {};
  for (const m of toml.slice(0, toml.indexOf("[palette]")).matchAll(/^"?([\w.]+)"?\s*=\s*(\{[^}]*\}|"[^"]*")/gm)) {
    const fg = m[2].startsWith("{") ? m[2].match(/fg\s*=\s*"([^"]+)"/)?.[1] : m[2].slice(1, -1);
    table[m[1]] = fg && (palette[fg] ?? fg);
  }
  return table;
}

function fallback(table, name) {
  for (let n = name; n; n = n.includes(".") ? n.slice(0, n.lastIndexOf(".")) : "") if (Object.hasOwn(table, n)) return table[n];
  return undefined;
}

const norm = (hex) => hex?.toLowerCase().slice(0, 7);

const EDITOR_UI = {helix: async (f) => {

    const toml = generate([f])[0].content;
    const palette = Object.fromEntries([...toml.slice(toml.indexOf("[palette]")).matchAll(/^(\w+)\s*=\s*"(#[0-9a-f]{6})"/gim)].map((m) => [m[1], m[2]]));
    const v = (scope, key) => { const m = toml.match(new RegExp(`^"${scope.replace(/\./g, "\\.")}"\\s*=\\s*\\{[^}]*\\b${key}\\s*=\\s*"([^"]+)"`, "m")); return m && (palette[m[1]] ?? m[1]); };
    return { bg: v("ui.background", "bg"), fg: v("ui.text", "fg"), cursor: v("ui.cursor.primary", "bg"), selection: v("ui.selection.primary", "bg"), lineNumber: v("ui.linenr", "fg"), lineNumberActive: v("ui.linenr.selected", "fg"), lineHighlight: v("ui.cursorline.primary", "bg") };
  }};

test("every capture an editor uses has a role in the contract", () => {
  for (const engine of ["helix"]) {
    const ui = new Set(CAPTURE_UI[engine]);
    const undecided = captures[engine].filter((n) => !ui.has(n) && captureRole(engine, n) === undefined);
    assert.deepEqual(undecided, [], `${engine}: decide these captures' roles in scripts/roles.mjs`);
  }
});

test("Helix colors every scope it highlights with its role", async () => {
  const failures = [];
  const ui = new Set(CAPTURE_UI.helix);
  for (const f of flavors) {
    const table = await helixTable(f);
    for (const name of captures.helix) {
      const role = captureRole("helix", name);
      if (!role || ui.has(name)) continue;
      const got = fallback(table, name);
      if (norm(got) !== norm(f.r(role))) failures.push(`helix ${f.id} ${name}: ${role} is ${f.r(role)}, got ${got}`);
    }
  }
  assert.deepEqual(failures, []);
});

test("every editor draws its editing surface with the same roles", async () => {
  const failures = [];
  for (const f of flavors) {
    for (const [port, load] of Object.entries(EDITOR_UI)) {
      const got = await load(f);
      for (const [role, color] of Object.entries(got)) {
        if (norm(color) !== norm(f.r(role))) failures.push(`${port} ${f.id} ${role}: ${f.r(role)}, got ${color}`);
      }
    }
  }
  assert.deepEqual(failures, []);
});
