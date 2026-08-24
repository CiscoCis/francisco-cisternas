// Titles, authors, venues, years and statuses are reproduced as supplied.
// `abstract` and `url` are only present where the source document gave them;
// an item without them simply doesn't offer the control — nothing is
// written or inferred.

export type PublicationCategory =
  | 'published'
  | 'under-review'
  | 'books'
  | 'working';

export interface Publication {
  id: string;
  title: string;
  authors: string;
  venue: string;
  /** `null` when the CV gives no year. */
  year: number | null;
  status?: string;
  detail?: string;

  // Each link is optional and renders its own button only when present, so a
  // paper with a DOI but no open PDF shows one button, not a dead one.
  doi?: string;
  url?: string;
  pdf?: string;

  abstract?: string;
  keywords?: string[];

  // Conceptual visuals need approval before use, so this stays empty rather
  // than filled with something generated.
  image?: string;
  imageAlt?: string;
  /** Give the paper a wider card at the top of its category. */
  featured?: boolean;
}

export const CATEGORY_LABELS: Record<PublicationCategory, string> = {
  published: 'Published',
  'under-review': 'Under Review',
  books: 'Books & Chapters',
  working: 'Working Papers',
};

export const publications: Record<PublicationCategory, Publication[]> = {
  published: [
    {
      id: 'pub-basket-2025',
      title:
        'Basket-Enhanced Heterogeneous Hypergraph for Price-Sensitive Next Basket Recommendation',
      authors: 'Zhou Y, Wang Y, Cui Q, Guan X, Cisternas F.',
      venue:
        '2025 IEEE International Conference on Acoustics, Speech and Signal Processing',
      year: 2025,
      keywords: ['recommendation', 'machine learning', 'pricing', 'retail'],
      url: 'https://ieeexplore.ieee.org/document/10887705',
      pdf: 'https://www.researchgate.net/publication/384116129_Basket-Enhanced_Heterogenous_Hypergraph_for_Price-Sensitive_Next_Basket_Recommendation',
      image: '/images/research/Basket.png',
      imageAlt:
        'Figure from the Basket-Enhanced Heterogeneous Hypergraph paper',
      featured: true,
      abstract:
        'Next Basket Recommendation (NBR) is a new type of recommender system that predicts combinations of items users are likely to purchase together. Existing NBR models often overlook a crucial factor, which is price, and do not fully capture item-basket-user interactions. To address these limitations, we propose a novel method called Basket-augmented Dynamic Heterogeneous Hypergraph (BDHH). BDHH utilizes a heterogeneous multi-relational graph to capture the intricate relationships among item features, with price as a critical factor. Moreover, our approach includes a basket-guided dynamic augmentation network that could dynamically enhances item-basket-user interactions. Experiments on real-world datasets demonstrate that BDHH significantly improves recommendation accuracy, providing a more comprehensive understanding of user behavior.',
    },
    {
      id: 'pub-cellreports-2024',
      title:
        'Cultural and generational factors shape Asians’ sustainable food choices: Insights from choice experiments and information nudges',
      authors: 'Cisternas F, Sun C, Contador C A, Chu M, Anders S, et al.',
      venue: 'Cell Reports',
      year: 2024,
      keywords: ['sustainability', 'choice experiments', 'nudges', 'food'],
      url: 'https://www.sciencedirect.com/science/article/pii/S2949790624000065',
      image: '/images/research/Cultural.png',
      imageAlt:
        'Figure from the Asian sustainable food choices choice-experiment study',
      abstract:
        'Promoting sustainable diets is crucial for mitigating global greenhouse gas emissions. We investigated the potential for large-scale dietary shifts to address the impacts of climate change on agriculture and food through surveys and choice experiments in China, Japan, and Vietnam (n = 5,089). Our findings reveal that Asian consumers are largely unwilling to deviate from current dietary habits, particularly regarding the consumption of animal proteins. This reluctance persists despite significant preferences for environmental certification as a proxy for greater sustainability in food production, as expressed by wealthier and younger respondents. Information experiments demonstrate that altruistic messaging fails to induce change, and positive information about climate impacts weakens the influence of certification. However, self-enhancement framing, particularly effective with individuals aged 60 years and above, shows promise. Our findings provide valuable insights for researchers and policymakers seeking effective strategies to encourage sustainable diets, shedding light on challenges and potential avenues for successful intervention.',
    },
    {
      id: 'pub-fes-2022',
      title: 'The future of sustainable food consumption in China',
      authors: 'Chu M, Anders S, Qing D, Contador C A, Cisternas F, Caine C, et al.',
      venue: 'Food and Energy Security',
      year: 2022,
      detail: 'e405',
      keywords: ['sustainability', 'food', 'consumption', 'China'],
      url: 'https://www.researchgate.net/publication/361464594_The_future_of_sustainable_food_consumption_in_China',
      image: '/images/research/sustainable_food.png',
      imageAlt:
        'Figure from the sustainable food consumption in China study',
      abstract:
        'Food production is one of the main contributors to greenhouse gas emissions and climate change. China, as a rapidly developing economy, contributes to an unsustainable food system as its consumption of animal products and meat has continued to grow in recent decades. Using the extended theory of planned behavior as the conceptual framework, this paper examines factors influencing consumers’ intention to purchase sustainable food in China. To this end, a population-based face-to-face survey was conducted with 2422 respondents in five provinces spanning the north and south of China. The results showed that the traditional constructs of behavioral attitude, subjective norms, perceived behavioral control, and the additional construct of perceived quality are significant in inducing such intentions. This paper suggests that to enhance consumers’ willingness to shift to sustainable food consumption, appropriate regulation and monitoring framework is needed to increase consumers’ trust toward sustainable food. The government can also cooperate with the media, experts, and social media opinion leaders to ensure that messages on sustainable development are promoted in effective ways.',
    },
    {
      id: 'pub-jors-2013',
      title:
        'Optimizing Salmon Farm Cage Net Management Use Using Integer Programming',
      authors: 'Cisternas F, Duran W, Polgatiz C, Weintraub A.',
      venue: 'JORS',
      year: 2013,
      detail: '64: 735–747',
      keywords: ['integer programming', 'optimization', 'operations research'],
      url: 'https://www.researchgate.net/publication/256056796_Optimizing_Salmon_Farm_Cage_Net_Management_Using_Integer_Programming',
      image: '/images/research/salmon.png',
      imageAlt: 'Figure from the salmon farm cage net optimisation paper',
      abstract:
        'Salmon farming in Chile constitutes one of the nation’s principal food exporting sectors. In the seawater stage, one of the most important in the farm production chain, salmon are cultivated in floating cages fitted with nets that hold the fish during the entire grow-out process. The maintenance of the cage nets is carried out at land-based facilities. This article reports on the creation of an integer programming tool for grow-out centres that optimizes resource use, improves planning and generates economic evaluations for supporting analysis and decision-making relating to the maintenance, repair and periodic changing of cage nets. The tool prototype was tested in a single operating area of one of Chile’s largest salmon farmers. The results demonstrated a reduction in net maintenance costs of almost 18%, plus a series of important qualitative benefits. Implementation of the tool by farm operators awaits the end of the current crisis in the industry.',
    },
    {
      id: 'pub-jse-2009',
      title:
        'Mathematical Programming for the efficient use of breeding nets in a Salmon Company',
      authors: 'Cisternas F, Duran W, Polgatiz C, Weintraub A.',
      venue: 'Journal of Systems Engineering',
      year: 2009,
      detail: '23: 27–47',
      url: 'https://www.academia.edu/71146282/Optimizing_salmon_farm_cage_net_management_using_integer_programming',
      image: '/images/research/Mathprog.png',
      imageAlt:
        'Figure from the mathematical programming study of salmon breeding nets',
      // Same abstract/link as the 2013 JORS paper above (same research,
      // published twice); repeated rather than cross-referenced so editing
      // one entry never silently changes the other.
      abstract:
        'Salmon farming in Chile constitutes one of the nation’s principal food exporting sectors. In the seawater stage, one of the most important in the farm production chain, salmon are cultivated in floating cages fitted with nets that hold the fish during the entire grow-out process. The maintenance of the cage nets is carried out at land-based facilities. This article reports on the creation of an integer programming tool for grow-out centres that optimizes resource use, improves planning and generates economic evaluations for supporting analysis and decision-making relating to the maintenance, repair and periodic changing of cage nets. The tool prototype was tested in a single operating area of one of Chile’s largest salmon farmers. The results demonstrated a reduction in net maintenance costs of almost 18%, plus a series of important qualitative benefits. Implementation of the tool by farm operators awaits the end of the current crisis in the industry.',
      keywords: ['mathematical programming', 'optimization'],
    },
    {
      id: 'pub-jse-2006',
      title:
        'Revenue Management in an Airline Using business Intelligence, Mathematical Programming and Conjoint Analysis',
      authors: 'Cisternas F, Weber R.',
      venue: 'Journal of Systems Engineering',
      year: 2006,
      detail: '20: 45–66',
      image: '/images/research/airplane.png',
      imageAlt:
        'Figure from the airline revenue management study',
      keywords: [
        'revenue management',
        'business intelligence',
        'conjoint analysis',
      ],
    },
  ],

  'under-review': [
    {
      id: 'ur-primacy-2025',
      title:
        'Primacy and recency in consumer reference point formation: A consideration time model',
      authors: 'Meyer A & Cisternas F.',
      venue: 'Journal of Consumer Research',
      year: 2025,
      status: 'Under review',
      keywords: ['reference points', 'consumer behaviour', 'consideration'],
    },
    {
      id: 'ur-microtargeting-2025',
      title:
        'The Effects of Micro-targeting on Conversion Rates and the Role of Information Asymmetry',
      authors: 'Chaimanowong W, Cisternas F, Despotakis S.',
      venue: 'Marketing Science',
      year: 2025,
      status: 'Resubmission',
      keywords: ['micro-targeting', 'conversion', 'information asymmetry'],
    },
    {
      id: 'ur-shelf-2023',
      title: 'Influencing Product Competition Through Shelf Design',
      authors: 'Cisternas F, Chaimanowong W, Montgomery A, Derdenger T.',
      venue: 'Management Science',
      year: 2023,
      status: 'Under review (2nd round)',
      keywords: ['shelf design', 'competition', 'retail'],
    },
    {
      id: 'ur-display-2023',
      title: 'Rethinking product Display',
      authors: 'Chaimanowong W, Cisternas F, Bernal D.',
      venue: 'INFORMS: International Journal of Computing',
      year: 2023,
      status: 'Submitting',
      detail: 'September 2023',
      keywords: ['product display', 'retail', 'computing'],
    },
    {
      id: 'ur-mobility-2022',
      title:
        'Machine-Learning Based Human Mobility Pattern Analysis and Its Applications in Marketing',
      authors: 'Cisternas F, Jia J, Goic M, Rios S.',
      venue: 'Information System Research',
      year: 2022,
      status: 'To be submitted',
      keywords: ['machine learning', 'mobility', 'big data'],
    },
    {
      id: 'ur-auction-2022',
      title: 'Auction Design with Multiple Exchanges',
      authors: 'Cisternas F, Chaimanowong W, Despotakis S.',
      venue: 'Mathematics of Operations Research',
      year: 2022,
      status: 'In preparation for submission',
      keywords: ['auction design', 'exchanges', 'game theory'],
    },
    {
      id: 'ur-bank-2021',
      title: 'Reshaping Bank Branch Networks due to Mobile Banking',
      authors: 'Cisternas F, W. Van Hoeve.',
      venue: 'Management Science',
      year: 2021,
      status: 'To resubmit',
      keywords: ['mobile banking', 'branch networks', 'financial channels'],
    },
    {
      id: 'ur-lifestatus-2021',
      title:
        'Targeting Using Life Status Changes: Empirical Examination of Financial Products',
      authors: 'Kim H, Chen J, Cisternas F, Rao V.',
      venue: 'Journal of the Academy of Marketing Science',
      year: 2021,
      status: 'To be submitted',
      keywords: ['targeting', 'financial products', 'empirical'],
    },
  ],

  books: [
    {
      id: 'bk-farmdata-2026',
      title:
        'From Farm Data to Consumer Choice: Integrating Precision Agriculture Insights into Sustainable Food Consumption Models',
      authors: 'Cisternas F, Contador C. and Lam H.',
      venue:
        'In Luna, Yang and Qiao: Data-Driven Agriculture — Artificial Intelligence, Plant Phenotyping, and Precision Technologies for Sustainable Crop Improvement. IntechOpen',
      year: 2026,
      doi: '10.5772/intechopen.1015732',
      url: 'https://www.intechopen.com/online-first/1248001',
      keywords: ['precision agriculture', 'sustainability', 'food'],
    },
    {
      id: 'bk-crosscultural-2026',
      title: 'Cross-Cultural Differences in Sustainable Food Choices',
      authors: 'Cisternas, F., Contador, C. and Lam, H.',
      venue:
        'In: Herbert L. Meiselman (ed.) Food and Consumer Behavior: A Comprehensive Reference, vol. 1, pp. 313–325. US: Elsevier',
      year: 2026,
      doi: '10.1016/B978-0-443-29139-5.00006-9',
      url: 'http://dx.doi.org/10.1016/B978-0-443-29139-5.00006-9',
      keywords: ['cross-cultural', 'sustainability', 'food choice'],
    },
    {
      id: 'bk-crosscultural-2025',
      title: 'Cross-cultural differences in sustainable food choices',
      authors: 'Cisternas F, Contador C, Lam HM.',
      venue:
        'Food and Consumer Behavior: A Comprehensive Reference. Elsevier Publishing',
      year: 2025,
      keywords: ['cross-cultural', 'sustainability', 'food choice'],
    },
    {
      id: 'bk-digitaltransform-2024',
      title:
        'Digital Transformation on Agricultural Products & Food Markets',
      authors: 'Cisternas F.',
      venue:
        'Agrobiotechnology in Diverse Perspective. World Scientific Publishing, pp. 125–137',
      year: 2024,
      doi: '10.1142/13423',
      url: 'https://www.worldscientific.com/doi/epdf/10.1142/13423',
      keywords: ['digital transformation', 'agriculture', 'food markets'],
    },
  ],

  working: [
    {
      id: 'wp-earthquake',
      title: 'Using Chendu Earthquake to Quantify social influence',
      authors: 'with Beibei Li and Zhe Zhang',
      venue: 'PNAS',
      year: null,
      status: 'To be submitted',
      keywords: ['social influence', 'natural experiment'],
    },
    {
      id: 'wp-appearance',
      title: 'What Appearance can tell us about purchase behavior',
      authors: 'with Kaiquan Xu and Patrick Choi',
      venue: 'Marketing Science',
      year: null,
      status: 'To be submitted',
      keywords: ['purchase behaviour', 'machine learning'],
    },
    {
      id: 'wp-eba',
      title:
        'Using Elimination by Aspect Theory to Model Consumer Search in Product Display to Optimize Product Blocking for Traditional and Online Retailers',
      authors: 'with C. Morewedge',
      venue: '',
      year: null,
      keywords: ['consumer search', 'product display', 'retail'],
    },
    {
      id: 'wp-sharing',
      title: 'How traditional firms should react when facing sharing economies?',
      authors: '',
      venue: '',
      year: null,
      keywords: ['sharing economy', 'firm strategy'],
    },
    {
      id: 'wp-health',
      title:
        'Distortions in the American health industry: the impact of marketing strategies on health plan insurance and treatment prices',
      authors: '',
      venue: '',
      year: null,
      keywords: ['health marketing', 'pricing', 'insurance'],
    },
  ],
};

/** Years present in a given category, newest first. */
export function yearsFor(category: PublicationCategory): number[] {
  const set = new Set<number>();
  publications[category].forEach((p) => {
    if (p.year !== null) set.add(p.year);
  });
  return [...set].sort((a, b) => b - a);
}

/** Plain-text citation for the copy control. */
export function citationFor(p: Publication): string {
  const bits: string[] = [];
  if (p.authors) bits.push(p.authors.replace(/\.$/, '') + '.');
  if (p.year) bits.push(`(${p.year}).`);
  bits.push(`“${p.title}”.`);
  if (p.venue) bits.push(`${p.venue}${p.detail ? ', ' + p.detail : ''}.`);
  else if (p.detail) bits.push(`${p.detail}.`);
  if (p.status) bits.push(`${p.status}.`);
  if (p.doi) bits.push(`DOI: ${p.doi}.`);
  return bits.join(' ').replace(/\s+/g, ' ').trim();
}
