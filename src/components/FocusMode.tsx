import React from "react";
import { Task, SMARTSubtask } from "../types";
import { 
  Play, 
  Pause, 
  RotateCcw, 
  CheckCircle, 
  Maximize2, 
  Minimize2, 
  Flame, 
  Clock, 
  Volume2, 
  VolumeX,
  Plus,
  Compass,
  ArrowRight
} from "lucide-react";

interface FocusModeProps {
  task: Task;
  timerSeconds: number;
  timerActive: boolean;
  isBreakMode: boolean;
  completedCycles: number;
  onToggleTimer: () => void;
  onResetTimer: () => void;
  onSkipTimer: () => void;
  onToggleSubtask: (taskId: string, subtaskId: string, completed: boolean) => void;
  onClose: () => void;
}

export default function FocusMode({
  task,
  timerSeconds,
  timerActive,
  isBreakMode,
  completedCycles,
  onToggleTimer,
  onResetTimer,
  onSkipTimer,
  onToggleSubtask,
  onClose
}: FocusModeProps) {
  
  // Format MM:SS
  const formatTime = (totalSecs: number) => {
    const mins = Math.floor(totalSecs / 60);
    const secs = totalSecs % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  // Sound configuration
  const [soundEnabled, setSoundEnabled] = React.useState(true);

  // Calculate visual SVG stroke-dashoffset for circular ring
  const totalDuration = isBreakMode ? 5 * 60 : 25 * 60;
  const progressRatio = timerSeconds / totalDuration;
  const strokeDash = 2 * Math.PI * 90; // radius = 90
  const strokeDashoffset = strokeDash * (1 - progressRatio);

  return (
    <div className="fixed inset-0 bg-[#09090b]/98 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-fade-in" id="focus-overlay">
      <div className="max-w-4xl w-full grid grid-cols-1 md:grid-cols-12 gap-8 items-center bg-[#121214] border border-zinc-800 rounded-2xl p-6 md:p-8" id="focus-container">
        
        {/* LEFT COLUMN: HIGH-INTENSITY POMODORO TIMER (7 Columns) */}
        <div className="md:col-span-7 flex flex-col items-center justify-center space-y-6">
          
          <div className="text-center">
            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-bold uppercase tracking-wider select-none ${
              isBreakMode 
                ? "bg-teal-950/40 text-teal-400 border border-teal-900/30" 
                : "bg-emerald-950/40 text-emerald-400 border border-emerald-900/30 sapo-pulse"
            }`}>
              <Flame className="w-3.5 h-3.5" />
              {isBreakMode ? "Ciclo de Pausa" : "Foco Profundo Ativo"}
            </span>
            <h3 className="font-display font-semibold text-lg text-white mt-3 px-4 truncate max-w-sm">
              {task.title}
            </h3>
          </div>

          {/* CIRCULAR TIMER */}
          <div className="relative w-64 h-64 flex items-center justify-center select-none">
            <svg className="w-full h-full transform -rotate-90">
              {/* Outer static ring */}
              <circle
                cx="128"
                cy="128"
                r="90"
                className="stroke-zinc-850 fill-none"
                strokeWidth="6"
              />
              {/* Active animated progress ring */}
              <circle
                cx="128"
                cy="128"
                r="90"
                className={`fill-none transition-all duration-300 ${
                  isBreakMode ? "stroke-teal-500" : "stroke-emerald-400"
                }`}
                strokeWidth="6"
                strokeDasharray={strokeDash}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
              />
            </svg>

            {/* Inner text values */}
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="font-display font-bold text-5xl text-white tracking-tighter" id="countdown-timer">
                {formatTime(timerSeconds)}
              </span>
              <span className="text-[10px] font-mono text-zinc-500 uppercase mt-1 tracking-widest">
                {completedCycles} Ciclos Feitos
              </span>
            </div>
          </div>

          {/* TIMER CONTROLS */}
          <div className="flex items-center gap-4">
            {/* Reset */}
            <button
              onClick={onResetTimer}
              className="p-3 bg-zinc-850 hover:bg-zinc-800 border border-zinc-800 text-zinc-400 hover:text-white rounded-xl transition-colors"
              title="Reiniciar Timer"
            >
              <RotateCcw className="w-5 h-5" />
            </button>

            {/* Primary Toggle (Play / Pause) */}
            <button
              onClick={onToggleTimer}
              className={`p-4 rounded-full text-zinc-950 transition-all font-semibold shadow-lg ${
                timerActive 
                  ? "bg-zinc-300 hover:bg-zinc-200" 
                  : isBreakMode
                    ? "bg-teal-400 hover:bg-teal-300 shadow-teal-950/20"
                    : "bg-emerald-400 hover:bg-emerald-300 shadow-emerald-950/20"
              }`}
              title={timerActive ? "Pausar" : "Iniciar"}
              id="focus-play-pause-btn"
            >
              {timerActive ? (
                <Pause className="w-6 h-6 stroke-[3]" />
              ) : (
                <Play className="w-6 h-6 fill-current stroke-[3]" />
              )}
            </button>

            {/* Skip Break/Focus */}
            <button
              onClick={onSkipTimer}
              className="p-3 bg-zinc-850 hover:bg-zinc-800 border border-zinc-800 text-zinc-400 hover:text-white rounded-xl transition-colors text-xs font-semibold px-4"
              title="Avançar"
              id="focus-skip-btn"
            >
              Pular
            </button>
          </div>

          {/* Sound Preferences */}
          <div className="flex items-center gap-3 text-xs text-zinc-500">
            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              className="flex items-center gap-1 hover:text-zinc-300 transition-colors"
            >
              {soundEnabled ? (
                <>
                  <Volume2 className="w-4 h-4 text-emerald-400" /> Sons Ativos
                </>
              ) : (
                <>
                  <VolumeX className="w-4 h-4 text-zinc-600" /> Silenciado
                </>
              )}
            </button>
          </div>

        </div>

        {/* RIGHT COLUMN: INTERACTIVE SMART SUBTASKS (5 Columns) */}
        <div className="md:col-span-5 flex flex-col h-full border-t md:border-t-0 md:border-l border-zinc-800 pt-6 md:pt-0 md:pl-8 space-y-6">
          <div>
            <h4 className="font-display font-semibold text-white text-sm flex items-center gap-1.5">
              <CheckCircle className="w-4.5 h-4.5 text-emerald-400" />
              Submetas SMART
            </h4>
            <p className="text-xs text-zinc-500 mt-1 leading-relaxed">
              Quebre a procrastinação riscando estes passos simples criados pela inteligência artificial:
            </p>
          </div>

          <div className="flex-1 space-y-2.5 max-h-[220px] overflow-y-auto pr-1">
            {(!task.smartSubtasks || task.smartSubtasks.length === 0) ? (
              <div className="text-center py-8 text-zinc-600 space-y-2 border border-dashed border-zinc-850 rounded-lg">
                <Compass className="w-6 h-6 mx-auto text-zinc-700" />
                <p className="text-[11px]">Nenhuma submeta definida.</p>
                <p className="text-[10px] text-zinc-700">Selecione "Analisar com IA" no Inbox para subdividir tarefas complexas.</p>
              </div>
            ) : (
              task.smartSubtasks.map(sub => (
                <button
                  key={sub.id}
                  onClick={() => onToggleSubtask(task.id, sub.id, !sub.completed)}
                  className={`w-full text-left p-3 rounded-xl border flex items-center gap-3 transition-all ${
                    sub.completed 
                      ? "bg-zinc-900/30 border-zinc-900/50 text-zinc-600" 
                      : "bg-zinc-900 border-zinc-800 text-zinc-200 hover:border-zinc-700"
                  }`}
                >
                  <div className={`w-4 h-4 rounded-md border flex items-center justify-center shrink-0 transition-colors ${
                    sub.completed ? "bg-emerald-500/10 border-emerald-500 text-emerald-400" : "border-zinc-700"
                  }`}>
                    {sub.completed && <Check className="w-3 h-3 stroke-[3]" />}
                  </div>
                  <span className={`text-xs font-medium ${sub.completed ? "line-through" : ""}`}>{sub.title}</span>
                </button>
              ))
            )}
          </div>

          {/* Quick complete task trigger */}
          <div className="pt-4 border-t border-zinc-850 space-y-3">
            <button
              onClick={() => {
                onToggleTimer(); // Pause
                onClose(); // Exit overlay
              }}
              className="w-full text-center bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-white text-xs font-semibold py-2.5 rounded-lg transition-colors"
            >
              Sair da Sala de Foco
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}

// Check icon defined inline for security
function Check({ className, ...props }: React.SVGProps<SVGSVGElement>) {
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
      <path d="M20 6 9 17l-5-5" />
    </svg>
  );
}
