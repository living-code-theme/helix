// This port owns its application mappings. Inputs come only from the pinned local palette.


const CAPTURES = {
  attribute: "decorator", "attribute.builtin": "decorator", "attribute.special": "decorator",
  "attribute.jsx": "attribute",
  boolean: "constant",
  character: "string", "character.special": "escape",
  comment: "comment", "comment.doc": "comment", "comment.documentation": "comment", "comment.unused": "comment",
  "comment.error": "error", "comment.warning": "warning", "comment.todo": "accent", "comment.note": "info",
  concept: "type",
  // @constant marks names (ALL_CAPS identifiers, Rust `const` items, Go consts); @constant.builtin marks values.
  constant: "variable", "constant.builtin": "constant", "constant.macro": "decorator",
  "constant.character": "string", "constant.character.escape": "escape", "constant.numeric": "number",
  constructor: "type",
  diff: null, "diff.plus": "added", "diff.minus": "removed", "diff.delta": "modified", "diff.delta.conflict": "error",
  embedded: "variable", emphasis: null, "emphasis.strong": null,
  enum: "type",
  error: "error", warning: "warning", info: "info", hint: "hint",
  function: "function", "function.macro": "decorator", "function.special": "decorator", "function.decorator": "decorator",
  keyword: "keyword", "keyword.directive": "decorator", "keyword.preproc": "decorator",
  label: "decorator", lifetime: "decorator",
  link_text: "link", link_uri: "link",
  markup: null, "markup.bold": null, "markup.strong": null, "markup.italic": null, "markup.strikethrough": null,
  "markup.underline": null,
  "markup.heading": "heading", "markup.link": "link", "markup.list": "accent", "markup.list.checked": "success",
  "markup.list.unchecked": "fgSubtle", "markup.quote": "quote", "markup.raw": "code", "markup.math": "constant",
  module: "namespace", namespace: "namespace",
  nested: "variable",
  number: "number",
  operator: "operator",
  predictive: "fgSubtle", primary: "fg",
  preproc: "decorator",
  property: "property",
  punctuation: "punctuation", "punctuation.special": "keyword", "punctuation.list_marker": "accent",
  "selector.class": "type", "selector.id": "type", "selector.pseudo": "decorator",
  special: "accent",
  string: "string", "string.doc": "comment", "string.documentation": "comment", "string.escape": "escape",
  "string.regexp": "regex", "string.regex": "regex", "string.special": "escape", "string.special.symbol": "constant",
  "string.special.url": "link", "string.special.path": "string",
  tag: "tag", "tag.attribute": "attribute", "tag.delimiter": "punctuation", "tag.component": "type", "tag.doctype": "tag",
  text: "variable", "text.literal": "code",
  title: "heading",
  type: "type", "type.enum.variant": "property", "type.enum.variant.builtin": "constant",
  "ui.text": null,
  variable: "variable", "variable.builtin": "builtin", "variable.special": "builtin", "variable.member": "property",
  "variable.other.member": "property", "variable.parameter": "parameter", "variable.parameter.builtin": "builtin",
  "variable.jsdoc": "parameter",
  variant: "property",
};

const CAPTURE_OVERRIDES = {
  // Zed's `hint` styles inlay hints (Neovim: LspInlayHint); Helix's is the hint diagnostic.
  zed: { hint: "fgSubtle" },
};

function captureRole(engine, name) {
  const own = CAPTURE_OVERRIDES[engine] ?? {};
  for (let n = name; n; n = n.includes(".") ? n.slice(0, n.lastIndexOf(".")) : "") {
    // hasOwn, not `in`: "constructor" is a capture name and an Object.prototype member.
    if (Object.hasOwn(own, n)) return own[n];
    if (Object.hasOwn(CAPTURES, n)) return CAPTURES[n];
  }
  return undefined;
}

const CAPTURE_UI = {
  helix: ["diff.plus.gutter", "diff.minus.gutter", "diff.delta.gutter", "diff.delta.moved", "error", "warning", "info", "hint", "ui.text", "special"],
  zed: ["predictive", "primary", "hint"],
  nvim: [],
};

export { CAPTURE_UI, captureRole };
