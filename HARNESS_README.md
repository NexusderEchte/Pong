# AI Development Harness

## 1. Overview

This repository contains an AI Development Harness built with OpenCode.

The harness is integrated directly into the Pong application repository. It provides agent instructions, project specifications and custom development tools for AI-assisted software development.

The main objectives are:

- Provide consistent instructions to the AI agent.
- Supply a written specification of the target software.
- Allow the agent to inspect the project.
- Allow the agent to execute predefined quality checks.
- Evaluate and select suitable AI models for software development.

## 2. Architecture

The harness and Pong application are maintained in a single Git repository.

### Repository Structure

```text
Pong/
├── .opencode/
│   ├── tools/
│   │   ├── check-project.ts
│   │   └── run-pong-checks.ts
│   ├── package.json
│   └── package-lock.json
│
├── src/
├── e2e/
├── AGENTS.md
├── PROJECT_SPEC.md
├── MODEL_SELECTION.md
├── HARNESS_README.md
├── harness.config.json
├── opencode.json
└── package.json
```

### Main Components

| Component           | Responsibility                                        |
| ------------------- | ----------------------------------------------------- |
| AGENTS.md           | Defines instructions and rules for the AI agent.      |
| PROJECT_SPEC.md     | Describes the requirements and functionality of Pong. |
| harness.config.json | Defines the target project path.                      |
| .opencode/tools/    | Contains custom tools implemented for the harness.    |
| MODEL_SELECTION.md  | Documents the evaluation and selection of AI models.  |
| opencode.json       | Connects the project to the agent instructions.       |

## 3. Requirements

The following software is required:

- Node.js 22 or later
- npm
- OpenCode CLI 1.18.31

The OpenCode version is fixed to ensure consistent behavior during development and evaluation.

## 4. Installation

Clone the repository:

```bash
git clone https://github.com/NexusderEchte/Pong.git
cd Pong
```

Install the Pong dependencies:

```bash
npm install
```

Install the OpenCode tool dependencies:

```bash
npm install --prefix .opencode
```

## 5. Configuration

The `harness.config.json` file defines the target project:

```json
{
  "targetProjectPath": "."
}
```

The path is relative to the harness root directory.

The `opencode.json` file loads the agent instructions:

```json
{
  "$schema": "https://opencode.ai/config.json",
  "instructions": ["AGENTS.md", "PROJECT_SPEC.md"]
}
```

## 6. Running the Harness

Open a terminal in the Pong repository:

```bash
cd ~/Desktop/Pong
```

Start OpenCode with the custom tool configuration:

```bash
OPENCODE_CONFIG_DIR="$(realpath .opencode)" opencode
```

OpenCode operates directly in the Pong repository and can access the project instructions and custom tools.

## 7. Agent Configuration

The harness uses the following configuration:

| Setting          | Value                       |
| ---------------- | --------------------------- |
| Base Agent       | build                       |
| Agent framework  | OpenCode                    |
| OpenCode version | 1.18.31                     |
| Plugin SDK       | @opencode-ai/plugin         |
| Selected model   | DeepSeek V4.1 Flash 1017    |
| Max steps        | 30 (`agent.build.maxSteps`) |

The `build` agent is used for implementation tasks.

The selected model and the reasoning behind its selection are documented in `MODEL_SELECTION.md`.

## 8. Custom Tools

The harness provides two custom OpenCode tools.

Both tools are implemented using the OpenCode Plugin SDK.

### 8.1 check-project

**Purpose:** Inspect the Pong project and provide the agent with information about its structure.

The tool:

1. Reads the harness configuration.
2. Resolves the project path.
3. Reads the project's `package.json`.
4. Extracts the project name and available npm scripts.
5. Lists relevant project directories.
6. Excludes `node_modules` and `.git`.

The tool returns:

- Project name
- Project path
- Available npm scripts
- Project directories

### 8.2 run-pong-checks

