/**
 * @description QueryClient central: 4xx nunca repete (exceto 429, que respeita o Retry-After).
 */
import { QueryClient } from "@tanstack/react-query";
import { isAxiosError } from "axios";

import { statusDoErro } from "@/api/mensagemErro";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60_000,
      gcTime: 5 * 60_000,
      refetchOnWindowFocus: false,
      retry: (failureCount, error) => {
        const status = statusDoErro(error);
        if (status === 429) return failureCount < 3;
        if (status && status >= 400 && status < 500) return false;
        return failureCount < 2;
      },
      retryDelay: (failureCount, error) => {
        if (isAxiosError(error)) {
          const retryAfter = Number(error.response?.headers?.["retry-after"]);
          if (Number.isFinite(retryAfter) && retryAfter > 0) return retryAfter * 1000;
        }
        return 1000 * 2 ** (failureCount + 1) + Math.random() * 1000;
      },
    },
  },
});
