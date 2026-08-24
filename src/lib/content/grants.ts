// Types only — safe to import from client components. The fs-reading
// fetcher lives in grants.server.ts.

export interface Grant {
  id: string;
  title: string;
  agency: string;
  reference?: string;
  amount?: string;
  period?: string;
  role?: string;
}
