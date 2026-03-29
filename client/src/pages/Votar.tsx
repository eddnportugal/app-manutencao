import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getLoginUrl } from "@/const";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { useParams, useLocation } from "wouter";
import { useState, useEffect, useMemo } from "react";
import { toast } from "@/components/ui/sonner";
import { 
  Vote, 
  CheckCircle, 
  LogIn, 
  Users, 
  Calendar,
  Trophy,
  HelpCircle,
  Gavel,
  Loader2,
  ArrowLeft,
  Share2,
  BarChart3,
  Ban,
  Phone,
  MessageCircle
} from "lucide-react";
import { Link } from "wouter";

// Componente de gráfico de barras simples
function BarChart({ opcoes, totalVotos }: { opcoes: Array<{ id: number; titulo: string; votos: number | null }>; totalVotos: number }) {
  const maxVotos = Math.max(...opcoes.map(o => o.votos || 0), 1);
  
  return (
    <div className="space-y-3">
      {opcoes.map((opcao, index) => {
        const percentagem = totalVotos > 0 ? Math.round(((opcao.votos || 0) / totalVotos) * 100) : 0;
        const largura = totalVotos > 0 ? ((opcao.votos || 0) / maxVotos) * 100 : 0;
        const cores = [
          'bg-blue-500',
          'bg-green-500',
          'bg-yellow-500',
          'bg-purple-500',
          'bg-pink-500',
          'bg-indigo-500',
          'bg-red-500',
          'bg-orange-500',
        ];
        const cor = cores[index % cores.length];
        
        return (
          <div key={opcao.id} className="space-y-1">
            <div className="flex justify-between text-sm">
              <span className="font-medium truncate max-w-[70%]">{opcao.titulo}</span>
              <span className="text-muted-foreground">{opcao.votos || 0} votos ({percentagem}%)</span>
            </div>
            <div className="h-6 bg-muted rounded-full overflow-hidden">
              <div 
                className={`h-full ${cor} transition-all duration-500 ease-out rounded-full flex items-center justify-end pr-2`}
                style={{ width: `${Math.max(largura, 2)}%` }}
              >
                {percentagem > 10 && (
                  <span className="text-xs text-white font-medium">{percentagem}%</span>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// Componente de gráfico de pizza simples
function PieChart({ opcoes, totalVotos }: { opcoes: Array<{ id: number; titulo: string; votos: number | null }>; totalVotos: number }) {
  const cores = [
    '#3b82f6', // blue
    '#22c55e', // green
    '#eab308', // yellow
    '#a855f7', // purple
    '#ec4899', // pink
    '#6366f1', // indigo
    '#ef4444', // red
    '#f97316', // orange
  ];
  
  // Calcular segmentos do gráfico
  let acumulado = 0;
  const segmentos = opcoes.map((opcao, index) => {
    const percentagem = totalVotos > 0 ? ((opcao.votos || 0) / totalVotos) * 100 : 0;
    const inicio = acumulado;
    acumulado += percentagem;
    return {
      ...opcao,
      percentagem,
      inicio,
      fim: acumulado,
      cor: cores[index % cores.length],
    };
  });
  
  // Criar gradiente cônico para o gráfico
  const gradiente = segmentos.length > 0 && totalVotos > 0
    ? `conic-gradient(${segmentos.map(s => `${s.cor} ${s.inicio}% ${s.fim}%`).join(', ')})`
    : 'conic-gradient(#e5e7eb 0% 100%)';
  
  return (
    <div className="flex flex-col md:flex-row items-center gap-6">
      <div 
        className="w-48 h-48 rounded-full shadow-lg"
        style={{ background: gradiente }}
      />
      <div className="flex flex-col gap-2">
        {segmentos.map((seg) => (
          <div key={seg.id} className="flex items-center gap-2">
            <div 
              className="w-4 h-4 rounded-sm"
              style={{ backgroundColor: seg.cor }}
            />
            <span className="text-sm">
              {seg.titulo}: {seg.votos || 0} ({Math.round(seg.percentagem)}%)
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function Votar() {
  const { id } = useParams<{ id: string }>();
  const votacaoId = parseInt(id || "0");
  const { user, loading: authLoading } = useAuth();
  const [, setLocation] = useLocation();
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [hasVoted, setHasVoted] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [chartType, setChartType] = useState<'bar' | 'pie'>('bar');
  
  // Buscar votação
  const { data: votacao, isLoading, refetch } = trpc.votacao.get.useQuery(
    { id: votacaoId },
    { enabled: votacaoId > 0 }
  );
  
  // Verificar se já votou
  const { data: votoExistente } = trpc.votacao.verificarVoto.useQuery(
    { votacaoId },
    { enabled: votacaoId > 0 && !!user }
  );
  
  // Verificar se o morador está bloqueado para votação
  // @ts-ignore
  const { data: statusBloqueio } = (trpc.morador as any).verificarBloqueioVotacao.useQuery(
    { votacaoId },
    { enabled: votacaoId > 0 && !!user }
  );
  
  // Mutation para votar
  const votarMutation = trpc.votacao.votar.useMutation({
    onSuccess: () => {
      toast.success("Voto registado com sucesso!");
      setHasVoted(true);
      setShowResults(true);
      refetch();
    },
    onError: (error) => {
      if (error.message.includes("já votou")) {
        toast.error("Você já votou nesta enquete!");
        setHasVoted(true);
        setShowResults(true);
      } else {
        toast.error("Erro ao registar voto: " + error.message);
      }
    },
  });
  
  // Atualizar estado quando verificar voto existente
  useEffect(() => {
    if (votoExistente?.jaVotou) {
      setHasVoted(true);
      setShowResults(true);
    }
  }, [votoExistente]);
  
  // Calcular total de votos
  const totalVotos = useMemo(() => {
    if (!votacao?.opcoes) return 0;
    return votacao.opcoes.reduce((acc, opt) => acc + (opt.votos || 0), 0);
  }, [votacao?.opcoes]);
  
  // Ícone do tipo de votação
  const getTipoIcon = (tipo: string) => {
    switch (tipo) {
      case 'funcionario_mes': return <Trophy className="h-5 w-5" />;
      case 'enquete': return <HelpCircle className="h-5 w-5" />;
      case 'decisao': return <Gavel className="h-5 w-5" />;
      default: return <Vote className="h-5 w-5" />;
    }
  };
  
  const getTipoLabel = (tipo: string) => {
    switch (tipo) {
      case 'funcionario_mes': return 'Funcionário do Mês';
      case 'enquete': return 'Enquete';
      case 'decisao': return 'Decisão';
      default: return tipo;
    }
  };
  
  const handleVotar = () => {
    if (!selectedOption) {
      toast.error("Selecione uma opção para votar");
      return;
    }
    votarMutation.mutate({ votacaoId, opcaoId: selectedOption });
  };
  
  // Loading
  if (isLoading || authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
          <p className="mt-2 text-muted-foreground">A carregar votação...</p>
        </div>
      </div>
    );
  }
  
  // Votação não encontrada
  if (!votacao) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardHeader className="text-center">
            <Vote className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
            <CardTitle>Votação não encontrada</CardTitle>
            <CardDescription>
              A votação que procura não existe ou foi removida.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <Link href="/">
              <Button variant="outline">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Voltar ao início
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  // Votação encerrada
  const isEncerrada = votacao.status === 'encerrada' || 
    (votacao.dataFim && new Date(votacao.dataFim) < new Date());
  
  // Não autenticado
  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardHeader className="text-center">
            <div className="flex items-center justify-center gap-2 text-primary mb-2">
              {getTipoIcon(votacao.tipo)}
              <span className="text-sm font-medium">{getTipoLabel(votacao.tipo)}</span>
            </div>
            <CardTitle>{votacao.titulo}</CardTitle>
            {votacao.descricao && (
              <CardDescription>{votacao.descricao}</CardDescription>
            )}
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-center">
              <LogIn className="h-8 w-8 mx-auto text-amber-600 mb-2" />
              <p className="text-amber-800 font-medium">Autenticação necessária</p>
              <p className="text-sm text-amber-700 mt-1">
                Para participar desta votação, precisa fazer login com a sua conta de morador.
              </p>
            </div>
            <Button 
              className="w-full" 
              size="lg"
              onClick={() => window.location.href = getLoginUrl()}
            >
              <LogIn className="h-4 w-4 mr-2" />
              Entrar para Votar
            </Button>
            <Link href="/">
              <Button variant="ghost" className="w-full">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Voltar ao início
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  // Morador bloqueado para votação
  if (statusBloqueio?.bloqueado) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-red-100 flex items-center justify-center p-4">
        <Card className="max-w-md w-full border-red-200">
          <CardHeader className="text-center">
            <div className="w-20 h-20 mx-auto bg-red-100 rounded-full flex items-center justify-center mb-4">
              <Ban className="h-10 w-10 text-red-600" />
            </div>
            <CardTitle className="text-red-800">Bloqueado para Votação!</CardTitle>
            <CardDescription className="text-red-600">
              Entre em contato com sua administradora para maiores informações.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {statusBloqueio.telefoneContato && (
              <div className="bg-white border border-red-200 rounded-lg p-4 space-y-3">
                <div className="flex items-center gap-3">
                  <Phone className="h-5 w-5 text-red-600" />
                  <span className="font-medium text-gray-800">{statusBloqueio.telefoneContato}</span>
                </div>
                <a 
                  href={`https://wa.me/55${statusBloqueio.telefoneContato.replace(/\D/g, '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 w-full py-3 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors"
                >
                  <MessageCircle className="h-5 w-5" />
                  Falar no WhatsApp
                </a>
              </div>
            )}
            <Link href="/">
              <Button variant="outline" className="w-full border-red-200 text-red-700 hover:bg-red-50">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Voltar ao início
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <Link href="/dashboard/votacoes">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar
            </Button>
          </Link>
        </div>
        
        {/* Card principal */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-primary">
                {getTipoIcon(votacao.tipo)}
                <span className="text-sm font-medium">{getTipoLabel(votacao.tipo)}</span>
              </div>
              <div className="flex items-center gap-2">
                {isEncerrada ? (
                  <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">
                    Encerrada
                  </span>
                ) : (
                  <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">
                    Ativa
                  </span>
                )}
              </div>
            </div>
            <CardTitle className="text-2xl">{votacao.titulo}</CardTitle>
            {votacao.descricao && (
              <CardDescription className="text-base">{votacao.descricao}</CardDescription>
            )}
            <div className="flex items-center gap-4 text-sm text-muted-foreground pt-2">
              <div className="flex items-center gap-1">
                <Users className="h-4 w-4" />
                <span>{totalVotos} voto{totalVotos !== 1 ? 's' : ''}</span>
              </div>
              {votacao.dataFim && (
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  <span>Encerra em {new Date(votacao.dataFim).toLocaleDateString('pt-BR')}</span>
                </div>
              )}
            </div>
          </CardHeader>
          
          <CardContent className="space-y-6">
            {/* Mostrar resultados ou opções de voto */}
            {(showResults || hasVoted || isEncerrada) ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold flex items-center gap-2">
                    <BarChart3 className="h-5 w-5" />
                    Resultados
                  </h3>
                  <div className="flex gap-2">
                    <Button
                      variant={chartType === 'bar' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setChartType('bar')}
                    >
                      Barras
                    </Button>
                    <Button
                      variant={chartType === 'pie' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setChartType('pie')}
                    >
                      Pizza
                    </Button>
                  </div>
                </div>
                
                {chartType === 'bar' ? (
                  <BarChart opcoes={votacao.opcoes || []} totalVotos={totalVotos} />
                ) : (
                  <PieChart opcoes={votacao.opcoes || []} totalVotos={totalVotos} />
                )}
                
                {hasVoted && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
                    <CheckCircle className="h-6 w-6 mx-auto text-green-600 mb-2" />
                    <p className="text-green-800 font-medium">O seu voto foi registado!</p>
                    <p className="text-sm text-green-700">Obrigado por participar.</p>
                  </div>
                )}
                
                {!hasVoted && !isEncerrada && (
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={() => setShowResults(false)}
                  >
                    Voltar para votar
                  </Button>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                {/* Imagem da Votação */}
                {votacao.imagemUrl && (
                  <div className="mb-4 rounded-xl overflow-hidden">
                    <img 
                      src={votacao.imagemUrl} 
                      alt={votacao.titulo}
                      className="w-full h-48 object-cover"
                    />
                  </div>
                )}
                
                <h3 className="font-semibold">Selecione uma opção:</h3>
                <div className="space-y-3">
                  {votacao.opcoes?.map((opcao) => (
                    <div
                      key={opcao.id}
                      className={`border rounded-lg p-4 cursor-pointer transition-all ${
                        selectedOption === opcao.id
                          ? 'border-primary bg-primary/5 ring-2 ring-primary'
                          : 'border-border hover:border-primary/50 hover:bg-muted/50'
                      }`}
                      onClick={() => setSelectedOption(opcao.id)}
                    >
                      <div className="flex items-center gap-3">
                        {/* Imagem da Opção */}
                        {opcao.imagemUrl && (
                          <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
                            <img 
                              src={opcao.imagemUrl} 
                              alt={opcao.titulo}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        )}
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                          selectedOption === opcao.id
                            ? 'border-primary bg-primary'
                            : 'border-muted-foreground'
                        }`}>
                          {selectedOption === opcao.id && (
                            <CheckCircle className="h-3 w-3 text-white" />
                          )}
                        </div>
                        <div className="flex-1">
                          <p className="font-medium">{opcao.titulo}</p>
                          {opcao.descricao && (
                            <p className="text-sm text-muted-foreground">{opcao.descricao}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="flex gap-3 pt-4">
                  <Button
                    className="flex-1"
                    size="lg"
                    onClick={handleVotar}
                    disabled={!selectedOption || votarMutation.isPending}
                  >
                    {votarMutation.isPending ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        A registar voto...
                      </>
                    ) : (
                      <>
                        <Vote className="h-4 w-4 mr-2" />
                        Confirmar Voto
                      </>
                    )}
                  </Button>
                  <Button
                    variant="outline"
                    size="lg"
                    onClick={() => setShowResults(true)}
                  >
                    Ver Resultados
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
        
        {/* Informação de autenticação */}
        <div className="mt-4 text-center text-sm text-muted-foreground">
          <p>Votando como: <span className="font-medium">{user.name || user.email}</span></p>
        </div>
      </div>
    </div>
  );
}
