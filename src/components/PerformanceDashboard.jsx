import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { 
  Activity,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  Clock,
  Users,
  BarChart3,
  RefreshCw,
  Info,
  ChevronDown,
  Target,
  Loader2
} from 'lucide-react'
import { metricsConfig } from '../data/sprintMetricsData'
import { useSprintMetrics } from '../hooks/useSprintMetrics'

export const PerformanceDashboard = ({ user }) => {
  const [activeTab, setActiveTab] = useState('resumo')
  const [selectedSprints, setSelectedSprints] = useState({})
  const [lastRefresh, setLastRefresh] = useState(new Date().toLocaleTimeString('pt-BR'))

  // Hook do Supabase
  const { 
    teams, 
    sprintData, 
    loading, 
    error, 
    loadTeamSprints, 
    calculateComparison,
    getTeamSprints,
    getSprintData,
    initialized 
  } = useSprintMetrics()

  // Carregar dados dos times quando necessário
  useEffect(() => {
    if (initialized && teams.length > 0) {
      // Carregar sprints para todos os times
      teams.forEach(team => {
        if (!sprintData[team.id] || sprintData[team.id].length === 0) {
          loadTeamSprints(team.id)
        }
      })
    }
  }, [initialized, teams])

  // Inicializar sprints selecionados para cada time (mais recente)
  useEffect(() => {
    if (teams.length > 0 && Object.keys(selectedSprints).length === 0) {
      const initialSprints = {}
      teams.forEach(team => {
        const sprints = getTeamSprints(team.id)
        if (sprints.length > 0) {
          initialSprints[team.id] = sprints[0] // Sprint mais recente
        }
      })
      setSelectedSprints(initialSprints)
    }
  }, [teams, sprintData])

  const tabs = [
    { id: 'resumo', label: 'Resumo Executivo', icon: BarChart3 },
    { id: 'aplicativo', label: 'Time Aplicativo', icon: Activity },
    { id: 'integracoes', label: 'Time Integrações', icon: Users },
    { id: 'web', label: 'Time Web', icon: TrendingUp },
  ]

  const handleRefresh = async () => {
    setLastRefresh(new Date().toLocaleTimeString('pt-BR'))
    
    // Recarregar sprints para todos os times
    for (const team of teams) {
      await loadTeamSprints(team.id)
    }
  }

  const handleSprintChange = (teamId, sprintName) => {
    setSelectedSprints(prev => ({
      ...prev,
      [teamId]: sprintName
    }))
  }

  const getMetricIcon = (metricKey) => {
    const iconMap = {
      cycleTime: Clock,
      velocity: TrendingUp,
      wip: Activity,
      bugRate: AlertTriangle,
      timeToResolveBugs: Clock,
      scopeCreep: Target
    }
    return iconMap[metricKey] || Info
  }

  const getTrendColor = (comparison) => {
    if (!comparison) return 'text-gray-500'
    return comparison.isImprovement ? 'text-green-600' : 'text-red-600'
  }

  const getTrendIcon = (comparison) => {
    if (!comparison) return null
    // Melhorou = seta para cima (verde), Piorou = seta para baixo (vermelho)
    return comparison.isImprovement ? TrendingUp : TrendingDown
  }

  const formatTrendPercentage = (comparison) => {
    if (!comparison) return '-'
    const sign = comparison.isImprovement ? '+' : '-'
    return `${sign}${comparison.percentageChange.toFixed(1)}%`
  }

  const MetricCard = ({ teamId, metricKey, sprintData, comparison }) => {
    const config = metricsConfig[metricKey]
    const Icon = getMetricIcon(metricKey)
    const TrendIcon = getTrendIcon(comparison)
    const metric = sprintData?.metrics[metricKey]
    
    if (!metric) return null

    return (
      <Card className="p-4 hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gray-100 rounded-lg">
              <Icon className="w-4 h-4 text-gray-600" />
            </div>
            <div>
              <h3 className="font-medium text-gray-900 text-sm">{config.name}</h3>
              <p className="text-xs text-gray-500">{config.description}</p>
            </div>
          </div>
        </div>
        
        <div className="mt-4 flex items-end justify-between">
          <div>
            <div className="text-2xl font-bold text-gray-900">{metric.value}</div>
          </div>
          
          {comparison && (
            <div className={`flex items-center gap-1 ${getTrendColor(comparison)}`}>
              {TrendIcon && <TrendIcon className="w-4 h-4" />}
              <span className="text-sm font-medium">
                {formatTrendPercentage(comparison)}
              </span>
            </div>
          )}
        </div>
        
        {comparison && (
          <div className="mt-2 text-xs text-gray-500">
            vs Sprint anterior: {comparison.previous}
          </div>
        )}
      </Card>
    )
  }

  const TeamDashboard = ({ teamId }) => {
    const team = teams.find(t => t.id === teamId)
    const sprints = getTeamSprints(teamId)
    const selectedSprintName = selectedSprints[teamId] || sprints[0]
    const currentSprintData = getSprintData(teamId, selectedSprintName)
    const [comparison, setComparison] = useState(null)

    // Carregar comparação quando dados mudarem
    useEffect(() => {
      if (currentSprintData) {
        calculateComparison(teamId, currentSprintData).then(setComparison)
      }
    }, [teamId, currentSprintData])

    if (!team) {
      return (
        <div className="flex items-center justify-center h-64">
          <p className="text-gray-500">Time não encontrado</p>
        </div>
      )
    }

    if (loading && sprints.length === 0) {
      return (
        <div className="flex items-center justify-center h-64">
          <div className="flex items-center gap-2">
            <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
            <span className="text-gray-600">Carregando dados do time...</span>
          </div>
        </div>
      )
    }

    if (sprints.length === 0) {
      return (
        <div className="text-center py-12">
          <Target className="w-12 h-12 mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhuma Sprint Cadastrada</h3>
          <p className="text-gray-600 mb-4">
            Este time ainda não possui sprints cadastradas no sistema.
          </p>
          <Badge variant="outline">
            Use o Gerenciamento de Métricas para adicionar dados
          </Badge>
        </div>
      )
    }

    if (!currentSprintData) {
      return (
        <div className="flex items-center justify-center h-64">
          <p className="text-gray-500">Dados da sprint não disponíveis</p>
        </div>
      )
    }

    return (
      <div className="space-y-6">
        {/* Header com seletor de sprint */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">{team.name}</h2>
            <p className="text-gray-600">Métricas de performance da sprint</p>
          </div>
          
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">Sprint:</span>
            <Select
              value={selectedSprintName}
              onValueChange={(value) => handleSprintChange(teamId, value)}
            >
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Selecione uma sprint" />
              </SelectTrigger>
              <SelectContent>
                {sprints.map(sprintName => (
                  <SelectItem key={sprintName} value={sprintName}>
                    {sprintName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Info da sprint selecionada */}
        <Card className="p-4 bg-blue-50 border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium text-blue-900">{currentSprintData.name}</h3>
              <p className="text-sm text-blue-700">{currentSprintData.period}</p>
            </div>
            <Badge variant="outline" className="text-blue-700 border-blue-300">
              {currentSprintData.start_date} - {currentSprintData.end_date}
            </Badge>
          </div>
        </Card>

        {/* Grid de métricas */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Object.keys(metricsConfig).map(metricKey => (
            <MetricCard
              key={metricKey}
              teamId={teamId}
              metricKey={metricKey}
              sprintData={currentSprintData}
              comparison={comparison?.metrics[metricKey]}
            />
          ))}
        </div>

        {/* Resumo de melhorias */}
        {comparison && (
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Comparação com Sprint Anterior ({comparison.previousSprint})
            </h3>
            <div className="space-y-2">
              {Object.entries(comparison.metrics).map(([metricKey, comp]) => {
                if (!comp) return null
                const config = metricsConfig[metricKey]
                return (
                  <div key={metricKey} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                    <span className="text-sm text-gray-700">{config.name}</span>
                    <div className={`flex items-center gap-2 ${getTrendColor(comp)}`}>
                      <span className="text-sm font-medium">
                        {formatTrendPercentage(comp)}
                      </span>
                      <Badge variant={comp.isImprovement ? 'success' : 'destructive'} className="text-xs">
                        {comp.isImprovement ? 'Melhorou' : 'Piorou'}
                      </Badge>
                    </div>
                  </div>
                )
              })}
            </div>
          </Card>
        )}
      </div>
    )
  }

  const ExecutiveSummary = () => {
    if (loading && !initialized) {
      return (
        <div className="flex justify-center items-center py-12">
          <div className="flex items-center gap-2">
            <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
            <span className="text-gray-600">Carregando resumo executivo...</span>
          </div>
        </div>
      )
    }
    
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {teams.map(team => {
            const sprints = getTeamSprints(team.id)
            const currentSprintName = selectedSprints[team.id] || sprints[0]
            const currentSprintData = getSprintData(team.id, currentSprintName)
            
            if (!currentSprintData) {
              return (
                <Card key={team.id} className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-3 h-3 rounded-full bg-${team.color}-500`}></div>
                      <h3 className="font-semibold text-gray-900">{team.name}</h3>
                    </div>
                  </div>
                  <div className="text-center py-4">
                    <p className="text-sm text-gray-500">Nenhuma sprint cadastrada</p>
                  </div>
                </Card>
              )
            }

            return (
              <TeamSummaryCard 
                key={team.id} 
                team={team} 
                currentSprintData={currentSprintData} 
                currentSprintName={currentSprintName}
              />
            )
          })}
        </div>
        
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Visão Geral dos Times
          </h3>
          <p className="text-gray-600 mb-4">
            Acompanhe o desempenho dos times através das métricas organizadas por sprints.
            Use os dropdowns em cada dashboard para comparar diferentes períodos.
          </p>
          <div className="flex flex-wrap gap-2">
            <Badge variant="secondary">Métricas por Sprint</Badge>
            <Badge variant="secondary">Comparações Automáticas</Badge>
            <Badge variant="secondary">Score de Performance</Badge>
            <Badge variant="secondary">Dados em Tempo Real</Badge>
          </div>
        </Card>
      </div>
    )
  }

  // Componente para o card de resumo de cada time
  const TeamSummaryCard = ({ team, currentSprintData, currentSprintName }) => {
    const [comparison, setComparison] = useState(null)
    
    useEffect(() => {
      if (currentSprintData) {
        calculateComparison(team.id, currentSprintData).then(setComparison)
      }
    }, [team.id, currentSprintData])

    // Calcular score geral do time baseado nas melhorias
    const improvements = comparison ? 
      Object.values(comparison.metrics).filter(m => m?.isImprovement).length : 0
    const totalMetrics = Object.keys(metricsConfig).length
    const score = improvements > 0 ? Math.round((improvements / totalMetrics) * 100) : 0

    return (
      <Card className="p-6 hover:shadow-lg transition-shadow">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className={`w-3 h-3 rounded-full bg-${team.color}-500`}></div>
            <h3 className="font-semibold text-gray-900">{team.name}</h3>
          </div>
          <Badge variant="outline">{currentSprintName}</Badge>
        </div>
        
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Score de Performance</span>
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${score >= 70 ? 'bg-green-500' : score >= 40 ? 'bg-yellow-500' : 'bg-red-500'}`}></div>
              <span className="font-medium">{score}%</span>
            </div>
          </div>
          
          <div className="text-xs text-gray-500">
            {improvements} de {totalMetrics} métricas melhoraram
          </div>
          
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setActiveTab(team.id)}
            className="w-full"
          >
            Ver Detalhes
          </Button>
        </div>
      </Card>
    )
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'resumo':
        return <ExecutiveSummary />
      case 'aplicativo':
      case 'integracoes':
      case 'web':
        return <TeamDashboard teamId={activeTab} />
      default:
        return <ExecutiveSummary />
    }
  }

  if (!user) {
    return (
      <div className="w-full p-8 text-center">
        <p className="text-gray-500">Carregando dados do usuário...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header integrado com o design da aplicação */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard de Performance</h1>
          <p className="text-gray-600">Métricas dos times organizadas por sprints</p>
        </div>
        
        <div className="flex items-center gap-4">
          <Button 
            variant="outline" 
            onClick={handleRefresh}
            className="flex items-center gap-2"
            disabled={loading}
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <RefreshCw className="w-4 h-4" />
            )}
            Atualizar
          </Button>
          <div className="text-sm text-gray-500">
            Última atualização: {lastRefresh}
          </div>
          {error && (
            <Badge variant="destructive" className="text-xs">
              Erro de conexão
            </Badge>
          )}
        </div>
      </div>

      {/* Tabs integradas */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8">
          {tabs.map((tab) => {
            const Icon = tab.icon
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  flex items-center gap-2 py-2 px-1 border-b-2 font-medium text-sm
                  ${activeTab === tab.id 
                    ? 'border-blue-500 text-blue-600' 
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }
                `}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            )
          })}
        </nav>
      </div>

      {/* Conteúdo */}
      <div>
        {renderContent()}
      </div>
    </div>
  )
}