import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/lib/trpc";
import { toast } from "@/components/ui/sonner";
import { 
  Plus, 
  Trash2, 
  Edit, 
  Copy, 
  CheckCircle, 
  ListChecks,
  Building2,
  Wrench,
  Zap,
  Droplets,
  Shield,
  Sparkles,
  TreePine,
  MoreHorizontal
} from "lucide-react";

interface ChecklistTemplatesProps {
  condominioId: number;
  onSelectTemplate?: (template: any) => void;
}

const CATEGORIAS = [
  { value: "predial", label: "Predial", icon: Building2 },
  { value: "industrial", label: "Industrial", icon: Wrench },
  { value: "eletrica", label: "Elétrica", icon: Zap },
  { value: "hidraulica", label: "Hidráulica", icon: Droplets },
  { value: "seguranca", label: "Segurança", icon: Shield },
  { value: "limpeza", label: "Limpeza", icon: Sparkles },
  { value: "jardinagem", label: "Jardinagem", icon: TreePine },
  { value: "outros", label: "Outros", icon: MoreHorizontal },
];

const CORES = [
  "#f97316", // laranja
  "#22c55e", // verde
  "#3b82f6", // azul
  "#eab308", // amarelo
  "#ef4444", // vermelho
  "#8b5cf6", // roxo
  "#06b6d4", // cyan
  "#ec4899", // rosa
];

