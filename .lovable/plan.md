
# Plano — Refino do módulo Meus Negócios + Vendas + Relatórios + Taxas

Vou aplicar o trabalho em **fases pequenas e independentes**, para você validar cada bloco antes de seguir e evitar gasto desnecessário de créditos. Você pode pedir para parar ou pular qualquer fase.

---

## Fase 1 — Grid 2x2 + novo card "Vendas" + layout premium dos cards

Arquivo: `src/pages/MeuNegocio.tsx`

- Trocar o grid `grid-cols-3` por `grid-cols-2` (2 colunas × 2 linhas).
- Adicionar 4º card "Vendas" (ícone verde de crescimento, conta total de vendas pagas, descrição "vendas realizadas", botão "Adicionar Venda").
- Refazer o componente `CatCard` seguindo o padrão visual da imagem aprovada:
  - **Topo**: ícone colorido da categoria + (áudio, ajuda "?", olho/visualizar) + menu 3 pontinhos no canto direito.
  - **Centro**: título → contador grande centralizado → descrição.
  - **Rodapé**: botão circular `+` verde + texto "Adicionar X".
- Cores dos ícones: Produtos = amarelo/dourado, Serviços = azul, Infoprodutos = lilás, Vendas = verde.
- Menu 3 pontinhos: Adicionar / Editar / Excluir / Ver todos os lançamentos.
- Hierarquia: respiros entre título, número, descrição e botão.

## Fase 2 — Modelo de dados de Vendas vinculadas a ativos

- Reutilizar a chave já existente `d21.mn.sales` (atualmente usada parcialmente).
- Tipo unificado:
  ```ts
  type Sale = {
    id: string;
    category: "produtos" | "servicos" | "info";
    assetId: string;            // id do Product/Service/Infoproduct
    date: string;
    amount: number;             // valor bruto da venda
    quantity: number;
    payment: "Pix" | "Crédito" | "Débito" | "Boleto";
    fees?: number;              // custo/taxa aplicada
    profit?: number;            // calculado
    note?: string;
    status: "Pago" | "Aguardando" | "Recusado" | "Reembolsado" | "Cancelado";
  };
  ```
- Hook simples `useSales()` (em `src/hooks/useFinance.ts` ou novo `useSales.ts`) com `add/update/remove` e seletores `byAsset(assetId)`, `byCategory(cat)`.
- Regra de consistência: `addSale` rejeita se `assetId` não existir.

## Fase 3 — Formulário "Nova Venda" (4 etapas em um Dialog)

Novo componente `NewSaleDialog` dentro de `MeuNegocio.tsx` (ou arquivo próprio):

1. Selecionar categoria (Produtos / Serviços / Infoprodutos).
2. Selecionar ativo (lista dinâmica filtrada pela categoria escolhida; se a lista estiver vazia, exibir CTA para cadastrar ativo primeiro).
3. Dados: data, valor, quantidade, forma de pagamento, observação.
4. Resumo automático: valor × quantidade, taxa (se houver — vinda do módulo Taxas/plataforma), lucro estimado, margem. Botão "Salvar".

Validação: bloquear salvar sem categoria + ativo.

Após salvar: o card daquela categoria atualiza contador, e a listagem do ativo mostra vendas/receita acumulada.

## Fase 4 — Relatórios baseados em VENDAS (não em ativos)

Arquivo: `src/pages/Reports.tsx`

- Remover cálculo `prodReceita/servReceita/infoReceita` baseado em `price` dos ativos.
- Substituir por agregações sobre `d21.mn.sales` (status = "Pago"):
  - Faturamento total
  - Lucro total (soma de `profit`)
  - Volume de vendas (count)
  - Vendas por categoria (gráfico pizza)
  - Vendas por período (gráfico barras por dia/mês)
- Ativos sem vendas registradas **não geram métrica financeira** (apenas aparecem como contagem de cadastro).
- Manter intacta toda a parte de transações pessoais, mentor, health score.

## Fase 5 — Tela "Infoprodutos": substituir abas

Hoje há (Produtos | Vendas | Plataformas). Trocar para **(Plataformas | Taxas)**.

- Remover abas "Produtos" e "Vendas" da tela Infoprodutos (vendas agora vivem no módulo Vendas).
- Manter Plataformas com Hotmart, Kiwify, Cakto + permitir adicionar customizadas (já existe).

## Fase 6 — Módulo "Taxas"

Nova aba dentro de Infoprodutos (ou tela própria `TaxasTab`).

- Para cada plataforma cadastrada, configurar:
  - Taxa por venda (%)
  - Taxa fixa (R$)
  - Taxa de saque
  - Prazo de liberação (dias)
  - Por método: Pix / Boleto / Débito / Crédito
- Persistência: `d21.mn.platformFees` → `Record<platformName, FeeConfig>`.
- Essas taxas alimentam o cálculo de lucro/margem no formulário de Nova Venda e nos Relatórios.

---

## O que NÃO vou fazer (para economizar créditos)

- Não vou recriar componentes que já funcionam (formulários de Produto/Serviço/Infoproduto ficam como estão).
- Não vou mexer em outras telas (Home, Jornada, Perfil, BottomNav).
- Não vou criar tabelas no backend — tudo continua em `localStorage` via `useStorage`, igual ao padrão atual do app.
- Não vou refazer o design system nem tokens de cor.

## Ordem de entrega sugerida

Posso entregar **Fase 1 sozinha primeiro** (visual já fica como na referência), você valida, e só então sigo para Fases 2–3 (vendas), depois 4 (relatórios), e por fim 5–6 (infoprodutos + taxas).

Ou, se preferir, faço Fases 1 + 2 + 3 juntas em um único patch (visual + vendas funcionando), e deixo Relatórios e Taxas para uma segunda rodada.

**Confirma qual cadência prefere?**
- (A) Só Fase 1 agora.
- (B) Fases 1 + 2 + 3 juntas (visual + vendas funcionais).
- (C) Tudo de uma vez (1–6).
