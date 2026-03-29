import ModulePage from '@/components/layout/ModulePage';
import SmartSearch from '@/components/shared/SmartSearch';
import { useState } from 'react';
import { UsersRound, Plus, X, Loader2, Trash2, UserPlus, ChevronLeft, Check } from 'lucide-react';
import { trpc } from '@/lib/trpc';
import { useCondominioAtivo } from '@/hooks/useCondominioAtivo';
import { toast } from '@/components/ui/sonner';

type View = 'list' | 'detail' | 'addMembros';

export default function EquipePage() {
  const [searchQuery, setSearchQuery] = useState('');
  const { condominioAtivo, isLoading: loadingCond } = useCondominioAtivo();
  const condId = condominioAtivo?.id;

  const [view, setView] = useState<View>('list');
  const [selectedEquipeId, setSelectedEquipeId] = useState<number | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [novaEquipeNome, setNovaEquipeNome] = useState('');
  const [selectedFuncs, setSelectedFuncs] = useState<number[]>([]);

  // Queries
  const { data: equipesData, isLoading, refetch } = trpc.equipes.list.useQuery(
    { condominioId: condId! },
    { enabled: !!condId },
  );

  const { data: membrosData, refetch: refetchMembros } = trpc.equipes.membros.useQuery(
    { equipeId: selectedEquipeId! },
    { enabled: !!selectedEquipeId },
  );

  const { data: todosFunc } = trpc.funcionario.list.useQuery(
    { condominioId: condId! },
    { enabled: !!condId && view === 'addMembros' },
  );

  // Mutations
  const createMut = trpc.equipes.create.useMutation({
    onSuccess: () => { refetch(); setShowCreate(false); setNovaEquipeNome(''); toast.success('Equipe criada'); },
  });
  const deleteMut = trpc.equipes.delete.useMutation({
    onSuccess: () => { refetch(); setView('list'); setSelectedEquipeId(null); toast.success('Equipe removida'); },
  });
  const addMembrosMut = trpc.equipes.addMembros.useMutation({
    onSuccess: (r) => { refetchMembros(); setView('detail'); setSelectedFuncs([]); toast.success(`${r.added} membro(s) adicionado(s)`); },
  });
  const removeMembroMut = trpc.equipes.removeMembro.useMutation({
    onSuccess: () => { refetchMembros(); refetch(); toast.success('Membro removido'); },
  });

  const equipes = (equipesData || []).filter((e: any) =>
    !searchQuery || e.nome?.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const selectedEquipe = equipesData?.find((e: any) => e.id === selectedEquipeId);

  // Funcionários que ainda não estão na equipe
  const membrosIds = new Set((membrosData || []).map((m: any) => m.funcionarioId));
  const funcDisponiveis = (todosFunc || []).filter((f: any) => f.ativo !== false && !membrosIds.has(f.id));

  // ─── Tela: Adicionar membros ───
  if (view === 'addMembros' && selectedEquipeId) {
    return (
      <ModulePage title="Adicionar Membros">
        <div className="px-4">
          <button onClick={() => setView('detail')} className="flex items-center gap-1 text-sm text-muted-foreground mb-4">
            <ChevronLeft className="w-4 h-4" /> Voltar
          </button>

          {funcDisponiveis.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <UsersRound className="w-10 h-10 text-muted-foreground mb-3" />
              <p className="text-sm text-muted-foreground">Todos os funcionários já estão nesta equipe</p>
            </div>
          ) : (
            <div className="space-y-2 pb-24">
              {funcDisponiveis.map((f: any) => {
                const sel = selectedFuncs.includes(f.id);
                return (
                  <button
                    key={f.id}
                    onClick={() => setSelectedFuncs(prev => sel ? prev.filter(x => x !== f.id) : [...prev, f.id])}
                    className={`w-full flex items-center gap-3 p-3 rounded-xl border transition-colors ${sel ? 'bg-blue-50 dark:bg-blue-500/15 border-blue-300' : 'bg-card border-border'}`}
                  >
                    <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${sel ? 'bg-blue-500 text-white' : 'bg-muted text-muted-foreground'}`}>
                      {sel ? <Check className="w-4 h-4" /> : <span className="text-xs font-bold">{(f.nome || 'F')[0].toUpperCase()}</span>}
                    </div>
                    <div className="text-left flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{f.nome}</p>
                      <p className="text-[10px] text-muted-foreground">{f.cargo || f.tipoFuncionario || '—'}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {selectedFuncs.length > 0 && (
          <button
            onClick={() => addMembrosMut.mutate({ equipeId: selectedEquipeId, funcionarioIds: selectedFuncs })}
            disabled={addMembrosMut.isPending}
            className="fixed bottom-20 left-1/2 -translate-x-1/2 px-6 py-3 bg-blue-500 text-white rounded-full shadow-lg font-medium text-sm z-20"
          >
            {addMembrosMut.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : `Adicionar ${selectedFuncs.length} membro(s)`}
          </button>
        )}
      </ModulePage>
    );
  }

  // ─── Tela: Detalhe da equipe (membros) ───
  if (view === 'detail' && selectedEquipeId) {
    return (
      <ModulePage title={selectedEquipe?.nome || 'Equipe'}>
        <div className="px-4">
          <button onClick={() => { setView('list'); setSelectedEquipeId(null); }} className="flex items-center gap-1 text-sm text-muted-foreground mb-4">
            <ChevronLeft className="w-4 h-4" /> Voltar
          </button>

          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-base">{(membrosData || []).length} membro(s)</h2>
            <button
              onClick={() => { if (confirm('Excluir esta equipe?')) deleteMut.mutate({ id: selectedEquipeId }); }}
              className="text-xs text-red-500 flex items-center gap-1"
            >
              <Trash2 className="w-3 h-3" /> Excluir equipe
            </button>
          </div>

          {(membrosData || []).length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <UsersRound className="w-10 h-10 text-muted-foreground mb-3" />
              <p className="text-sm text-muted-foreground mb-2">Nenhum membro nesta equipe</p>
              <button
                onClick={() => setView('addMembros')}
                className="text-sm text-blue-500 font-medium"
              >
                Adicionar funcionários
              </button>
            </div>
          ) : (
            <div className="space-y-2 pb-24">
              {(membrosData || []).map((m: any) => {
                const initials = (m.nome || 'F').split(' ').map((w: string) => w[0]).join('').slice(0, 2).toUpperCase();
                return (
                  <div key={m.id} className="flex items-center gap-3 p-3 rounded-xl bg-card border shadow-sm">
                    {m.fotoUrl ? (
                      <img src={m.fotoUrl} className="w-10 h-10 rounded-lg object-cover flex-shrink-0" />
                    ) : (
                      <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center flex-shrink-0">
                        <span className="text-xs font-bold text-white">{initials}</span>
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-sm truncate">{m.nome}</h3>
                      <p className="text-[10px] text-muted-foreground">{m.cargo || m.tipoFuncionario || '—'}</p>
                    </div>
                    <button
                      onClick={() => removeMembroMut.mutate({ equipeId: selectedEquipeId, funcionarioId: m.funcionarioId })}
                      className="p-1.5 rounded-lg text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* FAB adicionar membros */}
        <button
          onClick={() => setView('addMembros')}
          className="fixed bottom-20 left-1/2 -translate-x-1/2 w-14 h-14 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-full shadow-lg flex items-center justify-center z-20"
        >
          <UserPlus className="w-6 h-6" />
        </button>
      </ModulePage>
    );
  }

  // ─── Tela principal: Lista de equipes ───
  return (
    <ModulePage title="Equipes">
      <SmartSearch
        placeholder="Buscar equipe..."
        onSearch={(q) => setSearchQuery(q)}
      />

      <div className="px-4 space-y-4">
        {(isLoading || loadingCond) ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
          </div>
        ) : equipes.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="w-16 h-16 rounded-2xl bg-blue-100 dark:bg-blue-500/15 flex items-center justify-center mb-4">
              <UsersRound className="w-7 h-7 text-blue-500" />
            </div>
            <h3 className="font-semibold text-lg mb-1">
              {searchQuery ? 'Nenhum resultado' : 'Nenhuma equipe'}
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              Crie equipes e adicione seus funcionários
            </p>
          </div>
        ) : (
          <div className="space-y-3 pb-24">
            {equipes.map((e: any) => (
              <button
                key={e.id}
                onClick={() => { setSelectedEquipeId(e.id); setView('detail'); }}
                className="w-full flex items-center gap-3 p-4 rounded-2xl bg-card border shadow-sm text-left"
              >
                <div
                  className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: (e.cor || '#3b82f6') + '20' }}
                >
                  <UsersRound className="w-5 h-5" style={{ color: e.cor || '#3b82f6' }} />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-sm truncate">{e.nome}</h3>
                  <p className="text-[10px] text-muted-foreground">
                    {e.totalMembros} {e.totalMembros === 1 ? 'membro' : 'membros'}
                  </p>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Modal criar equipe */}
      {showCreate && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center p-4">
          <div className="bg-card rounded-2xl w-full max-w-sm p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold text-lg">Nova Equipe</h2>
              <button onClick={() => setShowCreate(false)} className="p-1 rounded-lg hover:bg-muted">
                <X className="w-5 h-5" />
              </button>
            </div>
            <input
              autoFocus
              value={novaEquipeNome}
              onChange={(e) => setNovaEquipeNome(e.target.value)}
              placeholder="Nome da equipe"
              className="w-full px-4 py-3 rounded-xl bg-muted border-0 text-sm focus:ring-2 focus:ring-primary/30 outline-none"
            />
            <button
              onClick={() => {
                if (!novaEquipeNome.trim()) { toast.error('Digite o nome da equipe'); return; }
                createMut.mutate({ condominioId: condId!, nome: novaEquipeNome.trim() });
              }}
              disabled={createMut.isPending}
              className="w-full py-3 rounded-xl bg-blue-500 text-white font-medium text-sm disabled:opacity-50"
            >
              {createMut.isPending ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : 'Criar Equipe'}
            </button>
          </div>
        </div>
      )}

      {/* FAB */}
      <button
        onClick={() => setShowCreate(true)}
        className="fixed bottom-20 left-1/2 -translate-x-1/2 w-14 h-14 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-full shadow-lg flex items-center justify-center hover:shadow-xl transition-shadow z-20"
      >
        <Plus className="w-6 h-6" />
      </button>
    </ModulePage>
  );
}
