import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import bcrypt from 'bcryptjs'

const ROLES = ['viewer','editor','admin']

const UsersAdmin = () => {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({ email:'', password:'', role:'viewer'})
  const [search, setSearch] = useState('')

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
      const hash = await bcrypt.hash(form.password, 10)
      const { error } = await supabase.from('users').insert([{ email: form.email, password_hash: hash, role: form.role }])
      if (error) throw error
      setForm({ email:'', password:'', role:'viewer'})
      await load()
    } catch (e) { setError(e.message) }
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
      <div className="grid grid-cols-1 sm:grid-cols-5 gap-2 mb-4">
        <input className="border rounded px-2 py-1" placeholder="Email" value={form.email} onChange={e=>setForm({...form,email:e.target.value})} />
        <input className="border rounded px-2 py-1" placeholder="Senha" type="password" value={form.password} onChange={e=>setForm({...form,password:e.target.value})} />
        <select className="border rounded px-2 py-1" value={form.role} onChange={e=>setForm({...form,role:e.target.value})}>
          {ROLES.map(r=> <option key={r} value={r}>{r}</option>)}
        </select>
        <button className="bg-company-orange text-white rounded px-3" onClick={createUser}>Criar</button>
        <input className="border rounded px-2 py-1 sm:col-span-2" placeholder="Buscar por email" value={search} onChange={e=>setSearch(e.target.value)} />
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


