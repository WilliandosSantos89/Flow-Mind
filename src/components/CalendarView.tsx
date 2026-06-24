import React, { useState } from "react";
import { Task, Project } from "../types";
import { 
  Clock, 
  Calendar, 
  Play, 
  Plus, 
  Trash2, 
  CheckCircle, 
  Sparkles, 
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  Info
} from "lucide-react";

interface CalendarViewProps {
  tasks: Task[];
  projects: Project[];
  onUpdateTask: (id: string, updates: Partial<Task>) => void;
  onOpenFocus: (task: Task) => void;
}

export default function CalendarView({
  tasks,
  projects,
  onUpdateTask,
  onOpenFocus
}: CalendarViewProps) {
  // Calendar View: Daily view vs. Weekly view
  const [viewType, setViewType] = useState<"day" | "week">("day");
  
  // Current active date context (default to today)
  const [currentDate, setCurrentDate] = useState<string>(() => {
    const today = new Date();
    return today.toISOString().split("T")[0]; // YYYY-MM-DD
  });

  // Modal State for scheduling from a slot
  const [selectedHourSlot, setSelectedHourSlot] = useState<string | null>(null);
  const [showScheduleModal, setShowScheduleModal] = useState(false);

  // Hours displayed on the calendar (07:00 - 22:00)
  const hours = Array.from({ length: 16 }, (_, i) => {
    const h = i + 7;
    return `${h.toString().padStart(2, "0")}:00`;
  });

  // Filter tasks that are scheduled for the current date
  const scheduledTasks = tasks.filter(t => t.scheduledDate === currentDate && t.timeBlockStart);
  
  // Filter tasks that are NOT scheduled yet
  const unscheduledTasks = tasks.filter(t => !t.scheduledDate && !t.completed);

  const getWeekDays = () => {
    const start = new Date(currentDate);
    // Find previous Monday
    const day = start.getDay();
    const diff = start.getDate() - day + (day === 0 ? -6 : 1); // adjust when day is sunday
    const monday = new Date(start.setDate(diff));
    
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      return d.toISOString().split("T")[0];
    });
  };

  const handleNextDay = () => {
    const d = new Date(currentDate);
    d.setDate(d.getDate() + 1);
    setCurrentDate(d.toISOString().split("T")[0]);
  };

  const handlePrevDay = () => {
    const d = new Date(currentDate);
    d.setDate(d.getDate() - 1);
    setCurrentDate(d.toISOString().split("T")[0]);
  };

  const handleSetToday = () => {
    setCurrentDate(new Date().toISOString().split("T")[0]);
  };

  const handleScheduleTask = (taskId: string, hour: string) => {
    // Parse end time (1 hour block default or based on estimated pomodoros: 1 pomo = 30m, 2 pomo = 1h, etc.)
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;

    const [h, m] = hour.split(":").map(Number);
    const durationHours = Math.max(1, Math.ceil(task.estimatedPomodoros / 2));
    const endH = h + durationHours;
    const timeBlockEnd = `${endH.toString().padStart(2, "0")}:00`;

    onUpdateTask(taskId, {
      scheduledDate: currentDate,
      timeBlockStart: hour,
      timeBlockEnd: timeBlockEnd
    });

    setShowScheduleModal(false);
    setSelectedHourSlot(null);
  };

  const handleUnscheduleTask = (taskId: string) => {
    onUpdateTask(taskId, {
      scheduledDate: undefined,
      timeBlockStart: undefined,
      timeBlockEnd: undefined
    });
  };

  // Helper to check if a task spans across a specific hour slot
  const getTaskForHour = (hour: string, dateStr = currentDate) => {
    return tasks.find(t => {
      if (t.scheduledDate !== dateStr || !t.timeBlockStart || !t.timeBlockEnd) return false;
      const tStart = parseInt(t.timeBlockStart.split(":")[0]);
      const tEnd = parseInt(t.timeBlockEnd.split(":")[0]);
      const slotHour = parseInt(hour.split(":")[0]);
      return slotHour >= tStart && slotHour < tEnd;
    });
  };

  const formattedDateString = (dateStr: string) => {
    const date = new Date(dateStr + "T00:00:00");
    return date.toLocaleDateString("pt-BR", { weekday: "long", day: "numeric", month: "long" });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6" id="calendar-view-container">
      
      {/* CENTRAL AREA: CALENDAR DISPLAY (8 Columns) */}
      <div className="lg:col-span-8 bg-[#121214] border border-[#222226] rounded-xl p-5 flex flex-col h-full">
        
        {/* Calendar Header Controls */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-850 pb-4 mb-4">
          <div className="flex items-center gap-3">
            <button 
              onClick={handlePrevDay} 
              className="p-1.5 rounded-lg bg-[#18181b] border border-zinc-800 text-zinc-400 hover:text-white"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <div className="text-left">
              <h3 className="font-display font-semibold text-white capitalize text-sm sm:text-base">
                {formattedDateString(currentDate)}
              </h3>
              <p className="text-[11px] font-mono text-zinc-500">
                {currentDate === new Date().toISOString().split("T")[0] ? "Hoje" : "Planejamento Futuro"}
              </p>
            </div>
            <button 
              onClick={handleNextDay} 
              className="p-1.5 rounded-lg bg-[#18181b] border border-zinc-800 text-zinc-400 hover:text-white"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button 
              onClick={handleSetToday} 
              className="text-xs bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-white px-3 py-1.5 rounded-lg transition-colors font-medium"
            >
              Hoje
            </button>
            <div className="flex bg-zinc-900 p-1 rounded-lg border border-zinc-800 text-xs font-medium">
              <button 
                onClick={() => setViewType("day")} 
                className={`px-3 py-1 rounded-md transition-colors ${viewType === "day" ? "bg-zinc-800 text-white" : "text-zinc-400 hover:text-white"}`}
              >
                Dia
              </button>
              <button 
                onClick={() => setViewType("week")} 
                className={`px-3 py-1 rounded-md transition-colors ${viewType === "week" ? "bg-zinc-800 text-white" : "text-zinc-400 hover:text-white"}`}
              >
                Semana
              </button>
            </div>
          </div>
        </div>

        {/* DETAILED DAILY TIMELINE */}
        {viewType === "day" ? (
          <div className="space-y-1.5 overflow-y-auto max-h-[580px] pr-1" id="daily-timeline">
            {hours.map((hour) => {
              const activeTask = getTaskForHour(hour);
              const isStartOfBlock = activeTask && activeTask.timeBlockStart === hour;

              return (
                <div key={hour} className="flex gap-4 min-h-[52px] group">
                  {/* Time label */}
                  <span className="font-mono text-xs text-zinc-500 w-12 text-right select-none pt-1">
                    {hour}
                  </span>

                  {/* Slot Container */}
                  <div className="flex-1 border-t border-zinc-850 relative min-h-[44px]">
                    {activeTask ? (
                      // Render scheduled block
                      isStartOfBlock ? (
                        <div 
                          className={`absolute inset-x-0 top-1 p-2.5 rounded-lg border z-10 select-none cursor-pointer group transition-all duration-300 ${
                            activeTask.completed 
                              ? "bg-zinc-900/40 border-zinc-800 opacity-60"
                              : activeTask.isSapo 
                                ? "bg-emerald-950/20 border-emerald-500/60 sapo-pulse shadow-md shadow-emerald-950/10"
                                : activeTask.quadrant === 1 
                                  ? "bg-red-950/20 border-red-500/50" 
                                  : "bg-blue-950/20 border-blue-500/50"
                          }`}
                          style={{
                            height: `calc(${Math.max(1, Math.ceil((parseInt(activeTask.timeBlockEnd!.split(":")[0]) - parseInt(activeTask.timeBlockStart!.split(":")[0])))) * 52}px - 6px)`
                          }}
                          onClick={() => onOpenFocus(activeTask)}
                        >
                          <div className="flex justify-between items-start gap-2 h-full">
                            <div className="min-w-0">
                              <div className="flex items-center gap-1.5 flex-wrap">
                                {activeTask.isSapo && (
                                  <span className="text-[9px] font-semibold bg-emerald-500 text-zinc-950 px-1 rounded uppercase font-mono tracking-wider">
                                    Sapo
                                  </span>
                                )}
                                {activeTask.quadrant === 1 && (
                                  <span className="text-[9px] font-semibold bg-red-600 text-white px-1 rounded uppercase font-mono tracking-wider">
                                    Q1
                                  </span>
                                )}
                                <span className="font-mono text-[10px] text-zinc-400">
                                  {activeTask.timeBlockStart} - {activeTask.timeBlockEnd}
                                </span>
                              </div>
                              <h4 className={`text-xs font-semibold leading-tight mt-1 truncate ${activeTask.completed ? "line-through text-zinc-600" : "text-white"}`}>
                                {activeTask.title}
                              </h4>
                              {activeTask.description && (
                                <p className="text-[10px] text-zinc-400 truncate mt-0.5 max-w-sm">
                                  {activeTask.description}
                                </p>
                              )}
                            </div>

                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              {!activeTask.completed && (
                                <button 
                                  onClick={(e) => { e.stopPropagation(); onOpenFocus(activeTask); }}
                                  className="bg-emerald-500 hover:bg-emerald-400 text-zinc-950 rounded p-1"
                                  title="Iniciar Pomodoro"
                                >
                                  <Play className="w-3 h-3 fill-current" />
                                </button>
                              )}
                              <button 
                                onClick={(e) => { e.stopPropagation(); handleUnscheduleTask(activeTask.id); }}
                                className="bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-red-400 rounded p-1"
                                title="Remover do Calendário"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            </div>
                          </div>
                        </div>
                      ) : null
                    ) : (
                      // Render empty slot with a subtle Quick Add trigger
                      <button
                        onClick={() => {
                          setSelectedHourSlot(hour);
                          setShowScheduleModal(true);
                        }}
                        className="w-full h-full text-left py-1 text-zinc-700 opacity-0 group-hover:opacity-100 hover:text-emerald-400 transition-all flex items-center gap-1.5 text-xs font-medium pl-2"
                        id={`schedule-slot-btn-${hour}`}
                      >
                        <Plus className="w-3.5 h-3.5" />
                        Blocar tempo às {hour}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* WEEKLY COMPACT VIEW */
          <div className="grid grid-cols-7 gap-3 h-full max-h-[500px] overflow-y-auto" id="weekly-grid-container">
            {getWeekDays().map((dayStr) => {
              const date = new Date(dayStr + "T00:00:00");
              const isToday = dayStr === new Date().toISOString().split("T")[0];
              const dayTasks = tasks.filter(t => t.scheduledDate === dayStr);

              return (
                <div 
                  key={dayStr} 
                  className={`bg-zinc-900/40 border rounded-xl p-3 flex flex-col min-h-[350px] transition-all ${
                    isToday ? "border-emerald-500/50 bg-emerald-950/5" : "border-zinc-850"
                  }`}
                >
                  <div className="text-center border-b border-zinc-850 pb-2 mb-2 select-none">
                    <span className="text-[10px] text-zinc-500 block uppercase font-mono font-bold leading-none">
                      {date.toLocaleDateString("pt-BR", { weekday: "short" })}
                    </span>
                    <span className={`text-sm font-semibold inline-block mt-1 w-6 h-6 rounded-full leading-6 ${
                      isToday ? "bg-emerald-500 text-zinc-950" : "text-white"
                    }`}>
                      {date.getDate()}
                    </span>
                  </div>

                  <div className="flex-1 space-y-1.5 overflow-y-auto max-h-72">
                    {dayTasks.length === 0 ? (
                      <span className="text-[9px] text-zinc-600 block text-center py-4">Livre</span>
                    ) : (
                      dayTasks.map(t => (
                        <div 
                          key={t.id} 
                          onClick={() => onOpenFocus(t)}
                          className={`p-1.5 rounded text-[10px] border cursor-pointer select-none transition-colors truncate ${
                            t.completed 
                              ? "bg-zinc-950/50 border-zinc-900 text-zinc-600 line-through"
                              : t.isSapo 
                                ? "bg-emerald-950/40 border-emerald-500/40 text-emerald-300 font-semibold"
                                : t.quadrant === 1 
                                  ? "bg-red-950/40 border-red-500/40 text-red-300"
                                  : "bg-blue-950/40 border-blue-500/40 text-blue-300"
                          }`}
                          title={`${t.title} (${t.timeBlockStart || ""})`}
                        >
                          <span className="font-mono text-[8px] opacity-75 mr-1">{t.timeBlockStart || "Pomo"}</span>
                          {t.title}
                        </div>
                      ))
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* RIGHT SIDE PANEL: UNSCHEDULED INBOX LIST (4 Columns) */}
      <div className="lg:col-span-4 space-y-6">
        
        {/* Unscheduled Pool */}
        <div className="bg-[#121214] border border-[#222226] rounded-xl p-5 flex flex-col" id="unscheduled-pool">
          <h3 className="font-display font-semibold text-white text-base flex items-center gap-2 mb-2">
            <Calendar className="w-5 h-5 text-emerald-400" />
            Tarefas Pendentes
          </h3>
          <p className="text-xs text-zinc-500 mb-4 leading-relaxed">
            Escolha as tarefas Ivy Lee abaixo e aloque-as no calendário para realizar o Time Blocking.
          </p>

          <div className="space-y-2.5 max-h-[460px] overflow-y-auto pr-1">
            {unscheduledTasks.length === 0 ? (
              <div className="text-center py-12 text-zinc-600 space-y-2 border border-dashed border-zinc-800 rounded-lg">
                <CheckCircle className="w-8 h-8 text-zinc-700 mx-auto" />
                <p className="text-xs font-semibold">Tudo Planejado!</p>
                <p className="text-[10px] text-zinc-600">Todas as tarefas ativas foram blocadas no tempo.</p>
              </div>
            ) : (
              unscheduledTasks.map(t => {
                const matchedProj = projects.find(p => p.id === t.projectId);
                return (
                  <div 
                    key={t.id} 
                    className={`p-3 rounded-lg border transition-all ${
                      t.isSapo 
                        ? "bg-emerald-950/10 border-emerald-500/30" 
                        : "bg-zinc-900/60 border-zinc-800/80 hover:border-zinc-700"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <span className={`text-xs font-medium block leading-tight ${t.isSapo ? "text-emerald-300" : "text-white"}`}>
                          {t.title}
                        </span>
                        
                        <div className="flex items-center gap-1.5 mt-2 flex-wrap">
                          {t.isSapo && (
                            <span className="text-[8px] font-mono bg-emerald-500 text-zinc-950 font-bold px-1 rounded uppercase">
                              Sapo
                            </span>
                          )}
                          <span className="text-[8px] font-mono bg-zinc-800 text-zinc-400 px-1 py-0.5 rounded">
                            Q{t.quadrant}
                          </span>
                          {matchedProj && (
                            <span 
                              className="text-[8px] px-1 rounded truncate max-w-[80px]"
                              style={{ backgroundColor: `${matchedProj.color}15`, color: matchedProj.color }}
                            >
                              {matchedProj.title}
                            </span>
                          )}
                          <span className="text-[9px] text-zinc-500 font-mono flex items-center gap-0.5">
                            <Clock className="w-2.5 h-2.5 text-zinc-600" />
                            {t.estimatedPomodoros} pomos
                          </span>
                        </div>
                      </div>

                      <button
                        onClick={() => {
                          setSelectedHourSlot("09:00");
                          handleScheduleTask(t.id, "09:00");
                        }}
                        className="bg-zinc-800 hover:bg-zinc-700 hover:text-emerald-400 text-zinc-400 text-[10px] font-semibold px-2 py-1 rounded shrink-0 transition-colors"
                      >
                        Blocar (9h)
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Informative advice */}
        <div className="bg-[#121214] border border-[#222226] rounded-xl p-4 flex gap-3 items-start text-xs text-zinc-400">
          <Info className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
          <div className="leading-relaxed">
            <span className="font-semibold text-zinc-200 block mb-0.5">O que é Time Blocking?</span>
            É a prática de reservar blocos de tempo para tarefas específicas. Em vez de uma lista reativa de afazeres, você se compromete com o <em>quando</em> cada coisa será resolvida.
          </div>
        </div>
      </div>

      {/* DETAILED DIALOG: ALLOCATE HOUR MODAL */}
      {showScheduleModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in" id="schedule-modal-overlay">
          <div className="bg-[#121214] border border-zinc-800 rounded-xl p-5 max-w-md w-full" id="schedule-modal-content">
            <div className="flex justify-between items-center border-b border-zinc-850 pb-3 mb-4">
              <h3 className="font-display font-semibold text-white text-base">
                Blocar Tempo para {selectedHourSlot}
              </h3>
              <button 
                onClick={() => { setShowScheduleModal(false); setSelectedHourSlot(null); }}
                className="text-zinc-500 hover:text-zinc-300"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              <p className="text-xs text-zinc-400 leading-relaxed mb-4">
                Selecione qual tarefa da sua Inbox você deseja executar neste horário do dia {formattedDateString(currentDate)}.
              </p>

              <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                {unscheduledTasks.length === 0 ? (
                  <p className="text-center py-6 text-zinc-500 text-xs italic">
                    Não há tarefas pendentes na Inbox. Crie tarefas antes de blocar tempo.
                  </p>
                ) : (
                  unscheduledTasks.map(t => (
                    <button
                      key={t.id}
                      onClick={() => handleScheduleTask(t.id, selectedHourSlot!)}
                      className="w-full text-left p-3 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 hover:border-zinc-700 rounded-lg transition-all flex justify-between items-center"
                    >
                      <div>
                        <span className="text-xs font-semibold text-white block">{t.title}</span>
                        <span className="text-[10px] text-zinc-500 block">Q{t.quadrant} | Estimativa: {t.estimatedPomodoros} Pomodoro(s)</span>
                      </div>
                      <ChevronRight className="w-4 h-4 text-zinc-500" />
                    </button>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

// X inline component defined to prevent missing import
function X({ className, ...props }: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      {...props}
    >
      <path d="M18 6 6 18" />
      <path d="m6 6 12 12" />
    </svg>
  );
}
