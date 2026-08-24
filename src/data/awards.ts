// `note` carries the CV's own qualifying phrase verbatim; nothing is invented.

export interface Award {
  id: string;
  name: string;
  organisation?: string;
  year?: string;
  note?: string;
}

export const awards: Award[] = [
  {
    id: 'aw-teach-excellence',
    name: 'Faculty Teaching Excellence Award',
    organisation: 'CUHK Business School',
    year: '2023',
  },
  {
    id: 'aw-teach-merit',
    name: 'Faculty Teaching Merit Award',
    organisation: 'CUHK Business School',
    year: '2020/21, 2021/22, 2022/23, 2023/24',
  },
  {
    id: 'aw-pnc-1516',
    name: 'PNC Center for Financial Services Innovation Research Grant',
    organisation: 'PNC',
    year: '2015–2016',
  },
  {
    id: 'aw-informs-2014',
    name: 'INFORMS Marketing Science Doctoral Consortium Fellow',
    organisation: 'Emory University',
    year: '2014',
  },
  {
    id: 'aw-chakravarti',
    name: 'The Dipankar and Sharmila Chakravarti Fellowship',
    note: 'Outstanding contributions to research in the field of Marketing',
  },
  {
    id: 'aw-pnc-1415',
    name: 'PNC Center for Financial Services Innovation Research Grant',
    organisation: 'PNC',
    year: '2014–2015',
  },
  {
    id: 'aw-informs-2012',
    name: 'INFORMS Marketing Science Doctoral Consortium Fellow',
    organisation: 'Boston University',
    year: '2012',
  },
  {
    id: 'aw-mellon',
    name: 'William Larimer Mellon Fellowship Award',
    organisation: 'Carnegie Mellon University',
    note: 'In recognition of past academic achievements and doctoral work potential',
  },
  {
    id: 'aw-chile-top5',
    name: 'Outstanding Student Performance Award',
    organisation: 'School of Engineering, University of Chile',
    note: 'Top 5% of more than 4,000 students',
  },
];
