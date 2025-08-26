import { supabase } from './supabaseClient'

// Função para verificar se estamos em modo mock
export function isMockMode() {
  return !import.meta.env.VITE_SUPABASE_URL || !import.meta.env.VITE_SUPABASE_ANON_KEY
}

// Usuários mock para desenvolvimento local
const mockUsers = [
  { 
    id: '1', 
    email: 'admin@starbem.com', 
    password: 'admin123', 
    role: 'admin',
    name: 'Administrador'
  },
  { 
    id: '2', 
    email: 'editor@starbem.com', 
    password: 'editor123', 
    role: 'editor',
    name: 'Editor'
  },
  { 
    id: '3', 
    email: 'viewer@starbem.com', 
    password: 'viewer123', 
    role: 'viewer',
    name: 'Visualizador'
  },
  { 
    id: '4', 
    email: 'dev@starbem.com', 
    password: 'dev123', 
    role: 'admin',
    name: 'Desenvolvedor'
  },
  { 
    id: '5', 
    email: 'jonatha.vieira@starbem.app', 
    password: 'Teste123', 
    role: 'admin',
    name: 'Jonatha Vieira'
  }
]

export async function login(email, password) {
  if (isMockMode()) {
    // Modo mock para desenvolvimento local
    console.log('🚀 Usando autenticação MOCK para desenvolvimento local')
    console.log('👤 Usuários disponíveis:')
    mockUsers.forEach(user => {
      console.log(`   ${user.email} / ${user.password} (${user.role}) - ${user.name}`)
    })
    
    // Simular delay de rede
    await new Promise(resolve => setTimeout(resolve, 500))
    
    const user = mockUsers.find(u => u.email === email && u.password === password)
    if (!user) {
      throw new Error('Credenciais inválidas. Use um dos usuários mock listados no console.')
    }
    
    const session = { 
      id: user.id, 
      email: user.email, 
      role: user.role, 
      nome: user.name, // Usar 'nome' para consistência
      isMock: true 
    }
    localStorage.setItem('session', JSON.stringify(session))
    console.log('✅ Sessão mock criada:', session)
    return session
  }
  
  // Modo real com Supabase
  const { data, error } = await supabase
    .from('users')
    .select('id, nome, email, password_hash, role')
    .eq('email', email)
    .limit(1)
  if (error) throw new Error('Falha ao buscar usuário')
  if (!data || data.length === 0) throw new Error('Credenciais inválidas')
  const user = data[0]
  // Importa bcryptjs sob demanda para evitar dependência de Node 'crypto' no bundle inicial
  const { default: bcrypt } = await import('bcryptjs')
  const ok = await bcrypt.compare(password, user.password_hash)
  if (!ok) throw new Error('Credenciais inválidas')
  const session = { id: user.id, nome: user.nome, email: user.email, role: user.role }
  localStorage.setItem('session', JSON.stringify(session))
  console.log('✅ Sessão real criada:', session)
  return session
}

export function logout() {
  localStorage.removeItem('session')
}

export function getSession() {
  const s = localStorage.getItem('session')
  const parsed = s ? JSON.parse(s) : null
  console.log('🔍 getSession retornou:', parsed)
  return parsed
}

export function requireRole(minRole) {
  const order = { viewer: 1, editor: 2, admin: 3 }
  const s = getSession()
  console.log('🔐 requireRole:', { minRole, session: s, hasRole: s?.role, order: order[s?.role] }) // Debug
  if (!s) return false
  if (!s.role) {
    console.error('❌ Sessão sem role:', s)
    return false
  }
  return order[s.role] >= order[minRole]
}

export async function ensureDefaultAdmin() {
  if (isMockMode()) {
    // Em modo mock, não precisa fazer nada - usuários já estão definidos
    console.log('🎭 Modo mock ativo - usuários já configurados')
    return
  }
  
  const email = 'jonatha.vieira@starbem.app'
  try {
    const { data, error } = await supabase
      .from('users')
      .select('id')
      .eq('email', email)
      .limit(1)
    if (error) return
    if (!data || data.length === 0) {
      const { default: bcrypt } = await import('bcryptjs')
      const hash = await bcrypt.hash('Teste123', 10)
      await supabase.from('users').insert([{ nome: 'Jonatha Vieira', email, password_hash: hash, role: 'admin' }])
    }
  } catch (_) {
    // silencioso
  }
}

