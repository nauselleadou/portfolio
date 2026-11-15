export type StationSectionKey =
  | 'about'
  | 'skills'
  | 'projects'
  | 'certifications'
  | 'ambitions'
  | 'contact';

export interface StationLandmark {
  id: string;
  label: string;
  shortHint: string;
  /** Offset in world coordinates relative to station stop point */
  localOffsetX: number;
  localOffsetY: number;
  visualKind:
    | 'arch'
    | 'pillar'
    | 'beacon'
    | 'lab_console'
    | 'data_core'
    | 'ai_prism'
    | 'project_tower'
    | 'trophy_case'
    | 'observatory'
    | 'holo_screen'
    | 'cv_kiosk'
    | 'contact_pavilion';
  accentHex: string;
}

export interface StationDefinition {
  index: number; // 0..5
  numberLabel: string; // '01'..'06'
  id: string;
  name: string;
  subtitle: string;
  sectionKey: StationSectionKey;
  /** Normalized progress along the entire rail spline [0..1] */
  stopT: number;
  badgeTitle: string;
  badgeDescription: string;
  missionLabel: string;
  discoverActionLabel: string;
  landmarks: StationLandmark[];
}

export const STATIONS_DATA: StationDefinition[] = [
  {
    index: 0,
    numberLabel: '01',
    id: 'gare-01',
    name: 'Le Terminus des Origines',
    subtitle: 'À propos',
    sectionKey: 'about',
    stopT: 0.055,
    badgeTitle: 'Voyageur des origines',
    badgeDescription: 'A découvert mon parcours, mes passions et le point de départ du voyage.',
    missionLabel: 'Explorer le Terminus des Origines',
    discoverActionLabel: 'Découvrir ma présentation et mon parcours',
    landmarks: [
      {
        id: 'g1-presentation',
        label: 'Arche d’Accueil',
        shortHint: 'Présentation personnelle',
        localOffsetX: -120,
        localOffsetY: -135,
        visualKind: 'arch',
        accentHex: '#D8B77A',
      },
      {
        id: 'g1-parcours',
        label: 'Stèle Académique',
        shortHint: 'Parcours en informatique',
        localOffsetX: 35,
        localOffsetY: -155,
        visualKind: 'pillar',
        accentHex: '#6E8C7A',
      },
      {
        id: 'g1-passions',
        label: 'Balise des Passions',
        shortHint: 'Dev, Data Science, IA & ambitions',
        localOffsetX: 165,
        localOffsetY: -115,
        visualKind: 'beacon',
        accentHex: '#184354',
      },
    ],
  },
  {
    index: 1,
    numberLabel: '02',
    id: 'gare-02',
    name: 'La Station des Compétences',
    subtitle: 'Compétences techniques',
    sectionKey: 'skills',
    stopT: 0.24,
    badgeTitle: 'Explorateur de compétences',
    badgeDescription: 'A inspecté les pôles Développement, Data, IA et Outils du laboratoire.',
    missionLabel: 'Explorer la Station des Compétences',
    discoverActionLabel: 'Consulter toutes mes compétences techniques',
    landmarks: [
      {
        id: 'g2-dev',
        label: 'Terminal Développement',
        shortHint: 'Python, PHP, JS, React, Django...',
        localOffsetX: -145,
        localOffsetY: -130,
        visualKind: 'lab_console',
        accentHex: '#184354',
      },
      {
        id: 'g2-data',
        label: 'Noyau Data & Analyse',
        shortHint: 'Pandas, SQL, Fabric, Power BI...',
        localOffsetX: 0,
        localOffsetY: -165,
        visualKind: 'data_core',
        accentHex: '#274D3A',
      },
      {
        id: 'g2-ai-tools',
        label: 'Prisme IA & Outils',
        shortHint: 'IA générative, Gemini, Git, Colab...',
        localOffsetX: 155,
        localOffsetY: -125,
        visualKind: 'ai_prism',
        accentHex: '#B87D4B',
      },
    ],
  },
  {
    index: 2,
    numberLabel: '03',
    id: 'gare-03',
    name: 'La Cité des Projets',
    subtitle: 'Réalisations',
    sectionKey: 'projects',
    stopT: 0.43,
    badgeTitle: 'Bâtisseur de projets',
    badgeDescription: 'A exploré les réalisations AGITEL Mobile, AgriVigil AI, Nappy Chic et EUREKA.',
    missionLabel: 'Explorer la Cité des Projets',
    discoverActionLabel: 'Découvrir mes réalisations et projets',
    landmarks: [
      {
        id: 'g3-agitel',
        label: 'Pavillon AGITEL Mobile',
        shortHint: 'Emplois du temps & QR Codes',
        localOffsetX: -140,
        localOffsetY: -140,
        visualKind: 'project_tower',
        accentHex: '#184354',
      },
      {
        id: 'g3-agrivigil',
        label: 'Pavillon AgriVigil AI',
        shortHint: 'Accompagnement agricole IA',
        localOffsetX: 10,
        localOffsetY: -165,
        visualKind: 'project_tower',
        accentHex: '#274D3A',
      },
      {
        id: 'g3-nappychic',
        label: 'Atelier Nappy Chic',
        shortHint: 'Stylebook & Réservation IA',
        localOffsetX: 155,
        localOffsetY: -125,
        visualKind: 'project_tower',
        accentHex: '#B87D4B',
      },
    ],
  },
  {
    index: 3,
    numberLabel: '04',
    id: 'gare-04',
    name: 'Le Quai des Accomplissements',
    subtitle: 'Certifications, formations & hackathons',
    sectionKey: 'certifications',
    stopT: 0.62,
    badgeTitle: 'Collectionneur d’accomplissements',
    badgeDescription:
      'A découvert mes certifications et mes distinctions en hackathons (Google Build with AI, Vibeathon 2026).',
    missionLabel: 'Explorer le Quai des Accomplissements',
    discoverActionLabel: 'Consulter certifications, diplômes & hackathons',
    landmarks: [
      {
        id: 'g4-microsoft',
        label: 'Vitrine Certifications',
        shortHint: 'Microsoft DP-600, Sololearn & Cursa',
        localOffsetX: -140,
        localOffsetY: -130,
        visualKind: 'trophy_case',
        accentHex: '#D8B77A',
      },
      {
        id: 'g4-sololearn',
        label: 'Trophée Google Build with AI',
        shortHint: 'Compétition remportée',
        localOffsetX: 10,
        localOffsetY: -165,
        visualKind: 'trophy_case',
        accentHex: '#B87D4B',
      },
      {
        id: 'g4-google-ai',
        label: 'Arène Vibeathon 2026',
        shortHint: 'Innovation & hackathons',
        localOffsetX: 155,
        localOffsetY: -125,
        visualKind: 'ai_prism',
        accentHex: '#235D73',
      },
    ],
  },
  {
    index: 4,
    numberLabel: '05',
    id: 'gare-05',
    name: 'L’Express du Futur',
    subtitle: 'Ambitions',
    sectionKey: 'ambitions',
    stopT: 0.80,
    badgeTitle: 'Visionnaire du futur',
    badgeDescription: 'A contemplé mes objectifs en Data Science, IA et innovation technologique.',
    missionLabel: 'Explorer l’Express du Futur',
    discoverActionLabel: 'Découvrir mes ambitions et perspectives',
    landmarks: [
      {
        id: 'g5-observatoire',
        label: 'Observatoire Data & IA',
        shortHint: 'Vision et solutions innovantes',
        localOffsetX: -115,
        localOffsetY: -145,
        visualKind: 'observatory',
        accentHex: '#184354',
      },
      {
        id: 'g5-holo',
        label: 'Écrans Holographiques',
        shortHint: 'Objectifs & domaines d’évolution',
        localOffsetX: 90,
        localOffsetY: -145,
        visualKind: 'holo_screen',
        accentHex: '#D8B77A',
      },
    ],
  },
  {
    index: 5,
    numberLabel: '06',
    id: 'gare-06',
    name: 'Le Terminus des Rencontres',
    subtitle: 'Destination finale & Contact',
    sectionKey: 'contact',
    stopT: 0.96,
    badgeTitle: 'Voyageur accompli',
    badgeDescription: 'A achevé l’intégralité du voyage jusqu’au Terminus des Rencontres.',
    missionLabel: 'Explorer le Terminus des Rencontres',
    discoverActionLabel: 'Accéder aux coordonnées, au CV et au formulaire',
    landmarks: [
      {
        id: 'g6-cv',
        label: 'Kiosque CV & Réseaux',
        shortHint: 'Coordonnées et téléchargement du CV',
        localOffsetX: -115,
        localOffsetY: -135,
        visualKind: 'cv_kiosk',
        accentHex: '#B87D4B',
      },
      {
        id: 'g6-contact',
        label: 'Pavillon de Contact',
        shortHint: 'Formulaire & message final',
        localOffsetX: 95,
        localOffsetY: -140,
        visualKind: 'contact_pavilion',
        accentHex: '#184354',
      },
    ],
  },
];