**Purpose:** Execute predefined verification commands in the Pong project.

The tool executes the following commands sequentially:

| Check      | Command             | Purpose                        |
| ---------- | ------------------- | ------------------------------ |
| Typecheck  | `npm run typecheck` | Checks TypeScript types.       |
| Lint       | `npm run lint`      | Detects code quality issues.   |
| Unit Tests | `npm run test`      | Executes the unit test suite.  |
| Build      | `npm run build`     | Verifies the production build. |

The tool:

1. Reads the configured project path.
2. Checks whether the required npm scripts exist.
3. Executes each check.
4. Collects the exit code and command output.
5. Returns structured JSON results.
6. Provides an overall status.

Possible overall statuses:

- `passed`: All checks completed successfully.
- `failed`: At least one check failed.
- `error`: The tool encountered an execution or configuration error.

The tool does not modify source code or automatically fix errors.

## 9. Model Selection

Three models were evaluated for the Pong implementation:

- NVIDIA Nemotron 3.5 Super VL Free
- Big Pickle
- DeepSeek V4.1 Flash 1017

The evaluation considered:

- Implementation quality
- Test results
- Execution time
- Token consumption
- API cost
- Licensing
- Data protection

DeepSeek V4.1 Flash 1017 was selected as the preferred model based on the observed implementation quality.

The complete comparison and selection rationale are documented in `MODEL_SELECTION.md`.

## 10. Limitations and Future Development

The current harness provides basic project inspection and verification capabilities.

The following limitations apply:

- The verification tool uses a predefined list of Pong npm scripts.
- The harness does not automatically repair failed checks.
- Verification commands run sequentially.
- Model evaluation was based on individual development runs rather than a controlled benchmark.

These limitations can be addressed in future development milestones.

## 11. M1 Deliverables

| Requirement                          | Implementation         |
| ------------------------------------ | ---------------------- |
| Base agent configuration             | OpenCode `build` agent |
| Custom tool implementation           | `check-project`        |
| Additional custom tool               | `run-pong-checks`      |
| Context file                         | `AGENTS.md`            |
| Software specification               | `PROJECT_SPEC.md`      |
| Installation and usage documentation | `HARNESS_README.md`    |
| Model selection comparison           | `MODEL_SELECTION.md`   |
| Target software                      | Pong application       |

The harness is demonstrated by starting OpenCode in the Pong repository, invoking its custom tools and showing the resulting project inspection and verification output.

## 12. Sandbox and Permissions (M2)

This section documents the M2 permission configuration for the pinned base agent.

### 12.1 Configuration and version

The configuration lives in `opencode.json` and uses the **V1 `permission` object** supported by OpenCode **1.18.31**.

It does **not** use V2 syntax such as `permissions`, `shell`, or `subagent`. Rules are evaluated in order, the **last matching rule wins**, and unmatched actions default to `ask`. The configuration was checked against the permission schema shipped with the pinned version (`@opencode-ai/core/v1/config/permission`) and loaded with `opencode debug config` without errors.

### 12.2 Isolation limitation

This is an **application-level permission configuration, not an OS-level sandbox**. No container, VM, or separate OS user is used. Allowed shell commands run with the host user's filesystem, process, and network authority.

The practical isolation is:

- the agent works inside the project directory;
- unknown actions require confirmation;
- risky actions are denied;
- `.env*` files are protected;
- Supabase work is restricted by policy to the approved project.

The shell allowlist and scanner are best-effort guardrails. They are not a security boundary against a malicious model or a deliberately obfuscated shell command. Confirmation prompts must be reviewed by the user.

### 12.3 Permission summary

