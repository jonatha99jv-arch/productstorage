import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { CalendarIcon, Plus, X, ChevronDown } from 'lucide-react'

const STATUS_OPTIONS = [
  { value: 'nao_iniciado', label: 'Não Iniciado' },
  { value: 'proxima_sprint', label: 'Próxima Sprint' },
  { value: 'sprint_atual', label: 'Sprint Atual' },
  { value: 'em_finalizacao', label: 'Em Finalização' },
  { value: 'concluida', label: 'Concluída' }
]

const PRODUCT_OPTIONS = [
  { value: 'aplicativo', label: 'Aplicativo' },
  { value: 'web', label: 'Web' },
  { value: 'parcerias', label: 'Parcerias' },
  { value: 'ai', label: 'AI' },
  { value: 'automacao', label: 'Automação' }
]

const WEB_SUB_PRODUCTS = [
  { value: 'backoffice', label: 'Backoffice' },
  { value: 'portal_estrela', label: 'Portal Estrela' },
  { value: 'doctor', label: 'Doctor' },
  { value: 'company', label: 'Company' }
]

const APP_SUB_PRODUCTS = [
  { value: 'brasil', label: 'Brasil' },
  { value: 'global', label: 'Global' }
]

const ItemModalImproved = ({ item, okrs, onSave, onClose }) => {
  const [formData, setFormData] = useState({
    id: null,
    nome: '',
    subitens: [''],
    inputOutputMetric: '',
    teseProduto: '',
    descricao: '',
    dataFim: null,
    dataInicio: null,
    status: 'nao_iniciado',
    okrId: '',
    produto: 'aplicativo',
    subProduto: ''
  })

  const [calendarOpen, setCalendarOpen] = useState(false)
  const [calendarFimOpen, setCalendarFimOpen] = useState(false)

  useEffect(() => {
    if (item) {
      setFormData({
        id: item.id || null,
        nome: item.nome || '',
        subitens: item.subitens && item.subitens.length > 0 ? item.subitens : [''],
        inputOutputMetric: item.inputOutputMetric || '',
        teseProduto: item.teseProduto || '',
        descricao: item.descricao || '',
        dataFim: item.dataFim ? new Date(item.dataFim) : null,
        dataInicio: item.dataInicio ? new Date(item.dataInicio) : null,
        status: item.status || 'nao_iniciado',
        okrId: item.okrId || '',
        produto: item.produto || 'aplicativo',
        subProduto: item.subProduto || ''
      })
    }
  }, [item])

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleSubitemChange = (index, value) => {
    const newSubitens = [...formData.subitens]
    newSubitens[index] = value
    setFormData(prev => ({
      ...prev,
      subitens: newSubitens
    }))
  }

  const addSubitem = () => {
    setFormData(prev => ({
      ...prev,
      subitens: [...prev.subitens, '']
    }))
  }

  const removeSubitem = (index) => {
    if (formData.subitens.length > 1) {
      const newSubitens = formData.subitens.filter((_, i) => i !== index)
      setFormData(prev => ({
        ...prev,
        subitens: newSubitens
      }))
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    
    if (!formData.nome.trim() || !formData.inputOutputMetric.trim() || !formData.teseProduto.trim()) {
      alert('Por favor, preencha todos os campos obrigatórios.')
      return
    }

    // Validação adicional para datas
    if (formData.dataInicio && formData.dataFim) {
      const inicio = new Date(formData.dataInicio)
      const fim = new Date(formData.dataFim)
      if (fim <= inicio) {
        alert('A data final deve ser posterior à data de início.')
        return
      }
    }

    const dataToSave = {
      ...formData,
      subitens: formData.subitens.filter(subitem => subitem.trim() !== ''),
      dataInicio: formData.dataInicio ? formData.dataInicio.toISOString() : null,
      dataFim: formData.dataFim ? formData.dataFim.toISOString() : null
    }

    console.log('🔍 ItemModalImproved - dados a serem salvos:', dataToSave)
    onSave(dataToSave)
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-2xl max-h-[90vh] overflow-y-auto w-full mx-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-company-dark-blue">
            {item ? 'Editar Item do Roadmap' : 'Novo Item do Roadmap'}
          </h2>
          <Button
            variant="ghost"
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Nome do Item */}
          <div className="space-y-1.5">
            <Label htmlFor="nome">Novo Item *</Label>
            <Input
              id="nome"
              value={formData.nome}
              onChange={(e) => handleInputChange('nome', e.target.value)}
              placeholder="Ex: Novo Aplicativo Global"
              required
            />
          </div>

          {/* Produto */}
          <div className="space-y-1.5">
            <Label htmlFor="produto">Produto *</Label>
            <div className="relative">
              <select
                id="produto"
                value={formData.produto}
                onChange={(e) => {
                  handleInputChange('produto', e.target.value)
                  if (e.target.value === 'web' || e.target.value === 'aplicativo') {
                    handleInputChange('subProduto', '')
                  } else {
                    handleInputChange('subProduto', '')
                  }
                }}
                className="w-full p-2 pr-10 border border-gray-300 rounded-md appearance-none"
                required
              >
              {PRODUCT_OPTIONS.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
            </div>
          </div>

          {/* Sub-produto (Web e Aplicativo) */}
          {(formData.produto === 'web' || formData.produto === 'aplicativo') && (
            <div>
              <Label htmlFor="subProduto">Sub-produto</Label>
              <div className="relative">
                <select
                  id="subProduto"
                  value={formData.subProduto}
                  onChange={(e) => handleInputChange('subProduto', e.target.value)}
                  className="w-full p-2 pr-10 border border-gray-300 rounded-md appearance-none"
                >
                  <option value="">Geral</option>
                  {(formData.produto === 'web' ? WEB_SUB_PRODUCTS : APP_SUB_PRODUCTS).map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
              </div>
            </div>
          )}

          {/* Métrica Input/Output */}
          <div className="space-y-1.5">
            <Label htmlFor="metric">Métrica Input/Output *</Label>
            <Textarea
              id="metric"
              value={formData.inputOutputMetric}
              onChange={(e) => handleInputChange('inputOutputMetric', e.target.value)}
              placeholder="Ex: Aumentar em 10% a taxa de NPS em 3 meses"
              required
            />
          </div>

          {/* Tese de Produto */}
          <div className="space-y-1.5">
            <Label htmlFor="tese">Tese de Produto *</Label>
            <Textarea
              id="tese"
              value={formData.teseProduto}
              onChange={(e) => handleInputChange('teseProduto', e.target.value)}
              placeholder="Ex: Acreditamos que o novo app global melhora a experiência..."
              required
            />
          </div>

          {/* Descrição (opcional) */}
          <div className="space-y-1.5">
            <Label htmlFor="descricao">Descrição (opcional)</Label>
            <Textarea
              id="descricao"
              value={formData.descricao}
              onChange={(e) => handleInputChange('descricao', e.target.value)}
              placeholder="Detalhes adicionais do item..."
            />
          </div>

          {/* Subitens */}
          <div className="space-y-1.5">
            <Label>Subitens</Label>
            {formData.subitens.map((subitem, index) => (
              <div key={index} className="flex items-center space-x-2 mt-2">
                <Input
                  value={subitem}
                  onChange={(e) => handleSubitemChange(index, e.target.value)}
                  placeholder={`Subitem ${index + 1}`}
                />
                {formData.subitens.length > 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeSubitem(index)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ))}
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={addSubitem}
              className="mt-2 text-company-orange hover:text-company-red-orange"
            >
              <Plus className="h-4 w-4 mr-1" />
              Adicionar Subitem
            </Button>
          </div>

          {/* Data de Início */}
          <div className="space-y-1.5">
            <Label>Data de Início</Label>
            <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-start text-left font-normal"
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {formData.dataInicio ? (
                    formData.dataInicio.toLocaleDateString('pt-BR')
                  ) : (
                    <span>Selecione uma data</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={formData.dataInicio}
                  onSelect={(date) => {
                    handleInputChange('dataInicio', date)
                    setCalendarOpen(false)
                  }}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Data Final */}
          <div className="space-y-1.5">
            <Label>Data Final</Label>
            <Popover open={calendarFimOpen} onOpenChange={setCalendarFimOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-start text-left font-normal"
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {formData.dataFim ? (
                    formData.dataFim.toLocaleDateString('pt-BR')
                  ) : (
                    <span>Selecione uma data</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={formData.dataFim}
                  onSelect={(date) => {
                    handleInputChange('dataFim', date)
                    setCalendarFimOpen(false)
                  }}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Status */}
          <div className="space-y-1.5">
            <Label htmlFor="status">Status</Label>
            <div className="relative">
              <select
                id="status"
                value={formData.status}
                onChange={(e) => handleInputChange('status', e.target.value)}
                className="w-full p-2 pr-10 border border-gray-300 rounded-md appearance-none"
              >
                {STATUS_OPTIONS.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
            </div>
          </div>

          {/* OKR Vinculado */}
          <div className="space-y-1.5">
            <Label htmlFor="okr">OKR Vinculado</Label>
            <div className="relative">
              <select
                id="okr"
                value={formData.okrId}
                onChange={(e) => handleInputChange('okrId', e.target.value)}
                className="w-full p-2 pr-10 border border-gray-300 rounded-md appearance-none"
              >
                <option value="">Nenhum OKR</option>
                {okrs.map(okr => (
                  <option key={okr.id} value={okr.id}>
                    {okr.objetivo}
                  </option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
            </div>
          </div>

          {/* Botões */}
          <div className="flex justify-end space-x-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              className="bg-company-orange hover:bg-company-red-orange text-white"
            >
              {item ? 'Salvar Alterações' : 'Criar Item'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default ItemModalImproved

