// Each entry pairs one photograph with a short piece of writing (not a plain
// gallery). `summary` shows on the card; `story` is the full text shown when
// it opens. `draft: true` hides an entry from production while still
// visible in `npm run dev`.

export type TeachingStory = {
  id: string;
  title: string;
  /** Free text: 'Singapore, 2024', 'MBA field trip', etc. Optional. */
  context?: string;
  /** Card blurb. One or two sentences. */
  summary: string;
  /** Full story, one string per paragraph. */
  story: string[];
  /** e.g. '/images/teaching-life/singapore.jpg' */
  photo?: string;
  photoAlt?: string;
  draft?: boolean;
};

export const teachingStories: TeachingStory[] = [
  {
    id: 'singapore-field-trip',
    title: 'Singapore field trip',
    context: 'MSc Marketing',
    summary: 'Went on a study trip to Singapore with the MSc Marketing students.',
    story: ['Went on a study trip to Singapore with the MSc Marketing students.'],
    photo: '/images/teaching-life/singapore.jpeg',
    photoAlt: 'Study trip to Singapore with the MSc Marketing students',
  },
];

const isProd = process.env.NODE_ENV === 'production';

export const visibleTeachingStories: TeachingStory[] = teachingStories.filter(
  (s) => !(isProd && s.draft)
);
