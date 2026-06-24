import React, { useState } from "react";
import { Task, ProductivityLogEntry } from "../types";
import { 
  Download, 
  BookOpen, 
  TrendingUp, 
  Flame, 
  Award, 
  HelpCircle, 
  CheckCircle,
  Calendar,
  Sparkles,
  BarChart,
  Grid
} from "lucide-react";

interface AnalyticsViewProps {
  tasks: Task[];
  logs: ProductivityLogEntry[];
  onAddLog: (entry: Partial<ProductivityLogEntry>) => void;
}

export default function AnalyticsView({
  tasks,
  logs,
  onAddLog
}: AnalyticsViewProps) {
  // Journal prompts states
  const [reflection1, setReflection1] = useState("");
  const [reflection2, setReflection2] = useState("");
  const [reflection3, setReflection3] = useState("");
  const [journalSaved, setJournalSaved] = useState(false);

  // Stats calculation
  const completedTasks = tasks.filter(t => t.completed);
  const totalTasksCount = tasks.length;
  const sapoTasks = tasks.filter(t => t.isSapo);
  const completedSapoCount = sapoTasks.filter(t => t.completed).length;

  // Calculate total pomodoro cycles completed across all tasks
  const totalPomosDone = tasks.reduce((sum, t) => sum + t.completedPomodoros, 0);

  // Eisenhower distribution
  const q1Count = tasks.filter(t => t.quadrant === 1).length;
  const q2Count = tasks.filter(t => t.quadrant === 2).length;
  const q3Count = tasks.filter(t => t.quadrant === 3).length;
  const q4Count = tasks.filter(t => t.quadrant === 4).length;

  const handleSaveJournal = (e: React.FormEvent) => {
    e.preventDefault();
    
    onAddLog({
      date: new Date().toISOString().split("T")[0],
      completedTasksCount: completedTasks.length,
      totalPomodorosCount: totalPomosDone,
      sapoCompleted: completedSapoCount > 0,
      reflection1: reflection1.trim(),
      reflection2: reflection2.trim(),
      reflection3: reflection3.trim()
    });

    setReflection1("");
    setReflection2("");
    setReflection3("");
    setJournalSaved(true);
    setTimeout(() => setJournalSaved(false), 4000);
  };

  // Export local database to a downloadable CSV
  const handleExportCSV = () => {
    if (logs.length === 0) return;

    // Headers following PRD specification exactly
    const headers = ["Data", "Tarefas_Concluidas", "Pomodoros_Feitos", "Sapo_Concluido", "O_Que_Correu_Bem", "Onde_Perdi_Foco", "Plano_Amanha"];
    const rows = logs.map(entry => [
      entry.date,
      entry.completedTasksCount,
      entry.totalPomodorosCount,
      entry.sapoCompleted ? "Sim" : "Nao",
      `"${entry.reflection1.replace(/"/g, '""')}"`,
      `"${entry.reflection2.replace(/"/g, '""')}"`,
      `"${entry.reflection3.replace(/"/g, '""')}"`
    ]);

    const csvContent = "data:text/csv;charset=utf-8,\uFEFF" 
      + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `flowmind_productivity_log_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6" id="analytics-root">
      
      {/* LEFT: HISTORICAL PRODUCTIVITY ANALYTICS (7 Columns) */}
      <div className="lg:col-span-7 space-y-6">
        
        {/* STATS SUMMARY BOXES */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-[#121214] border border-[#222226] p-4 rounded-xl flex flex-col justify-between">
            <span className="text-[10px] font-mono text-zinc-500 uppercase">Tarefas Feitas</span>
            <span className="text-2xl font-bold font-display text-white mt-1.5">{completedTasks.length}</span>
            <span className="text-[9px] text-zinc-600 mt-1">de {totalTasksCount} cadastradas</span>
          </div>

          <div className="bg-[#121214] border border-[#222226] p-4 rounded-xl flex flex-col justify-between">
            <span className="text-[10px] font-mono text-emerald-400 uppercase">Sapo Concluído</span>
            <span className="text-2xl font-bold font-display text-emerald-400 mt-1.5">{completedSapoCount}</span>
            <span className="text-[9px] text-zinc-600 mt-1">de {sapoTasks.length} sapos ativos</span>
          </div>

          <div className="bg-[#121214] border border-[#222226] p-4 rounded-xl flex flex-col justify-between">
            <span className="text-[10px] font-mono text-amber-400 uppercase">Foco Pomodoro</span>
            <span className="text-2xl font-bold font-display text-amber-400 mt-1.5">{totalPomosDone}</span>
            <span className="text-[9px] text-zinc-600 mt-1">ciclos concluídos</span>
          </div>
        </div>

        {/* CUSTOM INTERACTIVE SVG CHART FOR HISTORICAL LOGS */}
        <div className="bg-[#121214] border border-[#222226] rounded-xl p-5 space-y-4">
          <div className="flex justify-between items-center border-b border-zinc-850 pb-3">
            <div>
              <h3 className="font-display font-semibold text-sm text-white flex items-center gap-1.5">
                <TrendingUp className="w-4 h-4 text-emerald-400" />
                Histórico de Rendimento Diário
              </h3>
              <p className="text-[10px] text-zinc-500">Mapeamento dos últimos dias com logs registrados.</p>
            </div>

            {logs.length > 0 && (
              <button
                onClick={handleExportCSV}
                className="text-[10px] bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-zinc-300 font-semibold px-2.5 py-1 rounded flex items-center gap-1 transition-colors"
                id="export-csv-btn"
              >
                <Download className="w-3 h-3" />
                Exportar CSV (Google Sheets)
              </button>
            )}
          </div>

          {logs.length === 0 ? (
            <div className="text-center py-16 text-zinc-600 space-y-2">
              <BarChart className="w-10 h-10 text-zinc-800 mx-auto" />
              <p className="text-xs font-semibold">Sem dados suficientes para gerar gráficos.</p>
              <p className="text-[10px] text-zinc-600 max-w-xs mx-auto">Salve sua primeira reflexão diária na barra lateral direita para gerar o histórico.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Responsive custom SVG line chart */}
              <div className="w-full h-44 bg-zinc-950/40 rounded-lg p-2 flex flex-col justify-between border border-zinc-850">
                <svg viewBox="0 0 400 150" className="w-full h-full overflow-visible">
                  {/* Grid Lines */}
                  <line x1="40" y1="20" x2="380" y2="20" stroke="#1d1d21" strokeWidth="1" />
                  <line x1="40" y1="60" x2="380" y2="60" stroke="#1d1d21" strokeWidth="1" />
                  <line x1="40" y1="100" x2="380" y2="100" stroke="#1d1d21" strokeWidth="1" />
                  <line x1="40" y1="130" x2="380" y2="130" stroke="#27272a" strokeWidth="1.5" />

                  {/* Draw Plot Area (Area graph underneath) */}
                  <path
                    d={`
                      M 40,130 
                      ${logs.map((e, idx) => {
                        const x = 40 + (idx * (340 / Math.max(1, logs.length - 1)));
                        const y = 130 - Math.min(100, e.completedTasksCount * 12);
                        return `L ${x},${y}`;
                      }).join(" ")}
                      L ${40 + ((logs.length - 1) * (340 / Math.max(1, logs.length - 1)))},130 Z
                    `}
                    fill="rgba(16, 185, 129, 0.05)"
                  />

                  {/* Draw Line */}
                  <path
                    d={logs.map((e, idx) => {
                      const x = 40 + (idx * (340 / Math.max(1, logs.length - 1)));
                      const y = 130 - Math.min(100, e.completedTasksCount * 12);
                      return `${idx === 0 ? "M" : "L"} ${x},${y}`;
                    }).join(" ")}
                    fill="none"
                    stroke="#10b981"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />

                  {/* Nodes & Text Labels */}
                  {logs.map((e, idx) => {
                    const x = 40 + (idx * (340 / Math.max(1, logs.length - 1)));
                    const y = 130 - Math.min(100, e.completedTasksCount * 12);

                    return (
                      <g key={idx} className="group cursor-pointer">
                        <circle cx={x} cy={y} r="4" fill="#10b981" stroke="#09090b" strokeWidth="1.5" />
                        <text x={x} y={y - 10} fill="#a1a1aa" fontSize="8" textAnchor="middle" fontFamily="monospace">
                          {e.completedTasksCount}t
                        </text>
                        {/* Dates labels */}
                        <text x={x} y="142" fill="#71717a" fontSize="8" textAnchor="middle">
                          {e.date.split("-")[2]}
                        </text>
                      </g>
                    );
                  })}
                </svg>
                <div className="flex justify-between px-6 text-[10px] text-zinc-500 font-mono">
                  <span>Eixo Y: Tarefas Completas</span>
                  <span>Eixo X: Dia do Mês</span>
                </div>
              </div>

              {/* LIST OF HISTORIC REFLECTION ENTRIES */}
              <div className="space-y-2.5 max-h-[180px] overflow-y-auto pr-1">
                <span className="text-xs font-semibold text-zinc-400 block">Dossiê de Reflexões Passadas</span>
                {logs.map((entry) => (
                  <div key={entry.id} className="p-3 bg-zinc-900/60 border border-zinc-850 rounded-xl space-y-1.5 text-xs">
                    <div className="flex justify-between items-center text-[10px] font-mono text-zinc-500">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" /> {entry.date}
                      </span>
                      <span>
                        {entry.completedTasksCount} tarefas | {entry.totalPomodorosCount} pomos
                      </span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-[11px] text-zinc-400 leading-relaxed">
                      <div>
                        <span className="font-semibold text-zinc-200 block text-[10px]">O que foi bem:</span>
                        <p className="italic">"{entry.reflection1}"</p>
                      </div>
                      <div>
                        <span className="font-semibold text-zinc-200 block text-[10px]">Onde perdeu foco:</span>
                        <p className="italic">"{entry.reflection2}"</p>
                      </div>
                      <div>
                        <span className="font-semibold text-zinc-200 block text-[10px]">Amanhã:</span>
                        <p className="italic">"{entry.reflection3}"</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* EISENHOWER RATIO VISUALISER */}
        <div className="bg-[#121214] border border-[#222226] rounded-xl p-5">
          <h3 className="font-display font-semibold text-sm text-white mb-4 flex items-center gap-1.5">
            <Grid className="w-4 h-4 text-emerald-400" />
            Distribuição Eisenhower
          </h3>
          <div className="grid grid-cols-4 gap-3 text-center">
            <div className="p-2.5 bg-red-950/10 border border-red-900/20 rounded-lg">
              <span className="text-[10px] font-mono text-red-400 block uppercase">💥 Q1</span>
              <span className="text-lg font-bold text-white mt-1 block">{q1Count}</span>
            </div>
            <div className="p-2.5 bg-blue-950/10 border border-blue-900/20 rounded-lg">
              <span className="text-[10px] font-mono text-blue-400 block uppercase">🎯 Q2</span>
              <span className="text-lg font-bold text-white mt-1 block">{q2Count}</span>
            </div>
            <div className="p-2.5 bg-amber-950/10 border border-amber-900/20 rounded-lg">
              <span className="text-[10px] font-mono text-amber-400 block uppercase">⚡ Q3</span>
              <span className="text-lg font-bold text-white mt-1 block">{q3Count}</span>
            </div>
            <div className="p-2.5 bg-zinc-900 border border-zinc-800 rounded-lg">
              <span className="text-[10px] font-mono text-zinc-400 block uppercase">☕ Q4</span>
              <span className="text-lg font-bold text-white mt-1 block">{q4Count}</span>
            </div>
          </div>
          <p className="text-[10px] text-zinc-500 mt-3 text-center leading-relaxed">
            Profissionais de alta performance dedicam pelo menos <strong>60% do seu tempo no Quadrante 2 (Estratégico)</strong> para mitigar crises futuras!
          </p>
        </div>

      </div>

      {/* RIGHT: JOURNALING & CLOSING OF THE DAY (5 Columns) */}
      <div className="lg:col-span-5">
        <div className="bg-[#121214] border border-[#222226] rounded-xl p-5 space-y-4">
          <div className="flex items-center gap-2 mb-1">
            <BookOpen className="w-5 h-5 text-emerald-400" />
            <h3 className="font-display font-semibold text-base text-white">Reflexão Diária</h3>
          </div>
          <p className="text-xs text-zinc-500 leading-relaxed">
            Tire 2 minutos no encerramento do dia para documentar aprendizados, registrar o log de produtividade e esvaziar a mente antes de descansar.
          </p>

          <form onSubmit={handleSaveJournal} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1">1. O que correu bem hoje?</label>
              <textarea
                value={reflection1}
                onChange={(e) => setReflection1(e.target.value)}
                placeholder="Ex: 'Concluí a arquitetura inicial do banco de dados e fiz 3 blocos pomodoros contínuos sem distraction.'"
                className="w-full h-18 bg-[#18181b] border border-zinc-800 rounded-lg p-2.5 text-xs text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-emerald-500 transition-colors resize-none"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1">2. Onde perdi foco ou procrastinei?</label>
              <textarea
                value={reflection2}
                onChange={(e) => setReflection2(e.target.value)}
                placeholder="Ex: 'Fiquei 30 min rolando feed no Instagram após o almoço.'"
                className="w-full h-18 bg-[#18181b] border border-zinc-800 rounded-lg p-2.5 text-xs text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-emerald-500 transition-colors resize-none"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1">3. Qual é o plano / Sapo de amanhã?</label>
              <textarea
                value={reflection3}
                onChange={(e) => setReflection3(e.target.value)}
                placeholder="Ex: 'Codificar o módulo de exportação e testar com a IA.'"
                className="w-full h-18 bg-[#18181b] border border-zinc-800 rounded-lg p-2.5 text-xs text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-emerald-500 transition-colors resize-none"
                required
              />
            </div>

            <button
              type="submit"
              className="w-full bg-emerald-600 hover:bg-emerald-500 text-zinc-950 font-bold text-xs py-2.5 rounded-lg transition-colors flex items-center justify-center gap-1.5"
              id="save-reflection-btn"
            >
              Salvar Reflexão e Registrar Log
            </button>
          </form>

          {journalSaved && (
            <div className="p-3 bg-emerald-950/20 border border-emerald-500/30 rounded-lg text-xs text-emerald-400 flex items-center gap-2 animate-fade-in">
              <Sparkles className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Log de Produtividade registrado com sucesso! Seus gráficos foram atualizados no Ledger.</span>
            </div>
          )}
        </div>
      </div>

    </div>
  );
}
