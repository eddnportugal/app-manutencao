import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { toast } from "@/components/ui/sonner";
import { Share2, Copy, MessageCircle, Link, Lock, Unlock, Check, User, Phone, ExternalLink } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  tipo: "vistoria" | "manutencao" | "ocorrencia" | "checklist" | "ordem-servico";
  itemId: number;
  itemTitulo: string;
  itemProtocolo: string;
  condominioId: number;
}

export function ShareModal({ isOpen, onClose, tipo, itemId, itemTitulo, itemProtocolo, condominioId }: ShareModalProps) {
  
  const [editavel, setEditavel] = useState(false);
  const [linkGerado, setLinkGerado] = useState<{ token: string; id: number } | null>(null);
  const [selectedMembro, setSelectedMembro] = useState<number | null>(null);
  const [copied, setCopied] = useState(false);

  const { data: membros } = trpc.membroEquipe.list.useQuery({ condominioId });
  
  const createLinkMutation = trpc.linkCompartilhavel.create.useMutation({
    onSuccess: (data) => {
      setLinkGerado({ token: data.token, id: data.id });
      toast.success("Link gerado com sucesso!");
    },
    onError: () => toast.error("Erro ao gerar link"),
  });

  const compartilharMutation = trpc.linkCompartilhavel.compartilhar.useMutation({
    onSuccess: (data) => {
      if (data.whatsapp) {
        const phone = formatWhatsApp(data.whatsapp);
        const url = `${window.location.origin}/compartilhado/${tipo}/${data.token}`;
        const message = encodeURIComponent(
          `*${getTipoLabel(tipo)}*\n\n` +
          `${itemTitulo}\n` +
          `Protocolo: ${itemProtocolo}\n\n` +
          `Acesse: ${url}\n\n` +
          `${editavel ? "Este link permite edição" : "Este link é apenas para visualização"}`
        );
        window.open(`https://wa.me/${phone}?text=${message}`, "_blank");
      }
      toast.success("Compartilhado com sucesso!");
      onClose();
    },
    onError: () => toast.error("Erro ao compartilhar"),
  });

  const handleGerarLink = () => {
    createLinkMutation.mutate({
      condominioId,
      tipo,
      itemId,
      editavel,
    });
  };

  const handleCompartilhar = (membroId: number) => {
    if (!linkGerado) return;
    compartilharMutation.mutate({
      linkId: linkGerado.id,
      membroId,
    });
  };

  const handleCopyLink = () => {
    if (!linkGerado) return;
    const url = `${window.location.origin}/compartilhado/${tipo}/${linkGerado.token}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast.success("Link copiado!");
  };

  const formatWhatsApp = (phone: string) => {
    const cleaned = phone.replace(/\D/g, "");
    return cleaned.startsWith("55") ? cleaned : `55${cleaned}`;
  };

  const getTipoLabel = (t: string) => {
    const labels: Record<string, string> = {
      vistoria: "Vistoria",
      manutencao: "Manutenção",
      ocorrencia: "Ocorrência",
      checklist: "Checklist",
      "ordem-servico": "Ordem de Serviço",
    };
    return labels[t] || t;
  };

  const getTipoColor = (t: string) => {
    const colors: Record<string, string> = {
      vistoria: "from-blue-500 to-indigo-500",
      manutencao: "from-amber-500 to-orange-500",
      ocorrencia: "from-red-500 to-rose-500",
      checklist: "from-emerald-500 to-teal-500",
      "ordem-servico": "from-orange-500 to-amber-500",
    };
    return colors[t] || "from-gray-500 to-slate-500";
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-[92vw] max-w-sm max-h-[85vh] overflow-hidden p-0">
        <div className={`bg-gradient-to-r ${getTipoColor(tipo)} px-4 py-3`}>
          <DialogHeader className="space-y-1">
            <DialogTitle className="flex items-center gap-2 text-white text-lg">
              <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
                <Share2 className="w-5 h-5 text-white" />
              </div>
              Compartilhar {getTipoLabel(tipo)}
            </DialogTitle>
          </DialogHeader>
        </div>

        <div className="space-y-4 p-4 overflow-y-auto max-h-[55vh]">
          {/* Info do Item */}
          <Card className="border-0 bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-900">
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="font-semibold">{itemTitulo}</h4>
                  <p className="text-sm text-muted-foreground">Protocolo: {itemProtocolo}</p>
                </div>
                <Badge className={`bg-gradient-to-r ${getTipoColor(tipo)} text-white border-0`}>
                  {getTipoLabel(tipo)}
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Permissões */}
          <div className="flex items-center justify-between p-4 rounded-lg border bg-white dark:bg-slate-900">
            <div className="flex items-center gap-3">
              {editavel ? (
                <div className="p-2 rounded-full bg-amber-100 dark:bg-amber-900/30">
                  <Unlock className="w-5 h-5 text-amber-600" />
                </div>
              ) : (
                <div className="p-2 rounded-full bg-emerald-100 dark:bg-emerald-900/30">
                  <Lock className="w-5 h-5 text-emerald-600" />
                </div>
              )}
              <div>
                <Label htmlFor="editavel" className="font-medium cursor-pointer">
                  {editavel ? "Link Editável" : "Apenas Visualização"}
                </Label>
                <p className="text-sm text-muted-foreground">
                  {editavel 
                    ? "Qualquer pessoa com o link pode editar" 
                    : "Apenas membros da equipe podem editar"}
                </p>
              </div>
            </div>
            <Switch
              id="editavel"
              checked={editavel}
              onCheckedChange={setEditavel}
              disabled={!!linkGerado}
            />
          </div>

          {/* Mensagem Explicativa */}
          <div className="p-4 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
            <h4 className="font-semibold text-blue-800 dark:text-blue-300 mb-2 flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Como funciona o compartilhamento?
            </h4>
            <div className="text-sm text-blue-700 dark:text-blue-400 space-y-2">
              {editavel ? (
                <>
                  <p>
                    <strong>Link Editável:</strong> Quem receber este link poderá visualizar e editar todas as informações do item, incluindo:
                  </p>
                  <ul className="list-disc list-inside ml-2 space-y-1">
                    <li>Alterar status (Pendente, Realizada, Ação Necessária, etc.)</li>
                    <li>Adicionar comentários e anexar ficheiros</li>
                    <li>Atualizar observações e informações</li>
                    <li>Registar eventos na timeline</li>
                  </ul>
                  <p className="text-amber-600 dark:text-amber-400 mt-2">
                    ⚠️ <strong>Atenção:</strong> Use com cuidado! Qualquer pessoa com este link terá permissão total de edição.
                  </p>
                </>
              ) : (
                <>
                  <p>
                    <strong>Apenas Visualização:</strong> Quem receber este link poderá apenas visualizar as informações do item, sem possibilidade de edição.
                  </p>
                  <ul className="list-disc list-inside ml-2 space-y-1">
                    <li>Ver todos os detalhes e informações</li>
                    <li>Consultar a timeline de eventos</li>
                    <li>Visualizar comentários e anexos</li>
                    <li>Adicionar novos comentários (se permitido)</li>
                  </ul>
                  <p className="text-emerald-600 dark:text-emerald-400 mt-2">
                    ✅ <strong>Seguro:</strong> O destinatário não poderá modificar nenhuma informação existente.
                  </p>
                </>
              )}
            </div>
          </div>

          {/* Gerar Link */}
          {!linkGerado ? (
            <Button 
              onClick={handleGerarLink}
              className={`w-full bg-gradient-to-r ${getTipoColor(tipo)} hover:opacity-90 shadow-lg`}
              disabled={createLinkMutation.isPending}
            >
              <Link className="w-4 h-4 mr-2" />
              Gerar Link de Compartilhamento
            </Button>
          ) : (
            <>
              {/* Link Gerado */}
              <div className="p-4 rounded-lg border-2 border-dashed border-emerald-300 bg-emerald-50 dark:bg-emerald-900/20 dark:border-emerald-700">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-emerald-700 dark:text-emerald-400">
                    Link gerado com sucesso!
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleCopyLink}
                    className="text-emerald-600 hover:text-emerald-700 hover:bg-emerald-100"
                  >
                    {copied ? (
                      <>
                        <Check className="w-4 h-4 mr-1" />
                        Copiado!
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4 mr-1" />
                        Copiar
                      </>
                    )}
                  </Button>
                </div>
                <code className="text-xs text-emerald-800 dark:text-emerald-300 break-all">
                  {window.location.origin}/compartilhado/{tipo}/{linkGerado.token}
                </code>
              </div>

              {/* Selecionar Membro */}
              <div className="space-y-3">
                <Label className="text-base font-semibold">
                  Enviar via WhatsApp para:
                </Label>
                
                {membros && membros.length > 0 ? (
                  <div className="grid gap-2 max-h-48 overflow-y-auto">
                    {membros.map((membro) => (
                      <button
                        key={membro.id}
                        onClick={() => setSelectedMembro(membro.id)}
                        className={`flex items-center gap-3 p-3 rounded-lg border transition-all ${
                          selectedMembro === membro.id
                            ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-900/30"
                            : "border-slate-200 hover:border-slate-300 dark:border-slate-700"
                        }`}
                      >
                        {membro.fotoUrl ? (
                          <img
                            src={membro.fotoUrl}
                            alt={membro.nome}
                            className="w-10 h-10 rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center text-white font-semibold">
                            {membro.nome.charAt(0).toUpperCase()}
                          </div>
                        )}
                        <div className="flex-1 text-left">
                          <p className="font-medium">{membro.nome}</p>
                          <p className="text-sm text-muted-foreground flex items-center gap-1">
                            <Phone className="w-3 h-3" />
                            {membro.whatsapp}
                          </p>
                        </div>
                        {selectedMembro === membro.id && (
                          <Check className="w-5 h-5 text-emerald-500" />
                        )}
                      </button>
                    ))}
                  </div>
                ) : (
                  <Card className="border-dashed">
                    <CardContent className="p-4 text-center">
                      <User className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                      <p className="text-sm text-muted-foreground">
                        Nenhum membro cadastrado. Adicione membros da equipe para compartilhar via WhatsApp.
                      </p>
                    </CardContent>
                  </Card>
                )}
              </div>

              {/* Botões de Ação */}
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => {
                    const url = `${window.location.origin}/compartilhado/${tipo}/${linkGerado.token}`;
                    window.open(url, "_blank");
                  }}
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Abrir Link
                </Button>
                <Button
                  className="flex-1 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600"
                  disabled={!selectedMembro || compartilharMutation.isPending}
                  onClick={() => selectedMembro && handleCompartilhar(selectedMembro)}
                >
                  <MessageCircle className="w-4 h-4 mr-2" />
                  Enviar WhatsApp
                </Button>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
