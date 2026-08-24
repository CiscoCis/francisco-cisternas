// Type only — safe to import from client components. The fs-reading
// fetcher lives in teachingStories.server.ts.

export type TeachingStory = {
  id: string;
  title: string;
  context?: string;
  summary: string;
  story: string[];
  photo?: string;
  photoAlt?: string;
  draft?: boolean;
};
