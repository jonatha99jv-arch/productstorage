import { supabase } from './supabaseClient'

/**
 * Funções para integração das métricas de sprint com Supabase
 */

// ============================================
// FUNÇÕES DE TEAMS
// ============================================

export const getTeams = async () => {
  try {
    const { data, error } = await supabase
      .from('teams')
      .select('*')
      .order('name')
    
    if (error) throw error
    return { data, error: null }
  } catch (error) {
    console.error('Erro ao buscar times:', error)
    return { data: null, error }
  }
}

export const createTeam = async (teamData) => {
  try {
    const { data, error } = await supabase
      .from('teams')
      .insert([{
        id: teamData.id,
        name: teamData.name,
        color: teamData.color
      }])
      .select()
    
    if (error) throw error
    return { data, error: null }
  } catch (error) {
    console.error('Erro ao criar time:', error)
    return { data: null, error }
  }
}

// ============================================
// FUNÇÕES DE SPRINTS
// ============================================

export const getTeamSprints = async (teamId) => {
  try {
    const { data, error } = await supabase
      .from('sprints')
      .select(`
        *,
        teams!inner(name, color)
      `)
      .eq('team_id', teamId)
      .order('start_date', { ascending: false })
    
    if (error) throw error
    return { data, error: null }
  } catch (error) {
    console.error('Erro ao buscar sprints do time:', error)
    return { data: null, error }
  }
}

export const createSprint = async (sprintData) => {
  try {
    const sprintId = `${sprintData.team_id}-${sprintData.name.toLowerCase().replace(/\s+/g, '-')}`
    
    const { data, error } = await supabase
      .from('sprints')
      .insert([{
        id: sprintId,
        team_id: sprintData.team_id,
        name: sprintData.name,
        period: sprintData.period,
        start_date: sprintData.start_date,
        end_date: sprintData.end_date
      }])
      .select()
    
    if (error) throw error
    return { data: data[0], error: null }
  } catch (error) {
    console.error('Erro ao criar sprint:', error)
    return { data: null, error }
  }
}

export const getSprintById = async (sprintId) => {
  try {
    const { data, error } = await supabase
      .from('sprints')
      .select(`
        *,
        teams!inner(name, color),
        sprint_metrics(*)
      `)
      .eq('id', sprintId)
      .single()
    
    if (error) throw error
    return { data, error: null }
  } catch (error) {
    console.error('Erro ao buscar sprint:', error)
    return { data: null, error }
  }
}

// ============================================
// FUNÇÕES DE MÉTRICAS
// ============================================

export const getSprintMetrics = async (sprintId) => {
  try {
    const { data, error } = await supabase
      .from('sprint_metrics')
      .select('*')
      .eq('sprint_id', sprintId)
      .order('metric_name')
    
    if (error) throw error
    return { data, error: null }
  } catch (error) {
    console.error('Erro ao buscar métricas da sprint:', error)
    return { data: null, error }
  }
}

export const createSprintMetrics = async (sprintId, metricsData) => {
  try {
    // Preparar array de métricas para inserção
    const metricsArray = Object.entries(metricsData).map(([metricName, metricData]) => ({
      sprint_id: sprintId,
      metric_name: metricName,
      value: metricData.value,
      raw_value: parseFloat(metricData.rawValue),
      unit: metricData.unit || 'numeric'
    }))

    const { data, error } = await supabase
      .from('sprint_metrics')
      .insert(metricsArray)
      .select()
    
    if (error) throw error
    return { data, error: null }
  } catch (error) {
    console.error('Erro ao salvar métricas da sprint:', error)
    return { data: null, error }
  }
}

export const updateSprintMetric = async (metricId, metricData) => {
  try {
    const { data, error } = await supabase
      .from('sprint_metrics')
      .update({
        value: metricData.value,
        raw_value: parseFloat(metricData.rawValue)
      })
      .eq('id', metricId)
      .select()
    
    if (error) throw error
    return { data, error: null }
  } catch (error) {
    console.error('Erro ao atualizar métrica:', error)
    return { data: null, error }
  }
}

export const deleteSprintMetrics = async (sprintId) => {
  try {
    const { error } = await supabase
      .from('sprint_metrics')
      .delete()
      .eq('sprint_id', sprintId)
    
    if (error) throw error
    return { error: null }
  } catch (error) {
    console.error('Erro ao deletar métricas da sprint:', error)
    return { error }
  }
}

// ============================================
// FUNÇÕES COMPOSTAS
// ============================================

