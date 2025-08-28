import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { 
  Plus,
  Edit,
  Trash2,
  Save,
  X,
  AlertTriangle,
  Info,
  Database,
  TrendingUp,
  TrendingDown,
  CheckCircle,
  Target,
  Loader2
} from 'lucide-react'
import { metricsConfig } from '../data/sprintMetricsData'
import { useSprintMetrics } from '../hooks/useSprintMetrics'

export const MetricsAdmin = ({ user }) => {
  const [step, setStep] = useState('select-team') // select-team, create-sprint, manage-metrics
  const [selectedTeam, setSelectedTeam] = useState('')
  const [sprintForm, setSprintForm] = useState({
    name: '',
    period: '',
    startDate: '',
    endDate: ''
  })
  const [metricsForm, setMetricsForm] = useState({})
  const [successMessage, setSuccessMessage] = useState('')

  // Hook do Supabase
  const { 
    teams, 
    loading, 
    error, 
    createSprint, 
    getTeamSprints,
    initialized 
  } = useSprintMetrics()

  // Limpar mensagem de sucesso após um tempo
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => {
        setSuccessMessage('')
      }, 5000)
      return () => clearTimeout(timer)
    }
  }, [successMessage])

  // Inicializar formulário de métricas
  const initializeMetricsForm = () => {
    const initialForm = {}
    Object.keys(metricsConfig).forEach(metricKey => {
      initialForm[metricKey] = {
        value: '',
        rawValue: ''
      }
    })
    setMetricsForm(initialForm)
  }

  const handleTeamSelect = (teamId) => {
    setSelectedTeam(teamId)
    setStep('create-sprint')
  }

  const handleSprintFormChange = (field, value) => {
    setSprintForm(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleMetricChange = (metricKey, value, rawValue = null) => {
    setMetricsForm(prev => ({
      ...prev,
      [metricKey]: {
        value: value,
        rawValue: rawValue !== null ? rawValue : value // usar o mesmo valor se não precisar de raw
      }
    }))
  }

  const handleSprintSubmit = (e) => {
    e.preventDefault()
    initializeMetricsForm()
    setStep('manage-metrics')
  }

  const handleMetricsSubmit = async (e) => {
    e.preventDefault()
    
    try {
      const result = await createSprint(selectedTeam, sprintForm, metricsForm)
      
      if (result.success) {
        // Sucesso - resetar formulários
        setSprintForm({ name: '', period: '', startDate: '', endDate: '' })
        setMetricsForm({})
        setStep('select-team')
        setSelectedTeam('')
        setSuccessMessage(`Métricas da ${sprintForm.name} salvas com sucesso!`)
    } else {
        throw new Error(result.error || 'Erro ao salvar métricas')
      }
    } catch (err) {
      console.error('Erro ao salvar sprint:', err)
      alert(`Erro ao salvar métricas: ${err.message}`)
    }
  }

  const resetFlow = () => {
    setStep('select-team')
    setSelectedTeam('')
    setSprintForm({ name: '', period: '', startDate: '', endDate: '' })
    setMetricsForm({})
  }

  const getProgressSteps = () => {
    const steps = [
      { key: 'select-team', label: 'Selecionar Time', completed: selectedTeam !== '' },
      { key: 'create-sprint', label: 'Dados da Sprint', completed: sprintForm.name !== '' },
      { key: 'manage-metrics', label: 'Métricas da Sprint', completed: false }
    ]
    
    return steps.map(s => ({
      ...s,
      active: s.key === step
    }))
  }

  const TeamSelectionStep = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          Selecione o Time
        </h2>
        <p className="text-gray-600">
          Escolha o time para o qual deseja cadastrar métricas de sprint
        </p>
      </div>
      
      {loading && !initialized ? (
        <div className="flex justify-center items-center py-12">
          <div className="flex items-center gap-2">
            <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
            <span className="text-gray-600">Carregando times...</span>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {teams.map(team => (
            <Card 
              key={team.id} 
              className="p-6 cursor-pointer hover:shadow-lg transition-shadow border-2 border-transparent hover:border-blue-200"
              onClick={() => handleTeamSelect(team.id)}
            >
              <div className="text-center">
                <div className={`w-12 h-12 mx-auto rounded-lg bg-${team.color}-500 flex items-center justify-center mb-3`}>
                  <Target className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-medium text-gray-900 mb-1">{team.name}</h3>
                <div className="text-sm text-gray-500">
                  {getTeamSprints(team.id).length} sprints cadastradas
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )

  const SprintFormStep = () => {
    const selectedTeamData = teams.find(t => t.id === selectedTeam)
    
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              Dados da Sprint - {selectedTeamData?.name}
            </h2>
            <p className="text-gray-600">
              Preencha as informações básicas da sprint
            </p>
          </div>
          <Button variant="outline" onClick={resetFlow}>
            <X className="w-4 h-4 mr-2" />
            Cancelar
          </Button>
        </div>
        
        <Card className="p-6">
          <form onSubmit={handleSprintSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Nome da Sprint *</Label>
                <Input
                  placeholder="Ex: Sprint 10"
                  value={sprintForm.name}
                  onChange={(e) => handleSprintFormChange('name', e.target.value)}
                  required
                />
              </div>
              
              <div>
                <Label>Período *</Label>
                <Input
                  placeholder="Ex: Set 2024"
                  value={sprintForm.period}
                  onChange={(e) => handleSprintFormChange('period', e.target.value)}
                  required
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Data de Início *</Label>
                <Input
                  type="date"
                  value={sprintForm.startDate}
                  onChange={(e) => handleSprintFormChange('startDate', e.target.value)}
                  required
                />
              </div>
              
              <div>
                <Label>Data de Fim *</Label>
                <Input
                  type="date"
                  value={sprintForm.endDate}
                  onChange={(e) => handleSprintFormChange('endDate', e.target.value)}
                  required
                />
              </div>
            </div>
            
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setStep('select-team')}>
                Voltar
              </Button>
              <Button type="submit">
                Continuar
              </Button>
            </div>
          </form>
        </Card>
      </div>
    )
  }

  const MetricsFormStep = () => {
    const selectedTeamData = teams.find(t => t.id === selectedTeam)
    
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              Métricas da Sprint - {sprintForm.name}
            </h2>
            <p className="text-gray-600">
              {selectedTeamData?.name} • {sprintForm.period}
            </p>
          </div>
          <Button variant="outline" onClick={resetFlow}>
            <X className="w-4 h-4 mr-2" />
            Cancelar
          </Button>
        </div>
        
        <Card className="p-6">
          <form onSubmit={handleMetricsSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {Object.entries(metricsConfig).map(([metricKey, config]) => {
                return (
                  <Card key={metricKey} className="p-4">
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <div className="p-1 bg-gray-100 rounded">
                          <Target className="w-4 h-4 text-gray-600" />
                        </div>
                        <div>
                          <h3 className="font-medium text-gray-900">{config.name}</h3>
                          <p className="text-xs text-gray-500">{config.description}</p>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <div>
                          <Label htmlFor={`${metricKey}-value`}>Valor *</Label>
                          <Input
                            id={`${metricKey}-value`}
                            placeholder={config.placeholder}
                            value={metricsForm[metricKey]?.value || ''}
                            onChange={(e) => {
                              const value = e.target.value
                              // Para métricas numéricas simples, usar o próprio valor como rawValue
                              const rawValue = config.needsRawValue ? '' : value
                              handleMetricChange(metricKey, value, rawValue)
                            }}
                            required
                          />
                        </div>
                        
                        {config.needsRawValue && (
                          <div>
                            <Label htmlFor={`${metricKey}-raw`}>Valor em Horas *</Label>
                            <Input
                              id={`${metricKey}-raw`}
                              type="number"
                              step="0.1"
                              placeholder={config.rawPlaceholder}
                              value={metricsForm[metricKey]?.rawValue || ''}
                              onChange={(e) => handleMetricChange(metricKey, metricsForm[metricKey]?.value || '', e.target.value)}
                              required
                            />
                            <p className="text-xs text-gray-500 mt-1">
                              Valor numérico para comparações
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </Card>
                )
              })}
            </div>
            
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setStep('create-sprint')}>
                Voltar
              </Button>
              <Button 
                type="submit" 
                className="bg-green-600 hover:bg-green-700"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Salvando...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Salvar Métricas
                  </>
                )}
              </Button>
            </div>
          </form>
        </Card>
      </div>
    )
  }

  const ProgressIndicator = () => {
    const steps = getProgressSteps()

    return (
      <div className="flex items-center justify-center mb-8">
        <div className="flex items-center space-x-4">
          {steps.map((step, index) => (
            <div key={step.key} className="flex items-center">
              <div className={`
                flex items-center justify-center w-8 h-8 rounded-full border-2 
                ${step.active 
                  ? 'bg-blue-600 border-blue-600 text-white' 
                  : step.completed 
                    ? 'bg-green-600 border-green-600 text-white'
                    : 'border-gray-300 text-gray-400'
                }
              `}>
                {step.completed ? (
                  <CheckCircle className="w-4 h-4" />
                ) : (
                  <span>{index + 1}</span>
                )}
              </div>
              <span className={`ml-2 text-sm ${
                step.active ? 'text-blue-600 font-medium' : 'text-gray-500'
              }`}>
                {step.label}
              </span>
              {index < steps.length - 1 && (
                <div className={`w-8 h-px mx-4 ${
                  steps[index + 1].completed || steps[index + 1].active ? 'bg-blue-300' : 'bg-gray-300'
                }`} />
              )}
            </div>
          ))}
        </div>
      </div>
    )
  }

  const renderStepContent = () => {
    switch (step) {
      case 'select-team':
        return <TeamSelectionStep />
      case 'create-sprint':
        return <SprintFormStep />
      case 'manage-metrics':
        return <MetricsFormStep />
      default:
        return <TeamSelectionStep />
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Gerenciamento de Métricas
            </h1>
            <p className="text-gray-600">
            Cadastre métricas de performance organizadas por sprint e time
            </p>
        </div>
        
        {step !== 'select-team' && (
          <Button onClick={resetFlow} variant="outline">
          <Plus className="w-4 h-4 mr-2" />
            Nova Sprint
        </Button>
        )}
      </div>

      {/* Info sobre integração com Supabase */}
      <Card className="p-4 border-blue-200 bg-blue-50">
        <div className="flex items-start gap-3">
          <Info className="w-5 h-5 text-blue-600 mt-0.5" />
          <div>
            <h3 className="font-medium text-blue-900">Integração com Supabase</h3>
            <p className="text-sm text-blue-800 mt-1">
              Esta interface está preparada para conectar-se ao banco de dados do Supabase em produção.
              Os dados serão sincronizados automaticamente com o dashboard de performance.
            </p>
          </div>
        </div>
      </Card>

      {/* Progress Indicator */}
      <ProgressIndicator />

      {/* Conteúdo da etapa atual */}
      {renderStepContent()}

      {/* Mensagem de sucesso */}
      {successMessage && (
        <Card className="p-4 border-green-200 bg-green-50">
          <div className="flex items-center gap-3">
            <CheckCircle className="w-5 h-5 text-green-600" />
              <div>
              <h3 className="font-medium text-green-900">Sucesso!</h3>
              <p className="text-sm text-green-800">{successMessage}</p>
              </div>
            </div>
        </Card>
      )}

      {/* Erro de conexão */}
      {error && (
        <Card className="p-4 border-red-200 bg-red-50">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-red-600" />
                        <div>
              <h3 className="font-medium text-red-900">Erro de Conexão</h3>
              <p className="text-sm text-red-800">{error}</p>
          </div>
        </div>
      </Card>
      )}
    </div>
  )
}
