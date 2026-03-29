import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Video, 
  Users, 
  Calendar,
  Play,
  Building2,
  Clock,
  ExternalLink,
  AlertCircle
} from "lucide-react";
import { trpc } from "@/lib/trpc";
import { useParams } from "wouter";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export default function AssembleiaPublica() {
  const { id } = useParams<{ id: string }>();
  const condominioId = parseInt(id || "0");

  // @ts-ignore - TypeScript não reconhece o método ainda
  const { data: assembleia, isLoading, error } = trpc.condominio.getAssembleiaLink.useQuery(
    { id: condominioId },
    { enabled: condominioId > 0 }
  );

  const handleAcessarAssembleia = () => {
    if (assembleia?.assembleiaLink) {
      window.open(assembleia.assembleiaLink, '_blank');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-indigo-50 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-purple-100 flex items-center justify-center animate-pulse">
            <Video className="w-8 h-8 text-purple-600" />
          </div>
          <p className="text-gray-600">Carregando informações da assembleia...</p>
        </div>
      </div>
    );
  }

  if (error || !assembleia) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-indigo-50 flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardContent className="p-8 text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-100 flex items-center justify-center">
              <AlertCircle className="w-8 h-8 text-red-600" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Assembleia não encontrada</h2>
            <p className="text-gray-600">
              O link da assembleia pode estar incorreto ou a assembleia não está mais disponível.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!assembleia.assembleiaLink) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-indigo-50 flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardContent className="p-8 text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-amber-100 flex items-center justify-center">
              <Clock className="w-8 h-8 text-amber-600" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Assembleia ainda não agendada</h2>
            <p className="text-gray-600 mb-4">
              O gestor ainda não configurou o link da assembleia online. Por favor, aguarde ou entre em contato com a administração.
            </p>
            <Badge variant="outline" className="text-amber-700 border-amber-300 bg-amber-50">
              {assembleia.nome}
            </Badge>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-indigo-50 flex items-center justify-center p-4">
      <Card className="max-w-lg w-full overflow-hidden border-0 shadow-2xl">
        {/* Header com Gradiente */}
        <div className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white p-8">
          <div className="text-center">
            {assembleia.logoUrl ? (
              <img 
                src={assembleia.logoUrl} 
                alt={assembleia.nome}
                className="w-20 h-20 mx-auto mb-4 rounded-2xl object-cover bg-white/20 p-1"
              />
            ) : (
              <div className="w-20 h-20 mx-auto mb-4 rounded-2xl bg-white/20 flex items-center justify-center">
                <Building2 className="w-10 h-10" />
              </div>
            )}
            <h1 className="text-2xl font-bold mb-2">{assembleia.nome}</h1>
            <div className="flex items-center justify-center gap-2 text-white/80">
              <Video className="w-5 h-5" />
              <span>Assembleia Online</span>
            </div>
          </div>
        </div>

        <CardContent className="p-8 space-y-6">
          {/* Informações da Assembleia */}
          <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl p-6 border border-purple-100">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center">
                <Users className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <h3 className="font-semibold text-purple-900">Assembleia Virtual</h3>
                <p className="text-sm text-purple-700">Com gravação e até 500 participantes</p>
              </div>
            </div>
            
            {assembleia.assembleiaData && (
              <div className="flex items-center gap-3 text-purple-700 bg-white rounded-lg p-3 border border-purple-100">
                <Calendar className="w-5 h-5" />
                <div>
                  <p className="text-xs text-purple-600">Data Agendada</p>
                  <p className="font-semibold">
                    {format(new Date(assembleia.assembleiaData), "EEEE, dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Botão de Acessar em Destaque */}
          <Button
            onClick={handleAcessarAssembleia}
            className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white h-16 text-xl font-bold shadow-lg hover:shadow-xl transition-all rounded-xl"
          >
            <Play className="w-7 h-7 mr-3" />
            Entrar na Assembleia
          </Button>

          {/* Link alternativo */}
          <div className="text-center">
            <p className="text-sm text-gray-500 mb-2">Ou acesse diretamente pelo link:</p>
            <a 
              href={assembleia.assembleiaLink}
              target="_blank"
              rel="noopener noreferrer"
              className="text-purple-600 hover:text-purple-800 text-sm flex items-center justify-center gap-1 underline"
            >
              <ExternalLink className="w-4 h-4" />
              Abrir link em nova aba
            </a>
          </div>

          {/* Instruções */}
          <div className="bg-gray-50 rounded-xl p-4 border">
            <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-gray-600" />
              Instruções para participar
            </h4>
            <ul className="space-y-2 text-sm text-gray-600">
              <li className="flex items-start gap-2">
                <span className="w-5 h-5 rounded-full bg-purple-100 text-purple-700 flex items-center justify-center text-xs font-bold flex-shrink-0">1</span>
                <span>Clique no botão "Entrar na Assembleia"</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-5 h-5 rounded-full bg-purple-100 text-purple-700 flex items-center justify-center text-xs font-bold flex-shrink-0">2</span>
                <span>Permita o acesso à câmera e microfone quando solicitado</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-5 h-5 rounded-full bg-purple-100 text-purple-700 flex items-center justify-center text-xs font-bold flex-shrink-0">3</span>
                <span>Informe seu nome e apartamento para identificação</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-5 h-5 rounded-full bg-purple-100 text-purple-700 flex items-center justify-center text-xs font-bold flex-shrink-0">4</span>
                <span>Aguarde a aprovação do gestor para entrar na sala</span>
              </li>
            </ul>
          </div>
        </CardContent>

        {/* Footer */}
        <div className="bg-gray-50 px-8 py-4 border-t text-center">
          <p className="text-xs text-gray-500">
            Powered by <span className="font-semibold text-purple-600">App Manutenção</span>
          </p>
        </div>
      </Card>
    </div>
  );
}
