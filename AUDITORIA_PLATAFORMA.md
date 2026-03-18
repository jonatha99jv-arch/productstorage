# Auditoria da Plataforma – Bugs, Problemas e Atualizações

**Data:** 18/03/2025  
**Branch:** feature/reorganizacao-produtos-subprodutos

---

## Resumo

Foi feita uma checagem de bugs, lint, build, dependências e segurança. **Todos os erros de lint foram corrigidos** e o build está passando. Abaixo: o que foi corrigido, o que ficou como aviso e o que vale planejar.

---

## Correções aplicadas

### 1. **BulkImportModal.jsx** (bug em runtime)
- **Problema:** `dataInicio` e `dataFim` eram declarados com `const` e depois reatribuídos, o que geraria erro em tempo de execução ao importar planilha com ano de referência.
- **Correção:** Uso de variáveis separadas (`dataInicioFinal`, `dataFimFinal`) para as datas ajustadas e para o payload.

### 2. **ItemModalImproved.jsx** (refs indefinidas)
- **Problema:** `nomeRef`, `produtoRef`, `metricRef` e `teseRef` eram usados no `refMap` da validação mas não existiam, causando falha ao focar/rolar para o primeiro campo inválido.
- **Correção:** Criação dos refs com `useRef(null)` e associação aos campos (Input nome, div do select produto, Textareas de métrica e tese).

### 3. **vite.config.js** (ESM)
- **Problema:** `__dirname` não existe em módulos ESM, gerando erro em ambientes que usam apenas ESM.
- **Correção:** Uso de `import.meta.url` e `path.dirname(fileURLToPath(import.meta.url))` para definir `__dirname`.

### 4. **DatabaseSetup.jsx**
- **Problema:** Variável `tables` declarada e não utilizada.
- **Correção:** Renomeada para `_tables` para indicar uso intencionalmente omitido.

### 5. **MetricsAdmin.jsx**
- **Problema:** Prop `user` recebida e não utilizada.
- **Correção:** Remoção do parâmetro `user` da assinatura do componente.

### 6. **OKRManager.jsx**
- **Problema:** Função `getLinkedItemsCount` definida e nunca usada.
- **Correção:** Função removida (já existe `getLinkedItems` para uso).

### 7. **PerformanceDashboard.jsx**
- **Problema:** Parâmetro `teamId` em `MetricCard` não utilizado.
- **Correção:** Remoção do parâmetro da assinatura e da chamada a `MetricCard`.

### 8. **ProductTabs.jsx**
- **Problema:** `useState` importado e não utilizado.
- **Correção:** Remoção do import.

### 9. **RoadmapTableImproved.jsx**
- **Problema:** Parâmetro `e` em `handleDragLeave` não usado; função `getEndDate` e variável `startDate` não usadas; parâmetro `i` em `findIndex` não usado.
- **Correção:** Remoção do parâmetro `e`, da função `getEndDate` e do parâmetro `i` no callback.

### 10. **useSupabaseData.js**
- **Problema:** Variável `dataFim` (reconstituída das tags) era calculada mas não usada no retorno de `mapDbToApp` quando a coluna `data_fim` não existia.
- **Correção:** Uso de `dataFim` das tags como fallback: `if (!dataFimLocal && dataFim) dataFimLocal = dataFim`.

---

## Estado atual

- **Lint:** 0 erros, 15 avisos (warnings).
- **Build:** concluído com sucesso.
- **Avisos restantes:**  
  - Dependências de `useEffect` (exhaustive-deps) em vários arquivos.  
  - Fast refresh em alguns componentes UI (export de constantes/funções junto com componentes).  
  Esses avisos não impedem o funcionamento; podem ser tratados depois se quiser deixar o lint mais restrito.

---

## Dependências desatualizadas

Várias dependências estão abaixo da versão mais recente. Atualizar em lotes e testar, pois algumas podem ter breaking changes:

