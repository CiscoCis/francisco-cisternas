// Ordered newest first. Nothing added, nothing omitted from the CV.

export interface Talk {
  id: string;
  year: number;
  /** Bold lead — the conference, institution or event. */
  event: string;
  /** Prefix such as "Invited talk." or "Speaker." where the CV supplies one. */
  kind?: string;
  /** Italic paper / presentation title where the CV supplies one. */
  paper?: string;
  date: string;
  location: string;
}

export const talks: Talk[] = [
  {
    id: 't-2024-anzmac',
    year: 2024,
    event: 'Australian & New Zealand Marketing Academy (ANZMAC)',
    date: 'December 2024',
    location: 'University of Tasmania, Tasmania, Australia',
  },
  {
    id: 't-2024-isms',
    year: 2024,
    event: '46th INFORMS Marketing Science Conference ISMS',
    paper:
      'Primacy and recency in consumer reference point formation: A consideration time model',
    date: 'June 2024',
    location: 'Sydney, Australia',
  },
  {
    id: 't-2023-teachexc',
    year: 2023,
    event: 'Teaching Excellence CUHK Business School',
    paper: 'Teaching Quantitative methods to non-quant students',
    date: 'November 2023',
    location: 'Hong Kong, SAR',
  },
  {
    id: 't-2023-hku',
    year: 2023,
    kind: 'Speaker.',
    event: 'Economic Evolution in Chile',
    date: 'September 2023',
    location: 'Hong Kong University, Hong Kong, SAR',
  },
  {
    id: 't-2023-chile',
    year: 2023,
    kind: 'Invited talk.',
    event: 'Microtargeting on Conversion Rates and the Role of Information Asymmetry',
    date: 'July 2023',
    location: 'University of Chile, Santiago, Chile',
  },
  {
    id: 't-2023-isms-micro',
    year: 2023,
    event: '45th INFORMS Marketing Science Conference ISMS',
    paper:
      'The Effects of Microtargeting on Conversion Rates and the Role of Information Asymmetry',
    date: 'June 2023',
    location: 'Miami, USA',
  },
  {
    id: 't-2023-isms-emotional',
    year: 2023,
    event: '45th INFORMS Marketing Science Conference ISMS',
    paper:
      'Emotional Variability and Consumer Engagement: The Case of a Large Live Streaming Platform',
    date: 'June 2023',
    location: 'Miami, USA',
  },
  {
    id: 't-2023-isms-expert',
    year: 2023,
    event: '45th INFORMS Marketing Science Conference ISMS',
    paper: 'Effect of the Expert’s Review on Experience Goods Consumption',
    date: 'June 2023',
    location: 'Miami, USA',
  },
  {
    id: 't-2023-ensure',
    year: 2023,
    event:
      'ENSURE Mini-Symposium on Global Food, Water and Environmental Sustainability',
    paper:
      'Global Food Security, Climate Change and Resilience: An International Perspective',
    date: 'May 2023',
    location: 'Hong Kong SAR',
  },
  {
    id: 't-2023-emac',
    year: 2023,
    event: 'European Marketing Association Conference',
    paper:
      'Emotional Variability and Consumer Engagement: The Case of a Large Live Streaming Platform',
    date: 'May 2023',
    location: 'Odense, Denmark',
  },
  {
    id: 't-2023-hkqm',
    year: 2023,
    event: 'Hong Kong Quantitative Marketing Conference',
    paper: 'Optimizing Product Influence of Shelf Display',
    date: 'February 2023',
    location: 'Hong Kong SAR',
  },
  {
    id: 't-2021-anzmac',
    year: 2021,
    event: 'Australian & New Zealand Marketing Academy',
    date: 'November 2021',
    location: 'Melbourne University, Australia (online)',
  },
  {
    id: 't-2021-isms',
    year: 2021,
    event: '43th INFORMS Marketing Science Conference ISMS',
    date: 'June 2021',
    location: 'Florida, USA (online)',
  },
  {
    id: 't-2020-isms',
    year: 2020,
    event: '42th INFORMS Marketing Science Conference ISMS',
    date: 'June 2020',
    location: 'Duke University, Durham, USA (online)',
  },
  {
    id: 't-2019-anzmac',
    year: 2019,
    event: 'Australian & New Zealand Marketing Academy',
    date: 'December 2019',
    location: 'University of Wellington, New Zealand',
  },
  {
    id: 't-2019-pitt',
    year: 2019,
    event:
      'Joseph M. Katz Graduate School of Business, University of Pittsburgh',
    date: 'November 2019',
    location: 'Pittsburgh, US',
  },
  {
    id: 't-2019-lausanne',
    year: 2019,
    event: 'Faculty of Business and Economics, University of Lausanne',
    date: 'July 2019',
    location: 'Lausanne, Switzerland',
  },
  {
    id: 't-2019-isms',
    year: 2019,
    event: '41th INFORMS Marketing Science Conference ISMS',
    date: 'June 2019',
    location: 'Rome, Italy',
  },
  {
    id: 't-2019-melbourne',
    year: 2019,
    event: 'Melbourne Business School',
    date: 'January 2019',
    location: 'Melbourne, Australia',
  },
  {
    id: 't-2018-tsinghua',
    year: 2018,
    event: 'Tsinghua University',
    date: 'December 2018',
    location: 'Beijing, China',
  },
  {
    id: 't-2018-beijing',
    year: 2018,
    event: 'Beijing University',
    date: 'December 2018',
    location: 'Beijing, China',
  },
  {
    id: 't-2018-isms',
    year: 2018,
    event: '40th INFORMS Marketing Science Conference ISMS',
    date: 'June 2018',
    location: 'Philadelphia, Pennsylvania',
  },
  {
    id: 't-2017-isms',
    year: 2017,
    event: '39th INFORMS Marketing Science Conference ISMS',
    date: 'June 2017',
    location: 'Los Angeles, California',
  },
  {
    id: 't-2016-isms',
    year: 2016,
    event: '38th INFORMS Marketing Science Conference ISMS',
    date: 'June 2016',
    location: 'Shanghai, China',
  },
  {
    id: 't-2015-bafi',
    year: 2015,
    event: '2nd Conference on Business Analytics in Finance and Industry',
    date: 'December 2015',
    location: 'Santiago, Chile',
  },
  {
    id: 't-2015-isms',
    year: 2015,
    event: '37th INFORMS Marketing Science Conference ISMS',
    date: 'June 2015',
    location: 'Baltimore, Maryland',
  },
  {
    id: 't-2014-chile',
    year: 2014,
    event: '5th Workshop in Management Science & Economics, University of Chile',
    paper: 'Optimizing Bank Retail Branch Network',
    date: 'December 2014',
    location: '',
  },
  {
    id: 't-2012-isms',
    year: 2012,
    event: '34th INFORMS Marketing Science Conference ISMS',
    date: 'July 2012',
    location: 'Boston, Massachusetts',
  },
  {
    id: 't-2008-claio',
    year: 2008,
    event: 'XIV Latin-American Congress in Operations Research CLAIO',
    date: 'September 2008',
    location: 'Cartagena, Colombia',
  },
  {
    id: 't-2007-optima',
    year: 2007,
    event: 'VII Chilean Congress in Operations Research OPTIMA',
    date: 'October 2007',
    location: 'Puerto Montt, Chile',
  },
  {
    id: 't-2006-claio',
    year: 2006,
    event: 'XIII Latin-American Congress in Operations Research CLAIO',
    date: 'November 27–30, 2006',
    location: 'Montevideo, Uruguay',
  },
  {
    id: 't-2005-optima',
    year: 2005,
    event: 'VI Chilean Congress in Operations Research OPTIMA',
    date: 'October 2005',
    location: 'Valdivia, Chile',
  },
];

