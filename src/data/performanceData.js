/**
 * Mock data para o dashboard de performance dos times
 * Em produção, estes dados virão do Supabase
 */

// Mock dos dados de performance por time
export const performanceData = {
  period: 'Jul/Ago 2024',
  lastUpdate: '13:41:28',
  
  teams: {
    aplicativo: {
      id: 'aplicativo',
      name: 'Time Aplicativo',
      color: 'orange',
      status: 'excelente',
      metrics: {
        cycleTime: {
          current: '2sem 0d 11.3h',
          previous: '2sem 2d 20.0h',
          trend: 14.0,
          status: 'improved'
        },
        velocity: {
          current: 300,
          previous: null,
          trend: null,
          status: 'stable'
        },
        wip: {
          current: 53,
          previous: null,
          trend: null,
          status: 'stable'
        },
        bugRate: {
          current: 10,
          previous: 53,
          trend: 81.1,
          status: 'improved'
        },
        timeToResolveBugs: {
          current: '14.8h',
          previous: null,
          trend: null,
          status: 'stable'
        },
        scopeCreep: {
          current: '15%',
          previous: '28%',
          trend: 46.4,
          status: 'improved'
        }
      },
      insights: [
        { type: 'success', text: 'Excelente evolução em agilidade (Cycle Time) e qualidade (Bug Rate)' },
        { type: 'success', text: 'Redução significativa no Scope Creep indica melhor gestão de requisitos' },
        { type: 'warning', text: 'Investigar práticas que levaram à melhoria para replicação' }
      ]
    },
    
    integracoes: {
      id: 'integracoes',
      name: 'Time Integrações', 
      color: 'red',
      status: 'alerta',
      metrics: {
        cycleTime: {
          current: '1sem 4d 3.0h',
          previous: '1sem 0d 17.2h',
          trend: -44.2,
          status: 'declined'
        },
        velocity: {
          current: 120,
          previous: 150,
          trend: -20.0,
          status: 'declined'
        },
        wip: {
          current: 25,
          previous: null,
          trend: null,
          status: 'stable'
        },
        bugRate: {
          current: 11,
          previous: 53,
          trend: 79.2,
          status: 'improved'
        },
        timeToResolveBugs: {
          current: '1sem 2d 5.7h',
          previous: null,
          trend: null,
          status: 'stable'
        },
        scopeCreep: {
          current: '9%',
          previous: '12%',
          trend: 25.0,
          status: 'improved'
        }
      },
      insights: [
        { type: 'warning', text: 'Aumento preocupante no Cycle Time requer investigação' },
        { type: 'success', text: 'Ótima melhoria na qualidade com redução drástica de bugs' },
        { type: 'info', text: 'Verificar possíveis gargalos ou dependências externas' }
      ]
    },

    web: {
      id: 'web',
      name: 'Time Web',
      color: 'purple',
      status: 'bom',
      metrics: {
        cycleTime: {
          current: '1sem 2d 8.5h',
          previous: '1sem 5d 12.2h',
          trend: 33.0,
          status: 'improved'
        },
        velocity: {
          current: 180,
          previous: 160,
          trend: 12.5,
          status: 'improved'
        },
        wip: {
          current: 18,
          previous: null,
          trend: null,
          status: 'stable'
        },
        bugRate: {
          current: 8,
          previous: 13,
          trend: 38.5,
          status: 'improved'
        },
        timeToResolveBugs: {
          current: '8.2h',
          previous: null,
          trend: null,
          status: 'stable'
        },
        scopeCreep: {
          current: '12%',
          previous: '15%',
          trend: 20.0,
          status: 'improved'
        }
      },
      insights: [
        { type: 'success', text: 'Melhoria consistente em todas as métricas principais' },
        { type: 'success', text: 'Excelente tempo de resolução de bugs' },
        { type: 'info', text: 'Manter práticas atuais e considerar compartilhar com outros times' }
      ]
    }
  },

  // Dados do resumo executivo
  executive: {
    overallScore: 83,
    status: 'excelente',
    improvements: {
      bugRate: { count: 3, total: 3 },
      cycleTime: { count: 2, total: 3 },
      scopeCreep: { count: 2, total: 3 }
    },
    alerts: [
      { 
        type: 'critical', 
        team: 'integracoes', 
        metric: 'cycleTime',
        message: 'Integrações: Cycle Time aumentou 44%'
      },
      { 
        type: 'warning', 
        team: 'web', 
        metric: 'bugRate',
        message: 'Web: Bug Rate ainda alta (21)'
      }
    ],
    comparative: {
      aplicativo: {
        cycleTime: { percentage: 100, trend: 14 },
        bugRate: { percentage: 100, trend: 81 },
        scopeCreep: { percentage: 100, trend: 46 }
      },
      integracoes: {
        cycleTime: { percentage: 60, trend: -44 },
        bugRate: { percentage: 60, trend: 79 },
        scopeCreep: { percentage: 60, trend: 25 }
      },
      web: {
        cycleTime: { percentage: 90, trend: 33 },
        bugRate: { percentage: 90, trend: 60 },
        scopeCreep: { percentage: 90, trend: 0 }
      }
    }
  }
}

// Helper functions para trabalhar com os dados
export const getTeamById = (teamId) => {
  return performanceData.teams[teamId] || null
}

export const getAllTeams = () => {
  return Object.values(performanceData.teams)
}

export const getTeamStatusColor = (status) => {
  switch (status) {
    case 'excelente': return 'bg-green-500'
    case 'bom': return 'bg-blue-500'
    case 'alerta': return 'bg-red-500'
    case 'regular': return 'bg-yellow-500'
    default: return 'bg-gray-500'
  }
}

export const getTrendIcon = (trend) => {
  if (trend > 0) return '↗'
  if (trend < 0) return '↘'
  return '→'
}

export const getTrendColor = (trend, isPositiveMetric = true) => {
  if (trend === null || trend === 0) return 'text-gray-500'
  
  const isGoodTrend = isPositiveMetric ? trend > 0 : trend < 0
  return isGoodTrend ? 'text-green-600' : 'text-red-600'
}

// Funções para futura integração com Supabase
export const supabaseQueries = {
  // Exemplo de query que será usada no futuro
  getMetricsByTeam: `
    SELECT 
      team_id,
      metric_name,
      current_value,
      previous_value,
      trend_percentage,
      status,
      created_at
    FROM performance_metrics 
    WHERE team_id = $1 
    AND period = $2
    ORDER BY created_at DESC
  `,
  
  getTeamInsights: `
    SELECT 
      team_id,
      insight_type,
      message,
      created_at
    FROM team_insights 
    WHERE team_id = $1 
    AND period = $2
    ORDER BY priority DESC
  `,

  getAlerts: `
    SELECT 
      team_id,
      alert_type,
      metric_name,
      message,
      severity
    FROM performance_alerts 
    WHERE is_active = true
    ORDER BY severity DESC, created_at DESC
  `
}

export default performanceData