| Pacote | Atual | Latest | Observação |
|--------|-------|--------|------------|
| react / react-dom | 18.x | 19.x | Major – testar bem |
| @supabase/supabase-js | 2.55 | 2.99 | Recomendado atualizar |
| vite | 4.x | 8.x | Major – exige migração |
| react-router-dom | 6.x | 7.x | Major |
| tailwindcss | 3.x | 4.x | Major |
| framer-motion | 10.x | 12.x | Major |
| date-fns | 2.x | 4.x | Major |
| Outros Radix/ESLint | variado | variado | Minor/patch em geral |

Sugestão: rodar `npm update` para minor/patch e planejar upgrades major (React 19, Vite 8, etc.) em tarefas dedicadas.

---

## Vulnerabilidades de segurança (npm audit)

- **React Router (react-router-dom):** vulnerabilidade de XSS por open redirect. **Recomendado:** `npm audit fix` (atualiza para versão corrigida dentro do mesmo major).
- **xlsx:** Prototype Pollution e ReDoS. **Sem fix oficial.** Avaliar trocar por outra lib (ex.: SheetJS paga ou alternativa open source) se as planilhas forem de origem não confiável.
- **Outras (ajv, esbuild, flatted, glob, js-yaml, lodash, minimatch, next, rollup):** em geral há `npm audit fix`; algumas exigem `npm audit fix --force` (pode subir major de Vite).

Recomendação imediata: rodar `npm audit fix` (sem `--force`) e revisar o relatório. Para xlsx, documentar o risco e, se necessário, trocar de biblioteca no roadmap.

---

## Outros pontos

1. **Browserslist:** Aviso de que os dados do caniuse estão com cerca de 7 meses. Rodar:  
   `npx update-browserslist-db@latest`

2. **bcryptjs no browser:** Vite externaliza o módulo `crypto` no build para o browser. O bcrypt continua funcionando (usa implementação compatível), mas é um pacote pesado para o cliente; considerar uso apenas no backend se no futuro houver API própria.

3. **Bundle grande:** Um chunk passa de 500 KB (minificado). Para melhorar carregamento, considerar code-splitting com `import()` dinâmico nas rotas ou telas mais pesadas.

4. **Debug em produção:** Em `useSupabaseData.js` há `console.log` em `mapAppToDb`. Considerar remover ou guardar atrás de `if (import.meta.env.DEV)`.

---

## Atualizações aplicadas (pós-auditoria)

### Segurança
- **npm audit fix** executado: vulnerabilidades corrigidas onde havia fix sem breaking (React Router, ajv, flatted, glob, js-yaml, lodash, minimatch, next, rollup).
- **Restantes (3):** esbuild/vite (exige `npm audit fix --force` → Vite 8, breaking) e **xlsx** (sem fix; ver nota abaixo).

### Dependências
- **@supabase/supabase-js:** atualizado de ^2.55.0 para **^2.99.0** no `package.json` e instalado.
- **caniuse-lite / browserslist:** atualizados via `npm update caniuse-lite browserslist` (o script `npx update-browserslist-db@latest` falha sem pnpm no ambiente).

### Logs em produção
- Todos os `console.log` de debug em **useSupabaseData.js** (migrateProductSubProduct, mapAppToDb, toLocalDateString, modo MOCK) foram guardados com `if (import.meta.env.DEV)`, para não aparecerem no build de produção.

### xlsx (vulnerabilidades sem fix)
- O pacote **xlsx** (SheetJS community) tem vulnerabilidades reportadas (Prototype Pollution, ReDoS) e **não há versão corrigida** no npm. Recomendações:
  - Manter por enquanto se as planilhas forem apenas de fontes confiáveis (upload interno).
  - Para dados não confiáveis: considerar alternativas como **exceljs**, **read-excel-file** ou API server-side que valide/sanitize os arquivos.

---

## Próximos passos sugeridos

1. ~~Rodar `npm audit fix`~~ ✅ Feito.
2. ~~Atualizar Supabase e logs em produção~~ ✅ Feito.
3. Tratar avisos de exhaustive-deps (incluir deps ou comentar com justificativa) se quiser lint mais limpo.
4. Avaliar migração de **xlsx** para outra lib se as planilhas forem de origem não confiável.
5. (Opcional) Upgrade para Vite 6/8 em tarefa dedicada para eliminar aviso do esbuild.
