import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { FieldSettingsButton } from "@/components/FieldSettingsModal";
// DashboardLayout removido - agora usa o menu do Dashboard.tsx
import CalendarioVencimentos from "@/components/CalendarioVencimentos";
import NotificacoesVencimentos from "@/components/NotificacoesVencimentos";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "@/components/ui/sonner";
import { 
  Calendar, 
  FileText, 
  FileSpreadsheet,
  Wrench, 
  Settings, 
  Plus, 
  Pencil, 
  Trash2, 
  AlertTriangle, 
  Clock, 
  CheckCircle2, 
  XCircle,
  Bell,
  Mail,
  Send,
  Upload,
  Download,
  Eye,
  BarChart3,
  PieChart,
  TrendingUp,
  DollarSign,
  Activity
} from "lucide-react";
import { exportVencimentosExcel } from "@/lib/excelExport";

type TipoVencimento = 'contrato' | 'servico' | 'manutencao';
type TipoAlerta = 'na_data' | 'um_dia_antes' | 'uma_semana_antes' | 'quinze_dias_antes' | 'um_mes_antes';

const tipoLabels: Record<TipoVencimento, string> = {
  contrato: 'Contrato',
  servico: 'Serviço',
  manutencao: 'Manutenção',
};

const tipoIcons: Record<TipoVencimento, typeof FileText> = {
  contrato: FileText,
  servico: Settings,
  manutencao: Wrench,
};

const alertaLabels: Record<TipoAlerta, string> = {
  na_data: 'Na data',
  um_dia_antes: '1 dia antes',
  uma_semana_antes: '1 semana antes',
  quinze_dias_antes: '15 dias antes',
  um_mes_antes: '1 mês antes',
};

const periodicidadeLabels: Record<string, string> = {
  unico: 'Único',
  mensal: 'Mensal',
  bimestral: 'Bimestral',
  trimestral: 'Trimestral',
  semestral: 'Semestral',
  anual: 'Anual',
};

function getStatusBadge(diasRestantes: number, vencido: boolean) {
  if (vencido) {
    return (
      <Badge variant="destructive" className="gap-1">
        <XCircle className="h-3 w-3" />
        Vencido há {Math.abs(diasRestantes)} dias
      </Badge>
    );
  }
  if (diasRestantes === 0) {
    return (
      <Badge variant="destructive" className="gap-1 animate-pulse">
        <AlertTriangle className="h-3 w-3" />
        Vence hoje!
      </Badge>
    );
  }
  if (diasRestantes <= 7) {
    return (
      <Badge variant="destructive" className="gap-1">
        <AlertTriangle className="h-3 w-3" />
        {diasRestantes} dias
      </Badge>
    );
  }
  if (diasRestantes <= 15) {
    return (
      <Badge className="gap-1 bg-orange-500 hover:bg-orange-600 text-white">
        <Clock className="h-3 w-3" />
        {diasRestantes} dias
      </Badge>
    );
  }
  if (diasRestantes <= 30) {
    return (
      <Badge variant="secondary" className="gap-1 bg-yellow-500 hover:bg-yellow-600 text-white">
        <Clock className="h-3 w-3" />
        {diasRestantes} dias
      </Badge>
    );
  }
  return (
    <Badge variant="outline" className="gap-1 text-green-600 border-green-600">
      <CheckCircle2 className="h-3 w-3" />
      {diasRestantes} dias
    </Badge>
  );
}

