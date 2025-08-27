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
    description: 'O cargo de Júnior na Starbem representa a porta de entrada para a carreira na empresa, com foco no aprendizado contínuo e no desenvolvimento de habilidades técnicas e comportamentais.',
    responsibilities: [
      'Aprendizado e Desenvolvimento: Participa de treinamentos, revisões de código e práticas de melhoria contínua',
      'Execução Supervisionada: Realiza tarefas sob orientação, garantindo a entrega de soluções funcionais e de qualidade',
      'Participação no Time: Colabora com diferentes áreas, aprendendo a dinâmica dos processos e metodologias da empresa',
      'Boas Práticas e Padronização: Segue diretrizes estabelecidas, adquirindo conhecimento sobre processos eficientes',
      'Adaptação e Evolução: Se mantém aberto ao aprendizado, recebendo feedback e ajustando sua abordagem conforme necessário',
      'Uso de Inteligência Artificial: Utiliza ferramentas de IA para otimizar tarefas e aumentar produtividade'
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
    description: 'O cargo de Pleno na Starbem representa um profissional com autonomia crescente e capacidade de execução independente, contribuindo ativamente para o desenvolvimento de soluções.',
    responsibilities: [
      'Autonomia na Execução: Realiza tarefas e projetos com independência, garantindo qualidade e eficiência',
      'Participação Ativa: Contribui para discussões técnicas e estratégicas dentro do time',
      'Colaboração Interdisciplinar: Trabalha de forma integrada com diferentes times (Engenharia, Produto, Design, QA, Engenharia, Dados)',
      'Melhoria Contínua: Identifica oportunidades de otimização e boas práticas, contribuindo para a evolução dos processos',
      'Apoio e Mentoria: Ajuda no desenvolvimento de profissionais júniores, compartilhando conhecimento e boas práticas',
      'Uso de Inteligência Artificial: Usa ferramentas de IA para aumentar a produtividade e propor soluções inovadoras'
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
    description: 'O cargo de Sênior na Starbem representa um nível de alta autonomia e responsabilidade técnica, sendo referência dentro dos times.',
    responsibilities: [
      'Liderança Técnica: Atua como referência dentro do time, participando ativamente na definição de soluções',
      'Execução e Eficiência: Entrega soluções de alto impacto, garantindo qualidade, segurança e eficiência',
      'Mentoria: Apoia o desenvolvimento dos profissionais júniores e plenos, compartilhando conhecimento e boas práticas',
      'Colaboração Estratégica: Trabalha em conjunto com Product Owners, Designers, QAs e outras áreas',
      'Resolução de Problemas: Identifica gargalos, propõe soluções inovadoras e atua na melhoria contínua dos processos',
      'Uso de Inteligência Artificial: Utiliza IA para otimizar tarefas e implementa soluções de automação baseadas em IA'
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
    description: 'O cargo de Staff na Starbem representa um dos níveis mais altos na trilha de Liderança Técnica, sendo referência técnica e comportamental na empresa.',
    responsibilities: [
      'Liderança Técnica: Atua como principal influenciador nas decisões e na evolução da plataforma da empresa',
      'Mentoria e Desenvolvimento: Suporte e mentoria técnica para times, garantindo crescimento profissional da equipe',
      'Inovação e Pesquisa: Avalia e experimenta novas tecnologias, frameworks e soluções de mercado',
      'Definição de Padrões: Estabelece guidelines técnicos, melhores práticas e diretrizes para o uso de tecnologias',
      'Escalabilidade e Performance: Garante que as soluções desenvolvidas sejam eficientes, seguras e sustentáveis',
      'Colaboração Estratégica: Trabalha com lideranças de Produto, Engenharia, Dados e Suporte',
      'Uso de Inteligência Artificial: Implementa soluções baseadas em IA e define padrões de uso de IA na empresa'
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
    id: 'tech-lead',
    title: 'Tech Lead',
    track: 'management',
    level: 4,
    description: 'O Tech Lead na Starbem é um papel fundamental na liderança técnica dos times, atuando na interseção entre tecnologia, produto e pessoas.',
    responsibilities: [
      'Liderança Técnica: Orienta o time na definição de arquiteturas, padrões de código e melhores práticas',
      'Entrega e Qualidade: Garante que as entregas do time atendam aos padrões de excelência técnica e aos requisitos de negócio',
      'Mentoria e Desenvolvimento: Atua como referência para o time, ajudando no crescimento de engenheiros Júnior, Pleno e Sênior',
      'Tomada de Decisão Estratégica: Colabora com Product Owners, Designers e outras áreas para alinhar tecnologia às necessidades do produto',
      'Melhoria Contínua: Identifica e implementa otimizações nos processos de desenvolvimento e infraestrutura',
      'Uso de Inteligência Artificial: Identifica oportunidades para aplicar IA na otimização de processos e desenvolvimento de produtos'
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
    id: 'tech-manager',
    title: 'Tech Manager',
    track: 'management',
    level: 5,
    description: 'O Tech Manager na Starbem é um líder sênior responsável pela estratégia e execução de toda a engenharia, com foco na gestão de múltiplas equipes e alinhamento com objetivos de negócio.',
    responsibilities: [
      'Liderança Organizacional: Define estratégia de engenharia e lidera organização técnica',
      'Gestão de Múltiplas Equipes: Gerencia diversos times de desenvolvimento e Tech Leads',
      'Alinhamento Estratégico: Alinha objetivos técnicos com metas de negócio da empresa',
      'Desenvolvimento de Cultura: Desenvolve e mantém cultura de engenharia de excelência',
      'Gestão de Pessoas: Responsável pelo desenvolvimento de carreira e performance dos colaboradores',
      'Inovação e Tecnologia: Lidera iniciativas de inovação tecnológica e adoção de novas ferramentas'
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
