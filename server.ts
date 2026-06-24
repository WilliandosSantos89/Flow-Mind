import express from "express";
import path from "path";
import dotenv from "dotenv";
import { GoogleGenAI, Type } from "@google/genai";
import { createServer as createViteServer } from "vite";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Initialize Gemini SDK with telemetry headers
const getGeminiClient = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.warn("Warning: GEMINI_API_KEY is not defined. AI features will operate in demo/fallback mode.");
    return null;
  }
  return new GoogleGenAI({
    apiKey: apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
};

// Route 1: Analyze Inbox Items with Gemini AI
app.post("/api/gemini/analyze", async (req, res) => {
  const { rawText } = req.body;

  if (!rawText || typeof rawText !== "string" || !rawText.trim()) {
    return res.status(400).json({ error: "O texto bruto para análise é obrigatório." });
  }

  const ai = getGeminiClient();

  if (!ai) {
    // Elegant fallback mock for demo mode if API key is missing
    return res.json({
      isDemo: true,
      tasks: [
        {
          id: "demo-1",
          title: "🎯 Finalizar o Pitch de Negócios (Sapo do Dia)",
          description: "Revisar o deck de slides, ajustar as projeções financeiras e salvar em PDF.",
          quadrant: 1,
          isSapo: true,
          estimatedPomodoros: 3,
          smartSubtasks: [
            "Escrever a proposta de valor clara no slide 2",
            "Ajustar margens de lucro para 25% no gráfico financeiro",
            "Exportar PDF e enviar para o time"
          ]
        },
        {
          id: "demo-2",
          title: "📈 Estudar Métricas de Retenção de Usuários",
          description: "Analisar os dados de cohort da última semana e documentar aprendizados.",
          quadrant: 2,
          isSapo: false,
          estimatedPomodoros: 2,
          smartSubtasks: [
            "Extrair planilha de dados semanais",
            "Identificar maior queda no funil de onboarding",
            "Escrever 3 hipóteses de melhoria"
          ]
        },
        {
          id: "demo-3",
          title: "📧 Responder e-mails urgentes de clientes",
          description: "Limpar a caixa de entrada respondendo propostas pendentes.",
          quadrant: 3,
          isSapo: false,
          estimatedPomodoros: 2,
          smartSubtasks: [
            "Responder proposta do cliente Carlos",
            "Agendar call de alinhamento com a equipe de vendas"
          ]
        },
        {
          id: "demo-4",
          title: "🧹 Organizar arquivos da área de trabalho",
          description: "Mover downloads antigos para pastas estruturadas no drive.",
          quadrant: 4,
          isSapo: false,
          estimatedPomodoros: 1,
          smartSubtasks: [
            "Deletar arquivos temporários com mais de 30 dias",
            "Mover capturas de tela para pasta de referências"
          ]
        }
      ]
    });
  }

  try {
    const prompt = `Analise a seguinte lista de tarefas, ideias soltas ou e-mails caóticos e converta em uma lista de tarefas estruturadas, categorizadas usando a Matriz de Eisenhower (quadrantes de 1 a 4) e selecionando exatamente UM "Sapo do Dia" (isSapo = true para o item mais importante/difícil que trará maior impacto).
    
    Regras da Matriz de Eisenhower:
    - Quadrante 1 (Importante e Urgente): Crises, problemas imediatos, prazos fatais.
    - Quadrante 2 (Importante, Não Urgente): Planejamento, metas SMART, aprendizado, saúde (Quadrante do Foco e Alta Performance!).
    - Quadrante 3 (Não Importante, Urgente): Interrupções, reuniões não produtivas, e-mails secundários urgentes.
    - Quadrante 4 (Não Importante, Não Urgente): Distrações, desperdício de tempo, tarefas irrelevantes.
    
    Para cada tarefa estruturada, defina:
    1. Um título claro e motivador.
    2. Uma breve descrição do que deve ser feito.
    3. O quadrante correspondente (1, 2, 3 ou 4).
    4. "isSapo" como true para apenas um Sapo do Dia (se houver tarefas importantes, escolha o principal Sapo. Se houver poucas tarefas, escolha a de maior valor cognitivo).
    5. O número estimado de Pomodoros (ciclos de 25 minutos, de 1 a 4).
    6. Uma lista com 2 a 3 sub-tarefas SMART (específicas, mensuráveis, acionáveis).

    Texto bruto recebido do usuário:
    """
    ${rawText}
    """`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          required: ["tasks"],
          properties: {
            tasks: {
              type: Type.ARRAY,
              description: "Lista de tarefas extraídas e priorizadas",
              items: {
                type: Type.OBJECT,
                required: ["title", "description", "quadrant", "isSapo", "estimatedPomodoros", "smartSubtasks"],
                properties: {
                  title: { type: Type.STRING, description: "Título claro e acionável da tarefa" },
                  description: { type: Type.STRING, description: "Breve explicação ou contexto" },
                  quadrant: { 
                    type: Type.INTEGER, 
                    description: "Quadrante do Eisenhower (1 = Urgente/Importante, 2 = Foco/Longo Prazo, 3 = Delegável/Urgente, 4 = Eliminar/Distração)" 
                  },
                  isSapo: { type: Type.BOOLEAN, description: "Define se é o Sapo do Dia (tarefa de maior peso intelectual e impacto). Apenas um deve ser true." },
                  estimatedPomodoros: { type: Type.INTEGER, description: "Número sugerido de blocos Pomodoro (1 a 4)" },
                  smartSubtasks: {
                    type: Type.ARRAY,
                    description: "2 a 3 sub-tarefas no modelo SMART para quebrar a procrastinação",
                    items: { type: Type.STRING }
                  }
                }
              }
            }
          }
        }
      }
    });

    const responseText = response.text;
    if (!responseText) {
      throw new Error("Resposta vazia da API do Gemini.");
    }

    const parsedData = JSON.parse(responseText.trim());
    return res.json(parsedData);
  } catch (error: any) {
    console.error("Erro na chamada do Gemini API:", error);
    return res.status(500).json({ error: "Erro ao processar com inteligência artificial. Por favor tente novamente.", details: error.message });
  }
});

