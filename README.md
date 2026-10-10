# Sistema de Gestão de Workflow Académico para Trabalhos de Fim de Curso (TFC)

Plataforma Web desenvolvida em **Next.js** (App Router, React 19, TypeScript, Tailwind CSS) e **Supabase** (PostgreSQL, Realtime, Storage, RLS) para automatizar o ciclo completo de Trabalhos de Fim de Curso.

---

## 📋 Sumário dos Requisitos Implementados

### 1. Perfis de Utilizadores
* **Administrador-Geral (Admin):** Gestão global de cursos, atribuição de coordenadores a cursos, ativação/desativação de contas e métricas do sistema.
* **Coordenador do Curso:** Moderação e validação de inscrições de estudantes (RF02), controlo e bloqueio de prazos (RF05), atribuição e reatribuição de orientadores (RF06), gestão de bancas de júri com sugestão automática (RF10), e homologação da Ata de Defesa com envio para a Biblioteca Virtual (RN04, RF11).
* **Orientador (Professor):** Vínculo multi-curso (Premissa do Escopo), acompanhamento de grupos em "Meus Orientandos", avaliação com pareceres e rubrica (RF04), auditoria anti-plágio (RF09) e chat em tempo real com envio de anexos (RF07).
* **Alunos / Grupos de Alunos:** Inscrição com validação de nível terminal (13º nível) e orientador preferencial (RN01), dashboard com status e linha do tempo, submissão estrita em `.docx` ou `.pdf` até 15 MB (RF03, RN03), chat direto com o orientador e notificações em tempo real (RF08).

---

### 2. Requisitos Funcionais (RF) e Regras de Negócio (RN)
* **RF01 – Gestão de Perfis:** Cadastro, edição e desativação de estudantes, orientadores e coordenadores com verificação de papéis.
* **RF02 – Moderação de Acesso:** O Coordenador aprova ou rejeita cadastros dos estudantes com notificação no sistema.
* **RF03 & RN03 – Submissão de Documentos:** Upload com validação estrita de formatos (`.docx` e `.pdf`) e limite de 15 MB por ficheiro.
* **RF04 – Avaliação de Trabalhos:** Pareceres técnicos emitidos pelo Orientador e Coordenação com estados: *Aprovado*, *Correções Solicitadas*, ou *Reprovado*.
* **RF05 – Controlo de Prazos:** Definição de datas limites e bloqueio manual/automático de submissões em atraso.
* **RF06 – Atribuição e Reatribuição:** Coordenação atribui ou transfere estudantes/grupos para outro orientador disponível, notificando os envolvidos.
* **RF07 & RNF05 – Canal de Comunicação:** Chat interno com suporte a mensagens de texto, ficheiros anexos e sincronismo em tempo real.
* **RF08 – Notificações em Tempo Real:** Centro de alertas com indicadores sonoros/visuais para estudantes e orientadores sobre mudanças de estado.
* **RF09 – Verificação de Plágio:** Motor de análise de originalidade com cálculo percentual de similaridade, palavras auditadas, fontes identificadas e parecer de conformidade.
* **RF10 – Gestão de Bancas (Júri):** Algoritmo de recomendação automática da mesa de júri (Presidente, 1º Vogal e 2º Vogal) com base na área de especialização dos docentes e tema do TFC. Agendamento com data, hora e sala.
* **RF11 & RN04 – Conclusão de Ciclo & Biblioteca Virtual:** A conta só transita para "Concluído" e o trabalho é publicado no repositório público/institucional após o lançamento e homologação da Ata de Defesa pelo Coordenador.

---

## 🚀 Como Executar o Projeto

### Pré-requisitos
* Node.js v18+ (recomendado Node.js 20 ou 22)
* npm ou yarn

### 1. Instalação das Dependências
```bash
npm install
```

### 2. Executar em Modo de Desenvolvimento
```bash
npm run dev
```
Aceda a [http://localhost:3000](http://localhost:3000) no seu navegador.

### 3. Compilação de Produção
```bash
npm run build
npm run start
```

---

## 🗄️ Configuração do Supabase (Opcional / Produção)

O projeto inclui o script SQL completo em [`supabase/schema.sql`](supabase/schema.sql).

1. Crie um projeto no [Supabase](https://supabase.com).
2. Vá até **SQL Editor** no painel do Supabase e execute o script [`supabase/schema.sql`](supabase/schema.sql).
3. Crie um ficheiro `.env.local` na raiz do projeto com as credenciais:
```env
NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua-chave-anonima-publica
```
> **Nota de Demonstração:** O sistema já possui um banco de dados local reativo pré-configurado (*Local Store & Mock Data*) com todos os atores (Estudante, Orientador, Coordenador e Administrador), permitindo testar e demonstrar 100% dos fluxos imediatamente com o alternador rápido de perfis no topo da página.
