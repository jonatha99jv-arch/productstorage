import { useState } from 'react'
import StatusColumn from './StatusColumn'
import { Input } from '@/components/ui/input'
import { Search } from 'lucide-react'

const STATUS_CONFIG = {
  'nao_iniciado': {
    label: 'Não Iniciado',
    color: 'bg-red-500',
    bgColor: 'bg-red-50',
    borderColor: 'border-red-200'
  },
  'proxima_sprint': {
    label: 'Próxima Sprint',
    color: 'bg-orange-500',
    bgColor: 'bg-orange-50',
    borderColor: 'border-orange-200'
  },
  'sprint_atual': {
    label: 'Sprint Atual',
    color: 'bg-yellow-500',
    bgColor: 'bg-yellow-50',
    borderColor: 'border-yellow-200'
  },
  'em_finalizacao': {
    label: 'Em Finalização',
    color: 'bg-green-400',
    bgColor: 'bg-green-50',
    borderColor: 'border-green-200'
  },
  'concluida': {
    label: 'Concluída',
    color: 'bg-green-600',
    bgColor: 'bg-green-100',
    borderColor: 'border-green-300'
  }
}

const RoadmapBoard = ({ items, okrs, onEditItem, onDeleteItem, onUpdateItemStatus }) => {
  const [searchTerm, setSearchTerm] = useState('')

  // Filtrar itens baseado na busca
  const filteredItems = items.filter(item =>
    item.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.inputOutputMetric.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.teseProduto.toLowerCase().includes(searchTerm.toLowerCase())
  )

  // Agrupar itens por status
  const itemsByStatus = Object.keys(STATUS_CONFIG).reduce((acc, status) => {
    acc[status] = filteredItems.filter(item => item.status === status)
    return acc
  }, {})

  const handleDrop = (itemId, newStatus) => {
    onUpdateItemStatus(itemId, newStatus)
  }

  return (
    <div className="space-y-6">
      {/* Barra de busca */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
        <Input
          type="text"
          placeholder="Buscar itens do roadmap..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Board de colunas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 min-h-[600px]">
        {Object.entries(STATUS_CONFIG).map(([status, config]) => (
          <StatusColumn
            key={status}
            status={status}
            config={config}
            items={itemsByStatus[status] || []}
            okrs={okrs}
            onEditItem={onEditItem}
            onDeleteItem={onDeleteItem}
            onDrop={handleDrop}
          />
        ))}
      </div>

      {/* Estatísticas */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4">Estatísticas do Roadmap</h3>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {Object.entries(STATUS_CONFIG).map(([status, config]) => {
            const count = itemsByStatus[status]?.length || 0
            return (
              <div key={status} className="text-center">
                <div className={`w-4 h-4 ${config.color} rounded mx-auto mb-2`}></div>
                <div className="text-2xl font-bold">{count}</div>
                <div className="text-sm text-gray-600">{config.label}</div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

export default RoadmapBoard