// Route 2: AI Coach for productivity advising
app.post("/api/gemini/coach", async (req, res) => {
  const { messages } = req.body;

  if (!messages || !Array.isArray(messages)) {
    return res.status(400).json({ error: "O histórico de mensagens é obrigatório." });
  }

  const ai = getGeminiClient();

  if (!ai) {
    return res.json({
      isDemo: true,
      text: "Olá! Atualmente estou em modo de demonstração porque a chave de API do Gemini não foi configurada. Como seu coach de produtividade local, sugiro que você comece definindo seu 'Sapo do Dia' (o obstáculo mais desafiador) na barra lateral de inbox, agende-o no calendário diário e use o timer Pomodoro para realizar um trabalho focado sem distrações! Há algo específico sobre métodos como GTD ou Ivy Lee que você gostaria de explorar?"
    });
  }

  try {
    // Format conversation history for Gemini
    const systemInstruction = `Você é o FlowMind Coach, um mentor especialista em alta performance, produtividade focada e bem-estar mental. 
    Seu objetivo é ajudar o usuário a dominar métodos como GTD (Getting Things Done), Eisenhower Matrix, Pomodoro e o Método Ivy Lee de 6 tarefas diárias.
    Seja sempre motivador, pragmático, empático e focado em ações práticas que eliminam a sobrecarga cognitiva. 
    Mantenha as respostas concisas, estruturadas com pontos claros, e use termos de design de produtividade (como "Sapo do Dia", "Tempo Blocados", "Trabalho Profundo/Deep Work").`;

    // Map conversation array to content string or structure
    const chatPrompt = messages.map(msg => `${msg.role === "user" ? "Usuário" : "FlowMind Coach"}: ${msg.content}`).join("\n\n") + "\n\nFlowMind Coach:";

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: chatPrompt,
      config: {
        systemInstruction: systemInstruction,
        temperature: 0.7,
      }
    });

    return res.json({ text: response.text });
  } catch (error: any) {
    console.error("Erro no Coach Gemini API:", error);
    return res.status(500).json({ error: "Erro ao consultar o mentor de IA. Por favor tente novamente." });
  }
});

// Setup Vite Development Server or Static Serving for Production
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
    console.log("Vite middleware mounted in development mode.");
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
    console.log("Serving static production build from:", distPath);
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`FlowMind Server running on http://localhost:${PORT}`);
  });
}

startServer();
