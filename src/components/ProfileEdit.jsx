import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { getSession, logout } from '@/lib/auth'
import { Eye, EyeOff } from 'lucide-react'

const ProfileEdit = () => {
  const session = getSession()
  const [nome, setNome] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  // Buscar dados do usuário diretamente do banco
  const loadUserData = async () => {
    if (session?.id) {
      try {
        const { data, error } = await supabase
          .from('users')
          .select('nome, email')
          .eq('id', session.id)
          .single()
        
        if (error) throw error
        
        if (data) {
          setNome(data.nome || '')
          setEmail(data.email || '')
        }
      } catch (err) {
        console.error('Erro ao carregar dados do usuário:', err)
        setMessage(`Erro ao carregar dados: ${err.message}`)
      }
    }
  }

  // Atualizar sessão com dados mais recentes
  const updateSession = async () => {
    if (session?.id) {
      try {
        const { data, error } = await supabase
          .from('users')
          .select('id, nome, email, role')
          .eq('id', session.id)
          .single()
        
        if (error) throw error
        
        if (data) {
          const newSession = { ...session, ...data }
          localStorage.setItem('session', JSON.stringify(newSession))
          // Recarregar a página para atualizar a sessão
          window.location.reload()
        }
      } catch (err) {
        console.error('Erro ao atualizar sessão:', err)
        setMessage(`Erro ao atualizar sessão: ${err.message}`)
      }
    }
  }

  useEffect(() => {
    loadUserData()
  }, [session])

  const save = async (e) => {
    e.preventDefault()
    setMessage('')
    setLoading(true)
    try {
      const payload = { nome, email }
      if (password) {
        const { default: bcrypt } = await import('bcryptjs')
        payload.password_hash = await bcrypt.hash(password, 10)
      }
      const { error } = await supabase.from('users').update(payload).eq('id', session.id)
      if (error) throw error
      setMessage('Perfil atualizado com sucesso!')
      setPassword('')
      // Recarregar dados após salvar
      await loadUserData()
    } catch (err) {
      setMessage(`Erro: ${err.message}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-white p-6 rounded-lg border">
      <h2 className="text-lg font-semibold mb-4">Edição de Perfil</h2>
      
      {/* Debug info */}
      {session && (
        <div className="mb-4 p-3 bg-gray-100 rounded text-sm">
          <div><strong>ID:</strong> {session.id}</div>
          <div><strong>Email da sessão:</strong> {session.email}</div>
          <div><strong>Nome da sessão:</strong> {session.nome || 'Não definido'}</div>
          <button 
            onClick={loadUserData} 
            className="mt-2 px-3 py-1 bg-blue-500 text-white rounded text-xs hover:bg-blue-600"
          >
            🔄 Recarregar Dados
          </button>
          <button 
            onClick={updateSession} 
            className="mt-2 ml-2 px-3 py-1 bg-green-500 text-white rounded text-xs hover:bg-green-600"
          >
            🔄 Atualizar Sessão
          </button>
          <button 
            onClick={() => {
              logout()
              window.location.reload()
            }} 
            className="mt-2 ml-2 px-3 py-1 bg-red-500 text-white rounded text-xs hover:bg-red-600"
          >
            🚪 Fazer Logout
          </button>
        </div>
      )}
      
      <form onSubmit={save} className="space-y-3 max-w-md">
        <div>
          <label className="block text-sm mb-1">Nome</label>
          <input 
            className="w-full border rounded px-3 py-2" 
            value={nome} 
            onChange={e => setNome(e.target.value)} 
            type="text" 
            placeholder="Digite seu nome"
            required 
          />
        </div>
        <div>
          <label className="block text-sm mb-1">Email</label>
          <input 
            className="w-full border rounded px-3 py-2" 
            value={email} 
            onChange={e => setEmail(e.target.value)} 
            type="email" 
            placeholder="Digite seu email"
            required 
          />
        </div>
        <div>
          <label className="block text-sm mb-1">Nova Senha (opcional)</label>
          <div className="relative">
            <input 
              className="w-full border rounded px-3 py-2 pr-10" 
              value={password} 
              onChange={e => setPassword(e.target.value)} 
              type={showPassword ? 'text' : 'password'} 
              placeholder="••••••••" 
            />
            <button type="button" aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700" onClick={()=>setShowPassword(v=>!v)}>
              {showPassword ? <EyeOff className="h-4 w-4"/> : <Eye className="h-4 w-4"/>}
            </button>
          </div>
        </div>
        <button type="submit" className="bg-company-orange text-white rounded px-4 py-2" disabled={loading}>{loading ? 'Salvando...' : 'Salvar'}</button>
        {message && <div className="text-sm mt-2">{message}</div>}
      </form>
    </div>
  )
}

export default ProfileEdit


