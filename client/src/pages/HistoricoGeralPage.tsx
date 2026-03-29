import { useState, useMemo } from "react";
import { trpc } from "@/lib/trpc";
import { IndiceFuncoesButton } from "@/components/IndiceFuncoesButton";
import { useLocation } from "wouter";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import {
  History,
  FileText,
  CheckCircle2,
  Clock,
  AlertTriangle,
  ClipboardCheck,
  Wrench,
  ListChecks,
  Zap,
} from "lucide-react";

// Importar a página existente
import HistoricoAtividadesPage from "./HistoricoAtividades";

export default function HistoricoGeralPage() {
  const [, setLocation] = useLocation();
  const [condominioId, setCondominioId] = useState<number | null>(null);

  // Buscar organizações do usuário
  const { data: condominios } = trpc.condominio.list.useQuery();

  // Selecionar primeiro condomínio automaticamente
  useMemo(() => {
    if (condominios && condominios.length > 0 && !condominioId) {
      setCondominioId(condominios[0].id);
    }
  }, [condominios, condominioId]);

  // Buscar dados para estatísticas
  const { data: vistorias } = trpc.vistoria.list.useQuery(
    { condominioId: condominioId! },
    { enabled: !!condominioId }
  );

  const { data: manutencoes } = trpc.manutencao.list.useQuery(
    { condominioId: condominioId! },
    { enabled: !!condominioId }
  );

  const { data: ocorrencias } = trpc.ocorrencia.list.useQuery(
    { condominioId: condominioId! },
    { enabled: !!condominioId }
  );

  const { data: checklists } = trpc.checklist.list.useQuery(
    { condominioId: condominioId! },
    { enabled: !!condominioId }
  );

  const { data: tarefasSimples } = trpc.tarefasSimples.listar.useQuery(
    { condominioId: condominioId!, limite: 1000 },
    { enabled: !!condominioId }
  );

  // Calcular estatísticas
  const estatisticas = useMemo(() => {
    const totalCompletas = (vistorias?.length || 0) + (manutencoes?.length || 0) + 
                          (ocorrencias?.length || 0) + (checklists?.length || 0);
    const totalRapidas = tarefasSimples?.length || 0;

    return {
      total: totalCompletas + totalRapidas,
      completas: totalCompletas,
      rapidas: totalRapidas,
      vistorias: vistorias?.length || 0,
      manutencoes: manutencoes?.length || 0,
      ocorrencias: ocorrencias?.length || 0,
      checklists: checklists?.length || 0,
    };
  }, [vistorias, manutencoes, ocorrencias, checklists, tarefasSimples]);

  return (
    <div className="p-6 space-y-6">
      {/* Container Premium - Histórico das Funções */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-orange-500 via-orange-600 to-amber-600 p-6 shadow-2xl">
        {/* Elementos decorativos de fundo */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-amber-400/20 rounded-full translate-y-1/2 -translate-x-1/2 blur-2xl" />
        <div className="absolute top-1/2 left-1/2 w-32 h-32 bg-white/5 rounded-full -translate-x-1/2 -translate-y-1/2" />
        
        {/* Conteúdo do Header */}
        <div className="relative z-10">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-white/20 backdrop-blur-sm rounded-2xl shadow-lg border border-white/30">
                <History className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-white drop-shadow-md">
                  Histórico das Funções
                </h1>
                <p className="text-white/80 text-sm mt-1">
                  Visualize todas as atividades em um só lugar
                </p>
              </div>
            </div>

            <IndiceFuncoesButton />

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
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
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

        <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-white hover:shadow-xl transition-shadow overflow-hidden relative">
          <CardContent className="p-4 min-h-[100px]">
            <div>
              <p className="text-sm text-blue-600 font-medium">Completas</p>
              <p className="text-3xl font-bold text-blue-600">{estatisticas.completas}</p>
            </div>
            <div className="absolute bottom-2 right-2 p-2 bg-gradient-to-br from-blue-100 to-blue-200 rounded-xl shadow-inner opacity-80">
              <CheckCircle2 className="h-5 w-5 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-orange-50 to-white hover:shadow-xl transition-shadow overflow-hidden relative">
          <CardContent className="p-4 min-h-[100px]">
            <div>
              <p className="text-sm text-orange-600 font-medium">Rápidas</p>
              <p className="text-3xl font-bold text-orange-600">{estatisticas.rapidas}</p>
            </div>
            <div className="absolute bottom-2 right-2 p-2 bg-gradient-to-br from-orange-100 to-orange-200 rounded-xl shadow-inner opacity-80">
              <Zap className="h-5 w-5 text-orange-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-sky-50 to-white hover:shadow-xl transition-shadow overflow-hidden relative">
          <CardContent className="p-4 min-h-[100px]">
            <div>
              <p className="text-sm text-sky-600 font-medium">Vistorias</p>
              <p className="text-3xl font-bold text-sky-600">{estatisticas.vistorias}</p>
            </div>
            <div className="absolute bottom-2 right-2 p-2 bg-gradient-to-br from-sky-100 to-sky-200 rounded-xl shadow-inner opacity-80">
              <ClipboardCheck className="h-5 w-5 text-sky-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-green-50 to-white hover:shadow-xl transition-shadow overflow-hidden relative">
          <CardContent className="p-4 min-h-[100px]">
            <div>
              <p className="text-sm text-green-600 font-medium">Manutenções</p>
              <p className="text-3xl font-bold text-green-600">{estatisticas.manutencoes}</p>
            </div>
            <div className="absolute bottom-2 right-2 p-2 bg-gradient-to-br from-green-100 to-green-200 rounded-xl shadow-inner opacity-80">
              <Wrench className="h-5 w-5 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-amber-50 to-white hover:shadow-xl transition-shadow overflow-hidden relative">
          <CardContent className="p-4 min-h-[100px]">
            <div>
              <p className="text-sm text-amber-600 font-medium">Ocorrências</p>
              <p className="text-3xl font-bold text-amber-600">{estatisticas.ocorrencias}</p>
            </div>
            <div className="absolute bottom-2 right-2 p-2 bg-gradient-to-br from-amber-100 to-amber-200 rounded-xl shadow-inner opacity-80">
              <AlertTriangle className="h-5 w-5 text-amber-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-50 to-white hover:shadow-xl transition-shadow overflow-hidden relative">
          <CardContent className="p-4 min-h-[100px]">
            <div>
              <p className="text-sm text-purple-600 font-medium">Checklists</p>
              <p className="text-3xl font-bold text-purple-600">{estatisticas.checklists}</p>
            </div>
            <div className="absolute bottom-2 right-2 p-2 bg-gradient-to-br from-purple-100 to-purple-200 rounded-xl shadow-inner opacity-80">
              <ListChecks className="h-5 w-5 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Conteúdo Principal - Página existente */}
      {condominioId ? (
        <HistoricoAtividadesPage condominioId={condominioId} />
      ) : (
        <Card className="border-0 shadow-md">
          <CardContent className="p-12 text-center">
            <div className="mx-auto w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
              <History className="h-8 w-8 text-slate-500" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Nenhuma organização encontrada
            </h3>
            <p className="text-gray-500">
              Cadastre uma organização para visualizar o histórico.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
