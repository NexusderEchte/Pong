import { tool } from "@opencode-ai/plugin";
import { readFile, readdir, stat } from "node:fs/promises";
import { dirname, resolve, join } from "node:path";
import { fileURLToPath } from "node:url";

export default tool({
  description: "Inspects the Pong project and reports its structure and configuration.",

  args: {},

  async execute() {
    try {
      const harnessRoot = resolve(
        dirname(fileURLToPath(import.meta.url)),
        "../..",
      );

      const configPath = join(harnessRoot, "harness.config.json");
      const config = JSON.parse(await readFile(configPath, "utf-8"));

      const projectPath = resolve(harnessRoot, config.targetProjectPath);
      const packageJson = JSON.parse(
        await readFile(join(projectPath, "package.json"), "utf-8"),
      );

      const entries = await readdir(projectPath);
      const directories = [];

      for (const entry of entries) {
        const entryPath = join(projectPath, entry);

        if (
          entry !== "node_modules" &&
          entry !== ".git" &&
          (await stat(entryPath)).isDirectory()
        ) {
          directories.push(entry);
        }
      }

      return JSON.stringify(
        {
          project: packageJson.name,
          path: projectPath,
          scripts: packageJson.scripts,
          directories,
        },
        null,
        2,
      );
    } catch (error) {
      return `Project inspection failed: ${
        error instanceof Error ? error.message : String(error)
      }`;
    }
  },
});