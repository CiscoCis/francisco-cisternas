// `detail` carries the CV's term/duration wording verbatim; no dates invented.

import type { IconName } from '@/components/Icons';

export interface ServiceItem {
  role: string;
  detail?: string;
}

export interface ServiceGroup {
  id: string;
  label: string;
  icon: IconName;
  items: ServiceItem[];
  /** Optional secondary block rendered beneath the main list. */
  subGroups?: { label: string; items: ServiceItem[] }[];
}

export const serviceGroups: ServiceGroup[] = [
  {
    id: 'department',
    label: 'Department',
    icon: 'building',
    items: [
      {
        role: 'Department Executive Committee',
        detail: 'Elected member — two terms of two years',
      },
      { role: 'Faculty Recruitment Committee' },
      { role: 'Center for Consumer Insights', detail: 'Board member' },
      { role: 'PhD Students Committee at the Department of Marketing' },
      { role: 'Summer Workshop' },
      {
        role: 'Designer of new Qualifying Exam for quantitative marketing students',
      },
      {
        role: 'Coordinator for additional lectures for PhD students in preparation for Qualifying Exam',
      },
      { role: 'Department Library Committee' },
      { role: 'Masters Students graduation ceremony' },
    ],
  },
  {
    id: 'faculty',
    label: 'Faculty',
    icon: 'users',
    items: [
      {
        role: 'Committee Member on Integrated BBA Programme',
        detail: 'Two terms of one year each',
      },
      {
        role: 'Board of the Faculty of Business Administration',
        detail: 'Elected member — two terms',
      },
      {
        role: 'New Programme on Business Data Analytics',
        detail: 'Task force member — volunteered',
      },
    ],
  },
  {
    id: 'college-university',
    label: 'College & University',
    icon: 'bank',
    items: [
      {
        role: 'Develop a new qualifying exam for quantitative marketing students',
      },
      { role: 'Participant in graduation ceremony' },
      {
        role: 'Student Exchange Committee member',
        detail: 'Three terms of two years each',
      },
      { role: 'College Student Advisor Scheme' },
    ],
    subGroups: [
      {
        label: 'University',
        items: [
          {
            role: 'Leading Exchange programme between CUHK and Universities in Chile',
          },
        ],
      },
    ],
  },
  {
    id: 'external',
    label: 'External',
    icon: 'globe',
    items: [
      { role: 'Management Science', detail: 'Ad-hoc Reviewer' },
      { role: 'Information Systems Research', detail: 'Ad-hoc Reviewer' },
      { role: 'Frontiers', detail: 'Ad-hoc Reviewer' },
      {
        role: 'Australia and New Zealand Marketing Academy conference',
        detail: 'Ad-hoc Reviewer',
      },
      { role: 'SN Business & Economics', detail: 'Ad-hoc Reviewer' },
      {
        role: 'Book: Agro-biotechnology in Diverse Perspective',
        detail: 'Ad-hoc Reviewer',
      },
      {
        role: 'National Commission for Scientific and Technological Research – Chile',
        detail: 'Ad-hoc Reviewer',
      },
    ],
  },
];

// Left empty rather than presenting an invented quote as Francisco's own words.
export const servicePullQuote = '';
