import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { getSession } from '@/lib/auth'
import bcrypt from 'bcryptjs'

const ProfileEdit = () => {
  const session = getSession()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    if (session) setEmail(session.email)
  }, [session])

  const save = async (e) => {
    e.preventDefault()
    setMessage('')
    setLoading(true)
    try {
      const payload = { email }
      if (password) {
        payload.password_hash = await bcrypt.hash(password, 10)
      }
      const { error } = await supabase.from('users').update(payload).eq('id', session.id)
      if (error) throw error
      setMessage('Perfil atualizado com sucesso!')
      setPassword('')
    } catch (err) {
      setMessage(`Erro: ${err.message}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-white p-6 rounded-lg border">
      <h2 className="text-lg font-semibold mb-4">Edição de Perfil</h2>
      <form onSubmit={save} className="space-y-3 max-w-md">
        <div>
          <label className="block text-sm mb-1">Email</label>
          <input className="w-full border rounded px-3 py-2" value={email} onChange={e=>setEmail(e.target.value)} type="email" required />
        </div>
        <div>
          <label className="block text-sm mb-1">Nova Senha (opcional)</label>
          <input className="w-full border rounded px-3 py-2" value={password} onChange={e=>setPassword(e.target.value)} type="password" placeholder="••••••••" />
        </div>
        <button type="submit" className="bg-company-orange text-white rounded px-4 py-2" disabled={loading}>{loading ? 'Salvando...' : 'Salvar'}</button>
        {message && <div className="text-sm mt-2">{message}</div>}
      </form>
    </div>
  )
}

export default ProfileEdit


