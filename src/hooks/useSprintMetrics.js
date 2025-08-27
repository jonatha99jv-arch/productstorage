import { useState, useEffect } from 'react'
import { 
  getTeams, 
  getTeamSprintsWithMetrics, 
  createSprintWithMetrics, 
  getPreviousSprint,
  initializeTeams 
} from '../lib/supabaseMetrics'
import { metricsConfig } from '../data/sprintMetricsData'

/**
 * Hook para gerenciar métricas de sprint com Supabase
 */
export const useSprintMetrics = () => {
  const [teams, setTeams] = useState([])
  const [sprintData, setSprintData] = useState({}) // { teamId: [sprints] }
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [initialized, setInitialized] = useState(false)

  // Inicializar dados
  useEffect(() => {
    if (!initialized) {
      initializeData()
    }
  }, [initialized])

  const initializeData = async () => {
    setLoading(true)
    setError(null)
    
    try {
      // Inicializar times padrão se necessário
      await initializeTeams()
      
      // Buscar times
      const { data: teamsData, error: teamsError } = await getTeams()
      if (teamsError) throw teamsError
      
      setTeams(teamsData || [])
      setInitialized(true)
    } catch (err) {
      console.error('Erro ao inicializar dados:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  // Buscar sprints de um time
  const loadTeamSprints = async (teamId) => {
    setLoading(true)
    setError(null)
    
    try {
      const { data, error: sprintsError } = await getTeamSprintsWithMetrics(teamId)
      if (sprintsError) throw sprintsError
      
      setSprintData(prev => ({
        ...prev,
        [teamId]: data || []
      }))
      
      return data || []
    } catch (err) {
      console.error('Erro ao carregar sprints:', err)
      setError(err.message)
      return []
    } finally {
      setLoading(false)
    }
  }

  // Criar nova sprint com métricas
  const createSprint = async (teamId, sprintFormData, metricsFormData) => {
    setLoading(true)
    setError(null)
    
    try {
      const sprintData = {
        team_id: teamId,
        name: sprintFormData.name,
        period: sprintFormData.period,
        start_date: sprintFormData.startDate,
        end_date: sprintFormData.endDate
      }
      
      // Formatar métricas
      const formattedMetrics = {}
      Object.entries(metricsFormData).forEach(([key, value]) => {
        formattedMetrics[key] = {
          value: value.value,
          rawValue: parseFloat(value.rawValue || value.value),
          unit: getMetricUnit(key)
        }
      })
      
      const { data, error: createError } = await createSprintWithMetrics(sprintData, formattedMetrics)
      if (createError) throw createError
      
      // Atualizar cache local
      await loadTeamSprints(teamId)
      
      return { success: true, data }
    } catch (err) {
      console.error('Erro ao criar sprint:', err)
      setError(err.message)
      return { success: false, error: err.message }
    } finally {
      setLoading(false)
    }
  }

  // Calcular comparação com sprint anterior
  const calculateComparison = async (teamId, currentSprint) => {
    try {
      const { data: previousSprint, error } = await getPreviousSprint(teamId, currentSprint.start_date)
      if (error) throw error
      
      if (!previousSprint) return null
      
      const comparison = {
        currentSprint: currentSprint.name,
        previousSprint: previousSprint.name,
        metrics: {}
      }
      
      // Calcular comparação para cada métrica
      Object.keys(metricsConfig).forEach(metricKey => {
        const currentMetric = currentSprint.metrics[metricKey]
        const previousMetric = previousSprint.metrics[metricKey]
        
        if (currentMetric && previousMetric) {
          const current = currentMetric.rawValue
          const previous = previousMetric.rawValue
          
          if (current !== undefined && previous !== undefined && previous !== 0) {
            const percentageChange = ((current - previous) / previous) * 100
            const config = metricsConfig[metricKey]
            
            const isImprovement = config.isPositiveGrowthGood 
              ? percentageChange > 0  
              : percentageChange < 0
            
            comparison.metrics[metricKey] = {
              current,
              previous,
              percentageChange: Math.abs(percentageChange),
              isImprovement,
              trend: percentageChange > 0 ? 'up' : percentageChange < 0 ? 'down' : 'stable'
            }
          }
        }
      })
      
      return comparison
    } catch (err) {
      console.error('Erro ao calcular comparação:', err)
      return null
    }
  }

  // Utilitários
  const getTeamById = (teamId) => {
    return teams.find(team => team.id === teamId) || null
  }

  const getTeamSprints = (teamId) => {
    const teamSprints = sprintData[teamId] || []
    return teamSprints.map(sprint => sprint.name).sort().reverse()
  }

  const getSprintData = (teamId, sprintName) => {
    const teamSprints = sprintData[teamId] || []
    return teamSprints.find(sprint => sprint.name === sprintName) || null
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

  // Função para recarregar todos os dados
  const refresh = async () => {
    setInitialized(false)
    setSprintData({})
    await initializeData()
  }

  return {
    // Estados
    teams,
    sprintData,
    loading,
    error,
    initialized,
    
    // Funções
    loadTeamSprints,
    createSprint,
    calculateComparison,
    refresh,
    
    // Utilitários 
    getTeamById,
    getTeamSprints,
    getSprintData
  }
}

export default useSprintMetrics
