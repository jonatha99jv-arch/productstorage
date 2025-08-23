import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
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
  TrendingDown
} from 'lucide-react'

// Mock data para demonstração
const mockMetrics = [
  {
    id: 1,
    teamId: 'aplicativo',
    metricName: 'cycleTime',
    currentValue: '2sem 0d 11.3h',
    previousValue: '2sem 2d 20.0h',
    trendPercentage: 14.0,
    status: 'improved',
    period: 'Jul/Ago 2024',
    createdAt: '2024-08-15T10:30:00Z'
  },
  {
    id: 2,
    teamId: 'integracoes',
    metricName: 'velocity',
    currentValue: '120',
    previousValue: '150',
    trendPercentage: -20.0,
    status: 'declined',
    period: 'Jul/Ago 2024',
    createdAt: '2024-08-15T10:31:00Z'
  }
]

export const MetricsAdmin = ({ user }) => {
  const [metrics, setMetrics] = useState(mockMetrics)
  const [editingMetric, setEditingMetric] = useState(null)
  const [showAddForm, setShowAddForm] = useState(false)
  const [formData, setFormData] = useState({
    teamId: '',
    metricName: '',
    currentValue: '',
    previousValue: '',
    trendPercentage: 0,
    status: 'stable',
    period: 'Jul/Ago 2024'
  })

  const teams = [
    { id: 'aplicativo', name: 'Time Aplicativo' },
    { id: 'integracoes', name: 'Time Integrações' },
    { id: 'web', name: 'Time Web' }
  ]

  const metricTypes = [
    { id: 'cycleTime', name: 'Cycle Time' },
    { id: 'velocity', name: 'Velocity' },
    { id: 'wip', name: 'WIP' },
    { id: 'bugRate', name: 'Bug Rate' },
    { id: 'timeToResolveBugs', name: 'Time to Resolve Bugs' },
    { id: 'scopeCreep', name: 'Scope Creep' }
  ]

  const statusOptions = [
    { id: 'improved', name: 'Melhorou', color: 'green' },
    { id: 'declined', name: 'Piorou', color: 'red' },
    { id: 'stable', name: 'Estável', color: 'gray' }
  ]

  const handleSubmit = (e) => {
    e.preventDefault()
    
    if (editingMetric) {
      // Atualizar métrica existente
      setMetrics(metrics.map(m => 
        m.id === editingMetric.id 
          ? { ...editingMetric, ...formData, updatedAt: new Date().toISOString() }
          : m
      ))
      setEditingMetric(null)
    } else {
      // Criar nova métrica
      const newMetric = {
        id: Date.now(),
        ...formData,
        createdAt: new Date().toISOString()
      }
      setMetrics([...metrics, newMetric])
      setShowAddForm(false)
    }
    
    // Reset form
    setFormData({
      teamId: '',
      metricName: '',
      currentValue: '',
      previousValue: '',
      trendPercentage: 0,
      status: 'stable',
      period: 'Jul/Ago 2024'
    })
  }

  const handleEdit = (metric) => {
    setEditingMetric(metric)
    setFormData({
      teamId: metric.teamId,
      metricName: metric.metricName,
      currentValue: metric.currentValue,
      previousValue: metric.previousValue || '',
      trendPercentage: metric.trendPercentage || 0,
      status: metric.status,
      period: metric.period
    })
    setShowAddForm(true)
  }

  const handleDelete = (id) => {
    if (confirm('Tem certeza que deseja excluir esta métrica?')) {
      setMetrics(metrics.filter(m => m.id !== id))
    }
  }

  const getStatusBadge = (status) => {
    const statusConfig = statusOptions.find(s => s.id === status)
    const colorClass = {
      green: 'bg-green-100 text-green-800 border-green-300',
      red: 'bg-red-100 text-red-800 border-red-300',
      gray: 'bg-gray-100 text-gray-800 border-gray-300'
    }[statusConfig?.color || 'gray']

    return (
      <Badge className={colorClass}>
        {status === 'improved' && <TrendingUp className="w-3 h-3 mr-1" />}
        {status === 'declined' && <TrendingDown className="w-3 h-3 mr-1" />}
        {statusConfig?.name}
      </Badge>
    )
  }

  const cancelEdit = () => {
    setEditingMetric(null)
    setShowAddForm(false)
    setFormData({
      teamId: '',
      metricName: '',
      currentValue: '',
      previousValue: '',
      trendPercentage: 0,
      status: 'stable',
      period: 'Jul/Ago 2024'
    })
  }

  return (
    <div className="w-full max-w-7xl mx-auto py-8 px-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <Database className="w-8 h-8 text-blue-600" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Gerenciamento de Métricas
            </h1>
            <p className="text-gray-600">
              Configure e monitore as métricas de performance dos times
            </p>
          </div>
        </div>
        
        <Button 
          onClick={() => setShowAddForm(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white"
        >
          <Plus className="w-4 h-4 mr-2" />
          Nova Métrica
        </Button>
      </div>

      {/* Info sobre integração com Supabase */}
      <Card className="p-4 mb-6 border-blue-200 bg-blue-50">
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

      {/* Form para adicionar/editar métrica */}
      {showAddForm && (
        <Card className="p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">
              {editingMetric ? 'Editar Métrica' : 'Nova Métrica'}
            </h3>
            <Button variant="outline" onClick={cancelEdit}>
              <X className="w-4 h-4" />
            </Button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="teamId">Time</Label>
                <Select 
                  value={formData.teamId}
                  onValueChange={(value) => setFormData({...formData, teamId: value})}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o time" />
                  </SelectTrigger>
                  <SelectContent>
                    {teams.map(team => (
                      <SelectItem key={team.id} value={team.id}>
                        {team.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="metricName">Tipo de Métrica</Label>
                <Select 
                  value={formData.metricName}
                  onValueChange={(value) => setFormData({...formData, metricName: value})}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a métrica" />
                  </SelectTrigger>
                  <SelectContent>
                    {metricTypes.map(metric => (
                      <SelectItem key={metric.id} value={metric.id}>
                        {metric.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="currentValue">Valor Atual</Label>
                <Input
                  id="currentValue"
                  value={formData.currentValue}
                  onChange={(e) => setFormData({...formData, currentValue: e.target.value})}
                  placeholder="Ex: 2sem 0d 11.3h ou 300"
                  required
                />
              </div>

              <div>
                <Label htmlFor="previousValue">Valor Anterior</Label>
                <Input
                  id="previousValue"
                  value={formData.previousValue}
                  onChange={(e) => setFormData({...formData, previousValue: e.target.value})}
                  placeholder="Ex: 2sem 2d 20.0h ou 280"
                />
              </div>

              <div>
                <Label htmlFor="trendPercentage">Tendência (%)</Label>
                <Input
                  id="trendPercentage"
                  type="number"
                  value={formData.trendPercentage}
                  onChange={(e) => setFormData({...formData, trendPercentage: parseFloat(e.target.value)})}
                  placeholder="Ex: 14.0 ou -20.0"
                />
              </div>

              <div>
                <Label htmlFor="status">Status</Label>
                <Select 
                  value={formData.status}
                  onValueChange={(value) => setFormData({...formData, status: value})}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Status da métrica" />
                  </SelectTrigger>
                  <SelectContent>
                    {statusOptions.map(status => (
                      <SelectItem key={status.id} value={status.id}>
                        {status.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="period">Período</Label>
              <Input
                id="period"
                value={formData.period}
                onChange={(e) => setFormData({...formData, period: e.target.value})}
                placeholder="Ex: Jul/Ago 2024"
                required
              />
            </div>

            <div className="flex justify-end gap-3">
              <Button type="button" variant="outline" onClick={cancelEdit}>
                Cancelar
              </Button>
              <Button type="submit">
                <Save className="w-4 h-4 mr-2" />
                {editingMetric ? 'Salvar Alterações' : 'Criar Métrica'}
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* Lista de métricas */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Métricas Cadastradas</h3>
        
        {metrics.length === 0 ? (
          <div className="text-center py-8">
            <Database className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">Nenhuma métrica cadastrada ainda</p>
          </div>
        ) : (
          <div className="space-y-4">
            {metrics.map((metric) => {
              const team = teams.find(t => t.id === metric.teamId)
              const metricType = metricTypes.find(m => m.id === metric.metricName)
              
              return (
                <div key={metric.id} className="border rounded-lg p-4 hover:bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h4 className="font-medium text-gray-900">
                          {team?.name} - {metricType?.name}
                        </h4>
                        {getStatusBadge(metric.status)}
                      </div>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600">
                        <div>
                          <span className="font-medium">Atual:</span> {metric.currentValue}
                        </div>
                        <div>
                          <span className="font-medium">Anterior:</span> {metric.previousValue || 'N/A'}
                        </div>
                        <div>
                          <span className="font-medium">Tendência:</span> 
                          <span className={metric.trendPercentage > 0 ? 'text-green-600' : metric.trendPercentage < 0 ? 'text-red-600' : 'text-gray-600'}>
                            {metric.trendPercentage > 0 ? '+' : ''}{metric.trendPercentage}%
                          </span>
                        </div>
                        <div>
                          <span className="font-medium">Período:</span> {metric.period}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2 ml-4">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleEdit(metric)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleDelete(metric.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </Card>

      {/* Seção de integração futura com Supabase */}
      <Card className="p-6 mt-6">
        <div className="flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5" />
          <div>
            <h3 className="font-medium text-amber-900">Estrutura para Produção</h3>
            <p className="text-sm text-amber-800 mt-1 mb-3">
              Em produção, esta interface se conectará diretamente ao Supabase com as seguintes funcionalidades:
            </p>
            <ul className="text-sm text-amber-800 space-y-1">
              <li>• Sincronização automática com o dashboard de performance</li>
              <li>• Histórico completo de métricas por período</li>
              <li>• Validação de permissões (apenas editores e admins)</li>
              <li>• Backup automático dos dados</li>
              <li>• API endpoints para integração com ferramentas externas</li>
            </ul>
          </div>
        </div>
      </Card>
    </div>
  )
}