| Effect                     | Rules                                                                                                                                                                                                                                                                                                                                                                                                                                    |
| -------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Allow without confirmation | Project read/edit except `.env*`, `opencode.json(c)`, and `harness.config.json`; `.env.example` read/edit; `glob`, `list`; `check-project`, `run-pong-checks`, `verify-pong-game`, `verify-supabase-backend`; `git status/diff/log/show`; `git branch` listing forms; `npm run typecheck`, `npm run lint`, `npm test`, `npm run test`, `npm run build`, `npm run format:check`, `npm run test:e2e`; `ls`, `pwd`; todo and question tools |
| Require confirmation       | `grep`; unknown shell commands; package installs/removals; external directories; `webfetch`/`websearch`; subagents; Supabase CLI commands other than the denied migration/link commands                                                                                                                                                                                                                                                  |
| Deny                       | All Git writes via a broad `git *` deny, then read-only exceptions; `rm`, `rmdir`, `dd`, `mkfs`, `shred`, `truncate`, `sudo`, `chmod -R`, `find -delete`, `find -exec`, `xargs rm`; `npm publish`, `npm unpublish`; `supabase db push/reset/pull`, `supabase link`; `printenv`, `env`, `set`, `export -p`; any shell command containing `.env`                                                                                           |

`grep` requires confirmation because V1 scopes the grep permission to the search expression, not the path. This is the only way to prevent a silent grep over `.env*` with the available V1 schema.

### 12.4 Environment files and secrets

- `.env.local` is Git-ignored.
- Agent `read` and `edit` are denied for `.env*`; `.env.example` is explicitly allowed.
- Shell commands containing `.env` are denied.
- Environment-printing commands (`printenv`, `env`, `set`, `export -p`) are denied.
- Never copy credentials into prompts, logs, or evidence files.
- Only the publishable client key is used by the application. No service-role or secret key is permitted.

### 12.5 Approved Supabase project

Supabase verification may target **only** the approved M2 development/test project:

```
jbkneqrbjuquvpxrufzu
```

The project ref is stored in `harness.config.json` as `approvedSupabaseProjectRef`. Any future `verify-supabase-backend` tool must read that value, use only the publishable key, and refuse production or unknown project refs. The shell permission rules deny remote migration and link commands, but the tool itself is responsible for validating the project ref.

### 12.6 Evidence status

The configuration is implemented and validated. A live demonstration of one allowed, one confirmation-required, and one denied action is still required for the M2 evidence package. The two domain-specific verification tools are implemented; their live executions and the native step-limit demonstration are separate M2 evidence items.

## 13. Stop Criterion (M2)

The M2 stop criterion is the native OpenCode agent step limit.

### 13.1 Configuration

`opencode.json` sets:

```json
"agent": {
  "build": {
    "maxSteps": 30
  }
}
```

OpenCode **1.18.31** is a V1 configuration line. The pinned V1 schema accepts `maxSteps` and normalizes it to `steps`; `opencode debug config` shows both `agent.build.maxSteps: 30` and `agent.build.steps: 30`.

The limit is **30 model steps**. This allows normal implementation and verification work while preventing unlimited agent execution. It is a step limit, not a custom verification-retry counter, and no custom orchestration layer is used. Start a new OpenCode session after changing this setting so the running agent picks it up.

### 13.2 Behaviour at the limit

On the final allowed step, OpenCode removes the tools and asks the model for a text-only summary. The run ends without further tool calls. If work remains unfinished, the agent must report that rather than attempting to bypass the limit.

### 13.3 How to demonstrate it

A controlled demonstration should use a lower limit for one run so the stop is reached quickly, while leaving the committed limit at 30:

1. Run a headless agent with a temporary V1 config override, for example:
   ```bash
   OPENCODE_CONFIG_CONTENT='{"agent":{"build":{"maxSteps":3}}}' \
     opencode run "Inspect the repository, run the checks, and summarize." --format json
   ```
2. Capture the session output and show that the run ends with a forced text-only summary and no further tool calls.
3. Restore/retain the committed `maxSteps: 30` and record the evidence in the M2 package.

The configuration is loaded and verified. **The stop has not yet been demonstrated live**, so enforcement must not be claimed as demonstrated until that run is recorded.
