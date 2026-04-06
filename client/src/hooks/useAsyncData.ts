import { useState, useEffect, useCallback } from 'react';
import type React from 'react';

function useAsyncData<T>(
  fetcher: () => Promise<T>,
  deps: React.DependencyList
): { data: T | null; loading: boolean; error: string | null; refetch: () => void } {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(
    () => {
      setLoading(true);
      setError(null);
      fetcher()
        .then(setData)
        .catch((e) => setError(e instanceof Error ? e.message : 'An error occurred'))
        .finally(() => setLoading(false));
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    deps
  );

  useEffect(() => {
    refetch();
  }, [refetch]);

  return { data, loading, error, refetch };
}

export default useAsyncData;
