// Each entry carries an optional `photo`; when empty the card falls back to
// a typographic treatment rather than a broken image or a stock substitute.

import type { IconName } from '@/components/Icons';

export type Interest = {
  id: string;
  label: string;
  icon: IconName;
  photo?: string;
  photoAlt?: string;
  note?: string;
  /** Larger card in the grid; used for the entries with the best photos. */
  feature?: boolean;
};

// `feature: true` marks entries shown in the Beyond Work carousel — currently
// the ones with real photographs, so the carousel never shows an empty card.
export const interests: Interest[] = [
  { id: 'tennis', label: 'Tennis', icon: 'tennis' },
  { id: 'table-tennis', label: 'Table tennis', icon: 'tableTennis' },
  {
    id: 'hiking',
    label: 'Hiking',
    icon: 'hiking',
    photo: '/images/beyond/hike1.jpeg',
    feature: true,
  },
  { id: 'sailing', label: 'Sailing', icon: 'sailing' },
  {
    id: 'windsurfing',
    label: 'Windsurfing',
    icon: 'windsurf',
    photo: '/images/beyond/Windsurfing.jpeg',
    feature: true,
  },
  {
    id: 'diving',
    label: 'Diving',
    icon: 'diving',
    photo: '/images/beyond/Scuba Diving.jpeg',
    feature: true,
  },
  { id: 'football', label: 'Football', icon: 'football' },
  {
    id: 'badminton',
    label: 'Badminton',
    icon: 'badminton',
    photo: '/images/beyond/Badminton.jpeg',
    feature: true,
  },
  {
    id: 'dragon-boat',
    label: 'Dragon boat racing',
    icon: 'dragonBoat',
    photo: '/images/beyond/cup_dragon boat race.jpeg',
    feature: true,
  },
];

export const beyondWorkLede =
  'Away from teaching and research — happiest on the court, by the water, or out on the trails, enjoying the outdoors, good company, and the easygoing moments in between.';
