import React, { useState } from "react";
import { Task, Project } from "../types";
import { 
  Plus, 
  Sparkles, 
  Trash2, 
  Check, 
  CheckSquare, 
  Square, 
  Clock, 
  Flame, 
  HelpCircle, 
  AlertCircle, 
  Compass, 
  Target, 
  X, 
  Star,
  CornerDownRight
} from "lucide-react";

interface InboxViewProps {
  tasks: Task[];
  projects: Project[];
  onAddTask: (task: Partial<Task>) => void;
  onUpdateTask: (id: string, updates: Partial<Task>) => void;
  onDeleteTask: (id: string) => void;
}

export default function InboxView({
  tasks,
  projects,
  onAddTask,
  onUpdateTask,
  onDeleteTask
}: InboxViewProps) {
  // Manual Task form state
  const [newTitle, setNewTitle] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [newQuadrant, setNewQuadrant] = useState<1 | 2 | 3 | 4>(2);
  const [newEstimated, setNewEstimated] = useState(2);
  const [selectedProj, setSelectedProj] = useState("");

  // Brain Dump state
  const [brainDumpText, setBrainDumpText] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiAnalysisResults, setAiAnalysisResults] = useState<Task[] | null>(null);
  const [aiError, setAiError] = useState<string | null>(null);

  // Active Eisenhower / Ivy Lee Tab filter
  const [viewMode, setViewMode] = useState<"all" | "matrix" | "ivylee">("all");

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    onAddTask({
      title: newTitle.trim(),
      description: newDesc.trim(),
      quadrant: newQuadrant,
      estimatedPomodoros: newEstimated,
      projectId: selectedProj || undefined,
      smartSubtasks: []
    });

    setNewTitle("");
    setNewDesc("");
    setNewQuadrant(2);
    setNewEstimated(2);
    setSelectedProj("");
  };

  const handleAiAnalysis = async () => {
    if (!brainDumpText.trim()) return;
    setIsAnalyzing(true);
    setAiError(null);
    setAiAnalysisResults(null);

    try {
      const res = await fetch("/api/gemini/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rawText: brainDumpText })
      });

      if (!res.ok) {
        throw new Error("Falha ao analisar ideias com IA.");
      }

      const data = await res.json();
      if (data.tasks) {
        // Map the incoming structure into local Task objects
        const formatted: Task[] = data.tasks.map((t: any, index: number) => ({
          id: `ai-${Date.now()}-${index}`,
          title: t.title,
          description: t.description,
          quadrant: t.quadrant,
          isSapo: t.isSapo || false,
          estimatedPomodoros: t.estimatedPomodoros || 2,
          completedPomodoros: 0,
          completed: false,
          smartSubtasks: (t.smartSubtasks || []).map((sub: string, subIndex: number) => ({
            id: `sub-${Date.now()}-${index}-${subIndex}`,
            title: sub,
            completed: false
          })),
          createdAt: new Date().toISOString()
        }));
        setAiAnalysisResults(formatted);
      } else {
        throw new Error("A IA não retornou um formato de tarefas válido.");
      }
    } catch (err: any) {
      console.error(err);
      setAiError(err.message || "Houve um erro ao processar. Tente novamente.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleImportAiTasks = () => {
    if (!aiAnalysisResults) return;
    aiAnalysisResults.forEach(task => {
      onAddTask({
        title: task.title,
        description: task.description,
        quadrant: task.quadrant,
        isSapo: task.isSapo,
        estimatedPomodoros: task.estimatedPomodoros,
        smartSubtasks: task.smartSubtasks
      });
    });
    setAiAnalysisResults(null);
    setBrainDumpText("");
  };

  // Toggle Sapo do Dia: sets isSapo to true and resets other tasks' isSapo
  const toggleSapo = (id: string, currentVal: boolean) => {
    if (!currentVal) {
      // De-select any other active Sapo first, to obey the one-active-sapo rule
      tasks.forEach(t => {
        if (t.isSapo && t.id !== id) {
          onUpdateTask(t.id, { isSapo: false });
        }
      });
    }
    onUpdateTask(id, { isSapo: !currentVal });
  };

  // Helper to categorize tasks
  const q1Tasks = tasks.filter(t => t.quadrant === 1);
  const q2Tasks = tasks.filter(t => t.quadrant === 2);
  const q3Tasks = tasks.filter(t => t.quadrant === 3);
  const q4Tasks = tasks.filter(t => t.quadrant === 4);

  // Ivy Lee method: max 6 crucial tasks. Filter the active task list for tasks that are prioritized
  // We can treat any task with an active sequence/flag or just flag them manually. Let's list the top 6 uncompleted tasks as Ivy Lee candidates!
  const ivyLeeTasks = tasks.filter(t => !t.completed).slice(0, 6);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6" id="inbox-section">
      {/* LEFT PANEL: INPUTS AND BRAIN DUMP (5 Columns) */}
      <div className="lg:col-span-5 space-y-6">
        
        {/* Brain Dump IA */}
        <div className="bg-[#121214] border border-[#222226] rounded-xl p-5" id="brain-dump-box">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-display font-semibold text-base text-white flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-emerald-400" />
              Brain Dump por IA
            </h3>
            <span className="text-xs font-mono bg-zinc-800 text-zinc-400 px-2 py-0.5 rounded-full">
              Gemini 3.5
            </span>
          </div>
          <p className="text-xs text-zinc-400 mb-4 leading-relaxed">
            Cole ideias caóticas, notas de reuniões ou e-mails longos. A IA extrairá as tarefas acionáveis, estimará pomodoros, dividirá em metas SMART e definirá as prioridades.
          </p>
          <textarea
            value={brainDumpText}
            onChange={(e) => setBrainDumpText(e.target.value)}
            placeholder="Ex: 'Preciso preparar a apresentação de amanhã para o investidor, e também lembrar de responder o email do Carlos que está cobrando. Quero arrumar meus downloads do computador que está cheio e de noite correr 5km...'"
            className="w-full h-36 bg-[#18181b] border border-zinc-800 rounded-lg p-3 text-sm text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-emerald-500 transition-colors resize-none"
            id="brain-dump-textarea"
          />
          <div className="flex justify-end mt-3">
            <button
              onClick={handleAiAnalysis}
              disabled={isAnalyzing || !brainDumpText.trim()}
              className={`flex items-center gap-2 text-xs font-medium px-4 py-2 rounded-lg transition-all ${
                isAnalyzing || !brainDumpText.trim()
                  ? "bg-zinc-800 text-zinc-500 cursor-not-allowed"
                  : "bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-md shadow-emerald-950/20"
              }`}
              id="ai-analyze-btn"
            >
              {isAnalyzing ? (
                <>
                  <div className="w-4.5 h-4.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Analisando pensamentos...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  Organizar com IA
                </>
              )}
            </button>
          </div>

          {/* AI ERROR */}
          {aiError && (
            <div className="mt-4 p-3 bg-red-950/30 border border-red-800/40 rounded-lg flex gap-2 items-start text-xs text-red-400 animate-fade-in">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{aiError}</span>
            </div>
          )}

          {/* AI ANALYSIS PREVIEW */}
          {aiAnalysisResults && (
            <div className="mt-4 p-4 bg-[#18181b] border border-zinc-800 rounded-lg space-y-3 animate-fade-in">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-emerald-400 flex items-center gap-1.5">
                  <CheckSquare className="w-4 h-4" />
                  {aiAnalysisResults.length} Tarefas Identificadas
                </span>
                <button 
                  onClick={() => setAiAnalysisResults(null)}
                  className="text-zinc-500 hover:text-zinc-300"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="max-h-60 overflow-y-auto space-y-2.5 pr-1">
                {aiAnalysisResults.map((t, idx) => (
                  <div key={idx} className="p-2.5 bg-zinc-900/60 border border-zinc-800/50 rounded-md">
                    <div className="flex items-start justify-between gap-2">
                      <span className="text-xs font-medium text-white block leading-tight">{t.title}</span>
                      <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded shrink-0 ${
                        t.quadrant === 1 ? "bg-red-950/40 text-red-400 border border-red-800/20" :
                        t.quadrant === 2 ? "bg-blue-950/40 text-blue-400 border border-blue-800/20" :
                        t.quadrant === 3 ? "bg-amber-950/40 text-amber-400 border border-amber-800/20" :
                        "bg-zinc-800 text-zinc-400"
                      }`}>
                        Q{t.quadrant}
                      </span>
                    </div>
                    {t.isSapo && (
                      <span className="inline-flex items-center gap-1 text-[10px] bg-emerald-950/40 text-emerald-400 px-1.5 py-0.5 rounded border border-emerald-800/20 mt-1 font-mono">
                        🐸 Sapo do Dia
                      </span>
                    )}
                    {t.smartSubtasks.length > 0 && (
                      <div className="mt-1.5 pl-2 border-l border-zinc-800 space-y-1">
                        {t.smartSubtasks.map((sub, sIdx) => (
                          <div key={sIdx} className="text-[10px] text-zinc-500 flex items-center gap-1">
                            <CornerDownRight className="w-3 h-3 shrink-0" />
                            <span>{sub.title}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
              <button
                onClick={handleImportAiTasks}
                className="w-full text-center bg-emerald-500 hover:bg-emerald-400 text-zinc-950 text-xs font-semibold py-2 rounded-lg transition-colors mt-2"
                id="import-ai-tasks-btn"
              >
                Importar Tarefas para Inbox
              </button>
            </div>
          )}
        </div>

        {/* Manual Task Creator */}
        <div className="bg-[#121214] border border-[#222226] rounded-xl p-5" id="manual-creator-box">
          <h3 className="font-display font-semibold text-base text-white flex items-center gap-2 mb-4">
            <Plus className="w-5 h-5 text-emerald-400" />
            Nova Tarefa Manual
          </h3>
          <form onSubmit={handleManualSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-zinc-400 mb-1">Título</label>
              <input
                type="text"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="Ex: Revisar modelo financeiro"
                className="w-full bg-[#18181b] border border-zinc-800 rounded-lg px-3 py-2 text-sm text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-emerald-500 transition-colors"
                required
                id="task-title-input"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-400 mb-1">Descrição (Opcional)</label>
              <input
                type="text"
                value={newDesc}
                onChange={(e) => setNewDesc(e.target.value)}
                placeholder="Breve resumo das ações..."
                className="w-full bg-[#18181b] border border-zinc-800 rounded-lg px-3 py-2 text-sm text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-emerald-500 transition-colors"
                id="task-desc-input"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-zinc-400 mb-1">Quadrante (Eisenhower)</label>
                <select
                  value={newQuadrant}
                  onChange={(e) => setNewQuadrant(Number(e.target.value) as any)}
                  className="w-full bg-[#18181b] border border-zinc-800 rounded-lg px-2 py-2 text-xs text-zinc-300 focus:outline-none focus:border-emerald-500"
                  id="task-quadrant-select"
                >
                  <option value="1">💥 Q1 - Urgente e Importante</option>
                  <option value="2">🎯 Q2 - Foco e Estratégia</option>
                  <option value="3">⚡ Q3 - Urgente, Não Importante</option>
                  <option value="4">☕ Q4 - Não Urgente/Importante</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-400 mb-1">Estimativa de Pomodoros</label>
                <select
                  value={newEstimated}
                  onChange={(e) => setNewEstimated(Number(e.target.value))}
                  className="w-full bg-[#18181b] border border-zinc-800 rounded-lg px-2 py-2 text-xs text-zinc-300 focus:outline-none focus:border-emerald-500"
                  id="task-pomodoros-select"
                >
                  <option value="1">1 bloco (25 min)</option>
                  <option value="2">2 blocos (50 min)</option>
                  <option value="3">3 blocos (75 min)</option>
                  <option value="4">4 blocos (100 min)</option>
                  <option value="6">6 blocos (150 min)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-400 mb-1">Projeto Associado (Opcional)</label>
              <select
                value={selectedProj}
                onChange={(e) => setSelectedProj(e.target.value)}
                className="w-full bg-[#18181b] border border-zinc-800 rounded-lg px-2.5 py-2 text-xs text-zinc-300 focus:outline-none focus:border-emerald-500"
                id="task-project-select"
              >
                <option value="">Sem Projeto (Tarefa Avulsa)</option>
                {projects.map(p => (
                  <option key={p.id} value={p.id}>{p.title}</option>
                ))}
              </select>
            </div>

            <button
              type="submit"
              className="w-full bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-white font-medium text-xs py-2 rounded-lg transition-colors flex items-center justify-center gap-1.5"
              id="save-task-btn"
            >
              <Plus className="w-4 h-4" />
              Adicionar à Inbox
            </button>
          </form>
        </div>
      </div>

      {/* RIGHT PANEL: LIST VIEWS & EISENHOWER GRID (7 Columns) */}
      <div className="lg:col-span-7 space-y-6">
        <div className="bg-[#121214] border border-[#222226] rounded-xl p-5" id="tasks-list-panel">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-850 pb-4 mb-4">
            <div>
              <h3 className="font-display font-semibold text-lg text-white">Triagem & Inbox</h3>
              <p className="text-xs text-zinc-500">Mapeie, defina sapos e organize prioridades.</p>
            </div>

            {/* View selectors */}
            <div className="flex bg-zinc-900/60 p-1 rounded-lg border border-zinc-800 text-xs font-medium" id="view-mode-tabs">
              <button
                onClick={() => setViewMode("all")}
                className={`px-3 py-1.5 rounded-md transition-all ${
                  viewMode === "all" ? "bg-zinc-800 text-white" : "text-zinc-400 hover:text-white"
                }`}
              >
                Lista Total
              </button>
              <button
                onClick={() => setViewMode("matrix")}
                className={`px-3 py-1.5 rounded-md transition-all ${
                  viewMode === "matrix" ? "bg-zinc-800 text-white" : "text-zinc-400 hover:text-white"
                }`}
              >
                Matriz Eisenhower
              </button>
              <button
                onClick={() => setViewMode("ivylee")}
                className={`px-3 py-1.5 rounded-md transition-all ${
                  viewMode === "ivylee" ? "bg-zinc-800 text-white" : "text-zinc-400 hover:text-white"
                }`}
              >
                Método Ivy Lee (6)
              </button>
            </div>
          </div>

          {/* VIEW: ALL TASKS LIST */}
          {viewMode === "all" && (
            <div className="space-y-3" id="all-tasks-list">
              {tasks.length === 0 ? (
                <div className="text-center py-12 text-zinc-500 space-y-2">
                  <Compass className="w-10 h-10 text-zinc-700 mx-auto" />
                  <p className="font-medium text-sm">Sua Inbox está limpa!</p>
                  <p className="text-xs text-zinc-600">Mente vazia, foco absoluto. Use a IA acima para descarregar pensamentos.</p>
                </div>
              ) : (
                <div className="space-y-2.5 max-h-[580px] overflow-y-auto pr-1">
                  {tasks.map(t => (
                    <TaskRow 
                      key={t.id} 
                      task={t} 
                      projects={projects}
                      onUpdateTask={onUpdateTask}
                      onDeleteTask={onDeleteTask}
                      onToggleSapo={toggleSapo}
                    />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* VIEW: EISENHOWER GRID */}
          {viewMode === "matrix" && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4" id="eisenhower-matrix-grid">
              
              {/* Q1: Urgent & Important */}
              <div className="bg-[#18181b] border border-red-950/40 rounded-xl p-4 space-y-3">
                <div className="flex items-center justify-between border-b border-red-900/10 pb-2">
                  <span className="text-xs font-display font-semibold text-red-400 flex items-center gap-1.5">
                    <Flame className="w-4 h-4 text-red-500" />
                    Q1: Crise (Urgente & Importante)
                  </span>
                  <span className="text-[10px] font-mono bg-red-950/30 text-red-400 px-2 py-0.5 rounded border border-red-900/20">
                    {q1Tasks.length}
                  </span>
                </div>
                <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
                  {q1Tasks.length === 0 ? (
                    <p className="text-[10px] text-zinc-600 italic py-2">Sem crises ativas hoje.</p>
                  ) : (
                    q1Tasks.map(t => (
                      <TaskCardMinimal key={t.id} task={t} onToggleComplete={(c) => onUpdateTask(t.id, { completed: c })} />
                    ))
                  )}
                </div>
              </div>

              {/* Q2: Important, Not Urgent */}
              <div className="bg-[#18181b] border border-blue-950/40 rounded-xl p-4 space-y-3">
                <div className="flex items-center justify-between border-b border-blue-900/10 pb-2">
                  <span className="text-xs font-display font-semibold text-blue-400 flex items-center gap-1.5">
                    <Target className="w-4 h-4 text-blue-500" />
                    Q2: Estratégico (Importante, Não Urgente)
                  </span>
                  <span className="text-[10px] font-mono bg-blue-950/30 text-blue-400 px-2 py-0.5 rounded border border-blue-900/20">
                    {q2Tasks.length}
                  </span>
                </div>
                <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
                  {q2Tasks.length === 0 ? (
                    <p className="text-[10px] text-zinc-600 italic py-2">Nenhum foco estratégico pendente.</p>
                  ) : (
                    q2Tasks.map(t => (
                      <TaskCardMinimal key={t.id} task={t} onToggleComplete={(c) => onUpdateTask(t.id, { completed: c })} />
                    ))
                  )}
                </div>
              </div>

              {/* Q3: Urgent, Not Important */}
              <div className="bg-[#18181b] border border-amber-950/40 rounded-xl p-4 space-y-3">
                <div className="flex items-center justify-between border-b border-amber-900/10 pb-2">
                  <span className="text-xs font-display font-semibold text-amber-400 flex items-center gap-1.5">
                    <AlertCircle className="w-4 h-4 text-amber-500" />
                    Q3: Delegar (Urgente, Não Importante)
                  </span>
                  <span className="text-[10px] font-mono bg-amber-950/30 text-amber-400 px-2 py-0.5 rounded border border-amber-900/20">
                    {q3Tasks.length}
                  </span>
                </div>
                <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
                  {q3Tasks.length === 0 ? (
                    <p className="text-[10px] text-zinc-600 italic py-2">Sem interrupções urgentes.</p>
                  ) : (
                    q3Tasks.map(t => (
                      <TaskCardMinimal key={t.id} task={t} onToggleComplete={(c) => onUpdateTask(t.id, { completed: c })} />
                    ))
                  )}
                </div>
              </div>

              {/* Q4: Not Urgent, Not Important */}
              <div className="bg-[#18181b] border border-zinc-800 rounded-xl p-4 space-y-3">
                <div className="flex items-center justify-between border-b border-zinc-700/30 pb-2">
                  <span className="text-xs font-display font-semibold text-zinc-400 flex items-center gap-1.5">
                    <HelpCircle className="w-4 h-4 text-zinc-500" />
                    Q4: Eliminar (Não Urgente / Importante)
                  </span>
                  <span className="text-[10px] font-mono bg-zinc-800 text-zinc-400 px-2 py-0.5 rounded">
                    {q4Tasks.length}
                  </span>
                </div>
                <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
                  {q4Tasks.length === 0 ? (
                    <p className="text-[10px] text-zinc-600 italic py-2">Inbox limpa de distrações.</p>
                  ) : (
                    q4Tasks.map(t => (
                      <TaskCardMinimal key={t.id} task={t} onToggleComplete={(c) => onUpdateTask(t.id, { completed: c })} />
                    ))
                  )}
                </div>
              </div>

            </div>
          )}

          {/* VIEW: IVY LEE (LIMIT 6) */}
          {viewMode === "ivylee" && (
            <div className="space-y-4" id="ivylee-view-panel">
              <div className="bg-[#18181b]/70 border border-zinc-800 p-4 rounded-lg">
                <h4 className="text-xs font-semibold text-zinc-300 flex items-center gap-1.5 mb-1">
                  💡 Regra de Ouro de Ivy Lee
                </h4>
                <p className="text-[11px] text-zinc-400 leading-relaxed">
                  No final de cada dia, escreva apenas as <strong>6 tarefas mais importantes</strong> para amanhã. Ao começar o dia seguinte, concentre-se exclusivamente na primeira tarefa até terminá-la antes de avançar para a segunda. Multiplica sua eficiência limitando a multitarefa!
                </p>
              </div>

              <div className="space-y-2.5 max-h-96 overflow-y-auto pr-1">
                {ivyLeeTasks.length === 0 ? (
                  <div className="text-center py-8 text-zinc-600 italic text-xs">
                    Nenhuma tarefa pendente na Inbox para criar sua lista Ivy Lee.
                  </div>
                ) : (
                  ivyLeeTasks.map((t, idx) => (
                    <div 
                      key={t.id} 
                      className={`flex items-center justify-between p-3.5 rounded-lg border transition-all ${
                        t.isSapo 
                          ? "bg-emerald-950/20 border-emerald-500/50" 
                          : "bg-[#18181b] border-zinc-800 hover:border-zinc-700"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="font-mono text-xs font-semibold bg-zinc-900 text-zinc-400 w-6 h-6 rounded-full flex items-center justify-center border border-zinc-800 shrink-0">
                          {idx + 1}
                        </span>
                        <div>
                          <span className={`text-sm font-medium ${t.isSapo ? "text-emerald-300" : "text-white"}`}>
                            {t.title}
                          </span>
                          <span className="text-[10px] text-zinc-500 block">
                            Pomodoros Estimados: {t.estimatedPomodoros} | Quadrante: Q{t.quadrant}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {t.isSapo && (
                          <span className="text-[9px] font-mono bg-emerald-500 text-zinc-950 font-semibold px-2 py-0.5 rounded uppercase">
                            Sapo
                          </span>
                        )}
                        <button
                          onClick={() => onUpdateTask(t.id, { completed: true })}
                          className="bg-emerald-600 hover:bg-emerald-500 text-zinc-950 p-1.5 rounded-md transition-colors"
                          title="Concluir tarefa"
                        >
                          <Check className="w-3.5 h-3.5 stroke-[3]" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}

/* SUBCOMPONENT: FULL TASK ROW */
interface TaskRowProps {
  key?: string;
  task: Task;
  projects: Project[];
  onUpdateTask: (id: string, updates: Partial<Task>) => void;
  onDeleteTask: (id: string) => void;
  onToggleSapo: (id: string, currentVal: boolean) => void;
}

function TaskRow({
  task,
  projects,
  onUpdateTask,
  onDeleteTask,
  onToggleSapo
}: TaskRowProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedTitle, setEditedTitle] = useState(task.title);
  const [editedDesc, setEditedDesc] = useState(task.description);

  const matchedProj = projects.find(p => p.id === task.projectId);

  const handleSaveEdit = () => {
    if (!editedTitle.trim()) return;
    onUpdateTask(task.id, {
      title: editedTitle.trim(),
      description: editedDesc.trim()
    });
    setIsEditing(false);
  };

  return (
    <div 
      className={`p-3.5 rounded-xl border transition-all ${
        task.completed 
          ? "bg-zinc-900/30 border-zinc-850 opacity-60" 
          : task.isSapo 
            ? "bg-emerald-950/10 border-emerald-500/40 shadow-sm shadow-emerald-950/10" 
            : "bg-[#18181b] border-zinc-800 hover:border-zinc-750"
      }`}
    >
      {isEditing ? (
        <div className="space-y-3">
          <input 
            type="text" 
            value={editedTitle} 
            onChange={(e) => setEditedTitle(e.target.value)}
            className="w-full bg-[#121214] border border-zinc-800 rounded px-2.5 py-1.5 text-sm text-zinc-100"
          />
          <input 
            type="text" 
            value={editedDesc} 
            onChange={(e) => setEditedDesc(e.target.value)}
            className="w-full bg-[#121214] border border-zinc-800 rounded px-2.5 py-1.5 text-xs text-zinc-400"
          />
          <div className="flex gap-2 justify-end">
            <button 
              onClick={() => setIsEditing(false)}
              className="px-2.5 py-1 text-xs text-zinc-400 hover:text-zinc-200"
            >
              Cancelar
            </button>
            <button 
              onClick={handleSaveEdit}
              className="bg-emerald-500 text-zinc-950 px-3 py-1 text-xs font-semibold rounded"
            >
              Salvar
            </button>
          </div>
        </div>
      ) : (
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3 min-w-0">
            {/* Checkbox */}
            <button
              onClick={() => onUpdateTask(task.id, { completed: !task.completed })}
              className="mt-0.5 text-zinc-500 hover:text-emerald-400 shrink-0 transition-colors"
            >
              {task.completed ? (
                <CheckSquare className="w-4.5 h-4.5 text-emerald-500" />
              ) : (
                <Square className="w-4.5 h-4.5" />
              )}
            </button>

            {/* Task Content */}
            <div className="min-w-0">
              <span 
                className={`text-sm font-medium block leading-snug ${
                  task.completed ? "line-through text-zinc-600" : "text-zinc-100"
                }`}
              >
                {task.title}
              </span>
              
              {task.description && (
                <p className="text-xs text-zinc-500 mt-0.5 line-clamp-2 leading-relaxed">
                  {task.description}
                </p>
              )}

              <div className="flex flex-wrap items-center gap-2 mt-2">
                {/* Quadrant Badge */}
                <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded border ${
                  task.quadrant === 1 ? "bg-red-950/20 text-red-400 border-red-900/30" :
                  task.quadrant === 2 ? "bg-blue-950/20 text-blue-400 border-blue-900/30" :
                  task.quadrant === 3 ? "bg-amber-950/20 text-amber-400 border-amber-900/30" :
                  "bg-zinc-800 text-zinc-400 border-zinc-700/30"
                }`}>
                  Q{task.quadrant}
                </span>

                {/* Project Badge */}
                {matchedProj && (
                  <span 
                    className="text-[9px] px-1.5 py-0.5 rounded font-medium border"
                    style={{ backgroundColor: `${matchedProj.color}15`, borderColor: `${matchedProj.color}30`, color: matchedProj.color }}
                  >
                    {matchedProj.title}
                  </span>
                )}

                {/* Pomodoros counter */}
                <span className="text-[10px] text-zinc-500 flex items-center gap-1 font-mono">
                  <Clock className="w-3 h-3 text-zinc-600" />
                  {task.completedPomodoros}/{task.estimatedPomodoros} pomos
                </span>

                {/* SMART Subtask indicators if present */}
                {task.smartSubtasks && task.smartSubtasks.length > 0 && (
                  <span className="text-[9px] font-mono bg-zinc-900 text-zinc-400 px-1.5 py-0.5 rounded border border-zinc-800">
                    🎯 {task.smartSubtasks.filter(s => s.completed).length}/{task.smartSubtasks.length} submetas
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Action triggers */}
          <div className="flex items-center gap-1.5 shrink-0">
            {/* Toggle Sapo */}
            {!task.completed && (
              <button
                onClick={() => onToggleSapo(task.id, task.isSapo)}
                className={`p-1 rounded-md transition-all ${
                  task.isSapo 
                    ? "bg-emerald-950/50 border border-emerald-500/30 text-emerald-400" 
                    : "hover:bg-zinc-800 text-zinc-500 hover:text-zinc-300"
                }`}
                title={task.isSapo ? "Sapo do Dia Ativo" : "Definir como Sapo do Dia"}
              >
                <Star className={`w-3.5 h-3.5 ${task.isSapo ? "fill-emerald-400" : ""}`} />
              </button>
            )}

            {/* Edit */}
            <button
              onClick={() => setIsEditing(true)}
              className="p-1 rounded hover:bg-zinc-800 text-zinc-500 hover:text-zinc-300 transition-colors text-xs font-semibold px-1.5"
            >
              Editar
            </button>

            {/* Delete */}
            <button
              onClick={() => onDeleteTask(task.id)}
              className="p-1 rounded hover:bg-red-950/40 text-zinc-500 hover:text-red-400 transition-colors"
              title="Excluir"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

/* SUBCOMPONENT: MINIMALIST EISENHOWER CARD */
interface TaskCardMinimalProps {
  key?: string;
  task: Task;
  onToggleComplete: (completed: boolean) => void;
}

function TaskCardMinimal({ task, onToggleComplete }: TaskCardMinimalProps) {
  return (
    <div className="p-2 bg-zinc-900/40 border border-zinc-800 rounded-lg flex items-start gap-2.5">
      <button 
        onClick={() => onToggleComplete(!task.completed)}
        className="mt-0.5 text-zinc-500 hover:text-emerald-400 shrink-0"
      >
        {task.completed ? (
          <CheckSquare className="w-4 h-4 text-emerald-500" />
        ) : (
          <Square className="w-4 h-4" />
        )}
      </button>
      <div className="min-w-0 flex-1">
        <span className={`text-xs font-medium block leading-tight ${task.completed ? "line-through text-zinc-600" : "text-zinc-200"}`}>
          {task.title}
        </span>
        {task.isSapo && (
          <span className="text-[8px] font-mono bg-emerald-950 text-emerald-400 px-1 rounded uppercase mt-0.5 inline-block border border-emerald-800/30">
            Sapo
          </span>
        )}
      </div>
    </div>
  );
}
