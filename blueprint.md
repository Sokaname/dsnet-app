# Visão Geral Estratégica do Projeto: Central de Trabalho Digital

O objetivo é desenvolver um ecossistema de trabalho completo e integrado, projetado para ser a principal central digital da empresa. Esta plataforma irá substituir ferramentas de comunicação externas como o WhatsApp e unificar diversas operações em um único lugar, com controle de acesso baseado em papéis (RBAC) para diferentes departamentos.

## Módulos Planejados

*   **Módulo de Comunicação (Foco Atual):** Um sistema de chat em tempo real para comunicação interna, incluindo:
    *   Canais de grupo (Equipes, projetos, etc.).
    *   Conversas individuais (1-para-1).
    *   Notificações sonoras e visuais para alertas importantes.
*   **CDT (Central do Técnico):** Ferramentas e painéis específicos para a equipe técnica.
*   **CDS (Central do Suporte):** Ferramentas para gerenciamento de tickets e suporte ao cliente.
*   **CRM de Vendas:** Funcionalidades para a equipe de vendas gerenciar leads e clientes.
*   **Painéis Administrativos:** Dashboards com resumos, relatórios e métricas para a diretoria.
*   **Relatos e Auditoria:** Sistema para registro e acompanhamento de atividades.

---

## Plano de Desenvolvimento: Módulo de Comunicação

*   **Fase 1: Funcionalidades Essenciais (Concluída)**
    *   Canais de grupo dinâmicos com mensagens em tempo real.
    *   Envio de arquivos (imagens).
    *   Interface de usuário moderna com animações, timestamps e notificações sonoras.

*   **Fase 2: Conversas Individuais (Concluída)**
    *   **Implementação:**
        1.  **Modal de Seleção de Usuário:** Um botão "Nova Conversa" foi adicionado à tela inicial, que abre um modal (`UserList.tsx`).
        2.  **Busca de Usuários:** O modal busca e exibe uma lista de todos os usuários cadastrados, excluindo o usuário atual. Foi implementada uma solução alternativa que busca usuários a partir da tabela `mensagens` para contornar possíveis restrições de acesso à tabela `auth.users` do Supabase.
        3.  **Criação de Canal Privado:** Ao selecionar um usuário, um ID de canal único é gerado a partir da combinação ordenada dos IDs dos dois usuários (ex: `userid1_userid2`), garantindo que a mesma sala de chat seja sempre acessada por ambos os participantes.
        4.  **Navegação e Estilização:** O usuário é redirecionado para a sala de chat privada, e todos os novos componentes foram estilizados para se integrarem perfeitamente ao design da aplicação.

*   **Fase 3: Recursos Avançados de Chat (Próximos Passos)**
    *   Indicador "digitando...".
    *   Confirmação de leitura (Recibos de "visto").
    *   Perfis de usuário com avatares e status.
    *   Suporte para emojis e reações.
