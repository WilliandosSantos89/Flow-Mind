import React, { useState } from "react";
import { SMARTMeta, Project, Task } from "../types";
import { 
  Plus, 
  Trash2, 
  Check, 
  FolderPlus, 
  Compass, 
  Network, 
  FileText, 
  Calendar, 
  ExternalLink,
  ChevronRight,
  Sparkles,
  Link2,
  Paperclip
} from "lucide-react";

interface GoalsViewProps {
  metas: SMARTMeta[];
  projects: Project[];
  tasks: Task[];
  onAddMeta: (meta: Partial<SMARTMeta>) => void;
  onDeleteMeta: (id: string) => void;
  onUpdateMeta: (id: string, updates: Partial<SMARTMeta>) => void;
  onAddProject: (project: Partial<Project>) => void;
  onDeleteProject: (id: string) => void;
}

export default function GoalsView({
  metas,
  projects,
  tasks,
  onAddMeta,
  onDeleteMeta,
  onUpdateMeta,
  onAddProject,
  onDeleteProject
}: GoalsViewProps) {
  // Navigation tabs inside Goals Module: List view vs Tree Mind Map
  const [activeSubTab, setActiveSubTab] = useState<"list" | "mindmap">("list");

  // Form states for creating a SMART Goal
  const [metaTitle, setMetaTitle] = useState("");
  const [metaDesc, setMetaDesc] = useState("");
  const [metaTargetDate, setMetaTargetDate] = useState("");
  const [metaS, setMetaS] = useState(""); // Specific
  const [metaM, setMetaM] = useState(""); // Measurable
  const [metaA, setMetaA] = useState(""); // Achievable
  const [metaR, setMetaR] = useState(""); // Relevant
  const [metaT, setMetaT] = useState(""); // Time-Bound
  const [showAddMetaModal, setShowAddMetaModal] = useState(false);

  // Form states for creating a Project
  const [projTitle, setProjTitle] = useState("");
  const [projDesc, setProjDesc] = useState("");
  const [selectedMetaId, setSelectedMetaId] = useState("");
  const [projColor, setProjColor] = useState("#3b82f6");
  const [showAddProjModal, setShowAddProjModal] = useState(false);

  // Reference attachment simulated state
  const [selectedProjectIdForNotes, setSelectedProjectIdForNotes] = useState<string | null>(null);
  const [newNoteTitle, setNewNoteTitle] = useState("");
  const [newNoteContent, setNewNoteContent] = useState("");
  
  // Local project reference links (persisted in session / local storage state)
  const [projectAttachments, setProjectAttachments] = useState<{[key: string]: {title: string, link: string}[]}>({
    "demo-proj-1": [
      { title: "Escopo Técnico e Funcional", link: "https://trello.com/exemplo" },
      { title: "Mockups do Design Figma", link: "https://figma.com/file/exemplo" }
    ]
  });

  const handleCreateMeta = (e: React.FormEvent) => {
    e.preventDefault();
    if (!metaTitle.trim()) return;

    onAddMeta({
      title: metaTitle.trim(),
      description: metaDesc.trim(),
      targetDate: metaTargetDate || new Date().toISOString().split("T")[0],
      specific: metaS.trim(),
      measurable: metaM.trim(),
      achievable: metaA.trim(),
      relevant: metaR.trim(),
      timeBound: metaT.trim(),
      completed: false
    });

    // Reset fields
    setMetaTitle("");
    setMetaDesc("");
    setMetaTargetDate("");
    setMetaS("");
    setMetaM("");
    setMetaA("");
    setMetaR("");
    setMetaT("");
    setShowAddMetaModal(false);
  };

  const handleCreateProject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!projTitle.trim() || !selectedMetaId) return;

    onAddProject({
      title: projTitle.trim(),
      description: projDesc.trim(),
      metaId: selectedMetaId,
      color: projColor
    });

    setProjTitle("");
    setProjDesc("");
    setSelectedMetaId("");
    setProjColor("#3b82f6");
    setShowAddProjModal(false);
  };

  const handleAddAttachment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProjectIdForNotes || !newNoteTitle.trim()) return;

    const currentAttachments = projectAttachments[selectedProjectIdForNotes] || [];
    const updated = [
      ...currentAttachments,
      { title: newNoteTitle.trim(), link: newNoteContent.trim() || "#" }
    ];

    setProjectAttachments({
      ...projectAttachments,
      [selectedProjectIdForNotes]: updated
    });

    setNewNoteTitle("");
    setNewNoteContent("");
  };

  return (
    <div className="space-y-6" id="goals-view-root">
      
      {/* MODULE HEADER AND NAV TABS */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-850 pb-4">
        <div>
          <h2 className="font-display font-bold text-xl text-white">Metas SMART & Mapa Mental</h2>
          <p className="text-xs text-zinc-500">Mapeie objetivos de longo prazo de forma ultra-específica.</p>
        </div>

        <div className="flex items-center gap-3">
          {/* Sub-tab selection */}
          <div className="flex bg-zinc-900 p-1 rounded-lg border border-zinc-800 text-xs font-medium">
            <button
              onClick={() => setActiveSubTab("list")}
              className={`px-3 py-1.5 rounded-md transition-colors ${
                activeSubTab === "list" ? "bg-zinc-800 text-white" : "text-zinc-400 hover:text-white"
              }`}
            >
              Lista de Metas
            </button>
            <button
              onClick={() => setActiveSubTab("mindmap")}
              className={`px-3 py-1.5 rounded-md transition-colors flex items-center gap-1.5 ${
                activeSubTab === "mindmap" ? "bg-zinc-800 text-white" : "text-zinc-400 hover:text-white"
              }`}
            >
              <Network className="w-3.5 h-3.5" />
              Mapa Mental (Árvore)
            </button>
          </div>

          <button
            onClick={() => setShowAddMetaModal(true)}
            className="bg-emerald-600 hover:bg-emerald-500 text-zinc-950 font-semibold text-xs px-3.5 py-1.5 rounded-lg transition-colors flex items-center gap-1.5"
            id="add-meta-btn"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            Nova Meta SMART
          </button>
        </div>
      </div>

      {/* VIEW: HIERARCHICAL TREE MIND MAP */}
      {activeSubTab === "mindmap" && (
        <div className="bg-[#121214] border border-[#222226] rounded-xl p-6 min-h-[500px] flex flex-col justify-center overflow-x-auto" id="mindmap-container">
          <div className="text-center mb-6">
            <span className="text-xs font-mono bg-zinc-850 text-zinc-400 px-3 py-1 rounded-full border border-zinc-800">
              Conexões: Objetivos → Projetos → Tarefas
            </span>
          </div>

          {metas.length === 0 ? (
            <div className="text-center py-16 text-zinc-600 space-y-3">
              <Network className="w-12 h-12 mx-auto text-zinc-800" />
              <p className="text-sm font-medium">Nenhum mapa mental gerado.</p>
              <p className="text-xs max-w-sm mx-auto">Adicione uma meta SMART e configure projetos para ver a visualização de mapa em árvore integrada.</p>
            </div>
          ) : (
            <div className="space-y-12 select-none min-w-[700px] py-4">
              {metas.map((meta) => {
                const metaProjects = projects.filter(p => p.metaId === meta.id);

                return (
                  <div key={meta.id} className="relative border-l-2 border-emerald-500/20 pl-8 ml-6 space-y-6">
                    {/* Meta Node Anchor */}
                    <div className="absolute -left-[11px] top-1.5 w-5 h-5 rounded-full bg-emerald-500/10 border-2 border-emerald-400 flex items-center justify-center">
                      <div className="w-2 h-2 rounded-full bg-emerald-400" />
                    </div>

                    {/* Meta Node Content */}
                    <div className="p-4 bg-zinc-950 border border-emerald-500/30 rounded-xl max-w-md shadow-lg shadow-emerald-950/5">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[10px] font-mono text-emerald-400 uppercase tracking-wider font-semibold">
                          Meta SMART
                        </span>
                        <span className="text-[10px] font-mono text-zinc-500 flex items-center gap-1">
                          <Calendar className="w-3 h-3" /> {meta.targetDate}
                        </span>
                      </div>
                      <h4 className="text-sm font-bold text-white font-display">{meta.title}</h4>
                      <p className="text-xs text-zinc-400 mt-1">{meta.description}</p>
                    </div>

                    {/* Project Nodes Layer */}
                    <div className="pl-6 space-y-6 relative border-l border-dashed border-zinc-800 ml-4">
                      {metaProjects.length === 0 ? (
                        <div className="text-xs text-zinc-600 italic pl-4">
                          Sem sub-projetos vinculados. Clique abaixo para estruturar um.
                        </div>
                      ) : (
                        metaProjects.map((proj) => {
                          const projectTasks = tasks.filter(t => t.projectId === proj.id);

                          return (
                            <div key={proj.id} className="relative pl-6">
                              {/* Connector horizontal line style */}
                              <div className="absolute -left-[24px] top-4 w-6 h-[1px] border-t border-dashed border-zinc-800" />
                              <div className="absolute -left-1.5 top-2.5 w-3 h-3 rounded-full border border-zinc-700" style={{ backgroundColor: proj.color }} />

                              {/* Project Node Card */}
                              <div className="p-3 bg-zinc-900 border border-zinc-800 rounded-lg max-w-sm inline-block">
                                <span className="text-[9px] font-mono uppercase font-semibold block" style={{ color: proj.color }}>
                                  Projeto
                                </span>
                                <h5 className="text-xs font-bold text-white mt-0.5">{proj.title}</h5>
                              </div>

                              {/* Tasks Layer under Project */}
                              <div className="pl-10 mt-3 space-y-2 relative border-l border-zinc-850 ml-3">
                                {projectTasks.length === 0 ? (
                                  <span className="text-[10px] text-zinc-600 italic block pl-2">Nenhuma tarefa associada</span>
                                ) : (
                                  projectTasks.map(task => (
                                    <div key={task.id} className="relative pl-4 flex items-center gap-2">
                                      {/* Horizontal dash connector */}
                                      <div className="absolute -left-[40px] top-2.5 w-10 h-[1px] border-t border-zinc-850" />
                                      <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${task.completed ? "bg-zinc-700" : "bg-zinc-400"}`} />
                                      
                                      <span className={`text-[11px] font-medium leading-tight truncate max-w-xs ${
                                        task.completed ? "line-through text-zinc-600" : "text-zinc-300"
                                      }`}>
                                        {task.title}
                                      </span>
                                    </div>
                                  ))
                                )}
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* VIEW: MAIN LIST & SPECIFIC SMART VALUES */}
      {activeSubTab === "list" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6" id="goals-list-section">
          
          {/* LEFT: GOALS & SMART PILLARS (8 Columns) */}
          <div className="lg:col-span-8 space-y-5">
            {metas.length === 0 ? (
              <div className="bg-[#121214] border border-[#222226] rounded-xl p-12 text-center text-zinc-500 space-y-3">
                <Compass className="w-12 h-12 text-zinc-700 mx-auto" />
                <p className="font-semibold text-sm">Nenhum Objetivo SMART Cadastrado</p>
                <p className="text-xs text-zinc-600 max-w-sm mx-auto">Metas sem especificidade geram ansiedade. Cadastre sua primeira meta e divida-a nos pilares S.M.A.R.T.</p>
                <button
                  onClick={() => setShowAddMetaModal(true)}
                  className="bg-zinc-800 hover:bg-zinc-700 text-white font-medium text-xs px-4 py-2 rounded-lg border border-zinc-700 transition-colors inline-block mt-2"
                >
                  Criar Primeiro Objetivo
                </button>
              </div>
            ) : (
              metas.map((meta) => {
                const metaProjects = projects.filter(p => p.metaId === meta.id);
                return (
                  <div key={meta.id} className="bg-[#121214] border border-[#222226] rounded-xl p-5 space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 border-b border-zinc-850 pb-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-display font-bold text-base text-white">{meta.title}</h3>
                          <button
                            onClick={() => onUpdateMeta(meta.id, { completed: !meta.completed })}
                            className={`text-[9px] font-mono font-semibold px-2 py-0.5 rounded border transition-colors ${
                              meta.completed 
                                ? "bg-emerald-950/20 text-emerald-400 border-emerald-500/20" 
                                : "bg-zinc-900 text-zinc-500 border-zinc-800 hover:text-zinc-300"
                            }`}
                          >
                            {meta.completed ? "Concluída" : "Ativa"}
                          </button>
                        </div>
                        <p className="text-xs text-zinc-400 mt-1 leading-relaxed">{meta.description}</p>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <span className="text-xs font-mono text-zinc-500 bg-zinc-900 px-2.5 py-1 rounded border border-zinc-800">
                          Alvo: {meta.targetDate}
                        </span>
                        <button
                          onClick={() => onDeleteMeta(meta.id)}
                          className="p-1.5 rounded hover:bg-red-950/40 text-zinc-600 hover:text-red-400 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* SMART Criteria breakdown */}
                    <div className="grid grid-cols-1 sm:grid-cols-5 gap-3 bg-zinc-900/40 p-4 rounded-xl border border-zinc-850 text-xs leading-relaxed">
                      <div className="space-y-1">
                        <span className="font-mono font-bold text-emerald-400 block uppercase">S - Específica</span>
                        <p className="text-[11px] text-zinc-400">{meta.specific || "O que exatamente você vai alcançar?"}</p>
                      </div>
                      <div className="space-y-1">
                        <span className="font-mono font-bold text-blue-400 block uppercase">M - Mensurável</span>
                        <p className="text-[11px] text-zinc-400">{meta.measurable || "Qual métrica de sucesso?"}</p>
                      </div>
                      <div className="space-y-1">
                        <span className="font-mono font-bold text-amber-400 block uppercase">A - Atingível</span>
                        <p className="text-[11px] text-zinc-400">{meta.achievable || "É realista com seus recursos?"}</p>
                      </div>
                      <div className="space-y-1">
                        <span className="font-mono font-bold text-red-400 block uppercase">R - Relevante</span>
                        <p className="text-[11px] text-zinc-400">{meta.relevant || "Por que isso importa agora?"}</p>
                      </div>
                      <div className="space-y-1">
                        <span className="font-mono font-bold text-purple-400 block uppercase">T - Temporal</span>
                        <p className="text-[11px] text-zinc-400">{meta.timeBound || "Qual o prazo limite final?"}</p>
                      </div>
                    </div>

                    {/* Connected Projects */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-zinc-300">Sub-projetos Integrados</span>
                        <button
                          onClick={() => { setSelectedMetaId(meta.id); setShowAddProjModal(true); }}
                          className="text-[10px] text-emerald-400 hover:text-emerald-300 font-medium flex items-center gap-1"
                        >
                          <Plus className="w-3.5 h-3.5" /> Adicionar Projeto
                        </button>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {metaProjects.length === 0 ? (
                          <div className="col-span-2 text-center py-4 bg-zinc-950 rounded-lg text-xs text-zinc-600 italic">
                            Sem sub-projetos vinculados. Crie um projeto para agrupar tarefas.
                          </div>
                        ) : (
                          metaProjects.map(proj => {
                            const pTasks = tasks.filter(t => t.projectId === proj.id);
                            const doneTasks = pTasks.filter(t => t.completed);
                            const progressPercent = pTasks.length > 0 ? Math.round((doneTasks.length / pTasks.length) * 100) : 0;

                            return (
                              <div key={proj.id} className="bg-zinc-950 border border-zinc-850 p-3.5 rounded-lg flex flex-col justify-between">
                                <div>
                                  <div className="flex justify-between items-start gap-2">
                                    <h4 className="text-xs font-bold text-zinc-200">{proj.title}</h4>
                                    <div className="flex items-center gap-1.5">
                                      <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: proj.color }} />
                                      <button
                                        onClick={() => onDeleteProject(proj.id)}
                                        className="text-zinc-600 hover:text-red-400"
                                      >
                                        <Trash2 className="w-3.5 h-3.5" />
                                      </button>
                                    </div>
                                  </div>
                                  <p className="text-[11px] text-zinc-500 mt-0.5 line-clamp-1">{proj.description}</p>
                                </div>

                                <div className="mt-3 space-y-1.5">
                                  <div className="flex justify-between text-[10px] font-mono text-zinc-500">
                                    <span>Progresso</span>
                                    <span>{progressPercent}% ({doneTasks.length}/{pTasks.length})</span>
                                  </div>
                                  <div className="w-full bg-zinc-800 h-1 rounded-full overflow-hidden">
                                    <div className="h-full rounded-full transition-all duration-300" style={{ width: `${progressPercent}%`, backgroundColor: proj.color }} />
                                  </div>
                                </div>
                              </div>
                            );
                          })
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* RIGHT: LOCAL REFERENCE ATTACHMENTS (4 Columns) */}
          <div className="lg:col-span-4 space-y-5">
            <div className="bg-[#121214] border border-[#222226] rounded-xl p-5">
              <h3 className="font-display font-semibold text-white text-sm flex items-center gap-2 mb-2">
                <Paperclip className="w-4.5 h-4.5 text-emerald-400" />
                Dossiê e Referências de Projetos
              </h3>
              <p className="text-xs text-zinc-500 mb-4 leading-relaxed">
                Adicione hiperlinks de design figma, doc do google docs, escopo técnico do GitHub ou notas de rascunho de referência para cada projeto!
              </p>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-zinc-400 mb-1">Selecione o Projeto</label>
                  <select
                    value={selectedProjectIdForNotes || ""}
                    onChange={(e) => setSelectedProjectIdForNotes(e.target.value || null)}
                    className="w-full bg-[#18181b] border border-zinc-800 rounded-lg px-2.5 py-2 text-xs text-zinc-300 focus:outline-none focus:border-emerald-500"
                    id="select-project-attachment"
                  >
                    <option value="">-- Escolha um Projeto --</option>
                    {projects.map(p => (
                      <option key={p.id} value={p.id}>{p.title}</option>
                    ))}
                  </select>
                </div>

                {selectedProjectIdForNotes && (
                  <form onSubmit={handleAddAttachment} className="space-y-3 p-3 bg-zinc-900/60 border border-zinc-800 rounded-lg">
                    <div>
                      <input
                        type="text"
                        placeholder="Nome do anexo (ex: Escopo Figma)"
                        value={newNoteTitle}
                        onChange={(e) => setNewNoteTitle(e.target.value)}
                        className="w-full bg-[#18181b] border border-zinc-800 rounded px-2.5 py-1.5 text-xs text-zinc-300"
                        required
                        id="note-title-input"
                      />
                    </div>
                    <div>
                      <input
                        type="text"
                        placeholder="URL ou texto de rascunho"
                        value={newNoteContent}
                        onChange={(e) => setNewNoteContent(e.target.value)}
                        className="w-full bg-[#18181b] border border-zinc-800 rounded px-2.5 py-1.5 text-xs text-zinc-300"
                        id="note-url-input"
                      />
                    </div>
                    <button
                      type="submit"
                      className="w-full bg-zinc-800 hover:bg-zinc-700 text-white font-semibold text-xs py-1.5 rounded transition-colors"
                      id="save-attachment-btn"
                    >
                      Anexar Referência
                    </button>
                  </form>
                )}

                {/* List Attachments for Selected Project */}
                {selectedProjectIdForNotes && (
                  <div className="space-y-2">
                    <span className="text-xs font-semibold text-zinc-400 block">Referências Anexadas</span>
                    {(!projectAttachments[selectedProjectIdForNotes] || projectAttachments[selectedProjectIdForNotes].length === 0) ? (
                      <p className="text-[10px] text-zinc-600 italic">Nenhum anexo adicionado a este projeto.</p>
                    ) : (
                      <div className="space-y-1.5">
                        {projectAttachments[selectedProjectIdForNotes].map((att, idx) => (
                          <div key={idx} className="p-2 bg-zinc-950 border border-zinc-850 rounded flex justify-between items-center text-xs">
                            <span className="text-zinc-300 font-medium truncate max-w-[180px]">{att.title}</span>
                            <a
                              href={att.link}
                              target="_blank"
                              referrerPolicy="no-referrer"
                              rel="noreferrer"
                              className="text-emerald-400 hover:text-emerald-300 flex items-center gap-0.5 text-[10px]"
                            >
                              <Link2 className="w-3 h-3" /> Abrir
                            </a>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

        </div>
      )}

      {/* DIALOG: CREATE METAS MODAL */}
      {showAddMetaModal && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in" id="add-meta-modal-overlay">
          <div className="bg-[#121214] border border-zinc-800 rounded-xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto" id="add-meta-modal-content">
            <h3 className="font-display font-bold text-lg text-white mb-2">Estruturar Nova Meta SMART</h3>
            <p className="text-xs text-zinc-400 mb-6">Metas vagas geram paralisia por análise. O método SMART força cada meta a ser específica, mensurável e temporal.</p>

            <form onSubmit={handleCreateMeta} className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="block text-xs font-medium text-zinc-400">Título Geral da Meta</label>
                  <input
                    type="text"
                    required
                    value={metaTitle}
                    onChange={(e) => setMetaTitle(e.target.value)}
                    placeholder="Ex: Lançar MVP do Aplicativo"
                    className="w-full bg-[#18181b] border border-zinc-800 rounded-lg px-3 py-2 text-sm text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-xs font-medium text-zinc-400">Prazo Limite Alvo</label>
                  <input
                    type="date"
                    required
                    value={metaTargetDate}
                    onChange={(e) => setMetaTargetDate(e.target.value)}
                    className="w-full bg-[#18181b] border border-zinc-800 rounded-lg px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-400 mb-1">Descrição Curta</label>
                <input
                  type="text"
                  value={metaDesc}
                  onChange={(e) => setMetaDesc(e.target.value)}
                  placeholder="Explicação resumida do escopo do objetivo..."
                  className="w-full bg-[#18181b] border border-zinc-800 rounded-lg px-3 py-2 text-sm text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-emerald-500"
                />
              </div>

              {/* SMART Pillars */}
              <div className="bg-zinc-900/60 p-4 border border-zinc-800 rounded-xl space-y-3">
                <h4 className="text-xs font-semibold text-zinc-300 uppercase tracking-wider font-mono">Detalhamento dos Critérios</h4>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <label className="block text-[11px] font-semibold text-emerald-400 uppercase">S - Específica</label>
                    <input
                      type="text"
                      placeholder="O quê, como e quem? Ex: Concluir MVP com 3 telas centrais"
                      value={metaS}
                      onChange={(e) => setMetaS(e.target.value)}
                      className="w-full bg-[#18181b] border border-zinc-800 rounded px-2.5 py-1.5 text-xs text-zinc-100 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-blue-400 uppercase">M - Mensurável</label>
                    <input
                      type="text"
                      placeholder="Como medir? Ex: Ter 10 usuários ativos testando"
                      value={metaM}
                      onChange={(e) => setMetaM(e.target.value)}
                      className="w-full bg-[#18181b] border border-zinc-800 rounded px-2.5 py-1.5 text-xs text-zinc-100 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-amber-400 uppercase">A - Atingível</label>
                    <input
                      type="text"
                      placeholder="É viável? Ex: Usando no-code ou frameworks prontos"
                      value={metaA}
                      onChange={(e) => setMetaA(e.target.value)}
                      className="w-full bg-[#18181b] border border-zinc-800 rounded px-2.5 py-1.5 text-xs text-zinc-100 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-red-400 uppercase">R - Relevante</label>
                    <input
                      type="text"
                      placeholder="Qual impacto? Ex: Validar o negócio antes de investir"
                      value={metaR}
                      onChange={(e) => setMetaR(e.target.value)}
                      className="w-full bg-[#18181b] border border-zinc-800 rounded px-2.5 py-1.5 text-xs text-zinc-100 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="mt-2">
                  <label className="block text-[11px] font-semibold text-purple-400 uppercase">T - Temporal (Definição de Datas)</label>
                  <input
                    type="text"
                    placeholder="Quais os checkpoints de data? Ex: Conclusão total em 4 semanas"
                    value={metaT}
                    onChange={(e) => setMetaT(e.target.value)}
                    className="w-full bg-[#18181b] border border-zinc-800 rounded px-2.5 py-1.5 text-xs text-zinc-100 focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex gap-3 justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddMetaModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-zinc-400 hover:text-white"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-semibold text-xs px-5 py-2 rounded-lg transition-colors"
                >
                  Criar Objetivo
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DIALOG: CREATE PROJECT MODAL */}
      {showAddProjModal && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in" id="add-proj-modal-overlay">
          <div className="bg-[#121214] border border-zinc-800 rounded-xl p-5 max-w-md w-full" id="add-proj-modal-content">
            <h3 className="font-display font-semibold text-white text-base mb-4">Adicionar Sub-projeto</h3>

            <form onSubmit={handleCreateProject} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-zinc-400 mb-1">Título do Projeto</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Desenvolvimento Frontend"
                  value={projTitle}
                  onChange={(e) => setProjTitle(e.target.value)}
                  className="w-full bg-[#18181b] border border-zinc-800 rounded-lg px-3 py-2 text-sm text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-400 mb-1">Descrição</label>
                <input
                  type="text"
                  placeholder="Breve sumário..."
                  value={projDesc}
                  onChange={(e) => setProjDesc(e.target.value)}
                  className="w-full bg-[#18181b] border border-zinc-800 rounded-lg px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-zinc-400 mb-1">Selecione uma Cor</label>
                  <input
                    type="color"
                    value={projColor}
                    onChange={(e) => setProjColor(e.target.value)}
                    className="w-full h-9 bg-transparent border-none cursor-pointer rounded overflow-hidden"
                  />
                </div>
              </div>

              <div className="flex gap-3 justify-end pt-3">
                <button
                  type="button"
                  onClick={() => setShowAddProjModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-zinc-400 hover:text-white"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-semibold text-xs px-4 py-2 rounded-lg transition-colors"
                >
                  Vincular Projeto
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
