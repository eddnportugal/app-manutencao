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
  TreeDeciduous,
  RefreshCw,
  Trash2,
  Calendar,
  DollarSign,
  Repeat,
  Ruler,
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

interface JardinagemPageProps {
  condominioId: number;
}

const tipoServicoConfig = {
  poda: { label: "Poda", emoji: "✂️" },
  plantio: { label: "Plantio", emoji: "🌱" },
  adubacao: { label: "Adubação", emoji: "🌿" },
  irrigacao: { label: "Irrigação", emoji: "💧" },
  limpeza: { label: "Limpeza", emoji: "🧹" },
  paisagismo: { label: "Paisagismo", emoji: "🏡" },
  outro: { label: "Outro", emoji: "🌳" },
};

const statusConfig = {
  agendada: { label: "Agendada", color: "bg-blue-100 text-blue-800" },
  em_andamento: { label: "Em Andamento", color: "bg-yellow-100 text-yellow-800" },
  realizada: { label: "Realizada", color: "bg-green-100 text-green-800" },
  finalizada: { label: "Finalizada", color: "bg-gray-100 text-gray-800" },
  cancelada: { label: "Cancelada", color: "bg-red-100 text-red-800" },
};

const recorrenciaConfig = {
  unica: { label: "Única", color: "text-gray-500" },
  semanal: { label: "Semanal", color: "text-purple-500" },
  quinzenal: { label: "Quinzenal", color: "text-blue-500" },
  mensal: { label: "Mensal", color: "text-green-500" },
  bimestral: { label: "Bimestral", color: "text-orange-500" },
  trimestral: { label: "Trimestral", color: "text-red-500" },
};

