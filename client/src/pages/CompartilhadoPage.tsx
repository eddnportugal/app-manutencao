import { useEffect, useState } from "react";
import { useParams } from "wouter";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, CheckCircle2, AlertCircle, FileText, Wrench, AlertTriangle, ClipboardCheck, ArrowLeftRight, Briefcase, ListTodo, Calendar, User, MapPin, Clock } from "lucide-react";

export default function CompartilhadoPage() {
  const { token } = useParams<{ token: string }>();
  const [registado, setRegistado] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [dadosItem, setDadosItem] = useState<{
    tipoItem: string;
    itemId: number;
    itemTitulo: string | null;
    itemProtocolo?: string | null;
    remetenteNome?: string | null;
  } | null>(null);

  // Registar visualização
  const registarVisualizacao = trpc.membroEquipe.registarVisualizacao.useMutation({
    onSuccess: (data) => {
      if (data.sucesso) {
        setRegistado(true);
        setDadosItem(data.compartilhamento || null);
      } else {
        setErro(data.erro || "Erro ao carregar compartilhamento");
      }
    },
    onError: (error) => {
      setErro(error.message);
    },
  });

  useEffect(() => {
    if (token && !registado && !erro) {
      registarVisualizacao.mutate({
        token,
        userAgent: navigator.userAgent,
      });
    }
  }, [token]);

  const getTipoIcon = (tipo: string) => {
    switch (tipo) {
      case "vistoria": return <FileText className="h-8 w-8" />;
      case "manutencao": return <Wrench className="h-8 w-8" />;
      case "ocorrencia": return <AlertTriangle className="h-8 w-8" />;
      case "checklist": return <ClipboardCheck className="h-8 w-8" />;
      case "antes_depois": return <ArrowLeftRight className="h-8 w-8" />;
      case "ordem_servico": return <Briefcase className="h-8 w-8" />;
      case "tarefa_simples": return <ListTodo className="h-8 w-8" />;
      default: return <FileText className="h-8 w-8" />;
    }
  };

  const getTipoLabel = (tipo: string) => {
    switch (tipo) {
      case "vistoria": return "Vistoria";
      case "manutencao": return "Manutenção";
      case "ocorrencia": return "Ocorrência";
      case "checklist": return "Checklist";
      case "antes_depois": return "Antes e Depois";
      case "ordem_servico": return "Ordem de Serviço";
      case "tarefa_simples": return "Tarefa";
      default: return "Item";
    }
  };

  const getTipoColor = (tipo: string) => {
    switch (tipo) {
      case "vistoria": return "from-blue-500 to-blue-600";
      case "manutencao": return "from-orange-500 to-orange-600";
      case "ocorrencia": return "from-red-500 to-red-600";
      case "checklist": return "from-green-500 to-green-600";
      case "antes_depois": return "from-purple-500 to-purple-600";
      case "ordem_servico": return "from-indigo-500 to-indigo-600";
      case "tarefa_simples": return "from-teal-500 to-teal-600";
      default: return "from-gray-500 to-gray-600";
    }
  };

  // Loading
  if (registarVisualizacao.isPending) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Loader2 className="h-12 w-12 animate-spin text-orange-500 mb-4" />
            <p className="text-gray-600 text-lg">A carregar compartilhamento...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Erro
  if (erro) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-md border-red-200">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mb-4">
              <AlertCircle className="h-8 w-8 text-red-500" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Link Inválido</h2>
            <p className="text-gray-600 text-center">{erro}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Sucesso
  if (registado && dadosItem) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-lg overflow-hidden">
          {/* Header com gradiente */}
          <div className={`bg-gradient-to-r ${getTipoColor(dadosItem.tipoItem)} p-6 text-white`}>
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center">
                {getTipoIcon(dadosItem.tipoItem)}
              </div>
              <div>
                <Badge variant="secondary" className="bg-white/20 text-white border-0 mb-2">
                  {getTipoLabel(dadosItem.tipoItem)}
                </Badge>
                <h1 className="text-xl font-bold">{dadosItem.itemTitulo}</h1>
              </div>
            </div>
          </div>

          <CardContent className="p-6">
            {/* Confirmação de visualização */}
            <div className="flex items-center gap-3 p-4 bg-green-50 rounded-lg border border-green-200 mb-6">
              <CheckCircle2 className="h-6 w-6 text-green-500 flex-shrink-0" />
              <div>
                <p className="font-medium text-green-800">Visualização registada</p>
                <p className="text-sm text-green-600">O remetente foi notificado da sua visualização.</p>
              </div>
            </div>

            {/* Detalhes */}
            <div className="space-y-4">
              {dadosItem.itemProtocolo && (
                <div className="flex items-center gap-3 text-gray-600">
                  <FileText className="h-5 w-5 text-gray-400" />
                  <span>Protocolo: <strong>{dadosItem.itemProtocolo}</strong></span>
                </div>
              )}
              
              {dadosItem.remetenteNome && (
                <div className="flex items-center gap-3 text-gray-600">
                  <User className="h-5 w-5 text-gray-400" />
                  <span>Compartilhado por: <strong>{dadosItem.remetenteNome}</strong></span>
                </div>
              )}

              <div className="flex items-center gap-3 text-gray-600">
                <Clock className="h-5 w-5 text-gray-400" />
                <span>Visualizado em: <strong>{new Date().toLocaleString("pt-BR")}</strong></span>
              </div>
            </div>

            {/* Mensagem informativa */}
            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600 text-center">
                Para ver todos os detalhes deste item, aceda ao App Manutenção com as suas credenciais.
              </p>
            </div>
          </CardContent>

          {/* Footer */}
          <div className="border-t px-6 py-4 bg-gray-50">
            <p className="text-xs text-gray-500 text-center">
              App Manutenção - Sistema de Gestão de Manutenção
            </p>
          </div>
        </Card>
      </div>
    );
  }

  return null;
}
