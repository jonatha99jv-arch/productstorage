/**
 * Dados de métricas organizados por sprints
 * Estrutura preparada para integração com Supabase
 */

// Mock data estruturado por time → sprint → métricas
export const sprintMetricsData = {
  teams: {
    aplicativo: {
      id: 'aplicativo',
      name: 'Time Aplicativo',
      color: 'orange',
      sprints: {
        'Sprint 10': {
          id: 'sprint-10',
          name: 'Sprint 10',
          period: 'Set 2024',
          startDate: '2024-09-01',
          endDate: '2024-09-14',
          metrics: {
            cycleTime: { value: '1sem 4d 11.3h', unit: 'time', rawValue: 11.3 }, // Melhorou (diminuiu)
            velocity: { value: 320, unit: 'points', rawValue: 320 }, // Melhorou (aumentou)
            wip: { value: 18, unit: 'items', rawValue: 18 }, // Melhorou (aumentou)
            bugRate: { value: 8, unit: 'bugs', rawValue: 8 }, // Melhorou (diminuiu)
            timeToResolveBugs: { value: '10.5h', unit: 'time', rawValue: 10.5 }, // Melhorou (diminuiu)
            scopeCreep: { value: 3, unit: 'points', rawValue: 3 } // Melhorou (diminuiu)
          }
        },
        'Sprint 9': {
          id: 'sprint-9',
          name: 'Sprint 9',
          period: 'Ago 2024',
          startDate: '2024-08-15',
          endDate: '2024-08-31',
          metrics: {
            cycleTime: { value: '2sem 3d 20.0h', unit: 'time', rawValue: 20.0 },
            velocity: { value: 300, unit: 'points', rawValue: 300 },
            wip: { value: 15, unit: 'items', rawValue: 15 },
            bugRate: { value: 12, unit: 'bugs', rawValue: 12 },
            timeToResolveBugs: { value: '15.2h', unit: 'time', rawValue: 15.2 },
            scopeCreep: { value: 5, unit: 'points', rawValue: 5 }
          }
        },
        'Sprint 8': {
          id: 'sprint-8',
          name: 'Sprint 8',
          period: 'Jul 2024',
          startDate: '2024-07-28',
          endDate: '2024-08-14',
          metrics: {
            cycleTime: { value: '2sem 2d 18.5h', unit: 'time', rawValue: 18.5 },
            velocity: { value: 280, unit: 'points', rawValue: 280 },
            wip: { value: 18, unit: 'items', rawValue: 18 },
            bugRate: { value: 15, unit: 'bugs', rawValue: 15 },
            timeToResolveBugs: { value: '18.0h', unit: 'time', rawValue: 18.0 },
            scopeCreep: { value: 8, unit: 'points', rawValue: 8 }
          }
        }
      }
    },

    integracoes: {
      id: 'integracoes',
      name: 'Time Integrações',
      color: 'blue',
      sprints: {
        'Sprint 11': {
          id: 'sprint-11',
          name: 'Sprint 11',
          period: 'Set 2024',
          startDate: '2024-09-15',
          endDate: '2024-09-28',
          metrics: {
            cycleTime: { value: '1sem 2d 8.0h', unit: 'time', rawValue: 8.0 }, // Melhorou (diminuiu)
            velocity: { value: 150, unit: 'points', rawValue: 150 }, // Melhorou (aumentou)
            wip: { value: 12, unit: 'items', rawValue: 12 }, // Melhorou (aumentou)
            bugRate: { value: 5, unit: 'bugs', rawValue: 5 }, // Melhorou (diminuiu)
            timeToResolveBugs: { value: '10.5h', unit: 'time', rawValue: 10.5 }, // Melhorou (diminuiu)
            scopeCreep: { value: 3, unit: 'points', rawValue: 3 } // Melhorou (diminuiu)
          }
        },
        'Sprint 10': {
          id: 'sprint-10',
          name: 'Sprint 10',
          period: 'Set 2024',
          startDate: '2024-09-01',
          endDate: '2024-09-14',
          metrics: {
            cycleTime: { value: '1sem 4d 12.0h', unit: 'time', rawValue: 12.0 },
            velocity: { value: 120, unit: 'points', rawValue: 120 },
            wip: { value: 10, unit: 'items', rawValue: 10 },
            bugRate: { value: 7, unit: 'bugs', rawValue: 7 },
            timeToResolveBugs: { value: '14.0h', unit: 'time', rawValue: 14.0 },
            scopeCreep: { value: 4, unit: 'points', rawValue: 4 }
          }
        },
        'Sprint 9': {
          id: 'sprint-9',
          name: 'Sprint 9',
          period: 'Ago 2024',
          startDate: '2024-08-15',
          endDate: '2024-08-31',
          metrics: {
            cycleTime: { value: '2sem 1d 15.0h', unit: 'time', rawValue: 15.0 },
            velocity: { value: 100, unit: 'points', rawValue: 100 },
            wip: { value: 12, unit: 'items', rawValue: 12 },
            bugRate: { value: 10, unit: 'bugs', rawValue: 10 },
            timeToResolveBugs: { value: '20.0h', unit: 'time', rawValue: 20.0 },
            scopeCreep: { value: 6, unit: 'points', rawValue: 6 }
          }
        }
      }
    },

    web: {
      id: 'web',
      name: 'Time Web',
      color: 'purple',
      sprints: {
        'Sprint 4': {
          id: 'sprint-4',
          name: 'Sprint 4',
          period: 'Set 2024',
          startDate: '2024-09-15',
          endDate: '2024-09-28',
          metrics: {
            cycleTime: { value: '1sem 1d 6.0h', unit: 'time', rawValue: 6.0 },
            velocity: { value: 200, unit: 'points', rawValue: 200 },
            wip: { value: 6, unit: 'items', rawValue: 6 },
            bugRate: { value: 3, unit: 'bugs', rawValue: 3 },
            timeToResolveBugs: { value: '8.0h', unit: 'time', rawValue: 8.0 },
            scopeCreep: { value: 2, unit: 'points', rawValue: 2 }
          }
        },
        'Sprint 3': {
          id: 'sprint-3',
          name: 'Sprint 3',
          period: 'Set 2024',
          startDate: '2024-09-01',
          endDate: '2024-09-14',
          metrics: {
            cycleTime: { value: '1sem 2d 10.0h', unit: 'time', rawValue: 10.0 },
            velocity: { value: 180, unit: 'points', rawValue: 180 },
            wip: { value: 8, unit: 'items', rawValue: 8 },
            bugRate: { value: 6, unit: 'bugs', rawValue: 6 },
            timeToResolveBugs: { value: '12.0h', unit: 'time', rawValue: 12.0 },
            scopeCreep: { value: 3, unit: 'points', rawValue: 3 }
          }
        }
      }
    }
  }
}