export default function JardinagemPage({ condominioId }: JardinagemPageProps) {
  const [showDialog, setShowDialog] = useState(false);
  const [showDetailDialog, setShowDetailDialog] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState("");
  
  const [formData, setFormData] = useState({
    titulo: "",
    descricao: "",
    tipoServico: "poda" as "poda" | "plantio" | "adubacao" | "irrigacao" | "limpeza" | "paisagismo" | "outro",
    plantasEspecies: "",
    produtosUtilizados: "",
    areaMetrosQuadrados: "",
    localizacao: "",
    latitude: "",
    longitude: "",
    enderecoGeo: "",
    dataRealizacao: "",
    proximaRealizacao: "",
    recorrencia: "unica" as "unica" | "semanal" | "quinzenal" | "mensal" | "bimestral" | "trimestral",
    custo: "",
    responsavelNome: "",
    observacoes: "",
    status: "agendada" as "agendada" | "em_andamento" | "realizada" | "finalizada" | "cancelada",
    prioridade: "media" as "baixa" | "media" | "alta" | "urgente",
  });
  const [imagensComLegendas, setImagensComLegendas] = useState<ImageItem[]>([]);

  const utils = trpc.useUtils();
  
  const { data: items = [], isLoading } = trpc.jardinagem.list.useQuery(
    { condominioId },
    { enabled: !!condominioId }
  );

  const createMutation = trpc.jardinagem.create.useMutation({
    onSuccess: (result) => {
      toast.success(`Jardinagem registrada! Protocolo: ${result.protocolo}`);
      setShowDialog(false);
      resetForm();
      utils.jardinagem.list.invalidate();
    },
    onError: () => toast.error("Erro ao registrar jardinagem"),
  });

  const updateMutation = trpc.jardinagem.update.useMutation({
    onSuccess: () => {
      toast.success("Jardinagem atualizada!");
      utils.jardinagem.list.invalidate();
    },
    onError: () => toast.error("Erro ao atualizar jardinagem"),
  });

  const deleteMutation = trpc.jardinagem.delete.useMutation({
    onSuccess: () => {
      toast.success("Jardinagem excluída!");
      setShowDetailDialog(false);
      utils.jardinagem.list.invalidate();
    },
    onError: () => toast.error("Erro ao excluir jardinagem"),
  });

  const resetForm = () => {
    setFormData({
      titulo: "",
      descricao: "",
      tipoServico: "poda",
      plantasEspecies: "",
      produtosUtilizados: "",
      areaMetrosQuadrados: "",
      localizacao: "",
      latitude: "",
      longitude: "",
      enderecoGeo: "",
      dataRealizacao: "",
      proximaRealizacao: "",
      recorrencia: "unica",
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
    item.plantasEspecies?.toLowerCase().includes(searchTerm.toLowerCase())
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
            <TreeDeciduous className="w-7 h-7 text-green-500" />
            Jardinagem
          </h1>
          <p className="text-muted-foreground">Gerencie podas, plantios e manutenção de áreas verdes</p>
        </div>
        <Button onClick={() => setShowDialog(true)} className="bg-gradient-to-r from-green-500 to-emerald-500">
          <Plus className="w-4 h-4 mr-2" />
          Nova Jardinagem
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
          placeholder="Buscar por título, protocolo ou plantas..." 
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
              <TreeDeciduous className="w-12 h-12 mx-auto text-muted-foreground/50 mb-4" />
              <p className="text-muted-foreground">Nenhuma jardinagem registrada</p>
              <Button onClick={() => setShowDialog(true)} variant="link" className="mt-2">
                Registrar primeira jardinagem
              </Button>
            </CardContent>
          </Card>
        ) : (
          filteredItems.map((item) => {
            const tipoConfig = tipoServicoConfig[item.tipoServico as keyof typeof tipoServicoConfig] || tipoServicoConfig.outro;
            const statusCfg = statusConfig[item.status as keyof typeof statusConfig] || statusConfig.agendada;
            const recCfg = recorrenciaConfig[item.recorrencia as keyof typeof recorrenciaConfig] || recorrenciaConfig.unica;
            
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
                    <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center flex-shrink-0 text-2xl">
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
                      <div className="flex items-center gap-3 mt-2 text-sm">
                        {item.recorrencia !== "unica" && (
                          <span className={`flex items-center gap-1 ${recCfg.color}`}>
                            <Repeat className="w-3 h-3" />
                            {recCfg.label}
                          </span>
                        )}
                        {item.areaMetrosQuadrados && (
                          <span className="flex items-center gap-1 text-muted-foreground">
                            <Ruler className="w-3 h-3" />
                            {item.areaMetrosQuadrados} m²
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="text-right text-sm text-muted-foreground">
                      {item.dataRealizacao && (
                        <p>{format(new Date(item.dataRealizacao), "dd/MM/yyyy", { locale: ptBR })}</p>
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
            title="Nova Jardinagem"
            subtitle="Registre um novo serviço de jardinagem"
            icon={TreeDeciduous}
            iconColor="text-green-600"
            iconBgColor="bg-gradient-to-br from-green-100 to-emerald-100"
          />
          
          <div className="space-y-6 p-6">
            <FormSection title="Identificação">
              <FormFieldGroup>
                <div className="space-y-2">
                  <StyledLabel required>Título</StyledLabel>
                  <Input
                    value={formData.titulo}
                    onChange={(e) => setFormData(prev => ({ ...prev, titulo: e.target.value }))}
                    placeholder="Ex: Poda de árvores"
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
                      <SelectItem value="poda">✂️ Poda</SelectItem>
                      <SelectItem value="plantio">🌱 Plantio</SelectItem>
                      <SelectItem value="adubacao">🌿 Adubação</SelectItem>
                      <SelectItem value="irrigacao">💧 Irrigação</SelectItem>
                      <SelectItem value="limpeza">🧹 Limpeza</SelectItem>
                      <SelectItem value="paisagismo">🏡 Paisagismo</SelectItem>
                      <SelectItem value="outro">🌳 Outro</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </FormFieldGroup>
              
              <FormFieldGroup>
                <div className="space-y-2">
                  <StyledLabel>Recorrência</StyledLabel>
                  <Select
                    value={formData.recorrencia}
                    onValueChange={(value: any) => setFormData(prev => ({ ...prev, recorrencia: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="unica">Única</SelectItem>
                      <SelectItem value="semanal">Semanal</SelectItem>
                      <SelectItem value="quinzenal">Quinzenal</SelectItem>
                      <SelectItem value="mensal">Mensal</SelectItem>
                      <SelectItem value="bimestral">Bimestral</SelectItem>
                      <SelectItem value="trimestral">Trimestral</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <StyledLabel>Área (m²)</StyledLabel>
                  <Input
                    value={formData.areaMetrosQuadrados}
                    onChange={(e) => setFormData(prev => ({ ...prev, areaMetrosQuadrados: e.target.value }))}
                    placeholder="Ex: 500"
                  />
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

            <FormSection title="Plantas e Produtos">
              <div className="space-y-2">
                <StyledLabel>Plantas/Espécies</StyledLabel>
                <Textarea
                  value={formData.plantasEspecies}
                  onChange={(e) => setFormData(prev => ({ ...prev, plantasEspecies: e.target.value }))}
                  placeholder="Liste as plantas e espécies envolvidas..."
                  rows={2}
                />
              </div>
              
              <div className="space-y-2">
                <StyledLabel>Produtos Utilizados</StyledLabel>
                <Textarea
                  value={formData.produtosUtilizados}
                  onChange={(e) => setFormData(prev => ({ ...prev, produtosUtilizados: e.target.value }))}
                  placeholder="Adubos, fertilizantes, etc..."
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
                  <StyledLabel>Data de Realização</StyledLabel>
                  <Input
                    type="datetime-local"
                    value={formData.dataRealizacao}
                    onChange={(e) => setFormData(prev => ({ ...prev, dataRealizacao: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <StyledLabel>Próxima Realização</StyledLabel>
                  <Input
                    type="datetime-local"
                    value={formData.proximaRealizacao}
                    onChange={(e) => setFormData(prev => ({ ...prev, proximaRealizacao: e.target.value }))}
                  />
                </div>
              </FormFieldGroup>
            </FormSection>

            <FormSection title="Localização">
              <div className="space-y-2">
                <StyledLabel>Local/Área</StyledLabel>
                <Input
                  value={formData.localizacao}
                  onChange={(e) => setFormData(prev => ({ ...prev, localizacao: e.target.value }))}
                  placeholder="Ex: Jardim frontal, área de lazer..."
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
              variant="success"
            >
              {createMutation.isPending ? "Salvando..." : "Registrar Jardinagem"}
            </GradientButton>
          </FormActions>
        </DialogContent>
      </Dialog>

      {/* Detail Dialog */}
      <Dialog open={showDetailDialog} onOpenChange={setShowDetailDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <TreeDeciduous className="w-5 h-5 text-green-500" />
              Detalhes da Jardinagem
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
                {selectedItem.recorrencia !== "unica" && (
                  <div>
                    <span className="text-muted-foreground">Recorrência:</span>
                    <p className="font-medium">{recorrenciaConfig[selectedItem.recorrencia as keyof typeof recorrenciaConfig]?.label || "Única"}</p>
                  </div>
                )}
                {selectedItem.areaMetrosQuadrados && (
                  <div>
                    <span className="text-muted-foreground">Área:</span>
                    <p className="font-medium">{selectedItem.areaMetrosQuadrados} m²</p>
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
