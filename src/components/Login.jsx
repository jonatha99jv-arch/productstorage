import { useState } from 'react'
import { login, ensureDefaultAdmin } from '@/lib/auth'

const Login = ({ onSuccess }) => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      // garantir admin padrão na primeira execução
      await ensureDefaultAdmin()
      const session = await login(email, password)
      onSuccess?.(session)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <div className="w-full max-w-md p-6">
        <div className="flex flex-col items-center mb-8">
          <div className="flex items-center gap-3">
            <span className="text-4xl font-semibold tracking-tight" style={{color:'#1D1830'}}>Starbem</span>
            <span className="inline-block" style={{width:32,height:32,background:'linear-gradient(135deg,#FF9015,#FF1F76)',clipPath:'polygon(50% 0%, 61% 35%, 98% 38%, 70% 60%, 80% 95%, 50% 75%, 20% 95%, 30% 60%, 2% 38%, 39% 35%)'}}/>
          </div>
        </div>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <input type="email" placeholder="Email" className="w-full border rounded px-3 py-2" value={email} onChange={e=>setEmail(e.target.value)} required />
          </div>
          <div>
            <input type="password" placeholder="Password" className="w-full border rounded px-3 py-2" value={password} onChange={e=>setPassword(e.target.value)} required />
          </div>
          {error && <div className="text-sm text-red-600">{error}</div>}
          <button type="submit" disabled={loading} className="w-full bg-pink-500 hover:bg-pink-600 text-white rounded py-2">{loading ? 'Entrando...' : 'Entrar'}</button>
        </form>
      </div>
    </div>
  )
}

export default Login