// Configuração das métricas
export const metricsConfig = {
  cycleTime: {
    name: 'Cycle Time',
    description: 'Tempo do início ao fim de uma feature',
    unit: 'time',
    isPositiveGrowthGood: false, // menor é melhor
    icon: 'Clock',
    needsRawValue: true, // precisa de valor numérico separado
    placeholder: 'Ex: 1sem 2d 10.5h',
    rawPlaceholder: 'Ex: 10.5 (em horas)'
  },
  velocity: {
    name: 'Velocity',
    description: 'Pontos de história entregues por sprint',
    unit: 'points',
    isPositiveGrowthGood: true, // maior é melhor
    icon: 'TrendingUp',
    needsRawValue: false, // já é valor numérico
    placeholder: 'Ex: 120'
  },
  wip: {
    name: 'WIP',
    description: 'Work in Progress - itens em andamento',
    unit: 'items',
    isPositiveGrowthGood: true, // maior é melhor (corrigido)
    icon: 'Activity',
    needsRawValue: false, // já é valor numérico
    placeholder: 'Ex: 8'
  },
  bugRate: {
    name: 'Bug Rate',
    description: 'Taxa de bugs por entrega',
    unit: 'bugs',
    isPositiveGrowthGood: false, // menor é melhor
    icon: 'AlertTriangle',
    needsRawValue: false, // já é valor numérico
    placeholder: 'Ex: 5'
  },
  timeToResolveBugs: {
    name: 'Time to Resolve Bugs',
    description: 'Tempo médio para resolver bugs',
    unit: 'time',
    isPositiveGrowthGood: false, // menor é melhor
    icon: 'Clock',
    needsRawValue: true, // precisa de valor numérico separado
    placeholder: 'Ex: 10.5h',
    rawPlaceholder: 'Ex: 10.5 (em horas)'
  },
  scopeCreep: {
    name: 'Scope Creep',
    description: 'Mudanças de escopo durante o desenvolvimento',
    unit: 'points',
    isPositiveGrowthGood: false, // menor é melhor
    icon: 'AlertTriangle',
    needsRawValue: false, // já é valor numérico
    placeholder: 'Ex: 5 pontos'
  }
}

