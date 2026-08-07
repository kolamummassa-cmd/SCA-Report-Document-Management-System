/**
 * Holds the current short-lived access token in memory only (never
 * localStorage) — the refresh token is an httpOnly cookie the browser
 * manages on its own, and the access token itself should evaporate on a
 * full page reload rather than persist somewhere an XSS payload could
 * read it. A module-level singleton (rather than only React context) so
 * the API client can read/write it from outside the component tree
 * (e.g. inside a TanStack Query `queryFn`).
 */
let accessToken: string | null = null;
type Listener = (token: string | null) => void;
const listeners = new Set<Listener>();

export const tokenStore = {
  get(): string | null {
    return accessToken;
  },
  set(token: string | null) {
    accessToken = token;
    listeners.forEach((listener) => listener(token));
  },
  subscribe(listener: Listener): () => void {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },
};
