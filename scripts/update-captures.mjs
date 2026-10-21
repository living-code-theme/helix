#!/usr/bin/env node
// Refresh this editor's capture fixture from its upstream queries and docs. Review the diff, then run pnpm test.
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname } from "node:path";
import { fileURLToPath } from "node:url";

const out = fileURLToPath(new URL("../test/fixtures/captures.json", import.meta.url));

const LANGS = ["ecma", "jsx", "javascript", "typescript", "tsx", "python", "rust", "go", "lua", "css", "html", "html_tags",
  "json", "yaml", "toml", "markdown", "markdown_inline", "bash", "c", "cpp", "java", "ruby", "regex", "jsdoc", "luadoc",
  "diff", "comment", "_javascript", "_typescript", "_jsx"];

const SOURCES = {helix: {
    queries: (l) => [`https://raw.githubusercontent.com/helix-editor/helix/master/runtime/queries/${l}/highlights.scm`],
    docs: ["https://raw.githubusercontent.com/helix-editor/helix/master/book/src/themes.md"],
    // The scope list in the theme docs: "- `name` - description" items, nested by indentation.
    docCaptures: (text) => {
      const section = text.slice(text.indexOf("#### Syntax highlighting"), text.indexOf("#### Interface"));
      const names = [], stack = [];
      for (const line of section.split("\n")) {
        const m = line.match(/^(\s*)- `([a-z][a-z0-9_]*)`/);
        if (!m) continue;
        const depth = m[1].length / 2;
        stack.length = depth;
        stack[depth] = m[2];
        names.push(stack.join("."));
      }
      return names;
    },
  }};

async function get(url) {
  const res = await fetch(url);
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`${url}: HTTP ${res.status}`);
  return res.text();
}

// Capture names in a query, without comments, private captures (`@_name`) or the ones that only feed injections.
// String literals go first: they hold tokens like "@param" or "@media" that are text, not captures.
const captures = (scm) => [...scm.replace(/"(?:[^"\\]|\\.)*"/g, "").replace(/;.*$/gm, "").matchAll(/@([a-zA-Z][a-zA-Z0-9_.-]*)/g)]
  .map((m) => m[1]).filter((n) => !n.startsWith("_") && !/^(injection|local|none|conceal|spell|nospell)/.test(n));

const result = {};
for (const [engine, src] of Object.entries(SOURCES)) {
  const names = new Set();
  for (const lang of LANGS) {
    for (const url of src.queries(lang)) {
      const scm = await get(url);
      if (scm) captures(scm).forEach((n) => names.add(n));
    }
  }
  for (const url of src.docs) src.docCaptures((await get(url)) ?? "").forEach((n) => names.add(n));
  result[engine] = [...names].sort();
  console.log(`${engine}: ${result[engine].length} captures`);
}
mkdirSync(dirname(out), { recursive: true });
writeFileSync(out, `${JSON.stringify({ updated: new Date().toISOString().slice(0, 10), ...result }, null, 2)}\n`);
console.log(`wrote ${out}`);
