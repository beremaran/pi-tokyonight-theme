# pi-tokyonight-theme

Tokyo Night for [pi](https://github.com/earendil-works/pi) — four variants of the beloved Tokyo Night palette (night, storm, moon, day), forked from [folke/tokyonight.nvim](https://github.com/folke/tokyonight.nvim).

Screenshot coming soon.

## Installation

As a pi package (local folder — relative paths resolve against the settings file they appear in):

```
pi install ./pi-tokyonight-theme
```

Install from GitHub:

```
pi install git:github.com/beremaran/pi-tokyonight-theme
```

Manual alternative: copy the theme files into your global themes directory:

```
cp themes/*.json ~/.pi/agent/themes/
```

## Usage

- Pick a theme interactively via `/settings` → theme.
- Or set it in `~/.pi/agent/settings.json`:

  ```json
  { "theme": "tokyonight" }
  ```

- Or use the bundled extension command (the package ships a small extension that switches variants at runtime):

  ```
  /tokyonight storm
  ```

  Arguments: `night` | `storm` | `moon` | `day`. With no arguments it shows an interactive picker.

Themes hot-reload when edited — no restart needed.

## Variants

| Variant            | Theme name          | Background | Foreground |
| ------------------ | ------------------- | ---------- | ---------- |
| Night              | `tokyonight`        | `#1a1b26`  | `#c0caf5`  |
| Storm              | `tokyonight-storm`  | `#24283b`  | `#c0caf5`  |
| Moon               | `tokyonight-moon`   | `#222436`  | `#c8d3f5`  |
| Day (light)        | `tokyonight-day`    | `#e1e2e7`  | `#3760bf`  |

## Palette

The canonical Tokyo Night accent palette:

| Color    | Hex       |
| -------- | --------- |
| blue     | `#7aa2f7` |
| cyan     | `#7dcfff` |
| magenta  | `#bb9af7` |
| green    | `#9ece6a` |
| green1   | `#73daca` |
| yellow   | `#e0af68` |
| orange   | `#ff9e64` |
| red      | `#f7768e` |
| comment  | `#565f89` |
| fg       | `#c0caf5` |

## Development

Validate all theme files (JSON structure, required tokens, var references, hex values):

```
node scripts/validate.mjs
```

## Credits

Tokyo Night originally created by Folke Lemaitre ([folke/tokyonight.nvim](https://github.com/folke/tokyonight.nvim)), MIT licensed. This is an independent re-implementation for pi.

## License

MIT — see [LICENSE](LICENSE).
