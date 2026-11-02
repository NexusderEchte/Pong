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

| Component | Responsibility |
|---|---|
| AGENTS.md | Defines instructions and rules for the AI agent. |
| PROJECT_SPEC.md | Describes the requirements and functionality of Pong. |
| harness.config.json | Defines the target project path. |
| .opencode/tools/ | Contains custom tools implemented for the harness. |
| MODEL_SELECTION.md | Documents the evaluation and selection of AI models. |
| opencode.json | Connects the project to the agent instructions. |

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
  "instructions": [
    "AGENTS.md",
    "PROJECT_SPEC.md"
  ]
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

| Setting | Value |
|---|---|
| Base Agent | build |
| Agent framework | OpenCode |
| OpenCode version | 1.18.31 |
| Plugin SDK | @opencode-ai/plugin |
| Selected model | DeepSeek V4.1 Flash 1017 |

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

| Check | Command | Purpose |
|---|---|---|
| Typecheck | `npm run typecheck` | Checks TypeScript types. |
| Lint | `npm run lint` | Detects code quality issues. |
| Unit Tests | `npm run test` | Executes the unit test suite. |
| Build | `npm run build` | Verifies the production build. |

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

| Requirement | Implementation |
|---|---|
| Base agent configuration | OpenCode `build` agent |
| Custom tool implementation | `check-project` |
| Additional custom tool | `run-pong-checks` |
| Context file | `AGENTS.md` |
| Software specification | `PROJECT_SPEC.md` |
| Installation and usage documentation | `HARNESS_README.md` |
| Model selection comparison | `MODEL_SELECTION.md` |
| Target software | Pong application |

The harness is demonstrated by starting OpenCode in the Pong repository, invoking its custom tools and showing the resulting project inspection and verification output.
