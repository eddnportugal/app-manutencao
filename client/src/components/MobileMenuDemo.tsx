import { useState } from "react";
import {
  Home,
  Zap,
  ClipboardList,
  BarChart3,
  Wrench,
  AlertTriangle,
  CheckSquare,
  Clock,
  Calendar,
  History,
  Building2,
  Users,
  Share2,
  FileText,
} from "lucide-react";

// Dados dos menus para demonstração
const menuItems = {
  principal: [
    { icon: Home, label: "Início", gradient: "from-blue-500 to-indigo-600" },
    { icon: Zap, label: "Funções Rápidas", gradient: "from-amber-400 to-orange-500" },
    { icon: ClipboardList, label: "Funções Completas", gradient: "from-emerald-400 to-teal-500" },
    { icon: BarChart3, label: "Índice", gradient: "from-purple-400 to-pink-500" },
  ],
  operacionais: [
    { icon: FileText, label: "Vistorias", gradient: "from-blue-400 to-cyan-500" },
    { icon: Wrench, label: "Manutenções", gradient: "from-orange-400 to-red-500" },
    { icon: AlertTriangle, label: "Ocorrências", gradient: "from-red-400 to-rose-500" },
    { icon: CheckSquare, label: "Checklists", gradient: "from-green-400 to-emerald-500" },
  ],
  timeline: [
    { icon: Clock, label: "Timeline", gradient: "from-cyan-400 to-blue-500" },
    { icon: Calendar, label: "Vencimentos", gradient: "from-violet-400 to-purple-500" },
    { icon: History, label: "Histórico", gradient: "from-slate-400 to-gray-500" },
  ],
  gestao: [
    { icon: Building2, label: "Cadastro", gradient: "from-teal-400 to-cyan-500" },
    { icon: Users, label: "Equipe", gradient: "from-blue-400 to-indigo-500" },
    { icon: Share2, label: "Compartilhar", gradient: "from-pink-400 to-rose-500" },
  ],
};