function VencimentoForm({ 
  tipo, 
  condominioId, 
  vencimento, 
  onSuccess, 
  onCancel 
}: { 
  tipo: TipoVencimento;
  condominioId: number;
  vencimento?: any;
  onSuccess: () => void;
  onCancel: () => void;
}) {
  const [titulo, setTitulo] = useState(vencimento?.titulo || '');
  const [descricao, setDescricao] = useState(vencimento?.descricao || '');
  const [fornecedor, setFornecedor] = useState(vencimento?.fornecedor || '');
  const [valor, setValor] = useState(vencimento?.valor || '');
  const [dataInicio, setDataInicio] = useState(vencimento?.dataInicio ? new Date(vencimento.dataInicio).toISOString().split('T')[0] : '');
  const [dataVencimento, setDataVencimento] = useState(vencimento?.dataVencimento ? new Date(vencimento.dataVencimento).toISOString().split('T')[0] : '');
  const [ultimaRealizacao, setUltimaRealizacao] = useState(vencimento?.ultimaRealizacao ? new Date(vencimento.ultimaRealizacao).toISOString().split('T')[0] : '');
  const [proximaRealizacao, setProximaRealizacao] = useState(vencimento?.proximaRealizacao ? new Date(vencimento.proximaRealizacao).toISOString().split('T')[0] : '');
  const [periodicidade, setPeriodicidade] = useState(vencimento?.periodicidade || 'unico');
  const [observacoes, setObservacoes] = useState(vencimento?.observacoes || '');
  const [alertas, setAlertas] = useState<TipoAlerta[]>(
    vencimento?.alertas?.map((a: any) => a.tipoAlerta) || ['uma_semana_antes']
  );
  const [arquivoUrl, setArquivoUrl] = useState(vencimento?.arquivoUrl || '');
  const [arquivoNome, setArquivoNome] = useState(vencimento?.arquivoNome || '');
  const [uploading, setUploading] = useState(false);

  // Função para fazer upload do arquivo
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validar tamanho (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast.error('Arquivo muito grande. Máximo 10MB.');
      return;
    }

    // Validar tipo (PDF, DOC, DOCX, XLS, XLSX, imagens)
    const tiposPermitidos = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'image/jpeg', 'image/png', 'image/gif'];
    if (!tiposPermitidos.includes(file.type)) {
      toast.error('Tipo de arquivo não permitido. Use PDF, DOC, XLS ou imagens.');
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) throw new Error('Erro ao fazer upload');
      
      const data = await response.json();
      setArquivoUrl(data.url);
      setArquivoNome(file.name);
      toast.success('Arquivo enviado com sucesso!');
    } catch (error) {
      toast.error('Erro ao enviar arquivo');
    } finally {
      setUploading(false);
    }
  };

  const removerArquivo = () => {
    setArquivoUrl('');
    setArquivoNome('');
  };

  const utils = trpc.useUtils();
  const createMutation = trpc.vencimentos.create.useMutation({
    onSuccess: () => {
      toast.success(`${tipoLabels[tipo]} criado com sucesso!`);
      utils.vencimentos.list.invalidate();
      utils.vencimentos.stats.invalidate();
      utils.vencimentos.proximos.invalidate();
      utils.vencimentosDashboard.estatisticasGerais.invalidate();
      utils.vencimentosDashboard.porMes.invalidate();
      utils.vencimentosDashboard.porCategoria.invalidate();
      utils.vencimentosDashboard.porStatus.invalidate();
      utils.vencimentosDashboard.vencidos.invalidate();
      utils.vencimentosDashboard.evolucao.invalidate();
      onSuccess();
    },
    onError: (error) => {
      toast.error(`Erro ao criar: ${error.message}`);
    },
  });

  const updateMutation = trpc.vencimentos.update.useMutation({
    onSuccess: () => {
      toast.success(`${tipoLabels[tipo]} atualizado com sucesso!`);
      utils.vencimentos.list.invalidate();
      utils.vencimentos.stats.invalidate();
      utils.vencimentos.proximos.invalidate();
      utils.vencimentosDashboard.estatisticasGerais.invalidate();
      utils.vencimentosDashboard.porMes.invalidate();
      utils.vencimentosDashboard.porCategoria.invalidate();
      utils.vencimentosDashboard.porStatus.invalidate();
      utils.vencimentosDashboard.vencidos.invalidate();
      utils.vencimentosDashboard.evolucao.invalidate();
      onSuccess();
    },
    onError: (error) => {
      toast.error(`Erro ao atualizar: ${error.message}`);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!titulo || !dataVencimento) {
      toast.error('Preencha os campos obrigatórios');
      return;
    }

    const data = {
      titulo,
      descricao: descricao || undefined,
      fornecedor: fornecedor || undefined,
      valor: valor || undefined,
      dataInicio: dataInicio || undefined,
      dataVencimento,
      ultimaRealizacao: ultimaRealizacao || undefined,
      proximaRealizacao: proximaRealizacao || undefined,
      periodicidade: periodicidade as any,
      observacoes: observacoes || undefined,
      arquivoUrl: arquivoUrl || undefined,
      arquivoNome: arquivoNome || undefined,
      alertas,
    };

    if (vencimento) {
      updateMutation.mutate({ id: vencimento.id, ...data });
    } else {
      createMutation.mutate({ condominioId, tipo, ...data });
    }
  };

  const toggleAlerta = (alerta: TipoAlerta) => {
    setAlertas(prev => 
      prev.includes(alerta) 
        ? prev.filter(a => a !== alerta)
        : [...prev, alerta]
    );
  };

  const isLoading = createMutation.isPending || updateMutation.isPending;

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="col-span-2">
          <Label htmlFor="titulo">Título *</Label>
          <Input
            id="titulo"
            value={titulo}
            onChange={(e) => setTitulo(e.target.value)}
            placeholder={`Nome do ${tipoLabels[tipo].toLowerCase()}`}
            required
          />
        </div>

        <div>
          <Label htmlFor="fornecedor">Fornecedor/Empresa</Label>
          <Input
            id="fornecedor"
            value={fornecedor}
            onChange={(e) => setFornecedor(e.target.value)}
            placeholder="Nome do fornecedor"
          />
        </div>

        <div>
          <Label htmlFor="valor">Valor (R$)</Label>
          <Input
            id="valor"
            value={valor}
            onChange={(e) => setValor(e.target.value)}
            placeholder="0,00"
          />
        </div>

        <div>
          <Label htmlFor="dataInicio">Data de Início</Label>
          <Input
            id="dataInicio"
            type="date"
            value={dataInicio}
            onChange={(e) => setDataInicio(e.target.value)}
          />
        </div>

        <div>
          <Label htmlFor="dataVencimento">Data de Vencimento *</Label>
          <Input
            id="dataVencimento"
            type="date"
            value={dataVencimento}
            onChange={(e) => setDataVencimento(e.target.value)}
            required
          />
        </div>

        {tipo === 'manutencao' && (
          <>
            <div>
              <Label htmlFor="ultimaRealizacao">Última Realização</Label>
              <Input
                id="ultimaRealizacao"
                type="date"
                value={ultimaRealizacao}
                onChange={(e) => setUltimaRealizacao(e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="proximaRealizacao">Próxima Realização</Label>
              <Input
                id="proximaRealizacao"
                type="date"
                value={proximaRealizacao}
                onChange={(e) => setProximaRealizacao(e.target.value)}
              />
            </div>
          </>
        )}

        <div>
          <Label htmlFor="periodicidade">Periodicidade</Label>
          <Select value={periodicidade} onValueChange={setPeriodicidade}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(periodicidadeLabels).map(([value, label]) => (
                <SelectItem key={value} value={value}>{label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="col-span-2">
          <Label htmlFor="descricao">Descrição</Label>
          <Textarea
            id="descricao"
            value={descricao}
            onChange={(e) => setDescricao(e.target.value)}
            placeholder="Descrição detalhada..."
            rows={3}
          />
        </div>

        <div className="col-span-2">
          <Label htmlFor="observacoes">Observações</Label>
          <Textarea
            id="observacoes"
            value={observacoes}
            onChange={(e) => setObservacoes(e.target.value)}
            placeholder="Observações adicionais..."
            rows={2}
          />
        </div>

        <div className="col-span-2">
          <Label className="mb-2 block">Anexar Arquivo (Contrato, Documento)</Label>
          <div className="flex items-center gap-2">
            {arquivoUrl ? (
              <div className="flex items-center gap-2 p-2 bg-gray-100 rounded-lg flex-1">
                <FileText className="h-5 w-5 text-blue-600" />
                <a 
                  href={arquivoUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline truncate flex-1"
                >
                  {arquivoNome || 'Arquivo anexado'}
                </a>
                <Button type="button" variant="ghost" size="sm" onClick={removerArquivo}>
                  <XCircle className="h-4 w-4 text-red-500" />
                </Button>
              </div>
            ) : (
              <div className="flex-1">
                <Input
                  type="file"
                  accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png,.gif"
                  onChange={handleFileUpload}
                  disabled={uploading}
                  className="cursor-pointer"
                />
                {uploading && <p className="text-sm text-gray-500 mt-1">Enviando arquivo...</p>}
              </div>
            )}
          </div>
          <p className="text-xs text-gray-500 mt-1">PDF, DOC, XLS ou imagens. Máximo 10MB.</p>
        </div>

        <div className="col-span-2">
          <Label className="mb-2 block">Alertas por E-mail</Label>
          <div className="flex flex-wrap gap-3">
            {(Object.entries(alertaLabels) as [TipoAlerta, string][]).map(([value, label]) => (
              <div key={value} className="flex items-center space-x-2">
                <Checkbox
                  id={`alerta-${value}`}
                  checked={alertas.includes(value)}
                  onCheckedChange={() => toggleAlerta(value)}
                />
                <label
                  htmlFor={`alerta-${value}`}
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  {label}
                </label>
              </div>
            ))}
          </div>
        </div>
      </div>

      <DialogFooter>
        <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
          Cancelar
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? 'A guardar...' : vencimento ? 'Atualizar' : 'Criar'}
        </Button>
      </DialogFooter>
    </form>
  );
}

function VencimentosList({ tipo, condominioId }: { tipo: TipoVencimento; condominioId: number }) {
  const [editingId, setEditingId] = useState<number | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [viewingId, setViewingId] = useState<number | null>(null);

  const { data: listData, isLoading } = trpc.vencimentos.list.useQuery({ condominioId, tipo });
  const vencimentos = listData?.items || [];
  const { data: vencimentoDetalhes } = trpc.vencimentos.get.useQuery(
    { id: viewingId! },
    { enabled: !!viewingId }
  );

  const utils = trpc.useUtils();
  const deleteMutation = trpc.vencimentos.delete.useMutation({
    onSuccess: () => {
      toast.success(`${tipoLabels[tipo]} excluído com sucesso!`);
      utils.vencimentos.list.invalidate();
      utils.vencimentos.stats.invalidate();
      utils.vencimentos.proximos.invalidate();
      utils.vencimentosDashboard.estatisticasGerais.invalidate();
      utils.vencimentosDashboard.porMes.invalidate();
      utils.vencimentosDashboard.porCategoria.invalidate();
      utils.vencimentosDashboard.porStatus.invalidate();
      utils.vencimentosDashboard.vencidos.invalidate();
      utils.vencimentosDashboard.evolucao.invalidate();
    },
    onError: (error) => {
      toast.error(`Erro ao excluir: ${error.message}`);
    },
  });

  const enviarNotificacaoMutation = trpc.vencimentoNotificacoes.enviar.useMutation({
    onSuccess: (data) => {
      toast.success(`Notificação enviada para ${data.enviados} e-mail(s)!`);
    },
    onError: (error) => {
      toast.error(`Erro ao enviar: ${error.message}`);
    },
  });

  const handleDelete = (id: number) => {
    if (confirm(`Tem certeza que deseja excluir este ${tipoLabels[tipo].toLowerCase()}?`)) {
      deleteMutation.mutate({ id });
    }
  };

  const handleEnviarNotificacao = (vencimentoId: number) => {
    enviarNotificacaoMutation.mutate({ vencimentoId, condominioId });
  };

  const Icon = tipoIcons[tipo];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
        <h3 className="text-xl font-bold flex items-center gap-2.5 text-gray-800">
          <div className="p-2 bg-gray-100 rounded-xl">
            <Icon className="h-5 w-5 text-gray-600" />
          </div>
          {tipoLabels[tipo]}s
        </h3>
        <Dialog open={isCreating} onOpenChange={setIsCreating}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white shadow-md rounded-2xl h-12 px-6 text-sm font-semibold transition-all duration-200 active:scale-[0.98] w-full sm:w-auto">
              <Plus className="h-4 w-4 mr-2" />
              Adicionar {tipoLabels[tipo]}
            </Button>
          </DialogTrigger>
          <DialogContent className="w-[95vw] max-w-2xl max-h-[90vh] overflow-hidden p-0">
            <div className="bg-gradient-to-r from-blue-500 to-cyan-500 px-6 py-4">
              <DialogHeader className="space-y-1">
                <DialogTitle className="flex items-center gap-2 text-white text-lg">
                  <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
                    <Plus className="w-5 h-5 text-white" />
                  </div>
                  Novo {tipoLabels[tipo]}
                </DialogTitle>
                <DialogDescription className="text-blue-100">
                  Preencha os dados do {tipoLabels[tipo].toLowerCase()} a ser acompanhado.
                </DialogDescription>
              </DialogHeader>
            </div>
            <div className="p-6 overflow-y-auto max-h-[70vh]">
              {/* Botão de Configuração de Campos - Visível no topo */}
              <div className="flex justify-end mb-4">
                <FieldSettingsButton
                  condominioId={condominioId}
                  modalType="completa"
                  functionType="vencimentos"
                  variant="full"
                />
              </div>
              <VencimentoForm
              tipo={tipo}
              condominioId={condominioId}
              onSuccess={() => setIsCreating(false)}
              onCancel={() => setIsCreating(false)}
            />
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {!vencimentos || vencimentos.length === 0 ? (
        <Card className="rounded-3xl border-0 shadow-sm bg-gradient-to-br from-slate-50 to-white">
          <CardContent className="py-12 text-center">
            <div className="p-4 bg-gray-100 rounded-2xl w-fit mx-auto mb-5">
              <Icon className="h-12 w-12 text-gray-400" />
            </div>
            <p className="text-gray-500 text-base mb-1">Nenhum {tipoLabels[tipo].toLowerCase()} cadastrado.</p>
            <p className="text-gray-400 text-sm mb-6">Comece adicionando o primeiro registro</p>
            <Button 
              variant="outline" 
              className="rounded-2xl h-12 px-8 border-gray-200 hover:bg-gray-50 text-sm font-medium transition-all duration-200" 
              onClick={() => setIsCreating(true)}
            >
              <Plus className="h-4 w-4 mr-2" />
              Adicionar o primeiro
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {vencimentos.map((item) => (
            <Card key={item.id} className={`transition-all ${item.vencido ? 'border-red-500 bg-red-50/50 dark:bg-red-950/20' : item.diasRestantes <= 7 ? 'border-orange-500 bg-orange-50/50 dark:bg-orange-950/20' : ''}`}>
              <CardContent className="py-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-semibold truncate">{item.titulo}</h4>
                      {getStatusBadge(item.diasRestantes, item.vencido)}
                    </div>
                    
                    <div className="text-sm text-muted-foreground space-y-1">
                      {item.fornecedor && (
                        <p>Fornecedor: {item.fornecedor}</p>
                      )}
                      <p>
                        Vencimento: {new Date(item.dataVencimento).toLocaleDateString('pt-BR')}
                        {item.periodicidade && item.periodicidade !== 'unico' && (
                          <span className="ml-2">
                            <Badge variant="outline" className="text-xs">
                              {periodicidadeLabels[item.periodicidade]}
                            </Badge>
                          </span>
                        )}
                      </p>
                      {tipo === 'manutencao' && (
                        <>
                          {item.ultimaRealizacao && (
                            <p>Última realização: {new Date(item.ultimaRealizacao).toLocaleDateString('pt-BR')}</p>
                          )}
                          {item.proximaRealizacao && (
                            <p>Próxima realização: {new Date(item.proximaRealizacao).toLocaleDateString('pt-BR')}</p>
                          )}
                        </>
                      )}
                      {item.valor && (
                        <p>Valor: R$ {item.valor}</p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setViewingId(item.id)}
                      title="Ver detalhes"
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleEnviarNotificacao(item.id)}
                      disabled={enviarNotificacaoMutation.isPending}
                      title="Enviar notificação"
                    >
                      <Send className="h-4 w-4" />
                    </Button>
                    <Dialog open={editingId === item.id} onOpenChange={(open) => !open && setEditingId(null)}>
                      <DialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setEditingId(item.id)}
                          title="Editar"
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="w-[95vw] max-w-2xl max-h-[90vh] overflow-hidden p-0">
                        <div className="bg-gradient-to-r from-amber-500 to-orange-500 px-6 py-4">
                          <DialogHeader className="space-y-1">
                            <DialogTitle className="flex items-center gap-2 text-white text-lg">
                              <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
                                <Pencil className="w-5 h-5 text-white" />
                              </div>
                              Editar {tipoLabels[tipo]}
                            </DialogTitle>
                          </DialogHeader>
                        </div>
                        <div className="p-6 overflow-y-auto max-h-[70vh]">
                        <VencimentoForm
                          tipo={tipo}
                          condominioId={condominioId}
                          vencimento={item}
                          onSuccess={() => setEditingId(null)}
                          onCancel={() => setEditingId(null)}
                        />
                        </div>
                      </DialogContent>
                    </Dialog>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(item.id)}
                      disabled={deleteMutation.isPending}
                      title="Excluir"
                      className="text-red-600 hover:text-red-700 hover:bg-red-100"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Modal de detalhes */}
      <Dialog open={!!viewingId} onOpenChange={(open) => !open && setViewingId(null)}>
        <DialogContent className="w-[95vw] max-w-2xl p-0 overflow-hidden">
          <div className="bg-gradient-to-r from-slate-600 to-slate-700 px-6 py-4">
            <DialogHeader className="space-y-1">
              <DialogTitle className="flex items-center gap-2 text-white text-lg">
                <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
                  <Eye className="w-5 h-5 text-white" />
                </div>
                Detalhes do {tipoLabels[tipo]}
              </DialogTitle>
            </DialogHeader>
          </div>
          {vencimentoDetalhes && (
            <div className="space-y-4 p-6">
              <div className="flex items-center gap-2">
                <h3 className="text-xl font-semibold">{vencimentoDetalhes.titulo}</h3>
                {getStatusBadge(vencimentoDetalhes.diasRestantes, vencimentoDetalhes.vencido)}
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                {vencimentoDetalhes.fornecedor && (
                  <div>
                    <span className="text-muted-foreground">Fornecedor:</span>
                    <p className="font-medium">{vencimentoDetalhes.fornecedor}</p>
                  </div>
                )}
                {vencimentoDetalhes.valor && (
                  <div>
                    <span className="text-muted-foreground">Valor:</span>
                    <p className="font-medium">R$ {vencimentoDetalhes.valor}</p>
                  </div>
                )}
                {vencimentoDetalhes.dataInicio && (
                  <div>
                    <span className="text-muted-foreground">Data de Início:</span>
                    <p className="font-medium">{new Date(vencimentoDetalhes.dataInicio).toLocaleDateString('pt-BR')}</p>
                  </div>
                )}
                <div>
                  <span className="text-muted-foreground">Data de Vencimento:</span>
                  <p className="font-medium">{new Date(vencimentoDetalhes.dataVencimento).toLocaleDateString('pt-BR')}</p>
                </div>
                {tipo === 'manutencao' && vencimentoDetalhes.ultimaRealizacao && (
                  <div>
                    <span className="text-muted-foreground">Última Realização:</span>
                    <p className="font-medium">{new Date(vencimentoDetalhes.ultimaRealizacao).toLocaleDateString('pt-BR')}</p>
                  </div>
                )}
                {tipo === 'manutencao' && vencimentoDetalhes.proximaRealizacao && (
                  <div>
                    <span className="text-muted-foreground">Próxima Realização:</span>
                    <p className="font-medium">{new Date(vencimentoDetalhes.proximaRealizacao).toLocaleDateString('pt-BR')}</p>
                  </div>
                )}
                <div>
                  <span className="text-muted-foreground">Periodicidade:</span>
                  <p className="font-medium">{periodicidadeLabels[vencimentoDetalhes.periodicidade || 'unico']}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Status:</span>
                  <p className="font-medium capitalize">{vencimentoDetalhes.status}</p>
                </div>
              </div>

              {vencimentoDetalhes.descricao && (
                <div>
                  <span className="text-muted-foreground text-sm">Descrição:</span>
                  <p className="mt-1">{vencimentoDetalhes.descricao}</p>
                </div>
              )}

              {vencimentoDetalhes.observacoes && (
                <div>
                  <span className="text-muted-foreground text-sm">Observações:</span>
                  <p className="mt-1">{vencimentoDetalhes.observacoes}</p>
                </div>
              )}

              {vencimentoDetalhes.alertas && vencimentoDetalhes.alertas.length > 0 && (
                <div>
                  <span className="text-muted-foreground text-sm flex items-center gap-1">
                    <Bell className="h-4 w-4" />
                    Alertas configurados:
                  </span>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {vencimentoDetalhes.alertas.map((alerta: any) => (
                      <Badge key={alerta.id} variant="outline">
                        {alertaLabels[alerta.tipoAlerta as TipoAlerta]}
                        {alerta.enviado && <CheckCircle2 className="h-3 w-3 ml-1 text-green-600" />}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Componente de Dashboard com gráficos
function VencimentosDashboard({ condominioId }: { condominioId: number }) {
  const [anoSelecionado, setAnoSelecionado] = useState(new Date().getFullYear());
  const [periodoEvolucao, setPeriodoEvolucao] = useState(12);

  const { data: estatisticas } = trpc.vencimentosDashboard.estatisticasGerais.useQuery({ condominioId });
  const { data: porMes } = trpc.vencimentosDashboard.porMes.useQuery({ condominioId, ano: anoSelecionado });
  const { data: porCategoria } = trpc.vencimentosDashboard.porCategoria.useQuery({ condominioId });
  const { data: porStatus } = trpc.vencimentosDashboard.porStatus.useQuery({ condominioId });
  const { data: proximos } = trpc.vencimentos.proximos.useQuery({ condominioId, dias: 30 });
  const { data: vencidos } = trpc.vencimentosDashboard.vencidos.useQuery({ condominioId });
  const { data: evolucao } = trpc.vencimentosDashboard.evolucao.useQuery({ condominioId, meses: periodoEvolucao });

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
  };

  // Calcular máximo para escala do gráfico de barras
  const maxPorMes = porMes ? Math.max(...porMes.map(m => m.total), 1) : 1;
  const maxEvolucao = evolucao ? Math.max(...evolucao.map(e => e.total), 1) : 1;

  // Estados para os modais de cadastro rápido
  const [showContratoModal, setShowContratoModal] = useState(false);
  const [showServicoModal, setShowServicoModal] = useState(false);
  const [showManutencaoModal, setShowManutencaoModal] = useState(false);

  return (
    <div className="space-y-6">
      {/* Seção de Cadastro Rápido - Quando não há vencimentos */}
      {(estatisticas?.total || 0) === 0 && (
        <Card className="border-2 border-dashed border-orange-300/60 bg-gradient-to-br from-orange-50/80 via-amber-50/50 to-yellow-50/80 rounded-3xl overflow-hidden">
          <CardContent className="py-14 px-6 sm:px-10">
            <div className="text-center space-y-8">
              <div className="flex justify-center">
                <div className="h-24 w-24 rounded-3xl bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center shadow-xl shadow-orange-200/60">
                  <Calendar className="h-12 w-12 text-white" />
                </div>
              </div>
              <div className="space-y-3">
                <h3 className="text-2xl sm:text-3xl font-bold text-gray-800 leading-tight">Comece a Controlar<br className="sm:hidden" /> seus Vencimentos</h3>
                <p className="text-gray-500 text-base leading-relaxed max-w-sm mx-auto">
                  Cadastre seus contratos, serviços e manutenções para receber alertas automáticos antes do vencimento.
                </p>
              </div>
              <div className="flex flex-col items-center gap-4 pt-2 max-w-xs mx-auto">
                <Button
                  size="lg"
                  className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-lg shadow-blue-200/50 rounded-2xl h-14 text-base font-semibold transition-all duration-200 active:scale-[0.98]"
                  onClick={() => setShowContratoModal(true)}
                >
                  <FileText className="h-5 w-5 mr-2.5" />
                  Cadastrar Contrato
                </Button>
                <Button
                  size="lg"
                  className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white shadow-lg shadow-green-200/50 rounded-2xl h-14 text-base font-semibold transition-all duration-200 active:scale-[0.98]"
                  onClick={() => setShowServicoModal(true)}
                >
                  <Settings className="h-5 w-5 mr-2.5" />
                  Cadastrar Serviço
                </Button>
                <Button
                  size="lg"
                  className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white shadow-lg shadow-orange-200/50 rounded-2xl h-14 text-base font-semibold transition-all duration-200 active:scale-[0.98]"
                  onClick={() => setShowManutencaoModal(true)}
                >
                  <Wrench className="h-5 w-5 mr-2.5" />
                  Cadastrar Manutenção
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Modais de Cadastro Rápido */}
      <Dialog open={showContratoModal} onOpenChange={setShowContratoModal}>
        <DialogContent className="w-[95vw] max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5 text-blue-600" />
              Novo Contrato
            </DialogTitle>
            <DialogDescription>
              Preencha os dados do contrato a ser acompanhado.
            </DialogDescription>
          </DialogHeader>
          <VencimentoForm
            tipo="contrato"
            condominioId={condominioId}
            onSuccess={() => setShowContratoModal(false)}
            onCancel={() => setShowContratoModal(false)}
          />
        </DialogContent>
      </Dialog>

      <Dialog open={showServicoModal} onOpenChange={setShowServicoModal}>
        <DialogContent className="w-[95vw] max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5 text-green-600" />
              Novo Serviço
            </DialogTitle>
            <DialogDescription>
              Preencha os dados do serviço a ser acompanhado.
            </DialogDescription>
          </DialogHeader>
          <VencimentoForm
            tipo="servico"
            condominioId={condominioId}
            onSuccess={() => setShowServicoModal(false)}
            onCancel={() => setShowServicoModal(false)}
          />
        </DialogContent>
      </Dialog>

      <Dialog open={showManutencaoModal} onOpenChange={setShowManutencaoModal}>
        <DialogContent className="w-[95vw] max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5 text-orange-600" />
              Nova Manutenção
            </DialogTitle>
            <DialogDescription>
              Preencha os dados da manutenção a ser acompanhada.
            </DialogDescription>
          </DialogHeader>
          <VencimentoForm
            tipo="manutencao"
            condominioId={condominioId}
            onSuccess={() => setShowManutencaoModal(false)}
            onCancel={() => setShowManutencaoModal(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Cards de Estatísticas */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total</p>
                <p className="text-3xl font-bold">{estatisticas?.total || 0}</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                <Activity className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-red-200 bg-red-50/50">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-red-600">Vencidos</p>
                <p className="text-3xl font-bold text-red-600">{estatisticas?.vencidos || 0}</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-red-100 flex items-center justify-center">
                <AlertTriangle className="h-6 w-6 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-yellow-200 bg-yellow-50/50">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-yellow-600">Próx. 30 dias</p>
                <p className="text-3xl font-bold text-yellow-600">{estatisticas?.proximos30dias || 0}</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-yellow-100 flex items-center justify-center">
                <Clock className="h-6 w-6 text-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-green-200 bg-green-50/50">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-green-600">Valor Total</p>
                <p className="text-xl font-bold text-green-600">{formatCurrency(estatisticas?.valorTotalAtivo || 0)}</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
                <DollarSign className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Gráfico de Barras - Vencimentos por Mês */}
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-blue-600" />
                <CardTitle className="text-lg">Vencimentos por Mês</CardTitle>
              </div>
              <Select value={anoSelecionado.toString()} onValueChange={(v) => setAnoSelecionado(Number(v))}>
                <SelectTrigger className="w-24">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[2023, 2024, 2025, 2026].map(ano => (
                    <SelectItem key={ano} value={ano.toString()}>{ano}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {porMes?.map((mes) => (
                <div key={mes.mes} className="flex items-center gap-2">
                  <span className="w-10 text-xs text-muted-foreground">{mes.nome}</span>
                  <div className="flex-1 h-6 bg-gray-100 rounded-full overflow-hidden relative">
                    <div 
                      className="h-full bg-blue-500 rounded-full transition-all duration-500"
                      style={{ width: `${(mes.total / maxPorMes) * 100}%` }}
                    />
                    {mes.vencidos > 0 && (
                      <div 
                        className="absolute top-0 left-0 h-full bg-red-500 rounded-full"
                        style={{ width: `${(mes.vencidos / maxPorMes) * 100}%` }}
                      />
                    )}
                  </div>
                  <span className="w-8 text-xs font-medium text-right">{mes.total}</span>
                </div>
              ))}
            </div>
            <div className="flex items-center gap-4 mt-4 text-xs text-muted-foreground">
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 bg-blue-500 rounded-full" />
                <span>Total</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 bg-red-500 rounded-full" />
                <span>Vencidos</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Gráfico de Pizza - Por Categoria */}
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <PieChart className="h-5 w-5 text-purple-600" />
              <CardTitle className="text-lg">Por Categoria</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center">
              <div className="relative w-48 h-48">
                <svg viewBox="0 0 100 100" className="transform -rotate-90">
                  {porCategoria && porCategoria.length > 0 && (() => {
                    const total = porCategoria.reduce((sum, cat) => sum + cat.total, 0);
                    if (total === 0) return <circle cx="50" cy="50" r="40" fill="#e5e7eb" />;
                    
                    let offset = 0;
                    return porCategoria.map((cat, index) => {
                      const percentage = (cat.total / total) * 100;
                      const circumference = 2 * Math.PI * 40;
                      const strokeDasharray = `${(percentage / 100) * circumference} ${circumference}`;
                      const strokeDashoffset = -offset * (circumference / 100);
                      offset += percentage;
                      
                      return (
                        <circle
                          key={cat.tipo}
                          cx="50"
                          cy="50"
                          r="40"
                          fill="transparent"
                          stroke={cat.cor}
                          strokeWidth="20"
                          strokeDasharray={strokeDasharray}
                          strokeDashoffset={strokeDashoffset}
                          className="transition-all duration-500"
                        />
                      );
                    });
                  })()}
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <p className="text-2xl font-bold">{estatisticas?.total || 0}</p>
                    <p className="text-xs text-muted-foreground">Total</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-2 mt-4">
              {porCategoria?.map((cat) => (
                <div key={cat.tipo} className="text-center p-2 rounded-lg bg-gray-50">
                  <div className="flex items-center justify-center gap-1 mb-1">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: cat.cor }} />
                    <span className="text-xs font-medium">{cat.nome}</span>
                  </div>
                  <p className="text-lg font-bold">{cat.total}</p>
                  <p className="text-xs text-muted-foreground">{formatCurrency(cat.valorTotal)}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Gráfico de Linha - Evolução */}
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-green-600" />
                <CardTitle className="text-lg">Evolução Temporal</CardTitle>
              </div>
              <Select value={periodoEvolucao.toString()} onValueChange={(v) => setPeriodoEvolucao(Number(v))}>
                <SelectTrigger className="w-28">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="6">6 meses</SelectItem>
                  <SelectItem value="12">12 meses</SelectItem>
                  <SelectItem value="24">24 meses</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-48 relative">
              {evolucao && evolucao.length > 0 && (
                <svg viewBox={`0 0 ${evolucao.length * 50} 100`} className="w-full h-full" preserveAspectRatio="none">
                  {/* Linhas de grade */}
                  {[0, 25, 50, 75, 100].map((y) => (
                    <line key={y} x1="0" y1={100 - y} x2={evolucao.length * 50} y2={100 - y} stroke="#e5e7eb" strokeWidth="0.5" />
                  ))}
                  {/* Linha de total */}
                  <polyline
                    fill="none"
                    stroke="#3B82F6"
                    strokeWidth="2"
                    points={evolucao.map((e, i) => `${i * 50 + 25},${100 - (e.total / maxEvolucao) * 80}`).join(' ')}
                  />
                  {/* Pontos */}
                  {evolucao.map((e, i) => (
                    <circle
                      key={i}
                      cx={i * 50 + 25}
                      cy={100 - (e.total / maxEvolucao) * 80}
                      r="3"
                      fill="#3B82F6"
                    />
                  ))}
                </svg>
              )}
            </div>
            <div className="flex justify-between mt-2 text-xs text-muted-foreground overflow-x-auto">
              {evolucao?.map((e, i) => (
                <span key={i} className="min-w-[40px] text-center">{e.nome}</span>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Por Status */}
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-orange-600" />
              <CardTitle className="text-lg">Por Status</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {porStatus?.map((s) => {
                const total = porStatus.reduce((sum, st) => sum + st.total, 0);
                const percentage = total > 0 ? (s.total / total) * 100 : 0;
                return (
                  <div key={s.status} className="space-y-1">
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: s.cor }} />
                        <span>{s.nome}</span>
                      </div>
                      <span className="font-medium">{s.total}</span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div 
                        className="h-full rounded-full transition-all duration-500"
                        style={{ width: `${percentage}%`, backgroundColor: s.cor }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Listas de Próximos e Vencidos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Próximos Vencimentos */}
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-yellow-600" />
              <CardTitle className="text-lg">Próximos 30 Dias</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            {proximos && proximos.length > 0 ? (
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {proximos.map((item) => (
                  <div key={item.id} className="flex items-center justify-between p-2 rounded-lg bg-yellow-50 border border-yellow-200">
                    <div>
                      <p className="font-medium text-sm">{item.titulo}</p>
                      <p className="text-xs text-muted-foreground">{item.fornecedor}</p>
                    </div>
                    <div className="text-right">
                      <Badge variant="outline" className="bg-yellow-100 text-yellow-700 border-yellow-300">
                        {item.diasRestantes} dias
                      </Badge>
                      <p className="text-xs text-muted-foreground mt-1">
                        {new Date(item.dataVencimento).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-muted-foreground py-8">Nenhum vencimento nos próximos 30 dias</p>
            )}
          </CardContent>
        </Card>

        {/* Vencimentos Atrasados */}
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-600" />
              <CardTitle className="text-lg">Vencimentos Atrasados</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            {vencidos && vencidos.length > 0 ? (
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {vencidos.map((item) => (
                  <div key={item.id} className="flex items-center justify-between p-2 rounded-lg bg-red-50 border border-red-200">
                    <div>
                      <p className="font-medium text-sm">{item.titulo}</p>
                      <p className="text-xs text-muted-foreground">{item.fornecedor}</p>
                    </div>
                    <div className="text-right">
                      <Badge variant="destructive">
                        {item.diasAtrasados} dias atrasado
                      </Badge>
                      <p className="text-xs text-muted-foreground mt-1">
                        {new Date(item.dataVencimento).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-muted-foreground py-8">Nenhum vencimento atrasado</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Lista Unificada de Todos os Vencimentos */}
      <VencimentosListaCompleta condominioId={condominioId} />
    </div>
  );
}

// ===================== MODAL DE DETALHES / NOTIFICAÇÃO =====================
function VencimentoDetalheModal({ 
  vencimento, 
  open, 
  onClose, 
  condominioId 
}: { 
  vencimento: any; 
  open: boolean; 
  onClose: () => void; 
  condominioId: number;
}) {
  const [emailsNotif, setEmailsNotif] = useState(vencimento?.emailsNotificacao || '');
  const [setor, setSetor] = useState(vencimento?.setor || '');
  const [responsavel, setResponsavel] = useState(vencimento?.responsavel || '');
  const [observacoes, setObservacoes] = useState(vencimento?.observacoes || '');
  const [imagemUrl, setImagemUrl] = useState(vencimento?.imagemUrl || '');
  const [uploading, setUploading] = useState(false);

  const utils = trpc.useUtils();

  const updateMutation = trpc.vencimentos.update.useMutation({
    onSuccess: () => {
      toast.success('Vencimento atualizado com sucesso!');
      utils.vencimentos.list.invalidate();
      utils.vencimentos.stats.invalidate();
      utils.vencimentosDashboard.estatisticasGerais.invalidate();
      onClose();
    },
    onError: (error) => {
      toast.error(`Erro ao atualizar: ${error.message}`);
    },
  });

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) {
      toast.error('Arquivo muito grande. Máximo 10MB.');
      return;
    }
    setUploading(true);
    try {
      const reader = new FileReader();
      reader.onload = () => {
        setImagemUrl(reader.result as string);
        setUploading(false);
      };
      reader.readAsDataURL(file);
    } catch {
      toast.error('Erro ao carregar imagem');
      setUploading(false);
    }
  };

  const handleSalvar = () => {
    updateMutation.mutate({
      id: vencimento.id,
      emailsNotificacao: emailsNotif || undefined,
      setor: setor || undefined,
      responsavel: responsavel || undefined,
      observacoes: observacoes || undefined,
      imagemUrl: imagemUrl || undefined,
    });
  };

  const hoje = new Date();
  const dataVenc = new Date(vencimento?.dataVencimento);
  const diffTime = dataVenc.getTime() - hoje.getTime();
  const diasRestantes = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  const vencido = diasRestantes < 0;
  const tipoLabel = tipoLabels[vencimento?.tipo as TipoVencimento] || vencimento?.tipo;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="w-[95vw] max-w-2xl max-h-[90vh] overflow-hidden p-0">
        <div className={`px-6 py-4 ${vencido ? 'bg-gradient-to-r from-red-600 to-red-500' : 'bg-gradient-to-r from-violet-600 to-purple-500'}`}>
          <DialogHeader className="space-y-1">
            <DialogTitle className="flex items-center gap-2 text-white text-lg">
              <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
                <Bell className="w-5 h-5 text-white" />
              </div>
              {vencimento?.titulo}
            </DialogTitle>
            <DialogDescription className="text-white/80">
              {tipoLabel} — {vencido ? `Vencido há ${Math.abs(diasRestantes)} dias` : diasRestantes === 0 ? 'Vence hoje!' : `Faltam ${diasRestantes} dias`}
            </DialogDescription>
          </DialogHeader>
        </div>

        <div className="p-6 overflow-y-auto max-h-[70vh] space-y-5">
          {/* Info do vencimento */}
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="bg-gray-50 rounded-xl p-3">
              <p className="text-gray-500 text-xs mb-1">Tipo</p>
              <p className="font-semibold">{tipoLabel}</p>
            </div>
            <div className="bg-gray-50 rounded-xl p-3">
              <p className="text-gray-500 text-xs mb-1">Fornecedor</p>
              <p className="font-semibold">{vencimento?.fornecedor || '—'}</p>
            </div>
            <div className="bg-gray-50 rounded-xl p-3">
              <p className="text-gray-500 text-xs mb-1">Data Vencimento</p>
              <p className="font-semibold">{dataVenc.toLocaleDateString('pt-BR')}</p>
            </div>
            <div className="bg-gray-50 rounded-xl p-3">
              <p className="text-gray-500 text-xs mb-1">Periodicidade</p>
              <p className="font-semibold">{periodicidadeLabels[vencimento?.periodicidade] || vencimento?.periodicidade || '—'}</p>
            </div>
            <div className="bg-gray-50 rounded-xl p-3">
              <p className="text-gray-500 text-xs mb-1">Última Realização</p>
              <p className="font-semibold">{vencimento?.ultimaRealizacao ? new Date(vencimento.ultimaRealizacao).toLocaleDateString('pt-BR') : '—'}</p>
            </div>
            <div className="bg-gray-50 rounded-xl p-3">
              <p className="text-gray-500 text-xs mb-1">Próxima Realização</p>
              <p className="font-semibold">{vencimento?.proximaRealizacao ? new Date(vencimento.proximaRealizacao).toLocaleDateString('pt-BR') : '—'}</p>
            </div>
          </div>

          <hr className="border-gray-100" />

          {/* Campos editáveis */}
          <div className="space-y-4">
            <div>
              <Label className="text-sm font-semibold text-gray-700 mb-1.5 block">E-mails para Notificação</Label>
              <Textarea
                placeholder="email1@exemplo.com, email2@exemplo.com (separados por vírgula)"
                value={emailsNotif}
                onChange={(e) => setEmailsNotif(e.target.value)}
                rows={2}
                className="border-gray-200"
              />
              <p className="text-xs text-gray-400 mt-1">Separe os e-mails por vírgula</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-semibold text-gray-700 mb-1.5 block">Setor</Label>
                <Input
                  placeholder="Ex: Manutenção, Portaria..."
                  value={setor}
                  onChange={(e) => setSetor(e.target.value)}
                  className="border-gray-200"
                />
              </div>
              <div>
                <Label className="text-sm font-semibold text-gray-700 mb-1.5 block">Responsável</Label>
                <Input
                  placeholder="Nome do responsável"
                  value={responsavel}
                  onChange={(e) => setResponsavel(e.target.value)}
                  className="border-gray-200"
                />
              </div>
            </div>

            <div>
              <Label className="text-sm font-semibold text-gray-700 mb-1.5 block">Observações</Label>
              <Textarea
                placeholder="Observações adicionais..."
                value={observacoes}
                onChange={(e) => setObservacoes(e.target.value)}
                rows={3}
                className="border-gray-200"
              />
            </div>

            <div>
              <Label className="text-sm font-semibold text-gray-700 mb-1.5 block">Imagem / Anexo Visual</Label>
              {imagemUrl ? (
                <div className="relative">
                  <img src={imagemUrl} alt="Imagem do vencimento" className="rounded-xl max-h-48 object-cover w-full border" />
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    className="absolute top-2 right-2 h-7 w-7 rounded-full"
                    onClick={() => setImagemUrl('')}
                  >
                    <XCircle className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <div className="border-2 border-dashed border-gray-200 rounded-xl p-6 text-center">
                  <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-500 mb-2">Clique para enviar uma imagem</p>
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    disabled={uploading}
                    className="max-w-[220px] mx-auto cursor-pointer"
                  />
                  {uploading && <p className="text-xs text-gray-400 mt-1">Carregando...</p>}
                </div>
              )}
            </div>
          </div>

          <DialogFooter className="pt-2">
            <Button variant="outline" onClick={onClose}>Cancelar</Button>
            <Button 
              className={vencido ? "bg-red-600 hover:bg-red-700 text-white" : "bg-gradient-to-r from-violet-500 to-purple-500 text-white hover:from-violet-600 hover:to-purple-600"}
              onClick={handleSalvar}
              disabled={updateMutation.isPending}
            >
              {updateMutation.isPending ? 'Salvando...' : 'Salvar Alterações'}
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ===================== LISTA COMPLETA UNIFICADA =====================
function VencimentosListaCompleta({ condominioId }: { condominioId: number }) {
  const [selectedVencimento, setSelectedVencimento] = useState<any>(null);
  const [filtroTipo, setFiltroTipo] = useState<'todos' | TipoVencimento>('todos');
  const [filtroStatus, setFiltroStatus] = useState<'todos' | 'em_dia' | 'vencido' | 'proximo'>('todos');
  const [searchTerm, setSearchTerm] = useState('');

  const { data: listData, isLoading } = trpc.vencimentos.list.useQuery(
    { condominioId, tipo: filtroTipo },
    { enabled: condominioId > 0 }
  );

  const allItems = listData?.items || [];

  // Filtrar e ordenar
  const itemsFiltrados = allItems.filter((item: any) => {
    // Filtro por status visual
    if (filtroStatus === 'vencido' && !item.vencido) return false;
    if (filtroStatus === 'em_dia' && (item.vencido || item.diasRestantes <= 7)) return false;
    if (filtroStatus === 'proximo' && (item.vencido || item.diasRestantes > 30)) return false;

    // Filtro por busca
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      return (
        item.titulo?.toLowerCase().includes(term) ||
        item.fornecedor?.toLowerCase().includes(term) ||
        item.setor?.toLowerCase().includes(term) ||
        item.responsavel?.toLowerCase().includes(term)
      );
    }
    return true;
  }).sort((a: any, b: any) => a.diasRestantes - b.diasRestantes);

  const formatDate = (date: any) => {
    if (!date) return '—';
    return new Date(date).toLocaleDateString('pt-BR');
  };

  const getTipoBadge = (tipo: string) => {
    switch (tipo) {
      case 'contrato': return <Badge className="bg-blue-100 text-blue-700 border-blue-200 text-[10px] px-1.5 py-0">Contrato</Badge>;
      case 'servico': return <Badge className="bg-purple-100 text-purple-700 border-purple-200 text-[10px] px-1.5 py-0">Serviço</Badge>;
      case 'manutencao': return <Badge className="bg-amber-100 text-amber-700 border-amber-200 text-[10px] px-1.5 py-0">Manutenção</Badge>;
      default: return <Badge variant="outline" className="text-[10px] px-1.5 py-0">{tipo}</Badge>;
    }
  };

  const getStatusIndicator = (item: any) => {
    if (item.vencido) {
      return (
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" />
          <span className="text-red-700 font-bold text-xs">{Math.abs(item.diasRestantes)}d atrasado</span>
        </div>
      );
    }
    if (item.diasRestantes === 0) {
      return (
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" />
          <span className="text-red-600 font-bold text-xs">Vence hoje!</span>
        </div>
      );
    }
    if (item.diasRestantes <= 7) {
      return (
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-orange-500" />
          <span className="text-orange-600 font-semibold text-xs">{item.diasRestantes}d restantes</span>
        </div>
      );
    }
    if (item.diasRestantes <= 30) {
      return (
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-yellow-500" />
          <span className="text-yellow-600 font-medium text-xs">{item.diasRestantes}d restantes</span>
        </div>
      );
    }
    return (
      <div className="flex items-center gap-1.5">
        <div className="w-2.5 h-2.5 rounded-full bg-green-500" />
        <span className="text-green-600 font-medium text-xs">{item.diasRestantes}d restantes</span>
      </div>
    );
  };

  return (
    <>
      <Card className="rounded-2xl shadow-lg border-0">
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-gradient-to-br from-violet-500 to-purple-600 rounded-xl">
                <Activity className="h-5 w-5 text-white" />
              </div>
              <div>
                <CardTitle className="text-lg">Todos os Vencimentos</CardTitle>
                <CardDescription className="text-xs">{itemsFiltrados.length} item(ns) encontrado(s)</CardDescription>
              </div>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <Input
                placeholder="Buscar..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-36 h-8 text-xs rounded-xl"
              />
              <Select value={filtroTipo} onValueChange={(v: any) => setFiltroTipo(v)}>
                <SelectTrigger className="w-28 h-8 text-xs rounded-xl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos Tipos</SelectItem>
                  <SelectItem value="contrato">Contratos</SelectItem>
                  <SelectItem value="servico">Serviços</SelectItem>
                  <SelectItem value="manutencao">Manutenções</SelectItem>
                </SelectContent>
              </Select>
              <Select value={filtroStatus} onValueChange={(v: any) => setFiltroStatus(v)}>
                <SelectTrigger className="w-28 h-8 text-xs rounded-xl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos</SelectItem>
                  <SelectItem value="vencido">Vencidos</SelectItem>
                  <SelectItem value="proximo">Próximos 30d</SelectItem>
                  <SelectItem value="em_dia">Em Dia</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
            </div>
          ) : itemsFiltrados.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <Calendar className="h-10 w-10 mx-auto mb-3 text-gray-300" />
              <p className="font-medium">Nenhum vencimento encontrado</p>
              <p className="text-xs text-gray-400 mt-1">Altere os filtros ou cadastre um novo vencimento</p>
            </div>
          ) : (
            <>
              {/* Header da tabela - Desktop */}
              <div className="hidden md:grid grid-cols-12 gap-2 px-5 py-2.5 bg-gray-50 border-y text-[11px] font-semibold text-gray-500 uppercase tracking-wider">
                <div className="col-span-3">Título / Tipo</div>
                <div className="col-span-2">Última Realização</div>
                <div className="col-span-2">Próxima Realização</div>
                <div className="col-span-1 text-center">Vencimento</div>
                <div className="col-span-2 text-center">Status / Dias</div>
                <div className="col-span-1 text-center">Setor</div>
                <div className="col-span-1 text-center">Ação</div>
              </div>

              {/* Linhas */}
              <div className="divide-y divide-gray-100 max-h-[600px] overflow-y-auto">
                {itemsFiltrados.map((item: any) => {
                  const isVencido = item.vencido;
                  return (
                    <div
                      key={item.id}
                      className={`
                        ${isVencido 
                          ? 'bg-red-50 hover:bg-red-100/80 border-l-4 border-l-red-500' 
                          : item.diasRestantes <= 7 
                            ? 'bg-orange-50 hover:bg-orange-100/60 border-l-4 border-l-orange-500'
                            : item.diasRestantes <= 30
                              ? 'bg-yellow-50 hover:bg-yellow-100/60 border-l-4 border-l-yellow-500'
                              : 'bg-green-50 hover:bg-green-100/60 border-l-4 border-l-green-500'
                        }
                        transition-colors cursor-pointer
                      `}
                      onClick={() => setSelectedVencimento(item)}
                    >
                      {/* Desktop */}
                      <div className="hidden md:grid grid-cols-12 gap-2 px-5 py-3 items-center">
                        <div className="col-span-3">
                          <div className="flex items-center gap-2">
                            <div>
                              <p className={`font-semibold text-sm leading-tight ${isVencido ? 'text-red-800' : 'text-gray-800'}`}>
                                {item.titulo}
                              </p>
                              <div className="flex items-center gap-1.5 mt-1">
                                {getTipoBadge(item.tipo)}
                                {item.fornecedor && <span className="text-[10px] text-gray-400">{item.fornecedor}</span>}
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="col-span-2">
                          <p className={`text-xs ${isVencido ? 'text-red-700' : 'text-gray-600'}`}>
                            {formatDate(item.ultimaRealizacao)}
                          </p>
                        </div>
                        <div className="col-span-2">
                          <p className={`text-xs ${isVencido ? 'text-red-700' : 'text-gray-600'}`}>
                            {formatDate(item.proximaRealizacao)}
                          </p>
                        </div>
                        <div className="col-span-1 text-center">
                          <p className={`text-xs font-medium ${isVencido ? 'text-red-700' : 'text-gray-600'}`}>
                            {formatDate(item.dataVencimento)}
                          </p>
                        </div>
                        <div className="col-span-2 flex justify-center">
                          {getStatusIndicator(item)}
                        </div>
                        <div className="col-span-1 text-center">
                          <span className={`text-[10px] ${isVencido ? 'text-red-600' : 'text-gray-500'}`}>
                            {item.setor || '—'}
                          </span>
                        </div>
                        <div className="col-span-1 flex justify-center">
                          <Button
                            variant="ghost"
                            size="icon"
                            className={`h-7 w-7 rounded-lg ${isVencido ? 'text-red-600 hover:bg-red-200/60' : 'text-violet-600 hover:bg-violet-100'}`}
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedVencimento(item);
                            }}
                          >
                            <Bell className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </div>

                      {/* Mobile */}
                      <div className="md:hidden px-4 py-3 space-y-2">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <p className={`font-semibold text-sm truncate ${isVencido ? 'text-red-800' : 'text-gray-800'}`}>
                              {item.titulo}
                            </p>
                            <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                              {getTipoBadge(item.tipo)}
                              {item.fornecedor && <span className="text-[10px] text-gray-400 truncate">{item.fornecedor}</span>}
                            </div>
                          </div>
                          <div className="shrink-0">
                            {getStatusIndicator(item)}
                          </div>
                        </div>
                        <div className="grid grid-cols-3 gap-2 text-[10px]">
                          <div>
                            <p className="text-gray-400">Última</p>
                            <p className={`font-medium ${isVencido ? 'text-red-700' : 'text-gray-600'}`}>{formatDate(item.ultimaRealizacao)}</p>
                          </div>
                          <div>
                            <p className="text-gray-400">Próxima</p>
                            <p className={`font-medium ${isVencido ? 'text-red-700' : 'text-gray-600'}`}>{formatDate(item.proximaRealizacao)}</p>
                          </div>
                          <div>
                            <p className="text-gray-400">Vencimento</p>
                            <p className={`font-medium ${isVencido ? 'text-red-700' : 'text-gray-600'}`}>{formatDate(item.dataVencimento)}</p>
                          </div>
                        </div>
                        {(item.setor || item.responsavel) && (
                          <div className="flex items-center gap-2 text-[10px] text-gray-400">
                            {item.setor && <span>Setor: {item.setor}</span>}
                            {item.responsavel && <span>Resp: {item.responsavel}</span>}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Modal de Detalhes / Notificação */}
      {selectedVencimento && (
        <VencimentoDetalheModal
          vencimento={selectedVencimento}
          open={!!selectedVencimento}
          onClose={() => setSelectedVencimento(null)}
          condominioId={condominioId}
        />
      )}
    </>
  );
}

function EmailsConfig({ condominioId }: { condominioId: number }) {
  const [novoEmail, setNovoEmail] = useState('');
  const [novoNome, setNovoNome] = useState('');

  const { data: emails, isLoading } = trpc.vencimentoEmails.list.useQuery({ condominioId });
  const utils = trpc.useUtils();

  const createMutation = trpc.vencimentoEmails.create.useMutation({
    onSuccess: () => {
      toast.success('E-mail adicionado com sucesso!');
      utils.vencimentoEmails.list.invalidate();
      setNovoEmail('');
      setNovoNome('');
    },
    onError: (error) => {
      toast.error(`Erro ao adicionar: ${error.message}`);
    },
  });

  const deleteMutation = trpc.vencimentoEmails.delete.useMutation({
    onSuccess: () => {
      toast.success('E-mail removido com sucesso!');
      utils.vencimentoEmails.list.invalidate();
    },
    onError: (error) => {
      toast.error(`Erro ao remover: ${error.message}`);
    },
  });

  const toggleMutation = trpc.vencimentoEmails.update.useMutation({
    onSuccess: () => {
      utils.vencimentoEmails.list.invalidate();
    },
  });

  const handleAddEmail = (e: React.FormEvent) => {
    e.preventDefault();
    if (!novoEmail) return;
    createMutation.mutate({ condominioId, email: novoEmail, nome: novoNome || undefined });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Mail className="h-5 w-5" />
          E-mails para Notificações
        </CardTitle>
        <CardDescription>
          Configure os e-mails que receberão alertas de vencimentos.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <form onSubmit={handleAddEmail} className="flex gap-2">
          <Input
            type="text"
            placeholder="Nome (opcional)"
            value={novoNome}
            onChange={(e) => setNovoNome(e.target.value)}
            className="w-40"
          />
          <Input
            type="email"
            placeholder="email@exemplo.com"
            value={novoEmail}
            onChange={(e) => setNovoEmail(e.target.value)}
            className="flex-1"
            required
          />
          <Button type="submit" disabled={createMutation.isPending}>
            <Plus className="h-4 w-4 mr-2" />
            Adicionar
          </Button>
        </form>

        {isLoading ? (
          <div className="text-center py-4">A carregar...</div>
        ) : emails && emails.length > 0 ? (
          <div className="space-y-2">
            {emails.map((email) => (
              <div key={email.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                <div className="flex items-center gap-3">
                  <Checkbox
                    checked={email.ativo === true}
                    onCheckedChange={(checked) => 
                      toggleMutation.mutate({ id: email.id, ativo: checked === true })
                    }
                  />
                  <div>
                    {email.nome && <p className="font-medium">{email.nome}</p>}
                    <p className={`text-sm ${!email.ativo ? 'text-muted-foreground line-through' : ''}`}>
                      {email.email}
                    </p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => deleteMutation.mutate({ id: email.id })}
                  disabled={deleteMutation.isPending}
                  className="text-red-600 hover:text-red-700 hover:bg-red-100"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-center text-muted-foreground py-4">
            Nenhum e-mail configurado. Adicione e-mails para receber alertas de vencimentos.
          </p>
        )}
      </CardContent>
    </Card>
  );
}

// Componente de Calendário que busca todos os vencimentos
function CalendarioVencimentosTab({ condominioId }: { condominioId: number }) {
  const { data: contratosData } = trpc.vencimentos.list.useQuery({ condominioId, tipo: 'contrato' });
  const { data: servicosData } = trpc.vencimentos.list.useQuery({ condominioId, tipo: 'servico' });
  const { data: manutencoesData } = trpc.vencimentos.list.useQuery({ condominioId, tipo: 'manutencao' });

  const todosVencimentos = [
    ...(contratosData?.items || []),
    ...(servicosData?.items || []),
    ...(manutencoesData?.items || []),
  ];

  const handleVencimentoClick = (vencimento: any) => {
    toast.info(`Vencimento: ${vencimento.titulo}`);
  };

  return (
    <CalendarioVencimentos 
      vencimentos={todosVencimentos} 
      onVencimentoClick={handleVencimentoClick}
    />
  );
}

export default function AgendaVencimentos({ condominioIdProp }: { condominioIdProp?: number } = {}) {
  const [activeTab, setActiveTab] = useState<TipoVencimento | 'dashboard' | 'calendario'>('dashboard');
  const [showEmailConfig, setShowEmailConfig] = useState(false);
  const [showRelatorioDialog, setShowRelatorioDialog] = useState(false);
  const [relatorioTipo, setRelatorioTipo] = useState<'todos' | 'contrato' | 'servico' | 'manutencao'>('todos');
  const [relatorioStatus, setRelatorioStatus] = useState<'todos' | 'ativo' | 'vencido' | 'renovado' | 'cancelado'>('todos');
  const [relatorioDataInicio, setRelatorioDataInicio] = useState('');
  const [relatorioDataFim, setRelatorioDataFim] = useState('');
  
  // Obter condominioId do prop ou da primeira organização do usuário
  const { data: condominios, isLoading: condominiosLoading } = trpc.condominio.list.useQuery(undefined, { enabled: !condominioIdProp });
  const condominioId = condominioIdProp || condominios?.[0]?.id || 0;

  // Todos os hooks devem ser chamados antes de qualquer return condicional
  const { data: stats } = trpc.vencimentos.stats.useQuery(
    { condominioId },
    { enabled: condominioId > 0 }
  );

  // Query para buscar todos os vencimentos para exportação
  const { data: exportData } = trpc.vencimentos.list.useQuery(
    { condominioId },
    { enabled: condominioId > 0 }
  );
  const todosVencimentosExport = exportData?.items || [];

  // Verificar alertas pendentes
  const { data: alertasPendentes, refetch: refetchAlertas } = trpc.alertasAutomaticos.verificarPendentes.useQuery(
    { condominioId },
    { enabled: condominioId > 0 }
  );

  // Mutation para processar alertas automáticos
  const processarAlertasMutation = trpc.alertasAutomaticos.processarAlertas.useMutation({
    onSuccess: (data) => {
      toast.success(data.mensagem);
      refetchAlertas();
    },
    onError: (error) => {
      toast.error(`Erro ao processar alertas: ${error.message}`);
    },
  });

  // Mutation para gerar relatório PDF
  const gerarPDFMutation = trpc.vencimentosRelatorio.gerarPDF.useMutation({
    onSuccess: (data) => {
      toast.success('Relatório gerado com sucesso!');
      // Abrir o PDF em nova aba
      window.open(data.url, '_blank');
      setShowRelatorioDialog(false);
    },
    onError: (error) => {
      toast.error(`Erro ao gerar relatório: ${error.message}`);
    },
  });

  const handleGerarRelatorio = () => {
    gerarPDFMutation.mutate({
      condominioId,
      tipo: relatorioTipo,
      status: relatorioStatus,
      dataInicio: relatorioDataInicio || undefined,
      dataFim: relatorioDataFim || undefined,
    });
  };

  if (!condominioIdProp && condominiosLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!condominioId) {
    return (
      <div className="text-center py-20">
        <Calendar className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
        <h2 className="text-xl font-semibold mb-2">Nenhuma organização encontrado</h2>
        <p className="text-muted-foreground">Crie uma organização primeiro para usar a Agenda de Vencimentos.</p>
      </div>
    );
  }

  return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-3">
          <div className="flex flex-wrap gap-2 justify-end">
            {/* Botão de Processar Alertas */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => processarAlertasMutation.mutate({ condominioId })}
              disabled={processarAlertasMutation.isPending}
              className={`rounded-xl ${alertasPendentes && alertasPendentes.pendentes > 0 ? 'border-orange-500 text-orange-600 hover:bg-orange-50' : ''}`}
            >
              <Bell className="h-4 w-4 mr-2" />
              {processarAlertasMutation.isPending ? 'Processando...' : `Alertas${alertasPendentes && alertasPendentes.pendentes > 0 ? ` (${alertasPendentes.pendentes})` : ''}`}
            </Button>

            {/* Botão de Gerar Relatório */}
            <Dialog open={showRelatorioDialog} onOpenChange={setShowRelatorioDialog}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="rounded-xl">
                  <Download className="h-4 w-4 mr-2" />
                  Relatório PDF
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Gerar Relatório de Vencimentos</DialogTitle>
                  <DialogDescription>
                    Configure os filtros para gerar o relatório em PDF.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Tipo</Label>
                      <Select value={relatorioTipo} onValueChange={(v: any) => setRelatorioTipo(v)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="todos">Todos</SelectItem>
                          <SelectItem value="contrato">Contratos</SelectItem>
                          <SelectItem value="servico">Serviços</SelectItem>
                          <SelectItem value="manutencao">Manutenções</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Status</Label>
                      <Select value={relatorioStatus} onValueChange={(v: any) => setRelatorioStatus(v)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="todos">Todos</SelectItem>
                          <SelectItem value="ativo">Ativos</SelectItem>
                          <SelectItem value="vencido">Vencidos</SelectItem>
                          <SelectItem value="renovado">Renovados</SelectItem>
                          <SelectItem value="cancelado">Cancelados</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Data Início</Label>
                      <Input
                        type="date"
                        value={relatorioDataInicio}
                        onChange={(e) => setRelatorioDataInicio(e.target.value)}
                      />
                    </div>
                    <div>
                      <Label>Data Fim</Label>
                      <Input
                        type="date"
                        value={relatorioDataFim}
                        onChange={(e) => setRelatorioDataFim(e.target.value)}
                      />
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setShowRelatorioDialog(false)}>
                    Cancelar
                  </Button>
                  <Button onClick={handleGerarRelatorio} disabled={gerarPDFMutation.isPending}>
                    {gerarPDFMutation.isPending ? 'Gerando...' : 'Gerar PDF'}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            {/* Botão de Exportar Excel */}
            <Button 
              variant="outline" 
              size="sm"
              className="rounded-xl"
              onClick={() => {
                if (todosVencimentosExport && todosVencimentosExport.length > 0) {
                  exportVencimentosExcel(todosVencimentosExport as any, 'Vencimentos');
                  toast.success('Excel exportado com sucesso!');
                } else {
                  toast.error('Nenhum vencimento para exportar');
                }
              }}
            >
              <FileSpreadsheet className="h-4 w-4 mr-2" />
              Excel
            </Button>

            {/* Botão de Configurar E-mails */}
            <Button variant="outline" size="sm" className="rounded-xl" onClick={() => setShowEmailConfig(!showEmailConfig)}>
              <Mail className="h-4 w-4 mr-2" />
              E-mails
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <Card className="cursor-pointer hover:shadow-lg transition-all duration-200 rounded-2xl border-0 shadow-sm bg-white">
              <CardContent className="pt-5 pb-4 px-4">
                <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
                <p className="text-xs text-muted-foreground mt-1">Total</p>
              </CardContent>
            </Card>
            <Card className={`cursor-pointer hover:shadow-lg transition-all duration-200 rounded-2xl border-0 shadow-sm ${stats.vencidos > 0 ? 'bg-red-50 dark:bg-red-950/20' : 'bg-white'}`}>
              <CardContent className="pt-5 pb-4 px-4">
                <div className={`text-2xl font-bold ${stats.vencidos > 0 ? 'text-red-600' : 'text-gray-900'}`}>
                  {stats.vencidos}
                </div>
                <p className="text-xs text-muted-foreground mt-1">Vencidos</p>
              </CardContent>
            </Card>
            <Card className={`cursor-pointer hover:shadow-lg transition-all duration-200 rounded-2xl border-0 shadow-sm ${stats.proximos > 0 ? 'bg-orange-50 dark:bg-orange-950/20' : 'bg-white'}`}>
              <CardContent className="pt-5 pb-4 px-4">
                <div className={`text-2xl font-bold ${stats.proximos > 0 ? 'text-orange-600' : 'text-gray-900'}`}>
                  {stats.proximos}
                </div>
                <p className="text-xs text-muted-foreground mt-1">Próx. 30 dias</p>
              </CardContent>
            </Card>
            <Card className="cursor-pointer hover:shadow-lg transition-all duration-200 rounded-2xl border-0 shadow-sm bg-white">
              <CardContent className="pt-5 pb-4 px-4">
                <div className="text-2xl font-bold text-gray-900">{stats.contratos}</div>
                <p className="text-xs text-muted-foreground mt-1">Contratos</p>
              </CardContent>
            </Card>
            <Card className="cursor-pointer hover:shadow-lg transition-all duration-200 rounded-2xl border-0 shadow-sm bg-white">
              <CardContent className="pt-5 pb-4 px-4">
                <div className="text-2xl font-bold text-gray-900">{stats.servicos}</div>
                <p className="text-xs text-muted-foreground mt-1">Serviços</p>
              </CardContent>
            </Card>
            <Card className="cursor-pointer hover:shadow-lg transition-all duration-200 rounded-2xl border-0 shadow-sm bg-white">
              <CardContent className="pt-5 pb-4 px-4">
                <div className="text-2xl font-bold text-gray-900">{stats.manutencoes}</div>
                <p className="text-xs text-muted-foreground mt-1">Manutenções</p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Email Config */}
        {showEmailConfig && (
          <EmailsConfig condominioId={condominioId} />
        )}

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as TipoVencimento | 'dashboard' | 'calendario')}>
          {/* Mobile: grid 2 colunas (3 linhas) / Desktop: 6 colunas */}
          <div className="pb-3">
            <TabsList className="!grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 w-full gap-3 p-2 h-auto bg-transparent">
              <TabsTrigger value="dashboard" className="flex flex-col items-center justify-center gap-1.5 px-2 py-3.5 bg-gradient-to-b from-gray-500 to-gray-600 text-white hover:from-gray-600 hover:to-gray-700 data-[state=active]:from-gray-700 data-[state=active]:to-gray-800 data-[state=active]:text-white data-[state=active]:shadow-lg rounded-2xl shadow-md transition-all duration-200 min-h-[56px]">
                <BarChart3 className="h-5 w-5 shrink-0" />
                <span className="text-[11px] font-semibold leading-tight">Dashboard</span>
              </TabsTrigger>
              <TabsTrigger value="contrato" className="flex flex-col items-center justify-center gap-1.5 px-2 py-3.5 bg-gradient-to-b from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700 data-[state=active]:from-blue-700 data-[state=active]:to-blue-800 data-[state=active]:text-white data-[state=active]:shadow-lg rounded-2xl shadow-md transition-all duration-200 relative min-h-[56px]">
                <FileText className="h-5 w-5 shrink-0" />
                <span className="text-[11px] font-semibold leading-tight">Contratos</span>
                {stats && stats.contratos > 0 && (
                  <Badge variant="secondary" className="absolute -top-2 -right-2 h-5 min-w-[20px] px-1 flex items-center justify-center bg-blue-800 text-white text-[10px] rounded-full shadow-sm">{stats.contratos}</Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="servico" className="flex flex-col items-center justify-center gap-1.5 px-2 py-3.5 bg-gradient-to-b from-orange-500 to-orange-600 text-white hover:from-orange-600 hover:to-orange-700 data-[state=active]:from-orange-700 data-[state=active]:to-orange-800 data-[state=active]:text-white data-[state=active]:shadow-lg rounded-2xl shadow-md transition-all duration-200 relative min-h-[56px]">
                <Settings className="h-5 w-5 shrink-0" />
                <span className="text-[11px] font-semibold leading-tight">Serviços</span>
                {stats && stats.servicos > 0 && (
                  <Badge variant="secondary" className="absolute -top-2 -right-2 h-5 min-w-[20px] px-1 flex items-center justify-center bg-orange-800 text-white text-[10px] rounded-full shadow-sm">{stats.servicos}</Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="manutencao" className="flex flex-col items-center justify-center gap-1.5 px-2 py-3.5 bg-gradient-to-b from-green-500 to-green-600 text-white hover:from-green-600 hover:to-green-700 data-[state=active]:from-green-700 data-[state=active]:to-green-800 data-[state=active]:text-white data-[state=active]:shadow-lg rounded-2xl shadow-md transition-all duration-200 relative min-h-[56px]">
                <Wrench className="h-5 w-5 shrink-0" />
                <span className="text-[11px] font-semibold leading-tight">Manutenções</span>
                {stats && stats.manutencoes > 0 && (
                  <Badge variant="secondary" className="absolute -top-2 -right-2 h-5 min-w-[20px] px-1 flex items-center justify-center bg-green-800 text-white text-[10px] rounded-full shadow-sm">{stats.manutencoes}</Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="calendario" className="flex flex-col items-center justify-center gap-1.5 px-2 py-3.5 bg-gradient-to-b from-purple-500 to-purple-600 text-white hover:from-purple-600 hover:to-purple-700 data-[state=active]:from-purple-700 data-[state=active]:to-purple-800 data-[state=active]:text-white data-[state=active]:shadow-lg rounded-2xl shadow-md transition-all duration-200 min-h-[56px]">
                <Calendar className="h-5 w-5 shrink-0" />
                <span className="text-[11px] font-semibold leading-tight">Calendário</span>
              </TabsTrigger>
              <TabsTrigger value="notificacoes" className="flex flex-col items-center justify-center gap-1.5 px-2 py-3.5 bg-gradient-to-b from-red-500 to-red-600 text-white hover:from-red-600 hover:to-red-700 data-[state=active]:from-red-700 data-[state=active]:to-red-800 data-[state=active]:text-white data-[state=active]:shadow-lg rounded-2xl shadow-md transition-all duration-200 min-h-[56px]">
                <Mail className="h-5 w-5 shrink-0" />
                <span className="text-[11px] font-semibold leading-tight">Alertas</span>
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="dashboard" className="mt-6">
            <VencimentosDashboard condominioId={condominioId} />
          </TabsContent>

          <TabsContent value="contrato" className="mt-6">
            <VencimentosList tipo="contrato" condominioId={condominioId} />
          </TabsContent>

          <TabsContent value="servico" className="mt-6">
            <VencimentosList tipo="servico" condominioId={condominioId} />
          </TabsContent>

          <TabsContent value="manutencao" className="mt-6">
            <VencimentosList tipo="manutencao" condominioId={condominioId} />
          </TabsContent>

          <TabsContent value="calendario" className="mt-6">
            <CalendarioVencimentosTab condominioId={condominioId} />
          </TabsContent>

          <TabsContent value="notificacoes" className="mt-6">
            <NotificacoesVencimentos condominioId={condominioId} />
          </TabsContent>
        </Tabs>
      </div>
  );
}
