import React, { useState, useRef, useEffect } from "react";
import { ChatMessage } from "../types";
import { 
  Sparkles, 
  Send, 
  Bot, 
  User, 
  Flame, 
  Compass, 
  Target, 
  ArrowRight,
  Info
} from "lucide-react";

interface AICoachProps {
  chatHistory: ChatMessage[];
  onSendMessage: (content: string) => Promise<void>;
  isGenerating: boolean;
}

export default function AICoach({
  chatHistory,
  onSendMessage,
  isGenerating
}: AICoachProps) {
  const [inputText, setInputText] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Suggestions to quick-start conversation
  const coachSuggestions = [
    { title: "🐸 Como vencer meu Sapo do Dia?", prompt: "Estou procrastinando para resolver meu 'Sapo do Dia' hoje. Pode me dar uma estratégia prática baseada no método GTD ou psicologia do foco para superá-la em 10 minutos?" },
    { title: "🎯 Me ajude a definir uma Meta SMART", prompt: "Quero criar uma Meta SMART para o meu próximo projeto pessoal de aprendizado de programação. Me ajude a formular o objetivo destrinchando cada um dos 5 pilares?" },
    { title: "🌿 O que é a regra de ouro do Ivy Lee?", prompt: "Pode me explicar detalhadamente como o Método Ivy Lee de 6 tarefas diárias se conecta com o planejamento diário de blocos de tempo?" }
  ];

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || isGenerating) return;

    onSendMessage(inputText.trim());
    setInputText("");
  };

  const handleSuggestionClick = (prompt: string) => {
    if (isGenerating) return;
    onSendMessage(prompt);
  };

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatHistory, isGenerating]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-[580px]" id="ai-coach-section">
      
      {/* LEFT: LIVE CONVERSATION CONSOLE (8 Columns) */}
      <div className="lg:col-span-8 bg-[#121214] border border-[#222226] rounded-xl flex flex-col h-full overflow-hidden">
        
        {/* Chat Header */}
        <div className="px-5 py-4 border-b border-zinc-850 bg-zinc-900/40 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
              <Bot className="w-4.5 h-4.5 text-emerald-400" />
            </div>
            <div>
              <h3 className="font-display font-semibold text-white text-sm">FlowMind Coach</h3>
              <p className="text-[10px] text-zinc-500">Mentor de Produtividade & Trabalho Profundo</p>
            </div>
          </div>
          <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/30 border border-emerald-900/20 px-2 py-0.5 rounded-full">
            Online
          </span>
        </div>

        {/* Message Feed */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4 min-h-0" id="chat-messages-container">
          {chatHistory.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center space-y-4 max-w-md mx-auto select-none">
              <div className="w-12 h-12 rounded-full bg-emerald-500/5 border border-emerald-500/10 flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-emerald-400" />
              </div>
              <div className="space-y-1.5">
                <h4 className="font-display font-semibold text-white text-sm">FlowMind Coach Ativado</h4>
                <p className="text-xs text-zinc-500 leading-relaxed">
                  Pergunte-me qualquer coisa sobre organização, metas, divisão de tarefas SMART ou como estruturar seus blocos de foco diários. Estou aqui para remover sua paralisia de escolha.
                </p>
              </div>
            </div>
          ) : (
            chatHistory.map((msg) => (
              <div 
                key={msg.id} 
                className={`flex gap-3 text-xs max-w-2xl ${msg.role === "user" ? "ml-auto flex-row-reverse" : "mr-auto"}`}
              >
                {/* Avatar Icon */}
                <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                  msg.role === "user" 
                    ? "bg-zinc-800 text-zinc-300" 
                    : "bg-emerald-950/40 border border-emerald-800/20 text-emerald-400"
                }`}>
                  {msg.role === "user" ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                </div>

                {/* Bubble content */}
                <div className={`p-3.5 rounded-xl border leading-relaxed ${
                  msg.role === "user" 
                    ? "bg-zinc-900 border-zinc-800 text-zinc-200" 
                    : "bg-[#18181b]/60 border-zinc-850 text-zinc-300"
                }`}>
                  {/* Simplistic formatting: lines splitting */}
                  {msg.content.split("\n").map((line, lIdx) => (
                    <p key={lIdx} className={line.trim() ? "mb-1.5 last:mb-0" : "h-2"}>
                      {line}
                    </p>
                  ))}
                </div>
              </div>
            ))
          )}

          {/* Typing state spinner */}
          {isGenerating && (
            <div className="flex gap-3 text-xs mr-auto animate-pulse">
              <div className="w-7 h-7 rounded-lg bg-emerald-950/40 border border-emerald-800/20 text-emerald-400 flex items-center justify-center shrink-0">
                <Bot className="w-4 h-4" />
              </div>
              <div className="p-3.5 bg-[#18181b]/60 border border-zinc-850 rounded-xl text-zinc-500 italic flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-bounce" />
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-bounce [animation-delay:0.2s]" />
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-bounce [animation-delay:0.4s]" />
                Coach está refletindo...
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar form */}
        <form onSubmit={handleSend} className="p-4 border-t border-zinc-850 bg-zinc-900/10 flex gap-2.5 items-center">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            disabled={isGenerating}
            placeholder="Digite sua dúvida de produtividade..."
            className="flex-1 bg-[#18181b] border border-zinc-800 rounded-lg px-3.5 py-2 text-xs text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-emerald-500 transition-colors"
            id="chat-input"
          />
          <button
            type="submit"
            disabled={isGenerating || !inputText.trim()}
            className={`p-2 rounded-lg transition-colors ${
              isGenerating || !inputText.trim()
                ? "bg-zinc-800 text-zinc-600 cursor-not-allowed"
                : "bg-emerald-500 hover:bg-emerald-400 text-zinc-950"
            }`}
            id="chat-submit-btn"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>

      </div>

      {/* RIGHT: SUGGESTED DISCUSSIONS (4 Columns) */}
      <div className="lg:col-span-4 space-y-5">
        
        <div className="bg-[#121214] border border-[#222226] rounded-xl p-5 space-y-4">
          <h3 className="font-display font-semibold text-white text-sm flex items-center gap-1.5">
            <Compass className="w-4.5 h-4.5 text-emerald-400" />
            Tópicos de Treinamento
          </h3>
          <p className="text-xs text-zinc-500 leading-relaxed">
            Selecione uma das sugestões rápidas de mentoria focada para destravar seus objetivos:
          </p>

          <div className="space-y-3">
            {coachSuggestions.map((suggestion, idx) => (
              <button
                key={idx}
                onClick={() => handleSuggestionClick(suggestion.prompt)}
                disabled={isGenerating}
                className="w-full text-left p-3.5 bg-zinc-900 hover:bg-zinc-850 border border-zinc-850 hover:border-zinc-800 rounded-xl transition-all flex justify-between items-start group"
              >
                <div className="space-y-1">
                  <span className="text-[11px] font-semibold text-zinc-200 group-hover:text-emerald-400 transition-colors">
                    {suggestion.title}
                  </span>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-zinc-600 group-hover:text-emerald-400 transition-all shrink-0 mt-0.5" />
              </button>
            ))}
          </div>
        </div>

        {/* Informative GTD Card */}
        <div className="bg-[#121214] border border-[#222226] rounded-xl p-4 flex gap-3 items-start text-xs text-zinc-400">
          <Info className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
          <div className="leading-relaxed">
            <span className="font-semibold text-zinc-200 block mb-0.5">Metodologia GTD</span>
            Criada por David Allen, a metodologia <em>Getting Things Done</em> se apoia no princípio de retirar todas as ideias e obrigações da cabeça, registrá-las em um sistema confiável externo, e então processar de forma acionável.
          </div>
        </div>

      </div>

    </div>
  );
}
