import { spawnSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

export const EXPECTED_PROJECT_REF = 'jbkneqrbjuquvpxrufzu';
export const CLI_PACKAGE = 'supabase@3.1.0';

export const UNSAFE_ENV_KEYS = [
  'SUPABASE_DB_URL',
  'DATABASE_URL',
  'SUPABASE_ACCESS_TOKEN',
  'SUPABASE_DB_PASSWORD',
  'PGPASSWORD',
  'SUPABASE_PROJECT_REF',
  'SUPABASE_URL',
  'SUPABASE_YES',
  'SUPABASE_WORKDIR',
  'SUPABASE_HOME',
];

const SAFE_ENV_KEYS = [
  'PATH',
  'HOME',
  'USER',
  'SHELL',
  'LANG',
  'LC_ALL',
  'LC_CTYPE',
  'TERM',
  'TMPDIR',
  'XDG_CACHE_HOME',
  'XDG_CONFIG_HOME',
  'XDG_RUNTIME_DIR',
  'DBUS_SESSION_BUS_ADDRESS',
  'SSL_CERT_FILE',
  'SSL_CERT_DIR',
  'NODE_EXTRA_CA_CERTS',
  'HTTP_PROXY',
  'HTTPS_PROXY',
  'NO_PROXY',
];

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');

export function parseMode(argv) {
  if (argv.length !== 1) {
    throw new Error(
      'Usage: db-migrate (--dry-run | --apply). Exactly one mode is required.',
    );
  }

  const [mode] = argv;

  if (mode === '--dry-run' || mode === '--apply') {
    return mode === '--apply' ? 'apply' : 'dry-run';
  }

  throw new Error(
    `Unsupported argument "${mode}". Use --dry-run or --apply; database URLs, project refs and credential overrides are not accepted.`,
  );
}

export function validateProjectRefs({
  approvedRef,
  linkedRef,
  expectedRef = EXPECTED_PROJECT_REF,
}) {
  if (!approvedRef) {
    throw new Error(
      'harness.config.json does not define approvedSupabaseProjectRef.',
    );
  }

  if (!linkedRef) {
    throw new Error(
      'supabase/.temp/project-ref is missing. Link the approved project first.',
    );
  }

  if (approvedRef !== expectedRef) {
    throw new Error(
      `harness.config.json targets "${approvedRef}", but the approved project is "${expectedRef}".`,
    );
  }

  if (linkedRef !== expectedRef) {
    throw new Error(
      `The linked project is "${linkedRef}", but the approved project is "${expectedRef}".`,
    );
  }
}

export function assertNoUnsafeEnv(env = process.env) {
  const found = UNSAFE_ENV_KEYS.filter(
    (key) => typeof env[key] === 'string' && env[key].length > 0,
  );

  if (found.length > 0) {
    throw new Error(
      `Unsafe environment override(s): ${found.join(', ')}. The wrapper uses only the linked project.`,
    );
  }
}

export function buildSafeEnv(env = process.env) {
  const safe = {};

  for (const key of SAFE_ENV_KEYS) {
    if (typeof env[key] === 'string') {
      safe[key] = env[key];
    }
  }

  return safe;
}

export function buildCliInvocation(mode) {
  if (mode !== 'dry-run' && mode !== 'apply') {
    throw new Error(`Unsupported mode "${mode}".`);
  }

  return {
    command: 'npx',
    args: [
      '--yes',
      CLI_PACKAGE,
      'db',
      'push',
      '--remote',
      mode === 'apply' ? '--yes' : '--dry-run',
    ],
  };
}

export function redactSecrets(text, secretValues = []) {
  let output = String(text ?? '');

  for (const value of secretValues) {
    if (typeof value === 'string' && value.length >= 4) {
      output = output.split(value).join('[redacted]');
    }
  }

  return output.replace(/postgres(?:ql)?:\/\/[^\s"'`]+/gi, '[redacted-db-url]');
}

function readText(path) {
  try {
    return readFileSync(path, 'utf8').trim();
  } catch {
    return '';
  }
}

function readApprovedRef() {
  const raw = readText(join(ROOT, 'harness.config.json'));

  if (!raw) {
    return '';
  }

  try {
    const parsed = JSON.parse(raw);
    return typeof parsed.approvedSupabaseProjectRef === 'string'
      ? parsed.approvedSupabaseProjectRef.trim()
      : '';
  } catch {
    return '';
  }
}

function readLinkedRef() {
  return readText(join(ROOT, 'supabase', '.temp', 'project-ref'));
}

function writeSanitized(stream, text, secretValues) {
  const sanitized = redactSecrets(text, secretValues);

  if (sanitized.trim().length > 0) {
    stream.write(sanitized.endsWith('\n') ? sanitized : `${sanitized}\n`);
  }
}

function main(argv) {
  const mode = parseMode(argv);

  validateProjectRefs({
    approvedRef: readApprovedRef(),
    linkedRef: readLinkedRef(),
  });

  assertNoUnsafeEnv(process.env);

  const secretValues = UNSAFE_ENV_KEYS.map((key) => process.env[key]).filter(
    (value) => typeof value === 'string' && value.length > 0,
  );
  const invocation = buildCliInvocation(mode);

  console.error(
    `[db-migrate] ${mode === 'apply' ? 'Applying' : 'Previewing'} migrations for linked project ${EXPECTED_PROJECT_REF}.`,
  );

  const result = spawnSync(invocation.command, invocation.args, {
    cwd: ROOT,
    env: buildSafeEnv(process.env),
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
    timeout: 120_000,
  });

  writeSanitized(process.stdout, result.stdout, secretValues);
  writeSanitized(process.stderr, result.stderr, secretValues);

  if (result.error) {
    console.error(
      `[db-migrate] Could not start ${invocation.command}: ${result.error.message}`,
    );
    process.exitCode = 1;
    return;
  }

  if (result.status !== 0) {
    console.error(
      `[db-migrate] Supabase CLI exited with code ${result.status ?? 'unknown'}. No further action was taken.`,
    );
    process.exitCode = result.status ?? 1;
    return;
  }

  console.error(
    `[db-migrate] ${mode === 'apply' ? 'Apply operation completed.' : 'Dry run completed; no changes were applied.'}`,
  );
}

const invokedPath = process.argv[1] ? resolve(process.argv[1]) : '';
const isDirectRun = invokedPath === fileURLToPath(import.meta.url);

if (isDirectRun) {
  try {
    main(process.argv.slice(2));
  } catch (error) {
    console.error(
      `[db-migrate] ${error instanceof Error ? error.message : String(error)}`,
    );
    process.exitCode = 1;
  }
}
