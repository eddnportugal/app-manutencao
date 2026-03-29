import { useState, useMemo } from "react";
import { trpc } from "@/lib/trpc";
import { useLocation } from "wouter";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import {
  Clock,
  History,
  BarChart3,
  Calendar,
  CheckCircle2,
  AlertTriangle,
  FileText,
  TrendingUp,
} from "lucide-react";

import { FunctionTutorialButton } from "@/components/FunctionTutorial";
import { IndiceFuncoesButton } from "@/components/IndiceFuncoesButton";

// Importar as páginas existentes
import TimelinePage from "./TimelinePage";
import TimelineHistoricoPage from "./TimelineHistoricoPage";
import TimelineDashboardPage from "./TimelineDashboardPage";

export default function TimelineUnificadaPage() {
  const [, setLocation] = useLocation();
  const [condominioId, setCondominioId] = useState<number | null>(null);
  const [abaAtiva, setAbaAtiva] = useState("historico");

  // Buscar organizações do usuário
  const { data: condominios } = trpc.condominio.list.useQuery();

  // Selecionar primeiro condomínio automaticamente
  useMemo(() => {
    if (condominios && condominios.length > 0 && !condominioId) {
      setCondominioId(condominios[0].id);
    }
  }, [condominios, condominioId]);

  // Buscar estatísticas para o header
  const { data: estatisticas } = trpc.timeline.estatisticas.useQuery(
    { condominioId: condominioId!, periodo: "30dias" },
    { enabled: !!condominioId }
  );

  // Buscar resumo rápido
  const { data: resumo } = trpc.timeline.resumoRapido.useQuery(
    { condominioId: condominioId! },
    { enabled: !!condominioId }
  );

  return (
    <div className="p-3 md:p-6 space-y-4 md:space-y-6">
      {/* Container Premium - Timeline */}
      <div data-tour="header-timeline" className="relative overflow-hidden rounded-2xl md:rounded-3xl bg-gradient-to-br from-orange-500 via-orange-600 to-amber-600 p-4 md:p-6 shadow-2xl">
        {/* Elementos decorativos de fundo */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-amber-400/20 rounded-full translate-y-1/2 -translate-x-1/2 blur-2xl" />
        <div className="absolute top-1/2 left-1/2 w-32 h-32 bg-white/5 rounded-full -translate-x-1/2 -translate-y-1/2" />
        
        {/* Conteúdo do Header */}
        <div className="relative z-10">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 md:gap-4 mb-4 md:mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2.5 md:p-3 bg-white/20 backdrop-blur-sm rounded-xl md:rounded-2xl shadow-lg border border-white/30">
                <Clock className="h-6 w-6 md:h-8 md:w-8 text-white" />
              </div>
              <div>
                <h1 className="text-xl md:text-3xl font-bold text-white drop-shadow-md">
                  Timeline
                </h1>
                <p className="text-white/80 text-xs md:text-sm mt-0.5">
                  Gerencie cronogramas, histórico e visualize dashboards
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <IndiceFuncoesButton />
              <FunctionTutorialButton tutorialId="timeline" variant="compact" />
            </div>

            {/* Seletor de Organização */}
            {condominios && condominios.length > 1 && (
              <Select
                value={condominioId?.toString()}
                onValueChange={(v) => setCondominioId(Number(v))}
              >
                <SelectTrigger className="w-[200px] bg-white/20 border-white/30 text-white backdrop-blur-sm">
                  <SelectValue placeholder="Selecione a organização" />
                </SelectTrigger>
                <SelectContent>
                  {condominios.map((c) => (
                    <SelectItem key={c.id} value={c.id.toString()}>
                      {c.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>

          {/* Tabs dentro do header premium */}
          <div className="w-full">
            <div className="flex w-full bg-white/15 backdrop-blur-sm rounded-xl p-1 border border-white/30">
              <button
                onClick={() => setAbaAtiva("historico")}
                className={`flex-1 flex items-center justify-center gap-1.5 px-2 md:px-4 py-2 rounded-lg text-xs md:text-sm font-medium transition-all ${
                  abaAtiva === "historico"
                    ? "bg-white text-teal-600 shadow-md"
                    : "text-white hover:bg-white/10"
                }`}
              >
                <History className="h-3.5 w-3.5 md:h-4 md:w-4 shrink-0" />
                <span className="truncate">Histórico</span>
              </button>
              <button
                onClick={() => setAbaAtiva("dashboard")}
                className={`flex-1 flex items-center justify-center gap-1.5 px-2 md:px-4 py-2 rounded-lg text-xs md:text-sm font-medium transition-all ${
                  abaAtiva === "dashboard"
                    ? "bg-white text-teal-600 shadow-md"
                    : "text-white hover:bg-white/10"
                }`}
              >
                <BarChart3 className="h-3.5 w-3.5 md:h-4 md:w-4 shrink-0" />
                <span className="truncate">Dashboard</span>
              </button>
              <button
                onClick={() => setAbaAtiva("nova")}
                className={`flex-1 flex items-center justify-center gap-1.5 px-2 md:px-4 py-2 rounded-lg text-xs md:text-sm font-medium transition-all ${
                  abaAtiva === "nova"
                    ? "bg-white text-teal-600 shadow-md"
                    : "text-white hover:bg-white/10"
                }`}
              >
                <Clock className="h-3.5 w-3.5 md:h-4 md:w-4 shrink-0" />
                <span className="truncate">Nova</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Cards de Estatísticas */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-gray-50 hover:shadow-xl transition-shadow overflow-hidden relative">
          <CardContent className="p-4 min-h-[100px]">
            <div>
              <p className="text-sm text-gray-500 font-medium">Total Ativas</p>
              <p className="text-3xl font-bold text-gray-900">{resumo?.totalAtivas || 0}</p>
            </div>
            <div className="absolute bottom-2 right-2 p-2 bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl shadow-inner opacity-80">
              <FileText className="h-5 w-5 text-gray-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-white hover:shadow-xl transition-shadow overflow-hidden relative">
          <CardContent className="p-4 min-h-[100px]">
            <div>
              <p className="text-sm text-blue-600 font-medium">Em Andamento</p>
              <p className="text-3xl font-bold text-blue-600">{resumo?.emAndamento || 0}</p>
            </div>
            <div className="absolute bottom-2 right-2 p-2 bg-gradient-to-br from-blue-100 to-blue-200 rounded-xl shadow-inner opacity-80">
              <TrendingUp className="h-5 w-5 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-amber-50 to-white hover:shadow-xl transition-shadow overflow-hidden relative">
          <CardContent className="p-4 min-h-[100px]">
            <div>
              <p className="text-sm text-amber-600 font-medium">Pendentes</p>
              <p className="text-3xl font-bold text-amber-600">{resumo?.pendentes || 0}</p>
            </div>
            <div className="absolute bottom-2 right-2 p-2 bg-gradient-to-br from-amber-100 to-amber-200 rounded-xl shadow-inner opacity-80">
              <AlertTriangle className="h-5 w-5 text-amber-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-green-50 to-white hover:shadow-xl transition-shadow overflow-hidden relative">
          <CardContent className="p-4 min-h-[100px]">
            <div>
              <p className="text-sm text-green-600 font-medium">Finalizadas Hoje</p>
              <p className="text-3xl font-bold text-green-600">{resumo?.finalizadasHoje || 0}</p>
            </div>
            <div className="absolute bottom-2 right-2 p-2 bg-gradient-to-br from-green-100 to-green-200 rounded-xl shadow-inner opacity-80">
              <CheckCircle2 className="h-5 w-5 text-green-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Conteúdo das Abas */}
      {condominioId && (
        <div className="min-h-[400px]">
          {abaAtiva === "historico" && (
            <TimelineHistoricoPage condominioId={condominioId} />
          )}
          {abaAtiva === "dashboard" && (
            <TimelineDashboardPage condominioId={condominioId} />
          )}
          {abaAtiva === "nova" && (
            <TimelinePage condominioId={condominioId} />
          )}
        </div>
      )}

      {/* Mensagem se não houver organização */}
      {!condominioId && (
        <Card className="border-0 shadow-md">
          <CardContent className="p-12 text-center">
            <div className="mx-auto w-16 h-16 bg-teal-100 rounded-full flex items-center justify-center mb-4">
              <Clock className="h-8 w-8 text-teal-500" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Nenhuma organização encontrada
            </h3>
            <p className="text-gray-500">
              Cadastre uma organização para começar a usar a Timeline.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
