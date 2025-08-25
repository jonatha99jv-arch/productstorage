import { useMemo, useState, useEffect } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs.jsx'
import { Button } from '@/components/ui/button.jsx'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog.jsx'
import { getSession } from '@/lib/auth'

export default function RequestsPage({ solicitacoes = [], minhasSolicitacoes = [], produtos = [], subProdutos = {}, onCreate, onDeleteOwn }) {
  const [open, setOpen] = useState(false)
  const [file, setFile] = useState(null)
  const [viewOpen, setViewOpen] = useState(false)
  const [viewItem, setViewItem] = useState(null)
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

  // Lista ordenada por data de criação (mais recentes primeiro)
  const listAll = useMemo(() => {
    const arr = Array.isArray(solicitacoes) ? [...solicitacoes] : []
    arr.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    return arr
  }, [solicitacoes])

  const listMine = useMemo(() => Array.isArray(minhasSolicitacoes) ? minhasSolicitacoes : [], [minhasSolicitacoes])

  const handleView = (s) => { setViewItem(s); setViewOpen(true) }

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
          <TabsTrigger value="todas" onClick={() => onRefreshVotes?.()}>Solicitações</TabsTrigger>
          <TabsTrigger value="minhas" onClick={() => onRefreshVotes?.()}>Minhas solicitações</TabsTrigger>
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
                  <th className="text-left p-2">Ações</th>
                </tr>
              </thead>
              <tbody>
                {listAll.map((s) => (
                  <tr key={s.id} onClick={()=>handleView(s)} className="border-t hover:bg-gray-50 cursor-pointer">
                    <td className="p-2 font-medium text-company-dark-blue">{s.titulo}</td>
                    <td className="p-2 capitalize">{s.produto}</td>
                    <td className="p-2">{s.sub_produto || '-'}</td>
                    <td className="p-2">{s.nome_solicitante} ({s.email_solicitante})</td>
                    <td className="p-2">{s.created_at ? new Date(s.created_at).toLocaleString() : '-'}</td>
                    <td className="p-2">
                      {session && s.user_id === session.id && (
                        <button onClick={(e)=> { e.stopPropagation(); onDeleteOwn && onDeleteOwn(s.id) }} className="text-red-600 hover:underline">Excluir</button>
                      )}
                    </td>
                  </tr>
                ))}
                {listAll.length === 0 && (
                  <tr><td colSpan={6} className="p-4 text-center text-gray-500">Nenhuma solicitação encontrada.</td></tr>
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
                  <th className="text-left p-2">Ações</th>
                </tr>
              </thead>
              <tbody>
                {listMine.map((s) => (
                  <tr key={s.id} onClick={()=>handleView(s)} className="border-t hover:bg-gray-50 cursor-pointer">
                    <td className="p-2 font-medium text-company-dark-blue">{s.titulo}</td>
                    <td className="p-2 capitalize">{s.produto}</td>
                    <td className="p-2">{s.sub_produto || '-'}</td>
                    <td className="p-2">{s.created_at ? new Date(s.created_at).toLocaleString() : '-'}</td>
                    <td className="p-2">{s.file_url ? <a className="text-blue-600 underline" href={s.file_url} target="_blank" rel="noreferrer">{s.file_name || 'Arquivo'}</a> : '-'}</td>
                    <td className="p-2">
                      <button onClick={(e)=> { e.stopPropagation(); onDeleteOwn && onDeleteOwn(s.id) }} className="text-red-600 hover:underline">Excluir</button>
                    </td>
                  </tr>
                ))}
                {listMine.length === 0 && (
                  <tr><td colSpan={6} className="p-4 text-center text-gray-500">Você ainda não criou solicitações.</td></tr>
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

      {/* Visualização de solicitação */}
      <Dialog open={viewOpen} onOpenChange={setViewOpen}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Detalhes da solicitação</DialogTitle>
          </DialogHeader>
          {viewItem && (
            <div className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <div className="text-xs text-gray-500">Título</div>
                  <div className="font-medium text-company-dark-blue">{viewItem.titulo || '-'}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-500">Criado em</div>
                  <div>{viewItem.created_at ? new Date(viewItem.created_at).toLocaleString() : '-'}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-500">Produto</div>
                  <div className="capitalize">{viewItem.produto || '-'}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-500">Subproduto</div>
                  <div>{viewItem.sub_produto || '-'}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-500">Solicitante</div>
                  <div>{viewItem.nome_solicitante || '-'} ({viewItem.email_solicitante || '-'})</div>
                </div>
                <div>
                  <div className="text-xs text-gray-500">Departamento</div>
                  <div>{viewItem.departamento || '-'}</div>
                </div>
              </div>
              <div>
                <div className="text-xs text-gray-500 mb-1">Descrição</div>
                <div className="whitespace-pre-wrap">{viewItem.descricao || '-'}</div>
              </div>
              <div>
                <div className="text-xs text-gray-500 mb-1">Retorno esperado</div>
                <div className="whitespace-pre-wrap">{viewItem.retorno_esperado || '-'}</div>
              </div>
              <div>
                <div className="text-xs text-gray-500 mb-1">Documento</div>
                {viewItem.file_url ? (
                  <a className="text-blue-600 underline" href={viewItem.file_url} target="_blank" rel="noreferrer">{viewItem.file_name || 'Abrir arquivo'}</a>
                ) : (
                  <span>-</span>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}


