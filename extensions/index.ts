import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";

const VARIANTS: Record<string, string> = {
  night: "tokyonight",
  storm: "tokyonight-storm",
  moon: "tokyonight-moon",
  day: "tokyonight-day",
};

export default function (pi: ExtensionAPI) {
  pi.registerCommand("tokyonight", {
    description: "Switch to a Tokyo Night theme variant (night | storm | moon | day)",
    handler: async (args: string | undefined, ctx: any) => {
      if (!args || args.trim() === "") {
        const choice = await ctx.ui.select("Tokyo Night variant:", ["night", "storm", "moon", "day"]);
        if (!choice) return;
        args = choice;
      }
      const variant = args.trim().toLowerCase();
      const themeName = VARIANTS[variant];
      if (!themeName) {
        ctx.ui.notify(`Unknown Tokyo Night variant "${args}". Use: night, storm, moon, day`, "error");
        return;
      }
      const result = ctx.ui.setTheme(themeName);
      if (result.success) {
        ctx.ui.notify(`Tokyo Night ${variant} activated`, "info");
      } else {
        ctx.ui.notify(`Could not activate Tokyo Night ${variant}: ${result.error ?? "theme not found"}`, "error");
      }
    },
  });
}
