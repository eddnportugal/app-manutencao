import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { trpc } from "@/lib/trpc";
import { Building2, Loader2, Palette, Save } from "lucide-react";
import { useState } from "react";
import { toast } from "@/components/ui/sonner";
import ImageUpload from "@/components/ImageUpload";

interface CondominioFormProps {
  onSuccess?: (id: number) => void;
  initialData?: {
    id?: number;
    nome?: string;
    endereco?: string;
    cidade?: string;
    estado?: string;
    cep?: string;
    logoUrl?: string;
    bannerUrl?: string;
    corPrimaria?: string;
    corSecundaria?: string;
  };
}

export default function CondominioForm({ onSuccess, initialData }: CondominioFormProps) {
  const [formData, setFormData] = useState({
    nome: initialData?.nome || "",
    endereco: initialData?.endereco || "",
    cidade: initialData?.cidade || "",
    estado: initialData?.estado || "",
    cep: initialData?.cep || "",
    logoUrl: initialData?.logoUrl || "",
    bannerUrl: initialData?.bannerUrl || "",
    corPrimaria: initialData?.corPrimaria || "#4F46E5",
    corSecundaria: initialData?.corSecundaria || "#10B981",
  });

  const utils = trpc.useUtils();

  const createMutation = trpc.condominio.create.useMutation({
    onSuccess: (data) => {
      toast.success("Organização cadastrada com sucesso!");
      utils.condominio.list.invalidate();
      onSuccess?.(data.id);
    },
    onError: (error) => {
      toast.error("Erro ao cadastrar organização: " + error.message);
    },
  });

  const updateMutation = trpc.condominio.update.useMutation({
    onSuccess: () => {
      toast.success("Organização atualizada com sucesso!");
      utils.condominio.list.invalidate();
      if (initialData?.id) {
        utils.condominio.get.invalidate({ id: initialData.id });
      }
    },
    onError: (error) => {
      toast.error("Erro ao atualizar organização: " + error.message);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.nome.trim()) {
      toast.error("O nome da organização é obrigatório");
      return;
    }

    if (initialData?.id) {
      updateMutation.mutate({ id: initialData.id, ...formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const isLoading = createMutation.isPending || updateMutation.isPending;

  return (
    <form onSubmit={handleSubmit}>
      <Card>
        <CardHeader>
          <CardTitle className="font-serif flex items-center gap-2">
            <Building2 className="w-5 h-5" />
            {initialData?.id ? "Editar Organização" : "Cadastrar Organização"}
          </CardTitle>
          <CardDescription>
            Preencha as informações da sua organização
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Logotipo e Banner */}
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label>Logotipo da Organização</Label>
              <ImageUpload
                value={formData.logoUrl || undefined}
                onChange={(url) => setFormData({ ...formData, logoUrl: url || "" })}
                folder="condominios/logos"
                aspectRatio="square"
                placeholder="Carregar logotipo"
              />
              <p className="text-xs text-muted-foreground">
                Recomendado: imagem quadrada, mínimo 200x200px
              </p>
            </div>
            <div className="space-y-2">
              <Label>Banner / Capa</Label>
              <ImageUpload
                value={formData.bannerUrl || undefined}
                onChange={(url) => setFormData({ ...formData, bannerUrl: url || "" })}
                folder="condominios/banners"
                aspectRatio="banner"
                placeholder="Carregar banner"
              />
              <p className="text-xs text-muted-foreground">
                Recomendado: proporção 3:1, mínimo 900x300px
              </p>
            </div>
          </div>

          {/* Nome */}
          <div className="space-y-2">
            <Label htmlFor="nome">Nome da Organização *</Label>
            <Input
              id="nome"
              placeholder="Ex: Residencial Jardins"
              value={formData.nome}
              onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
              required
            />
          </div>

          {/* Endereço */}
          <div className="space-y-2">
            <Label htmlFor="endereco">Endereço</Label>
            <Textarea
              id="endereco"
              placeholder="Rua, número, bairro..."
              value={formData.endereco}
              onChange={(e) => setFormData({ ...formData, endereco: e.target.value })}
              rows={2}
            />
          </div>

          {/* Cidade e Estado */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="cidade">Cidade</Label>
              <Input
                id="cidade"
                placeholder="São Paulo"
                value={formData.cidade}
                onChange={(e) => setFormData({ ...formData, cidade: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="estado">Estado</Label>
              <Input
                id="estado"
                placeholder="SP"
                value={formData.estado}
                onChange={(e) => setFormData({ ...formData, estado: e.target.value })}
              />
            </div>
          </div>

          {/* CEP */}
          <div className="space-y-2">
            <Label htmlFor="cep">CEP</Label>
            <Input
              id="cep"
              placeholder="00000-000"
              value={formData.cep}
              onChange={(e) => setFormData({ ...formData, cep: e.target.value })}
            />
          </div>

          {/* Cores */}
          <div className="space-y-4">
            <Label className="flex items-center gap-2">
              <Palette className="w-4 h-4" />
              Cores da Marca
            </Label>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="corPrimaria" className="text-sm text-muted-foreground">
                  Cor Primária
                </Label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    id="corPrimaria"
                    value={formData.corPrimaria}
                    onChange={(e) => setFormData({ ...formData, corPrimaria: e.target.value })}
                    className="w-10 h-10 rounded-lg border border-border cursor-pointer"
                  />
                  <Input
                    value={formData.corPrimaria}
                    onChange={(e) => setFormData({ ...formData, corPrimaria: e.target.value })}
                    className="flex-1"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="corSecundaria" className="text-sm text-muted-foreground">
                  Cor Secundária
                </Label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    id="corSecundaria"
                    value={formData.corSecundaria}
                    onChange={(e) => setFormData({ ...formData, corSecundaria: e.target.value })}
                    className="w-10 h-10 rounded-lg border border-border cursor-pointer"
                  />
                  <Input
                    value={formData.corSecundaria}
                    onChange={(e) => setFormData({ ...formData, corSecundaria: e.target.value })}
                    className="flex-1"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Submit */}
          <Button type="submit" className="w-full btn-magazine" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                A guardar...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                {initialData?.id ? "Guardar Alterações" : "Cadastrar Organização"}
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    </form>
  );
}
