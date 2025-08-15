import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { CalendarIcon, Plus, X } from 'lucide-react'

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

const ItemModalImproved = ({ item, okrs, onSave, onClose }) => {
  const [formData, setFormData] = useState({
    nome: '',
    subitens: [''],
    inputOutputMetric: '',
    teseProduto: '',
    duracaoMeses: '',
    dataInicio: null,
    status: 'nao_iniciado',
    okrId: '',
    produto: 'aplicativo',
    subProduto: ''
  })

  const [calendarOpen, setCalendarOpen] = useState(false)

  useEffect(() => {
    if (item) {
      setFormData({
        nome: item.nome || '',
        subitens: item.subitens && item.subitens.length > 0 ? item.subitens : [''],
        inputOutputMetric: item.inputOutputMetric || '',
        teseProduto: item.teseProduto || '',
        duracaoMeses: item.duracaoMeses || '',
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

    const dataToSave = {
      ...formData,
      subitens: formData.subitens.filter(subitem => subitem.trim() !== ''),
      dataInicio: formData.dataInicio ? formData.dataInicio.toISOString() : null
    }

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

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Nome do Item */}
          <div>
            <Label htmlFor="nome">Nome do Item *</Label>
            <Input
              id="nome"
              value={formData.nome}
              onChange={(e) => handleInputChange('nome', e.target.value)}
              placeholder="Ex: Novo Aplicativo Global"
              required
            />
          </div>

          {/* Produto */}
          <div>
            <Label htmlFor="produto">Produto *</Label>
            <select
              id="produto"
              value={formData.produto}
              onChange={(e) => {
                handleInputChange('produto', e.target.value)
                if (e.target.value !== 'web') {
                  handleInputChange('subProduto', '')
                }
              }}
              className="w-full p-2 border border-gray-300 rounded-md"
              required
            >
              {PRODUCT_OPTIONS.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* Sub-produto (apenas para Web) */}
          {formData.produto === 'web' && (
            <div>
              <Label htmlFor="subProduto">Sub-produto Web</Label>
              <select
                id="subProduto"
                value={formData.subProduto}
                onChange={(e) => handleInputChange('subProduto', e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md"
              >
                <option value="">Geral</option>
                {WEB_SUB_PRODUCTS.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Subitens */}
          <div>
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
          <div>
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

          {/* Duração */}
          <div>
            <Label htmlFor="duracao">Duração (meses)</Label>
            <Input
              id="duracao"
              type="number"
              min="1"
              max="24"
              value={formData.duracaoMeses}
              onChange={(e) => handleInputChange('duracaoMeses', e.target.value)}
              placeholder="Ex: 3"
            />
          </div>

          {/* Métrica Input/Output */}
          <div>
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
          <div>
            <Label htmlFor="tese">Tese de Produto *</Label>
            <Textarea
              id="tese"
              value={formData.teseProduto}
              onChange={(e) => handleInputChange('teseProduto', e.target.value)}
              placeholder="Ex: Acreditamos que o novo app global melhora a experiência..."
              required
            />
          </div>

          {/* Status */}
          <div>
            <Label htmlFor="status">Status</Label>
            <select
              id="status"
              value={formData.status}
              onChange={(e) => handleInputChange('status', e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md"
            >
              {STATUS_OPTIONS.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* OKR Vinculado */}
          <div>
            <Label htmlFor="okr">OKR Vinculado</Label>
            <select
              id="okr"
              value={formData.okrId}
              onChange={(e) => handleInputChange('okrId', e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md"
            >
              <option value="">Nenhum OKR</option>
              {okrs.map(okr => (
                <option key={okr.id} value={okr.id}>
                  {okr.objetivo}
                </option>
              ))}
            </select>
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

