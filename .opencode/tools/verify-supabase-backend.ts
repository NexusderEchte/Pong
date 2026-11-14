import { tool } from '@opencode-ai/plugin';
import { createClient } from '@supabase/supabase-js';
import { randomInt } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const PROJECT_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const REQUIRED_PROJECT_REF = 'jbkneqrbjuquvpxrufzu';

const CLIENT_OPTIONS = {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
    detectSessionInUrl: false,
  },
};

interface CheckResult {
  id: string;
  status: 'passed' | 'failed';
  message: string;
  expected?: unknown;
  actual?: unknown;
}

interface ProfileRow {
  id: string;
  username: string;
}

interface GameRow {
  id: string;
  username: string;
  score: number;
}

interface TestRecordInfo {
  id: string;
  marker: number;
  cleanedUp: boolean;
}

interface Report {
  ok: boolean;
  projectRef: string | null;
  checks: CheckResult[];
  testRecord?: TestRecordInfo;
  unresolved?: string;
}

function checkResult(
  id: string,
  status: 'passed' | 'failed',
  message: string,
  expected?: unknown,
  actual?: unknown,
): CheckResult {
  return {
    id,
    status,
    message,
    ...(expected === undefined ? {} : { expected }),
    ...(actual === undefined ? {} : { actual }),
  };
}

function pass(
  id: string,
  message: string,
  expected?: unknown,
  actual?: unknown,
): CheckResult {
  return checkResult(id, 'passed', message, expected, actual);
}

function fail(
  id: string,
  message: string,
  expected?: unknown,
  actual?: unknown,
): CheckResult {
  return checkResult(id, 'failed', message, expected, actual);
}

function buildReport(
  checks: CheckResult[],
  projectRef: string | null,
  testRecord?: TestRecordInfo,
  unresolved?: string,
): Report {
  return {
    ok:
      checks.every((result) => result.status === 'passed') &&
      unresolved === undefined,
    projectRef,
    checks,
    ...(testRecord ? { testRecord } : {}),
    ...(unresolved ? { unresolved } : {}),
  };
}

async function readDotEnv(): Promise<Record<string, string>> {
  try {
    const text = await readFile(join(PROJECT_ROOT, '.env.local'), 'utf8');
    const values: Record<string, string> = {};

    for (const line of text.split(/\r?\n/)) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) {
        continue;
      }

      const separator = trimmed.indexOf('=');
      if (separator <= 0) {
        continue;
      }

      const key = trimmed.slice(0, separator).trim();
      let value = trimmed.slice(separator + 1).trim();

      if (
        (value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))
      ) {
        value = value.slice(1, -1);
      }

      values[key] = value;
    }

    return values;
  } catch {
    return {};
  }
}

async function readApprovedProjectRef(): Promise<string> {
  try {
    const raw = await readFile(
      join(PROJECT_ROOT, 'harness.config.json'),
      'utf8',
    );
    const config = JSON.parse(raw) as {
      approvedSupabaseProjectRef?: unknown;
    };

    return typeof config.approvedSupabaseProjectRef === 'string'
      ? config.approvedSupabaseProjectRef.trim()
      : '';
  } catch {
    return '';
  }
}

function projectRefFromUrl(value: string): string | null {
  try {
    const hostname = new URL(value).hostname;
    const suffix = '.supabase.co';

    if (!hostname.endsWith(suffix)) {
      return null;
    }

    return hostname.slice(0, -suffix.length);
  } catch {
    return null;
  }
}

function isForbiddenKey(value: string): boolean {
  if (value.startsWith('sb_secret_') || value.includes('service_role')) {
    return true;
  }

  const parts = value.split('.');
  if (parts.length !== 3) {
    return false;
  }

  try {
    const payload = JSON.parse(
      Buffer.from(parts[1], 'base64url').toString('utf8'),
    ) as { role?: unknown };

    return payload.role === 'service_role';
  } catch {
    return false;
  }
}

function isRlsDenial(error: unknown): boolean {
  if (typeof error !== 'object' || error === null) {
    return false;
  }

  const code = 'code' in error ? (error as { code?: unknown }).code : undefined;
  const message =
    'message' in error ? (error as { message?: unknown }).message : undefined;

  return (
    code === '42501' ||
    (typeof message === 'string' &&
      /row-level security|permission denied/i.test(message))
  );
}

function makeMarker(): number {
  return -(2_000_000_000 + randomInt(0, 100_000_000));
}

