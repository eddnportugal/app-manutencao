import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { trpc } from "@/lib/trpc";
import { Loader2, Save, Users } from "lucide-react";
import { useState } from "react";
import { toast } from "@/components/ui/sonner";
import ImageUpload from "@/components/ImageUpload";

interface FuncionarioFormProps {
  condominioId?: number;
  revistaId?: number;
  onSuccess?: () => void;
  onCancel?: () => void;
  initialData?: {
    id?: number;
    nome?: string;
    cargo?: string;
    descricao?: string;
    fotoUrl?: string;
  };
}

export default function FuncionarioForm({ condominioId, revistaId, onSuccess, onCancel, initialData }: FuncionarioFormProps) {
  const [formData, setFormData] = useState({
    nome: initialData?.nome || "",
    cargo: initialData?.cargo || "",
    descricao: initialData?.descricao || "",
    fotoUrl: initialData?.fotoUrl || "",
  });

  const utils = trpc.useUtils();

  const createMutation = trpc.funcionario.create.useMutation({
    onSuccess: () => {
      toast.success("Funcionário cadastrado com sucesso!");
      if (revistaId) {
        utils.funcionario.list.invalidate({ revistaId });
      } else if (condominioId) {
        utils.funcionario.list.invalidate({ condominioId });
      }
      onSuccess?.();
    },
    onError: (error) => {
      toast.error("Erro ao cadastrar funcionário: " + error.message);
    },
  });

  const updateMutation = trpc.funcionario.update.useMutation({
    onSuccess: () => {
      toast.success("Funcionário atualizado com sucesso!");
      if (revistaId) {
        utils.funcionario.list.invalidate({ revistaId });
      } else if (condominioId) {
        utils.funcionario.list.invalidate({ condominioId });
      }
      onSuccess?.();
    },
    onError: (error) => {
      toast.error("Erro ao atualizar funcionário: " + error.message);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.nome.trim()) {
      toast.error("O nome do funcionário é obrigatório");
      return;
    }

    if (initialData?.id) {
      updateMutation.mutate({ id: initialData.id, ...formData });
    } else {
      createMutation.mutate({ condominioId, revistaId, ...formData });
    }
  };

  const isLoading = createMutation.isPending || updateMutation.isPending;

  return (
    <form onSubmit={handleSubmit}>
      <Card className="border-0 shadow-none">
        <CardHeader className="px-0 pt-0">
          <CardTitle className="font-serif flex items-center gap-2">
            <Users className="w-5 h-5" />
            {initialData?.id ? "Editar Funcionário" : "Novo Funcionário"}
          </CardTitle>
          <CardDescription>
            Cadastre um funcionário da organização
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 px-0">
          {/* Foto do Funcionário */}
          <div className="flex flex-col items-center gap-4">
            <Label>Foto do Funcionário</Label>
            <ImageUpload
              value={formData.fotoUrl || undefined}
              onChange={(url) => setFormData({ ...formData, fotoUrl: url || "" })}
              folder="funcionarios"
              aspectRatio="portrait"
              placeholder="Carregar foto"
              className="w-40"
            />
            <p className="text-xs text-muted-foreground text-center">
              Recomendado: foto de rosto, proporção 3:4
            </p>
          </div>

          {/* Nome */}
          <div className="space-y-2">
            <Label htmlFor="nome">Nome Completo *</Label>
            <Input
              id="nome"
              placeholder="Ex: Carlos Santos"
              value={formData.nome}
              onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
              required
            />
          </div>

          {/* Cargo */}
          <div className="space-y-2">
            <Label htmlFor="cargo">Cargo</Label>
            <Input
              id="cargo"
              placeholder="Ex: Técnico, Mecânico, Eletricista..."
              value={formData.cargo}
              onChange={(e) => setFormData({ ...formData, cargo: e.target.value })}
            />
          </div>

          {/* Descrição */}
          <div className="space-y-2">
            <Label htmlFor="descricao">Descrição</Label>
            <Textarea
              id="descricao"
              placeholder="Informações adicionais sobre o funcionário..."
              value={formData.descricao}
              onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
              rows={3}
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
                  {initialData?.id ? "Guardar" : "Cadastrar"}
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </form>
  );
}
