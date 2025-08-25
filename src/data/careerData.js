/**
 * @typedef {'management' | 'technical'} CareerTrack
 */

/**
 * @typedef {Object} CareerLevel
 * @property {string} id
 * @property {string} title
 * @property {CareerTrack} track
 * @property {number} level
 * @property {string} description
 * @property {string[]} responsibilities
 * @property {string[]} technicalSkills
 * @property {string[]} behavioralSkills
 * @property {string[]} performanceIndicators
 * @property {Object} resources
 * @property {string[]} resources.courses
 * @property {string[]} resources.mentors
 * @property {string[]} resources.projects
 */

/**
 * @typedef {Object} UserProfile
 * @property {string} id
 * @property {string} name
 * @property {string} email
 * @property {string} currentLevel
 * @property {string} area
 * @property {CareerTrack} track
 */

/**
 * @typedef {'completed' | 'current' | 'next' | 'future'} CareerStatus
 */

// Mock user data
export const mockUser = {
  id: '1',
  name: 'Ana Silva',
  email: 'ana.silva@starbem.com',
  currentLevel: 'pleno-backend',
  area: 'Back-end',
  track: 'technical'
};

// Career levels data
export const careerLevels = [
  // Technical Track - Backend
  {
    id: 'junior-backend',
    title: 'Engenheiro Júnior',
    track: 'technical',
    level: 1,
    description: 'Desenvolvedor iniciante focado em aprender as bases da engenharia de software.',
    responsibilities: [
      'Desenvolver funcionalidades simples com supervisão',
      'Participar ativamente de code reviews',
      'Seguir padrões de código estabelecidos pela equipe',
      'Colaborar em projetos de pequeno a médio porte'
    ],
    technicalSkills: [
      'Linguagem principal (Python/Java/Node.js)',
      'Git e controle de versão',
      'Banco de dados SQL básico',
      'APIs REST',
      'Testes unitários básicos'
    ],
    behavioralSkills: [
      'Comunicação clara',
      'Proatividade para aprender',
      'Trabalho em equipe',
      'Receber e aplicar feedback'
    ],
    performanceIndicators: [
      'Entrega de tarefas no prazo',
      'Qualidade do código',
      'Participação em discussões técnicas',
      'Evolução técnica demonstrável'
    ],
    resources: {
      courses: ['Clean Code', 'Design Patterns', 'Database Fundamentals'],
      mentors: ['Senior Engineers', 'Tech Leads'],
      projects: ['Bug fixes', 'Feature development', 'Code refactoring']
    }
  },
  {
    id: 'pleno-backend',
    title: 'Engenheiro Pleno',
    track: 'technical',
    level: 2,
    description: 'Desenvolvedor experiente capaz de trabalhar de forma independente em projetos complexos.',
    responsibilities: [
      'Desenvolver funcionalidades complexas de forma autônoma',
      'Mentorear desenvolvedores juniores',
      'Participar do design de arquitetura',
      'Liderar pequenos projetos técnicos'
    ],
    technicalSkills: [
      'Arquitetura de sistemas',
      'Design patterns avançados',
      'Performance optimization',
      'Microserviços',
      'CI/CD pipelines',
      'Monitoring e observabilidade'
    ],
    behavioralSkills: [
      'Liderança técnica',
      'Mentoria',
      'Comunicação com stakeholders',
      'Resolução de problemas complexos'
    ],
    performanceIndicators: [
      'Entrega de projetos complexos',
      'Qualidade de mentoria oferecida',
      'Contribuição para arquitetura',
      'Impacto nos resultados do time'
    ],
    resources: {
      courses: ['System Design', 'Microservices Architecture', 'Leadership Skills'],
      mentors: ['Staff Engineers', 'Engineering Managers'],
      projects: ['Architecture design', 'Performance improvements', 'Team mentoring']
    }
  },
  {
    id: 'senior-backend',
    title: 'Engenheiro Sênior',
    track: 'technical',
    level: 3,
    description: 'Especialista técnico com visão sistêmica e capacidade de influenciar decisões arquiteturais.',
    responsibilities: [
      'Definir arquitetura de sistemas críticos',
      'Mentorear múltiplos desenvolvedores',
      'Influenciar decisões técnicas da empresa',
      'Resolver problemas técnicos complexos'
    ],
    technicalSkills: [
      'Arquitetura distribuída',
      'Escalabilidade',
      'Security best practices',
      'Multiple technology stacks',
      'DevOps avançado',
      'Data engineering'
    ],
    behavioralSkills: [
      'Pensamento estratégico',
      'Influência sem autoridade',
      'Comunicação executiva',
      'Visão de produto'
    ],
    performanceIndicators: [
      'Impacto organizacional',
      'Qualidade das decisões arquiteturais',
      'Desenvolvimento de talentos',
      'Inovação técnica'
    ],
    resources: {
      courses: ['Enterprise Architecture', 'Strategic Thinking', 'Technical Leadership'],
      mentors: ['Principal Engineers', 'CTOs'],
      projects: ['Cross-team initiatives', 'Technical strategy', 'Innovation projects']
    }
  },
  {
    id: 'staff-backend',
    title: 'Staff Engineer',
    track: 'technical',
    level: 4,
    description: 'Líder técnico sênior com impacto organizacional e visão estratégica.',
    responsibilities: [
      'Definir direção técnica da empresa',
      'Liderar iniciativas cross-funcionais',
      'Desenvolver estratégias de longo prazo',
      'Ser referência técnica externa'
    ],
    technicalSkills: [
      'Enterprise architecture',
      'Technology strategy',
      'Innovation leadership',
      'Cross-platform expertise',
      'Industry knowledge',
      'Research & Development'
    ],
    behavioralSkills: [
      'Visão estratégica',
      'Liderança organizacional',
      'Comunicação externa',
      'Pensamento sistêmico'
    ],
    performanceIndicators: [
      'Impacto no crescimento da empresa',
      'Qualidade da estratégia técnica',
      'Reconhecimento externo',
      'Desenvolvimento organizacional'
    ],
    resources: {
      courses: ['Executive Leadership', 'Technology Strategy', 'Innovation Management'],
      mentors: ['VPs of Engineering', 'External advisors'],
      projects: ['Company-wide initiatives', 'Technology vision', 'External partnerships']
    }
  },
  {
    id: 'principal-backend',
    title: 'Principal Engineer',
    track: 'technical',
    level: 5,
    description: 'Engenheiro principal com impacto tecnológico em toda a organização e indústria.',
    responsibilities: [
      'Definir visão tecnológica de longo prazo',
      'Influenciar padrões da indústria',
      'Liderar pesquisa e desenvolvimento avançado',
      'Ser referência técnica externa da empresa'
    ],
    technicalSkills: [
      'Visão tecnológica estratégica',
      'Research & Development',
      'Industry leadership',
      'Technology evangelism',
      'Patent development',
      'Academic collaboration'
    ],
    behavioralSkills: [
      'Thought leadership',
      'Public speaking',
      'Industry networking',
      'Strategic influence'
    ],
    performanceIndicators: [
      'Reconhecimento da indústria',
      'Impacto em padrões tecnológicos',
      'Inovações disruptivas',
      'Crescimento da marca técnica'
    ],
    resources: {
      courses: ['Technology Strategy', 'Industry Leadership', 'Research Methodology'],
      mentors: ['Industry leaders', 'Academic advisors'],
      projects: ['Industry standards', 'Research publications', 'Technology patents']
    }
  },
  {
    id: 'tech-manager',
    title: 'Tech Manager',
    track: 'management',
    level: 4,
    description: 'Gerente técnico responsável por pessoas e resultados de múltiplas equipes.',
    responsibilities: [
      'Gerenciar múltiplas equipes de desenvolvimento',
      'Definir roadmap técnico',
      'Desenvolvimento de carreira dos colaboradores',
      'Alinhar objetivos técnicos com negócio'
    ],
    technicalSkills: [
      'People management',
      'Strategic planning',
      'Budget management',
      'Cross-team coordination',
      'Hiring and recruitment'
    ],
    behavioralSkills: [
      'Liderança de líderes',
      'Visão estratégica',
      'Negociação',
      'Desenvolvimento de pessoas'
    ],
    performanceIndicators: [
      'Performance das equipes',
      'Retenção de talentos',
      'Entrega de objetivos',
      'Crescimento dos colaboradores'
    ],
    resources: {
      courses: ['People Management', 'Strategic Leadership', 'Budget Management'],
      mentors: ['Directors', 'VPs of Engineering'],
      projects: ['Organizational development', 'Strategic initiatives', 'Culture building']
    }
  },
  {
    id: 'tech-director',
    title: 'Tech Director',
    track: 'management',
    level: 5,
    description: 'Líder sênior responsável pela estratégia e execução de toda a engenharia.',
    responsibilities: [
      'Definir estratégia de engenharia',
      'Liderar organização técnica',
      'Alinhar com objetivos de negócio',
      'Desenvolver cultura de engenharia'
    ],
    technicalSkills: [
      'Organizational leadership',
      'Technology strategy',
      'Cultural development',
      'Executive communication',
      'Business alignment'
    ],
    behavioralSkills: [
      'Liderança executiva',
      'Pensamento estratégico',
      'Influência organizacional',
      'Comunicação de alto nível'
    ],
    performanceIndicators: [
      'Crescimento organizacional',
      'Alinhamento estratégico',
      'Cultura de engenharia',
      'Resultados de negócio'
    ],
    resources: {
      courses: ['Executive Leadership', 'Organizational Strategy', 'Culture Building'],
      mentors: ['CTOs', 'External executives'],
      projects: ['Organizational strategy', 'Cultural initiatives', 'Executive alignment']
    }
  }
];

// Helper functions
export const getCurrentLevelIndex = (currentLevelId) => {
  return careerLevels.findIndex(level => level.id === currentLevelId);
};

export const getCareerStatus = (levelId, currentLevelId) => {
  const currentIndex = getCurrentLevelIndex(currentLevelId);
  const levelIndex = careerLevels.findIndex(level => level.id === levelId);
  
  if (levelIndex < currentIndex) return 'completed';
  if (levelIndex === currentIndex) return 'current';
  if (levelIndex === currentIndex + 1) return 'next';
  return 'future';
};

export const getLevelsByTrack = (track) => {
  return careerLevels.filter(level => level.track === track);
};
