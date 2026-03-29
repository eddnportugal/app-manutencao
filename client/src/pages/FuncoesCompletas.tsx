import { useState, useMemo } from "react";
import { trpc } from "@/lib/trpc";
import { FunctionTutorialButton } from "@/components/FunctionTutorial";
import { IndiceFuncoesButton } from "@/components/IndiceFuncoesButton";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Plus,
  Search,
  Filter,
  ClipboardCheck,
  Wrench,
  AlertTriangle,
  ArrowLeftRight,
  FileText,
  Eye,
  RefreshCw,
  Loader2,
  ListChecks,
  Calendar,
  Building2,
} from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

type TipoFuncao = "vistorias" | "manutencoes" | "ocorrencias" | "checklists" | "antesDepois";

const tipoConfig = {
  vistorias: {
    label: "Vistoria",
    icon: ClipboardCheck,
    cor: "#3B82F6",
    corClara: "#EFF6FF",
    path: "/dashboard/vistorias",
  },
  manutencoes: {
    label: "Manutenção",
    icon: Wrench,
    cor: "#F97316",
    corClara: "#FFF7ED",
    path: "/dashboard/manutencoes",
  },
  ocorrencias: {
    label: "Ocorrência",
    icon: AlertTriangle,
    cor: "#EF4444",
    corClara: "#FEF2F2",
    path: "/dashboard/ocorrencias",
  },
  checklists: {
    label: "Checklist",
    icon: ListChecks,
    cor: "#8B5CF6",
    corClara: "#F5F3FF",
    path: "/dashboard/checklists",
  },
  antesDepois: {
    label: "Antes/Depois",
    icon: ArrowLeftRight,
    cor: "#10B981",
    corClara: "#ECFDF5",
    path: "/dashboard/antes-depois",
  },
};

