import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Plus, X } from 'lucide-react'

const STATUS_OPTIONS = [
  { value: 'nao_iniciado', label: 'Não Iniciado' },
  { value: 'proxima_sprint', label: 'Próxima Sprint' },
  { value: 'sprint_atual', label: 'Sprint Atual' },
  { value: 'em_finalizacao', label: 'Em Finalização' },
  { value: 'concluida', label: 'Concluída' }
]

const ItemModal = ({ item, okrs, onSave, onClose }) => {
  const [formData, setFormData] = useState({
    nome: '',
    subitens: [''],
    inputOutputMetric: '',
    teseProduto: '',
    duracaoMeses: '',
    status: 'nao_iniciado',
    okrId: ''
  })

  // Preencher formulário quando editando
  useEffect(() => {
    if (item) {
      setFormData({
        nome: item.nome || '',
        subitens: item.subitens && item.subitens.length > 0 ? item.subitens : [''],
        inputOutputMetric: item.inputOutputMetric || '',
        teseProduto: item.teseProduto || '',
        duracaoMeses: item.duracaoMeses || '',
        status: item.status || 'nao_iniciado',
        okrId: item.okrId || ''
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
    
    // Validação básica
    if (!formData.nome.trim()) {
      alert('Nome é obrigatório')
      return
    }

    // Filtrar subitens vazios
    const filteredSubitens = formData.subitens.filter(subitem => subitem.trim() !== '')

    const itemData = {
      ...formData,
      subitens: filteredSubitens,
      duracaoMeses: formData.duracaoMeses ? parseInt(formData.duracaoMeses) : null,
      okrId: formData.okrId || null
    }

    onSave(itemData)
  }

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {item ? 'Editar Item do Roadmap' : 'Novo Item do Roadmap'}
          </DialogTitle>
          <DialogDescription>
            Preencha os campos abaixo para {item ? 'editar' : 'criar'} um item do roadmap.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Nome */}
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

          {/* Subitens */}
          <div>
            <Label>Subitens</Label>
            <div className="space-y-2">
              {formData.subitens.map((subitem, index) => (
                <div key={index} className="flex space-x-2">
                  <Input
                    value={subitem}
                    onChange={(e) => handleSubitemChange(index, e.target.value)}
                    placeholder={`Subitem ${index + 1}`}
                  />
                  {formData.subitens.length > 1 && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => removeSubitem(index)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addSubitem}
                className="flex items-center space-x-2"
              >
                <Plus className="h-4 w-4" />
                <span>Adicionar Subitem</span>
              </Button>
            </div>
          </div>

          {/* Métrica Input/Output */}
          <div>
            <Label htmlFor="metric">Métrica Input/Output *</Label>
            <Textarea
              id="metric"
              value={formData.inputOutputMetric}
              onChange={(e) => handleInputChange('inputOutputMetric', e.target.value)}
              placeholder="Ex: Aumentar em 10% a taxa de NPS em 3 meses"
              rows={2}
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
              rows={3}
              required
            />
          </div>

          {/* Duração e Status */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="duracao">Duração (meses)</Label>
              <Input
                id="duracao"
                type="number"
                min="1"
                value={formData.duracaoMeses}
                onChange={(e) => handleInputChange('duracaoMeses', e.target.value)}
                placeholder="Ex: 3"
              />
            </div>
            <div>
              <Label htmlFor="status">Status</Label>
              <select
                id="status"
                value={formData.status}
                onChange={(e) => handleInputChange('status', e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {STATUS_OPTIONS.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* OKR Vinculado */}
          <div>
            <Label htmlFor="okr">OKR Vinculado</Label>
            <select
              id="okr"
              value={formData.okrId}
              onChange={(e) => handleInputChange('okrId', e.target.value)}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
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
          <div className="flex justify-end space-x-3">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit">
              {item ? 'Salvar Alterações' : 'Criar Item'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export default ItemModal

