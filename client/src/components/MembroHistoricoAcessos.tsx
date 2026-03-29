import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/components/ui/sonner";
import { 
  History, 
  Monitor, 
  Smartphone, 
  Tablet, 
  Globe, 
  CheckCircle, 
  XCircle, 
  LogIn, 
  LogOut, 
  KeyRound, 
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  Calendar,
  Clock,
  Shield,
  FileSpreadsheet,
  FileText,
  Download
} from "lucide-react";

interface MembroHistoricoAcessosProps {
  membroId: number;
  membroNome: string;
  condominioId: number;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function MembroHistoricoAcessos({ 
  membroId, 
  membroNome, 
  condominioId, 
  open, 
  onOpenChange 
}: MembroHistoricoAcessosProps) {
  const [pagina, setPagina] = useState(1);
  const [filtroTipo, setFiltroTipo] = useState<string>("todos");
  const [exportando, setExportando] = useState<"pdf" | "excel" | null>(null);
  const limite = 10;

  const { data, isLoading, refetch } = trpc.membroEquipe.historicoAcessos.useQuery(
    { membroId, limite, pagina },
    { enabled: open }
  );

  const exportarExcelMutation = trpc.membroEquipe.exportarHistoricoExcel.useMutation({
    onSuccess: (result) => {
      // Criar blob e fazer download
      const byteCharacters = atob(result.data);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: result.mimeType });
      
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = result.filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      toast.success("Excel exportado com sucesso!");
      setExportando(null);
    },
    onError: (error) => {
      toast.error("Erro ao exportar Excel: " + error.message);
      setExportando(null);
    },
  });

  const exportarPDFMutation = trpc.membroEquipe.exportarHistoricoPDF.useMutation({
    onSuccess: (result) => {
      // Criar blob e fazer download
      const byteCharacters = atob(result.data);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: result.mimeType });
      
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = result.filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      toast.success("PDF exportado com sucesso!");
      setExportando(null);
    },
    onError: (error) => {
      toast.error("Erro ao exportar PDF: " + error.message);
      setExportando(null);
    },
  });

  const handleExportarExcel = () => {
    setExportando("excel");
    exportarExcelMutation.mutate({
      membroId,
      membroNome,
    });
  };

  const handleExportarPDF = () => {
    setExportando("pdf");
    exportarPDFMutation.mutate({
      membroId,
      membroNome,
    });
  };

  const formatarData = (data: Date | string) => {
    const d = new Date(data);
    return d.toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const formatarHora = (data: Date | string) => {
    const d = new Date(data);
    return d.toLocaleTimeString("pt-BR", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getDispositivoIcon = (dispositivo: string | null) => {
    switch (dispositivo?.toLowerCase()) {
      case "mobile":
        return <Smartphone className="w-4 h-4" />;
      case "tablet":
        return <Tablet className="w-4 h-4" />;
      default:
        return <Monitor className="w-4 h-4" />;
    }
  };

  const getTipoAcessoLabel = (tipo: string | null) => {
    switch (tipo) {
      case "login":
        return "Login";
      case "logout":
        return "Logout";
      case "recuperacao_senha":
        return "Recuperação de Senha";
      case "alteracao_senha":
        return "Alteração de Senha";
      default:
        return "Login";
    }
  };

  const acessosFiltrados = data?.acessos?.filter(acesso => {
    if (filtroTipo === "todos") return true;
    if (filtroTipo === "sucesso") return acesso.sucesso;
    if (filtroTipo === "falha") return !acesso.sucesso;
    return acesso.tipoAcesso === filtroTipo;
  }) || [];

  const totalPaginas = Math.ceil((data?.total || 0) / limite);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95vw] sm:max-w-2xl max-h-[90vh] overflow-hidden p-0 rounded-2xl border-0 shadow-2xl">
        {/* Header Premium */}
        <div className="relative bg-gradient-to-br from-blue-500 via-blue-600 to-indigo-600 px-6 py-5 overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.2),transparent_50%)]" />
          <div className="absolute -top-10 -right-10 w-32 h-32 bg-white/10 rounded-full blur-2xl" />
          <DialogHeader className="relative z-10">
            <DialogTitle className="flex items-center gap-3 text-white">
              <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-lg border border-white/20">
                <History className="w-6 h-6 text-white" />
              </div>
              <div>
                <span className="text-xl font-bold block">Histórico de Acessos</span>
                <span className="text-sm text-white/80 font-normal">{membroNome}</span>
              </div>
            </DialogTitle>
          </DialogHeader>
        </div>

        {/* Filtros e Exportação */}
        <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/50">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <Select value={filtroTipo} onValueChange={setFiltroTipo}>
                <SelectTrigger className="w-48 h-9 rounded-lg">
                  <SelectValue placeholder="Filtrar por tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos os acessos</SelectItem>
                  <SelectItem value="login">Apenas logins</SelectItem>
                  <SelectItem value="sucesso">Bem-sucedidos</SelectItem>
                  <SelectItem value="falha">Falhas</SelectItem>
                </SelectContent>
              </Select>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => refetch()}
                className="text-blue-600"
              >
                <RefreshCw className="w-4 h-4 mr-1" />
                Atualizar
              </Button>
            </div>
            
            {/* Botões de Exportação */}
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                onClick={handleExportarExcel}
                disabled={exportando !== null || !data?.acessos?.length}
                className="bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg shadow-md"
              >
                {exportando === "excel" ? (
                  <span className="flex items-center gap-1">
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Exportando...
                  </span>
                ) : (
                  <>
                    <FileSpreadsheet className="w-4 h-4 mr-1" />
                    Excel
                  </>
                )}
              </Button>
              <Button
                size="sm"
                onClick={handleExportarPDF}
                disabled={exportando !== null || !data?.acessos?.length}
                className="bg-gradient-to-r from-red-500 to-rose-600 text-white rounded-lg shadow-md"
              >
                {exportando === "pdf" ? (
                  <span className="flex items-center gap-1">
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Exportando...
                  </span>
                ) : (
                  <>
                    <FileText className="w-4 h-4 mr-1" />
                    PDF
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>

        {/* Lista de Acessos */}
        <div className="overflow-y-auto max-h-[50vh] px-6 py-4">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="w-8 h-8 border-3 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
            </div>
          ) : acessosFiltrados.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                <History className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold mb-2 text-gray-700 dark:text-gray-300">
                Nenhum acesso registrado
              </h3>
              <p className="text-sm text-gray-500">
                O histórico de acessos aparecerá aqui quando o membro fizer login.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {acessosFiltrados.map((acesso) => (
                <div
                  key={acesso.id}
                  className={`p-4 rounded-xl border transition-all ${
                    acesso.sucesso
                      ? "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700"
                      : "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800"
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3">
                      {/* Ícone de Status */}
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                        acesso.sucesso
                          ? "bg-green-100 dark:bg-green-900/30 text-green-600"
                          : "bg-red-100 dark:bg-red-900/30 text-red-600"
                      }`}>
                        {acesso.sucesso ? (
                          <CheckCircle className="w-5 h-5" />
                        ) : (
                          <XCircle className="w-5 h-5" />
                        )}
                      </div>

                      <div className="flex-1">
                        {/* Tipo de Acesso e Status */}
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium text-gray-900 dark:text-gray-100">
                            {getTipoAcessoLabel(acesso.tipoAcesso)}
                          </span>
                          <Badge variant={acesso.sucesso ? "default" : "destructive"} className="text-xs">
                            {acesso.sucesso ? "Sucesso" : "Falha"}
                          </Badge>
                        </div>

                        {/* Motivo da Falha */}
                        {!acesso.sucesso && acesso.motivoFalha && (
                          <p className="text-sm text-red-600 dark:text-red-400 mb-2">
                            {acesso.motivoFalha}
                          </p>
                        )}

                        {/* Detalhes */}
                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-500 dark:text-gray-400">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {formatarData(acesso.dataHora)}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {formatarHora(acesso.dataHora)}
                          </span>
                          {acesso.ip && (
                            <span className="flex items-center gap-1">
                              <Globe className="w-3 h-3" />
                              {acesso.ip}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Dispositivo e Navegador */}
                    <div className="text-right">
                      <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 mb-1">
                        {getDispositivoIcon(acesso.dispositivo)}
                        <span>{acesso.dispositivo || "Desktop"}</span>
                      </div>
                      <div className="text-xs text-gray-500">
                        {acesso.navegador || "Desconhecido"} • {acesso.sistemaOperacional || "Desconhecido"}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Paginação */}
        {totalPaginas > 1 && (
          <div className="px-6 py-4 border-t border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/50">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500">
                Página {pagina} de {totalPaginas} ({data?.total || 0} acessos)
              </span>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPagina(p => Math.max(1, p - 1))}
                  disabled={pagina === 1}
                  className="rounded-lg"
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPagina(p => Math.min(totalPaginas, p + 1))}
                  disabled={pagina === totalPaginas}
                  className="rounded-lg"
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
