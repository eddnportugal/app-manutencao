import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import ImageUpload from "@/components/ImageUpload";
import { trpc } from "@/lib/trpc";
import { toast } from "@/components/ui/sonner";
import { Loader2, MapPin, FileText, Image as ImageIcon, Heart } from "lucide-react";

interface AchadoPerdidoFormProps {
  condominioId: number;
  onSuccess: () => void;
}

export function AchadoPerdidoForm({ condominioId, onSuccess }: AchadoPerdidoFormProps) {
  const [titulo, setTitulo] = useState("");
  const [descricao, setDescricao] = useState("");
  const [localEncontrado, setLocalEncontrado] = useState("");
  const [imagens, setImagens] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const utils = trpc.useUtils();

  const createAchado = trpc.achadoPerdido.create.useMutation({
    onSuccess: async (data) => {
      // Se há imagens, adicionar à tabela de imagens
      if (imagens.length > 0) {
        for (let i = 0; i < imagens.length; i++) {
          await addImagem.mutateAsync({
            achadoPerdidoId: data.id,
            imagemUrl: imagens[i],
            ordem: i,
          });
        }
      }
      toast.success("Item registado com sucesso!");
      utils.achadoPerdido.list.invalidate();
      onSuccess();
    },
    onError: (error) => {
      toast.error("Erro ao registar item: " + error.message);
      setIsSubmitting(false);
    },
  });

  const addImagem = trpc.achadoPerdido.addImagem.useMutation();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!titulo) {
      toast.error("Por favor, preencha o título");
      return;
    }
    setIsSubmitting(true);
    createAchado.mutate({
      condominioId,
      tipo: "achado",
      titulo,
      descricao,
      localEncontrado,
    });
  };

  const handleImageChange = (url: string | undefined) => {
    if (url) {
      setImagens([...imagens, url]);
    }
  };

  const removeImage = (index: number) => {
    setImagens(imagens.filter((_, i) => i !== index));
  };

  return (
    <form onSubmit={handleSubmit} className="p-6 space-y-5 overflow-y-auto max-h-[70vh]">
      {/* Título */}
      <div className="space-y-2">
        <Label className="flex items-center gap-2 text-slate-700">
          <FileText className="w-4 h-4 text-red-500" />
          Título do Item *
        </Label>
        <Input
          value={titulo}
          onChange={(e) => setTitulo(e.target.value)}
          placeholder="Ex: Chaves encontradas"
          className="border-slate-200 focus:border-red-500 focus:ring-red-500/20"
          required
        />
      </div>

      {/* Local Encontrado */}
      <div className="space-y-2">
        <Label className="flex items-center gap-2 text-slate-700">
          <MapPin className="w-4 h-4 text-red-500" />
          Local onde foi achado
        </Label>
        <Input
          value={localEncontrado}
          onChange={(e) => setLocalEncontrado(e.target.value)}
          placeholder="Ex: Área de lazer, próximo à piscina"
          className="border-slate-200 focus:border-red-500 focus:ring-red-500/20"
        />
      </div>

      {/* Descrição */}
      <div className="space-y-2">
        <Label className="flex items-center gap-2 text-slate-700">
          <FileText className="w-4 h-4 text-red-500" />
          Descrição
        </Label>
        <Textarea
          value={descricao}
          onChange={(e) => setDescricao(e.target.value)}
          placeholder="Descreva o item encontrado com detalhes para facilitar a identificação..."
          rows={4}
          className="border-slate-200 focus:border-red-500 focus:ring-red-500/20 resize-none"
        />
      </div>

      {/* Imagens */}
      <div className="space-y-2">
        <Label className="flex items-center gap-2 text-slate-700">
          <ImageIcon className="w-4 h-4 text-red-500" />
          Imagens do Item
        </Label>
        
        {/* Preview das imagens adicionadas */}
        {imagens.length > 0 && (
          <div className="grid grid-cols-3 gap-2 mb-3">
            {imagens.map((img, index) => (
              <div key={index} className="relative group">
                <img
                  src={img}
                  alt={`Imagem ${index + 1}`}
                  className="w-full h-20 object-cover rounded-lg border border-slate-200"
                />
                <button
                  type="button"
                  onClick={() => removeImage(index)}
                  className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white rounded-full text-xs opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}

        <ImageUpload
          onChange={handleImageChange}
          className="border-2 border-dashed border-red-200 hover:border-red-400 rounded-xl p-4 transition-colors"
        />
        <p className="text-xs text-slate-500">
          Adicione fotos do item encontrado para facilitar a identificação
        </p>
      </div>

      {/* Botões */}
      <div className="flex gap-3 pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={onSuccess}
          className="flex-1"
        >
          Cancelar
        </Button>
        <Button
          type="submit"
          disabled={isSubmitting || !titulo}
          className="flex-1 bg-gradient-to-r from-red-500 to-rose-500 hover:from-red-600 hover:to-rose-600 text-white shadow-md shadow-red-500/25"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Registando...
            </>
          ) : (
            <>
              <Heart className="w-4 h-4 mr-2" />
              Registar Item
            </>
          )}
        </Button>
      </div>
    </form>
  );
}
