import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { trpc } from "@/lib/trpc";
import { BookOpen, Loader2, Save, Sparkles } from "lucide-react";
import { useState } from "react";
import { toast } from "@/components/ui/sonner";

interface RevistaFormProps {
  condominioId: number;
  onSuccess?: (id: number, shareLink: string) => void;
  initialData?: {
    id?: number;
    titulo?: string;
    subtitulo?: string;
    edicao?: string;
    templateId?: string;
  };
}

const templates = [
  { id: "default", name: "Padrão", description: "Layout clássico para relatórios de manutenção" },
  { id: "modern", name: "Moderno", description: "Design limpo para documentação técnica" },
  { id: "colorful", name: "Colorido", description: "Visual dinâmico para apresentações" },
  { id: "corporate", name: "Corporativo", description: "Profissional para clientes e gestão" },
];

export default function RevistaForm({ condominioId, onSuccess, initialData }: RevistaFormProps) {
  const [formData, setFormData] = useState({
    titulo: initialData?.titulo || "",
    subtitulo: initialData?.subtitulo || "Informativo Mensal",
    edicao: initialData?.edicao || getCurrentEdition(),
    templateId: initialData?.templateId || "default",
  });

  const utils = trpc.useUtils();

  const createMutation = trpc.revista.create.useMutation({
    onSuccess: (data) => {
      toast.success("Projeto criado com sucesso!");
      utils.revista.list.invalidate({ condominioId });
      onSuccess?.(data.id, data.shareLink);
    },
    onError: (error) => {
      toast.error("Erro ao criar projeto: " + error.message);
    },
  });

  const updateMutation = trpc.revista.update.useMutation({
    onSuccess: () => {
      toast.success("Projeto atualizado com sucesso!");
      utils.revista.list.invalidate({ condominioId });
    },
    onError: (error) => {
      toast.error("Erro ao atualizar projeto: " + error.message);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.titulo.trim()) {
      toast.error("O título do projeto é obrigatório");
      return;
    }

    if (initialData?.id) {
      updateMutation.mutate({ id: initialData.id, ...formData });
    } else {
      createMutation.mutate({ condominioId, ...formData });
    }
  };

  const isLoading = createMutation.isPending || updateMutation.isPending;

  return (
    <form onSubmit={handleSubmit}>
      <Card>
        <CardHeader>
          <CardTitle className="font-serif flex items-center gap-2">
            <BookOpen className="w-5 h-5" />
            {initialData?.id ? "Editar Projeto" : "Novo Projeto"}
          </CardTitle>
          <CardDescription>
            Configure os detalhes do seu projeto
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Título */}
          <div className="space-y-2">
            <Label htmlFor="titulo">Título do Projeto *</Label>
            <Input
              id="titulo"
              placeholder="Ex: Residencial Jardins"
              value={formData.titulo}
              onChange={(e) => setFormData({ ...formData, titulo: e.target.value })}
              required
            />
          </div>

          {/* Subtítulo */}
          <div className="space-y-2">
            <Label htmlFor="subtitulo">Subtítulo</Label>
            <Input
              id="subtitulo"
              placeholder="Ex: Informativo Mensal"
              value={formData.subtitulo}
              onChange={(e) => setFormData({ ...formData, subtitulo: e.target.value })}
            />
          </div>

          {/* Edição */}
          <div className="space-y-2">
            <Label htmlFor="edicao">Edição</Label>
            <Input
              id="edicao"
              placeholder="Ex: Dezembro 2024"
              value={formData.edicao}
              onChange={(e) => setFormData({ ...formData, edicao: e.target.value })}
            />
          </div>

          {/* Template */}
          <div className="space-y-2">
            <Label>Template</Label>
            <Select
              value={formData.templateId}
              onValueChange={(value) => setFormData({ ...formData, templateId: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione um template" />
              </SelectTrigger>
              <SelectContent>
                {templates.map((template) => (
                  <SelectItem key={template.id} value={template.id}>
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-primary" />
                      <div>
                        <div className="font-medium">{template.name}</div>
                        <div className="text-xs text-muted-foreground">{template.description}</div>
                      </div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Template Preview */}
          <div className="grid grid-cols-2 gap-4">
            {templates.map((template) => (
              <button
                key={template.id}
                type="button"
                onClick={() => setFormData({ ...formData, templateId: template.id })}
                className={`p-4 rounded-xl border-2 transition-all text-left ${
                  formData.templateId === template.id
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-primary/50"
                }`}
              >
                <div className="aspect-[3/4] bg-gradient-to-br from-primary/20 to-accent/20 rounded-lg mb-3 flex items-center justify-center">
                  <BookOpen className="w-8 h-8 text-primary/50" />
                </div>
                <div className="font-medium text-sm">{template.name}</div>
                <div className="text-xs text-muted-foreground">{template.description}</div>
              </button>
            ))}
          </div>

          {/* Submit */}
          <Button type="submit" className="w-full btn-magazine" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                A criar...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                {initialData?.id ? "Guardar Alterações" : "Criar Projeto"}
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    </form>
  );
}

function getCurrentEdition(): string {
  const months = [
    "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
    "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
  ];
  const now = new Date();
  return `${months[now.getMonth()]} ${now.getFullYear()}`;
}