// Helper functions
export const getTeamById = (teamId) => {
  return sprintMetricsData.teams[teamId] || null
}

export const getAllTeams = () => {
  return Object.values(sprintMetricsData.teams)
}

export const getTeamSprints = (teamId) => {
  const team = getTeamById(teamId)
  return team ? Object.keys(team.sprints).sort().reverse() : []
}

export const getSprintData = (teamId, sprintName) => {
  const team = getTeamById(teamId)
  return team?.sprints[sprintName] || null
}

// Função para calcular comparação entre sprints
export const calculateSprintComparison = (currentSprint, previousSprint, metricKey) => {
  if (!currentSprint || !previousSprint) return null
  
  const current = currentSprint.metrics[metricKey]?.rawValue
  const previous = previousSprint.metrics[metricKey]?.rawValue
  
  if (current === undefined || previous === undefined || previous === 0) return null
  
  const percentageChange = ((current - previous) / previous) * 100
  const config = metricsConfig[metricKey]
  
  // Se crescimento positivo é bom (velocity, wip) -> aumento = melhoria
  // Se crescimento positivo é ruim (cycle time, bugs, scope creep, time to resolve) -> aumento = piora
  const isImprovement = config.isPositiveGrowthGood 
    ? percentageChange > 0  // Para velocity e wip: aumento = melhoria
    : percentageChange < 0  // Para cycle time, bugs, scope creep, time to resolve: diminuição = melhoria
    
  return {
    current,
    previous,
    percentageChange: Math.abs(percentageChange),
    isImprovement,
    trend: percentageChange > 0 ? 'up' : percentageChange < 0 ? 'down' : 'stable'
  }
}

// Função para obter comparação com sprint anterior
export const getSprintComparison = (teamId, currentSprintName) => {
  const team = getTeamById(teamId)
  if (!team) return null
  
  const sprintNames = Object.keys(team.sprints).sort().reverse()
  const currentIndex = sprintNames.indexOf(currentSprintName)
  
  if (currentIndex === -1 || currentIndex === sprintNames.length - 1) return null
  
  const currentSprint = team.sprints[currentSprintName]
  const previousSprintName = sprintNames[currentIndex + 1]
  const previousSprint = team.sprints[previousSprintName]
  
  const comparison = {}
  Object.keys(metricsConfig).forEach(metricKey => {
    comparison[metricKey] = calculateSprintComparison(currentSprint, previousSprint, metricKey)
  })
  
  return {
    currentSprint: currentSprintName,
    previousSprint: previousSprintName,
    metrics: comparison
  }
}

// Estrutura para futura integração com Supabase
export const supabaseSchema = {
  // Tabela de times
  teams: `
    CREATE TABLE teams (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      color TEXT NOT NULL,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );
  `,
  
  // Tabela de sprints
  sprints: `
    CREATE TABLE sprints (
      id TEXT PRIMARY KEY,
      team_id TEXT REFERENCES teams(id) ON DELETE CASCADE,
      name TEXT NOT NULL,
      period TEXT NOT NULL,
      start_date DATE NOT NULL,
      end_date DATE NOT NULL,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );
  `,
  
  // Tabela de métricas
  sprint_metrics: `
    CREATE TABLE sprint_metrics (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      sprint_id TEXT REFERENCES sprints(id) ON DELETE CASCADE,
      metric_name TEXT NOT NULL,
      value TEXT NOT NULL,
      raw_value DECIMAL NOT NULL,
      unit TEXT NOT NULL,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );
  `
}

// Queries para Supabase
export const supabaseQueries = {
  getTeamSprints: `
    SELECT s.*, t.name as team_name, t.color as team_color
    FROM sprints s
    JOIN teams t ON s.team_id = t.id
    WHERE s.team_id = $1
    ORDER BY s.start_date DESC
  `,
  
  getSprintMetrics: `
    SELECT sm.*
    FROM sprint_metrics sm
    WHERE sm.sprint_id = $1
    ORDER BY sm.metric_name
  `,
  
  insertSprintMetrics: `
    INSERT INTO sprint_metrics (sprint_id, metric_name, value, raw_value, unit)
    VALUES ($1, $2, $3, $4, $5)
  `,
  
  createSprint: `
    INSERT INTO sprints (id, team_id, name, period, start_date, end_date)
    VALUES ($1, $2, $3, $4, $5, $6)
    RETURNING *
  `
}

export default sprintMetricsData
