// This port owns its application mappings. Inputs come only from the pinned local palette.


const helix = {
files: (f) => {
    const R = f.roles;
    const st = (role, extra = {}) => {
      const o = { fg: R[role], ...extra };
      const s = f.styles[role];
      if (s && !o.modifiers) o.modifiers = [s === "underline" ? "underlined" : s];
      return o;
    };
    const t = {
      attribute: st("decorator"),
      type: st("type"), "type.builtin": st("type"), "type.enum.variant": st("property"), "type.enum.variant.builtin": st("constant"),
      constructor: st("type"),
      // Constant names (ALL_CAPS) are names; constant values (true, null) take the constant color.
      constant: st("variable"), "constant.builtin": st("constant"), "constant.numeric": st("number"),
      "constant.character.escape": st("escape"),
      string: st("string"), "string.regexp": st("regex"), "string.special": st("escape"),
      "string.special.url": st("link"), "string.special.symbol": st("constant"),
      comment: st("comment"),
      variable: st("variable"), "variable.parameter": st("parameter"), "variable.builtin": st("builtin"),
      "variable.other.member": st("property"),
      label: st("decorator"),
      punctuation: st("punctuation"), "punctuation.special": st("keyword"),
      keyword: st("keyword"), "keyword.directive": st("decorator"),
      operator: st("operator"),
      function: st("function"), "function.builtin": st("function"), "function.macro": st("decorator"),
      tag: st("tag"), namespace: st("namespace"), special: st("accent"),
      // The rest of the scopes Helix's grammars use (test/fixtures/captures.json), with the contract's roles.
      "constant.character": st("string"), "string.escape": st("escape"), "string.special.path": st("string"),
      "function.special": st("decorator"), embedded: st("variable"), "diff.delta.conflict": st("error"),
      "markup.link": st("link"), "markup.list.checked": st("success"), "markup.list.unchecked": st("fgSubtle"),
      "markup.heading": st("heading"), "markup.list": st("accent"),
      "markup.bold": { modifiers: ["bold"] }, "markup.italic": { modifiers: ["italic"] },
      "markup.strikethrough": { modifiers: ["crossed_out"] },
      "markup.link.url": { fg: R.link, modifiers: ["underlined"] }, "markup.link.text": st("link"),
      "markup.quote": st("quote"), "markup.raw": st("code"),
      "diff.plus": st("added"), "diff.minus": st("removed"), "diff.delta": st("modified"),

      "ui.background": { bg: R.bg },
      "ui.text": { fg: R.fg }, "ui.text.focus": { fg: R.fg, bg: "surface0" }, "ui.text.inactive": { fg: R.fgSubtle },
      "ui.linenr": { fg: R.lineNumber }, "ui.linenr.selected": { fg: R.lineNumberActive, modifiers: ["bold"] },
      "ui.cursorline.primary": { bg: R.lineHighlight },
      "ui.cursor": { fg: R.bg, bg: "subtext" }, "ui.cursor.primary": { fg: R.bg, bg: R.cursor },
      "ui.cursor.match": { fg: R.accent, modifiers: ["bold", "underlined"] },
      "ui.cursor.primary.insert": { fg: R.bg, bg: "amber" }, "ui.cursor.primary.select": { fg: R.bg, bg: "orchid" },
      "ui.selection": { bg: "surface1" }, "ui.selection.primary": { bg: R.selection },
      "ui.statusline": { fg: R.fgMuted, bg: R.bgDeep }, "ui.statusline.inactive": { fg: R.lineNumber, bg: R.bgDeep },
      "ui.statusline.normal": { fg: R.bg, bg: R.accent, modifiers: ["bold"] },
      "ui.statusline.insert": { fg: R.bg, bg: "amber", modifiers: ["bold"] },
      "ui.statusline.select": { fg: R.bg, bg: "orchid", modifiers: ["bold"] },
      "ui.bufferline": { fg: R.fgMuted, bg: R.bgDeep }, "ui.bufferline.active": { fg: R.fg, bg: R.bg, underline: { color: R.accent, style: "line" } },
      "ui.popup": { fg: R.fg, bg: R.bgAlt }, "ui.popup.info": { fg: R.fg, bg: R.bgAlt },
      "ui.window": { fg: R.border }, "ui.help": { fg: R.fg, bg: R.bgAlt },
      "ui.menu": { fg: R.fg, bg: R.bgAlt }, "ui.menu.selected": { fg: R.fg, bg: "surface1" }, "ui.menu.scroll": { fg: "surface2", bg: R.bgAlt },
      "ui.picker.header": { fg: R.accent, modifiers: ["bold"] },
      "ui.virtual.whitespace": { fg: "surface1" }, "ui.virtual.ruler": { bg: "surface0" },
      "ui.virtual.indent-guide": { fg: "surface0" }, "ui.virtual.inlay-hint": { fg: R.fgSubtle, bg: "surface0" },
      "ui.virtual.jump-label": { fg: R.accent, modifiers: ["bold"] },
      "ui.highlight": { bg: "surface0" },
      "ui.gutter": { bg: R.bg },
      error: { fg: R.error }, warning: { fg: R.warning }, info: { fg: R.info }, hint: { fg: R.hint },
      "diagnostic.error": { underline: { color: R.error, style: "curl" } },
      "diagnostic.warning": { underline: { color: R.warning, style: "curl" } },
      "diagnostic.info": { underline: { color: R.info, style: "curl" } },
      "diagnostic.hint": { underline: { color: R.hint, style: "curl" } },
      "diagnostic.unnecessary": { modifiers: ["dim"] }, "diagnostic.deprecated": { modifiers: ["crossed_out"] },
    };
    const toml = (v) =>
      typeof v === "string" ? `"${v}"`
        : Array.isArray(v) ? `[${v.map(toml).join(", ")}]`
          : `{ ${Object.entries(v).map(([k, x]) => `${k} = ${toml(x)}`).join(", ")} }`;
    return [{
      path: `${f.slug}.toml`,
      content: `${Object.entries(t).map(([k, v]) => `"${k}" = ${toml(v)}`).join("\n")}\n\n[palette]\n${Object.keys(f.colors).map((n) => `${n} = "${f.c(n)}"`).join("\n")}\n`,
    }];
  }
};

export function generate(flavors) {
  return [...flavors.flatMap(f => helix.files(f)), ...(helix.all?.(flavors) ?? [])].filter(f => !["LICENSE", "README.md", "package.json", "extension.toml"].includes(f.path.split("/").at(-1)));
}
