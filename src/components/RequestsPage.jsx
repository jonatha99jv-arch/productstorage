import { useMemo, useState } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs.jsx'
import { Button } from '@/components/ui/button.jsx'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog.jsx'
import { getSession } from '@/lib/auth'

export default function RequestsPage({ solicitacoes = [], minhasSolicitacoes = [], produtos = [], subProdutos = {}, onCreate }) {
  const [open, setOpen] = useState(false)
  const [file, setFile] = useState(null)
  const session = getSession()

  const [form, setForm] = useState({
    nomeSolicitante: session?.email ? '' : '',
    emailSolicitante: session?.email || '',
    departamento: '',
    produto: 'aplicativo',
    subProduto: '',
    titulo: '',
    descricao: '',
    retornoEsperado: '',
  })

  const listAll = useMemo(() => Array.isArray(solicitacoes) ? solicitacoes : [], [solicitacoes])
  const listMine = useMemo(() => Array.isArray(minhasSolicitacoes) ? minhasSolicitacoes : [], [minhasSolicitacoes])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!onCreate) return
    await onCreate(form, file)
    setOpen(false)
    setForm({
      nomeSolicitante: '', emailSolicitante: session?.email || '', departamento: '',
      produto: 'aplicativo', subProduto: '', titulo: '', descricao: '', retornoEsperado: ''
    })
    setFile(null)
  }

  const currentSubOptions = useMemo(() => {
    if (!form.produto) return []
    const opts = subProdutos[form.produto] || []
    return opts
  }, [form.produto, subProdutos])

  return (
    <div className="space-y-6">
      <Tabs defaultValue="todas" className="w-full">
        <TabsList>
          <TabsTrigger value="todas">Solicitações</TabsTrigger>
          <TabsTrigger value="minhas">Minhas solicitações</TabsTrigger>
        </TabsList>
        <TabsContent value="todas">
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white rounded-md shadow">
              <thead className="bg-gray-100 text-gray-700">
                <tr>
                  <th className="text-left p-2">Título</th>
                  <th className="text-left p-2">Produto</th>
                  <th className="text-left p-2">Subproduto</th>
                  <th className="text-left p-2">Solicitante</th>
                  <th className="text-left p-2">Criado em</th>
                </tr>
              </thead>
              <tbody>
                {listAll.map((s) => (
                  <tr key={s.id} className="border-t">
                    <td className="p-2 font-medium text-company-dark-blue">{s.titulo}</td>
                    <td className="p-2 capitalize">{s.produto}</td>
                    <td className="p-2">{s.sub_produto || '-'}</td>
                    <td className="p-2">{s.nome_solicitante} ({s.email_solicitante})</td>
                    <td className="p-2">{new Date(s.created_at).toLocaleString()}</td>
                  </tr>
                ))}
                {listAll.length === 0 && (
                  <tr><td colSpan={5} className="p-4 text-center text-gray-500">Nenhuma solicitação encontrada.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </TabsContent>
        <TabsContent value="minhas">
          <div className="flex justify-end mb-4">
            <Button onClick={() => setOpen(true)} className="bg-company-orange hover:bg-company-red-orange text-white">Nova solicitação</Button>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white rounded-md shadow">
              <thead className="bg-gray-100 text-gray-700">
                <tr>
                  <th className="text-left p-2">Título</th>
                  <th className="text-left p-2">Produto</th>
                  <th className="text-left p-2">Subproduto</th>
                  <th className="text-left p-2">Criado em</th>
                  <th className="text-left p-2">Arquivo</th>
                </tr>
              </thead>
              <tbody>
                {listMine.map((s) => (
                  <tr key={s.id} className="border-t">
                    <td className="p-2 font-medium text-company-dark-blue">{s.titulo}</td>
                    <td className="p-2 capitalize">{s.produto}</td>
                    <td className="p-2">{s.sub_produto || '-'}</td>
                    <td className="p-2">{new Date(s.created_at).toLocaleString()}</td>
                    <td className="p-2">{s.file_url ? <a className="text-blue-600 underline" href={s.file_url} target="_blank" rel="noreferrer">{s.file_name || 'Arquivo'}</a> : '-'}</td>
                  </tr>
                ))}
                {listMine.length === 0 && (
                  <tr><td colSpan={5} className="p-4 text-center text-gray-500">Você ainda não criou solicitações.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </TabsContent>
      </Tabs>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Nova solicitação</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-700 mb-1">Nome do Solicitante</label>
                <input value={form.nomeSolicitante} onChange={e=>setForm(f=>({...f,nomeSolicitante:e.target.value}))} className="w-full border rounded px-3 py-2" placeholder="Seu nome" />
              </div>
              <div>
                <label className="block text-sm text-gray-700 mb-1">E-mail do Solicitante</label>
                <input type="email" value={form.emailSolicitante} onChange={e=>setForm(f=>({...f,emailSolicitante:e.target.value}))} className="w-full border rounded px-3 py-2" placeholder="seu@email.com" />
              </div>
              <div>
                <label className="block text-sm text-gray-700 mb-1">Departamento do Solicitante</label>
                <input value={form.departamento} onChange={e=>setForm(f=>({...f,departamento:e.target.value}))} className="w-full border rounded px-3 py-2" placeholder="Ex: Produto" />
              </div>
              <div>
                <label className="block text-sm text-gray-700 mb-1">Produto</label>
                <select value={form.produto} onChange={e=>setForm(f=>({...f,produto:e.target.value, subProduto: ''}))} className="w-full border rounded px-3 py-2">
                  {produtos.map(p=> (
                    <option key={p} value={p}>{p.charAt(0).toUpperCase()+p.slice(1)}</option>
                  ))}
                </select>
              </div>
              <div className="sm:col-span-2">
                <label className="block text-sm text-gray-700 mb-1">SubProduto</label>
                <select value={form.subProduto} onChange={e=>setForm(f=>({...f,subProduto:e.target.value}))} className="w-full border rounded px-3 py-2">
                  <option value="">(Sem subproduto)</option>
                  {currentSubOptions.map(s => (
                    <option key={s} value={s}>{s.replace('_',' ')}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm text-gray-700 mb-1">Título da Solicitação</label>
              <input value={form.titulo} onChange={e=>setForm(f=>({...f,titulo:e.target.value}))} className="w-full border rounded px-3 py-2" placeholder="Título" />
            </div>

            <div>
              <label className="block text-sm text-gray-700 mb-1">Descreva a sua solicitação</label>
              <textarea value={form.descricao} onChange={e=>setForm(f=>({...f,descricao:e.target.value}))} className="w-full border rounded px-3 py-2 min-h-[100px]" placeholder="Detalhes" />
            </div>

            <div>
              <label className="block text-sm text-gray-700 mb-1">Qual retorno esperado para essa solicitação?</label>
              <textarea value={form.retornoEsperado} onChange={e=>setForm(f=>({...f,retornoEsperado:e.target.value}))} className="w-full border rounded px-3 py-2 min-h-[80px]" placeholder="Ex: Aumento de conversão" />
            </div>

            <div>
              <label className="block text-sm text-gray-700 mb-1">Documento (PDF, Word, Planilha)</label>
              <input type="file" accept=".pdf,.doc,.docx,.xls,.xlsx,.csv" onChange={e=>setFile(e.target.files?.[0] || null)} className="w-full" />
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={()=>setOpen(false)}>Cancelar</Button>
              <Button type="submit" className="bg-company-dark-blue text-white">Salvar</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}


