// Types and pure helpers only — safe to import from client components. The
// fs-reading fetcher lives in guestbook.server.ts.

export interface GuestbookMessage {
  id: string;
  displayName: string;
  programme?: string;
  graduationYear?: string;
  message: string;
  submittedAt?: string;
}

/** True once at least one message has actually been published. */
export function hasGuestbookMessages(items: GuestbookMessage[]): boolean {
  return items.length > 0;
}
