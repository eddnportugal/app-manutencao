import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { trpc } from "@/lib/trpc";
import { cn } from "@/lib/utils";
import {
  Vote,
  Plus,
  Share2,
  Trash2,
  CheckCircle,
  Calendar,
  Users,
  Loader2,
  Eye,
  Download,
  FileSpreadsheet,
  FileText,
  MessageCircle,
  Copy,
  ExternalLink,
  BarChart3,
  User,
  Clock,
  Image as ImageIcon,
} from "lucide-react";
import { useState } from "react";
import { toast } from "@/components/ui/sonner";
import VotacaoForm from "@/components/forms/VotacaoForm";

export default function VotacoesPage() {
  const { data: condominios } = trpc.condominio.list.useQuery();
  const condominioId = condominios?.[0]?.id;
  const { data: revistas } = trpc.revista.list.useQuery(
    { condominioId: condominioId! },
    { enabled: !!condominioId }
  );
  const revistaId = revistas?.[0]?.id || 0;

  const { data: votacoes, refetch } = trpc.votacao.list.useQuery(
    { revistaId },
    { enabled: !!revistaId }
  );

  const deleteVotacao = trpc.votacao.delete.useMutation({
    onSuccess: () => {
      refetch();
      toast.success("Votação removida!");
    },
  });

  const encerrarVotacao = trpc.votacao.encerrar.useMutation({
    onSuccess: () => {
      refetch();
      toast.success("Votação encerrada!");
    },
  });

  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showDetailDialog, setShowDetailDialog] = useState(false);
  const [selectedVotacaoId, setSelectedVotacaoId] = useState<number | null>(null);

  const tipoLabels: Record<string, string> = {
    funcionario_mes: "Funcionário do Mês",
    enquete: "Enquete",
    decisao: "Decisão",
  };

  const tipoColors: Record<string, string> = {
    funcionario_mes: "bg-gradient-to-r from-amber-500 to-orange-500",
    enquete: "bg-gradient-to-r from-blue-500 to-blue-600",
    decisao: "bg-gradient-to-r from-purple-500 to-purple-600",
  };

  const statusColors: Record<string, string> = {
    ativa: "bg-gradient-to-r from-green-500 to-emerald-500",
    encerrada: "bg-gray-500",
  };

  const handleCopyLink = (votacaoId: number) => {
    const url = `${window.location.origin}/votar/${votacaoId}`;
    navigator.clipboard.writeText(url);
    toast.success("Link copiado para a área de transferência!");
  };

  const handleWhatsAppShare = (votacao: any) => {
    const url = `${window.location.origin}/votar/${votacao.id}`;
    const text = `*${votacao.titulo}*\n\n${votacao.descricao || 'Participe da votação!'}\n\nAcesse o link para votar:\n${url}`;
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(whatsappUrl, '_blank');
  };

  const openDetailDialog = (votacaoId: number) => {
    setSelectedVotacaoId(votacaoId);
    setShowDetailDialog(true);
  };

  if (!condominios?.length) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-serif font-bold text-foreground">Votações</h1>
          <p className="text-muted-foreground">Gerencie votações e enquetes</p>
        </div>
        <Card>
          <CardContent className="pt-6 text-center">
            <Vote className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">Cadastre uma organização primeiro</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-serif font-bold text-foreground">Votações</h1>
          <p className="text-muted-foreground">Crie enquetes e votações para a equipa</p>
        </div>
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700">
              <Plus className="w-4 h-4 mr-2" />
              Nova Votação
            </Button>
          </DialogTrigger>
          <DialogContent className="w-[95vw] max-w-2xl max-h-[90vh] overflow-hidden p-0">
            <DialogHeader className="sr-only">
              <DialogTitle>Nova Votação</DialogTitle>
              <DialogDescription>Crie uma nova votação ou enquete para a equipa</DialogDescription>
            </DialogHeader>
            <VotacaoForm 
              revistaId={revistaId} 
              onSuccess={() => {
                setShowCreateDialog(false);
                refetch();
              }}
              onCancel={() => setShowCreateDialog(false)}
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Lista de Votações */}
      {votacoes?.length === 0 ? (
        <Card>
          <CardContent className="pt-6 text-center">
            <Vote className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground mb-4">Nenhuma votação criada</p>
            <Button 
              onClick={() => setShowCreateDialog(true)} 
              className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700"
            >
              Criar Primeira Votação
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {votacoes?.map((votacao) => (
            <Card key={votacao.id} className="overflow-hidden">
              <CardContent className="p-0">
                <div className="flex">
                  {/* Imagem da Votação */}
                  {votacao.imagemUrl && (
                    <div className="w-32 h-32 flex-shrink-0">
                      <img 
                        src={votacao.imagemUrl} 
                        alt={votacao.titulo}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  
                  {/* Conteúdo */}
                  <div className="flex-1 p-4">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        {/* Badges */}
                        <div className="flex items-center gap-2 mb-2">
                          <Badge className={cn("text-white border-0", tipoColors[votacao.tipo])}>
                            {tipoLabels[votacao.tipo]}
                          </Badge>
                          <Badge className={cn("text-white border-0", statusColors[votacao.status || "ativa"])}>
                            {votacao.status === "encerrada" ? "Encerrada" : "Ativa"}
                          </Badge>
                        </div>
                        
                        {/* Título e Descrição */}
                        <h3 className="font-serif font-bold text-lg mb-1">{votacao.titulo}</h3>
                        {votacao.descricao && (
                          <p className="text-muted-foreground text-sm mb-3 line-clamp-2">{votacao.descricao}</p>
                        )}
                        
                        {/* Metadados */}
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          {votacao.dataFim && (
                            <span className="flex items-center gap-1">
                              <Calendar className="w-4 h-4" />
                              Encerra: {new Date(votacao.dataFim).toLocaleDateString('pt-BR')}
                            </span>
                          )}
                          <span className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            {new Date(votacao.createdAt).toLocaleDateString('pt-BR')}
                          </span>
                        </div>
                      </div>
                      
                      {/* Ações */}
                      <div className="flex flex-col gap-2 ml-4">
                        {/* Botões de Compartilhamento em Destaque */}
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white"
                            onClick={() => handleWhatsAppShare(votacao)}
                          >
                            <MessageCircle className="w-4 h-4 mr-1" />
                            WhatsApp
                          </Button>
                          <Button
                            size="sm"
                            className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white"
                            onClick={() => handleCopyLink(votacao.id)}
                          >
                            <Copy className="w-4 h-4 mr-1" />
                            Link
                          </Button>
                        </div>
                        
                        {/* Botões Secundários */}
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openDetailDialog(votacao.id)}
                          >
                            <Eye className="w-4 h-4 mr-1" />
                            Detalhes
                          </Button>
                          {votacao.status !== "encerrada" && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                if (confirm("Tem certeza que deseja encerrar esta votação?")) {
                                  encerrarVotacao.mutate({ id: votacao.id });
                                }
                              }}
                            >
                              <CheckCircle className="w-4 h-4 mr-1" />
                              Encerrar
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              if (confirm("Tem certeza que deseja excluir esta votação?")) {
                                deleteVotacao.mutate({ id: votacao.id });
                              }
                            }}
                          >
                            <Trash2 className="w-4 h-4 text-destructive" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Dialog de Detalhes */}
      <Dialog open={showDetailDialog} onOpenChange={setShowDetailDialog}>
        <DialogContent className="w-[95vw] max-w-3xl max-h-[90vh] overflow-hidden p-0">
          <DialogHeader className="sr-only">
            <DialogTitle>Detalhes da Votação</DialogTitle>
            <DialogDescription>Visualize os resultados e detalhes da votação</DialogDescription>
          </DialogHeader>
          {selectedVotacaoId && (
            <VotacaoDetailView 
              votacaoId={selectedVotacaoId} 
              onClose={() => setShowDetailDialog(false)}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Componente de Visualização Detalhada da Votação
function VotacaoDetailView({ votacaoId, onClose }: { votacaoId: number; onClose: () => void }) {
  const { data: votacao, isLoading } = trpc.votacao.get.useQuery({ id: votacaoId });
  const { data: votantes } = trpc.votacao.listarVotantes.useQuery({ votacaoId });
  const [activeTab, setActiveTab] = useState("resultados");

  if (isLoading) {
    return (
      <div className="p-8 text-center">
        <Loader2 className="w-8 h-8 animate-spin mx-auto" />
        <p className="mt-2 text-muted-foreground">A carregar...</p>
      </div>
    );
  }

  if (!votacao) {
    return (
      <div className="p-8 text-center">
        <p className="text-muted-foreground">Votação não encontrada</p>
      </div>
    );
  }

  const totalVotos = votacao.opcoes?.reduce((acc, opt) => acc + (opt.votos || 0), 0) || 0;

  const handleExportPDF = () => {
    // Criar conteúdo do PDF
    const content = `
RESULTADOS DA VOTAÇÃO
=====================

Título: ${votacao.titulo}
Descrição: ${votacao.descricao || 'N/A'}
Status: ${votacao.status === 'encerrada' ? 'Encerrada' : 'Ativa'}
Total de Votos: ${totalVotos}

OPÇÕES E RESULTADOS:
${votacao.opcoes?.map((opt, i) => {
  const percentagem = totalVotos > 0 ? Math.round(((opt.votos || 0) / totalVotos) * 100) : 0;
  return `${i + 1}. ${opt.titulo}: ${opt.votos || 0} votos (${percentagem}%)`;
}).join('\n')}

${votantes && votantes.length > 0 ? `
LISTA DE VOTANTES:
${votantes.map((v, i) => `${i + 1}. ${v.userName || v.userEmail} - Votou em: ${v.opcaoTitulo} - ${new Date(v.createdAt).toLocaleString('pt-BR')}`).join('\n')}
` : ''}

Gerado em: ${new Date().toLocaleString('pt-BR')}
    `;

    // Criar blob e download
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `votacao-${votacao.titulo.replace(/\s+/g, '-').toLowerCase()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success("Relatório exportado com sucesso!");
  };

  const handleExportExcel = () => {
    // Criar CSV para Excel
    let csv = 'Opção,Votos,Percentagem\n';
    votacao.opcoes?.forEach(opt => {
      const percentagem = totalVotos > 0 ? Math.round(((opt.votos || 0) / totalVotos) * 100) : 0;
      csv += `"${opt.titulo}",${opt.votos || 0},${percentagem}%\n`;
    });

    if (votantes && votantes.length > 0) {
      csv += '\n\nVotante,Email,Opção Votada,Data/Hora\n';
      votantes.forEach(v => {
        csv += `"${v.userName || 'N/A'}","${v.userEmail || 'N/A'}","${v.opcaoTitulo}","${new Date(v.createdAt).toLocaleString('pt-BR')}"\n`;
      });
    }

    const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `votacao-${votacao.titulo.replace(/\s+/g, '-').toLowerCase()}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success("Excel exportado com sucesso!");
  };

  const handleCopyLink = () => {
    const url = `${window.location.origin}/votar/${votacaoId}`;
    navigator.clipboard.writeText(url);
    toast.success("Link copiado!");
  };

  const handleWhatsAppShare = () => {
    const url = `${window.location.origin}/votar/${votacaoId}`;
    const text = `*${votacao.titulo}*\n\n${votacao.descricao || 'Participe da votação!'}\n\nAcesse o link para votar:\n${url}`;
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(whatsappUrl, '_blank');
  };

  return (
    <div className="flex flex-col h-full max-h-[90vh]">
      {/* Header com Gradiente */}
      <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <Badge className="bg-white/20 text-white border-0">
                {votacao.tipo === 'funcionario_mes' ? 'Funcionário do Mês' : 
                 votacao.tipo === 'enquete' ? 'Enquete' : 'Decisão'}
              </Badge>
              <Badge className={cn("border-0", votacao.status === 'encerrada' ? 'bg-gray-500' : 'bg-green-500')}>
                {votacao.status === 'encerrada' ? 'Encerrada' : 'Ativa'}
              </Badge>
            </div>
            <h2 className="text-2xl font-bold mb-1">{votacao.titulo}</h2>
            {votacao.descricao && (
              <p className="text-white/80">{votacao.descricao}</p>
            )}
            <div className="flex items-center gap-4 mt-3 text-sm text-white/70">
              <span className="flex items-center gap-1">
                <Users className="w-4 h-4" />
                {totalVotos} votos
              </span>
              {votacao.dataFim && (
                <span className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  Encerra: {new Date(votacao.dataFim).toLocaleDateString('pt-BR')}
                </span>
              )}
            </div>
          </div>
          
          {/* Imagem da Votação */}
          {votacao.imagemUrl && (
            <div className="w-24 h-24 rounded-lg overflow-hidden ml-4 flex-shrink-0">
              <img 
                src={votacao.imagemUrl} 
                alt={votacao.titulo}
                className="w-full h-full object-cover"
              />
            </div>
          )}
        </div>
        
        {/* Botões de Compartilhamento em Destaque */}
        <div className="flex gap-2 mt-4">
          <Button
            size="sm"
            className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white border-0"
            onClick={handleWhatsAppShare}
          >
            <MessageCircle className="w-4 h-4 mr-1" />
            Compartilhar WhatsApp
          </Button>
          <Button
            size="sm"
            className="bg-white/20 hover:bg-white/30 text-white border-0"
            onClick={handleCopyLink}
          >
            <Copy className="w-4 h-4 mr-1" />
            Copiar Link
          </Button>
          <Button
            size="sm"
            className="bg-white/20 hover:bg-white/30 text-white border-0"
            onClick={() => window.open(`/votar/${votacaoId}`, '_blank')}
          >
            <ExternalLink className="w-4 h-4 mr-1" />
            Abrir Votação
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col overflow-hidden">
        <TabsList className="w-full justify-start rounded-none border-b bg-transparent px-6">
          <TabsTrigger value="resultados" className="data-[state=active]:border-b-2 data-[state=active]:border-blue-500">
            <BarChart3 className="w-4 h-4 mr-2" />
            Resultados
          </TabsTrigger>
          <TabsTrigger value="votantes" className="data-[state=active]:border-b-2 data-[state=active]:border-blue-500">
            <Users className="w-4 h-4 mr-2" />
            Votantes ({votantes?.length || 0})
          </TabsTrigger>
          <TabsTrigger value="exportar" className="data-[state=active]:border-b-2 data-[state=active]:border-blue-500">
            <Download className="w-4 h-4 mr-2" />
            Exportar
          </TabsTrigger>
        </TabsList>

        <div className="flex-1 overflow-y-auto p-6">
          {/* Tab Resultados */}
          <TabsContent value="resultados" className="m-0 space-y-4">
            {votacao.opcoes?.map((opcao, index) => {
              const percentagem = totalVotos > 0 ? Math.round(((opcao.votos || 0) / totalVotos) * 100) : 0;
              const cores = [
                'from-blue-500 to-blue-600',
                'from-green-500 to-green-600',
                'from-amber-500 to-orange-500',
                'from-purple-500 to-purple-600',
                'from-pink-500 to-pink-600',
                'from-indigo-500 to-indigo-600',
              ];
              const cor = cores[index % cores.length];
              
              return (
                <div key={opcao.id} className="space-y-2">
                  <div className="flex items-center gap-3">
                    {/* Imagem da Opção */}
                    {opcao.imagemUrl && (
                      <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0">
                        <img 
                          src={opcao.imagemUrl} 
                          alt={opcao.titulo}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                    <div className="flex-1">
                      <div className="flex justify-between items-center mb-1">
                        <span className="font-medium">{opcao.titulo}</span>
                        <span className="text-sm text-muted-foreground">
                          {opcao.votos || 0} votos ({percentagem}%)
                        </span>
                      </div>
                      <div className="h-4 bg-muted rounded-full overflow-hidden">
                        <div 
                          className={`h-full bg-gradient-to-r ${cor} transition-all duration-500 rounded-full`}
                          style={{ width: `${Math.max(percentagem, 2)}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </TabsContent>

          {/* Tab Votantes */}
          <TabsContent value="votantes" className="m-0">
            {votantes && votantes.length > 0 ? (
              <div className="space-y-2">
                {votantes.map((votante) => (
                  <div 
                    key={votante.id} 
                    className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 flex items-center justify-center text-white font-medium">
                        {(votante.userName || votante.userEmail || '?')[0].toUpperCase()}
                      </div>
                      <div>
                        <p className="font-medium">{votante.userName || 'Utilizador'}</p>
                        <p className="text-sm text-muted-foreground">{votante.userEmail}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge variant="outline" className="mb-1">
                        {votante.opcaoTitulo}
                      </Badge>
                      <p className="text-xs text-muted-foreground">
                        {new Date(votante.createdAt).toLocaleString('pt-BR')}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Users className="w-12 h-12 mx-auto text-muted-foreground mb-2" />
                <p className="text-muted-foreground">Nenhum voto registado ainda</p>
              </div>
            )}
          </TabsContent>

          {/* Tab Exportar */}
          <TabsContent value="exportar" className="m-0">
            <div className="grid gap-4 md:grid-cols-2">
              <Card className="cursor-pointer hover:border-blue-500 transition-colors" onClick={handleExportPDF}>
                <CardContent className="pt-6 text-center">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-r from-red-500 to-red-600 flex items-center justify-center">
                    <FileText className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="font-semibold mb-1">Exportar PDF</h3>
                  <p className="text-sm text-muted-foreground">
                    Relatório completo com resultados e lista de votantes
                  </p>
                </CardContent>
              </Card>
              
              <Card className="cursor-pointer hover:border-green-500 transition-colors" onClick={handleExportExcel}>
                <CardContent className="pt-6 text-center">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-r from-green-500 to-green-600 flex items-center justify-center">
                    <FileSpreadsheet className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="font-semibold mb-1">Exportar Excel</h3>
                  <p className="text-sm text-muted-foreground">
                    Dados em formato CSV para análise em planilhas
                  </p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}
