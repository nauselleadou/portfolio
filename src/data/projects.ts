export interface ProjectScreenshot {
  url: string;
  title: string;
  caption?: string;
}

export interface ProjectItem {
  id: string;
  title: string;
  category: string;
  status: 'published' | 'upcoming';
  summary: string;
  objective: string;
  valueAdded?: string;
  domain?: string;
  features: string[];
  technologies: string[];
  accentHex: string;
  /** Dedicated folder under /public/assets/projects/<project-id>/ for real screenshots */
  screenshotsFolder: string;
  /** Real application screenshots only (empty until provided) */
  screenshots: ProjectScreenshot[];
  /** Planned slots documented for future additions */
  plannedSlots?: string[];
}

export const PROJECTS_DATA: ProjectItem[] = [
  {
    id: 'agitel-mobile',
    title: 'AGITEL Mobile',
    category: 'Application web et suivi académique',
    status: 'published',
    summary:
      'Application de gestion des emplois du temps et de suivi des enseignements.',
    objective:
      'Centraliser la planification pédagogique, fiabiliser le pointage des séances via QR Code et offrir un pilotage administratif clair des volumes horaires.',
    features: [
      'Consultation des emplois du temps.',
      'Génération de QR Codes par séance.',
      'Validation de présence des enseignants.',
      'Suivi des volumes horaires.',
      'Tableau de bord administratif.',
      'Notifications et rappels.',
    ],
    technologies: [
      'React',
      'Vite',
      'Tailwind CSS',
      'Django REST Framework',
      'Python',
      'MySQL',
    ],
    accentHex: '#184354',
    screenshotsFolder: '/assets/projects/agitel-mobile/',
    screenshots: [
      {
        url: '/assets/projects/agitel-mobile/tableau-de-bord-admin.png',
        title: 'Tableau de bord administrateur & indicateurs KPI',
      },
      {
        url: '/assets/projects/agitel-mobile/emploi-du-temps.png',
        title: 'Emploi du temps semestriel interactif',
      },
      {
        url: '/assets/projects/agitel-mobile/qr-code-emargement.png',
        title: 'Validation de présence par QR Code sécurisé',
      },
      {
        url: '/assets/projects/agitel-mobile/cahier-de-texte-fiche.png',
        title: 'Cahier de texte & fiche pédagogique',
      },
      {
        url: '/assets/projects/agitel-mobile/avancement-cours.png',
        title: 'Suivi du volume horaire & avancement des cours',
      },
      {
        url: '/assets/projects/agitel-mobile/execution-programme.png',
        title: 'Évolutivité du taux d’exécution du programme',
      },
      {
        url: '/assets/projects/agitel-mobile/cloture-certification.png',
        title: 'Clôture de séance & certification horodatée',
      },
      {
        url: '/assets/projects/agitel-mobile/annulation-seance.png',
        title: 'Annulation de séance & reprogrammation automatique',
      },
      {
        url: '/assets/projects/agitel-mobile/reprogrammation-creneaux.png',
        title: 'Propositions de créneaux de rattrapage sans conflit',
      },
      {
        url: '/assets/projects/agitel-mobile/centre-notifications.png',
        title: 'Centre de notifications In-App & alertes SMTP',
      },
    ],
  },
  {
    id: 'agrivigil-ai',
    title: 'AgriVigil AI',
    category: 'Application mobile & Intelligence artificielle',
    status: 'published',
    summary:
      'Application mobile intelligente d’accompagnement agricole destinée au contexte ivoirien.',
    objective:
      'Mettre l’intelligence artificielle et les données géospatiales au service des acteurs agricoles avec des échanges en temps réel.',
    features: [
      'Accompagnement agricole contextualisé grâce à Gemini AI.',
      'Gestion des données géospatiales via PostgreSQL/PostGIS.',
      'Communication temps réel propulsée par WebSockets.',
    ],
    technologies: [
      'React Native',
      'Expo',
      'Django REST Framework',
      'PostgreSQL/PostGIS',
      'Gemini AI',
      'WebSockets',
    ],
    accentHex: '#274D3A',
    screenshotsFolder: '/assets/projects/agrivigil-ai/',
    screenshots: [
      {
        url: '/assets/projects/agrivigil-ai/accueil-diagnostic.jpeg',
        title: 'Accueil & scanner de diagnostic IA',
      },
      {
        url: '/assets/projects/agrivigil-ai/diagnostic-cabosses.jpeg',
        title: 'Diagnostic IA & guide de traitement local',
      },
      {
        url: '/assets/projects/agrivigil-ai/suivi-temporel.jpeg',
        title: 'Carnet de suivi temporel de l’infection',
      },
      {
        url: '/assets/projects/agrivigil-ai/alerte-sanitaire-carte.jpeg',
        title: 'Carte géospatiale & alerte sanitaire',
      },
    ],
  },
  {
    id: 'nappy-chic',
    title: 'Nappy Chic',
    category: 'Application web mobile-first · Stylebook & Réservation Intelligente',
    status: 'published',
    summary:
      'Application web mobile-first de type Stylebook & Réservation Intelligente conçue pour les salons de coiffure afro et nappy haut de gamme en Afrique de l’Ouest (Abidjan / Cocody, Côte d’Ivoire).',
    objective:
      'Résoudre les points de friction des salons traditionnels (durée imprévisible des tresses, flou sur les prix, gestion des stocks de mèches, incertitude du rendu) grâce à une expérience digitale immersive, prédictive et interactive.',
    features: [
      'Lookbook & catalogue interactif de coiffures protectrices (filtres, recherche, avis certifiés).',
      'Simulateur de Look IA (Try-On virtuel) avec comparateur Avant / Après et teintes.',
      'Assistante Beauté Capillaire IA (« Amina ») selon budget, durée et style.',
      'Personnalisation & devis dynamique en temps réel (tarifs en FCFA et durée exacte).',
      'Réservation intelligente, paiement Mobile Money (Wave, Orange Money, MTN MoMo, Moov Flooz) et billet QR Code.',
      'Tableau de bord salon : chiffre d’affaires, planning, gestion des stocks de mèches et promotions.',
    ],
    technologies: [
      'React 19',
      'TypeScript',
      'Vite 8',
      'Tailwind CSS v4',
      'Motion',
      'Lucide React',
      '@google/genai',
      'HTML5 Canvas 2D',
      'QR Code SVG',
      'Node.js',
      'Express',
    ],
    accentHex: '#235D73',
    screenshotsFolder: '/assets/projects/nappy-chic/',
    screenshots: [
      {
        url: '/assets/projects/nappy-chic/hero-accueil.png',
        title: 'Accueil éditorial mobile-first',
      },
      {
        url: '/assets/projects/nappy-chic/lookbook-modele.png',
        title: 'Lookbook — Tresses & Extensions Haute Couture',
      },
      {
        url: '/assets/projects/nappy-chic/personnalisation-devis.png',
        title: 'Personnalisation sur-mesure & devis dynamique',
      },
      {
        url: '/assets/projects/nappy-chic/rendez-vous-pass.png',
        title: 'Confirmation de rendez-vous & Pass QR',
      },
    ],
  },
  {
    id: 'eureka',
    title: 'EUREKA — Dashboard d’analyse des ventes',
    category: 'Data Analytics & Business Intelligence',
    status: 'published',
    summary:
      'Conception d’un tableau de bord interactif d’analyse des ventes pour EUREKA, une boutique en ligne spécialisée dans la commercialisation de bijoux artisanaux.',
    objective:
      'Transformer les données commerciales en informations exploitables afin de suivre les performances de la boutique, comprendre le comportement des ventes et faciliter la prise de décisions stratégiques.',
    valueAdded:
      'Ce tableau de bord permet d’obtenir une vision synthétique de l’activité commerciale d’EUREKA, d’identifier les produits les plus performants et de mieux orienter les décisions commerciales grâce aux données.',
    domain: 'Analyse de données, Data Visualization et Business Intelligence.',
    features: [
      'Suivi du chiffre d’affaires et du nombre de commandes.',
      'Analyse de l’évolution des ventes dans le temps.',
      'Identification des bijoux et catégories les plus vendus.',
      'Analyse du panier moyen.',
      'Suivi des performances commerciales par période.',
      'Visualisation des tendances et des indicateurs clés de performance (KPI).',
    ],
    technologies: [
      'Excel',
      'Analyse de données',
      'Data Visualization',
      'Business Intelligence',
    ],
    accentHex: '#184354',
    screenshotsFolder: '/assets/projects/eureka/',
    screenshots: [
      {
        url: '/assets/projects/eureka/ca-categories.png',
        title: 'Évolution du CA mensuel & catégories de bijoux',
      },
      {
        url: '/assets/projects/eureka/canaux-top-clients.png',
        title: 'Répartition par canal de vente & Top 10 clients',
      },
      {
        url: '/assets/projects/eureka/insights-recommandations.png',
        title: 'Insights clés & recommandations stratégiques',
      },
    ],
  },
];
