// Client-safe types and pure helpers — the fs-reading fetcher lives in
// people.server.ts.

export interface ForumPerson {
  slug: string;
  name: string;
  photo?: string;
  role?: string;
  organisation?: string;
  location?: string;
  programme?: string;
  graduationYear?: string;
  intro?: string;
  expertiseTags: string[];
  canHelpWith: string[];
  interestedIn: string[];
  linkedinUrl?: string;
  featured?: boolean;
  draft?: boolean;
}

export function personBySlug(items: ForumPerson[], slug: string): ForumPerson | undefined {
  return items.find((p) => p.slug === slug);
}

export function personIndustries(items: ForumPerson[]): string[] {
  return Array.from(new Set(items.map((p) => p.organisation).filter((o): o is string => !!o))).sort();
}

export function personLocations(items: ForumPerson[]): string[] {
  return Array.from(new Set(items.map((p) => p.location).filter((l): l is string => !!l))).sort();
}

export function matchesPersonQuery(person: ForumPerson, query: string): boolean {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  const haystack = [
    person.name,
    person.role,
    person.organisation,
    person.location,
    person.programme,
    ...person.expertiseTags,
    ...person.canHelpWith,
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();
  return haystack.includes(q);
}
