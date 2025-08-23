# 🚀 Desenvolvimento Local - Sistema Integrado

## Como Usar

### ✅ **Modo de Desenvolvimento Automático**
O sistema detecta automaticamente quando as variáveis do Supabase não estão disponíveis e **entra em modo mock** para permitir desenvolvimento local sem configuração.

### 🎯 **Acesso ao Sistema**

1. **Inicie o projeto:**
   ```bash
   npm run dev
   ```

2. **Acesse:** http://localhost:5173

3. **Login (Modo Mock):**
   - **Administrador:** `admin@starbem.com` / `admin123`
   - **Editor:** `editor@starbem.com` / `editor123`
   - **Desenvolvedor:** `dev@starbem.com` / `dev123`
   - **Visualizador:** `viewer@starbem.com` / `viewer123`

### 📊 **Funcionalidades Disponíveis**

#### **Seção Roadmap:**
- ✅ Visualização de itens do roadmap
- ✅ Criação/edição de itens
- ✅ Alteração de status
- ✅ Gerenciamento de OKRs
- ✅ Filtros por produto (Aplicativo, Web, Parcerias, AI, Automação)
- ✅ Administração de usuários (apenas admin)

#### **Seção Carreira (NOVO):**
- ✅ Diagrama interativo em Y
- ✅ Trilhas técnica e de gestão
- ✅ Modal detalhado com informações dos níveis
- ✅ Recursos de desenvolvimento (cursos, mentores, projetos)

### 🎭 **Indicadores do Modo Mock**

Quando em desenvolvimento local, você verá:
- 🎭 **Badge "Modo Desenvolvimento"** no header
- 💡 **Credenciais de login** na tela de acesso
- 📝 **Logs no console** indicando operações mock

### 💾 **Persistência Local**

No modo mock, os dados são salvos no **localStorage** do browser:
- `mockRoadmapItems` - Itens do roadmap
- `mockOKRs` - Objetivos e resultados-chave
- `session` - Sessão do usuário

### 🔄 **Transição para Produção**

Quando o projeto for implantado no Vercel com as variáveis do Supabase:
- O sistema **automaticamente usa** o banco real
- **Sem alterações** no código necessárias
- **Autenticação real** com bcrypt

### 🛠️ **Estrutura de Dados Mock**

**Itens de Roadmap Exemplo:**
- Sistema de Login Aprimorado (Em andamento)
- Dashboard Executivo (Planejado) 
- Integração com IA (Concluído)

**OKRs Exemplo:**
- Melhorar Experiência do Usuário
- Aumentar Eficiência Operacional

### 🎯 **Testando a Integração**

1. **Login:** Use qualquer usuário mock
2. **Roadmap:** Teste criação/edição de itens
3. **Carreira:** Navegue pela trilha de carreira
4. **Funcionalidades:** Teste diferentes perfis de usuário (admin/editor/viewer)

---

## 🔧 **Desenvolvimento Avançado**

### **Modificar Dados Mock:**
- Edite `src/lib/auth.js` para usuários
- Edite `src/hooks/useSupabaseData.js` para roadmap/OKRs

### **Debug:**
- Abra **DevTools → Console** para logs detalhados
- Use **Application → localStorage** para ver dados salvos

### **Reset de Dados:**
```javascript
// No console do browser
localStorage.clear()
location.reload()
```
