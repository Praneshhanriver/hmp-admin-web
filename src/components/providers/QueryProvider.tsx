"use client";

import { useState } from "react";
import type { ReactNode } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { QUERY_RETRY_COUNT, QUERY_STALE_TIME_MS } from "@/constants/invitation";

interface QueryProviderProps {
  children: ReactNode;
}

// Gives every client component access to the TanStack Query cache.
// The client is created once per browser tab (useState), never shared between users on the server
export default function QueryProvider({ children }: QueryProviderProps) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: { retry: QUERY_RETRY_COUNT, staleTime: QUERY_STALE_TIME_MS, refetchOnWindowFocus: false },
          mutations: { retry: false }, // never send a create / revoke twice by itself
        },
      }),
  );

  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}
