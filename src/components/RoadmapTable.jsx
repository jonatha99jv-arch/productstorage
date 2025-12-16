import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Edit, Trash2, Search } from 'lucide-react'

const QUARTERS = {
  'Q1': { label: 'T1', months: ['Jan', 'Fev', 'Mar'] },
  'Q2': { label: 'T2', months: ['Abr', 'Mai', 'Jun'] },
  'Q3': { label: 'T3', months: ['Jul', 'Ago', 'Set'] },
  'Q4': { label: 'T4', months: ['Out', 'Nov', 'Dez'] }
}

const STATUS_CONFIG = {
  'nao_iniciado': {
    label: 'Não iniciado',
    className: 'status-nao-iniciado'
  },
  'proxima_sprint': {
    label: 'Próxima Sprint',
    className: 'status-proxima-sprint'
  },
  'sprint_atual': {
    label: 'Sprint Atual',
    className: 'status-sprint-atual'
  },
  'em_finalizacao': {
    label: 'Em finalização',
    className: 'status-em-finalizacao'
  },
  'concluida': {
    label: 'Concluída',
    className: 'status-concluida'
  }
}

const RoadmapTable = ({ items, okrs, onEditItem, onDeleteItem, onUpdateItemStatus }) => {
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
  const getDefaultQuarter = () => {
    const m = new Date().getMonth() + 1
    if (m <= 3) return 'Q1'
    if (m <= 6) return 'Q2'
    if (m <= 9) return 'Q3'
    return 'Q4'
  }
  const [selectedQuarter, setSelectedQuarter] = useState(getDefaultQuarter())
  const [searchTerm, setSearchTerm] = useState('')
  const [filtersLoaded, setFiltersLoaded] = useState(false)

  // Filtrar itens baseado na busca
  const filteredItems = items.filter(item =>
    item.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.inputOutputMetric.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.teseProduto.toLowerCase().includes(searchTerm.toLowerCase())
  )

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

  const currentQuarter = QUARTERS[selectedQuarter]
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

  // Persistir seleção de trimestre (mantém após a primeira carga)
  useEffect(() => {
    try {
      const saved = localStorage.getItem('roadmapTableFilters')
      if (saved) {
        const parsed = JSON.parse(saved)
        if (parsed.quarter) setSelectedQuarter(parsed.quarter)
      }
      setFiltersLoaded(true)
    } catch (e) {
      console.warn('Não foi possível carregar filtros salvos da tabela simples', e)
      setFiltersLoaded(true)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (!filtersLoaded) return
    try {
      localStorage.setItem('roadmapTableFilters', JSON.stringify({ quarter: selectedQuarter }))
    } catch (e) {
      // ignore
    }
  }, [filtersLoaded, selectedQuarter])

  return (
    <div className="space-y-6">
      {/* Controles */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
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
      </div>

      {/* Tabela do Roadmap */}
      <div className="overflow-x-auto border rounded-lg">
        <table className="roadmap-table">
          <colgroup>
            <col className="col-item" />
            <col className="col-month" />
            <col className="col-month" />
            <col className="col-month" />
            <col className="col-okr" />
            <col className="col-metric" />
            <col className="col-tese" />
            <col className="col-actions" />
          </colgroup>
          <thead>
            <tr>
              <th className="item-cell item-name-cell">Item</th>
              <th className="quarter-header" colSpan="3">
                <button type="button" className="quarter-arrow left" aria-label="Trimestre anterior" onClick={goPrevQuarter} />
                {currentQuarter.label}
                <button type="button" className="quarter-arrow right" aria-label="Próximo trimestre" onClick={goNextQuarter} />
              </th>
              <th className="item-cell">OKR</th>
              <th className="item-cell metric-cell">Input/Output Metric</th>
              <th className="item-cell tese-cell">Tese de Produto</th>
              <th className="w-24">Ações</th>
            </tr>
            <tr>
              <th></th>
              {currentQuarter.months.map(month => (
                <th key={month} className="month-header">
                  {month}
                </th>
              ))}
              <th></th>
              <th></th>
              <th></th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {filteredItems.length === 0 ? (
              <tr>
                <td colSpan="8" className="text-center py-8 text-gray-500">
                  Nenhum item encontrado
                </td>
              </tr>
            ) : (
              filteredItems.map(item => (
                <tr key={item.id} className="hover:bg-gray-50">
                  <td className="item-cell">
                    <div className="space-y-2">
                      <div className="font-semibold text-company-dark-blue">
                        {item.nome}
                      </div>
                      {item.subitens && item.subitens.length > 0 && (
                        <div className="text-sm text-gray-600">
                          <div className="font-medium">Subitens:</div>
                          <ul className="list-disc list-inside space-y-1">
                            {item.subitens.map((subitem, index) => {
                              // Converter subitem antigo (string) para nova estrutura
                              const subitemObj = typeof subitem === 'string' ? { texto: subitem, status: 'nao_iniciado' } : subitem
                              return (
                                                                                                 <li key={index} className="text-xs flex items-start justify-between gap-2">
                                  <span className="flex-1 min-w-0">{subitemObj.texto}</span>
                                  <span className={`w-2 h-2 rounded-full flex-shrink-0 ${getStatusColor(subitemObj.status)}`}></span>
                                </li>
                              )
                            })}
                          </ul>
                        </div>
                      )}
                      {item.dataFim && (
                        <div className="text-xs text-gray-500">
                          <span>📅 Final: {new Date(item.dataFim).toLocaleDateString('pt-BR')}</span>
                        </div>
                      )}
                    </div>
                  </td>
                  
                  {/* Colunas dos meses */}
                  {currentQuarter.months.map((month, index) => (
                    <td key={month} className="text-center">
                      {index === 1 && ( // Mostrar status no mês do meio
                        <div className="space-y-2">
                          <select
                            value={item.status}
                            onChange={(e) => handleStatusChange(item.id, e.target.value)}
                            className={`w-full text-xs p-1 rounded border-0 ${STATUS_CONFIG[item.status]?.className || ''}`}
                          >
                            {Object.entries(STATUS_CONFIG).map(([key, config]) => (
                              <option key={key} value={key}>
                                {config.label}
                              </option>
                            ))}
                          </select>
                        </div>
                      )}
                    </td>
                  ))}
                  
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
                  
                  <td className="text-center">
                    <div className="flex space-x-1 justify-center">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(item)}
                        className="h-8 w-8 p-0 hover:bg-blue-100"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(item.id)}
                        className="h-8 w-8 p-0 hover:bg-red-100"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </td>
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
      </div>
    </div>
  )
}

export default RoadmapTable

