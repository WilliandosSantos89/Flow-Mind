# 🐸 FlowMind — Cockpit de Foco e Produtividade

> **"Mente organizada, execução focada."**

O **FlowMind** é um cockpit de alta performance e produtividade pessoal que consolida as melhores metodologias de foco e organização mental do mundo (como **GTD**, **Ivy Lee** e a **Matriz de Eisenhower**) em um único painel integrado. Chega de fragmentação de abas e aplicativos. Aqui você tem o controle total do seu dia, do seu planejamento estratégico e do seu foco.

O projeto foi construído com a estética **Professional Polish**, trazendo um tema escuro e minimalista sofisticado (estilo macOS/Vite), com painéis precisos, controle de status síncronos e barras de controle funcionais.

---

## 🚀 Funcionalidades Principais

*   **📥 Smart Inbox & Triagem**: Capture todos os seus pensamentos de forma rápida. Organize e classifique suas tarefas instantaneamente nos quatro quadrantes da **Matriz de Eisenhower**. Escolha a sua tarefa mestre do dia: o seu **"Sapo do Dia"** (a tarefa mais importante que você deve resolver primeiro).
*   **📅 Calendário & Time Blocking**: Visualize o seu dia em blocos de tempo e posicione suas tarefas no horário correto para garantir um trabalho focado e contínuo.
*   **🎯 Metas SMART & Mapa**: Planeje seu futuro com precisão. Desenhe metas destrinchadas sob a ótica SMART (Específica, Mensurável, Atingível, Relevante e Temporal) e visualize a árvore de dependências entre projetos e tarefas de forma interativa.
*   **🌿 Reflexão Diária & Ledger**: Realize um journaling de encerramento do dia para documentar o que correu bem, onde você perdeu o foco e preparar as tarefas de amanhã. Conta com gráficos estatísticos gerados dinamicamente via SVG e exportação completa do seu histórico em formato CSV (compatível com Google Sheets).
*   **🤖 FlowMind Coach (IA Mentor)**: Um mentor de produtividade integrado e treinado com o SDK oficial do Gemini. Ele ajuda você a vencer a procrastinação, criar estratégias de foco personalizadas de 10 minutos e planejar seus objetivos estratégicos.
*   **⏱️ Timer Pomodoro de Segundo Plano**: Execute ciclos de foco e pausas associados diretamente a cada uma de suas tarefas, mantendo o controle total do tempo mesmo ao navegar pelas diferentes abas do cockpit.

---

## 🎨 Design & Estética: *Professional Polish*

O FlowMind utiliza uma interface altamente polida e pensada para profissionais que buscam o máximo de rendimento cognitivo sem distrações desnecessárias:
*   **Tema Dark Linear**: Cores profundas (`#09090b` e `#0c0c0e`) com bordas suaves e elegantes.
*   **Barras de Controle**: Header dinâmico com relógio sincronizado e atalho rápido para iniciar o ciclo de foco; Footer de rodapé com telemetria simplificada de tarefas ativas e estado do Sapo do Dia.
*   **Foco na Tipografia**: Hierarquização visual impecável utilizando a fonte Inter com espaçamentos fluidos e de alto contraste.

---

## 🛠️ Tecnologias Utilizadas

*   **Frontend**: [React 18](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/)
*   **Estilização**: [Tailwind CSS](https://tailwindcss.com/)
*   **Ícones**: [Lucide React](https://lucide.dev/)
*   **Animações**: [Motion](https://motion.dev/) (`motion/react`)
*   **Backend & Proxy**: [Express](https://expressjs.com/) (integrado como middleware do Vite no ambiente de desenvolvimento)
*   **Inteligência Artificial**: SDK oficial `@google/genai` (Gemini API)

---

## 💻 Como Rodar o Projeto Localmente

### Pré-requisitos
*   [Node.js](https://nodejs.org/) instalado (versão 18 ou superior recomendada).

### Passo a Passo

1.  **Clone o repositório**:
    ```bash
    git clone https://github.com/seu-usuario/flowmind.git
    cd flowmind
    ```

2.  **Instale as dependências**:
    ```bash
    npm install
    ```

3.  **Configure as variáveis de ambiente**:
    Crie um arquivo `.env` na raiz do projeto (utilizando o `.env.example` como referência) e adicione sua chave de API do Gemini:
    ```env
    GEMINI_API_KEY=sua_chave_aqui
    ```

4.  **Inicie o servidor de desenvolvimento**:
    ```bash
    npm run dev
    ```
    O cockpit estará disponível no seu navegador em `http://localhost:3000`.

---

## 🤝 Venha Construir o FlowMind Conosco! (Colabore!)

Acreditamos que a produtividade e o foco não devem ser ferramentas chatas, mas sim uma arte refinada de design de software e psicologia cognitiva. **Se você se importa com boa tipografia, interfaces ultra-rápidas e quer construir a ferramenta de produtividade dos sonhos, o FlowMind é o seu lugar!**

Estamos abertos a contribuições de todos os tipos. Aqui estão algumas ideias do que você pode nos ajudar a construir:

### 💡 Ideias de Contribuição
*   **🎨 Novas Estéticas Visuais**: Integração de novos temas refinados (ex: *Classic Swiss Minimalist*, *Retro Terminal Mono*).
*   **📈 Gráficos Avançados**: Gráficos de barra e dispersão adicionais para o Productivity Ledger (usando SVG puro ou D3/Recharts).
*   **⌨️ Atalhos de Teclado**: Implementação de controles globais via teclado (como abrir a barra de Inbox usando `Ctrl+K` ou iniciar o Pomodoro com `Ctrl+P`).
*   **🔔 Notificações e Áudio**: Alertas sonoros customizados ou notificações no navegador ao concluir um ciclo Pomodoro.
*   **🔗 Integração com Calendários Externos**: Sincronização offline bidirecional com arquivos `.ics` ou integração de APIs (como Google Calendar).

### 🛠️ Como Contribuir
1.  Faça um **Fork** do projeto.
2.  Crie uma branch para a sua funcionalidade (`git checkout -b feature/minha-melhoria`).
3.  Faça o commit das suas alterações com mensagens claras (`git commit -m 'feat: adiciona atalhos de teclado globais'`).
4.  Envie para a sua branch (`git push origin feature/minha-melhoria`).
5.  Abra um **Pull Request** detalhando suas alterações e escolhas de design!

---

*Criado com dedicação para elevar o rendimento intelectual humano.* 🐸⚡