export function ChecklistTemplates({ condominioId, onSelectTemplate }: ChecklistTemplatesProps) {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<any>(null);
  const [newTemplate, setNewTemplate] = useState({
    nome: "",
    descricao: "",
    categoria: "predial",
    cor: "#f97316",
    itens: [] as string[],
  });
  const [novoItem, setNovoItem] = useState("");

  const utils = trpc.useUtils();

  // Buscar templates
  const { data: templates, isLoading } = trpc.checklistTemplate.list.useQuery(
    { condominioId },
    { enabled: !!condominioId }
  );

  // Mutations
  const createMutation = trpc.checklistTemplate.create.useMutation({
    onSuccess: () => {
      toast.success("Template criado com sucesso!");
      utils.checklistTemplate.list.invalidate();
      setIsCreateOpen(false);
      setNewTemplate({
        nome: "",
        descricao: "",
        categoria: "predial",
        cor: "#f97316",
        itens: [],
      });
    },
    onError: (error) => {
      toast.error("Erro ao criar template: " + error.message);
    },
  });

  const deleteMutation = trpc.checklistTemplate.delete.useMutation({
    onSuccess: () => {
      toast.success("Template excluído com sucesso!");
      utils.checklistTemplate.list.invalidate();
    },
    onError: (error) => {
      toast.error("Erro ao excluir template: " + error.message);
    },
  });

  const duplicateMutation = trpc.checklistTemplate.duplicate.useMutation({
    onSuccess: () => {
      toast.success("Template duplicado com sucesso!");
      utils.checklistTemplate.list.invalidate();
    },
    onError: (error) => {
      toast.error("Erro ao duplicar template: " + error.message);
    },
  });

  const handleAddItem = () => {
    if (novoItem.trim()) {
      setNewTemplate(prev => ({
        ...prev,
        itens: [...prev.itens, novoItem.trim()]
      }));
      setNovoItem("");
    }
  };

  const handleRemoveItem = (index: number) => {
    setNewTemplate(prev => ({
      ...prev,
      itens: prev.itens.filter((_, i) => i !== index)
    }));
  };

  const handleCreate = () => {
    if (!newTemplate.nome.trim()) {
      toast.error("Nome do template é obrigatório");
      return;
    }
    createMutation.mutate({
      condominioId,
      nome: newTemplate.nome,
      descricao: newTemplate.descricao,
      categoria: newTemplate.categoria,
      cor: newTemplate.cor,
      itens: newTemplate.itens,
    });
  };

  const getCategoriaIcon = (categoria: string) => {
    const cat = CATEGORIAS.find(c => c.value === categoria);
    return cat?.icon || MoreHorizontal;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <ListChecks className="w-5 h-5 text-orange-500" />
            Templates de Checklist
          </h2>
          <p className="text-sm text-muted-foreground">
            Crie e gerencie modelos de checklist para agilizar seu trabalho
          </p>
        </div>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2 bg-orange-500 hover:bg-orange-600">
              <Plus className="w-4 h-4" />
              Novo Template
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Criar Novo Template</DialogTitle>
              <DialogDescription>
                Crie um modelo de checklist reutilizável
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Nome do Template *</Label>
                  <Input
                    placeholder="Ex: Vistoria Elétrica"
                    value={newTemplate.nome}
                    onChange={(e) => setNewTemplate(prev => ({ ...prev, nome: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Categoria</Label>
                  <Select
                    value={newTemplate.categoria}
                    onValueChange={(value) => setNewTemplate(prev => ({ ...prev, categoria: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {CATEGORIAS.map((cat) => (
                        <SelectItem key={cat.value} value={cat.value}>
                          <div className="flex items-center gap-2">
                            <cat.icon className="w-4 h-4" />
                            {cat.label}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Descrição</Label>
                <Textarea
                  placeholder="Descreva o propósito deste template..."
                  value={newTemplate.descricao}
                  onChange={(e) => setNewTemplate(prev => ({ ...prev, descricao: e.target.value }))}
                />
              </div>

              <div className="space-y-2">
                <Label>Cor</Label>
                <div className="flex gap-2">
                  {CORES.map((cor) => (
                    <button
                      key={cor}
                      type="button"
                      className={`w-8 h-8 rounded-full border-2 transition-all ${
                        newTemplate.cor === cor ? "border-foreground scale-110" : "border-transparent"
                      }`}
                      style={{ backgroundColor: cor }}
                      onClick={() => setNewTemplate(prev => ({ ...prev, cor }))}
                    />
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label>Itens do Checklist</Label>
                <div className="flex gap-2">
                  <Input
                    placeholder="Adicionar item..."
                    value={novoItem}
                    onChange={(e) => setNovoItem(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && handleAddItem()}
                  />
                  <Button type="button" onClick={handleAddItem} variant="outline">
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
                <div className="space-y-2 mt-3">
                  {newTemplate.itens.map((item, index) => (
                    <div key={index} className="flex items-center gap-2 p-2 bg-muted rounded-lg">
                      <CheckCircle className="w-4 h-4 text-muted-foreground" />
                      <span className="flex-1 text-sm">{item}</span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={() => handleRemoveItem(index)}
                      >
                        <Trash2 className="w-3 h-3 text-red-500" />
                      </Button>
                    </div>
                  ))}
                  {newTemplate.itens.length === 0 && (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      Nenhum item adicionado ainda
                    </p>
                  )}
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateOpen(false)}>
                Cancelar
              </Button>
              <Button 
                onClick={handleCreate} 
                disabled={createMutation.isPending}
                className="bg-orange-500 hover:bg-orange-600"
              >
                {createMutation.isPending ? "Criando..." : "Criar Template"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Lista de Templates */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="pb-2">
                <div className="h-5 bg-muted rounded w-3/4" />
                <div className="h-4 bg-muted rounded w-1/2 mt-2" />
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="h-3 bg-muted rounded w-full" />
                  <div className="h-3 bg-muted rounded w-4/5" />
                  <div className="h-3 bg-muted rounded w-3/5" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : templates && templates.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {templates.map((template: any) => {
            const Icon = getCategoriaIcon(template.categoria);
            return (
              <Card 
                key={template.id} 
                className="group hover:shadow-lg transition-all cursor-pointer border-l-4"
                style={{ borderLeftColor: template.cor || "#f97316" }}
                onClick={() => onSelectTemplate?.(template)}
              >
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <div 
                        className="p-2 rounded-lg"
                        style={{ backgroundColor: `${template.cor}20` }}
                      >
                        <Icon className="w-4 h-4" style={{ color: template.cor }} />
                      </div>
                      <div>
                        <CardTitle className="text-base">{template.nome}</CardTitle>
                        <Badge variant="secondary" className="text-xs mt-1">
                          {CATEGORIAS.find(c => c.value === template.categoria)?.label || template.categoria}
                        </Badge>
                      </div>
                    </div>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        onClick={(e) => {
                          e.stopPropagation();
                          duplicateMutation.mutate({ id: template.id });
                        }}
                      >
                        <Copy className="w-3 h-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-red-500 hover:text-red-600"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (confirm("Tem certeza que deseja excluir este template?")) {
                            deleteMutation.mutate({ id: template.id });
                          }
                        }}
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {template.descricao && (
                    <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                      {template.descricao}
                    </p>
                  )}
                  <div className="space-y-1">
                    {template.itens?.slice(0, 3).map((item: any, index: number) => (
                      <div key={index} className="flex items-center gap-2 text-sm">
                        <CheckCircle className="w-3 h-3 text-muted-foreground" />
                        <span className="line-clamp-1">{item.descricao || item}</span>
                      </div>
                    ))}
                    {template.itens?.length > 3 && (
                      <p className="text-xs text-muted-foreground pl-5">
                        +{template.itens.length - 3} itens
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <ListChecks className="w-12 h-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">Nenhum template criado</h3>
            <p className="text-sm text-muted-foreground text-center mb-4">
              Crie templates de checklist para agilizar a criação de novas vistorias
            </p>
            <Button onClick={() => setIsCreateOpen(true)} className="gap-2">
              <Plus className="w-4 h-4" />
              Criar Primeiro Template
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default ChecklistTemplates;
