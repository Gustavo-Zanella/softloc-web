'use client';

import { useMemo } from 'react';
import { useSession } from 'next-auth/react';
import { createApiClient } from './api-client';

export function useApi() {
  const { data: session } = useSession();
  const token = (session as any)?.accessToken ?? '';
  return useMemo(() => createApiClient(token), [token]);
}
