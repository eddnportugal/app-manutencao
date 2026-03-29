import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/sonner";
import { MessageCircle, Mail, Printer, Copy, Check, ExternalLink, Info } from "lucide-react";

interface EnvioMulticanalModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  // Dados do destinatário
  destinatario: {
    nome: string;
    whatsapp?: string | null;
    email?: string | null;
    bloco?: string | null;
    apartamento: string;
  };
  // Dados da notificação
  notificacao: {
    titulo: string;
    descricao?: string;
    linkPublico: string;
  };
  // Dados da organização
  condominio: {
    nome: string;
  };
  // Callbacks
  onWhatsappSent?: () => void;
  onPrint?: () => void;
  // URL base para o link público
  baseUrl?: string;
}

export function EnvioMulticanalModal({
  open,
  onOpenChange,
  destinatario,
  notificacao,
  condominio,
  onWhatsappSent,
  onPrint,
  baseUrl = window.location.origin,
}: EnvioMulticanalModalProps) {
  const [copied, setCopied] = useState(false);

  // Gerar link público completo
  const linkPublico = `${baseUrl}/notificacao/${notificacao.linkPublico}`;

  // Formatar número de WhatsApp (remover caracteres não numéricos e adicionar código do país)
  const formatWhatsappNumber = (numero: string | null | undefined): string => {
    if (!numero) return "";
    const cleaned = numero.replace(/\D/g, "");
    // Se não começar com 55 (Brasil), adicionar
    if (!cleaned.startsWith("55") && cleaned.length <= 11) {
      return `55${cleaned}`;
    }
    return cleaned;
  };

  // Gerar mensagem para WhatsApp
  const gerarMensagemWhatsapp = (): string => {
    const mensagem = `Olá ${destinatario.nome},

Você recebeu uma notificação do *${condominio.nome}*.

*Assunto:* ${notificacao.titulo}

Acesse o link abaixo para visualizar os detalhes e responder:
${linkPublico}

Atenciosamente,
Administração do Condomínio`;

    return encodeURIComponent(mensagem);
  };

  // Abrir WhatsApp
  const handleWhatsapp = () => {
    const numero = formatWhatsappNumber(destinatario.whatsapp);
    if (!numero) {
      toast.error("Número de WhatsApp não cadastrado para este usuário");
      return;
    }

    const mensagem = gerarMensagemWhatsapp();
    const url = `https://wa.me/${numero}?text=${mensagem}`;
    window.open(url, "_blank");
    
    onWhatsappSent?.();
    toast.success("WhatsApp aberto! Envie a mensagem para o usuário.");
  };

  // Gerar mailto
  const handleEmail = () => {
    if (!destinatario.email) {
      toast.error("Email não cadastrado para este usuário");
      return;
    }

    const assunto = encodeURIComponent(`Notificação - ${notificacao.titulo} - ${condominio.nome}`);
    const corpo = encodeURIComponent(`Olá ${destinatario.nome},

Você recebeu uma notificação do ${condominio.nome}.

Assunto: ${notificacao.titulo}

Acesse o link abaixo para visualizar os detalhes e responder:
${linkPublico}

Atenciosamente,
Administração do Condomínio`);

    const url = `mailto:${destinatario.email}?subject=${assunto}&body=${corpo}`;
    window.location.href = url;
    
    toast.success("Cliente de email aberto!");
  };

  // Imprimir/Baixar PDF
  const handlePrint = () => {
    onPrint?.();
    toast.success("Preparando impressão...");
  };

  // Copiar link
  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(linkPublico);
      setCopied(true);
      toast.success("Link copiado para a área de transferência!");
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast.error("Erro ao copiar link");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[92vw] max-w-sm p-0 overflow-hidden">
        <div className="bg-gradient-to-r from-green-500 to-emerald-500 px-4 py-3">
          <DialogHeader className="space-y-1">
            <DialogTitle className="flex items-center gap-2 text-white text-lg">
              <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
                <Check className="h-5 w-5 text-white" />
              </div>
              Notificação Registrada!
            </DialogTitle>
            <DialogDescription className="text-green-100">
              Escolha como deseja enviar a notificação para o usuário
            </DialogDescription>
          </DialogHeader>
        </div>

        <div className="space-y-3 p-4">
          {/* Mensagem informativa */}
          <div className="bg-blue-50 dark:bg-blue-950 p-3 rounded-lg border border-blue-200 dark:border-blue-800">
            <p className="text-sm text-blue-700 dark:text-blue-300 flex items-start gap-2">
              <Info className="h-4 w-4 mt-0.5 flex-shrink-0" />
              <span>
                O sistema já enviou a notificação automaticamente por email. 
                Caso o usuário não tenha recebido, reenvie pelas opções abaixo.
              </span>
            </p>
          </div>

          {/* Card do destinatário */}
          <div className="bg-gray-50 dark:bg-gray-900 p-3 rounded-lg border">
            <p className="text-sm font-medium">{destinatario.nome}</p>
            <p className="text-xs text-gray-500">
              {destinatario.bloco ? `Bloco ${destinatario.bloco} - ` : ""}
              Apto {destinatario.apartamento}
            </p>
            {destinatario.whatsapp && (
              <p className="text-xs text-gray-500">WhatsApp: {destinatario.whatsapp}</p>
            )}
            {destinatario.email && (
              <p className="text-xs text-gray-500">Email: {destinatario.email}</p>
            )}
          </div>

          {/* Botões de ação */}
          <div className="grid grid-cols-2 gap-3">
            {/* WhatsApp */}
            <Button
              variant="outline"
              className="flex flex-col items-center gap-2 h-auto py-4 hover:bg-green-50 hover:border-green-300 hover:text-green-700"
              onClick={handleWhatsapp}
              disabled={!destinatario.whatsapp}
            >
              <MessageCircle className="h-6 w-6 text-green-600" />
              <span className="text-xs">Enviar via WhatsApp</span>
            </Button>

            {/* Email (mailto) */}
            <Button
              variant="outline"
              className="flex flex-col items-center gap-2 h-auto py-4 hover:bg-blue-50 hover:border-blue-300 hover:text-blue-700"
              onClick={handleEmail}
              disabled={!destinatario.email}
            >
              <Mail className="h-6 w-6 text-blue-600" />
              <span className="text-xs">Reenviar E-mail</span>
            </Button>

            {/* Imprimir */}
            <Button
              variant="outline"
              className="flex flex-col items-center gap-2 h-auto py-4 hover:bg-purple-50 hover:border-purple-300 hover:text-purple-700"
              onClick={handlePrint}
            >
              <Printer className="h-6 w-6 text-purple-600" />
              <span className="text-xs">Imprimir</span>
            </Button>

            {/* Copiar Link */}
            <Button
              variant="outline"
              className="flex flex-col items-center gap-2 h-auto py-4 hover:bg-amber-50 hover:border-amber-300 hover:text-amber-700"
              onClick={handleCopyLink}
            >
              {copied ? (
                <Check className="h-6 w-6 text-green-600" />
              ) : (
                <Copy className="h-6 w-6 text-amber-600" />
              )}
              <span className="text-xs">{copied ? "Copiado!" : "Copiar Link"}</span>
            </Button>
          </div>

          {/* Link público */}
          <div className="bg-gray-100 dark:bg-gray-800 p-2 rounded-lg">
            <p className="text-xs text-gray-500 mb-1">Link para resposta:</p>
            <a 
              href={linkPublico} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-xs text-blue-600 hover:underline flex items-center gap-1 break-all"
            >
              {linkPublico}
              <ExternalLink className="h-3 w-3 flex-shrink-0" />
            </a>
          </div>

        </div>
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200">
          <Button 
            className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600" 
            onClick={() => onOpenChange(false)}
          >
            Concluir
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
