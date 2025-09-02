import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Edit, Trash2, Search, Calendar, Copy } from 'lucide-react'

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

const SUBPRODUCT_LABELS = {
  'portal_estrela': 'Portal Estrela',
  'backoffice': 'Backoffice',
  'doctor': 'Doctor',
  'company': 'Company',
  'brasil': 'Brasil',
  'global': 'Global',
  'geral': 'Geral',
}

const SUBPRODUCT_COLORS = {
  'portal_estrela': 'bg-emerald-600',
  'backoffice': 'bg-indigo-600',
  'doctor': 'bg-sky-600',
  'company': 'bg-purple-600',
  'brasil': 'bg-green-600',
  'global': 'bg-blue-600',
  'geral': 'bg-gray-600',
}

const formatSubProductLabel = (value) => {
  if (!value) return ''
  if (SUBPRODUCT_LABELS[value]) return SUBPRODUCT_LABELS[value]
  return String(value).replaceAll('_', ' ').replace(/\b\w/g, (m) => m.toUpperCase())
}

const RoadmapTableImproved = ({ items, okrs, onEditItem, onDeleteItem, onUpdateItemStatus, onDuplicateItem, currentProduct, currentSubProduct, onDeleteBulk, canEdit = true }) => {
  const getDefaultQuarter = () => {
    const m = new Date().getMonth() + 1
    if (m <= 3) return 'Q1'
    if (m <= 6) return 'Q2'
    if (m <= 9) return 'Q3'
    return 'Q4'
  }
  const [selectedQuarter, setSelectedQuarter] = useState(getDefaultQuarter())
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('todos')
  const [selectedIds, setSelectedIds] = useState([])
  const [previewItem, setPreviewItem] = useState(null)
  const [expandedItems, setExpandedItems] = useState({})

  const toggleExpanded = (id) => {
    setExpandedItems(prev => ({ ...prev, [id]: !prev[id] }))
  }

  // Função para verificar se um item está ativo em um determinado mês/ano
  const isItemActiveInMonth = (item, month, year) => {
    if (!item.dataInicio || !item.dataFim) return false

    const startDate = new Date(item.dataInicio)
    const endDate = new Date(item.dataFim)
    
    // Usar o ano das datas do item, não o ano atual
    const itemYear = startDate.getFullYear()
    
    // normalizar data de início para primeiro dia do mês de início
    const startMonthDate = new Date(startDate.getFullYear(), startDate.getMonth(), 1)
    // normalizar data final para último dia do mês de fim
    const endMonthDate = new Date(endDate.getFullYear(), endDate.getMonth() + 1, 0)

    const checkMonthStartDate = new Date(year, month - 1, 1)
    const checkMonthEndDate = new Date(year, month, 0)

    return startMonthDate <= checkMonthEndDate && endMonthDate >= checkMonthStartDate
  }

  // Função para calcular a proporção de preenchimento de um mês
  const getMonthFillProportion = (item, month, year) => {
    if (!item.dataInicio || !item.dataFim) return 0

    const startDate = new Date(item.dataInicio)
    const endDate = new Date(item.dataFim)
    
    // Usar o ano das datas do item
    const itemYear = startDate.getFullYear()
    
    const monthStart = new Date(itemYear, month - 1, 1)
    const monthEnd = new Date(itemYear, month, 0)
    
    // Se o item não está ativo neste mês, retorna 0
    if (startDate > monthEnd || endDate < monthStart) return 0
    
    // Calcular quantos dias do mês o item está ativo
    const effectiveStart = startDate > monthStart ? startDate : monthStart
    const effectiveEnd = endDate < monthEnd ? endDate : monthEnd
    
    // Calcular diferença em dias
    const timeDiff = effectiveEnd.getTime() - effectiveStart.getTime()
    const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24)) + 1
    
    const daysInMonth = monthEnd.getDate()
    const activeDays = Math.max(0, daysDiff)
    
    return activeDays / daysInMonth
  }

  // Verificar se o item tem qualquer sobreposição com os meses do trimestre, considerando mudanças de ano
  const shouldShowItemInQuarter = (item, quarter) => {
    if (!item.dataInicio || !item.dataFim) return true
    const quarterMonths = QUARTERS[quarter].monthNumbers
    const start = new Date(item.dataInicio)
    const end = new Date(item.dataFim)
    // Normalizar para o primeiro/último dia dos meses
    let cursor = new Date(start.getFullYear(), start.getMonth(), 1)
    const endMonthEdge = new Date(end.getFullYear(), end.getMonth(), 1)
    while (cursor <= endMonthEdge) {
      const monthNum = cursor.getMonth() + 1
      if (quarterMonths.includes(monthNum)) return true
      // avançar 1 mês
      cursor.setMonth(cursor.getMonth() + 1)
    }
    return false
  }

  // Função de ordenação por prioridade de status, data de início e data de finalização
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
      const startDateA = a.dataInicio ? new Date(a.dataInicio) : MAX_DATE
      const startDateB = b.dataInicio ? new Date(b.dataInicio) : MAX_DATE
      
      if (startDateA.getTime() !== startDateB.getTime()) {
        return startDateA - startDateB
      }
      
      // Terceiro critério: data de finalização (mais antiga primeiro)
      const endDateA = a.dataFim ? new Date(a.dataFim) : MAX_DATE
      const endDateB = b.dataFim ? new Date(b.dataFim) : MAX_DATE
      
      return endDateA - endDateB
    })
  }

  // Filtrar itens baseado na busca, produto/sub-produto e trimestre
  const getFilteredAndSortedItems = () => {
    let filtered = items.filter(item => {
      const matchesSearch = item.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.inputOutputMetric.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.teseProduto.toLowerCase().includes(searchTerm.toLowerCase())

      const matchesProduct = !currentProduct || item.produto === currentProduct
      const matchesSubProduct = (() => {
        if (currentProduct === 'web' || currentProduct === 'aplicativo') {
          // Em Geral (ou sem seleção), mostrar todos os subprodutos e também itens sem subProduto
          if (!currentSubProduct || currentSubProduct === 'geral') return true
          return item.subProduto === currentSubProduct
        }
        return true
      })()

      const statusValue = (item.status || '').toString().toLowerCase()
      const matchesStatus = (
        statusFilter === 'concluidos' ? statusValue === 'concluida'
        : statusFilter === 'ativos' ? statusValue !== 'concluida'
        : true
      )

      // Sempre respeitar o trimestre selecionado
      const matchesQuarter = shouldShowItemInQuarter(item, selectedQuarter)

      return matchesSearch && matchesProduct && matchesSubProduct && matchesQuarter && matchesStatus
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

  const handleDuplicate = (item) => {
    if (!item) return
    onDuplicateItem(item)
  }

  const getOKRName = (okrId) => {
    const okr = okrs.find(o => o.id === okrId)
    return okr ? okr.objetivo : ''
  }

  // Calcular progresso da duração baseado no status
  const calculateDurationProgress = (item) => {
    // Se o status for 'concluida', retornar 100% automaticamente
    if (item.status === 'concluida') return 100
    
    if (!item.dataInicio || !item.dataFim) return 0
    
    const startDate = new Date(item.dataInicio)
    const endDate = new Date(item.dataFim)
    
    const totalDuration = endDate.getTime() - startDate.getTime()
    const elapsed = new Date().getTime() - startDate.getTime()
    
    if (elapsed <= 0) return 0
    if (elapsed >= totalDuration) return 100
    
    return Math.round((elapsed / totalDuration) * 100)
  }

  const formatDateRange = (item) => {
    if (!item.dataInicio || !item.dataFim) return ''
    
    const startDate = new Date(item.dataInicio)
    const endDate = new Date(item.dataFim)
    
    const formatDate = (date) => {
      return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })
    }
    
    return `${formatDate(startDate)} - ${formatDate(endDate)}`
  }

  const getEndDate = (item) => {
    if (!item?.dataInicio || !item?.dataFim) return null
    const startDate = new Date(item.dataInicio)
    const endDate = new Date(item.dataFim)
    return endDate
  }

  const formatFullDate = (dateLike) => {
    if (!dateLike) return ''
    const d = (dateLike instanceof Date) ? dateLike : new Date(dateLike)
    if (Number.isNaN(d.getTime())) return ''
    return d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' })
  }

  // Calcular diferença aproximada em meses entre duas datas (inclui mês corrente se houver sobreposição)
  const diffInMonthsInclusive = (startLike, endLike) => {
    const start = (startLike instanceof Date) ? startLike : new Date(startLike)
    const end = (endLike instanceof Date) ? endLike : new Date(endLike)
    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return 0
    let months = (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth())
    // incluir o mês final quando o dia de fim é >= dia de início
    if (end.getDate() >= start.getDate()) months += 1
    // garantir ao menos 1 mês quando estiver no mesmo mês
    return Math.max(1, months)
  }

  const getStatusColor = (status) => {
    const config = STATUS_CONFIG[status] || STATUS_CONFIG['nao_iniciado']
    // Mapear as classes CSS para cores hexadecimais - usando as mesmas cores das variáveis CSS
    const colorMap = {
      'status-nao-iniciado': '#ff6b6b', // --status-not-started
      'status-proxima-sprint': '#ff9f43', // --status-next-sprint
      'status-sprint-atual': '#ffc048', // --status-current-sprint
      'status-em-finalizacao': '#a8e6cf', // --status-finalizing
      'status-concluida': '#16A34A' // --status-completed
    }
    return colorMap[config.className] || '#6b7280' // gray-500 como fallback
  }

  const currentQuarter = QUARTERS[selectedQuarter]
  const currentYear = new Date().getFullYear()
  const filteredItems = getFilteredAndSortedItems()

  const quarterKeys = Object.keys(QUARTERS)
  const goPrevQuarter = () => {
    const idx = quarterKeys.indexOf(selectedQuarter)
    const prev = idx <= 0 ? quarterKeys[quarterKeys.length - 1] : quarterKeys[idx - 1]
    setSelectedQuarter(prev)
  }
  const goNextQuarter = () => {
    const idx = quarterKeys.indexOf(selectedQuarter)
    const next = idx >= quarterKeys.length - 1 ? quarterKeys[0] : quarterKeys[idx + 1]
    setSelectedQuarter(next)
  }

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
          <div className="flex items-center space-x-2">
            <label className="text-sm font-medium text-company-dark-blue">Status:</label>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos</SelectItem>
                <SelectItem value="concluidos">Concluídos</SelectItem>
                <SelectItem value="ativos">Ativos</SelectItem>
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
      <div className="roadmap-table-container">
        <table className="roadmap-table">
          <colgroup>
            {canEdit && <col className="col-select" />}
            <col className="col-item" />
            <col className="col-month" />
            <col className="col-month" />
            <col className="col-month" />
            <col className="col-okr" />
            <col className="col-metric" />
            <col className="col-tese" />
            {canEdit && <col className="col-actions" />}
          </colgroup>
          <thead>
            <tr>
              {canEdit && (
                <th rowSpan="2" className="merged-header w-10">
                  <input type="checkbox" aria-label="Selecionar todos" onChange={(e) => { if (e.target.checked) setSelectedIds(filteredItems.map(i => i.id)); else setSelectedIds([]) }} checked={selectedIds.length > 0 && selectedIds.length === filteredItems.length} />
                </th>
              )}
              <th rowSpan="2" className="merged-header item-cell item-name-cell">Item</th>
              <th colSpan="3" className="merged-header quarter-header">
                <button type="button" className="quarter-arrow left" aria-label="Trimestre anterior" onClick={goPrevQuarter} />
                {currentQuarter.label}
                <button type="button" className="quarter-arrow right" aria-label="Próximo trimestre" onClick={goNextQuarter} />
              </th>
              <th rowSpan="2" className="merged-header item-cell">OKR</th>
              <th rowSpan="2" className="merged-header item-cell metric-cell">Input/Output Metric</th>
              <th rowSpan="2" className="merged-header item-cell tese-cell">Tese de Produto</th>
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
                <td colSpan={canEdit ? 9 : 8} className="text-center py-8 text-gray-500">
                  Nenhum item encontrado para este trimestre
                </td>
              </tr>
            ) : (
              filteredItems.map(item => (
                <tr key={item.id} className="hover:bg-gray-50">
                  {canEdit && (
                    <td className="text-center align-middle">
                      <input type="checkbox" checked={selectedIds.includes(item.id)} onChange={(e) => { setSelectedIds(prev => e.target.checked ? [...prev, item.id] : prev.filter(id => id !== item.id)) }} />
                    </td>
                  )}
                  <td className="item-cell">
                    <div className="space-y-2">
                      <button type="button" className="block font-semibold text-company-dark-blue text-left hover:text-company-orange transition-colors" onClick={() => setPreviewItem(item)}>
                        {item.nome}
                      </button>
                      {item.subProduto && item.subProduto !== 'geral' && (
                        <div className="mt-1 flex items-center gap-2">
                          <div className={`text-xs text-white px-2 py-1 rounded inline-block ${SUBPRODUCT_COLORS[item.subProduto] || 'bg-gray-600'}`}>
                            {formatSubProductLabel(item.subProduto)}
                          </div>
                          {item.dataInicio && item.dataFim && (
                            <div className="text-xs text-gray-500 flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              <span>{formatDateRange(item)}</span>
                              {Array.isArray(item.subitens) && item.subitens.length > 0 && (
                                <button type="button" aria-label="Alternar subitens" onClick={() => toggleExpanded(item.id)} className="ml-1 inline-flex items-center">
                                  <span style={{ display:'inline-block', width:0, height:0, borderLeft:'5px solid transparent', borderRight:'5px solid transparent', borderTop:'6px solid #64748b', transform: expandedItems[item.id] ? 'rotate(180deg)' : 'none', transition:'transform 120ms ease' }} />
                                </button>
                              )}
                            </div>
                          )}
                        </div>
                      )}
                      {(!item.subProduto || item.subProduto === 'geral') && item.dataInicio && item.dataFim && (
                        <div className="mt-1 flex items-center gap-1 text-xs text-gray-500">
                          <Calendar className="h-3 w-3" />
                          <span>{formatDateRange(item)}</span>
                          {Array.isArray(item.subitens) && item.subitens.length > 0 && (
                            <button type="button" aria-label="Alternar subitens" onClick={() => toggleExpanded(item.id)} className="ml-1 inline-flex items-center">
                              <span style={{ display:'inline-block', width:0, height:0, borderLeft:'5px solid transparent', borderRight:'5px solid transparent', borderTop:'6px solid #64748b', transform: expandedItems[item.id] ? 'rotate(180deg)' : 'none', transition:'transform 120ms ease' }} />
                            </button>
                          )}
                        </div>
                      )}
                      {/* Subitens removidos da coluna Item conforme solicitado */}
                      {item.dataInicio && item.dataFim && (
                        <div className="space-y-1">
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
                      {expandedItems[item.id] && Array.isArray(item.subitens) && item.subitens.length > 0 && (
                        <div className="mt-2">
                          <div className="text-[10px] text-gray-500 mb-1">Subitens</div>
                          <div className="space-y-1">
                            {item.subitens.map((subitem, idx) => {
                              // Converter subitem antigo (string) para nova estrutura
                              const subitemObj = typeof subitem === 'string' 
                                ? { texto: subitem, status: 'nao_iniciado' } 
                                : subitem
                              
                              const statusConfig = STATUS_CONFIG[subitemObj.status] || STATUS_CONFIG['nao_iniciado']
                              
                              return (
                                                                  <div key={idx} className={`flex items-center bg-gray-50 px-2 py-1 rounded text-xs border-l-4 gap-2 subitem-${subitemObj.status}`}>
                                    <span className="text-gray-700 flex-1 min-w-0">{subitemObj.texto}</span>
                                    <div className="w-20 h-5 text-xs flex items-center space-x-1 flex-shrink-0">
                                      <span className="text-xs whitespace-nowrap">{statusConfig.label}</span>
                                    </div>
                                   <Select
                                     value={subitemObj.status}
                                     onValueChange={(newStatus) => {
                                       // Atualizar status do subitem
                                       const updatedSubitens = [...item.subitens]
                                       if (typeof updatedSubitens[idx] === 'string') {
                                         updatedSubitens[idx] = { texto: updatedSubitens[idx], status: newStatus }
                                       } else {
                                         updatedSubitens[idx] = { ...updatedSubitens[idx], status: newStatus }
                                       }
                                       
                                       // Chamar função para atualizar o item
                                       const updatedItem = { ...item, subitens: updatedSubitens }
                                       onUpdateItemStatus(item.id, item.status, updatedItem)
                                     }}
                                   >
                                    <SelectTrigger className="w-6 h-5 text-xs border-0 bg-transparent hover:bg-gray-100 flex-shrink-0 p-0">
                                      <div className="flex items-center justify-center">
                                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                        </svg>
                                       </div>
                                     </SelectTrigger>
                                     <SelectContent>
                                       {Object.entries(STATUS_CONFIG).map(([status, config]) => (
                                         <SelectItem key={status} value={status}>
                                             <span>{config.label}</span>
                                         </SelectItem>
                                       ))}
                                     </SelectContent>
                                   </Select>
                                 </div>
                              )
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  </td>
                  
                  {/* Colunas dos meses com marcação de período */}
                  {currentQuarter.months.map((month, index) => {
                    const monthNumber = currentQuarter.monthNumbers[index]
                    // Usar o ano das datas do item, não o ano atual
                    const itemYear = item.dataInicio ? new Date(item.dataInicio).getFullYear() : new Date().getFullYear()
                    const isActive = isItemActiveInMonth(item, monthNumber, itemYear)
                    const fillProportion = getMonthFillProportion(item, monthNumber, itemYear)
                    
                    // Calcular posição da barra baseada na data de início
                    const computePlacement = () => {
                      if (!item.dataInicio) return { leftPercent: 0 }
                      const startDate = new Date(item.dataInicio)
                      if (startDate.getMonth() === monthNumber - 1 && startDate.getFullYear() === itemYear) {
                        const dayOfMonth = startDate.getDate()
                        const daysInMonth = new Date(itemYear, monthNumber, 0).getDate()
                        const startPosition = (dayOfMonth - 1) / daysInMonth
                        return { leftPercent: Math.max(0, Math.min(100, startPosition * 100)) }
                      }
                      return { leftPercent: 0 }
                    }
                    
                    return (
                      <td key={month} className="month-cell">
                        {isActive && (
                          <div 
                            className={`status-visual ${STATUS_CONFIG[item.status]?.className || ''}`}
                            style={{
                              // Garantir que não ultrapasse a célula: width + left <= 100%
                              ...( (() => {
                                const { leftPercent } = computePlacement()
                                const rawWidth = Math.max(fillProportion * 100, 30)
                                const clampedWidth = Math.max(0, Math.min(100 - leftPercent, rawWidth))
                                return { width: `${clampedWidth}%`, marginLeft: `${leftPercent}%` }
                              })() )
                            }}
                            onClick={() => {
                              // Ciclar entre os status ao clicar
                              const statusKeys = Object.keys(STATUS_CONFIG)
                              const currentIndex = statusKeys.indexOf(item.status)
                              const nextIndex = (currentIndex + 1) % statusKeys.length
                              handleStatusChange(item.id, statusKeys[nextIndex])
                            }}
                            title={`${STATUS_CONFIG[item.status]?.label || ''} - ${month} (${Math.round(fillProportion * 100)}% do mês)`}
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
                    <td className="text-center actions-cell">
                      <div className="flex space-x-1 justify-center items-center">
                        <Button variant="ghost" size="sm" onClick={() => handleEdit(item)} className="h-8 w-8 p-0 hover:bg-blue-100">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => handleDuplicate(item)} className="h-8 w-8 p-0 hover:bg-purple-100">
                          <Copy className="h-4 w-4" />
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
          <p><strong>Ordenação:</strong> 1º Status (Concluída → Em finalização → Sprint Atual → Próxima Sprint → Não iniciado) → 2º Data de início (mais antiga primeiro) → 3º Data de finalização (mais antiga primeiro)</p>
          <p><strong>Período:</strong> Itens são exibidos apenas se estiverem ativos no trimestre selecionado</p>
        </div>
      </div>

      {/* Visualização do Item (somente leitura) */}
      <Dialog open={!!previewItem} onOpenChange={(open) => { if (!open) setPreviewItem(null) }}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-company-dark-blue">{previewItem?.nome || 'Item'}</DialogTitle>
            <DialogDescription>Detalhes do item selecionado</DialogDescription>
          </DialogHeader>
          {previewItem && (
            <div className="max-h-[70vh] overflow-y-auto pr-1">
              <div className="space-y-4">
              {(previewItem.subProduto && previewItem.subProduto !== 'geral') && (
                <div className={`inline-block text-xs text-white px-2 py-1 rounded ${SUBPRODUCT_COLORS[previewItem.subProduto] || 'bg-gray-600'}`}>
                  {formatSubProductLabel(previewItem.subProduto)}
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <div className="text-xs text-gray-500">Data de início</div>
                  <div className="text-sm font-medium">{formatFullDate(previewItem.dataInicio)}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-500">Data Final</div>
                  <div className="text-sm font-medium">{previewItem.dataFim ? new Date(previewItem.dataFim).toLocaleDateString('pt-BR') : '-'}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-500">Duração</div>
                  <div className="text-sm font-medium">{previewItem.dataInicio && previewItem.dataFim ? `${diffInMonthsInclusive(previewItem.dataInicio, previewItem.dataFim)} meses` : '-'}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-500">OKR</div>
                  <div className="text-sm font-medium">{previewItem.okrId ? (okrs.find(o => o.id === previewItem.okrId)?.objetivo || previewItem.okrId) : '-'}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-500">Status</div>
                  <div className="flex items-center gap-2 text-sm font-medium">
                    <span className={`inline-block w-3 h-3 rounded ${STATUS_CONFIG[previewItem.status]?.className || ''}`}></span>
                    {STATUS_CONFIG[previewItem.status]?.label || previewItem.status}
                  </div>
                </div>
              </div>

                             {previewItem.subitens && previewItem.subitens.length > 0 && (
                 <div>
                  <div className="text-sm text-gray-500 mb-2">Subitens</div>
                  <div className="space-y-2">
                     {previewItem.subitens.map((si, i) => {
                       // Converter subitem antigo (string) para nova estrutura
                       const subitemObj = typeof si === 'string' ? { texto: si, status: 'nao_iniciado' } : si
                       return (
                                                <div key={i} className="flex items-center justify-between bg-gray-50 px-3 py-2 rounded border-l-4 gap-3" style={{ borderLeftColor: getStatusColor(subitemObj.status) }}>
                          <span className="text-gray-700 flex-1 min-w-0 text-sm">{subitemObj.texto}</span>
                          <div className="w-24 h-6 flex items-center space-x-2 flex-shrink-0">
                            <div className={`w-3 h-3 rounded-full ${STATUS_CONFIG[subitemObj.status]?.className.replace('status-', 'bg-')}`}></div>
                            <span className="text-sm whitespace-nowrap">{STATUS_CONFIG[subitemObj.status]?.label || subitemObj.status}</span>
                          </div>
                        </div>
                       )
                     })}
                   </div>
                 </div>
               )}

              {(previewItem.dataInicio && previewItem.dataFim) && (
                <div>
                  <div className="text-xs text-gray-500 mb-1">Progresso</div>
                  <div className="duration-progress">
                    <div className="duration-progress-fill" style={{ width: `${calculateDurationProgress(previewItem)}%` }}></div>
                    <div className="duration-progress-text">{calculateDurationProgress(previewItem)}%</div>
                  </div>
                </div>
              )}

              {!!previewItem.descricao && (
                <div>
                  <div className="text-xs text-gray-500 mb-1">Descrição</div>
                  <div className="text-sm bg-gray-50 border rounded p-3 whitespace-pre-wrap">{previewItem.descricao}</div>
                </div>
              )}

              <div>
                <div className="text-xs text-gray-500 mb-1">Métrica Input/Output</div>
                <div className="text-sm bg-gray-50 border rounded p-3 whitespace-pre-wrap">{previewItem.inputOutputMetric || '-'}</div>
              </div>
              <div>
                <div className="text-xs text-gray-500 mb-1">Tese de Produto</div>
                <div className="text-sm bg-gray-50 border rounded p-3 whitespace-pre-wrap">{previewItem.teseProduto || '-'}</div>
              </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default RoadmapTableImproved

