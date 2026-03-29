import ModulePage from '@/components/layout/ModulePage';
import SmartSearch from '@/components/shared/SmartSearch';
import AiAssistant, { type OSData } from '@/components/AiAssistant';
import { useState } from 'react';
import { Wrench, Plus, Mic, ChevronRight, Loader2 } from 'lucide-react';
import { trpc } from '@/lib/trpc';
import { useCondominioAtivo } from '@/hooks/useCondominioAtivo';
import { useLocation } from 'wouter';
import { toast } from '@/components/ui/sonner';

type StatusFilter = 'todas' | 'abertas' | 'execucao' | 'finalizadas';

export default function ManutencaoPage() {
  const [, setLocation] = useLocation();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('todas');
  const [showAI, setShowAI] = useState(false);
  const { condominioAtivo, isLoading: loadingCond } = useCondominioAtivo();

  const condId = condominioAtivo?.id;
  const utils = trpc.useUtils();

  // Create OS mutation (for AI assistant)
  const createOS = trpc.ordensServico.create.useMutation({
    onSuccess: (data) => {
      toast.success(`OS ${data.protocolo} criada!`);
      utils.ordensServico.list.invalidate();
      utils.ordensServico.estatisticas.invalidate();
      setShowAI(false);
    },
    onError: (err) => toast.error(err.message || 'Erro ao criar OS'),
  });

  const handleAICreate = (data: OSData) => {
    if (!condId) return;
    createOS.mutate({
      condominioId: condId,
      titulo: data.titulo,
      descricao: data.descricao,
    });
  };

  // Fetch OS list
  const { data: osData, isLoading: loadingOS } = trpc.ordensServico.list.useQuery(
    { condominioId: condId!, search: searchQuery || undefined, limit: 50 },
    { enabled: !!condId },
  );

  // Fetch stats
  const { data: stats } = trpc.ordensServico.estatisticas.useQuery(
    { condominioId: condId! },
    { enabled: !!condId },
  );

  const osList = osData?.items || [];

  const statusFilters: { key: StatusFilter; label: string }[] = [
    { key: 'todas', label: 'Todas' },
    { key: 'abertas', label: 'Abertas' },
    { key: 'execucao', label: 'Em Execução' },
    { key: 'finalizadas', label: 'Finalizadas' },
  ];

  const prioridadeColor: Record<string, string> = {
    urgente: 'text-red-500 bg-red-50 dark:bg-red-500/10',
    alta: 'text-orange-500 bg-orange-50 dark:bg-orange-500/10',
    media: 'text-amber-500 bg-amber-50 dark:bg-amber-500/10',
    baixa: 'text-green-500 bg-green-50 dark:bg-green-500/10',
    normal: 'text-blue-500 bg-blue-50 dark:bg-blue-500/10',
  };

  return (
    <ModulePage title="Manutenção">
      <SmartSearch
        placeholder="Buscar OS, protocolo, local..."
        onSearch={(q) => setSearchQuery(q)}
      />

      <div className="px-4 space-y-4">
        {/* AI Assistant Button */}
        <button
          onClick={() => setShowAI(!showAI)}
          className="w-full flex items-center gap-3 p-4 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-2xl hover:shadow-lg transition-shadow active:scale-[0.98]"
        >
          <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
            <Mic className="w-5 h-5" />
          </div>
          <div className="text-left flex-1">
            <p className="font-bold text-sm">Assistente IA</p>
            <p className="text-[11px] text-white/70">Fale ou digite — a IA cria a OS para você</p>
          </div>
          <div className="w-2 h-2 rounded-full bg-white animate-pulse" />
        </button>

        {/* Stats cards */}
        <div className="grid grid-cols-4 gap-2">
          <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-500/10 text-center">
            <p className="text-xl font-bold text-blue-600">{stats?.total || 0}</p>
            <p className="text-[10px] text-muted-foreground">Total</p>
          </div>
          <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-500/10 text-center">
            <p className="text-xl font-bold text-amber-600">{stats?.abertas || stats?.pendentes || 0}</p>
            <p className="text-[10px] text-muted-foreground">Abertas</p>
          </div>
          <div className="p-3 rounded-xl bg-red-50 dark:bg-red-500/10 text-center">
            <p className="text-xl font-bold text-red-600">{stats?.urgentes || 0}</p>
            <p className="text-[10px] text-muted-foreground">Urgentes</p>
          </div>
          <div className="p-3 rounded-xl bg-green-50 dark:bg-green-500/10 text-center">
            <p className="text-xl font-bold text-green-600">{stats?.finalizadas || stats?.concluidas || 0}</p>
            <p className="text-[10px] text-muted-foreground">Concluídas</p>
          </div>
        </div>

        {/* Status filter tabs */}
        <div className="flex gap-2 overflow-x-auto no-scrollbar">
          {statusFilters.map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setStatusFilter(key)}
              className={`px-4 py-2 rounded-xl text-xs font-medium whitespace-nowrap transition-colors ${
                statusFilter === key
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* OS list */}
        {(loadingOS || loadingCond) ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
          </div>
        ) : osList.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="w-16 h-16 rounded-2xl bg-orange-100 dark:bg-orange-500/15 flex items-center justify-center mb-4">
              <Wrench className="w-7 h-7 text-orange-500" />
            </div>
            <h3 className="font-semibold text-lg mb-1">Nenhuma OS</h3>
            <p className="text-sm text-muted-foreground mb-6">
              Use o Assistente IA ou crie manualmente
            </p>
          </div>
        ) : (
          <div className="space-y-3 pb-24">
            {osList.map((os: any) => (
              <button
                key={os.id}
                onClick={() => setLocation(`/dashboard/ordens-servico/${os.id}`)}
                className="w-full text-left p-4 rounded-2xl bg-card border shadow-sm hover:shadow-md transition-shadow space-y-2"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono text-muted-foreground">{os.protocolo}</span>
                      {os.prioridade && (
                        <span className={`px-1.5 py-0.5 text-[10px] font-medium rounded-full ${prioridadeColor[os.prioridade?.nome?.toLowerCase()] || prioridadeColor.normal}`}>
                          {os.prioridade.nome}
                        </span>
                      )}
                    </div>
                    <h3 className="font-semibold text-sm mt-1 truncate">{os.titulo}</h3>
                  </div>
                  <ChevronRight className="w-4 h-4 text-muted-foreground flex-shrink-0 mt-1" />
                </div>
                {os.descricao && (
                  <p className="text-xs text-muted-foreground line-clamp-2">{os.descricao}</p>
                )}
                <div className="flex items-center gap-3 text-[10px] text-muted-foreground">
                  {os.status && (
                    <span className="px-2 py-0.5 rounded-full bg-muted font-medium">{os.status.nome}</span>
                  )}
                  {os.categoria && <span>{os.categoria.nome}</span>}
                  <span className="ml-auto">
                    {new Date(os.createdAt).toLocaleDateString('pt-BR')}
                  </span>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* FAB */}
      <button
        onClick={() => setLocation('/dashboard/ordens-servico/nova')}
        className="fixed bottom-20 right-4 w-14 h-14 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-full shadow-lg flex items-center justify-center hover:shadow-xl transition-shadow z-20"
      >
        <Plus className="w-6 h-6" />
      </button>

      {/* AI Assistant Panel */}
      <AiAssistant open={showAI} onClose={() => setShowAI(false)} onCreateOS={handleAICreate} />
    </ModulePage>
  );
}
