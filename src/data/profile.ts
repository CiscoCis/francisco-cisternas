// The primary identity on this site is the person, not the post: "Francisco
// Cisternas" (no honorific, no job title) is what appears in the header,
// hero and page metadata. Titles are accurate and still shown, but only
// inside About, Teaching and the CV — never tied to a single employer, so a
// change of role doesn't date the site.

export const profile = {
  name: 'Francisco Cisternas',
  fullName: 'Francisco O. Cisternas Vera',

  formalName: 'Dr Francisco Cisternas',
  title: 'Senior Lecturer',
  secondaryRole:
    'Associate Director (Student Development and Engagement), MBA',
  school: 'CUHK Business School',
  department: 'Department of Marketing',
  university: 'The Chinese University of Hong Kong',

  disciplines: ['Teaching', 'Research', 'Analytics', 'Technology'],

  otherPositions: [
    'Associate Director (Student Development and Engagement), MBA',
    'Fellow at the Institute of Environment, Energy and Sustainability (IEES)',
  ],

  /** Approved biography — do not rewrite. Shown verbatim in About. */
  biography:
    'My journey into marketing began with a background in industrial engineering in Chile, where I became curious about how systems work, how people make decisions, and what data can reveal about both. That curiosity eventually took me to Carnegie Mellon for my PhD in Marketing and later to Hong Kong.\n\nToday, my research explores how people move between digital and physical worlds, using data to understand behaviour across areas such as retail, financial services, and sports. At the heart of my work is a simple motivation: to ask meaningful questions, uncover patterns in complex data, and turn them into insights that connect research with the real world.',

  // Same material as the approved biography/CV, in a more personal voice.
  heroIntro:
    'An industrial engineer from Chile who took a doctorate in marketing at Carnegie Mellon and now teaches and researches in Hong Kong. The through-line is the same one it has always been: using data to understand how people move between the digital and the physical — in finance, in sport, in retail — and teaching others to do the same.',

  heroStatement:
    'My research models the interactions between digital and physical channels using big data, with applications in financial, sports and retail industries.',

  researchStatement:
    'Understanding the interaction between digital and physical markets.',
  researchSubStatement:
    'Researching consumer and firm behaviour across channels using data, quantitative modelling and analytics.',

  contact: {
    // No longer displayed prominently — the contact form is the primary
    // route. Kept as the mailto fallback when no form endpoint is configured.
    email: 'fcisternas@cuhk.edu.hk',
    orcid: '0000-0002-7176-9728',
    orcidUrl: 'https://orcid.org/0000-0002-7176-9728',
    profileUrl:
      'https://www.bschool.cuhk.edu.hk/staff/cisternas-vera-francisco/',
    linkedinUrl: 'https://www.linkedin.com/in/francisco-cisternas-978a4032/',
  },

  education: [
    {
      degree: 'Ph.D. Industrial Administration – Marketing, Minor in Statistics',
      institution: 'Carnegie Mellon University',
      year: '2017',
    },
    {
      degree: 'M.S. in Industrial Administration – Marketing',
      institution: 'Carnegie Mellon University',
      year: '2014',
    },
    {
      degree: 'M.S. in Operations Management',
      institution: 'University of Chile',
      year: '2006',
    },
    {
      degree: 'Bachelor in Industrial Engineering',
      institution: 'University of Chile',
      year: '2006',
    },
  ],

  researchTopics: [
    'Mobile Marketing',
    'Channels Management',
    'Demand Optimization',
    'Sustainability',
    'Health Marketing',
  ],

  methods: [
    'Data Analytics',
    'Structural Models',
    'Machine Learning',
    'Statistical Models',
    'Bayesian Statistics',
    'Mixed Integer Programming Optimization',
  ],
} as const;

// Visual timeline for About. Add further entries here; the timeline renders
// whatever it is given.
export type JourneyStop = {
  period: string;
  place: string;
  where: string;
  note: string;
};

export const journey: JourneyStop[] = [
  {
    period: 'Until 2006',
    place: 'University of Chile',
    where: 'Santiago, Chile',
    note: 'Industrial engineering, then a master’s in operations management.',
  },
  {
    period: '2007 – 2010',
    place: 'Antofagasta Minerals',
    where: 'Salamanca, Chile',
    note: 'Project and evaluation engineering roles in the mining industry, including Repowering II, a billion-dollar expansion of Minera Los Pelambres.',
  },
  {
    period: '2014 – 2017',
    place: 'Carnegie Mellon University',
    where: 'Pittsburgh, United States',
    note: 'MS and PhD in Industrial Administration (Marketing), minor in statistics.',
  },
  {
    period: 'Since 2017',
    place: 'CUHK Business School',
    where: 'Hong Kong',
    note: 'Teaching and research in marketing, analytics and channel modelling.',
  },
];

// Never auto-open or auto-download the CV — an ordinary button and nothing
// more. Drop the file(s) into public/docs/ and set `href` to enable each
// button; until then the entry is skipped rather than rendered as a dead link.
export type CvVersion = {
  label: string;
  description: string;
  href: string;
};

export const cvVersions: CvVersion[] = [
  {
    label: 'Curriculum vitae',
    description: 'Full academic CV — publications, teaching, grants, service.',
    href: '',
  },
  {
    label: 'Short CV',
    description: 'Two-page summary for talks, panels and introductions.',
    href: '',
  },
];
