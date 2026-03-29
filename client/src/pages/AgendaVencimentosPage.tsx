import { useState, useEffect, useMemo } from "react";
import { trpc } from "@/lib/trpc";
import { useLocation } from "wouter";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import {
  CalendarClock,
  Calendar,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Clock,
  XCircle,
} from "lucide-react";
import { FunctionTutorialButton } from "@/components/FunctionTutorial";
import { IndiceFuncoesButton } from "@/components/IndiceFuncoesButton";

// Importar a página existente
import AgendaVencimentos from "./AgendaVencimentos";

export default function AgendaVencimentosPage() {
  const [, setLocation] = useLocation();
  const [condominioId, setCondominioId] = useState<number | null>(null);

  // Buscar organizações do usuário
  const { data: condominios } = trpc.condominio.list.useQuery();

  // Selecionar primeiro condomínio automaticamente
  useEffect(() => {
    if (condominios && condominios.length > 0 && !condominioId) {
      setCondominioId(condominios[0].id);
    }
  }, [condominios, condominioId]);

  // Buscar estatísticas de vencimentos
  const { data: estatisticasData } = trpc.vencimentosDashboard.estatisticasGerais.useQuery(
    { condominioId: condominioId! },
    { enabled: !!condominioId }
  );

  // Calcular estatísticas
  const estatisticas = useMemo(() => {
    if (!estatisticasData) return { total: 0, vencidos: 0, proximos: 0, emDia: 0 };

    return {
      total: estatisticasData.total || 0,
      vencidos: estatisticasData.vencidos || 0,
      proximos: estatisticasData.proximos30dias || 0,
      emDia: estatisticasData.ativos || 0,
    };
  }, [estatisticasData]);

  return (
    <div className="p-6 space-y-6">
      {/* Container Premium - Agenda de Vencimentos */}
      <div data-tour="header-agenda" className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-orange-500 via-orange-600 to-amber-600 p-6 shadow-2xl">
        {/* Elementos decorativos de fundo */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-amber-400/20 rounded-full translate-y-1/2 -translate-x-1/2 blur-2xl" />
        <div className="absolute top-1/2 left-1/2 w-32 h-32 bg-white/5 rounded-full -translate-x-1/2 -translate-y-1/2" />
        
        {/* Conteúdo do Header */}
        <div className="relative z-10">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-white/20 backdrop-blur-sm rounded-2xl shadow-lg border border-white/30">
                <CalendarClock className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-white drop-shadow-md">
                  Agenda de Vencimentos
                </h1>
                <p className="text-white/80 text-sm mt-1">
                  Controle contratos, serviços e manutenções programadas
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <IndiceFuncoesButton />
              <FunctionTutorialButton tutorialId="agenda-vencimentos" />
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
        </div>
      </div>

      {/* Cards de Estatísticas */}
      <div data-tour="stats-cards" className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-gray-50 hover:shadow-xl transition-shadow overflow-hidden relative">
          <CardContent className="p-4 min-h-[100px]">
            <div>
              <p className="text-sm text-gray-500 font-medium">Total</p>
              <p className="text-3xl font-bold text-gray-900">{estatisticas.total}</p>
            </div>
            <div className="absolute bottom-2 right-2 p-2 bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl shadow-inner opacity-80">
              <FileText className="h-5 w-5 text-gray-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-red-50 to-white hover:shadow-xl transition-shadow overflow-hidden relative">
          <CardContent className="p-4 min-h-[100px]">
            <div>
              <p className="text-sm text-red-600 font-medium">Vencidos</p>
              <p className="text-3xl font-bold text-red-600">{estatisticas.vencidos}</p>
            </div>
            <div className="absolute bottom-2 right-2 p-2 bg-gradient-to-br from-red-100 to-red-200 rounded-xl shadow-inner opacity-80">
              <XCircle className="h-5 w-5 text-red-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-amber-50 to-white hover:shadow-xl transition-shadow overflow-hidden relative">
          <CardContent className="p-4 min-h-[100px]">
            <div>
              <p className="text-sm text-amber-600 font-medium">Próximos 7 dias</p>
              <p className="text-3xl font-bold text-amber-600">{estatisticas.proximos}</p>
            </div>
            <div className="absolute bottom-2 right-2 p-2 bg-gradient-to-br from-amber-100 to-amber-200 rounded-xl shadow-inner opacity-80">
              <AlertTriangle className="h-5 w-5 text-amber-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-green-50 to-white hover:shadow-xl transition-shadow overflow-hidden relative">
          <CardContent className="p-4 min-h-[100px]">
            <div>
              <p className="text-sm text-green-600 font-medium">Em Dia</p>
              <p className="text-3xl font-bold text-green-600">{estatisticas.emDia}</p>
            </div>
            <div className="absolute bottom-2 right-2 p-2 bg-gradient-to-br from-green-100 to-green-200 rounded-xl shadow-inner opacity-80">
              <CheckCircle2 className="h-5 w-5 text-green-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Conteúdo Principal - Página existente */}
      <div data-tour="tabs-agenda">
      {condominioId ? (
        <AgendaVencimentos condominioIdProp={condominioId} />
      ) : (
        <Card className="border-0 shadow-md">
          <CardContent className="p-12 text-center">
            <div className="mx-auto w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mb-4">
              <CalendarClock className="h-8 w-8 text-orange-500" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Nenhuma organização encontrada
            </h3>
            <p className="text-gray-500">
              Cadastre uma organização para começar a gerenciar vencimentos.
            </p>
          </CardContent>
        </Card>
      )}
      </div>
    </div>
  );
}
