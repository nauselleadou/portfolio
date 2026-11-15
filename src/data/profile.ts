export interface ProfileData {
  projectTitle: string;
  slogan: string;
  welcomeHomeText: string;
  welcomeJourneyText: string;
  avatarPath: string;
  about: {
    greeting: string;
    presentation: string;
    academicDomain: string;
    academicSummary: string;
    interests: string[];
    passions: {
      title: string;
      description: string;
    }[];
    ambitionsSummary: string;
  };
  futureAmbitions: {
    headline: string;
    dataScienceVision: string;
    aiVision: string;
    innovationGoal: string;
    professionalObjectives: string[];
    growthDomains: string[];
  };
  closingMessage: string;
}

export const PROFILE_DATA: ProfileData = {
  projectTitle: 'MON VOYAGE NUMÉRIQUE',
  slogan: 'UN VOYAGE AU CŒUR DE MON UNIVERS NUMÉRIQUE.',
  welcomeHomeText:
    'Bienvenue à bord ! Préparez-vous à découvrir mon parcours, mes compétences, mes projets et mes ambitions à travers un voyage interactif.',
  welcomeJourneyText:
    'Bienvenue à bord ! Embarquez pour un voyage à travers mon parcours, mes compétences, mes réalisations et mes ambitions. Chaque gare vous réserve une nouvelle découverte.',
  avatarPath: '/assets/aistudio/WhatsApp_Image_2026-11-15_at_16.54.47_32b55e30.jpeg',
  about: {
    greeting: 'Bienvenue dans mon univers !',
    presentation:
      'Je suis Adou Marie Nauselle Kimberly Aude, passionnée par l’informatique, le développement de solutions numériques et les nouvelles technologies.\n\nAprès une licence en informatique à AGITEL Formation, je poursuis actuellement mes études en Master à l’Université Polytechnique de Bingerville, avec une spécialisation en Data Science et Intelligence Artificielle.\n\nPassionnée par la création numérique et l’exploration des données, j’ai conçu ce voyage interactif comme une porte d’entrée vivante vers mon univers professionnel. Chaque étape reflète ma curiosité technique, ma rigueur et mon envie de bâtir des solutions utiles.',
    academicDomain: 'Informatique · Data Science & Intelligence Artificielle',
    academicSummary:
      'Titulaire d’une licence en informatique obtenue à AGITEL Formation, je poursuis actuellement un Master à l’Université Polytechnique de Bingerville avec une spécialisation en Data Science et Intelligence Artificielle.',
    interests: [
      'Conception d’applications web et mobiles centrées sur l’usage réel',
      'Exploitation et visualisation de données pour éclairer la décision',
      'Exploration des usages responsables de l’intelligence artificielle',
      'Veille technologique, prototypage et apprentissage continu',
    ],
    passions: [
      {
        title: 'Développement informatique',
        description:
          'Concevoir des architectures claires et des interfaces fluides reliant front-end moderne et back-end structuré.',
      },
      {
        title: 'Data Science',
        description:
          'Transformer des données brutes en analyses lisibles, tableaux de bord exploitables et indicateurs pertinents.',
      },
      {
        title: 'Intelligence artificielle',
        description:
          'Intégrer l’IA générative et les approches d’apprentissage automatique au service d’applications à fort impact.',
      },
    ],
    ambitionsSummary:
      'Rejoindre ou collaborer sur des projets technologiques exigeants où le génie logiciel, la donnée et l’intelligence artificielle se complètent pour créer des outils durables.',
  },
  futureAmbitions: {
    headline: 'Tracer de nouvelles lignes entre la donnée, l’IA et le génie logiciel',
    dataScienceVision:
      'Approfondir la modélisation analytique, la structuration de plateformes de données modernes et la restitution décisionnelle claire pour accompagner les organisations.',
    aiVision:
      'Concevoir des applications augmentées par l’intelligence artificielle générative et le Machine Learning, adaptées aux réalités locales et aux besoins métiers concrets.',
    innovationGoal:
      'Développer des solutions technologiques innovantes, accessibles et fiables qui simplifient le quotidien des utilisateurs et valorisent l’information.',
    professionalObjectives: [
      'Contribuer à des projets combinant ingénierie web/mobile, pipelines de données et intelligence artificielle.',
      'Poursuivre le perfectionnement pratique sur les environnements analytiques et le cloud data.',
      'Participer à des équipes pluridisciplinaires favorisant l’impact mesurable et la qualité logicielle.',
    ],
    growthDomains: [
      'Ingénierie des données & Microsoft Fabric',
      'Machine Learning appliqué et évaluation de modèles',
      'Architecture d’applications intelligentes avec IA générative',
      'Conception de produits numériques à fort impact terrain',
    ],
  },
  closingMessage:
    'Merci d’avoir voyagé à travers mon univers numérique ! Le voyage s’arrête ici, mais les possibilités de collaboration ne font que commencer.',
};
