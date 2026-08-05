#!/usr/bin/env node
/**
 * Validates every themes/*.json in the pi-tokyonight-theme package.
 *
 * Zero dependencies — run with: node scripts/validate.mjs
 *
 * Per theme file it checks:
 *   1. The file parses as JSON.
 *   2. Root keys are exactly: $schema, name, vars, colors, export (no extras).
 *   3. name is a non-empty string without "/".
 *   4. colors contains exactly the 51 required tokens (the list below,
 *      matching pi's theme schema) plus the optional "thinkingMax" —
 *      no extra keys allowed.
 *   5. Every colors value is a valid color value: "" (terminal default),
 *      a key defined in vars, or a literal "#rrggbb" hex color / 0-255 int.
 *   6. Every vars key is referenced by at least one colors entry
 *      (no unused vars, no missing refs). The only exceptions are the
 *      conventional background vars "bg" and "bgDark": they are part of the
 *      Tokyo Night palette spec for each theme but are not consumed by the
 *      colors mapping (their values are mirrored in export.pageBg/cardBg).
 *   7. Every var value is "#rrggbb" (6-digit lowercase hex), an integer
 *      0-255, or "".
 *   8. export has exactly pageBg, cardBg, infoBg.
 *   9. All theme names across all files are unique.
 *
 * Exit code 0 if everything passes, 1 otherwise (with a per-file error list).
 */

import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const ROOT = join(fileURLToPath(import.meta.url), "..", "..");
const THEMES_DIR = join(ROOT, "themes");

const ROOT_KEYS = ["$schema", "name", "vars", "colors", "export"];
const EXPORT_KEYS = ["pageBg", "cardBg", "infoBg"];

// The 51 required color tokens, per pi's theme schema (thinkingMax is optional).
const REQUIRED_COLOR_TOKENS = [
  "accent", "border", "borderAccent", "borderMuted",
  "success", "error", "warning",
  "muted", "dim", "text", "thinkingText",
  "selectedBg", "userMessageBg", "userMessageText",
  "customMessageBg", "customMessageText", "customMessageLabel",
  "toolPendingBg", "toolSuccessBg", "toolErrorBg",
  "toolTitle", "toolOutput",
  "mdHeading", "mdLink", "mdLinkUrl", "mdCode",
  "mdCodeBlock", "mdCodeBlockBorder", "mdQuote", "mdQuoteBorder",
  "mdHr", "mdListBullet",
  "toolDiffAdded", "toolDiffRemoved", "toolDiffContext",
  "syntaxComment", "syntaxKeyword", "syntaxFunction",
  "syntaxVariable", "syntaxString", "syntaxNumber",
  "syntaxType", "syntaxOperator", "syntaxPunctuation",
  "thinkingOff", "thinkingMinimal", "thinkingLow", "thinkingMedium",
  "thinkingHigh", "thinkingXhigh", "bashMode",
];
const OPTIONAL_COLOR_TOKENS = ["thinkingMax"];

// Vars that are allowed to be unreferenced by colors. These are the theme's
// canonical background variables (from the Tokyo Night palette spec); they are
// not consumed by the colors mapping but are mirrored in export.pageBg/cardBg.
const ALLOWED_UNREFERENCED_VARS = ["bg", "bgDark"];

const HEX_RE = /^#[0-9a-f]{6}$/;

// ---------------------------------------------------------------------------
// Validation helpers
// ---------------------------------------------------------------------------

function isValidColorValue(value) {
  // "" = terminal default, number = 256-color palette index (0-255)
  if (value === "") return true;
  if (Number.isInteger(value)) return value >= 0 && value <= 255;
  if (typeof value === "string") return HEX_RE.test(value);
  return false;
}

