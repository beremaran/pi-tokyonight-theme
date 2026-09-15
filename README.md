# pi-tokyonight-theme

Four [Pi](https://pi.dev) themes based on Tokyo Night—night, storm, moon, and day—plus a `/tokyonight` command for switching variants. The palette is based on [tokyonight.nvim](https://github.com/folke/tokyonight.nvim).

This is a Pi package, not an OpenCode plugin.

## Requirements

- Pi with package, theme, and extension support. This package was validated with Pi 0.85.1; it does not declare a separate minimum version.
- An interactive Pi session to use `/tokyonight` or `/settings`.

Pi loads the bundled TypeScript extension directly. The package has no runtime dependencies or build step.

## Installation

Install for your user settings with the repository's Git source:

```sh
pi install git:github.com/beremaran/pi-tokyonight-theme
```

Install for the current project instead:

```sh
pi install -l git:github.com/beremaran/pi-tokyonight-theme
```

To load a local checkout without copying its files, pass its path to `pi install`:

```sh
git clone https://github.com/beremaran/pi-tokyonight-theme.git
pi install /path/to/pi-tokyonight-theme
```

Use `-l` with the local path for a project-local install. Pi records the source in the `packages` array in user settings (`~/.pi/agent/settings.json`) or project settings (`.pi/settings.json`).

## Configuration and usage

Select a theme interactively with `/settings` → `theme`, or set one in `settings.json`:

```json
{ "theme": "tokyonight" }
```

Available theme names are `tokyonight`, `tokyonight-storm`, `tokyonight-moon`, and `tokyonight-day`.

The package also provides:

```text
/tokyonight
/tokyonight night
/tokyonight storm
/tokyonight moon
/tokyonight day
```

With no argument, `/tokyonight` opens a picker. A selected variant applies immediately and updates Pi's saved theme setting. Pi hot-reloads edits to active custom theme files; changes to a package checkout or to `extensions/index.ts` may require `/reload` or a restart.

## Package contents

The `package.json` Pi manifest loads the package's `./extensions` directory and `./themes` directory:

```json
{
  "pi": {
    "extensions": ["./extensions"],
    "themes": ["./themes"]
  }
}
```

## Variants

| Variant | Theme name | Background | Foreground |
| --- | --- | --- | --- |
| Night | `tokyonight` | `#1a1b26` | `#c0caf5` |
| Storm | `tokyonight-storm` | `#24283b` | `#c0caf5` |
| Moon | `tokyonight-moon` | `#222436` | `#c8d3f5` |
| Day | `tokyonight-day` | `#e1e2e7` | `#3760bf` |

## Limitations

- The themes and `/tokyonight` command are Pi-specific; this package does not provide an OpenCode entrypoint.
- The command is useful in interactive TUI sessions. Non-interactive runs do not have the picker UI.
- The package contains four static theme files and one small extension; it does not change Pi's models, providers, or tools.

## Development

Run the validator from the repository root:

```sh
node scripts/validate.mjs
```

It checks every theme for valid JSON, the Pi theme structure, required tokens, variable references, color values, and unique names. No dependency installation, compilation, formatter, linter, typecheck, test suite, or build command is configured in this repository.

For Pi package behavior, see the [Pi package documentation](https://pi.dev/docs/latest/packages), [theme documentation](https://pi.dev/docs/latest/themes), and [extension documentation](https://pi.dev/docs/latest/extensions).

## Credits

Tokyo Night was created by Folke Lemaitre ([folke/tokyonight.nvim](https://github.com/folke/tokyonight.nvim)) and is MIT licensed. This repository is an independent re-implementation for Pi.

## License

MIT — see [LICENSE](LICENSE).
