import { describe, expect, it } from 'vitest';
import {
  CLI_PACKAGE,
  EXPECTED_PROJECT_REF,
  UNSAFE_ENV_KEYS,
  assertNoUnsafeEnv,
  buildCliInvocation,
  buildSafeEnv,
  parseMode,
  redactSecrets,
  validateProjectRefs,
} from './db-migrate.mjs';

describe('db-migrate argument parsing', () => {
  it('accepts exactly one supported mode', () => {
    expect(parseMode(['--dry-run'])).toBe('dry-run');
    expect(parseMode(['--apply'])).toBe('apply');
  });

  it.each([
    [],
    ['--db-url=postgresql://example'],
    ['--remote=other-project'],
    ['--password', 'secret'],
    ['--project-ref', 'other-project'],
    ['--include-all'],
    ['--dry-run', '--apply'],
    ['--yes'],
  ])('rejects unsafe arguments: %j', (argv) => {
    expect(() => parseMode(argv)).toThrow();
  });
});

describe('project ref validation', () => {
  it('accepts the approved ref in both files', () => {
    expect(() =>
      validateProjectRefs({
        approvedRef: EXPECTED_PROJECT_REF,
        linkedRef: EXPECTED_PROJECT_REF,
      }),
    ).not.toThrow();
  });

  it('rejects a different ref in harness.config.json', () => {
    expect(() =>
      validateProjectRefs({
        approvedRef: 'other-project',
        linkedRef: EXPECTED_PROJECT_REF,
      }),
    ).toThrow(/harness\.config\.json/);
  });

  it('rejects a different linked ref', () => {
    expect(() =>
      validateProjectRefs({
        approvedRef: EXPECTED_PROJECT_REF,
        linkedRef: 'other-project',
      }),
    ).toThrow(/linked project/);
  });

  it('rejects missing refs', () => {
    expect(() =>
      validateProjectRefs({
        approvedRef: '',
        linkedRef: EXPECTED_PROJECT_REF,
      }),
    ).toThrow();
    expect(() =>
      validateProjectRefs({
        approvedRef: EXPECTED_PROJECT_REF,
        linkedRef: '',
      }),
    ).toThrow();
  });
});

describe('unsafe environment overrides', () => {
  it('accepts a clean environment', () => {
    expect(() => assertNoUnsafeEnv({ PATH: '/usr/bin' })).not.toThrow();
  });

  it.each(UNSAFE_ENV_KEYS)('rejects %s', (key) => {
    expect(() => assertNoUnsafeEnv({ [key]: 'value' })).toThrow(
      new RegExp(key),
    );
  });

  it('passes only allow-listed variables to the CLI', () => {
    const env = buildSafeEnv({
      PATH: '/usr/bin',
      HOME: '/home/test',
      SUPABASE_DB_PASSWORD: 'secret',
      VITE_SUPABASE_PUBLISHABLE_KEY: 'public',
      E2E_SUPABASE_PASSWORD: 'secret',
    });

    expect(env).toEqual({ PATH: '/usr/bin', HOME: '/home/test' });
  });
});

describe('CLI invocation', () => {
  it('pins the CLI and uses only the linked project for a dry run', () => {
    const { command, args } = buildCliInvocation('dry-run');

    expect(command).toBe('npx');
    expect(CLI_PACKAGE).toBe('supabase@3.1.0');
    expect(args).toEqual([
      '--yes',
      CLI_PACKAGE,
      'db',
      'push',
      '--remote',
      '--dry-run',
    ]);
  });

  it('adds --yes only for an explicit apply', () => {
    const dryRun = buildCliInvocation('dry-run');
    const apply = buildCliInvocation('apply');

    expect(apply.args).toContain('--yes');
    expect(apply.args).not.toContain('--dry-run');
    expect(dryRun.args).not.toContain('--db-url');
    expect(dryRun.args.some((arg) => arg.includes('--remote='))).toBe(false);
  });
});

describe('secret redaction', () => {
  it('redacts database URLs', () => {
    expect(
      redactSecrets('postgresql://postgres:secret@host:6543/postgres'),
    ).toBe('[redacted-db-url]');
  });

  it('redacts supplied secret values', () => {
    expect(redactSecrets('token=secret-token', ['secret-token'])).toBe(
      'token=[redacted]',
    );
  });
});