function validateThemeFile(file, theme, seenNames) {
  const errors = [];

  // 2. Root keys must be exactly $schema, name, vars, colors, export.
  const rootKeys = Object.keys(theme);
  for (const key of rootKeys) {
    if (!ROOT_KEYS.includes(key)) errors.push(`unknown root key "${key}"`);
  }
  for (const key of ROOT_KEYS) {
    if (!rootKeys.includes(key)) errors.push(`missing root key "${key}"`);
  }
  if (rootKeys.length !== ROOT_KEYS.length) {
    errors.push(`expected exactly these root keys: ${ROOT_KEYS.join(", ")}`);
  }

  // 3. name must be a non-empty string without "/".
  const { name } = theme;
  if (typeof name !== "string" || name.trim() === "") {
    errors.push('name must be a non-empty string');
  } else if (name.includes("/")) {
    errors.push(`name "${name}" must not contain "/"`);
  } else if (seenNames.has(name)) {
    errors.push(`duplicate theme name "${name}" (names must be unique across files)`);
  } else {
    seenNames.add(name);
  }

  const vars = theme.vars;
  const colors = theme.colors;
  const exportObj = theme.export;

  // 4. colors must contain exactly the required tokens (+ optional thinkingMax).
  if (typeof colors !== "object" || colors === null || Array.isArray(colors)) {
    errors.push("colors must be an object");
  } else {
    for (const token of REQUIRED_COLOR_TOKENS) {
      if (!(token in colors)) errors.push(`colors is missing required token "${token}"`);
    }
    for (const token of OPTIONAL_COLOR_TOKENS) {
      if (!(token in colors)) errors.push(`colors is missing optional token "${token}"`);
    }
    for (const key of Object.keys(colors)) {
      if (!REQUIRED_COLOR_TOKENS.includes(key) && !OPTIONAL_COLOR_TOKENS.includes(key)) {
        errors.push(`colors has extra token "${key}"`);
      }
    }
  }

  // 5. colors values must be "" or a vars key (or a valid literal color).
  if (typeof colors === "object" && colors !== null && !Array.isArray(colors)) {
    if (typeof vars !== "object" || vars === null || Array.isArray(vars)) {
      errors.push("vars must be an object");
    } else {
      for (const [token, value] of Object.entries(colors)) {
        if (typeof value === "string" && value !== "" && !(value in vars) && !HEX_RE.test(value)) {
          errors.push(
            `colors.${token} = ${JSON.stringify(value)} is not "" and not a key defined in vars`,
          );
        } else if (typeof value === "string" && value in vars) {
          // reference — fine
        } else if (!isValidColorValue(value)) {
          errors.push(`colors.${token} = ${JSON.stringify(value)} is not a valid color value`);
        }
      }
    }
  }

  // 6. Every vars key must be referenced by at least one colors entry
  //    (except ALLOWED_UNREFERENCED_VARS).
  if (typeof vars === "object" && vars !== null && !Array.isArray(vars)) {
    if (typeof colors === "object" && colors !== null && !Array.isArray(colors)) {
      const referenced = new Set(
        Object.values(colors).filter((v) => typeof v === "string" && v !== "" && !HEX_RE.test(v)),
      );
      for (const key of Object.keys(vars)) {
        if (!referenced.has(key) && !ALLOWED_UNREFERENCED_VARS.includes(key)) {
          errors.push(`vars.${key} is never referenced by colors (unused var)`);
        }
      }
    }

    // 7. Every var value must be "#rrggbb" (lowercase), int 0-255, or "".
    for (const [key, value] of Object.entries(vars)) {
      if (!isValidColorValue(value)) {
        errors.push(
          `vars.${key} = ${JSON.stringify(value)} must be "#rrggbb" (6-digit lowercase hex), an integer 0-255, or ""`,
        );
      }
    }
  }

  // 8. export must have exactly pageBg, cardBg, infoBg.
  if (typeof exportObj !== "object" || exportObj === null || Array.isArray(exportObj)) {
    errors.push("export must be an object");
  } else {
    const exportKeys = Object.keys(exportObj);
    for (const key of exportKeys) {
      if (!EXPORT_KEYS.includes(key)) errors.push(`export has extra key "${key}"`);
    }
    for (const key of EXPORT_KEYS) {
      if (!exportKeys.includes(key)) errors.push(`export is missing key "${key}"`);
    }
    if (exportKeys.length !== EXPORT_KEYS.length) {
      errors.push(`export must have exactly these keys: ${EXPORT_KEYS.join(", ")}`);
    }
    for (const [key, value] of Object.entries(exportObj)) {
      if (!isValidColorValue(value)) {
        errors.push(
          `export.${key} = ${JSON.stringify(value)} must be "#rrggbb" (6-digit lowercase hex), an integer 0-255, or ""`,
        );
      }
    }
  }

  return errors;
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

function main() {
  const themeFiles = readdirSync(THEMES_DIR)
    .filter((f) => f.endsWith(".json"))
    .sort();
  if (themeFiles.length === 0) {
    console.error(`No themes/*.json files found in ${THEMES_DIR}`);
    process.exit(1);
  }

  const seenNames = new Set();
  let failed = false;

  for (const file of themeFiles) {
    const path = join(THEMES_DIR, file);
    let theme;
    try {
      theme = JSON.parse(readFileSync(path, "utf8"));
    } catch (err) {
      failed = true;
      console.error(`✗ ${file}: JSON parse error: ${err.message}`);
      continue;
    }

    const errors = validateThemeFile(file, theme, seenNames);
    if (errors.length > 0) {
      failed = true;
      console.error(`✗ ${file}:`);
      for (const error of errors) {
        console.error(`    - ${error}`);
      }
    } else {
      console.log(`✓ ${file} (${theme.name})`);
    }
  }

  if (failed) {
    console.error("\nTheme validation failed.");
    process.exit(1);
  }
  console.log("\nAll themes valid");
}

main();
