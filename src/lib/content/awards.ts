// Type only — safe to import from client components. The fs-reading
// fetcher lives in awards.server.ts.

export interface Award {
  id: string;
  name: string;
  organisation?: string;
  year?: string;
  note?: string;
}
