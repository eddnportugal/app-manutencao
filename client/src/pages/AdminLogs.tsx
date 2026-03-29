import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  History,
  Search,
  Filter,
  Eye,
  UserCog,
  Trash2,
  Edit,
  Plus,
  Power,
  PowerOff,
  ArrowUp,
  ArrowDown,
  ChevronLeft,
  ChevronRight,
  Calendar,
  User,
  FileText,
  RefreshCw,
} from "lucide-react";

// Tipos para os logs
type AcaoLog = "criar" | "editar" | "excluir" | "ativar" | "desativar" | "promover" | "rebaixar";
type EntidadeLog = "usuario" | "condominio" | "vistoria" | "manutencao" | "ordem_servico" | "funcao" | "configuracao";

interface LogItem {
  id: number;
  adminId: number;
  adminNome: string;
  adminEmail: string;
  acao: AcaoLog;
  entidade: EntidadeLog;
  entidadeId: number;
  entidadeNome: string;
  detalhes: string | null;
  createdAt: Date;
}

// Configuração de ícones e cores por ação
const acaoConfig: Record<AcaoLog, { icon: React.ReactNode; color: string; label: string }> = {
  criar: { icon: <Plus className="h-4 w-4" />, color: "bg-green-100 text-green-800", label: "Criar" },
  editar: { icon: <Edit className="h-4 w-4" />, color: "bg-blue-100 text-blue-800", label: "Editar" },
  excluir: { icon: <Trash2 className="h-4 w-4" />, color: "bg-red-100 text-red-800", label: "Excluir" },
  ativar: { icon: <Power className="h-4 w-4" />, color: "bg-emerald-100 text-emerald-800", label: "Ativar" },
  desativar: { icon: <PowerOff className="h-4 w-4" />, color: "bg-gray-100 text-gray-800", label: "Desativar" },
  promover: { icon: <ArrowUp className="h-4 w-4" />, color: "bg-purple-100 text-purple-800", label: "Promover" },
  rebaixar: { icon: <ArrowDown className="h-4 w-4" />, color: "bg-orange-100 text-orange-800", label: "Rebaixar" },
};

// Configuração de labels por entidade
const entidadeLabels: Record<EntidadeLog, string> = {
  usuario: "Usuário",
  condominio: "Condomínio",
  vistoria: "Vistoria",
  manutencao: "Manutenção",
  ordem_servico: "Ordem de Serviço",
  funcao: "Função",
  configuracao: "Configuração",
};

