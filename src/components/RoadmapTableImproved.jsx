import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Edit, Trash2, Search, Calendar } from 'lucide-react'

const QUARTERS = {
  'Q1': { label: 'T1', months: ['Jan', 'Fev', 'Mar'], monthNumbers: [1, 2, 3] },
  'Q2': { label: 'T2', months: ['Abr', 'Mai', 'Jun'], monthNumbers: [4, 5, 6] },
  'Q3': { label: 'T3', months: ['Jul', 'Ago', 'Set'], monthNumbers: [7, 8, 9] },
  'Q4': { label: 'T4', months: ['Out', 'Nov', 'Dez'], monthNumbers: [10, 11, 12] }
}

const STATUS_CONFIG = {
  'nao_iniciado': {
    label: 'Não iniciado',
    className: 'status-nao-iniciado',
    priority: 5
  },
  'proxima_sprint': {
    label: 'Próxima Sprint',
    className: 'status-proxima-sprint',
    priority: 4
  },
  'sprint_atual': {
    label: 'Sprint Atual',
    className: 'status-sprint-atual',
    priority: 3
  },
  'em_finalizacao': {
    label: 'Em finalização',
    className: 'status-em-finalizacao',
    priority: 2
  },
  'concluida': {
    label: 'Concluída',
    className: 'status-concluida',
    priority: 1
  }
}

