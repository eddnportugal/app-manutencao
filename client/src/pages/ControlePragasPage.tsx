import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "@/components/ui/sonner";
import { 
  Plus, 
  Search, 
  Bug,
  RefreshCw,
  Trash2,
  Calendar,
  Building2,
  DollarSign,
  Shield,
} from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import MultiImageUpload, { ImageItem } from "@/components/MultiImageUpload";
import { LocationMiniMap } from "@/components/LocationMiniMap";
import { AutoLocationCapture } from "@/components/AutoLocationCapture";
import {
  FormModalHeader,
  FormSection,
  FormFieldGroup,
  StyledLabel,
  FormActions,
  GradientButton,
} from "@/components/ui/form-modal";

interface ControlePragasPageProps {
  condominioId: number;
}

const tipoServicoConfig = {
  dedetizacao: { label: "Dedetização", emoji: "🪳" },
  desratizacao: { label: "Desratização", emoji: "🐀" },
  descupinizacao: { label: "Descupinização", emoji: "🐜" },
  desinfeccao: { label: "Desinfecção", emoji: "🧴" },
  outro: { label: "Outro", emoji: "🔧" },
};

const statusConfig = {
  agendada: { label: "Agendada", color: "bg-blue-100 text-blue-800" },
  em_andamento: { label: "Em Andamento", color: "bg-yellow-100 text-yellow-800" },
  realizada: { label: "Realizada", color: "bg-green-100 text-green-800" },
  finalizada: { label: "Finalizada", color: "bg-gray-100 text-gray-800" },
  cancelada: { label: "Cancelada", color: "bg-red-100 text-red-800" },
};

const prioridadeConfig = {
  baixa: { label: "Baixa", color: "text-gray-500" },
  media: { label: "Média", color: "text-blue-500" },
  alta: { label: "Alta", color: "text-orange-500" },
  urgente: { label: "Urgente", color: "text-red-500" },
};

