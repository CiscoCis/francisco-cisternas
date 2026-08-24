// `inPreparation` items are kept visually separate from awarded grants.

export interface Grant {
  id: string;
  title: string;
  agency: string;
  reference?: string;
  amount?: string;
  period?: string;
  role?: string;
}

export const awardedGrants: Grant[] = [
  {
    id: 'g-crf-covid',
    title:
      'Leveraging Mobility and Digital Trace Big Data to Model COVID-19 Risk and Socio-Economic Recovery',
    agency:
      'Collaborative Research Fund (CRF) / One-off CRF Coronavirus Disease (COVID-19) and Novel Infectious Disease (NID) Research Exercise, the Research Grant Council of Hong Kong',
    reference: 'Earmarked Research Grant #C7105-20G',
    amount: 'HK$4,533,112 (~US$580,000)',
    period: '3/2021 – 3/2023',
    role: 'Co-Principal Investigator',
  },
  {
    id: 'g-ensure-2019',
    title:
      'Global Food Security, Climate Change and Resilience: An International Perspective',
    agency:
      'CUHK–University of Exeter Joint Centre for Environment Sustainability & Resilience (ENSURE)',
    period: '2019',
    role: 'Co-Principal Investigator',
  },
  {
    id: 'g-pnc-2',
    title: 'Optimizing the Branch Network – Part II',
    agency: 'PNC Center for Financial Services Innovation',
    amount: 'USD $30,000',
    period: '2015 – 2016',
    role: 'Principal Investigator',
  },
  {
    id: 'g-pnc-1',
    title: 'Optimizing the Branch Network',
    agency: 'PNC Center for Financial Services Innovation',
    amount: 'USD $30,000',
    period: '2014 – 2015',
    role: 'Principal Investigator',
  },
];

export const inPreparationGrants: Grant[] = [
  {
    id: 'g-prep-probiotics',
    title:
      'The next-generation probiotics for marine bivalve aquaculture: proof of concept',
    agency:
      'CUHK–University of Exeter Joint Centre for Environment Sustainability & Resilience (ENSURE)',
    role: 'Co-applicant',
  },
  {
    id: 'g-prep-ensure2',
    title:
      'Global Food Security, Climate Change and Resilience: An International Perspective',
    agency:
      'CUHK–University of Exeter Joint Centre for Environment Sustainability & Resilience (ENSURE)',
    period: 'Phase II',
  },
];
