import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Plus, Edit, Trash2, Target, X } from 'lucide-react'

const OKRManager = ({ okrs, roadmapItems, onSaveOKR, onDeleteOKR, onClose }) => {
  const [showOKRForm, setShowOKRForm] = useState(false)
  const [editingOKR, setEditingOKR] = useState(null)
  const [formData, setFormData] = useState({
    objetivo: '',
    keyResults: ['']
  })

  const handleAddOKR = () => {
    setEditingOKR(null)
    setFormData({ objetivo: '', keyResults: [''] })
    setShowOKRForm(true)
  }

  const handleEditOKR = (okr) => {
    setEditingOKR(okr)
    setFormData({
      objetivo: okr.objetivo,
      keyResults: okr.keyResults.length > 0 ? okr.keyResults : ['']
    })
    setShowOKRForm(true)
  }

  const handleDeleteOKR = (okrId) => {
    const linkedItems = roadmapItems.filter(item => item.okrId === okrId)
    
    if (linkedItems.length > 0) {
      const itemNames = linkedItems.map(item => item.nome).join(', ')
      if (!window.confirm(`Este OKR está vinculado aos seguintes itens: ${itemNames}. Deseja continuar?`)) {
        return
      }
    }
    
    onDeleteOKR(okrId)
  }

  const handleKeyResultChange = (index, value) => {
    const newKeyResults = [...formData.keyResults]
    newKeyResults[index] = value
    setFormData(prev => ({
      ...prev,
      keyResults: newKeyResults
    }))
  }

  const addKeyResult = () => {
    setFormData(prev => ({
      ...prev,
      keyResults: [...prev.keyResults, '']
    }))
  }

  const removeKeyResult = (index) => {
    if (formData.keyResults.length > 1) {
      const newKeyResults = formData.keyResults.filter((_, i) => i !== index)
      setFormData(prev => ({
        ...prev,
        keyResults: newKeyResults
      }))
    }
  }

  const handleSubmitOKR = (e) => {
    e.preventDefault()
    
    if (!formData.objetivo.trim()) {
      alert('Objetivo é obrigatório')
      return
    }

    const filteredKeyResults = formData.keyResults.filter(kr => kr.trim() !== '')
    
    if (filteredKeyResults.length === 0) {
      alert('Pelo menos um Key Result é obrigatório')
      return
    }

    const okrData = {
      objetivo: formData.objetivo,
      keyResults: filteredKeyResults
    }

    if (editingOKR) {
      okrData.id = editingOKR.id
    }

    onSaveOKR(okrData)
    setShowOKRForm(false)
    setEditingOKR(null)
  }

  // Contar itens vinculados a cada OKR
  const getLinkedItemsCount = (okrId) => {
    return roadmapItems.filter(item => item.okrId === okrId).length
  }

  const getLinkedItems = (okrId) => {
    return roadmapItems.filter(item => item.okrId === okrId)
  }

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>Gerenciar OKRs</span>
            <Button onClick={handleAddOKR} className="flex items-center space-x-2">
              <Plus className="h-4 w-4" />
              <span>Novo OKR</span>
            </Button>
          </DialogTitle>
          <DialogDescription>
            Gerencie seus OKRs (Objectives and Key Results) e veja quais itens do roadmap estão vinculados a cada um.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {okrs.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Target className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>Nenhum OKR cadastrado ainda.</p>
              <p className="text-sm">Clique em "Novo OKR" para começar.</p>
            </div>
          ) : (
            okrs.map(okr => {
              const linkedItems = getLinkedItems(okr.id)
              return (
                <Card key={okr.id}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <CardTitle className="text-lg">{okr.objetivo}</CardTitle>
                        <div className="flex items-center space-x-2 mt-2">
                          <Badge variant="secondary">
                            {linkedItems.length} {linkedItems.length === 1 ? 'item vinculado' : 'itens vinculados'}
                          </Badge>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditOKR(okr)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteOKR(okr.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div>
                        <h4 className="font-medium text-sm text-gray-700 mb-2">Key Results:</h4>
                        <ul className="list-disc list-inside space-y-1 text-sm text-gray-600">
                          {okr.keyResults.map((kr, index) => (
                            <li key={index}>{kr}</li>
                          ))}
                        </ul>
                      </div>
                      
                      {linkedItems.length > 0 && (
                        <div>
                          <h4 className="font-medium text-sm text-gray-700 mb-2">Itens Vinculados:</h4>
                          <div className="flex flex-wrap gap-2">
                            {linkedItems.map(item => (
                              <Badge key={item.id} variant="outline" className="text-xs">
                                {item.nome}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )
            })
          )}
        </div>

        {/* Modal de formulário OKR */}
        {showOKRForm && (
          <Dialog open={true} onOpenChange={() => setShowOKRForm(false)}>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>
                  {editingOKR ? 'Editar OKR' : 'Novo OKR'}
                </DialogTitle>
                <DialogDescription>
                  {editingOKR ? 'Edite as informações do OKR abaixo.' : 'Crie um novo OKR definindo um objetivo e seus resultados-chave.'}
                </DialogDescription>
              </DialogHeader>

              <form onSubmit={handleSubmitOKR} className="space-y-6">
                {/* Objetivo */}
                <div>
                  <Label htmlFor="objetivo">Objetivo *</Label>
                  <Textarea
                    id="objetivo"
                    value={formData.objetivo}
                    onChange={(e) => setFormData(prev => ({ ...prev, objetivo: e.target.value }))}
                    placeholder="Ex: Aumentar a satisfação do cliente"
                    rows={2}
                    required
                  />
                </div>

                {/* Key Results */}
                <div>
                  <Label>Key Results *</Label>
                  <div className="space-y-2">
                    {formData.keyResults.map((kr, index) => (
                      <div key={index} className="flex space-x-2">
                        <Input
                          value={kr}
                          onChange={(e) => handleKeyResultChange(index, e.target.value)}
                          placeholder={`Key Result ${index + 1}`}
                        />
                        {formData.keyResults.length > 1 && (
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => removeKeyResult(index)}
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
                      onClick={addKeyResult}
                      className="flex items-center space-x-2"
                    >
                      <Plus className="h-4 w-4" />
                      <span>Adicionar Key Result</span>
                    </Button>
                  </div>
                </div>

                {/* Botões */}
                <div className="flex justify-end space-x-3">
                  <Button type="button" variant="outline" onClick={() => setShowOKRForm(false)}>
                    Cancelar
                  </Button>
                  <Button type="submit">
                    {editingOKR ? 'Salvar Alterações' : 'Criar OKR'}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </DialogContent>
    </Dialog>
  )
}

export default OKRManager