export default function ControlePragasPage({ condominioId }: ControlePragasPageProps) {
  const [showDialog, setShowDialog] = useState(false);
  const [showDetailDialog, setShowDetailDialog] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState("");
  
  const [formData, setFormData] = useState({
    titulo: "",
    descricao: "",
    tipoServico: "dedetizacao" as "dedetizacao" | "desratizacao" | "descupinizacao" | "desinfeccao" | "outro",
    tipoPraga: "",
    produtosUtilizados: "",
    empresaFornecedor: "",
    localizacao: "",
    latitude: "",
    longitude: "",
    enderecoGeo: "",
    dataAplicacao: "",
    proximaAplicacao: "",
    garantiaDias: 0,
    custo: "",
    responsavelNome: "",
    observacoes: "",
    status: "agendada" as "agendada" | "em_andamento" | "realizada" | "finalizada" | "cancelada",
    prioridade: "media" as "baixa" | "media" | "alta" | "urgente",
  });
  const [imagensComLegendas, setImagensComLegendas] = useState<ImageItem[]>([]);

  const utils = trpc.useUtils();
  
  const { data: items = [], isLoading } = trpc.controlePragas.list.useQuery(
    { condominioId },
    { enabled: !!condominioId }
  );

  const createMutation = trpc.controlePragas.create.useMutation({
    onSuccess: (result) => {
      toast.success(`Controle registrado! Protocolo: ${result.protocolo}`);
      setShowDialog(false);
      resetForm();
      utils.controlePragas.list.invalidate();
    },
    onError: () => toast.error("Erro ao registrar controle de pragas"),
  });

  const updateMutation = trpc.controlePragas.update.useMutation({
    onSuccess: () => {
      toast.success("Controle atualizado!");
      utils.controlePragas.list.invalidate();
    },
    onError: () => toast.error("Erro ao atualizar controle"),
  });

  const deleteMutation = trpc.controlePragas.delete.useMutation({
    onSuccess: () => {
      toast.success("Controle excluído!");
      setShowDetailDialog(false);
      utils.controlePragas.list.invalidate();
    },
    onError: () => toast.error("Erro ao excluir controle"),
  });

  const resetForm = () => {
    setFormData({
      titulo: "",
      descricao: "",
      tipoServico: "dedetizacao",
      tipoPraga: "",
      produtosUtilizados: "",
      empresaFornecedor: "",
      localizacao: "",
      latitude: "",
      longitude: "",
      enderecoGeo: "",
      dataAplicacao: "",
      proximaAplicacao: "",
      garantiaDias: 0,
      custo: "",
      responsavelNome: "",
      observacoes: "",
      status: "agendada",
      prioridade: "media",
    });
    setImagensComLegendas([]);
  };

  const handleSubmit = () => {
    if (!formData.titulo.trim()) {
      toast.error("Informe o título");
      return;
    }
    createMutation.mutate({
      condominioId,
      ...formData,
      garantiaDias: formData.garantiaDias || undefined,
      imagens: imagensComLegendas.map(img => ({ url: img.url, legenda: img.legenda })),
    });
  };

  const handleLocationCapture = (lat: string, lng: string, endereco: string) => {
    setFormData(prev => ({
      ...prev,
      latitude: lat,
      longitude: lng,
      enderecoGeo: endereco,
    }));
  };

  const filteredItems = items.filter(item => 
    item.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.protocolo.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.empresaFornecedor?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Estatísticas
  const stats = {
    total: items.length,
    agendadas: items.filter(i => i.status === "agendada").length,
    realizadas: items.filter(i => i.status === "realizada" || i.status === "finalizada").length,
  };

  return (
    <div className="space-y-6 p-4 md:p-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Bug className="w-7 h-7 text-red-500" />
            Controle de Pragas
          </h1>
          <p className="text-muted-foreground">Gerencie dedetizações, desratizações e controles sanitários</p>
        </div>
        <Button onClick={() => setShowDialog(true)} className="bg-gradient-to-r from-red-500 to-orange-500">
          <Plus className="w-4 h-4 mr-2" />
          Novo Controle
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Total</p>
            <p className="text-2xl font-bold">{stats.total}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Agendadas</p>
            <p className="text-2xl font-bold text-blue-600">{stats.agendadas}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Realizadas</p>
            <p className="text-2xl font-bold text-green-600">{stats.realizadas}</p>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input 
          placeholder="Buscar por título, protocolo ou empresa..." 
          className="pl-10"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* List */}
      <div className="space-y-3">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <RefreshCw className="w-6 h-6 animate-spin text-muted-foreground" />
          </div>
        ) : filteredItems.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Bug className="w-12 h-12 mx-auto text-muted-foreground/50 mb-4" />
              <p className="text-muted-foreground">Nenhum controle registrado</p>
              <Button onClick={() => setShowDialog(true)} variant="link" className="mt-2">
                Registrar primeiro controle
              </Button>
            </CardContent>
          </Card>
        ) : (
          filteredItems.map((item) => {
            const tipoConfig = tipoServicoConfig[item.tipoServico as keyof typeof tipoServicoConfig] || tipoServicoConfig.outro;
            const statusCfg = statusConfig[item.status as keyof typeof statusConfig] || statusConfig.agendada;
            
            return (
              <Card 
                key={item.id} 
                className="cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => {
                  setSelectedItem(item);
                  setShowDetailDialog(true);
                }}
              >
                <CardContent className="p-4">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-red-100 flex items-center justify-center flex-shrink-0 text-2xl">
                      {tipoConfig.emoji}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold truncate">{item.titulo}</h3>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusCfg.color}`}>
                          {statusCfg.label}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground">#{item.protocolo} • {tipoConfig.label}</p>
                      {item.empresaFornecedor && (
                        <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                          <Building2 className="w-3 h-3" />
                          {item.empresaFornecedor}
                        </p>
                      )}
                      {item.garantiaDias && (
                        <p className="text-sm text-green-600 flex items-center gap-1 mt-1">
                          <Shield className="w-3 h-3" />
                          Garantia: {item.garantiaDias} dias
                        </p>
                      )}
                    </div>
                    <div className="text-right text-sm text-muted-foreground">
                      {item.dataAplicacao && (
                        <p>{format(new Date(item.dataAplicacao), "dd/MM/yyyy", { locale: ptBR })}</p>
                      )}
                      {item.custo && (
                        <p className="text-green-600 font-medium">R$ {item.custo}</p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>

      {/* Create Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <FormModalHeader 
            title="Novo Controle de Pragas"
            subtitle="Registre uma nova aplicação"
            icon={Bug}
            iconColor="text-red-600"
            iconBgColor="bg-gradient-to-br from-red-100 to-orange-100"
          />
          
          <div className="space-y-6 p-6">
            <FormSection title="Identificação">
              <FormFieldGroup>
                <div className="space-y-2">
                  <StyledLabel required>Título</StyledLabel>
                  <Input
                    value={formData.titulo}
                    onChange={(e) => setFormData(prev => ({ ...prev, titulo: e.target.value }))}
                    placeholder="Ex: Dedetização trimestral"
                  />
                </div>
                <div className="space-y-2">
                  <StyledLabel>Tipo de Serviço</StyledLabel>
                  <Select
                    value={formData.tipoServico}
                    onValueChange={(value: any) => setFormData(prev => ({ ...prev, tipoServico: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="dedetizacao">🪳 Dedetização</SelectItem>
                      <SelectItem value="desratizacao">🐀 Desratização</SelectItem>
                      <SelectItem value="descupinizacao">🐜 Descupinização</SelectItem>
                      <SelectItem value="desinfeccao">🧴 Desinfecção</SelectItem>
                      <SelectItem value="outro">🔧 Outro</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </FormFieldGroup>
              
              <FormFieldGroup>
                <div className="space-y-2">
                  <StyledLabel>Tipo de Praga</StyledLabel>
                  <Input
                    value={formData.tipoPraga}
                    onChange={(e) => setFormData(prev => ({ ...prev, tipoPraga: e.target.value }))}
                    placeholder="Ex: Baratas, ratos, cupins..."
                  />
                </div>
                <div className="space-y-2">
                  <StyledLabel>Prioridade</StyledLabel>
                  <Select
                    value={formData.prioridade}
                    onValueChange={(value: any) => setFormData(prev => ({ ...prev, prioridade: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="baixa">Baixa</SelectItem>
                      <SelectItem value="media">Média</SelectItem>
                      <SelectItem value="alta">Alta</SelectItem>
                      <SelectItem value="urgente">Urgente</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </FormFieldGroup>

              <div className="space-y-2">
                <StyledLabel>Descrição</StyledLabel>
                <Textarea
                  value={formData.descricao}
                  onChange={(e) => setFormData(prev => ({ ...prev, descricao: e.target.value }))}
                  placeholder="Descreva o serviço..."
                  rows={3}
                />
              </div>
            </FormSection>

            <FormSection title="Fornecedor e Produtos">
              <FormFieldGroup>
                <div className="space-y-2">
                  <StyledLabel>Empresa/Fornecedor</StyledLabel>
                  <Input
                    value={formData.empresaFornecedor}
                    onChange={(e) => setFormData(prev => ({ ...prev, empresaFornecedor: e.target.value }))}
                    placeholder="Nome da empresa"
                  />
                </div>
                <div className="space-y-2">
                  <StyledLabel>Garantia (dias)</StyledLabel>
                  <Input
                    type="number"
                    value={formData.garantiaDias || ""}
                    onChange={(e) => setFormData(prev => ({ ...prev, garantiaDias: parseInt(e.target.value) || 0 }))}
                    placeholder="90"
                  />
                </div>
              </FormFieldGroup>
              
              <div className="space-y-2">
                <StyledLabel>Produtos Utilizados</StyledLabel>
                <Textarea
                  value={formData.produtosUtilizados}
                  onChange={(e) => setFormData(prev => ({ ...prev, produtosUtilizados: e.target.value }))}
                  placeholder="Liste os produtos utilizados..."
                  rows={2}
                />
              </div>
              
              <div className="space-y-2">
                <StyledLabel>Custo (R$)</StyledLabel>
                <Input
                  value={formData.custo}
                  onChange={(e) => setFormData(prev => ({ ...prev, custo: e.target.value }))}
                  placeholder="0.00"
                />
              </div>
            </FormSection>

            <FormSection title="Datas">
              <FormFieldGroup>
                <div className="space-y-2">
                  <StyledLabel>Data da Aplicação</StyledLabel>
                  <Input
                    type="datetime-local"
                    value={formData.dataAplicacao}
                    onChange={(e) => setFormData(prev => ({ ...prev, dataAplicacao: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <StyledLabel>Próxima Aplicação</StyledLabel>
                  <Input
                    type="datetime-local"
                    value={formData.proximaAplicacao}
                    onChange={(e) => setFormData(prev => ({ ...prev, proximaAplicacao: e.target.value }))}
                  />
                </div>
              </FormFieldGroup>
            </FormSection>

            <FormSection title="Localização">
              <div className="space-y-2">
                <StyledLabel>Local</StyledLabel>
                <Input
                  value={formData.localizacao}
                  onChange={(e) => setFormData(prev => ({ ...prev, localizacao: e.target.value }))}
                  placeholder="Ex: Áreas comuns, subsolo..."
                />
              </div>
              <AutoLocationCapture onLocationCapture={(loc) => handleLocationCapture(loc.latitude, loc.longitude, loc.endereco)} />
              {formData.latitude && formData.longitude && (
                <LocationMiniMap 
                  latitude={formData.latitude} 
                  longitude={formData.longitude}
                  endereco={formData.enderecoGeo}
                />
              )}
            </FormSection>

            <FormSection title="Fotos">
              <MultiImageUpload
                value={imagensComLegendas.map(i => i.url)}
                onChange={(urls) => setImagensComLegendas(urls.map(url => ({ url, legenda: '' })))}
                maxImages={10}
              />
            </FormSection>

            <FormSection title="Informações Adicionais">
              <div className="space-y-2">
                <StyledLabel>Responsável</StyledLabel>
                <Input
                  value={formData.responsavelNome}
                  onChange={(e) => setFormData(prev => ({ ...prev, responsavelNome: e.target.value }))}
                  placeholder="Nome do responsável"
                />
              </div>
              <div className="space-y-2">
                <StyledLabel>Observações</StyledLabel>
                <Textarea
                  value={formData.observacoes}
                  onChange={(e) => setFormData(prev => ({ ...prev, observacoes: e.target.value }))}
                  placeholder="Observações adicionais..."
                  rows={3}
                />
              </div>
            </FormSection>
          </div>

          <FormActions>
            <Button variant="outline" onClick={() => setShowDialog(false)}>
              Cancelar
            </Button>
            <GradientButton 
              onClick={handleSubmit}
              disabled={createMutation.isPending}
              variant="danger"
            >
              {createMutation.isPending ? "Salvando..." : "Registrar Controle"}
            </GradientButton>
          </FormActions>
        </DialogContent>
      </Dialog>

      {/* Detail Dialog */}
      <Dialog open={showDetailDialog} onOpenChange={setShowDetailDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Bug className="w-5 h-5 text-red-500" />
              Detalhes do Controle
            </DialogTitle>
          </DialogHeader>
          
          {selectedItem && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Protocolo:</span>
                <span className="font-mono font-bold">#{selectedItem.protocolo}</span>
              </div>
              
              <div>
                <h3 className="font-semibold text-lg">{selectedItem.titulo}</h3>
                {selectedItem.descricao && (
                  <p className="text-muted-foreground mt-1">{selectedItem.descricao}</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Tipo:</span>
                  <p className="font-medium">{tipoServicoConfig[selectedItem.tipoServico as keyof typeof tipoServicoConfig]?.label || "Outro"}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Status:</span>
                  <p className="font-medium">{statusConfig[selectedItem.status as keyof typeof statusConfig]?.label || selectedItem.status}</p>
                </div>
                {selectedItem.empresaFornecedor && (
                  <div>
                    <span className="text-muted-foreground">Empresa:</span>
                    <p className="font-medium">{selectedItem.empresaFornecedor}</p>
                  </div>
                )}
                {selectedItem.garantiaDias && (
                  <div>
                    <span className="text-muted-foreground">Garantia:</span>
                    <p className="font-medium">{selectedItem.garantiaDias} dias</p>
                  </div>
                )}
                {selectedItem.custo && (
                  <div>
                    <span className="text-muted-foreground">Custo:</span>
                    <p className="font-medium text-green-600">R$ {selectedItem.custo}</p>
                  </div>
                )}
              </div>

              <div className="flex gap-2 pt-4">
                <Button 
                  variant="destructive" 
                  className="flex-1"
                  onClick={() => deleteMutation.mutate({ id: selectedItem.id })}
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Excluir
                </Button>
                <Button 
                  variant="outline" 
                  className="flex-1"
                  onClick={() => {
                    updateMutation.mutate({
                      id: selectedItem.id,
                      status: "finalizada",
                    });
                    setShowDetailDialog(false);
                  }}
                >
                  Finalizar
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
