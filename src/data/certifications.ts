export interface CertificationItem {
  id: string;
  title: string;
  issuer: string;
  domain: string;
  summary: string;
  proofStatus: 'available' | 'pending';
  proofImageUrl?: string;
  credentialCode?: string;
  issuedDate?: string;
}

export interface HackathonItem {
  id: string;
  eventTitle: string;
  resultBadge: string;
  isVictory: boolean;
  distinctionSummary: string;
  highlights: string[];
  photos: { url: string; caption: string }[];
}

export const CERTIFICATIONS_DATA: CertificationItem[] = [
  {
    id: 'dp-600',
    title: 'Microsoft DP-600 — Fabric Analytics Engineer Associate',
    issuer: 'Microsoft',
    domain: 'Analytique de données & Microsoft Fabric',
    summary:
      'Certification attestant les compétences de conception, d’implémentation et de gestion de solutions analytiques à grande échelle dans Microsoft Fabric.',
    proofStatus: 'available',
    proofImageUrl: '/assets/aistudio/WhatsApp_Image_2026-11-15_at_16.24_837002d6.jpeg',
    credentialCode: 'ID : MS1101390718 · N° 742A9C-18KXQ2',
    issuedDate: 'Obtenue le 19 août 2026',
  },
  {
    id: 'sololearn-dataviz',
    title: 'Sololearn — Data Visualization',
    issuer: 'Sololearn',
    domain: 'Visualisation de données',
    summary:
      'Formation dédiée à la représentation visuelle claire des jeux de données et au choix des graphiques adaptés à chaque analyse.',
    proofStatus: 'available',
    proofImageUrl: '/assets/aistudio/WhatsApp_Image_2026-11-15_at_16.24._245891da.jpeg',
    credentialCode: 'Certificat CC-1WACXWKA',
    issuedDate: 'Délivré le 2 janvier 2026',
  },
  {
    id: 'sololearn-data-ai',
    title: 'Sololearn — Data Analysis with AI',
    issuer: 'Sololearn',
    domain: 'Analyse de données & IA',
    summary:
      'Parcours axé sur l’utilisation d’outils d’intelligence artificielle pour accélérer l’exploration, l’interprétation et la synthèse de données.',
    proofStatus: 'available',
    proofImageUrl: '/assets/aistudio/WhatsApp_Image_2026-11-15_at_16.24.23_de40acd6.jpeg',
    credentialCode: 'Certificat CC-VYV7OYDL',
    issuedDate: 'Délivré le 2 janvier 2026',
  },
  {
    id: 'sololearn-sql',
    title: 'Sololearn — Introduction to SQL',
    issuer: 'Sololearn',
    domain: 'Bases de données relationnelles',
    summary:
      'Acquisition des fondamentaux du langage SQL pour interroger, filtrer, trier et agréger des données relationnelles.',
    proofStatus: 'available',
    proofImageUrl: '/assets/aistudio/WhatsApp_Image_2026-11-15_at_16.24.2_627bfab9.jpeg',
    credentialCode: 'Certificat CC-EHLRAYYY',
    issuedDate: 'Délivré le 23 décembre 2025',
  },
  {
    id: 'cursa-google-ai',
    title: 'Formation Google AI via Cursa',
    issuer: 'Cursa / Google AI',
    domain: 'Intelligence artificielle',
    summary:
      'Formation consacrée à la compréhension et à la mise en pratique des concepts et outils autour de Google AI.',
    proofStatus: 'available',
    proofImageUrl: '/assets/aistudio/WhatsApp_Image_2026-11-15_at_16.27.35_741d1a48.jpeg',
    credentialCode: 'Certificat Cursa u6880448',
    issuedDate: 'Terminée le 25 août 2025',
  },
  {
    id: 'cursa-django',
    title: 'Cursa — Apprendre à coder avec Django',
    issuer: 'Cursa',
    domain: 'Développement web back-end Python',
    summary:
      'Formation dédiée à la création de sites et d’applications web en Python et Django.',
    proofStatus: 'available',
    proofImageUrl: '/assets/aistudio/WhatsApp_Image_2026-11-15_at_16.27.15_6892f94b.jpeg',
    credentialCode: 'Certificat Cursa u6880448',
    issuedDate: '13 au 16 janvier 2026',
  },
];

export const HACKATHONS_DATA: HackathonItem[] = [
  {
    id: 'google-build-with-ai',
    eventTitle: 'Google Build with AI',
    resultBadge: 'Compétition remportée',
    isVictory: true,
    distinctionSummary:
      'Victoire marquante au cœur de mon parcours, illustrant ma capacité à concevoir et défendre une solution innovante autour de l’intelligence artificielle.',
    highlights: [
      'Distinction majeure : compétition remportée',
      'Conception rapide et démonstration sous contrainte de temps',
      'Valorisation de l’intelligence artificielle appliquée',
    ],
    photos: [
      {
        url: '/assets/aistudio/WhatsApp_Image_2026-11-15_at_16.53.28_d4964759.jpeg',
        caption: 'Remise des certificats et médailles — Google Build with AI',
      },
    ],
  },
  {
    id: 'vibeathon-2026',
    eventTitle: 'Vibeathon 2026',
    resultBadge: '5e place parmi les équipes finalistes',
    isVictory: false,
    distinctionSummary:
      'Participation finaliste mettant en lumière l’innovation agricole propulsée par l’intelligence artificielle, en alliant créativité, cohésion d’équipe et réponse à un besoin concret du terrain.',
    highlights: [
      'Contribution à l’innovation agricole grâce à l’intelligence artificielle',
      'Travail d’équipe et coordination pluridisciplinaire',
      'Créativité et résolution de problèmes concrets',
      'Conception d’une solution technologique répondant à un besoin réel',
    ],
    photos: [
      {
        url: '/assets/aistudio/WhatsApp_Image_2026-11-15_at_16.55.54_69b46cf2.jpeg',
        caption: 'Vibeathon Côte d’Ivoire 2026 — Équipe finaliste',
      },
    ],
  },
];
