// External features shown as linked cards to the original article. An item
// with a `url` renders normally; one without renders only in local dev with
// a "link needed" badge and is dropped from the production build, so the
// deployed site never shows a card that goes nowhere.

export type MediaCategory =
  | 'Profile'
  | 'Career story'
  | 'Research feature'
  | 'Interview'
  | 'Alumni profile';

export type MediaItem = {
  id: string;
  title: string;
  source: string;
  date: string;
  category: MediaCategory;
  description: string;
  url: string;
  /** e.g. 'English', 'Spanish', 'Chinese'. Shown only when not English. */
  language?: string;
};

export const mediaItems: MediaItem[] = [
  {
    id: 'copper-to-data-mining',
    title: 'A Journey of Exploration from Copper to Data Mining',
    source: 'CUHK Business School',
    date: '',
    category: 'Career story',
    description:
      'A profile tracing the path from engineering and mining in Chile to research in marketing analytics.',
    url: 'https://www.bschool.cuhk.edu.hk/featured-stories/a-journey-of-exploration-from-copper-to-data-mining/',
  },
  {
    id: 'former-students-for-the-world',
    title: 'Our Former Students for the World: Francisco Cisternas',
    source: 'University of Chile',
    date: '',
    category: 'Alumni profile',
    description:
      'An alumni profile from the University of Chile covering the years before Hong Kong.',
    url: 'https://www.dii.uchile.cl/2019/09/09/nuestros-ex-alumnos-por-el-mundo-francisco-cisternas-profesor-de-la-chinese-university-of-hong-kong/',
    language: 'Spanish',
  },
  {
    id: 'eat-green-sustainable-future',
    title: 'Are you ready to eat green for a sustainable future?',
    source: 'China Business Knowledge',
    date: '',
    category: 'Research feature',
    description:
      'A feature on research into sustainable food choices and what moves consumers towards them.',
    url: 'https://cbk.bschool.cuhk.edu.hk/are-you-ready-to-eat-green-for-a-sustainable-future/',
  },
];
