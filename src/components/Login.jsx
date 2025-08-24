import { useState } from 'react'
import { Eye, EyeOff } from 'lucide-react'
import { login, ensureDefaultAdmin } from '@/lib/auth'

const Login = ({ onSuccess }) => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

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
          <img
            src="/starbem-logo-color.png"
            alt="Starbem"
            className="block max-w-full"
            style={{ width: '260px', height: 'auto', objectFit: 'contain' }}
            onError={(e)=>{
              e.currentTarget.outerHTML = '<div style="display:flex;align-items:center;gap:8px"><span style="color:#1D1830;font-weight:700;font-size:32px;line-height:1">Starbem</span><span style="width:28px;height:28px;background:linear-gradient(135deg,#FF9015,#FF1F76);clip-path:polygon(50% 0%,61% 35%,98% 38%,70% 60%,80% 95%,50% 75%,20% 95%,30% 60%,2% 38%,39% 35%)"></span></div>'
            }}
          />
        </div>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <input type="email" placeholder="Email" className="w-full border rounded px-3 py-2" value={email} onChange={e=>setEmail(e.target.value)} required />
          </div>
          <div className="relative">
            <input type={showPassword ? 'text' : 'password'} placeholder="Password" className="w-full border rounded px-3 py-2 pr-10" value={password} onChange={e=>setPassword(e.target.value)} required />
            <button type="button" aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700" onClick={()=>setShowPassword(v=>!v)}>
              {showPassword ? <EyeOff className="h-4 w-4"/> : <Eye className="h-4 w-4"/>}
            </button>
          </div>
          {error && <div className="text-sm text-red-600">{error}</div>}
          <button type="submit" disabled={loading} className="w-full bg-pink-500 hover:bg-pink-600 text-white rounded py-2">{loading ? 'Entrando...' : 'Entrar'}</button>
        </form>
      </div>
    </div>
  )
}

export default Login


