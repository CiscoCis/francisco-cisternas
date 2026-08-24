import type { IconName } from '@/components/Icons';

export interface Course {
  name: string;
  years: string;
}

export interface ProgrammeGroup {
  id: string;
  label: string;
  icon: IconName;
  courses: Course[];
}

export const programmes: ProgrammeGroup[] = [
  {
    id: 'emba-mba',
    label: 'EMBA / MBA',
    icon: 'briefcase',
    courses: [
      { name: 'Marketing Management (EMBA)', years: '2024/25, 2025/26' },
      { name: 'Digital Marketing (MBA)', years: '2024/25, 2025/26' },
      { name: 'Marketing Research (MBA)', years: '2017/18, 2018/19' },
    ],
  },
  {
    id: 'msc',
    label: 'MSc Programmes',
    icon: 'cap',
    courses: [
      {
        name: 'Marketing Analytics (Master of Science)',
        years: '2019/20, 2020/21, 2021/22, 2021/23',
      },
      {
        name: 'Marketing Management (Master of Science)',
        years: '2024/25, 2025/26',
      },
    ],
  },
  {
    id: 'undergraduate',
    label: 'Undergraduate',
    icon: 'book',
    courses: [
      {
        name: 'Marketing Research (Undergraduate)',
        years: '2017/18, 2018/19, 2021/22',
      },
    ],
  },
  {
    id: 'phd',
    label: 'PhD',
    icon: 'thesis',
    courses: [
      {
        name: 'Advance Marketing Seminar – Empirical Models (PhD)',
        years: '2020/21, 2022/23, 2024/25',
      },
    ],
  },
];

export const teachingReach = {
  countries: ['Chile', 'Peru', 'Panama', 'the United States', 'Hong Kong'],
  businessSchoolTopics: [
    'Marketing Analytics',
    'Data Mining',
    'Marketing Research',
    'Business Intelligence',
    'Use of SAS in Data Mining',
    'Engineering of Marketing',
    'Principles of Marketing',
    'Econometrics',
    'Applications of Data Mining in Industry',
  ],
  engineeringSchoolTopics: [
    'Industrial Economy',
    'Probability and Statistics',
    'Optimization',
    'Project Evaluation',
    'Contemporary Physics',
    'Physics Laboratory',
  ],
};

// No files supplied yet, so every item renders in a disabled "available on
// request" state; setting `href` to a real path switches it to a live link.
export interface StudentResource {
  label: string;
  icon: IconName;
  href?: string;
}

export const studentResources: StudentResource[] = [
  { label: 'Syllabi', icon: 'doc' },
  { label: 'Course Materials', icon: 'folder' },
  { label: 'Guidelines', icon: 'clipboard' },
  { label: 'Downloadable Resources', icon: 'download' },
];

export const teachingRecognition = [
  {
    name: 'Faculty Teaching Excellence Award',
    detail: 'CUHK Business School (2023)',
  },
  {
    name: 'Faculty Teaching Merit Award',
    detail: 'CUHK Business School (2020/21, 2021/22, 2022/23, 2023/24)',
  },
];
