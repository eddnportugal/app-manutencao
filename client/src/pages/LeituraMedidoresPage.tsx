import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
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
  Gauge,
  RefreshCw,
  Eye,
  Trash2,
  MapPin,
  Calendar,
  Droplets,
  Flame,
  Zap,
  MoreHorizontal,
  Edit,
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

interface LeituraMedidoresPageProps {
  condominioId: number;
}

const tipoMedidorConfig = {
  agua: { label: "Água", icon: Droplets, color: "text-blue-500", bg: "bg-blue-100" },
  gas: { label: "Gás", icon: Flame, color: "text-orange-500", bg: "bg-orange-100" },
  energia: { label: "Energia", icon: Zap, color: "text-yellow-500", bg: "bg-yellow-100" },
  outro: { label: "Outro", icon: Gauge, color: "text-gray-500", bg: "bg-gray-100" },
};

const statusConfig = {
  pendente: { label: "Pendente", color: "bg-yellow-100 text-yellow-800" },
  realizada: { label: "Realizada", color: "bg-blue-100 text-blue-800" },
  conferida: { label: "Conferida", color: "bg-green-100 text-green-800" },
  finalizada: { label: "Finalizada", color: "bg-gray-100 text-gray-800" },
};

export default function LeituraMedidoresPage({ condominioId }: LeituraMedidoresPageProps) {
  const [showDialog, setShowDialog] = useState(false);
  const [showDetailDialog, setShowDetailDialog] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState("");
  
  const [formData, setFormData] = useState({
    titulo: "",
    descricao: "",
    tipoMedidor: "energia" as "agua" | "gas" | "energia" | "outro",
    identificacaoMedidor: "",
    leituraAtual: "",
    leituraAnterior: "",
    unidadeMedida: "kWh",
    localizacao: "",
    latitude: "",
    longitude: "",
    enderecoGeo: "",
    dataLeitura: "",
    proximaLeitura: "",
    responsavelNome: "",
    observacoes: "",
    status: "pendente" as "pendente" | "realizada" | "conferida" | "finalizada",
  });
  const [imagensComLegendas, setImagensComLegendas] = useState<ImageItem[]>([]);

  const utils = trpc.useUtils();
  
  const { data: items = [], isLoading } = trpc.leituraMedidores.list.useQuery(
    { condominioId },
    { enabled: !!condominioId }
  );

  const createMutation = trpc.leituraMedidores.create.useMutation({
    onSuccess: (result) => {
      toast.success(`Leitura registrada! Protocolo: ${result.protocolo}`);
      setShowDialog(false);
      resetForm();
      utils.leituraMedidores.list.invalidate();
    },
    onError: () => toast.error("Erro ao registrar leitura"),
  });

  const updateMutation = trpc.leituraMedidores.update.useMutation({
    onSuccess: () => {
      toast.success("Leitura atualizada!");
      utils.leituraMedidores.list.invalidate();
    },
    onError: () => toast.error("Erro ao atualizar leitura"),
  });

  const deleteMutation = trpc.leituraMedidores.delete.useMutation({
    onSuccess: () => {
      toast.success("Leitura excluída!");
      setShowDetailDialog(false);
      utils.leituraMedidores.list.invalidate();
    },
    onError: () => toast.error("Erro ao excluir leitura"),
  });

  const resetForm = () => {
    setFormData({
      titulo: "",
      descricao: "",
      tipoMedidor: "energia",
      identificacaoMedidor: "",
      leituraAtual: "",
      leituraAnterior: "",
      unidadeMedida: "kWh",
      localizacao: "",
      latitude: "",
      longitude: "",
      enderecoGeo: "",
      dataLeitura: "",
      proximaLeitura: "",
      responsavelNome: "",
      observacoes: "",
      status: "pendente",
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

  const calcularConsumo = () => {
    const atual = parseFloat(formData.leituraAtual);
    const anterior = parseFloat(formData.leituraAnterior);
    if (!isNaN(atual) && !isNaN(anterior)) {
      return (atual - anterior).toFixed(2);
    }
    return "-";
  };

  const filteredItems = items.filter(item => 
    item.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.protocolo.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.identificacaoMedidor?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Estatísticas
  const stats = {
    total: items.length,
    pendentes: items.filter(i => i.status === "pendente").length,
    realizadas: items.filter(i => i.status === "realizada" || i.status === "conferida" || i.status === "finalizada").length,
  };

  return (
    <div className="space-y-6 p-4 md:p-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Gauge className="w-7 h-7 text-yellow-500" />
            Leitura de Medidores
          </h1>
          <p className="text-muted-foreground">Registre e acompanhe leituras de água, gás e energia</p>
        </div>
        <Button onClick={() => setShowDialog(true)} className="bg-gradient-to-r from-yellow-500 to-orange-500">
          <Plus className="w-4 h-4 mr-2" />
          Nova Leitura
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
            <p className="text-sm text-muted-foreground">Pendentes</p>
            <p className="text-2xl font-bold text-yellow-600">{stats.pendentes}</p>
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
          placeholder="Buscar por título, protocolo ou ID do medidor..." 
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
              <Gauge className="w-12 h-12 mx-auto text-muted-foreground/50 mb-4" />
              <p className="text-muted-foreground">Nenhuma leitura registrada</p>
              <Button onClick={() => setShowDialog(true)} variant="link" className="mt-2">
                Registrar primeira leitura
              </Button>
            </CardContent>
          </Card>
        ) : (
          filteredItems.map((item) => {
            const tipoConfig = tipoMedidorConfig[item.tipoMedidor as keyof typeof tipoMedidorConfig] || tipoMedidorConfig.outro;
            const TipoIcon = tipoConfig.icon;
            const statusCfg = statusConfig[item.status as keyof typeof statusConfig] || statusConfig.pendente;
            
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
                    <div className={`w-12 h-12 rounded-xl ${tipoConfig.bg} flex items-center justify-center flex-shrink-0`}>
                      <TipoIcon className={`w-6 h-6 ${tipoConfig.color}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold truncate">{item.titulo}</h3>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusCfg.color}`}>
                          {statusCfg.label}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground">#{item.protocolo}</p>
                      {item.identificacaoMedidor && (
                        <p className="text-sm text-muted-foreground">ID: {item.identificacaoMedidor}</p>
                      )}
                      <div className="flex items-center gap-4 mt-2 text-sm">
                        {item.leituraAtual && (
                          <span className="font-medium">
                            Leitura: {item.leituraAtual} {item.unidadeMedida}
                          </span>
                        )}
                        {item.consumo && (
                          <span className="text-green-600">
                            Consumo: {item.consumo} {item.unidadeMedida}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="text-right text-sm text-muted-foreground">
                      {item.dataLeitura && format(new Date(item.dataLeitura), "dd/MM/yyyy", { locale: ptBR })}
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
            title="Nova Leitura de Medidor"
            subtitle="Registre uma nova leitura"
            icon={Gauge}
            iconColor="text-yellow-600"
            iconBgColor="bg-gradient-to-br from-yellow-100 to-orange-100"
          />
          
          <div className="space-y-6 p-6">
            <FormSection title="Identificação">
              <FormFieldGroup>
                <div className="space-y-2">
                  <StyledLabel required>Título</StyledLabel>
                  <Input
                    value={formData.titulo}
                    onChange={(e) => setFormData(prev => ({ ...prev, titulo: e.target.value }))}
                    placeholder="Ex: Leitura do medidor principal"
                  />
                </div>
                <div className="space-y-2">
                  <StyledLabel>Tipo de Medidor</StyledLabel>
                  <Select
                    value={formData.tipoMedidor}
                    onValueChange={(value: any) => {
                      setFormData(prev => ({
                        ...prev,
                        tipoMedidor: value,
                        unidadeMedida: value === "agua" ? "m³" : value === "gas" ? "m³" : "kWh"
                      }));
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="energia">⚡ Energia</SelectItem>
                      <SelectItem value="agua">💧 Água</SelectItem>
                      <SelectItem value="gas">🔥 Gás</SelectItem>
                      <SelectItem value="outro">📊 Outro</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </FormFieldGroup>
              
              <FormFieldGroup>
                <div className="space-y-2">
                  <StyledLabel>ID do Medidor</StyledLabel>
                  <Input
                    value={formData.identificacaoMedidor}
                    onChange={(e) => setFormData(prev => ({ ...prev, identificacaoMedidor: e.target.value }))}
                    placeholder="Número de identificação"
                  />
                </div>
                <div className="space-y-2">
                  <StyledLabel>Unidade de Medida</StyledLabel>
                  <Input
                    value={formData.unidadeMedida}
                    onChange={(e) => setFormData(prev => ({ ...prev, unidadeMedida: e.target.value }))}
                    placeholder="kWh, m³, etc."
                  />
                </div>
              </FormFieldGroup>
            </FormSection>

            <FormSection title="Leituras">
              <FormFieldGroup>
                <div className="space-y-2">
                  <StyledLabel>Leitura Anterior</StyledLabel>
                  <Input
                    type="number"
                    step="0.001"
                    value={formData.leituraAnterior}
                    onChange={(e) => setFormData(prev => ({ ...prev, leituraAnterior: e.target.value }))}
                    placeholder="0.000"
                  />
                </div>
                <div className="space-y-2">
                  <StyledLabel>Leitura Atual</StyledLabel>
                  <Input
                    type="number"
                    step="0.001"
                    value={formData.leituraAtual}
                    onChange={(e) => setFormData(prev => ({ ...prev, leituraAtual: e.target.value }))}
                    placeholder="0.000"
                  />
                </div>
              </FormFieldGroup>
              
              {formData.leituraAtual && formData.leituraAnterior && (
                <div className="flex items-center gap-2 p-3 bg-green-50 rounded-lg">
                  <span className="text-sm text-green-700">Consumo calculado:</span>
                  <span className="font-bold text-green-700">{calcularConsumo()} {formData.unidadeMedida}</span>
                </div>
              )}
            </FormSection>

            <FormSection title="Datas">
              <FormFieldGroup>
                <div className="space-y-2">
                  <StyledLabel>Data da Leitura</StyledLabel>
                  <Input
                    type="datetime-local"
                    value={formData.dataLeitura}
                    onChange={(e) => setFormData(prev => ({ ...prev, dataLeitura: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <StyledLabel>Próxima Leitura</StyledLabel>
                  <Input
                    type="datetime-local"
                    value={formData.proximaLeitura}
                    onChange={(e) => setFormData(prev => ({ ...prev, proximaLeitura: e.target.value }))}
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
                  placeholder="Ex: Entrada principal, Bloco A..."
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

            <FormSection title="Fotos do Medidor">
              <MultiImageUpload
                value={imagensComLegendas.map(i => i.url)}
                onChange={(urls) => setImagensComLegendas(urls.map(url => ({ url, legenda: '' })))}
                maxImages={5}
              />
            </FormSection>

            <FormSection title="Informações Adicionais">
              <div className="space-y-2">
                <StyledLabel>Responsável</StyledLabel>
                <Input
                  value={formData.responsavelNome}
                  onChange={(e) => setFormData(prev => ({ ...prev, responsavelNome: e.target.value }))}
                  placeholder="Nome do responsável pela leitura"
                />
              </div>
              <div className="space-y-2">
                <StyledLabel>Observações</StyledLabel>
                <Textarea
                  value={formData.observacoes}
                  onChange={(e) => setFormData(prev => ({ ...prev, observacoes: e.target.value }))}
                  placeholder="Observações sobre a leitura..."
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
              variant="warning"
            >
              {createMutation.isPending ? "Salvando..." : "Registrar Leitura"}
            </GradientButton>
          </FormActions>
        </DialogContent>
      </Dialog>

      {/* Detail Dialog */}
      <Dialog open={showDetailDialog} onOpenChange={setShowDetailDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Gauge className="w-5 h-5 text-yellow-500" />
              Detalhes da Leitura
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
                  <p className="font-medium">{tipoMedidorConfig[selectedItem.tipoMedidor as keyof typeof tipoMedidorConfig]?.label || "Outro"}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Status:</span>
                  <p className="font-medium">{statusConfig[selectedItem.status as keyof typeof statusConfig]?.label || selectedItem.status}</p>
                </div>
                {selectedItem.leituraAtual && (
                  <div>
                    <span className="text-muted-foreground">Leitura Atual:</span>
                    <p className="font-medium">{selectedItem.leituraAtual} {selectedItem.unidadeMedida}</p>
                  </div>
                )}
                {selectedItem.consumo && (
                  <div>
                    <span className="text-muted-foreground">Consumo:</span>
                    <p className="font-medium text-green-600">{selectedItem.consumo} {selectedItem.unidadeMedida}</p>
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
