import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterEach, beforeEach } from 'vitest';
import { resetSupabaseMock } from './supabaseMock';

beforeEach(() => {
  window.localStorage.clear();
  window.history.replaceState(null, '', '/');
  resetSupabaseMock();
});

afterEach(() => {
  cleanup();
  window.localStorage.clear();
  window.history.replaceState(null, '', '/');
});
