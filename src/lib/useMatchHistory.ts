import { useEffect, useState } from 'react';
import { fetchMatchHistory } from '../data/matches';
import type { MatchRecord } from '../types';

export function useMatchHistory(username: string | undefined) {
  const [history, setHistory] = useState<MatchRecord[]>([]);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!username) {
      return;
    }

    let active = true;

    void (async () => {
      try {
        const rows = await fetchMatchHistory(username);

        if (active) {
          setHistory(rows);
          setError('');
        }
      } catch {
        if (active) {
          setError('The match history could not be loaded.');
        }
      }
    })();

    return () => {
      active = false;
    };
  }, [username]);

  return { history, error };
}
