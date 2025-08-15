import { useState } from 'react'
import RoadmapItem from './RoadmapItem'

const StatusColumn = ({ status, config, items, okrs, onEditItem, onDeleteItem, onDrop }) => {
  const [dragOver, setDragOver] = useState(false)

  const handleDragOver = (e) => {
    e.preventDefault()
    setDragOver(true)
  }

  const handleDragLeave = (e) => {
    e.preventDefault()
    setDragOver(false)
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setDragOver(false)
    
    const itemId = e.dataTransfer.getData('text/plain')
    if (itemId) {
      onDrop(itemId, status)
    }
  }

  return (
    <div
      className={`
        ${config.bgColor} ${config.borderColor} 
        border-2 rounded-lg p-4 min-h-[500px]
        ${dragOver ? 'border-blue-400 bg-blue-50' : ''}
        transition-colors duration-200
      `}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {/* Header da coluna */}
      <div className="flex items-center space-x-2 mb-4">
        <div className={`w-3 h-3 ${config.color} rounded-full`}></div>
        <h3 className="font-semibold text-gray-800">{config.label}</h3>
        <span className="bg-gray-200 text-gray-700 text-xs px-2 py-1 rounded-full">
          {items.length}
        </span>
      </div>

      {/* Lista de itens */}
      <div className="space-y-3">
        {items.map(item => (
          <RoadmapItem
            key={item.id}
            item={item}
            okrs={okrs}
            onEdit={onEditItem}
            onDelete={onDeleteItem}
          />
        ))}
      </div>

      {/* Placeholder quando vazio */}
      {items.length === 0 && (
        <div className="text-center text-gray-400 mt-8">
          <p className="text-sm">Nenhum item neste status</p>
        </div>
      )}
    </div>
  )
}

export default StatusColumn