export const getTeamSprintsWithMetrics = async (teamId) => {
  try {
    const { data: sprints, error: sprintsError } = await supabase
      .from('sprints')
      .select(`
        *,
        sprint_metrics(*)
      `)
      .eq('team_id', teamId)
      .order('start_date', { ascending: false })
    
    if (sprintsError) throw sprintsError

    // Organizar métricas por sprint
    const sprintsWithMetrics = sprints.map(sprint => {
      const metrics = {}
      
      sprint.sprint_metrics.forEach(metric => {
        metrics[metric.metric_name] = {
          value: metric.value,
          rawValue: metric.raw_value,
          unit: metric.unit
        }
      })
      
      return {
        ...sprint,
        metrics
      }
    })
    
    return { data: sprintsWithMetrics, error: null }
  } catch (error) {
    console.error('Erro ao buscar sprints com métricas:', error)
    return { data: null, error }
  }
}

export const createSprintWithMetrics = async (sprintData, metricsData) => {
  try {
    // 1. Criar a sprint
    const { data: sprint, error: sprintError } = await createSprint(sprintData)
    if (sprintError) throw sprintError

    // 2. Criar as métricas
    const { data: metrics, error: metricsError } = await createSprintMetrics(sprint.id, metricsData)
    if (metricsError) throw metricsError

    return { 
      data: { sprint, metrics }, 
      error: null 
    }
  } catch (error) {
    console.error('Erro ao criar sprint com métricas:', error)
    return { data: null, error }
  }
}

// ============================================
// FUNÇÕES DE COMPARAÇÃO
// ============================================

export const getPreviousSprint = async (teamId, currentSprintStartDate) => {
  try {
    const { data, error } = await supabase
      .from('sprints')
      .select(`
        *,
        sprint_metrics(*)
      `)
      .eq('team_id', teamId)
      .lt('start_date', currentSprintStartDate)
      .order('start_date', { ascending: false })
      .limit(1)
    
    if (error) throw error
    
    if (data && data.length > 0) {
      // Organizar métricas
      const sprint = data[0]
      const metrics = {}
      
      sprint.sprint_metrics.forEach(metric => {
        metrics[metric.metric_name] = {
          value: metric.value,
          rawValue: metric.raw_value,
          unit: metric.unit
        }
      })
      
      return { 
        data: { ...sprint, metrics }, 
        error: null 
      }
    }
    
    return { data: null, error: null }
  } catch (error) {
    console.error('Erro ao buscar sprint anterior:', error)
    return { data: null, error }
  }
}

// ============================================
// FUNÇÕES DE INICIALIZAÇÃO
// ============================================

export const initializeTeams = async () => {
  try {
    const defaultTeams = [
      { id: 'aplicativo', name: 'Time Aplicativo', color: 'orange' },
      { id: 'integracoes', name: 'Time Integrações', color: 'blue' },
      { id: 'web', name: 'Time Web', color: 'purple' }
    ]

    // Verificar se os times já existem
    const { data: existingTeams } = await getTeams()
    
    if (!existingTeams || existingTeams.length === 0) {
      // Criar times padrão
      for (const team of defaultTeams) {
        await createTeam(team)
      }
      console.log('Times padrão criados com sucesso!')
    }

    return { success: true }
  } catch (error) {
    console.error('Erro ao inicializar times:', error)
    return { success: false, error }
  }
}

// ============================================
// UTILITÁRIOS
// ============================================

export const formatMetricsForSupabase = (metricsForm) => {
  const formatted = {}
  
  Object.entries(metricsForm).forEach(([metricKey, metricData]) => {
    formatted[metricKey] = {
      value: metricData.value,
      rawValue: metricData.rawValue || metricData.value,
      unit: getMetricUnit(metricKey)
    }
  })
  
  return formatted
}

const getMetricUnit = (metricKey) => {
  const unitMap = {
    cycleTime: 'time',
    velocity: 'points',
    wip: 'items',
    bugRate: 'bugs',
    timeToResolveBugs: 'time',
    scopeCreep: 'points'
  }
  
  return unitMap[metricKey] || 'numeric'
}

export default {
  getTeams,
  createTeam,
  getTeamSprints,
  createSprint,
  getSprintById,
  getSprintMetrics,
  createSprintMetrics,
  updateSprintMetric,
  deleteSprintMetrics,
  getTeamSprintsWithMetrics,
  createSprintWithMetrics,
  getPreviousSprint,
  initializeTeams,
  formatMetricsForSupabase
}
