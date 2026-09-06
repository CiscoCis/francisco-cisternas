// Client-safe type for the rich-text block editor shared by every Forum
// content type that needs a full body (Conversations, Ask-the-Professor
// answers, Newsletter issues) — same shape as blog.ts's BlogBlock, kept as
// a separate type so the Forum's content types don't import from blog.ts.

export type Block =
  | { type: 'p'; text: string }
  | { type: 'h'; text: string }
  | { type: 'quote'; text: string }
  | { type: 'list'; items: string[] }
  | { type: 'image'; src: string; alt: string; caption?: string };
