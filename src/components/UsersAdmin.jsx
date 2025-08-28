import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { Button } from '@/components/ui/button'
import { Eye, EyeOff } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'

const ROLES = ['viewer','editor','admin']

const CARGOS = ['Diretor','Líder','Analista','Assistente']

const UsersAdmin = () => {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({ nome:'', email:'', password:'', role:'viewer', cargo:''})
  const [search, setSearch] = useState('')
  const [createOpen, setCreateOpen] = useState(false)
  const [creating, setCreating] = useState(false)
  const [showCreatePassword, setShowCreatePassword] = useState(false)
  const [hasCargoColumn, setHasCargoColumn] = useState(true)
  const [editOpen, setEditOpen] = useState(false)
  const [editingUser, setEditingUser] = useState(null)
  const [editForm, setEditForm] = useState({ nome:'', email:'', role:'viewer', cargo:'', password:'' })
  const [showEditPassword, setShowEditPassword] = useState(false)

  const load = async () => {
    setLoading(true)
    let { data, error } = await supabase.from('users').select('id,nome,email,role,cargo,created_at')
    if (error) {
      const msg = String(error.message || '')
      const missingCargo = msg.includes('column') && msg.includes('cargo')
      if (missingCargo) {
        setHasCargoColumn(false)
        const alt = await supabase.from('users').select('id,nome,email,role,created_at')
        if (alt.error) setError(alt.error.message)
        else setUsers(alt.data || [])
      } else {
        setError(error.message)
      }
    } else {
      setHasCargoColumn(true)
      setUsers(data || [])
    }
    setLoading(false)
  }

  useEffect(()=>{ load() },[])

  const createUser = async () => {
    try {
      setCreating(true)
      const { default: bcrypt } = await import('bcryptjs')
      const hash = await bcrypt.hash(form.password, 10)
      const payload = { nome: form.nome, email: form.email, password_hash: hash, role: form.role }
      if (hasCargoColumn && form.cargo) payload.cargo = form.cargo
      const { error } = await supabase.from('users').insert([payload])
      if (error) throw error
      setForm({ nome:'', email:'', password:'', role:'viewer', cargo:''})
      setCreateOpen(false)
      await load()
    } catch (e) { setError(e.message) } finally { setCreating(false) }
  }

  const updateUser = async (id, updates) => {
    try {
      const payload = { ...updates }
      if (payload.password) {
        const { default: bcrypt } = await import('bcryptjs')
        payload.password_hash = await bcrypt.hash(payload.password, 10)
        delete payload.password
      }
      if (!hasCargoColumn) delete payload.cargo
      const { error } = await supabase.from('users').update(payload).eq('id', id)
      if (error) throw error
      await load()
    } catch (e) { setError(e.message) }
  }

  const deleteUser = async (id) => {
    await supabase.from('users').delete().eq('id', id)
    await load()
  }

  const filteredUsers = users.filter(u => u.email.toLowerCase().includes(search.toLowerCase()) || u.nome.toLowerCase().includes(search.toLowerCase()))

  return (
    <div className="bg-white p-4 border rounded-lg">
      <h2 className="text-lg font-semibold mb-3">Gerenciar Usuários</h2>
      {error && <div className="text-sm text-red-600 mb-2">{error}</div>}
      <div className="flex flex-col sm:flex-row gap-2 mb-4 items-start sm:items-center">
        <Dialog open={createOpen} onOpenChange={(open)=>{ setCreateOpen(open); if (open) setForm({ nome:'', email:'', password:'', role:'viewer', cargo:''}) }}>
          <DialogTrigger asChild>
            <Button className="bg-company-orange text-white">Criar Usuário</Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Novo Usuário</DialogTitle>
            </DialogHeader>
            <div className="space-y-3">
              <div>
                <label className="block text-sm mb-1">Nome</label>
                <input className="w-full border rounded px-2 py-1" value={form.nome} onChange={e=>setForm({...form,nome:e.target.value})} type="text" placeholder="Nome completo" autoComplete="off" />
              </div>
              <div>
                <label className="block text-sm mb-1">Email</label>
                <input className="w-full border rounded px-2 py-1" value={form.email} onChange={e=>setForm({...form,email:e.target.value})} type="email" placeholder="email@dominio.com" autoComplete="off" />
              </div>
              <div>
                <label className="block text-sm mb-1">Senha</label>
                <div className="relative">
                  <input className="w-full border rounded px-2 py-1 pr-8" value={form.password} onChange={e=>setForm({...form,password:e.target.value})} type={showCreatePassword ? 'text' : 'password'} placeholder="••••••••" autoComplete="new-password" />
                  <button type="button" aria-label={showCreatePassword ? 'Ocultar senha' : 'Mostrar senha'} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700" onClick={()=>setShowCreatePassword(v=>!v)}>
                    {showCreatePassword ? <EyeOff className="h-4 w-4"/> : <Eye className="h-4 w-4"/>}
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-sm mb-1">Perfil</label>
                <select className="w-full border rounded px-2 py-1" value={form.role} onChange={e=>setForm({...form,role:e.target.value})}>
                  {ROLES.map(r=> <option key={r} value={r}>{r}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm mb-1">Cargo</label>
                <select className="w-full border rounded px-2 py-1" value={form.cargo} onChange={e=>setForm({...form,cargo:e.target.value})}>
                  <option value="">Selecione o cargo</option>
                  {CARGOS.map(c=> <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <Button variant="outline" onClick={()=>setCreateOpen(false)}>Cancelar</Button>
                <Button onClick={createUser} disabled={creating} className="bg-company-orange text-white">{creating?'Criando...':'Criar'}</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
        <input className="border rounded px-2 py-1 sm:ml-auto" placeholder="Buscar por nome ou email" value={search} onChange={e=>setSearch(e.target.value)} />
      </div>
      {loading ? 'Carregando...' : (
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left">
              <th>Nome</th>
              <th>Email</th>
              <th>Perfil</th>
              {hasCargoColumn && <th>Cargo</th>}
              <th>Criado em</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map(u => (
              <tr key={u.id} className="border-t">
                <td>{u.nome}</td>
                <td>{u.email}</td>
                <td>
                  <select defaultValue={u.role} onChange={(e)=>updateUser(u.id,{ role: e.target.value })} className="border rounded px-2 py-1">
                    {ROLES.map(r=> <option key={r} value={r}>{r}</option>)}
                  </select>
                </td>
                {hasCargoColumn && (
                  <td>
                    <select defaultValue={u.cargo || ''} onChange={(e)=>updateUser(u.id,{ cargo: e.target.value })} className="border rounded px-2 py-1">
                      <option value="">-</option>
                      {CARGOS.map(c=> <option key={c} value={c}>{c}</option>)}
                    </select>
                  </td>
                )}
                <td>{new Date(u.created_at).toLocaleString()}</td>
                <td className="space-x-2">
                  <button className="px-2 py-1 border rounded" onClick={()=>{
                    setEditingUser(u)
                    setEditForm({ nome: u.nome || '', email: u.email || '', role: u.role || 'viewer', cargo: u.cargo || '', password: '' })
                    setEditOpen(true)
                  }}>Editar perfil</button>
                  <button className="px-2 py-1 border rounded text-red-600" onClick={()=>deleteUser(u.id)}>Excluir</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      {/* Dialog Edição de Perfil */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Editar Perfil</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <label className="block text-sm mb-1">Nome</label>
              <input className="w-full border rounded px-2 py-1" value={editForm.nome} onChange={e=>setEditForm({...editForm,nome:e.target.value})} />
            </div>
            <div>
              <label className="block text-sm mb-1">Email</label>
              <input className="w-full border rounded px-2 py-1" value={editForm.email} onChange={e=>setEditForm({...editForm,email:e.target.value})} />
            </div>
            <div>
              <label className="block text-sm mb-1">Nova senha (opcional)</label>
              <div className="relative">
                <input className="w-full border rounded px-2 py-1 pr-8" value={editForm.password} onChange={e=>setEditForm({...editForm,password:e.target.value})} type={showEditPassword ? 'text' : 'password'} placeholder="••••••••" />
                <button type="button" aria-label={showEditPassword ? 'Ocultar senha' : 'Mostrar senha'} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700" onClick={()=>setShowEditPassword(v=>!v)}>
                  {showEditPassword ? <EyeOff className="h-4 w-4"/> : <Eye className="h-4 w-4"/>}
                </button>
              </div>
            </div>
            <div>
              <label className="block text-sm mb-1">Perfil</label>
              <select className="w-full border rounded px-2 py-1" value={editForm.role} onChange={e=>setEditForm({...editForm,role:e.target.value})}>
                {ROLES.map(r=> <option key={r} value={r}>{r}</option>)}
              </select>
            </div>
            {hasCargoColumn && (
              <div>
                <label className="block text-sm mb-1">Cargo</label>
                <select className="w-full border rounded px-2 py-1" value={editForm.cargo} onChange={e=>setEditForm({...editForm,cargo:e.target.value})}>
                  <option value="">Selecione o cargo</option>
                  {CARGOS.map(c=> <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
            )}
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={()=>setEditOpen(false)}>Cancelar</Button>
              <Button onClick={async ()=>{ await updateUser(editingUser.id, editForm); setEditOpen(false) }} className="bg-company-orange text-white">Salvar</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default UsersAdmin