const RoadmapTableImproved = ({ items, okrs, onEditItem, onDeleteItem, onUpdateItemStatus, currentProduct, currentSubProduct, onDeleteBulk, canEdit = true }) => {
  const [selectedQuarter, setSelectedQuarter] = useState('Q1')
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedIds, setSelectedIds] = useState([])

  // Função para verificar se um item está ativo em um determinado mês/ano
  const isItemActiveInMonth = (item, month, year) => {
    if (!item.dataInicio || !item.duracaoMeses) return false

    const startDate = new Date(item.dataInicio)
    // normalizar data de início para primeiro dia do mês de início
    const startMonthDate = new Date(startDate.getFullYear(), startDate.getMonth(), 1)
    // duração em meses inclui o mês de início. Ex.: início Julho + duração 2 => Julho e Agosto
    const monthsIncluded = Math.max(1, parseInt(item.duracaoMeses, 10) || 1)
    const endMonthInclusive = new Date(startMonthDate.getFullYear(), startMonthDate.getMonth() + monthsIncluded, 0) // último dia do mês final

    const checkMonthStartDate = new Date(year, month - 1, 1)
    const checkMonthEndDate = new Date(year, month, 0)

    return startMonthDate <= checkMonthEndDate && endMonthInclusive >= checkMonthStartDate
  }

  // Função para verificar se um item deve ser exibido no trimestre atual
  const shouldShowItemInQuarter = (item, quarter) => {
    if (!item.dataInicio || !item.duracaoMeses) return true // Mostrar itens sem data
    
    const currentYear = new Date().getFullYear()
    const quarterMonths = QUARTERS[quarter].monthNumbers
    
    // Verificar se o item está ativo em pelo menos um mês do trimestre
    return quarterMonths.some(month => isItemActiveInMonth(item, month, currentYear))
  }

  // Função de ordenação por prioridade de status e depois por data de início (mais antiga primeiro)
  const sortItems = (itemsToSort) => {
    return [...itemsToSort].sort((a, b) => {
      // Primeiro critério: prioridade do status
      const statusPriorityA = STATUS_CONFIG[a.status]?.priority || 999
      const statusPriorityB = STATUS_CONFIG[b.status]?.priority || 999
      
      if (statusPriorityA !== statusPriorityB) {
        return statusPriorityA - statusPriorityB
      }
      
      // Segundo critério: data de início (mais antiga primeiro)
      const MAX_DATE = new Date(8640000000000000)
      const dateA = a.dataInicio ? new Date(a.dataInicio) : MAX_DATE
      const dateB = b.dataInicio ? new Date(b.dataInicio) : MAX_DATE
      
      return dateA - dateB
    })
  }

  // Filtrar itens baseado na busca, produto/sub-produto e trimestre
  const getFilteredAndSortedItems = () => {
    let filtered = items.filter(item => {
      const matchesSearch = item.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.inputOutputMetric.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.teseProduto.toLowerCase().includes(searchTerm.toLowerCase())
      
      const matchesProduct = !currentProduct || item.produto === currentProduct
      const matchesSubProduct = (currentProduct === 'web' && currentSubProduct === 'geral')
        ? true
        : (!currentSubProduct || item.subProduto === currentSubProduct)
      const matchesQuarter = shouldShowItemInQuarter(item, selectedQuarter)
      
      return matchesSearch && matchesProduct && matchesSubProduct && matchesQuarter
    })
    
    return sortItems(filtered)
  }

  const handleEdit = (item) => {
    onEditItem(item)
  }

  const handleDelete = (itemId) => {
    if (window.confirm('Tem certeza que deseja excluir este item?')) {
      onDeleteItem(itemId)
    }
  }

  const handleStatusChange = (itemId, newStatus) => {
    onUpdateItemStatus(itemId, newStatus)
  }

  const getOKRName = (okrId) => {
    const okr = okrs.find(o => o.id === okrId)
    return okr ? okr.objetivo : ''
  }

  // Calcular progresso da duração baseado no status
  const calculateDurationProgress = (item) => {
    if (!item.duracaoMeses || !item.dataInicio) return 0
    
    const startDate = new Date(item.dataInicio)
    const monthsIncluded = Math.max(1, parseInt(item.duracaoMeses, 10) || 1)
    const endDate = new Date(startDate.getFullYear(), startDate.getMonth() + monthsIncluded, 0) // último dia do mês final
    
    const now = new Date()
    const totalDuration = endDate.getTime() - startDate.getTime()
    const elapsed = now.getTime() - startDate.getTime()
    
    if (elapsed <= 0) return 0
    if (elapsed >= totalDuration) return 100
    
    return Math.round((elapsed / totalDuration) * 100)
  }

  const formatDateRange = (item) => {
    if (!item.dataInicio || !item.duracaoMeses) return ''
    
    const startDate = new Date(item.dataInicio)
    const monthsIncluded = Math.max(1, parseInt(item.duracaoMeses, 10) || 1)
    const endDate = new Date(startDate.getFullYear(), startDate.getMonth() + monthsIncluded, 0)
    
    const formatDate = (date) => {
      return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })
    }
    
    return `${formatDate(startDate)} - ${formatDate(endDate)}`
  }

  const currentQuarter = QUARTERS[selectedQuarter]
  const currentYear = new Date().getFullYear()
  const filteredItems = getFilteredAndSortedItems()

  return (
    <div className="space-y-6">
      {/* Controles */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between mt-4">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
          <div className="flex items-center space-x-2">
            <label className="text-sm font-medium text-company-dark-blue">Trimestre:</label>
            <Select value={selectedQuarter} onValueChange={setSelectedQuarter}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(QUARTERS).map(([key, quarter]) => (
                  <SelectItem key={key} value={key}>
                    {quarter.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              type="text"
              placeholder="Buscar itens..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-64"
            />
          </div>
        </div>
        {canEdit && (
          <div className="flex gap-2 ml-auto">
            <button className="px-3 py-2 text-sm rounded-md border bg-white hover:bg-gray-50 disabled:opacity-50" disabled={selectedIds.length === 0} onClick={() => onDeleteBulk && onDeleteBulk(selectedIds)}>
              Excluir selecionados ({selectedIds.length})
            </button>
            <button className="px-3 py-2 text-sm rounded-md border bg-white hover:bg-red-50 text-red-700" onClick={() => onDeleteBulk && onDeleteBulk(filteredItems.map(i => i.id))}>
              Excluir todos do trimestre/visão
            </button>
          </div>
        )}
      </div>

      {/* Tabela do Roadmap */}
      <div className="overflow-x-auto border rounded-lg">
        <table className="roadmap-table">
          <thead>
            <tr>
              {canEdit && (
                <th rowSpan="2" className="merged-header w-10">
                  <input type="checkbox" aria-label="Selecionar todos" onChange={(e) => { if (e.target.checked) setSelectedIds(filteredItems.map(i => i.id)); else setSelectedIds([]) }} checked={selectedIds.length > 0 && selectedIds.length === filteredItems.length} />
                </th>
              )}
              <th rowSpan="2" className="merged-header item-cell">Item</th>
              <th colSpan="3" className="merged-header quarter-header">
                {currentQuarter.label}
              </th>
              <th rowSpan="2" className="merged-header item-cell">OKR</th>
              <th rowSpan="2" className="merged-header item-cell">Input/Output Metric</th>
              <th rowSpan="2" className="merged-header item-cell">Tese de Produto</th>
              {canEdit && (
                <th rowSpan="2" className="merged-header w-24">Ações</th>
              )}
            </tr>
            <tr>
              {currentQuarter.months.map(month => (
                <th key={month} className="month-header">
                  {month}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filteredItems.length === 0 ? (
              <tr>
                <td colSpan="8" className="text-center py-8 text-gray-500">
                  Nenhum item encontrado para este trimestre
                </td>
              </tr>
            ) : (
              filteredItems.map(item => (
                <tr key={item.id} className="hover:bg-gray-50">
                  {canEdit && (
                    <td className="text-center align-top">
                      <input type="checkbox" checked={selectedIds.includes(item.id)} onChange={(e) => { setSelectedIds(prev => e.target.checked ? [...prev, item.id] : prev.filter(id => id !== item.id)) }} />
                    </td>
                  )}
                  <td className="item-cell">
                    <div className="space-y-2">
                      <div className="font-semibold text-company-dark-blue">
                        {item.nome}
                      </div>
                      {item.subProduto && (
                        <div className="text-xs bg-company-orange text-white px-2 py-1 rounded inline-block">
                          {item.subProduto}
                        </div>
                      )}
                      {item.subitens && item.subitens.length > 0 && (
                        <div className="text-sm text-gray-600">
                          <div className="font-medium">Subitens:</div>
                          <ul className="list-disc list-inside space-y-1">
                            {item.subitens.map((subitem, index) => (
                              <li key={index} className="text-xs">{subitem}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                      {item.duracaoMeses && item.dataInicio && (
                        <div className="space-y-1">
                          <div className="text-xs text-gray-500 flex items-center space-x-1">
                            <Calendar className="h-3 w-3" />
                            <span>{formatDateRange(item)}</span>
                          </div>
                          <div className="duration-progress">
                            <div 
                              className="duration-progress-fill"
                              style={{ width: `${calculateDurationProgress(item)}%` }}
                            ></div>
                            <div className="duration-progress-text">
                              {calculateDurationProgress(item)}%
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </td>
                  
                  {/* Colunas dos meses com marcação de período */}
                  {currentQuarter.months.map((month, index) => {
                    const monthNumber = currentQuarter.monthNumbers[index]
                    const isActive = isItemActiveInMonth(item, monthNumber, currentYear)
                    
                    return (
                      <td key={month} className="month-cell">
                        {isActive && (
                          <div 
                            className={`status-visual ${STATUS_CONFIG[item.status]?.className || ''}`}
                            onClick={() => {
                              // Ciclar entre os status ao clicar
                              const statusKeys = Object.keys(STATUS_CONFIG)
                              const currentIndex = statusKeys.indexOf(item.status)
                              const nextIndex = (currentIndex + 1) % statusKeys.length
                              handleStatusChange(item.id, statusKeys[nextIndex])
                            }}
                            title={`${STATUS_CONFIG[item.status]?.label || ''} - ${month}`}
                          >
                          </div>
                        )}
                      </td>
                    )
                  })}
                  
                  <td className="item-cell">
                    {item.okrId && (
                      <div className="text-sm bg-company-orange text-white px-2 py-1 rounded text-center">
                        {getOKRName(item.okrId)}
                      </div>
                    )}
                  </td>
                  
                  <td className="item-cell">
                    <div className="text-sm text-gray-700">
                      {item.inputOutputMetric}
                    </div>
                  </td>
                  
                  <td className="item-cell">
                    <div className="text-sm text-gray-700">
                      {item.teseProduto}
                    </div>
                  </td>
                  
                  {canEdit && (
                    <td className="text-center">
                      <div className="flex space-x-1 justify-center">
                        <Button variant="ghost" size="sm" onClick={() => handleEdit(item)} className="h-8 w-8 p-0 hover:bg-blue-100">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => handleDelete(item.id)} className="h-8 w-8 p-0 hover:bg-red-100">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Legenda de Status */}
      <div className="bg-white p-4 rounded-lg border">
        <h3 className="text-sm font-semibold text-company-dark-blue mb-3">Legenda de Status</h3>
        <div className="flex flex-wrap gap-4">
          {Object.entries(STATUS_CONFIG).map(([key, config]) => (
            <div key={key} className="flex items-center space-x-2">
              <div className={`w-4 h-4 rounded ${config.className}`}></div>
              <span className="text-sm">{config.label}</span>
            </div>
          ))}
        </div>
        <div className="mt-3 text-xs text-gray-600">
          <p><strong>Ordenação:</strong> Concluída → Em finalização → Sprint Atual → Próxima Sprint → Não iniciado</p>
          <p><strong>Período:</strong> Itens são exibidos apenas se estiverem ativos no trimestre selecionado</p>
        </div>
      </div>
    </div>
  )
}

export default RoadmapTableImproved

