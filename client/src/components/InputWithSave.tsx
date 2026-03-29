import { useState, useRef, useEffect } from "react";
import { trpc } from "@/lib/trpc";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { toast } from "@/components/ui/sonner";
import { Plus, Check, X, ChevronDown, Trash2 } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

type TipoValor = 
  | "responsavel"
  | "categoria_vistoria"
  | "categoria_manutencao"
  | "categoria_checklist"
  | "categoria_ocorrencia"
  | "tipo_vistoria"
  | "tipo_manutencao"
  | "tipo_checklist"
  | "tipo_ocorrencia"
  | "fornecedor"
  | "localizacao"
  | "titulo_vistoria"
  | "subtitulo_vistoria"
  | "descricao_vistoria"
  | "observacoes_vistoria"
  | "titulo_manutencao"
  | "subtitulo_manutencao"
  | "descricao_manutencao"
  | "observacoes_manutencao"
  | "titulo_ocorrencia"
  | "subtitulo_ocorrencia"
  | "descricao_ocorrencia"
  | "observacoes_ocorrencia"
  | "titulo_antesdepois"
  | "descricao_antesdepois";

interface InputWithSaveProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  condominioId: number;
  tipo: TipoValor;
  placeholder?: string;
  className?: string;
  multiline?: boolean;
  rows?: number;
}

export default function InputWithSave({
  label,
  value,
  onChange,
  condominioId,
  tipo,
  placeholder,
  className = "",
  multiline = false,
  rows = 3,
}: InputWithSaveProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [showSaveConfirm, setShowSaveConfirm] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const utils = trpc.useUtils();

  // Buscar valores salvos
  const { data: valoresSalvos = [] } = trpc.valoresSalvos.list.useQuery(
    { condominioId, tipo },
    { enabled: !!condominioId }
  );

  // Mutation para criar novo valor
  const createMutation = trpc.valoresSalvos.create.useMutation({
    onSuccess: (result) => {
      if (result.isNew) {
        toast.success("Valor salvo para reutilização!");
      } else {
        toast.info("Este valor já estava salvo");
      }
      setShowSaveConfirm(false);
      utils.valoresSalvos.list.invalidate();
    },
    onError: () => toast.error("Erro ao salvar valor"),
  });

  // Mutation para excluir valor
  const deleteMutation = trpc.valoresSalvos.delete.useMutation({
    onSuccess: () => {
      toast.success("Valor removido!");
      utils.valoresSalvos.list.invalidate();
    },
    onError: () => toast.error("Erro ao remover valor"),
  });

  const handleSaveValue = () => {
    if (!value.trim()) {
      toast.error("Digite um valor para salvar");
      return;
    }
    createMutation.mutate({
      condominioId,
      tipo,
      valor: value.trim(),
    });
  };

  const handleSelectValue = (selectedValue: string) => {
    onChange(selectedValue);
    setIsOpen(false);
  };

  const handleDeleteValue = (e: React.MouseEvent, id: number) => {
    e.stopPropagation();
    if (confirm("Remover este valor da lista?")) {
      deleteMutation.mutate({ id });
    }
  };

  // Filtrar valores salvos baseado no input atual
  const filteredValues = valoresSalvos.filter(
    (v) => v.valor.toLowerCase().includes(value.toLowerCase())
  );

  return (
    <div className={`space-y-1 ${className}`}>
      <Label className="text-sm font-medium">{label}</Label>
      <div className="flex gap-1">
        {/* Input com dropdown */}
        <Popover open={isOpen} onOpenChange={setIsOpen}>
          <PopoverTrigger asChild>
            <div className="relative flex-1">
              {multiline ? (
                <Textarea
                  value={value}
                  onChange={(e) => onChange(e.target.value)}
                  placeholder={placeholder || `Digite ou selecione ${label.toLowerCase()}...`}
                  className="pr-8 resize-none"
                  rows={rows}
                  onFocus={() => setIsOpen(true)}
                />
              ) : (
                <Input
                  ref={inputRef}
                  value={value}
                  onChange={(e) => onChange(e.target.value)}
                  placeholder={placeholder || `Digite ou selecione ${label.toLowerCase()}...`}
                  className="pr-8"
                  onFocus={() => setIsOpen(true)}
                />
              )}
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className={`absolute right-0 ${multiline ? 'top-1' : 'top-0 h-full'} px-2 hover:bg-transparent`}
                onClick={() => setIsOpen(!isOpen)}
              >
                <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform ${isOpen ? 'rotate-180' : ''}`} />
              </Button>
            </div>
          </PopoverTrigger>
          <PopoverContent 
            className="p-0 w-[var(--radix-popover-trigger-width)]" 
            align="start"
            onOpenAutoFocus={(e) => e.preventDefault()}
          >
            <div className="max-h-60 overflow-y-auto">
              {filteredValues.length === 0 ? (
                <div className="p-3 text-sm text-muted-foreground text-center">
                  {value ? "Nenhum valor encontrado" : "Nenhum valor salvo ainda"}
                </div>
              ) : (
                <div className="py-1">
                  {filteredValues.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between px-3 py-2 hover:bg-muted cursor-pointer group"
                      onClick={() => handleSelectValue(item.valor)}
                    >
                      <span className="text-sm">{item.valor}</span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 text-destructive hover:text-destructive hover:bg-destructive/10"
                        onClick={(e) => handleDeleteValue(e, item.id)}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </PopoverContent>
        </Popover>

        {/* Botão de salvar */}
        {showSaveConfirm ? (
          <div className="flex gap-1">
            <Button
              type="button"
              size="icon"
              variant="outline"
              className="h-9 w-9 text-green-600 border-green-300 hover:bg-green-50"
              onClick={handleSaveValue}
              disabled={createMutation.isPending}
            >
              <Check className="h-4 w-4" />
            </Button>
            <Button
              type="button"
              size="icon"
              variant="outline"
              className="h-9 w-9 text-red-600 border-red-300 hover:bg-red-50"
              onClick={() => setShowSaveConfirm(false)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        ) : (
          <Button
            type="button"
            size="icon"
            variant="outline"
            className="h-9 w-9 text-blue-600 border-blue-300 hover:bg-blue-50"
            onClick={() => {
              if (!value.trim()) {
                toast.error("Digite um valor para salvar");
                return;
              }
              setShowSaveConfirm(true);
            }}
            title="Salvar para reutilizar"
          >
            <Plus className="h-4 w-4" />
          </Button>
        )}
      </div>
      {showSaveConfirm && (
        <p className="text-xs text-blue-600">
          Salvar "{value}" para reutilizar depois?
        </p>
      )}
    </div>
  );
}
