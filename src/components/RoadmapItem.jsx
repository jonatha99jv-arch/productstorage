import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Edit, Trash2, Clock, Target } from 'lucide-react'

const RoadmapItem = ({ item, okrs, onEdit, onDelete }) => {
  const [isDragging, setIsDragging] = useState(false)

  const getStatusColor = (status) => {
    const colorMap = {
      'nao_iniciado': 'bg-red-500',
      'proxima_sprint': 'bg-orange-500',
      'sprint_atual': 'bg-yellow-500',
      'em_finalizacao': 'bg-green-500',
      'concluida': 'bg-green-600'
    }
    return colorMap[status] || 'bg-gray-500'
  }

  // Encontrar o OKR vinculado
  const linkedOKR = okrs.find(okr => okr.id === item.okrId)

  const handleDragStart = (e) => {
    e.dataTransfer.setData('text/plain', item.id)
    setIsDragging(true)
  }

  const handleDragEnd = () => {
    setIsDragging(false)
  }

  const handleDelete = (e) => {
    e.stopPropagation()
    if (window.confirm('Tem certeza que deseja excluir este item?')) {
      onDelete(item.id)
    }
  }

  const handleEdit = (e) => {
    e.stopPropagation()
    onEdit(item)
  }

  return (
    <Card
      draggable
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      className={`
        cursor-move hover:shadow-md transition-all duration-200
        ${isDragging ? 'opacity-50 rotate-2' : ''}
      `}
    >
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <h4 className="font-semibold text-sm text-gray-800 line-clamp-2">
            {item.nome}
          </h4>
          <div className="flex space-x-1 ml-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleEdit}
              className="h-6 w-6 p-0 hover:bg-blue-100"
            >
              <Edit className="h-3 w-3" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDelete}
              className="h-6 w-6 p-0 hover:bg-red-100"
            >
              <Trash2 className="h-3 w-3" />
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-0 space-y-3">
        {/* Métrica Input/Output */}
        <div className="text-xs text-gray-600">
          <div className="flex items-center space-x-1 mb-1">
            <Target className="h-3 w-3" />
            <span className="font-medium">Métrica:</span>
          </div>
          <p className="line-clamp-2">{item.inputOutputMetric}</p>
        </div>

        {/* Tese de Produto */}
        <div className="text-xs text-gray-600">
          <p className="line-clamp-3">{item.teseProduto}</p>
        </div>

        {/* Duração */}
        {item.dataFim && (
          <div className="flex items-center space-x-1 text-gray-600">
            <span>📅</span>
            <span>Final: {new Date(item.dataFim).toLocaleDateString('pt-BR')}</span>
          </div>
        )}

        {/* OKR Vinculado */}
        {linkedOKR && (
          <Badge variant="secondary" className="text-xs">
            OKR: {linkedOKR.objetivo}
          </Badge>
        )}

        {/* Subitens */}
        {item.subitens && item.subitens.length > 0 && (
          <div className="text-xs">
            <div className="font-medium text-gray-700 mb-1">Subitens:</div>
            <ul className="list-disc list-inside space-y-1 text-gray-600">
              {item.subitens.slice(0, 2).map((subitem, index) => {
                // Converter subitem antigo (string) para nova estrutura
                const subitemObj = typeof subitem === 'string' ? { texto: subitem, status: 'nao_iniciado' } : subitem
                return (
                                                     <li key={index} className="line-clamp-1 flex items-start justify-between gap-2">
                    <span className="flex-1 min-w-0">{subitemObj.texto}</span>
                    <span className={`w-2 h-2 rounded-full flex-shrink-0 ${getStatusColor(subitemObj.status)}`}></span>
                  </li>
                )
              })}
              {item.subitens.length > 2 && (
                <li className="text-gray-400">+{item.subitens.length - 2} mais...</li>
              )}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export default RoadmapItem

