import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import bcrypt from 'bcryptjs'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'

const ROLES = ['viewer','editor','admin']

const UsersAdmin = () => {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({ email:'', password:'', role:'viewer'})
  const [search, setSearch] = useState('')
  const [createOpen, setCreateOpen] = useState(false)
  const [creating, setCreating] = useState(false)

  const load = async () => {
    setLoading(true)
    const { data, error } = await supabase.from('users').select('id,email,role,created_at')
    if (error) setError(error.message)
    else setUsers(data || [])
    setLoading(false)
  }

  useEffect(()=>{ load() },[])

  const createUser = async () => {
    try {
      setCreating(true)
      const hash = await bcrypt.hash(form.password, 10)
      const { error } = await supabase.from('users').insert([{ email: form.email, password_hash: hash, role: form.role }])
      if (error) throw error
      setForm({ email:'', password:'', role:'viewer'})
      setCreateOpen(false)
      await load()
    } catch (e) { setError(e.message) } finally { setCreating(false) }
  }

  const updateUser = async (id, updates) => {
    try {
      const payload = { ...updates }
      if (payload.password) {
        payload.password_hash = await bcrypt.hash(payload.password, 10)
        delete payload.password
      }
      const { error } = await supabase.from('users').update(payload).eq('id', id)
      if (error) throw error
      await load()
    } catch (e) { setError(e.message) }
  }

  const deleteUser = async (id) => {
    await supabase.from('users').delete().eq('id', id)
    await load()
  }

  const filteredUsers = users.filter(u => u.email.toLowerCase().includes(search.toLowerCase()))

  return (
    <div className="bg-white p-4 border rounded-lg">
      <h2 className="text-lg font-semibold mb-3">Gerenciar Usuários</h2>
      {error && <div className="text-sm text-red-600 mb-2">{error}</div>}
      <div className="flex flex-col sm:flex-row gap-2 mb-4 items-start sm:items-center">
        <Dialog open={createOpen} onOpenChange={setCreateOpen}>
          <DialogTrigger asChild>
            <Button className="bg-company-orange text-white">Criar Usuário</Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Novo Usuário</DialogTitle>
            </DialogHeader>
            <div className="space-y-3">
              <div>
                <label className="block text-sm mb-1">Email</label>
                <input className="w-full border rounded px-2 py-1" value={form.email} onChange={e=>setForm({...form,email:e.target.value})} type="email" placeholder="email@dominio.com" />
              </div>
              <div>
                <label className="block text-sm mb-1">Senha</label>
                <input className="w-full border rounded px-2 py-1" value={form.password} onChange={e=>setForm({...form,password:e.target.value})} type="password" placeholder="••••••••" />
              </div>
              <div>
                <label className="block text-sm mb-1">Perfil</label>
                <select className="w-full border rounded px-2 py-1" value={form.role} onChange={e=>setForm({...form,role:e.target.value})}>
                  {ROLES.map(r=> <option key={r} value={r}>{r}</option>)}
                </select>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <Button variant="outline" onClick={()=>setCreateOpen(false)}>Cancelar</Button>
                <Button onClick={createUser} disabled={creating} className="bg-company-orange text-white">{creating?'Criando...':'Criar'}</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
        <input className="border rounded px-2 py-1 sm:ml-auto" placeholder="Buscar por email" value={search} onChange={e=>setSearch(e.target.value)} />
      </div>
      {loading ? 'Carregando...' : (
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left">
              <th>Email</th>
              <th>Perfil</th>
              <th>Criado em</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map(u => (
              <tr key={u.id} className="border-t">
                <td>{u.email}</td>
                <td>
                  <select defaultValue={u.role} onChange={(e)=>updateUser(u.id,{ role: e.target.value })} className="border rounded px-2 py-1">
                    {ROLES.map(r=> <option key={r} value={r}>{r}</option>)}
                  </select>
                </td>
                <td>{new Date(u.created_at).toLocaleString()}</td>
                <td className="space-x-2">
                  <button className="px-2 py-1 border rounded" onClick={()=>{
                    const email = prompt('Novo email', u.email)
                    if (email) updateUser(u.id,{ email })
                  }}>Trocar email</button>
                  <button className="px-2 py-1 border rounded" onClick={()=>{
                    const password = prompt('Nova senha')
                    if (password) updateUser(u.id,{ password })
                  }}>Trocar senha</button>
                  <button className="px-2 py-1 border rounded text-red-600" onClick={()=>deleteUser(u.id)}>Excluir</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}

export default UsersAdmin


