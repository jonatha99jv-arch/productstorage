import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
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
  Info
} from 'lucide-react'
import { performanceData, getTeamStatusColor, getTrendColor } from '../data/performanceData'

export const PerformanceDashboard = ({ user }) => {
  const [activeTab, setActiveTab] = useState('resumo')
  const [lastRefresh, setLastRefresh] = useState(performanceData.lastUpdate)

  const tabs = [
    { id: 'resumo', label: 'Resumo Executivo', icon: BarChart3 },
    { id: 'aplicativo', label: 'Time Aplicativo', icon: Activity },
    { id: 'integracoes', label: 'Time Integrações', icon: Users },
    { id: 'web', label: 'Time Web', icon: TrendingUp },
    { id: 'metricas', label: 'Métricas', icon: BarChart3 }
  ]

  const handleRefresh = () => {
    setLastRefresh(new Date().toLocaleTimeString('pt-BR'))
    // Em produção, aqui seria feita a chamada para o Supabase
  }

  const MetricCard = ({ title, metric, subtitle, isPositiveMetric = true }) => {
    if (!metric) return null

    return (
      <Card className="p-6 border-l-4 border-l-orange-500">
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <h3 className="text-sm font-medium text-gray-600 mb-1">{title}</h3>
            <div className="text-2xl font-bold text-gray-900 mb-1">
              {metric.current}
            </div>
            {subtitle && (
              <div className="text-xs text-gray-500">{subtitle}</div>
            )}
          </div>
          {metric.trend !== null && (
            <div className={`flex items-center gap-1 text-sm font-medium ${getTrendColor(metric.trend, isPositiveMetric)}`}>
              {metric.trend > 0 ? (
                <TrendingUp className="w-4 h-4" />
              ) : metric.trend < 0 ? (
                <TrendingDown className="w-4 h-4" />
              ) : null}
              {Math.abs(metric.trend)}%
            </div>
          )}
        </div>
      </Card>
    )
  }

  const InsightsList = ({ insights }) => {
    const getInsightIcon = (type) => {
      switch (type) {
        case 'success': return <CheckCircle className="w-4 h-4 text-green-600" />
        case 'warning': return <AlertTriangle className="w-4 h-4 text-yellow-600" />
        case 'info': return <Info className="w-4 h-4 text-blue-600" />
        default: return <Info className="w-4 h-4 text-gray-600" />
      }
    }

    return (
      <div className="mt-8">
        <h3 className="flex items-center gap-2 text-lg font-semibold text-gray-900 mb-4">
          <Info className="w-5 h-5 text-orange-600" />
          Insights & Recomendações
        </h3>
        <div className="space-y-3">
          {insights.map((insight, index) => (
            <div key={index} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
              {getInsightIcon(insight.type)}
              <span className="text-sm text-gray-700 leading-relaxed">
                {insight.text}
              </span>
            </div>
          ))}
        </div>
      </div>
    )
  }

  const TeamDashboard = ({ teamId }) => {
    const team = performanceData.teams[teamId]
    if (!team) return null

    return (
      <div className="space-y-8">
        {/* Header do Time */}
        <div className="bg-gradient-to-r from-red-500 via-orange-500 to-pink-500 text-white p-6 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">{team.name}</h2>
              <p className="text-white/90">Período: {performanceData.period}</p>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5" />
              <Badge className="bg-white/20 text-white border-white/30">
                {team.status.charAt(0).toUpperCase() + team.status.slice(1)}
              </Badge>
            </div>
          </div>
        </div>

        {/* Grid de Métricas */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <MetricCard 
            title="Cycle Time" 
            metric={team.metrics.cycleTime}
            subtitle={`Anterior: ${team.metrics.cycleTime.previous || 'N/A'}`}
            isPositiveMetric={false}
          />
          <MetricCard 
            title="Velocity" 
            metric={team.metrics.velocity}
            subtitle={`Anterior: ${team.metrics.velocity.previous || 'N/A'}`}
          />
          <MetricCard 
            title="WIP" 
            metric={team.metrics.wip}
          />
          <MetricCard 
            title="Bug Rate" 
            metric={team.metrics.bugRate}
            subtitle={`Anterior: ${team.metrics.bugRate.previous || 'N/A'}`}
            isPositiveMetric={false}
          />
          <MetricCard 
            title="Time to Resolve Bugs" 
            metric={team.metrics.timeToResolveBugs}
            isPositiveMetric={false}
          />
          <MetricCard 
            title="Scope Creep" 
            metric={team.metrics.scopeCreep}
            subtitle={`Anterior: ${team.metrics.scopeCreep.previous || 'N/A'}`}
            isPositiveMetric={false}
          />
        </div>

        {/* Insights */}
        <InsightsList insights={team.insights} />
      </div>
    )
  }

  const ExecutiveSummary = () => {
    const { executive } = performanceData

    return (
      <div className="space-y-8">
        {/* Performance Geral */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Card className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <Activity className="w-6 h-6 text-orange-600" />
              <h3 className="text-xl font-semibold text-gray-900">Performance Geral</h3>
            </div>
            
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm text-gray-600">Score de Melhoria</span>
              <Badge className="bg-green-100 text-green-800 border-green-300">
                Excelente
              </Badge>
            </div>
            
            <div className="text-3xl font-bold text-green-600 mb-4">
              {executive.overallScore}%
            </div>
            
            <div className="w-full bg-gray-200 rounded-full h-3 mb-6">
              <div 
                className="bg-green-600 h-3 rounded-full transition-all duration-500"
                style={{ width: `${executive.overallScore}%` }}
              ></div>
            </div>

            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-lg font-bold text-green-600">
                  {executive.improvements.bugRate.count}/{executive.improvements.bugRate.total}
                </div>
                <div className="text-xs text-gray-500">Times melhoraram Bug Rate</div>
              </div>
              <div>
                <div className="text-lg font-bold text-blue-600">
                  {executive.improvements.cycleTime.count}/{executive.improvements.cycleTime.total}
                </div>
                <div className="text-xs text-gray-500">Times reduziram Cycle Time</div>
              </div>
              <div>
                <div className="text-lg font-bold text-purple-600">
                  {executive.improvements.scopeCreep.count}/{executive.improvements.scopeCreep.total}
                </div>
                <div className="text-xs text-gray-500">Times reduziram Scope Creep</div>
              </div>
            </div>
          </Card>

          {/* Alertas Críticos */}
          <Card className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <AlertTriangle className="w-6 h-6 text-red-600" />
              <h3 className="text-xl font-semibold text-gray-900">Alertas Críticos</h3>
            </div>
            
            <div className="space-y-3">
              {executive.alerts.map((alert, index) => (
                <div key={index} className="flex items-start gap-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <AlertTriangle className="w-4 h-4 text-red-600 mt-0.5" />
                  <div className="text-sm text-red-800">
                    {alert.message}
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Comparativo entre Times */}
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-6">
            <Users className="w-6 h-6 text-purple-600" />
            <h3 className="text-xl font-semibold text-gray-900">Comparativo entre Times</h3>
          </div>

          <div className="space-y-6">
            {Object.entries(executive.comparative).map(([teamId, metrics]) => {
              const team = performanceData.teams[teamId]
              return (
                <div key={teamId} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-semibold text-gray-900">{team.name}</h4>
                    <div className="text-sm font-medium" style={{ color: team.color }}>
                      {metrics.cycleTime.percentage}%
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600">Cycle Time:</span>
                        <span className={getTrendColor(metrics.cycleTime.trend, false)}>
                          {metrics.cycleTime.trend > 0 ? '+' : ''}{metrics.cycleTime.trend}%
                        </span>
                      </div>
                    </div>
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600">Bug Rate:</span>
                        <span className={getTrendColor(metrics.bugRate.trend, false)}>
                          {metrics.bugRate.trend > 0 ? '+' : ''}{metrics.bugRate.trend}%
                        </span>
                      </div>
                    </div>
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600">Scope Creep:</span>
                        <span className={getTrendColor(metrics.scopeCreep.trend, false)}>
                          {metrics.scopeCreep.trend > 0 ? '+' : ''}{metrics.scopeCreep.trend}%
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </Card>
      </div>
    )
  }

  const MetricsOverview = () => {
    return (
      <div className="space-y-8">
        <Card className="p-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">
            Visão Geral das Métricas
          </h3>
          <p className="text-gray-600">
            Esta seção será expandida com gráficos detalhados e análises históricas.
            Em produção, as métricas serão gerenciadas através de uma interface dedicada
            para editores e administradores.
          </p>
        </Card>
      </div>
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
      case 'metricas':
        return <MetricsOverview />
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
    <div className="w-full">
      <div className="w-full max-w-7xl mx-auto py-8 px-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-orange-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xl">S</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Starbem Tech Dashboard
                </h1>
                <p className="text-gray-600">Métricas de Desenvolvimento de Produto</p>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <Badge variant="outline" className="text-gray-600">
              {performanceData.period}
            </Badge>
            <Button 
              variant="outline" 
              onClick={handleRefresh}
              className="flex items-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              Atualizar
            </Button>
            <div className="text-sm text-gray-500">
              Última atualização: {lastRefresh}
            </div>
            <div className="flex items-center gap-2 text-sm">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-green-600 font-medium">Online</span>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 mb-8">
          <nav className="-mb-px flex space-x-8">
            {tabs.map((tab) => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === tab.id
                      ? 'border-orange-500 text-orange-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </button>
              )
            })}
          </nav>
        </div>

        {/* Content */}
        <div className="min-h-[600px]">
          {renderContent()}
        </div>

        {/* Footer */}
        <div className="mt-12 pt-6 border-t border-gray-200">
          <div className="flex items-center justify-between text-sm text-gray-500">
            <div>
              © 2024 Starbem - Dashboard de Métricas de Desenvolvimento
            </div>
            <div className="flex items-center gap-4">
              <span>Dados atualizados em tempo real</span>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-green-600">Online</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
