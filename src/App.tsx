import React, { useState, useEffect } from "react";
import { Task, Project, SMARTMeta, ProductivityLogEntry, ChatMessage } from "./types";
import InboxView from "./components/InboxView";
import CalendarView from "./components/CalendarView";
import GoalsView from "./components/GoalsView";
import FocusMode from "./components/FocusMode";
import AnalyticsView from "./components/AnalyticsView";
import AICoach from "./components/AICoach";
import { 
  Compass, 
  Calendar, 
  Target, 
  Flame, 
  Bot, 
  BookOpen, 
  Volume2, 
  Play, 
  CheckSquare, 
  Square,
  Sparkles,
  Info
} from "lucide-react";

export default function App() {
  // Navigation tabs selection
  const [activeTab, setActiveTab] = useState<"inbox" | "calendar" | "goals" | "analytics" | "coach">("inbox");

  // Persistent shared states
  const [tasks, setTasks] = useState<Task[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [metas, setMetas] = useState<SMARTMeta[]>([]);
  const [logs, setLogs] = useState<ProductivityLogEntry[]>([]);
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [isGeneratingCoach, setIsGeneratingCoach] = useState(false);

  // Global Pomodoro background states
  const [activeFocusTask, setActiveFocusTask] = useState<Task | null>(null);
  const [timerSeconds, setTimerSeconds] = useState(25 * 60);
  const [timerActive, setTimerActive] = useState(false);
  const [isBreakMode, setIsBreakMode] = useState(false);
  const [completedCycles, setCompletedCycles] = useState(0);

  // INITIAL SEED DATA / LOCAL STORAGE POPULATION
  useEffect(() => {
    // 1. Load Metas SMART
    const savedMetas = localStorage.getItem("flowmind_metas");
    if (savedMetas) {
      setMetas(JSON.parse(savedMetas));
    } else {
      const seedMetas: SMARTMeta[] = [
        {
          id: "meta-1",
          title: "Lançar o FlowMind v1",
          description: "Colocar no ar o cockpit de alta performance e validar o modelo mental de GTD com o público.",
          targetDate: "2026-07-15",
          specific: "Hospedar o web app para teste de campo com feedback em tempo real.",
          measurable: "Obter pelo menos 15 usuários ativos fazendo journaling e Pomodoro diariamente.",
          achievable: "Utilizar banco de dados local robusto e as APIs do Gemini 3.5 Flash.",
          relevant: "Validar se a eliminação da fragmentação de abas melhora o rendimento cognitivo.",
          timeBound: "Finalizar todos os testes de usabilidade e logs de telemetria até 15 de Julho.",
          completed: false
        }
      ];
      setMetas(seedMetas);
      localStorage.setItem("flowmind_metas", JSON.stringify(seedMetas));
    }

    // 2. Load Projects
    const savedProj = localStorage.getItem("flowmind_projects");
    if (savedProj) {
      setProjects(JSON.parse(savedProj));
    } else {
      const seedProjects: Project[] = [
        { id: "proj-1", title: "Desenvolvimento Core", description: "Construir telas de calendário e timer Pomodoro", metaId: "meta-1", color: "#10b981" },
        { id: "proj-2", title: "Marketing de Lançamento", description: "Copywriting de email e landing page", metaId: "meta-1", color: "#3b82f6" }
      ];
      setProjects(seedProjects);
      localStorage.setItem("flowmind_projects", JSON.stringify(seedProjects));
    }

    // 3. Load Tasks
    const savedTasks = localStorage.getItem("flowmind_tasks");
    if (savedTasks) {
      setTasks(JSON.parse(savedTasks));
    } else {
      const todayStr = new Date().toISOString().split("T")[0];
      const seedTasks: Task[] = [
        {
          id: "task-seed-1",
          title: "🎯 Concluir Arquitetura e Fluxo do Dashboard",
          description: "Implementar os módulos de Eisenhower, Ivy Lee e conectar o timer Pomodoro com as tarefas.",
          quadrant: 2,
          isSapo: true,
          estimatedPomodoros: 3,
          completedPomodoros: 1,
          completed: false,
          smartSubtasks: [
            { id: "sub-1-1", title: "Criar interfaces em tsx e CSS customizado", completed: true },
            { id: "sub-1-2", title: "Desenhar SVG interativo do Mindmap de metas", completed: true },
            { id: "sub-1-3", title: "Conectar timer global de segundo plano em App.tsx", completed: false }
          ],
          createdAt: new Date().toISOString(),
          projectId: "proj-1",
          scheduledDate: todayStr,
          timeBlockStart: "09:00",
          timeBlockEnd: "11:00"
        },
        {
          id: "task-seed-2",
          title: "💥 Corrigir bugs de renderização de SVG no Safari",
          description: "Ajustar as proporções e viewBox do gráfico de árvore no navegador nativo do macOS.",
          quadrant: 1,
          isSapo: false,
          estimatedPomodoros: 1,
          completedPomodoros: 0,
          completed: false,
          smartSubtasks: [],
          createdAt: new Date().toISOString(),
          projectId: "proj-1"
        },
        {
          id: "task-seed-3",
          title: "📝 Escrever roteiro do vídeo de demonstração",
          description: "Gravar roteiro focado de 2 minutos destacando a priorização automática do Sapo do Dia por IA.",
          quadrant: 2,
          isSapo: false,
          estimatedPomodoros: 2,
          completedPomodoros: 2,
          completed: true,
          smartSubtasks: [],
          createdAt: new Date().toISOString(),
          projectId: "proj-2"
        }
      ];
      setTasks(seedTasks);
      localStorage.setItem("flowmind_tasks", JSON.stringify(seedTasks));
    }

    // 4. Load Productivity Ledger Logs
    const savedLogs = localStorage.getItem("flowmind_logs");
    if (savedLogs) {
      setLogs(JSON.parse(savedLogs));
    } else {
      const seedLogs: ProductivityLogEntry[] = [
        {
          id: "log-seed-1",
          date: "2026-06-21",
          completedTasksCount: 4,
          totalPomodorosCount: 5,
          sapoCompleted: true,
          reflection1: "Tudo fluiu incrivelmente bem no período da manhã. Roteiro pronto.",
          reflection2: "Notificações repetidas de mídias sociais de tarde quebraram o foco.",
          reflection3: "Programar blocos offline de tarde e desligar celular.",
          createdAt: new Date().toISOString()
        },
        {
          id: "log-seed-2",
          date: "2026-06-22",
          completedTasksCount: 5,
          totalPomodorosCount: 8,
          sapoCompleted: true,
          reflection1: "Riskei o 'Sapo do Dia' logo antes das 11h, o que trouxe imensa leveza.",
          reflection2: "Excesso de tempo sentado causou incômodo muscular e dispersão no fim.",
          reflection3: "Fazer pausas ativas de alongamento a cada ciclo Pomodoro concluído.",
          createdAt: new Date().toISOString()
        }
      ];
      setLogs(seedLogs);
      localStorage.setItem("flowmind_logs", JSON.stringify(seedLogs));
    }
  }, []);

  // BACKGROUND TIMER THREAD LOOP EFFECT
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    if (timerActive) {
      interval = setInterval(() => {
        setTimerSeconds(prev => {
          if (prev <= 1) {
            // Timer expired! Toggle mode or complete
            if (!isBreakMode) {
              // Focus completed: increment cycle on active task
              setCompletedCycles(c => c + 1);
              if (activeFocusTask) {
                const updatedTasks = tasks.map(t => {
                  if (t.id === activeFocusTask.id) {
                    const nextPomos = t.completedPomodoros + 1;
                    return { ...t, completedPomodoros: nextPomos };
                  }
                  return t;
                });
                setTasks(updatedTasks);
                localStorage.setItem("flowmind_tasks", JSON.stringify(updatedTasks));

                // Also update the active task reference to show live counters
                setActiveFocusTask(prevTask => prevTask ? { ...prevTask, completedPomodoros: prevTask.completedPomodoros + 1 } : null);
              }

              // Trigger break
              setIsBreakMode(true);
              return 5 * 60; // 5 minute pause
            } else {
              // Break finished: resume focus
              setIsBreakMode(false);
              return 25 * 60; // 25 minute focus
            }
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (interval) clearInterval(interval);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [timerActive, isBreakMode, activeFocusTask, tasks]);

  // STATE HELPERS & TRIGGERS

  // Task operators
  const handleAddTask = (partialTask: Partial<Task>) => {
    const newTask: Task = {
      id: `task-${Date.now()}`,
      title: partialTask.title || "Tarefa Sem Nome",
      description: partialTask.description || "",
      quadrant: partialTask.quadrant || 2,
      isSapo: partialTask.isSapo || false,
      estimatedPomodoros: partialTask.estimatedPomodoros || 2,
      completedPomodoros: 0,
      smartSubtasks: partialTask.smartSubtasks || [],
      completed: false,
      projectId: partialTask.projectId,
      createdAt: new Date().toISOString()
    };

    const updated = [newTask, ...tasks];
    setTasks(updated);
    localStorage.setItem("flowmind_tasks", JSON.stringify(updated));
  };

  const handleUpdateTask = (id: string, updates: Partial<Task>) => {
    const updated = tasks.map(t => (t.id === id ? { ...t, ...updates } : t));
    setTasks(updated);
    localStorage.setItem("flowmind_tasks", JSON.stringify(updated));

    // If the updated task is currently inside FocusMode, update it there too
    if (activeFocusTask && activeFocusTask.id === id) {
      setActiveFocusTask({ ...activeFocusTask, ...updates });
    }
  };

  const handleDeleteTask = (id: string) => {
    const updated = tasks.filter(t => t.id !== id);
    setTasks(updated);
    localStorage.setItem("flowmind_tasks", JSON.stringify(updated));
  };

  // SMART Metas operators
  const handleAddMeta = (partialMeta: Partial<SMARTMeta>) => {
    const newMeta: SMARTMeta = {
      id: `meta-${Date.now()}`,
      title: partialMeta.title || "Nova Meta",
      description: partialMeta.description || "",
      targetDate: partialMeta.targetDate || new Date().toISOString().split("T")[0],
      specific: partialMeta.specific || "",
      measurable: partialMeta.measurable || "",
      achievable: partialMeta.achievable || "",
      relevant: partialMeta.relevant || "",
      timeBound: partialMeta.timeBound || "",
      completed: false
    };

    const updated = [newMeta, ...metas];
    setMetas(updated);
    localStorage.setItem("flowmind_metas", JSON.stringify(updated));
  };

  const handleDeleteMeta = (id: string) => {
    const updated = metas.filter(m => m.id !== id);
    setMetas(updated);
    localStorage.setItem("flowmind_metas", JSON.stringify(updated));

    // Delete project references of deleted meta
    const updatedProj = projects.filter(p => p.metaId !== id);
    setProjects(updatedProj);
    localStorage.setItem("flowmind_projects", JSON.stringify(updatedProj));
  };

  const handleUpdateMeta = (id: string, updates: Partial<SMARTMeta>) => {
    const updated = metas.map(m => (m.id === id ? { ...m, ...updates } : m));
    setMetas(updated);
    localStorage.setItem("flowmind_metas", JSON.stringify(updated));
  };

  // Projects operators
  const handleAddProject = (partialProj: Partial<Project>) => {
    const newProj: Project = {
      id: `proj-${Date.now()}`,
      title: partialProj.title || "Novo Projeto",
      description: partialProj.description || "",
      metaId: partialProj.metaId || "",
      color: partialProj.color || "#3b82f6"
    };

    const updated = [...projects, newProj];
    setProjects(updated);
    localStorage.setItem("flowmind_projects", JSON.stringify(updated));
  };

  const handleDeleteProject = (id: string) => {
    const updated = projects.filter(p => p.id !== id);
    setProjects(updated);
    localStorage.setItem("flowmind_projects", JSON.stringify(updated));
  };

  // Ledger entries operators
  const handleAddLog = (partialLog: Partial<ProductivityLogEntry>) => {
    const newLog: ProductivityLogEntry = {
      id: `log-${Date.now()}`,
      date: partialLog.date || new Date().toISOString().split("T")[0],
      completedTasksCount: partialLog.completedTasksCount || 0,
      totalPomodorosCount: partialLog.totalPomodorosCount || 0,
      sapoCompleted: partialLog.sapoCompleted || false,
      reflection1: partialLog.reflection1 || "",
      reflection2: partialLog.reflection2 || "",
      reflection3: partialLog.reflection3 || "",
      createdAt: new Date().toISOString()
    };

    const updated = [newLog, ...logs];
    setLogs(updated);
    localStorage.setItem("flowmind_logs", JSON.stringify(updated));
  };

  // Focus Timer controls
  const handleOpenFocusMode = (task: Task) => {
    setActiveFocusTask(task);
    setTimerSeconds(25 * 60);
    setIsBreakMode(false);
    setTimerActive(true);
  };

  const handleToggleTimer = () => {
    setTimerActive(!timerActive);
  };

  const handleResetTimer = () => {
    setTimerSeconds(isBreakMode ? 5 * 60 : 25 * 60);
    setTimerActive(false);
  };

  const handleSkipTimer = () => {
    if (!isBreakMode) {
      setIsBreakMode(true);
      setTimerSeconds(5 * 60);
    } else {
      setIsBreakMode(false);
      setTimerSeconds(25 * 60);
    }
    setTimerActive(false);
  };

  const handleToggleSubtask = (taskId: string, subtaskId: string, completed: boolean) => {
    const updatedTasks = tasks.map(t => {
      if (t.id === taskId) {
        const nextSubs = t.smartSubtasks.map(sub => (sub.id === subtaskId ? { ...sub, completed } : sub));
        return { ...t, smartSubtasks: nextSubs };
      }
      return t;
    });

    setTasks(updatedTasks);
    localStorage.setItem("flowmind_tasks", JSON.stringify(updatedTasks));

    // Live update inside Focus Mode overlay if active
    if (activeFocusTask && activeFocusTask.id === taskId) {
      const nextSubs = activeFocusTask.smartSubtasks.map(sub => (sub.id === subtaskId ? { ...sub, completed } : sub));
      setActiveFocusTask({ ...activeFocusTask, smartSubtasks: nextSubs });
    }
  };

  // Conversational AI Coach integration
  const handleSendMessageToCoach = async (content: string) => {
    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}-user`,
      role: "user",
      content,
      createdAt: new Date().toISOString()
    };

    const nextHistory = [...chatHistory, userMsg];
    setChatHistory(nextHistory);
    setIsGeneratingCoach(true);

    try {
      const res = await fetch("/api/gemini/coach", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: nextHistory })
      });

      if (!res.ok) {
        throw new Error("Erro de comunicação com o Coach de IA.");
      }

      const data = await res.json();
      const assistantMsg: ChatMessage = {
        id: `msg-${Date.now()}-assistant`,
        role: "assistant",
        content: data.text || "Estou refletindo sobre o que você disse. Como coach local, recomendo darmos foco absoluto ao seu Sapo de hoje!",
        createdAt: new Date().toISOString()
      };

      setChatHistory(prev => [...prev, assistantMsg]);
    } catch (err: any) {
      console.error(err);
      const errorMsg: ChatMessage = {
        id: `msg-${Date.now()}-err`,
        role: "assistant",
        content: "Oops! Não consegui me conectar com a mente da IA neste momento. Recomendo respirar fundo por 10 segundos e recomeçar seu timer Pomodoro focado!",
        createdAt: new Date().toISOString()
      };
      setChatHistory(prev => [...prev, errorMsg]);
    } finally {
      setIsGeneratingCoach(false);
    }
  };

  // Check if there is an active Sapo today to show on top header as helper focus item
  const activeSapo = tasks.find(t => t.isSapo && !t.completed);

  return (
    <div className="min-h-screen bg-[#09090b] text-zinc-100 flex flex-col md:flex-row font-sans" id="flowmind-cockpit">
      
      {/* SIDEBAR NAVIGATION (LEFT) */}
      <aside className="w-full md:w-64 bg-[#0c0c0e] border-b md:border-b-0 md:border-r border-[#27272a] p-5 flex flex-col justify-between shrink-0 select-none">
        <div className="space-y-7">
          {/* Brand Logo */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-900/30">
              <Flame className="w-5 h-5 text-white fill-white/10" />
            </div>
            <div>
              <span className="font-display font-bold text-white text-base tracking-tight block">FlowMind</span>
              <span className="text-[10px] font-mono text-blue-500 font-semibold leading-none tracking-wider uppercase">Cockpit Diário</span>
            </div>
          </div>

          {/* Quick Stats overview inside Sidebar */}
          {activeSapo && (
            <div 
              onClick={() => handleOpenFocusMode(activeSapo)}
              className="p-3 bg-emerald-950/10 border border-emerald-500/30 rounded-xl cursor-pointer hover:bg-emerald-950/20 transition-all flex items-center gap-2.5 animate-fade-in"
              title="Iniciar foco do Sapo"
            >
              <div className="w-2 h-2 rounded-full bg-emerald-400 sapo-pulse shrink-0" />
              <div className="min-w-0">
                <span className="text-[10px] font-mono font-bold text-emerald-400 uppercase tracking-wide block leading-none">Sapo Ativo</span>
                <span className="text-xs text-zinc-200 block truncate mt-1 font-medium">{activeSapo.title}</span>
              </div>
            </div>
          )}

          {/* Nav Items */}
          <nav className="space-y-1.5" id="sidebar-navigation">
            <button
              onClick={() => setActiveTab("inbox")}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === "inbox" 
                  ? "bg-blue-600 text-white font-bold shadow-lg shadow-blue-900/20" 
                  : "text-zinc-400 hover:bg-[#18181b] hover:text-zinc-200"
              }`}
            >
              <Compass className="w-4.5 h-4.5" />
              Smart Inbox & Triagem
            </button>

            <button
              onClick={() => setActiveTab("calendar")}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === "calendar" 
                  ? "bg-blue-600 text-white font-bold shadow-lg shadow-blue-900/20" 
                  : "text-zinc-400 hover:bg-[#18181b] hover:text-zinc-200"
              }`}
            >
              <Calendar className="w-4.5 h-4.5" />
              Calendário e Bloques
            </button>

            <button
              onClick={() => setActiveTab("goals")}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === "goals" 
                  ? "bg-blue-600 text-white font-bold shadow-lg shadow-blue-900/20" 
                  : "text-zinc-400 hover:bg-[#18181b] hover:text-zinc-200"
              }`}
            >
              <Target className="w-4.5 h-4.5" />
              Metas SMART & Mapa
            </button>

            <button
              onClick={() => setActiveTab("analytics")}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === "analytics" 
                  ? "bg-blue-600 text-white font-bold shadow-lg shadow-blue-900/20" 
                  : "text-zinc-400 hover:bg-[#18181b] hover:text-zinc-200"
              }`}
            >
              <BookOpen className="w-4.5 h-4.5" />
              Reflexão e Ledger
            </button>

            <button
              onClick={() => setActiveTab("coach")}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === "coach" 
                  ? "bg-blue-600 text-white font-bold shadow-lg shadow-blue-900/20" 
                  : "text-zinc-400 hover:bg-[#18181b] hover:text-zinc-200"
              }`}
            >
              <Bot className="w-4.5 h-4.5" />
              IA Mentor (Coach)
            </button>
          </nav>
        </div>

        {/* Global persistent Pomodoro widget in sidebar */}
        {timerActive && activeFocusTask && (
          <div 
            onClick={() => setActiveFocusTask(activeFocusTask)}
            className="p-3 bg-zinc-900 border border-zinc-800 rounded-xl cursor-pointer hover:border-zinc-700 transition-all mt-4 animate-fade-in"
          >
            <div className="flex justify-between items-center text-[10px] text-zinc-500 font-mono">
              <span className="flex items-center gap-1">
                <Volume2 className="w-3.5 h-3.5 text-blue-400" /> Timer Ativo
              </span>
              <span>
                {Math.floor(timerSeconds / 60)}m
              </span>
            </div>
            <span className="text-[11px] font-semibold text-zinc-200 block truncate mt-1 leading-tight">
              {activeFocusTask.title}
            </span>
          </div>
        )}
      </aside>

      {/* CENTRAL AREA (WORKSPACE) */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden bg-[#09090b]">
        
        {/* TOP STATUS BAR */}
        <header className="h-16 border-b border-[#27272a] flex items-center justify-between px-6 bg-[#0c0c0e]/80 backdrop-blur shrink-0">
          <div className="flex items-center gap-4">
            <h1 className="text-sm font-semibold tracking-tight text-white flex items-center">
              FlowMind <span className="text-zinc-500 font-normal ml-2">/ Cockpit Diário</span>
            </h1>
            <div className="h-4 w-px bg-zinc-800"></div>
            <p className="text-xs text-zinc-400 font-medium">
              {new Date().toLocaleDateString("pt-BR", { weekday: 'long', day: 'numeric', month: 'long' })}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-1 bg-[#18181b] rounded-full border border-[#27272a]">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
              <span className="text-[10px] font-medium text-zinc-300">Workspace Sincronizado</span>
            </div>
            <button
              onClick={() => {
                const target = tasks.find(t => !t.completed) || tasks[0];
                if (target) {
                  handleOpenFocusMode(target);
                }
              }}
              className="px-4 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-lg transition-all shadow-lg shadow-blue-900/20 flex items-center gap-1.5"
            >
              <Play className="w-3 h-3 fill-current" />
              Iniciar Ciclo Focus
            </button>
          </div>
        </header>

        {/* ACTIVE MODULE CONTAINER */}
        <div className="flex-1 overflow-y-auto p-5 md:p-8 space-y-6">
          {activeTab === "inbox" && (
            <InboxView 
              tasks={tasks}
              projects={projects}
              onAddTask={handleAddTask}
              onUpdateTask={handleUpdateTask}
              onDeleteTask={handleDeleteTask}
            />
          )}

          {activeTab === "calendar" && (
            <CalendarView 
              tasks={tasks}
              projects={projects}
              onUpdateTask={handleUpdateTask}
              onOpenFocus={handleOpenFocusMode}
            />
          )}

          {activeTab === "goals" && (
            <GoalsView 
              metas={metas}
              projects={projects}
              tasks={tasks}
              onAddMeta={handleAddMeta}
              onDeleteMeta={handleDeleteMeta}
              onUpdateMeta={handleUpdateMeta}
              onAddProject={handleAddProject}
              onDeleteProject={handleDeleteProject}
            />
          )}

          {activeTab === "analytics" && (
            <AnalyticsView 
              tasks={tasks}
              logs={logs}
              onAddLog={handleAddLog}
            />
          )}

          {activeTab === "coach" && (
            <AICoach 
              chatHistory={chatHistory}
              onSendMessage={handleSendMessageToCoach}
              isGenerating={isGeneratingCoach}
            />
          )}
        </div>

        {/* BOTTOM CONTEXT BAR */}
        <footer className="h-12 border-t border-[#27272a] bg-[#0c0c0e] px-6 flex items-center justify-between shrink-0 select-none">
          <div className="flex gap-6 items-center">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-blue-500"></span>
              <span className="text-[10px] text-zinc-400 font-medium uppercase tracking-wider">
                Eisenhower: {tasks.filter(t => !t.completed).length} Tarefas Ativas
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              <span className="text-[10px] text-zinc-400 font-medium uppercase tracking-wider">
                {activeSapo ? "Sapo do Dia Ativo" : "Nenhum Sapo Definido"}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-4 text-[10px] text-zinc-500 font-mono">
            <span>FlowMind v1.0</span>
            <span>Estilo Profissional Polido</span>
          </div>
        </footer>
      </div>

      {/* POMODORO ACTIVE FocusMode COVER (OVERLAY ON DEMAND) */}
      {activeFocusTask && (
        <FocusMode 
          task={activeFocusTask}
          timerSeconds={timerSeconds}
          timerActive={timerActive}
          isBreakMode={isBreakMode}
          completedCycles={completedCycles}
          onToggleTimer={handleToggleTimer}
          onResetTimer={handleResetTimer}
          onSkipTimer={handleSkipTimer}
          onToggleSubtask={handleToggleSubtask}
          onClose={() => setActiveFocusTask(null)}
        />
      )}

    </div>
  );
}