export interface Keynote {
  id: string;
  title: string;
  context: string;
  date?: string;
  location?: string;
  icon: 'podium' | 'globe' | 'leaf' | 'quote';
}

export const keynotes: Keynote[] = [
  {
    id: 'k-smartpricing',
    title: 'Smart Pricing: Leveraging AI in Marketing',
    context: 'CUHK Business School Town Centre. CUHK EMBA Master Class.',
    date: 'December 2024',
    icon: 'podium',
  },
  {
    id: 'k-digitaltransform',
    title:
      'Digital Transformations Effects on Agricultural Products and Methods to Assess Market Trends',
    context:
      'Agro-biotechnology Talk Series — RGC – Area of Excellence Center for Genomic Studies on Plant Environment Interaction, Seed Tec, CUHK Center for Soybean, SKL and CUHK.',
    icon: 'leaf',
  },
  {
    id: 'k-ensure',
    title:
      'ENSURE CUHK–Exeter International Symposium on Global Food, Water and Environmental Sustainability',
    context: '',
    date: 'May 2023',
    location: 'Hong Kong SAR',
    icon: 'globe',
  },
  {
    id: 'k-vnuhcm',
    title:
      'Conducting experimental surveys statistical inference for consumer preferences using choice models',
    context:
      'Service Learning in STEM: “Application of Statistics in Community Survey”, VNUHCM.',
    date: 'March 2019',
    location: 'Ho Chi Minh City, Vietnam',
    icon: 'quote',
  },
];

/** Distinct years present in the talks list, newest first. */
export const talkYears: number[] = [...new Set(talks.map((t) => t.year))].sort(
  (a, b) => b - a
);
