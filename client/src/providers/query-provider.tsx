"use client";

import {
  QueryClient,
  QueryClientProvider,
  MutationCache,
} from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { useState } from "react";
import axios, { AxiosError } from "axios";
import { APIError } from "@/types";
import { toast } from "sonner";

export function QueryProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000,
            refetchOnWindowFocus: false,
            retry: (failureCount, error) => {
              if (axios.isAxiosError(error) && error.response?.status === 401) {
                return false;
              }
              return failureCount < 3;
            },
          },
        },
        mutationCache: new MutationCache({
          onError: (error, variables, context, mutation) => {
            // Type the error explicitly using AxiosError<APIError>
            const axiosError = error as AxiosError<APIError>;
            console.log("test: ", axiosError);
            const errorData = axiosError.response?.data;
            const status = axiosError.response?.status;

            console.log("errordata: ", axiosError.response);

            // 1. Skip global toasts for validation errors (422)
            // since local components handle them via form field mapping.
            if (status === 422) {
              return;
            }

            // 2. Handle global errors (401 Unauthorized, 409 Conflict, 500 Internal, etc.)
            const message =
              errorData?.message || "An unexpected error occurred.";
            const errorCode = errorData?.error_code || "UNKNOWN_ERROR";

            toast.error(`Error: ${message} (Code: ${errorCode})`);

            // Trigger your global UI notification here (e.g., toast, modal)
            // toast.error(message);

            // Example: Force logout globally if unauthorized
            if (status === 401) {
              // router.push("/login");
            }
          },
        }),
      }),
  );

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}
