import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Switch } from "@/components/ui/switch";
import { trpc } from "@/lib/trpc";
import { AlertTriangle, Info, Loader2, Megaphone, Save } from "lucide-react";
import { useState } from "react";
import { toast } from "@/components/ui/sonner";

interface AvisoFormProps {
  revistaId: number;
  onSuccess?: () => void;
  onCancel?: () => void;
  initialData?: {
    id?: number;
    titulo?: string;
    conteudo?: string;
    tipo?: "urgente" | "importante" | "informativo";
    destaque?: boolean;
  };
}

export default function AvisoForm({ revistaId, onSuccess, onCancel, initialData }: AvisoFormProps) {
  const [formData, setFormData] = useState({
    titulo: initialData?.titulo || "",
    conteudo: initialData?.conteudo || "",
    tipo: initialData?.tipo || "informativo" as "urgente" | "importante" | "informativo",
    destaque: initialData?.destaque || false,
  });

  const utils = trpc.useUtils();

  const createMutation = trpc.aviso.create.useMutation({
    onSuccess: () => {
      toast.success("Aviso criado com sucesso!");
      utils.aviso.list.invalidate({ revistaId });
      onSuccess?.();
    },
    onError: (error) => {
      toast.error("Erro ao criar aviso: " + error.message);
    },
  });

  const updateMutation = trpc.aviso.update.useMutation({
    onSuccess: () => {
      toast.success("Aviso atualizado com sucesso!");
      utils.aviso.list.invalidate({ revistaId });
      onSuccess?.();
    },
    onError: (error) => {
      toast.error("Erro ao atualizar aviso: " + error.message);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.titulo.trim()) {
      toast.error("O título do aviso é obrigatório");
      return;
    }

    if (initialData?.id) {
      updateMutation.mutate({ id: initialData.id, ...formData });
    } else {
      createMutation.mutate({ revistaId, ...formData });
    }
  };

  const isLoading = createMutation.isPending || updateMutation.isPending;

  return (
    <form onSubmit={handleSubmit}>
      <Card>
        <CardHeader>
          <CardTitle className="font-serif flex items-center gap-2">
            <Megaphone className="w-5 h-5" />
            {initialData?.id ? "Editar Aviso" : "Novo Aviso"}
          </CardTitle>
          <CardDescription>
            Crie um aviso para a equipa da organização
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Título */}
          <div className="space-y-2">
            <Label htmlFor="titulo">Título do Aviso *</Label>
            <Input
              id="titulo"
              placeholder="Ex: Manutenção da Piscina"
              value={formData.titulo}
              onChange={(e) => setFormData({ ...formData, titulo: e.target.value })}
              required
            />
          </div>

          {/* Conteúdo */}
          <div className="space-y-2">
            <Label htmlFor="conteudo">Conteúdo</Label>
            <Textarea
              id="conteudo"
              placeholder="Descreva o aviso em detalhes..."
              value={formData.conteudo}
              onChange={(e) => setFormData({ ...formData, conteudo: e.target.value })}
              rows={4}
            />
          </div>

          {/* Tipo */}
          <div className="space-y-3">
            <Label>Tipo de Aviso</Label>
            <RadioGroup
              value={formData.tipo}
              onValueChange={(value) => setFormData({ ...formData, tipo: value as any })}
              className="grid grid-cols-3 gap-4"
            >
              <div>
                <RadioGroupItem value="informativo" id="informativo" className="peer sr-only" />
                <Label
                  htmlFor="informativo"
                  className="flex flex-col items-center justify-between rounded-xl border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-blue-500 peer-data-[state=checked]:bg-blue-50 [&:has([data-state=checked])]:border-blue-500 cursor-pointer"
                >
                  <Info className="w-6 h-6 mb-2 text-blue-500" />
                  <span className="text-sm font-medium">Informativo</span>
                </Label>
              </div>
              <div>
                <RadioGroupItem value="importante" id="importante" className="peer sr-only" />
                <Label
                  htmlFor="importante"
                  className="flex flex-col items-center justify-between rounded-xl border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-amber-500 peer-data-[state=checked]:bg-amber-50 [&:has([data-state=checked])]:border-amber-500 cursor-pointer"
                >
                  <AlertTriangle className="w-6 h-6 mb-2 text-amber-500" />
                  <span className="text-sm font-medium">Importante</span>
                </Label>
              </div>
              <div>
                <RadioGroupItem value="urgente" id="urgente" className="peer sr-only" />
                <Label
                  htmlFor="urgente"
                  className="flex flex-col items-center justify-between rounded-xl border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-red-500 peer-data-[state=checked]:bg-red-50 [&:has([data-state=checked])]:border-red-500 cursor-pointer"
                >
                  <Megaphone className="w-6 h-6 mb-2 text-red-500" />
                  <span className="text-sm font-medium">Urgente</span>
                </Label>
              </div>
            </RadioGroup>
          </div>

          {/* Destaque */}
          <div className="flex items-center justify-between rounded-xl border border-border p-4">
            <div className="space-y-0.5">
              <Label htmlFor="destaque">Destacar na Capa</Label>
              <p className="text-sm text-muted-foreground">
                Este aviso aparecerá em destaque na primeira página
              </p>
            </div>
            <Switch
              id="destaque"
              checked={formData.destaque}
              onCheckedChange={(checked) => setFormData({ ...formData, destaque: checked })}
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            {onCancel && (
              <Button type="button" variant="outline" className="flex-1" onClick={onCancel}>
                Cancelar
              </Button>
            )}
            <Button type="submit" className="flex-1 btn-magazine" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  A guardar...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  {initialData?.id ? "Guardar" : "Criar Aviso"}
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </form>
  );
}
