import { supabase } from './supabaseClient'
import bcrypt from 'bcryptjs'

export async function login(email, password) {
  const { data, error } = await supabase
    .from('users')
    .select('id, email, password_hash, role')
    .eq('email', email)
    .limit(1)
  if (error) throw new Error('Falha ao buscar usuário')
  if (!data || data.length === 0) throw new Error('Credenciais inválidas')
  const user = data[0]
  const ok = await bcrypt.compare(password, user.password_hash)
  if (!ok) throw new Error('Credenciais inválidas')
  const session = { id: user.id, email: user.email, role: user.role }
  localStorage.setItem('session', JSON.stringify(session))
  return session
}

export function logout() {
  localStorage.removeItem('session')
}

export function getSession() {
  const s = localStorage.getItem('session')
  return s ? JSON.parse(s) : null
}

export function requireRole(minRole) {
  const order = { viewer: 1, editor: 2, admin: 3 }
  const s = getSession()
  if (!s) return false
  return order[s.role] >= order[minRole]
}

export async function ensureDefaultAdmin() {
  const email = 'jonatha.vieira@starbem.app'
  try {
    const { data, error } = await supabase
      .from('users')
      .select('id')
      .eq('email', email)
      .limit(1)
    if (error) return
    if (!data || data.length === 0) {
      const hash = await bcrypt.hash('Teste123', 10)
      await supabase.from('users').insert([{ email, password_hash: hash, role: 'admin' }])
    }
  } catch (_) {
    // silencioso
  }
}