// MODELO A: Grid Premium com Gradientes
function ModeloA() {
  return (
    <div className="p-4 bg-gray-50 rounded-2xl">
      <h3 className="text-lg font-bold text-gray-800 mb-4">Modelo A: Gradientes Bold</h3>
      
      {/* Principal */}
      <div className="mb-6">
        <p className="text-xs font-semibold text-blue-600 uppercase tracking-wider mb-3">Principal</p>
        <div className="grid grid-cols-4 gap-3">
          {menuItems.principal.map((item, i) => (
            <div key={i} className="flex flex-col items-center">
              <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${item.gradient} flex items-center justify-center shadow-lg shadow-black/20 hover:scale-105 transition-transform cursor-pointer`}>
                <item.icon className="w-7 h-7 text-white" />
              </div>
              <span className="mt-2 text-xs font-medium text-gray-700 text-center leading-tight">{item.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Operacionais */}
      <div className="mb-6">
        <p className="text-xs font-semibold text-orange-600 uppercase tracking-wider mb-3">Funções Operacionais</p>
        <div className="grid grid-cols-4 gap-3">
          {menuItems.operacionais.map((item, i) => (
            <div key={i} className="flex flex-col items-center">
              <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${item.gradient} flex items-center justify-center shadow-lg shadow-black/20 hover:scale-105 transition-transform cursor-pointer`}>
                <item.icon className="w-7 h-7 text-white" />
              </div>
              <span className="mt-2 text-xs font-medium text-gray-700 text-center leading-tight">{item.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Timeline */}
      <div className="mb-6">
        <p className="text-xs font-semibold text-purple-600 uppercase tracking-wider mb-3">Timeline & Histórico</p>
        <div className="grid grid-cols-4 gap-3">
          {menuItems.timeline.map((item, i) => (
            <div key={i} className="flex flex-col items-center">
              <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${item.gradient} flex items-center justify-center shadow-lg shadow-black/20 hover:scale-105 transition-transform cursor-pointer`}>
                <item.icon className="w-7 h-7 text-white" />
              </div>
              <span className="mt-2 text-xs font-medium text-gray-700 text-center leading-tight">{item.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// MODELO B: Glassmorphism
function ModeloB() {
  return (
    <div className="p-4 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 rounded-2xl">
      <h3 className="text-lg font-bold text-white mb-4">Modelo B: Glassmorphism</h3>
      
      {/* Principal */}
      <div className="mb-6">
        <p className="text-xs font-semibold text-white/80 uppercase tracking-wider mb-3">Principal</p>
        <div className="grid grid-cols-4 gap-3">
          {menuItems.principal.map((item, i) => (
            <div key={i} className="flex flex-col items-center">
              <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-xl border border-white/30 flex items-center justify-center hover:bg-white/30 transition-all cursor-pointer shadow-lg">
                <item.icon className="w-7 h-7 text-white" />
              </div>
              <span className="mt-2 text-xs font-medium text-white text-center leading-tight drop-shadow">{item.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Operacionais */}
      <div className="mb-6">
        <p className="text-xs font-semibold text-white/80 uppercase tracking-wider mb-3">Funções Operacionais</p>
        <div className="grid grid-cols-4 gap-3">
          {menuItems.operacionais.map((item, i) => (
            <div key={i} className="flex flex-col items-center">
              <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-xl border border-white/30 flex items-center justify-center hover:bg-white/30 transition-all cursor-pointer shadow-lg">
                <item.icon className="w-7 h-7 text-white" />
              </div>
              <span className="mt-2 text-xs font-medium text-white text-center leading-tight drop-shadow">{item.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Timeline */}
      <div className="mb-6">
        <p className="text-xs font-semibold text-white/80 uppercase tracking-wider mb-3">Timeline & Histórico</p>
        <div className="grid grid-cols-4 gap-3">
          {menuItems.timeline.map((item, i) => (
            <div key={i} className="flex flex-col items-center">
              <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-xl border border-white/30 flex items-center justify-center hover:bg-white/30 transition-all cursor-pointer shadow-lg">
                <item.icon className="w-7 h-7 text-white" />
              </div>
              <span className="mt-2 text-xs font-medium text-white text-center leading-tight drop-shadow">{item.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// MODELO C: Circular com Anel Gradiente
function ModeloC() {
  return (
    <div className="p-4 bg-white rounded-2xl">
      <h3 className="text-lg font-bold text-gray-800 mb-4">Modelo C: Circular Outline</h3>
      
      {/* Principal */}
      <div className="mb-6">
        <p className="text-xs font-semibold text-blue-600 uppercase tracking-wider mb-3">Principal</p>
        <div className="grid grid-cols-4 gap-4">
          {menuItems.principal.map((item, i) => (
            <div key={i} className="flex flex-col items-center">
              <div className={`w-16 h-16 rounded-full p-[3px] bg-gradient-to-br ${item.gradient}`}>
                <div className="w-full h-full rounded-full bg-white flex items-center justify-center hover:bg-gray-50 transition-colors cursor-pointer">
                  <item.icon className={`w-6 h-6 bg-gradient-to-br ${item.gradient} bg-clip-text`} style={{ color: 'transparent', background: `linear-gradient(135deg, var(--tw-gradient-stops))`, WebkitBackgroundClip: 'text' }} />
                </div>
              </div>
              <span className="mt-2 text-xs font-medium text-gray-700 text-center leading-tight">{item.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Operacionais */}
      <div className="mb-6">
        <p className="text-xs font-semibold text-orange-600 uppercase tracking-wider mb-3">Funções Operacionais</p>
        <div className="grid grid-cols-4 gap-4">
          {menuItems.operacionais.map((item, i) => (
            <div key={i} className="flex flex-col items-center">
              <div className={`w-16 h-16 rounded-full p-[3px] bg-gradient-to-br ${item.gradient}`}>
                <div className="w-full h-full rounded-full bg-white flex items-center justify-center hover:bg-gray-50 transition-colors cursor-pointer">
                  <item.icon className="w-6 h-6 text-gray-600" />
                </div>
              </div>
              <span className="mt-2 text-xs font-medium text-gray-700 text-center leading-tight">{item.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Timeline */}
      <div className="mb-6">
        <p className="text-xs font-semibold text-purple-600 uppercase tracking-wider mb-3">Timeline & Histórico</p>
        <div className="grid grid-cols-4 gap-4">
          {menuItems.timeline.map((item, i) => (
            <div key={i} className="flex flex-col items-center">
              <div className={`w-16 h-16 rounded-full p-[3px] bg-gradient-to-br ${item.gradient}`}>
                <div className="w-full h-full rounded-full bg-white flex items-center justify-center hover:bg-gray-50 transition-colors cursor-pointer">
                  <item.icon className="w-6 h-6 text-gray-600" />
                </div>
              </div>
              <span className="mt-2 text-xs font-medium text-gray-700 text-center leading-tight">{item.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// MODELO D: Cards Minimalistas com Accent
function ModeloD() {
  const accentColors: Record<string, string> = {
    "from-blue-500 to-indigo-600": "bg-blue-500",
    "from-amber-400 to-orange-500": "bg-orange-500",
    "from-emerald-400 to-teal-500": "bg-emerald-500",
    "from-purple-400 to-pink-500": "bg-purple-500",
    "from-blue-400 to-cyan-500": "bg-cyan-500",
    "from-orange-400 to-red-500": "bg-orange-500",
    "from-red-400 to-rose-500": "bg-red-500",
    "from-green-400 to-emerald-500": "bg-green-500",
    "from-cyan-400 to-blue-500": "bg-cyan-500",
    "from-violet-400 to-purple-500": "bg-violet-500",
    "from-slate-400 to-gray-500": "bg-slate-500",
    "from-teal-400 to-cyan-500": "bg-teal-500",
    "from-blue-400 to-indigo-500": "bg-indigo-500",
    "from-pink-400 to-rose-500": "bg-pink-500",
  };

  return (
    <div className="p-4 bg-gray-100 rounded-2xl">
      <h3 className="text-lg font-bold text-gray-800 mb-4">Modelo D: Minimal Accent</h3>
      
      {/* Principal */}
      <div className="mb-6">
        <p className="text-xs font-semibold text-blue-600 uppercase tracking-wider mb-3">Principal</p>
        <div className="grid grid-cols-3 gap-3">
          {menuItems.principal.slice(0, 3).map((item, i) => (
            <div key={i} className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow cursor-pointer">
              <div className={`h-1.5 ${accentColors[item.gradient] || 'bg-gray-400'}`} />
              <div className="p-4 flex flex-col items-center">
                <item.icon className="w-8 h-8 text-gray-600 mb-2" />
                <span className="text-xs font-semibold text-gray-800 text-center">{item.label}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Operacionais */}
      <div className="mb-6">
        <p className="text-xs font-semibold text-orange-600 uppercase tracking-wider mb-3">Funções Operacionais</p>
        <div className="grid grid-cols-3 gap-3">
          {menuItems.operacionais.slice(0, 3).map((item, i) => (
            <div key={i} className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow cursor-pointer">
              <div className={`h-1.5 ${accentColors[item.gradient] || 'bg-gray-400'}`} />
              <div className="p-4 flex flex-col items-center">
                <item.icon className="w-8 h-8 text-gray-600 mb-2" />
                <span className="text-xs font-semibold text-gray-800 text-center">{item.label}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Timeline */}
      <div className="mb-6">
        <p className="text-xs font-semibold text-purple-600 uppercase tracking-wider mb-3">Timeline & Histórico</p>
        <div className="grid grid-cols-3 gap-3">
          {menuItems.timeline.map((item, i) => (
            <div key={i} className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow cursor-pointer">
              <div className={`h-1.5 ${accentColors[item.gradient] || 'bg-gray-400'}`} />
              <div className="p-4 flex flex-col items-center">
                <item.icon className="w-8 h-8 text-gray-600 mb-2" />
                <span className="text-xs font-semibold text-gray-800 text-center">{item.label}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Componente principal de demonstração
export default function MobileMenuDemo() {
  const [selectedModel, setSelectedModel] = useState<string | null>(null);

  return (
    <div className="min-h-screen bg-gray-200 p-4">
      <div className="max-w-md mx-auto">
        <h1 className="text-2xl font-bold text-center text-gray-800 mb-2">
          Modelos de Menu Mobile
        </h1>
        <p className="text-sm text-center text-gray-600 mb-6">
          Escolha o modelo que mais agrada
        </p>

        {/* Seletor de modelo */}
        <div className="flex gap-2 mb-6 justify-center">
          {["A", "B", "C", "D"].map((m) => (
            <button
              key={m}
              onClick={() => setSelectedModel(selectedModel === m ? null : m)}
              className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                selectedModel === m
                  ? "bg-orange-500 text-white shadow-lg"
                  : "bg-white text-gray-700 hover:bg-gray-100"
              }`}
            >
              Modelo {m}
            </button>
          ))}
        </div>

        {/* Mostrar todos ou apenas o selecionado */}
        <div className="space-y-6">
          {(!selectedModel || selectedModel === "A") && <ModeloA />}
          {(!selectedModel || selectedModel === "B") && <ModeloB />}
          {(!selectedModel || selectedModel === "C") && <ModeloC />}
          {(!selectedModel || selectedModel === "D") && <ModeloD />}
        </div>

        {/* Botão de confirmação */}
        {selectedModel && (
          <div className="mt-6 p-4 bg-white rounded-xl shadow-lg">
            <p className="text-center text-gray-700 mb-3">
              Você selecionou o <strong>Modelo {selectedModel}</strong>
            </p>
            <button className="w-full py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all">
              Aplicar Este Modelo
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
