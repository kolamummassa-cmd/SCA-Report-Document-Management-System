"use client";

import { ThemeProvider } from "./theme-provider";
import { QueryProvider } from "./query-client";
import { AuthProvider } from "./auth-context";

/** Single composition point for every client-side provider, kept out of
 * app/layout.tsx (a server component) so "use client" boundaries stay
 * contained to this file. */
export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <QueryProvider>
        <AuthProvider>{children}</AuthProvider>
      </QueryProvider>
    </ThemeProvider>
  );
}
