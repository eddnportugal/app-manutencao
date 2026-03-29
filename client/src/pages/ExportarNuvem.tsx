import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { trpc } from "@/lib/trpc";
import { toast } from "@/components/ui/sonner";
import {
  Download,
  FileJson,
  FileText,
  ClipboardCheck,
  Wrench,
  AlertTriangle,
  ListChecks,
  Cloud,
  Loader2,
  CheckCircle,
  FolderDown,
  Info,
} from "lucide-react";

export default function ExportarNuvem() {
  const [selectedCondominio, setSelectedCondominio] = useState<number | null>(null);
  const [exportingItem, setExportingItem] = useState<string | null>(null);

  // Buscar condomínios
  const { data: condominios = [] } = trpc.condominio.list.useQuery();

  // Buscar dados para exportação
  const { data: vistorias = [] } = trpc.vistoria.list.useQuery(
    { condominioId: selectedCondominio! },
    { enabled: !!selectedCondominio }
  );
  const { data: manutencoes = [] } = trpc.manutencao.list.useQuery(
    { condominioId: selectedCondominio! },
    { enabled: !!selectedCondominio }
  );
  const { data: ocorrencias = [] } = trpc.ocorrencia.list.useQuery(
    { condominioId: selectedCondominio! },
    { enabled: !!selectedCondominio }
  );
  const { data: checklists = [] } = trpc.checklist.list.useQuery(
    { condominioId: selectedCondominio! },
    { enabled: !!selectedCondominio }
  );

  // Função para download de arquivo
  const downloadFile = (content: string, filename: string, type: string) => {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const utils = trpc.useUtils();

  // Exportar JSON individual
  const handleExportJson = async (tipo: string, id: number, protocolo: string) => {
    setExportingItem(`${tipo}-${id}`);
    try {
      let data;
      if (tipo === "vistoria") {
        data = await utils.vistoria.exportJson.fetch({ id });
      } else if (tipo === "manutencao") {
        data = await utils.manutencao.exportJson.fetch({ id });
      } else if (tipo === "ocorrencia") {
        data = await utils.ocorrencia.exportJson.fetch({ id });
      } else if (tipo === "checklist") {
        data = await utils.checklist.exportJson.fetch({ id });
      }
      
      if (data) {
        const jsonString = JSON.stringify(data, null, 2);
        downloadFile(jsonString, `${tipo}-${protocolo}.json`, "application/json");
        toast.success("Arquivo JSON exportado com sucesso!");
      }
    } catch (error) {
      toast.error("Erro ao exportar arquivo");
    } finally {
      setExportingItem(null);
    }
  };

  // Mutations para gerar PDF
  const vistoriaPdfMutation = trpc.vistoria.generatePdf.useMutation();
  const manutencaoPdfMutation = trpc.manutencao.generatePdf.useMutation();
  const ocorrenciaPdfMutation = trpc.ocorrencia.generatePdf.useMutation();
  const checklistPdfMutation = trpc.checklist.generatePdf.useMutation();

  // Exportar PDF individual
  const handleExportPdf = async (tipo: string, id: number, protocolo: string) => {
    setExportingItem(`pdf-${tipo}-${id}`);
    try {
      let result;
      if (tipo === "vistoria") {
        result = await vistoriaPdfMutation.mutateAsync({ id });
      } else if (tipo === "manutencao") {
        result = await manutencaoPdfMutation.mutateAsync({ id });
      } else if (tipo === "ocorrencia") {
        result = await ocorrenciaPdfMutation.mutateAsync({ id });
      } else if (tipo === "checklist") {
        result = await checklistPdfMutation.mutateAsync({ id });
      }
      
      if (result?.pdf) {
        const byteCharacters = atob(result.pdf);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        const blob = new Blob([byteArray], { type: "application/pdf" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${tipo}-${protocolo}.pdf`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        toast.success("PDF exportado com sucesso!");
      }
    } catch (error) {
      toast.error("Erro ao gerar PDF");
    } finally {
      setExportingItem(null);
    }
  };

  // Exportar todos de uma categoria
  const handleExportAll = async (tipo: string) => {
    if (!selectedCondominio) return;
    setExportingItem(`all-${tipo}`);
    try {
      let data;
      if (tipo === "vistorias") {
        data = await utils.vistoria.exportAllJson.fetch({ condominioId: selectedCondominio });
      } else if (tipo === "manutencoes") {
        data = await utils.manutencao.exportAllJson.fetch({ condominioId: selectedCondominio });
      } else if (tipo === "ocorrencias") {
        data = await utils.ocorrencia.exportAllJson.fetch({ condominioId: selectedCondominio });
      } else if (tipo === "checklists") {
        data = await utils.checklist.exportAllJson.fetch({ condominioId: selectedCondominio });
      }
      
      if (data) {
        const jsonString = JSON.stringify(data, null, 2);
        const date = new Date().toISOString().split("T")[0];
        downloadFile(jsonString, `${tipo}-completo-${date}.json`, "application/json");
        toast.success(`Todos os ${tipo} exportados com sucesso!`);
      }
    } catch (error) {
      toast.error("Erro ao exportar");
    } finally {
      setExportingItem(null);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusColors: Record<string, string> = {
      pendente: "bg-yellow-100 text-yellow-800",
      realizada: "bg-blue-100 text-blue-800",
      finalizada: "bg-green-100 text-green-800",
      acao_necessaria: "bg-red-100 text-red-800",
      reaberta: "bg-purple-100 text-purple-800",
    };
    return statusColors[status] || "bg-gray-100 text-gray-800";
  };

  const renderItemList = (items: any[], tipo: string, icon: React.ReactNode) => {
    if (items.length === 0) {
      return (
        <div className="text-center py-8 text-muted-foreground">
          <p>Nenhum item encontrado</p>
        </div>
      );
    }

    return (
      <div className="space-y-3">
        {items.map((item) => (
          <div
            key={item.id}
            className="flex items-center justify-between p-4 bg-muted/30 rounded-lg border"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg text-primary">
                {icon}
              </div>
              <div>
                <p className="font-medium">{item.titulo}</p>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <span>#{item.protocolo}</span>
                  <Badge className={getStatusBadge(item.status)}>{item.status}</Badge>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleExportJson(tipo, item.id, item.protocolo)}
                disabled={exportingItem === `${tipo}-${item.id}`}
              >
                {exportingItem === `${tipo}-${item.id}` ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <FileJson className="w-4 h-4" />
                )}
                <span className="ml-1 hidden sm:inline">JSON</span>
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleExportPdf(tipo, item.id, item.protocolo)}
                disabled={exportingItem === `pdf-${tipo}-${item.id}`}
              >
                {exportingItem === `pdf-${tipo}-${item.id}` ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <FileText className="w-4 h-4" />
                )}
                <span className="ml-1 hidden sm:inline">PDF</span>
              </Button>
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-serif font-bold text-foreground flex items-center gap-2">
          <Cloud className="w-7 h-7 text-primary" />
          Exportar para Nuvem
        </h1>
        <p className="text-muted-foreground mt-1">
          Exporte seus dados em PDF ou JSON para enviar ao Google Drive, Dropbox ou OneDrive
        </p>
      </div>

      {/* Instruções */}
      <Card className="border-primary/20 bg-primary/5">
        <CardContent className="pt-4">
          <div className="flex gap-3">
            <Info className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
            <div className="text-sm">
              <p className="font-medium text-foreground mb-1">Como enviar para sua nuvem:</p>
              <ol className="list-decimal list-inside space-y-1 text-muted-foreground">
                <li>Selecione a organização e exporte os arquivos desejados</li>
                <li>Os arquivos serão baixados para seu dispositivo</li>
                <li>Abra o Google Drive, Dropbox ou OneDrive</li>
                <li>Faça upload dos arquivos baixados para sua pasta preferida</li>
              </ol>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Seletor de Organização */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Selecione a Organização</CardTitle>
          <CardDescription>
            Escolha a organização para visualizar os itens disponíveis para exportação
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Select
            value={selectedCondominio?.toString() || ""}
            onValueChange={(value) => setSelectedCondominio(parseInt(value))}
          >
            <SelectTrigger className="w-full max-w-md">
              <SelectValue placeholder="Selecione uma organização" />
            </SelectTrigger>
            <SelectContent>
              {condominios.map((c) => (
                <SelectItem key={c.id} value={c.id.toString()}>
                  {c.nome}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* Tabs de Categorias */}
      {selectedCondominio && (
        <Tabs defaultValue="vistorias" className="space-y-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="vistorias" className="flex items-center gap-1">
              <ClipboardCheck className="w-4 h-4" />
              <span className="hidden sm:inline">Vistorias</span>
              <Badge variant="secondary" className="ml-1">{vistorias.length}</Badge>
            </TabsTrigger>
            <TabsTrigger value="manutencoes" className="flex items-center gap-1">
              <Wrench className="w-4 h-4" />
              <span className="hidden sm:inline">Manutenções</span>
              <Badge variant="secondary" className="ml-1">{manutencoes.length}</Badge>
            </TabsTrigger>
            <TabsTrigger value="ocorrencias" className="flex items-center gap-1">
              <AlertTriangle className="w-4 h-4" />
              <span className="hidden sm:inline">Ocorrências</span>
              <Badge variant="secondary" className="ml-1">{ocorrencias.length}</Badge>
            </TabsTrigger>
            <TabsTrigger value="checklists" className="flex items-center gap-1">
              <ListChecks className="w-4 h-4" />
              <span className="hidden sm:inline">Checklists</span>
              <Badge variant="secondary" className="ml-1">{checklists.length}</Badge>
            </TabsTrigger>
          </TabsList>

          {/* Vistorias */}
          <TabsContent value="vistorias">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <ClipboardCheck className="w-5 h-5 text-primary" />
                    Vistorias
                  </CardTitle>
                  <CardDescription>{vistorias.length} vistorias disponíveis</CardDescription>
                </div>
                <Button
                  onClick={() => handleExportAll("vistorias")}
                  disabled={vistorias.length === 0 || exportingItem === "all-vistorias"}
                >
                  {exportingItem === "all-vistorias" ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <FolderDown className="w-4 h-4 mr-2" />
                  )}
                  Exportar Todas
                </Button>
              </CardHeader>
              <CardContent>
                {renderItemList(vistorias, "vistoria", <ClipboardCheck className="w-4 h-4" />)}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Manutenções */}
          <TabsContent value="manutencoes">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Wrench className="w-5 h-5 text-primary" />
                    Manutenções
                  </CardTitle>
                  <CardDescription>{manutencoes.length} manutenções disponíveis</CardDescription>
                </div>
                <Button
                  onClick={() => handleExportAll("manutencoes")}
                  disabled={manutencoes.length === 0 || exportingItem === "all-manutencoes"}
                >
                  {exportingItem === "all-manutencoes" ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <FolderDown className="w-4 h-4 mr-2" />
                  )}
                  Exportar Todas
                </Button>
              </CardHeader>
              <CardContent>
                {renderItemList(manutencoes, "manutencao", <Wrench className="w-4 h-4" />)}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Ocorrências */}
          <TabsContent value="ocorrencias">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-primary" />
                    Ocorrências
                  </CardTitle>
                  <CardDescription>{ocorrencias.length} ocorrências disponíveis</CardDescription>
                </div>
                <Button
                  onClick={() => handleExportAll("ocorrencias")}
                  disabled={ocorrencias.length === 0 || exportingItem === "all-ocorrencias"}
                >
                  {exportingItem === "all-ocorrencias" ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <FolderDown className="w-4 h-4 mr-2" />
                  )}
                  Exportar Todas
                </Button>
              </CardHeader>
              <CardContent>
                {renderItemList(ocorrencias, "ocorrencia", <AlertTriangle className="w-4 h-4" />)}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Checklists */}
          <TabsContent value="checklists">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <ListChecks className="w-5 h-5 text-primary" />
                    Checklists
                  </CardTitle>
                  <CardDescription>{checklists.length} checklists disponíveis</CardDescription>
                </div>
                <Button
                  onClick={() => handleExportAll("checklists")}
                  disabled={checklists.length === 0 || exportingItem === "all-checklists"}
                >
                  {exportingItem === "all-checklists" ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <FolderDown className="w-4 h-4 mr-2" />
                  )}
                  Exportar Todos
                </Button>
              </CardHeader>
              <CardContent>
                {renderItemList(checklists, "checklist", <ListChecks className="w-4 h-4" />)}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}

      {/* Dicas de Serviços de Nuvem */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-blue-200 bg-blue-50/50">
          <CardContent className="pt-4">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                <Cloud className="w-5 h-5 text-white" />
              </div>
              <span className="font-medium">Google Drive</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Acesse drive.google.com e arraste os arquivos para fazer upload
            </p>
          </CardContent>
        </Card>

        <Card className="border-blue-200 bg-blue-50/50">
          <CardContent className="pt-4">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <Cloud className="w-5 h-5 text-white" />
              </div>
              <span className="font-medium">Dropbox</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Acesse dropbox.com e use o botão "Fazer upload" para enviar
            </p>
          </CardContent>
        </Card>

        <Card className="border-blue-200 bg-blue-50/50">
          <CardContent className="pt-4">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-8 h-8 bg-sky-500 rounded-lg flex items-center justify-center">
                <Cloud className="w-5 h-5 text-white" />
              </div>
              <span className="font-medium">OneDrive</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Acesse onedrive.com e clique em "Carregar" para enviar arquivos
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
