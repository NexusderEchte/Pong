import { tool } from "@opencode-ai/plugin";
import { readFile } from "node:fs/promises";
import { dirname, resolve, join } from "node:path";
import { fileURLToPath } from "node:url";
import { execFile } from "node:child_process";

const CHECKS = ["typecheck", "lint", "test", "build"] as const;
const TIMEOUT = 120_000;
const MAX_OUTPUT = 8_000;

function runCheck(script: string, cwd: string): Promise<{
  name: string;
  status: "passed" | "failed";
  exitCode: number | null;
  output: string;
}> {
  return new Promise((resolveResult) => {
    execFile(
      "npm",
      ["run", script],
      {
        cwd,
        timeout: TIMEOUT,
        maxBuffer: 1024 * 1024,
        shell: process.platform === "win32",
        windowsHide: true,
      },
      (error, stdout, stderr) => {
        const output = `${stdout ?? ""}\n${stderr ?? ""}`.trim();

        resolveResult({
          name: script,
          status: error ? "failed" : "passed",
          exitCode:
            typeof error?.code === "number" ? error.code : error ? null : 0,
          output:
            output.length > MAX_OUTPUT
              ? output.slice(-MAX_OUTPUT)
              : output,
        });
      },
    );
  });
}

export default tool({
  description:
    "Runs the predefined Pong project checks: typecheck, lint, unit tests and production build. Returns structured results.",
  args: {},
  async execute() {
    try {
      const harnessRoot = resolve(
        dirname(fileURLToPath(import.meta.url)),
        "../..",
      );

      const configPath = join(harnessRoot, "harness.config.json");
      const config = JSON.parse(await readFile(configPath, "utf-8"));

      const projectPath = resolve(
        harnessRoot,
        config.targetProjectPath,
      );

      const packageJson = JSON.parse(
        await readFile(join(projectPath, "package.json"), "utf-8"),
      );

      const results = [];

      for (const script of CHECKS) {
        if (!packageJson.scripts?.[script]) {
          results.push({
            name: script,
            status: "failed",
            exitCode: null,
            output: `Missing npm script: ${script}`,
          });
          continue;
        }

        results.push(await runCheck(script, projectPath));
      }

      const failed = results.filter(
        (result) => result.status === "failed",
      ).length;

      return JSON.stringify(
        {
          project: packageJson.name,
          path: projectPath,
          overallStatus: failed === 0 ? "passed" : "failed",
          summary: {
            total: results.length,
            passed: results.length - failed,
            failed,
          },
          checks: results,
        },
        null,
        2,
      );
    } catch (error) {
      return JSON.stringify({
        overallStatus: "error",
        message:
          error instanceof Error ? error.message : String(error),
      });
    }
  },
});
