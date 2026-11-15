export interface SkillItem {
  name: string;
  description: string;
  iconKey: string;
}

export interface SkillCategory {
  id: string;
  title: string;
  subtitle: string;
  accentHex: string;
  items: SkillItem[];
}

export const SKILL_CATEGORIES: SkillCategory[] = [
  {
    id: 'development',
    title: 'Développement',
    subtitle: 'Conception d’interfaces réactives et d’architectures back-end structurées.',
    accentHex: '#184354',
    items: [
      {
        name: 'Python',
        description: 'Langage pivot pour le développement back-end, l’automatisation et le traitement de données.',
        iconKey: 'code',
      },
      {
        name: 'PHP',
        description: 'Développement côté serveur pour la création de sites dynamiques et d’applications web.',
        iconKey: 'code',
      },
      {
        name: 'JavaScript',
        description: 'Logique interactive côté client, gestion d’états dynamiques et intégration d’API.',
        iconKey: 'braces',
      },
      {
        name: 'HTML',
        description: 'Structuration sémantique et accessible des pages et applications web.',
        iconKey: 'layout',
      },
      {
        name: 'CSS',
        description: 'Mise en page responsive, systèmes visuels soignés et animations fluides.',
        iconKey: 'palette',
      },
      {
        name: 'React',
        description: 'Création d’interfaces modulaires par composants avec gestion d’état moderne.',
        iconKey: 'atom',
      },
      {
        name: 'Django',
        description: 'Développement d’applications web robustes et d’API REST sécurisées en Python.',
        iconKey: 'server',
      },
    ],
  },
  {
    id: 'data',
    title: 'Data et analyse',
    subtitle: 'Préparation, interrogation et restitution visuelle des données.',
    accentHex: '#274D3A',
    items: [
      {
        name: 'Pandas',
        description: 'Manipulation, nettoyage et transformation de jeux de données tabulaires.',
        iconKey: 'table',
      },
      {
        name: 'NumPy',
        description: 'Calcul numérique vectorisé et structuration de matrices pour l’analyse.',
        iconKey: 'sigma',
      },
      {
        name: 'Analyse de données',
        description: 'Exploration statistique, identification de tendances et synthèse d’indicateurs.',
        iconKey: 'search',
      },
      {
        name: 'Visualisation de données',
        description: 'Représentation graphique claire permettant de communiquer rapidement les résultats.',
        iconKey: 'chart',
      },
      {
        name: 'SQL',
        description: 'Interrogation relationnelle, jointures, agrégations et modélisation de requêtes.',
        iconKey: 'database',
      },
      {
        name: 'Microsoft Fabric',
        description: 'Environnement unifié d’analytique, d’ingénierie des données et de gouvernance.',
        iconKey: 'layers',
      },
      {
        name: 'Power BI',
        description: 'Création de rapports interactifs et de tableaux de bord décisionnels.',
        iconKey: 'barChart',
      },
    ],
  },
  {
    id: 'ai',
    title: 'Intelligence artificielle',
    subtitle: 'Intégration de modèles génératifs et fondamentaux du Machine Learning.',
    accentHex: '#235D73',
    items: [
      {
        name: 'IA générative',
        description: 'Conception de flux intelligents exploitant la génération et la compréhension de contenu.',
        iconKey: 'cpu',
      },
      {
        name: 'Gemini',
        description: 'Intégration des modèles Gemini dans des applications concrètes d’aide et d’analyse.',
        iconKey: 'orbit',
      },
      {
        name: 'Notions de Machine Learning',
        description: 'Compréhension des concepts d’apprentissage supervisé, d’entraînement et d’évaluation.',
        iconKey: 'network',
      },
    ],
  },
  {
    id: 'tools',
    title: 'Outils',
    subtitle: 'Environnement quotidien de versioning, d’édition et d’expérimentation.',
    accentHex: '#B87D4B',
    items: [
      {
        name: 'Git et GitHub',
        description: 'Gestion de versions, travail par branches, suivi de code et collaboration.',
        iconKey: 'gitBranch',
      },
      {
        name: 'Visual Studio Code',
        description: 'Éditeur principal pour le développement full-stack, le débogage et l’organisation.',
        iconKey: 'terminal',
      },
      {
        name: 'Google Colab',
        description: 'Notebooks interactifs pour l’exploration Python, la Data Science et les tests IA.',
        iconKey: 'notebook',
      },
    ],
  },
];