export default function AdminLogs() {
  const [page, setPage] = useState(1);
  const [acaoFiltro, setAcaoFiltro] = useState<AcaoLog | "todas">("todas");
  const [entidadeFiltro, setEntidadeFiltro] = useState<EntidadeLog | "todas">("todas");
  const [dataInicio, setDataInicio] = useState<string>("");
  const [dataFim, setDataFim] = useState<string>("");
  const [selectedLog, setSelectedLog] = useState<LogItem | null>(null);

  // Query para buscar logs
  const { data: logsData, isLoading, refetch } = trpc.adminUsuarios.listarLogs.useQuery({
    page,
    limit: 15,
    acao: acaoFiltro !== "todas" ? acaoFiltro : undefined,
    entidade: entidadeFiltro !== "todas" ? entidadeFiltro : undefined,
    dataInicio: dataInicio ? new Date(dataInicio) : undefined,
    dataFim: dataFim ? new Date(dataFim + "T23:59:59") : undefined,
  });

  // Função para formatar data
  const formatarData = (data: Date) => {
    return new Date(data).toLocaleString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Função para formatar detalhes JSON
  const formatarDetalhes = (detalhes: string | null) => {
    if (!detalhes) return null;
    try {
      return JSON.parse(detalhes);
    } catch {
      return detalhes;
    }
  };

  // Função para renderizar detalhes formatados
  const renderDetalhes = (detalhes: unknown) => {
    if (!detalhes) return <span className="text-muted-foreground">Sem detalhes</span>;
    
    if (typeof detalhes === "string") {
      return <pre className="text-sm whitespace-pre-wrap">{detalhes}</pre>;
    }

    const obj = detalhes as Record<string, unknown>;
    
    return (
      <div className="space-y-4">
        {obj.alteracoes ? (
          <div>
            <h4 className="font-semibold text-sm mb-2">Alterações:</h4>
            <div className="space-y-2">
              {Object.entries(obj.alteracoes as Record<string, { de: unknown; para: unknown }>).map(([campo, valores]) => (
                <div key={campo} className="bg-muted p-2 rounded text-sm">
                  <span className="font-medium">{campo}:</span>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-red-600 line-through">{String(valores.de || "(vazio)")}</span>
                    <span>→</span>
                    <span className="text-green-600">{String(valores.para || "(vazio)")}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : null}
        
        {obj.usuarioExcluido ? (
          <div>
            <h4 className="font-semibold text-sm mb-2">Dados do Usuário Excluído:</h4>
            <div className="bg-muted p-3 rounded text-sm space-y-1">
              {Object.entries(obj.usuarioExcluido as Record<string, unknown>).map(([campo, valor]) => (
                <div key={campo}>
                  <span className="font-medium">{campo}:</span>{" "}
                  <span>{valor instanceof Date ? formatarData(valor) : String(valor || "(vazio)")}</span>
                </div>
              ))}
            </div>
          </div>
        ) : null}
        
        {!obj.alteracoes && !obj.usuarioExcluido ? (
          <pre className="text-sm whitespace-pre-wrap bg-muted p-3 rounded">
            {JSON.stringify(detalhes, null, 2)}
          </pre>
        ) : null}
      </div>
    );
  };

  // Limpar filtros
  const limparFiltros = () => {
    setAcaoFiltro("todas");
    setEntidadeFiltro("todas");
    setDataInicio("");
    setDataFim("");
    setPage(1);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <History className="h-6 w-6 text-orange-500" />
            Logs de Auditoria
          </h1>
          <p className="text-muted-foreground mt-1">
            Histórico de todas as ações administrativas realizadas no sistema
          </p>
        </div>
        <Button onClick={() => refetch()} variant="outline" size="sm">
          <RefreshCw className="h-4 w-4 mr-2" />
          Atualizar
        </Button>
      </div>

      {/* Filtros */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filtros
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="space-y-2">
              <Label>Ação</Label>
              <Select value={acaoFiltro} onValueChange={(v) => { setAcaoFiltro(v as AcaoLog | "todas"); setPage(1); }}>
                <SelectTrigger>
                  <SelectValue placeholder="Todas as ações" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todas">Todas as ações</SelectItem>
                  <SelectItem value="criar">Criar</SelectItem>
                  <SelectItem value="editar">Editar</SelectItem>
                  <SelectItem value="excluir">Excluir</SelectItem>
                  <SelectItem value="ativar">Ativar</SelectItem>
                  <SelectItem value="desativar">Desativar</SelectItem>
                  <SelectItem value="promover">Promover</SelectItem>
                  <SelectItem value="rebaixar">Rebaixar</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Entidade</Label>
              <Select value={entidadeFiltro} onValueChange={(v) => { setEntidadeFiltro(v as EntidadeLog | "todas"); setPage(1); }}>
                <SelectTrigger>
                  <SelectValue placeholder="Todas as entidades" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todas">Todas as entidades</SelectItem>
                  <SelectItem value="usuario">Usuário</SelectItem>
                  <SelectItem value="condominio">Condomínio</SelectItem>
                  <SelectItem value="vistoria">Vistoria</SelectItem>
                  <SelectItem value="manutencao">Manutenção</SelectItem>
                  <SelectItem value="ordem_servico">Ordem de Serviço</SelectItem>
                  <SelectItem value="funcao">Função</SelectItem>
                  <SelectItem value="configuracao">Configuração</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Data Início</Label>
              <Input
                type="date"
                value={dataInicio}
                onChange={(e) => { setDataInicio(e.target.value); setPage(1); }}
              />
            </div>

            <div className="space-y-2">
              <Label>Data Fim</Label>
              <Input
                type="date"
                value={dataFim}
                onChange={(e) => { setDataFim(e.target.value); setPage(1); }}
              />
            </div>

            <div className="flex items-end">
              <Button variant="outline" onClick={limparFiltros} className="w-full">
                Limpar Filtros
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabela de Logs */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex justify-between items-center">
            <CardTitle className="text-lg">
              Registros de Atividade
            </CardTitle>
            {logsData && (
              <CardDescription>
                {logsData.total} registro{logsData.total !== 1 ? "s" : ""} encontrado{logsData.total !== 1 ? "s" : ""}
              </CardDescription>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
              <span className="ml-2 text-muted-foreground">Carregando logs...</span>
            </div>
          ) : logsData?.logs && logsData.logs.length > 0 ? (
            <>
              <div className="rounded-md border overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[140px]">Data/Hora</TableHead>
                      <TableHead>Administrador</TableHead>
                      <TableHead className="w-[100px]">Ação</TableHead>
                      <TableHead>Entidade</TableHead>
                      <TableHead>Alvo</TableHead>
                      <TableHead className="w-[80px] text-center">Detalhes</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {logsData.logs.map((log) => (
                      <TableRow key={log.id}>
                        <TableCell className="font-mono text-sm">
                          {formatarData(log.createdAt)}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4 text-muted-foreground" />
                            <div>
                              <div className="font-medium">{log.adminNome}</div>
                              <div className="text-xs text-muted-foreground">{log.adminEmail}</div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={`${acaoConfig[log.acao as AcaoLog]?.color || "bg-gray-100"} flex items-center gap-1 w-fit`}>
                            {acaoConfig[log.acao as AcaoLog]?.icon}
                            {acaoConfig[log.acao as AcaoLog]?.label || log.acao}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {entidadeLabels[log.entidade as EntidadeLog] || log.entidade}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <FileText className="h-4 w-4 text-muted-foreground" />
                            <span>{log.entidadeNome}</span>
                            <span className="text-xs text-muted-foreground">#{log.entidadeId}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-center">
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setSelectedLog(log as unknown as LogItem)}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                              <DialogHeader>
                                <DialogTitle className="flex items-center gap-2">
                                  <History className="h-5 w-5 text-orange-500" />
                                  Detalhes do Log #{log.id}
                                </DialogTitle>
                                <DialogDescription>
                                  Informações completas sobre esta ação administrativa
                                </DialogDescription>
                              </DialogHeader>
                              <div className="space-y-4 mt-4">
                                <div className="grid grid-cols-2 gap-4">
                                  <div>
                                    <Label className="text-muted-foreground">Data/Hora</Label>
                                    <p className="font-medium">{formatarData(log.createdAt)}</p>
                                  </div>
                                  <div>
                                    <Label className="text-muted-foreground">Ação</Label>
                                    <Badge className={`${acaoConfig[log.acao as AcaoLog]?.color || "bg-gray-100"} flex items-center gap-1 w-fit mt-1`}>
                                      {acaoConfig[log.acao as AcaoLog]?.icon}
                                      {acaoConfig[log.acao as AcaoLog]?.label || log.acao}
                                    </Badge>
                                  </div>
                                  <div>
                                    <Label className="text-muted-foreground">Administrador</Label>
                                    <p className="font-medium">{log.adminNome}</p>
                                    <p className="text-sm text-muted-foreground">{log.adminEmail}</p>
                                  </div>
                                  <div>
                                    <Label className="text-muted-foreground">Entidade</Label>
                                    <p className="font-medium">{entidadeLabels[log.entidade as EntidadeLog] || log.entidade}</p>
                                  </div>
                                  <div className="col-span-2">
                                    <Label className="text-muted-foreground">Alvo da Ação</Label>
                                    <p className="font-medium">{log.entidadeNome} <span className="text-muted-foreground">#{log.entidadeId}</span></p>
                                  </div>
                                </div>
                                <div>
                                  <Label className="text-muted-foreground">Detalhes da Alteração</Label>
                                  <div className="mt-2">
                                    {renderDetalhes(formatarDetalhes(log.detalhes))}
                                  </div>
                                </div>
                              </div>
                            </DialogContent>
                          </Dialog>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Paginação */}
              {logsData.totalPages > 1 && (
                <div className="flex items-center justify-between mt-4">
                  <p className="text-sm text-muted-foreground">
                    Página {logsData.page} de {logsData.totalPages}
                  </p>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage(p => Math.max(1, p - 1))}
                      disabled={page === 1}
                    >
                      <ChevronLeft className="h-4 w-4" />
                      Anterior
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage(p => Math.min(logsData.totalPages, p + 1))}
                      disabled={page === logsData.totalPages}
                    >
                      Próxima
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <History className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium">Nenhum log encontrado</h3>
              <p className="text-muted-foreground mt-1">
                {acaoFiltro !== "todas" || entidadeFiltro !== "todas" || dataInicio || dataFim
                  ? "Tente ajustar os filtros para ver mais resultados"
                  : "As ações administrativas serão registradas aqui"}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