export async function runVerifySupabaseBackend(): Promise<Report> {
  const checks: CheckResult[] = [];
  const fileEnv = await readDotEnv();
  const url = (
    process.env.VITE_SUPABASE_URL ??
    fileEnv.VITE_SUPABASE_URL ??
    ''
  ).trim();
  const key = (
    process.env.VITE_SUPABASE_PUBLISHABLE_KEY ??
    fileEnv.VITE_SUPABASE_PUBLISHABLE_KEY ??
    ''
  ).trim();
  const approved = await readApprovedProjectRef();
  const configuredRef = projectRefFromUrl(url);
  const keyIsForbidden = key.length > 0 && isForbiddenKey(key);
  const projectOk =
    approved === REQUIRED_PROJECT_REF &&
    configuredRef === REQUIRED_PROJECT_REF &&
    key.length > 0 &&
    !keyIsForbidden;

  checks.push(
    projectOk
      ? pass(
          'project-config',
          `Configured project matches ${REQUIRED_PROJECT_REF}.`,
          REQUIRED_PROJECT_REF,
          approved,
        )
      : fail(
          'project-config',
          'Refusing to run against an unapproved or unverifiable Supabase project. Use only the approved project and publishable key.',
          { required: REQUIRED_PROJECT_REF },
          {
            approved: approved || null,
            urlRef: configuredRef,
            keyPresent: key.length > 0,
            keyType: keyIsForbidden ? 'forbidden' : 'publishable-or-anon',
          },
        ),
  );

  if (!projectOk) {
    return buildReport(
      checks,
      configuredRef ?? (approved || null),
      undefined,
      'Project configuration prerequisite failed; no network request was made.',
    );
  }

  const email = (
    process.env.E2E_SUPABASE_EMAIL ??
    fileEnv.E2E_SUPABASE_EMAIL ??
    ''
  ).trim();
  const password =
    process.env.E2E_SUPABASE_PASSWORD ?? fileEnv.E2E_SUPABASE_PASSWORD ?? '';

  if (!email || !password) {
    checks.push(
      fail(
        'test-credentials',
        'E2E_SUPABASE_EMAIL and E2E_SUPABASE_PASSWORD are not configured. Live execution is pending.',
      ),
    );

    return buildReport(
      checks,
      configuredRef,
      undefined,
      'Live execution pending: test account credentials are not configured.',
    );
  }

  checks.push(
    pass('test-credentials', 'Test account credentials are configured.'),
  );

  const client = createClient(url, key, CLIENT_OPTIONS);
  const anon = createClient(url, key, CLIENT_OPTIONS);
  const state = {
    testRecordId: null as string | null,
    username: '',
    marker: makeMarker(),
  };
  let testRecord: TestRecordInfo | undefined;
  let unresolved: string | undefined;

  try {
    const signIn = await client.auth.signInWithPassword({ email, password });

    if (signIn.error || !signIn.data.user || !signIn.data.session) {
      checks.push(
        fail(
          'test-account-sign-in',
          'Test account sign-in failed. Check E2E_SUPABASE_EMAIL/E2E_SUPABASE_PASSWORD and email confirmation status.',
        ),
      );

      return buildReport(
        checks,
        configuredRef,
        undefined,
        'Sign-in prerequisite failed; no profile or game checks were attempted.',
      );
    }

    checks.push(pass('test-account-sign-in', 'Test account signed in.'));

    const profileResult = await client
      .from('users')
      .select('id, username')
      .eq('id', signIn.data.user.id)
      .maybeSingle();
    const profile = profileResult.data as ProfileRow | null;

    if (
      profileResult.error ||
      !profile ||
      profile.username.trim().length === 0
    ) {
      checks.push(
        fail(
          'test-user-profile',
          'The test account has no corresponding public.users profile. Create it through the application before running this tool; the tool does not create or modify accounts.',
        ),
      );

      return buildReport(
        checks,
        configuredRef,
        undefined,
        'Profile prerequisite failed; no game checks were attempted.',
      );
    }

    state.username = profile.username;
    checks.push(pass('test-user-profile', 'Found the test account profile.'));

    const readResult = await client.from('games').select('id').limit(1);

    if (readResult.error) {
      checks.push(
        fail(
          'authenticated-read-games',
          'The authenticated test user cannot read public.games. Check the SELECT RLS policy.',
        ),
      );

      return buildReport(
        checks,
        configuredRef,
        undefined,
        'Authenticated read prerequisite failed; no test record was created.',
      );
    }

    checks.push(
      pass(
        'authenticated-read-games',
        'The authenticated test user can read public.games.',
        'read succeeds',
        `${readResult.data?.length ?? 0} row(s) sampled`,
      ),
    );

    const insertResult = await client
      .from('games')
      .insert({ username: state.username, score: state.marker })
      .select('id, username, score')
      .single();
    const inserted = insertResult.data as GameRow | null;

    if (insertResult.error || !inserted) {
      checks.push(
        fail(
          'insert-own-game',
          'The test user could not insert a game with their own username. Check the INSERT RLS policy.',
        ),
      );

      return buildReport(
        checks,
        configuredRef,
        undefined,
        'Test record was not created; no cleanup was required.',
      );
    }

    state.testRecordId = inserted.id;
    checks.push(
      pass(
        'insert-own-game',
        `Inserted test record ${inserted.id} using the test user's username.`,
      ),
    );

    const ownRead = await client
      .from('games')
      .select('id')
      .eq('id', state.testRecordId);
    const ownVisible =
      !ownRead.error &&
      (ownRead.data as Array<{ id: string }> | null)?.some(
        (row) => row.id === state.testRecordId,
      );

    checks.push(
      ownVisible
        ? pass(
            'read-own-test-record',
            'The test record is visible to the authenticated test user.',
          )
        : fail(
            'read-own-test-record',
            'The test record could not be read back by the authenticated test user.',
          ),
    );

    const [anonById, anonAll] = await Promise.all([
      anon.from('games').select('id').eq('id', state.testRecordId),
      anon.from('games').select('id').limit(1),
    ]);
    const anonByIdRows = (anonById.data as Array<{ id: string }> | null) ?? [];
    const anonAllRows = (anonAll.data as Array<{ id: string }> | null) ?? [];
    const anonUnexpectedError =
      (anonById.error && !isRlsDenial(anonById.error)) ||
      (anonAll.error && !isRlsDenial(anonAll.error));
    const anonLeaked =
      (!anonById.error && anonByIdRows.length > 0) ||
      (!anonAll.error && anonAllRows.length > 0);

    checks.push(
      anonUnexpectedError
        ? fail(
            'anonymous-read-denied',
            'The anonymous read check could not be completed due to an unexpected error; RLS denial was not confirmed.',
          )
        : anonLeaked
          ? fail(
              'anonymous-read-denied',
              'An anonymous client could read public.games. RLS is too permissive.',
              'no rows',
              'row(s) visible',
            )
          : pass(
              'anonymous-read-denied',
              anonById.error || anonAll.error
                ? 'Anonymous read was rejected.'
                : 'Anonymous read returned no rows.',
              'no rows',
              anonById.error || anonAll.error ? 'rejected' : '0 rows',
            ),
    );
    const foreignUsername = `__verify_supabase_${Math.abs(state.marker)}`;
    const foreignInsert = await client
      .from('games')
      .insert({ username: foreignUsername, score: state.marker })
      .select('id')
      .maybeSingle();
    let foreignRecordId =
      (foreignInsert.data as { id: string } | null)?.id ?? null;

    if (foreignInsert.error) {
      checks.push(
        isRlsDenial(foreignInsert.error)
          ? pass(
              'foreign-username-insert-denied',
              'RLS rejected an insert using another username.',
              'insert rejected',
              'insert rejected',
            )
          : fail(
              'foreign-username-insert-denied',
              'The foreign-username insert failed for an unexpected reason; RLS denial was not confirmed.',
            ),
      );
    } else {
      if (!foreignRecordId) {
        const lookup = await client
          .from('games')
          .select('id')
          .eq('username', foreignUsername)
          .eq('score', state.marker)
          .maybeSingle();
        foreignRecordId = (lookup.data as { id: string } | null)?.id ?? null;
      }

      checks.push(
        fail(
          'foreign-username-insert-denied',
          'RLS allowed an insert using another username.',
          'insert rejected',
          foreignRecordId
            ? `row ${foreignRecordId} created`
            : 'insert succeeded',
        ),
      );

      if (foreignRecordId) {
        const id = foreignRecordId;

        try {
          const cleanup = await client.from('games').delete().eq('id', id);

          checks.push(
            cleanup.error
              ? fail(
                  'foreign-record-cleanup',
                  `Manual cleanup required for game record ${id}.`,
                )
              : pass(
                  'foreign-record-cleanup',
                  `Removed unexpected record ${id}.`,
                ),
          );
        } catch {
          checks.push(
            fail(
              'foreign-record-cleanup',
              `Manual cleanup required for game record ${id}.`,
            ),
          );
        }
      }
    }
  } catch {
    checks.push(
      fail(
        'unexpected-error',
        'The verification stopped due to an unexpected error. No secret values are included.',
      ),
    );
  } finally {
    if (state.testRecordId) {
      const id = state.testRecordId;

      try {
        const cleanup = await client
          .from('games')
          .delete()
          .eq('id', id)
          .eq('username', state.username);
        const verify = await client.from('games').select('id').eq('id', id);
        const cleaned =
          !cleanup.error &&
          !verify.error &&
          (verify.data as Array<{ id: string }> | null)?.length === 0;

        checks.push(
          cleaned
            ? pass('cleanup-test-record', `Deleted test record ${id}.`)
            : fail(
                'cleanup-test-record',
                `Cleanup failed. Manually delete game record ${id}.`,
              ),
        );

        testRecord = { id, marker: state.marker, cleanedUp: cleaned };
        if (!cleaned) {
          unresolved = `Manual cleanup required for game record ${id}.`;
        }
      } catch {
        checks.push(
          fail(
            'cleanup-test-record',
            `Cleanup failed. Manually delete game record ${id}.`,
          ),
        );
        testRecord = { id, marker: state.marker, cleanedUp: false };
        unresolved = `Manual cleanup required for game record ${id}.`;
      }
    }
  }

  return buildReport(checks, configuredRef, testRecord, unresolved);
}

export default tool({
  description:
    'Verifies the approved Supabase project, public.games RLS and game ownership using a dedicated test account. Requires E2E_SUPABASE_EMAIL/E2E_SUPABASE_PASSWORD. Returns structured JSON.',
  args: {},
  async execute() {
    return JSON.stringify(await runVerifySupabaseBackend(), null, 2);
  },
});