export default function FuncoesCompletas() {
  const [, setLocation] = useLocation();
  const [filtroTipo, setFiltroTipo] = useState<TipoFuncao | "todos">("todos");
  const [busca, setBusca] = useState("");

  // Buscar organizações do usuário
  const { data: condominios } = trpc.condominio.list.useQuery();
  const condominioId = condominios?.[0]?.id;

  // Buscar dados de todas as funções completas
  const { data: vistorias, isLoading: loadingVistorias } = trpc.vistoria.list.useQuery(
    { condominioId: condominioId! },
    { enabled: !!condominioId }
  );

  const { data: manutencoes, isLoading: loadingManutencoes } = trpc.manutencao.list.useQuery(
    { condominioId: condominioId! },
    { enabled: !!condominioId }
  );

  const { data: ocorrencias, isLoading: loadingOcorrencias } = trpc.ocorrencia.list.useQuery(
    { condominioId: condominioId! },
    { enabled: !!condominioId }
  );

  const { data: checklists, isLoading: loadingChecklists } = trpc.checklist.list.useQuery(
    { condominioId: condominioId! },
    { enabled: !!condominioId }
  );

  // Buscar revistas e antes/depois
  const { data: revistas } = trpc.revista.list.useQuery(
    { condominioId: condominioId! },
    { enabled: !!condominioId }
  );
  const revistaId = revistas?.[0]?.id;

  const { data: antesDepoisData, isLoading: loadingAntesDepois } = trpc.antesDepois.list.useQuery(
    { revistaId: revistaId! },
    { enabled: !!revistaId }
  );

  const isLoading = loadingVistorias || loadingManutencoes || loadingOcorrencias || loadingChecklists || loadingAntesDepois;

  // Combinar todos os registros em uma lista unificada
  const todosRegistros = useMemo(() => {
    const registros: Array<{
      id: number;
      tipo: TipoFuncao;
      titulo: string;
      protocolo: string;
      descricao?: string;
      status?: string;
      data: Date;
    }> = [];

    // Vistorias
    vistorias?.forEach((v) => {
      registros.push({
        id: v.id,
        tipo: "vistorias",
        titulo: v.titulo || `Vistoria #${v.id}`,
        protocolo: v.protocolo,
        descricao: v.descricao || undefined,
        status: v.status || undefined,
        data: new Date(v.createdAt),
      });
    });

    // Manutenções
    manutencoes?.forEach((m) => {
      registros.push({
        id: m.id,
        tipo: "manutencoes",
        titulo: m.titulo || `Manutenção #${m.id}`,
        protocolo: m.protocolo,
        descricao: m.descricao || undefined,
        status: m.status || undefined,
        data: new Date(m.createdAt),
      });
    });

    // Ocorrências
    ocorrencias?.forEach((o) => {
      registros.push({
        id: o.id,
        tipo: "ocorrencias",
        titulo: o.titulo || `Ocorrência #${o.id}`,
        protocolo: o.protocolo,
        descricao: o.descricao || undefined,
        status: o.status || undefined,
        data: new Date(o.createdAt),
      });
    });

    // Checklists
    checklists?.forEach((c) => {
      registros.push({
        id: c.id,
        tipo: "checklists",
        titulo: c.titulo || `Checklist #${c.id}`,
        protocolo: c.protocolo,
        descricao: c.descricao || undefined,
        status: c.status || undefined,
        data: new Date(c.createdAt),
      });
    });

    // Antes/Depois
    antesDepoisData?.forEach((ad) => {
      registros.push({
        id: ad.id,
        tipo: "antesDepois",
        titulo: ad.titulo || `Antes/Depois #${ad.id}`,
        protocolo: `AD-${ad.id}`,
        descricao: ad.descricao || undefined,
        status: undefined,
        data: new Date(ad.createdAt),
      });
    });

    // Ordenar por data (mais recente primeiro)
    return registros.sort((a, b) => b.data.getTime() - a.data.getTime());
  }, [vistorias, manutencoes, ocorrencias, checklists, antesDepoisData]);

  // Aplicar filtros
  const registrosFiltrados = useMemo(() => {
    return todosRegistros.filter((registro) => {
      // Filtro por tipo
      if (filtroTipo !== "todos" && registro.tipo !== filtroTipo) {
        return false;
      }

      // Filtro por busca
      if (busca) {
        const termoBusca = busca.toLowerCase();
        return (
          registro.titulo.toLowerCase().includes(termoBusca) ||
          registro.protocolo.toLowerCase().includes(termoBusca) ||
          registro.descricao?.toLowerCase().includes(termoBusca)
        );
      }

      return true;
    });
  }, [todosRegistros, filtroTipo, busca]);

  // Estatísticas
  const estatisticas = useMemo(() => {
    return {
      total: todosRegistros.length,
      vistorias: vistorias?.length || 0,
      manutencoes: manutencoes?.length || 0,
      ocorrencias: ocorrencias?.length || 0,
      checklists: checklists?.length || 0,
      antesDepois: antesDepoisData?.length || 0,
    };
  }, [todosRegistros, vistorias, manutencoes, ocorrencias, checklists, antesDepoisData]);

  const navegarPara = (tipo: TipoFuncao) => {
    setLocation(tipoConfig[tipo].path);
  };

  const verDetalhes = (registro: typeof registrosFiltrados[0]) => {
    // Navegar para a página específica do registro
    const basePath = tipoConfig[registro.tipo].path;
    setLocation(`${basePath}?id=${registro.id}`);
  };

  return (
    <div className="p-6 space-y-6">
      {/* Container Premium - Funções Completas */}
      <div data-tour="header-funcoes-completas" className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-orange-500 via-orange-600 to-amber-600 p-6 shadow-2xl">
        {/* Elementos decorativos de fundo */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-amber-400/20 rounded-full translate-y-1/2 -translate-x-1/2 blur-2xl" />
        <div className="absolute top-1/2 left-1/2 w-32 h-32 bg-white/5 rounded-full -translate-x-1/2 -translate-y-1/2" />
        
        {/* Conteúdo do Header */}
        <div className="relative z-10">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-white/20 backdrop-blur-sm rounded-2xl shadow-lg border border-white/30">
                <Building2 className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-white drop-shadow-md">
                  Funções Completas
                </h1>
                <p className="text-white/80 text-sm mt-1">
                  Acesse vistorias, manutenções e ocorrências detalhadas
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <IndiceFuncoesButton />
              <FunctionTutorialButton tutorialId="funcoes-completas" />
            </div>
          </div>

          {/* Botões de Ação - Dentro do container premium */}
          <div data-tour="botoes-tipo" className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {(Object.keys(tipoConfig) as TipoFuncao[]).map((tipo) => {
              const config = tipoConfig[tipo];
              const Icon = config.icon;
              return (
                <button
                  key={tipo}
                  onClick={() => navegarPara(tipo)}
                  className="group relative overflow-hidden bg-white/15 hover:bg-white/25 backdrop-blur-sm border border-white/30 rounded-2xl p-4 transition-all duration-300 hover:scale-105 hover:shadow-xl"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="relative z-10 flex flex-col items-center gap-2">
                    <div className="p-2 bg-white/20 rounded-xl group-hover:bg-white/30 transition-colors">
                      <Icon className="h-6 w-6 text-white" />
                    </div>
                    <span className="text-sm font-semibold text-white">{config.label}</span>
                    <span className="text-xs text-white/70 flex items-center gap-1">
                      <Plus className="h-3 w-3" /> Acessar
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Cards de Estatísticas */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-gray-50 hover:shadow-xl transition-shadow cursor-pointer overflow-hidden relative" onClick={() => setFiltroTipo("todos")}>
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

        <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-white hover:shadow-xl transition-shadow cursor-pointer overflow-hidden relative" onClick={() => setFiltroTipo("vistorias")}>
          <CardContent className="p-4 min-h-[100px]">
            <div>
              <p className="text-sm text-blue-600 font-medium">Vistorias</p>
              <p className="text-3xl font-bold text-blue-600">{estatisticas.vistorias}</p>
            </div>
            <div className="absolute bottom-2 right-2 p-2 bg-gradient-to-br from-blue-100 to-blue-200 rounded-xl shadow-inner opacity-80">
              <ClipboardCheck className="h-5 w-5 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-orange-50 to-white hover:shadow-xl transition-shadow cursor-pointer overflow-hidden relative" onClick={() => setFiltroTipo("manutencoes")}>
          <CardContent className="p-4 min-h-[100px]">
            <div>
              <p className="text-sm text-orange-600 font-medium">Manutenções</p>
              <p className="text-3xl font-bold text-orange-600">{estatisticas.manutencoes}</p>
            </div>
            <div className="absolute bottom-2 right-2 p-2 bg-gradient-to-br from-orange-100 to-orange-200 rounded-xl shadow-inner opacity-80">
              <Wrench className="h-5 w-5 text-orange-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-red-50 to-white hover:shadow-xl transition-shadow cursor-pointer overflow-hidden relative" onClick={() => setFiltroTipo("ocorrencias")}>
          <CardContent className="p-4 min-h-[100px]">
            <div>
              <p className="text-sm text-red-600 font-medium">Ocorrências</p>
              <p className="text-3xl font-bold text-red-600">{estatisticas.ocorrencias}</p>
            </div>
            <div className="absolute bottom-2 right-2 p-2 bg-gradient-to-br from-red-100 to-red-200 rounded-xl shadow-inner opacity-80">
              <AlertTriangle className="h-5 w-5 text-red-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-50 to-white hover:shadow-xl transition-shadow cursor-pointer overflow-hidden relative" onClick={() => setFiltroTipo("checklists")}>
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

        <Card className="border-0 shadow-lg bg-gradient-to-br from-emerald-50 to-white hover:shadow-xl transition-shadow cursor-pointer overflow-hidden relative" onClick={() => setFiltroTipo("antesDepois")}>
          <CardContent className="p-4 min-h-[100px]">
            <div>
              <p className="text-sm text-emerald-600 font-medium">Antes/Depois</p>
              <p className="text-3xl font-bold text-emerald-600">{estatisticas.antesDepois}</p>
            </div>
            <div className="absolute bottom-2 right-2 p-2 bg-gradient-to-br from-emerald-100 to-emerald-200 rounded-xl shadow-inner opacity-80">
              <ArrowLeftRight className="h-5 w-5 text-emerald-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filtros */}
      <Card className="border-0 shadow-md">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Busca */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Buscar por título, descrição ou local..."
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Filtro por Tipo */}
            <Select value={filtroTipo} onValueChange={(v) => setFiltroTipo(v as any)}>
              <SelectTrigger className="w-[180px]">
                <Filter className="h-4 w-4 mr-2 text-gray-400" />
                <SelectValue placeholder="Tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos os tipos</SelectItem>
                {(Object.keys(tipoConfig) as TipoFuncao[]).map((tipo) => (
                  <SelectItem key={tipo} value={tipo}>
                    {tipoConfig[tipo].label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Botão Atualizar */}
            <Button
              variant="outline"
              size="icon"
              onClick={() => window.location.reload()}
              className="shrink-0"
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Lista de Registros */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
        </div>
      ) : registrosFiltrados.length === 0 ? (
        <Card className="border-0 shadow-md">
          <CardContent className="p-12 text-center">
            <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
              <FileText className="h-8 w-8 text-blue-500" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Nenhum registro encontrado
            </h3>
            <p className="text-gray-500">
              Use os botões acima para acessar e criar novos registros.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {registrosFiltrados.map((registro) => {
            const configTipo = tipoConfig[registro.tipo];
            const IconTipo = configTipo?.icon || FileText;

            return (
              <Card
                key={`${registro.tipo}-${registro.id}`}
                className="border-0 shadow-md hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => verDetalhes(registro)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start gap-4">
                    {/* Ícone do Tipo */}
                    <div
                      className="p-3 rounded-xl shrink-0"
                      style={{ backgroundColor: configTipo?.corClara || "#F3F4F6" }}
                    >
                      <IconTipo
                        className="h-6 w-6"
                        style={{ color: configTipo?.cor || "#6B7280" }}
                      />
                    </div>

                    {/* Conteúdo */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h3 className="font-semibold text-gray-900 truncate">
                            {registro.titulo}
                          </h3>
                          {registro.descricao && (
                            <p className="text-sm text-gray-500 line-clamp-2 mt-1">
                              {registro.descricao}
                            </p>
                          )}
                        </div>
                        <Badge
                          variant="outline"
                          style={{
                            borderColor: configTipo?.cor,
                            color: configTipo?.cor,
                          }}
                        >
                          {configTipo?.label}
                        </Badge>
                      </div>

                      {/* Meta informações */}
                      <div className="flex flex-wrap items-center gap-4 mt-3 text-sm text-gray-500">
                        <Badge variant="outline" className="font-mono text-xs">
                          {registro.protocolo}
                        </Badge>
                        <span className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          {format(registro.data, "dd/MM/yyyy", { locale: ptBR })}
                        </span>
                        {registro.status && (
                          <Badge variant="secondary" className="text-xs">
                            {registro.status}
                          </Badge>
                        )}
                      </div>
                    </div>

                    {/* Ação */}
                    <Button
                      variant="outline"
                      size="sm"
                      className="shrink-0 gap-1.5 text-blue-600 border-blue-200 hover:bg-blue-50 font-semibold px-3"
                      onClick={(e) => { e.stopPropagation(); verDetalhes(registro); }}
                    >
                      <Eye className="h-4 w-4" />
                      VER
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

export { FuncoesCompletas };
