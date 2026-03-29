import ModulePage from '@/components/layout/ModulePage';
import SmartSearch from '@/components/shared/SmartSearch';
import { ClipboardCheck, Plus, AlertTriangle, ChevronRight, Loader2, X, Image, MapPin, Calendar, Download } from 'lucide-react';
import { useState } from 'react';
import { trpc } from '@/lib/trpc';
import { useCondominioAtivo } from '@/hooks/useCondominioAtivo';
import { useAuth } from '@/contexts/AuthContext';

const STATUS_TABS = [
  { value: 'all', label: 'Todas' },
  { value: 'pendente', label: 'Pendente' },
  { value: 'realizada', label: 'Realizada' },
  { value: 'acao_necessaria', label: 'Ação necessária' },
  { value: 'finalizada', label: 'Finalizada' },
] as const;

const STATUS_COLORS: Record<string, string> = {
  pendente: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-500/20 dark:text-yellow-400',
  realizada: 'bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400',
  acao_necessaria: 'bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400',
  finalizada: 'bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-400',
  reaberta: 'bg-orange-100 text-orange-700 dark:bg-orange-500/20 dark:text-orange-400',
  rascunho: 'bg-gray-100 text-gray-700 dark:bg-gray-500/20 dark:text-gray-400',
};

const PRIORIDADE_COLORS: Record<string, string> = {
  urgente: 'bg-red-500 text-white',
  alta: 'bg-orange-500 text-white',
  media: 'bg-yellow-400 text-yellow-900',
  baixa: 'bg-green-100 text-green-700',
};

export default function VistoriaPage() {
  const { isAdmin, isMaster } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showCreate, setShowCreate] = useState(false);
  const { condominioAtivo, isLoading: loadingCond } = useCondominioAtivo();

  const condId = condominioAtivo?.id;

  const { data: vistorias, isLoading } = trpc.vistoria.listWithDetails.useQuery(
    { condominioId: condId! },
    { enabled: !!condId },
  );

  const { data: stats } = trpc.vistoria.getStats.useQuery(
    { condominioId: condId! },
    { enabled: !!condId },
  );

  const generatePdf = trpc.vistoria.generatePdf.useMutation();

  const filtered = (vistorias || []).filter((v: any) => {
    if (statusFilter !== 'all' && v.status !== statusFilter) return false;
    if (searchQuery && !v.titulo?.toLowerCase().includes(searchQuery.toLowerCase()) && !v.protocolo?.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  const urgentes = (vistorias || []).filter((v: any) => v.prioridade === 'urgente' && v.status !== 'finalizada');

  const handleDownloadPdf = async (id: number) => {
    try {
      const result = await generatePdf.mutateAsync({ id });
      if ((result as any)?.pdf) {
        const blob = new Blob(
          [Uint8Array.from(atob((result as any).pdf), (c) => c.charCodeAt(0))],
          { type: 'application/pdf' },
        );
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `vistoria-${id}.pdf`;
        a.click();
        URL.revokeObjectURL(url);
      }
    } catch (err) {
      console.error('Erro ao gerar PDF:', err);
    }
  };

  return (
    <ModulePage title="Vistoria">
      <SmartSearch placeholder="Buscar vistoria ou protocolo..." onSearch={(q) => setSearchQuery(q)} showDateFilter={false} />

      <div className="px-4">
        {/* Urgent items banner */}
        {urgentes.length > 0 && (
          <div className="flex items-center gap-3 p-4 mb-4 rounded-2xl bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20">
            <div className="w-10 h-10 rounded-xl bg-red-100 dark:bg-red-500/20 flex items-center justify-center animate-pulse">
              <AlertTriangle className="w-5 h-5 text-red-500" />
            </div>
            <div>
              <p className="font-semibold text-sm text-red-700 dark:text-red-400">
                {urgentes.length} {urgentes.length === 1 ? 'item urgente' : 'itens urgentes'}
              </p>
              <p className="text-xs text-red-500">Requerem atenção imediata</p>
            </div>
          </div>
        )}

        {/* Stats cards */}
        {stats && (
          <div className="grid grid-cols-4 gap-2 mb-4">
            {[
              { label: 'Total', value: (stats as any).total || 0, cls: 'text-foreground' },
              { label: 'Pendentes', value: (stats as any).pendentes || 0, cls: 'text-yellow-600' },
              { label: 'Realizadas', value: (stats as any).realizadas || 0, cls: 'text-blue-600' },
              { label: 'Finalizadas', value: (stats as any).finalizadas || 0, cls: 'text-green-600' },
            ].map((s) => (
              <div key={s.label} className="p-3 rounded-xl bg-card border text-center">
                <p className={`text-lg font-bold ${s.cls}`}>{s.value}</p>
                <p className="text-[10px] text-muted-foreground">{s.label}</p>
              </div>
            ))}
          </div>
        )}

        {/* Status filter tabs */}
        <div className="flex gap-1.5 mb-4 overflow-x-auto pb-1">
          {STATUS_TABS.map((tab) => (
            <button
              key={tab.value}
              onClick={() => setStatusFilter(tab.value)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
                statusFilter === tab.value
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground hover:bg-muted/80'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* List */}
        {(isLoading || loadingCond) ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="w-16 h-16 rounded-2xl bg-teal-100 dark:bg-teal-500/15 flex items-center justify-center mb-4">
              <ClipboardCheck className="w-7 h-7 text-teal-500" />
            </div>
            <h3 className="font-semibold text-lg mb-1">
              {searchQuery || statusFilter !== 'all' ? 'Nenhum resultado' : 'Nenhuma vistoria'}
            </h3>
            <p className="text-sm text-muted-foreground mb-6">
              {searchQuery ? 'Tente outro termo' : 'Crie formulários de inspeção e checklist'}
            </p>
          </div>
        ) : (
          <div className="space-y-3 pb-24">
            {filtered.map((v: any) => (
              <div key={v.id} className="p-4 rounded-2xl bg-card border shadow-sm">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-teal-100 dark:bg-teal-500/15 flex items-center justify-center flex-shrink-0">
                    <ClipboardCheck className="w-5 h-5 text-teal-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-sm truncate">{v.titulo}</h3>
                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                      {v.status && (
                        <span className={`px-2 py-0.5 text-[10px] font-medium rounded-full ${STATUS_COLORS[v.status] || STATUS_COLORS.rascunho}`}>
                          {v.status?.replace('_', ' ')}
                        </span>
                      )}
                      {v.prioridade && (
                        <span className={`px-2 py-0.5 text-[10px] font-medium rounded-full ${PRIORIDADE_COLORS[v.prioridade] || ''}`}>
                          {v.prioridade}
                        </span>
                      )}
                      {v.protocolo && (
                        <span className="text-[10px] text-muted-foreground">#{v.protocolo}</span>
                      )}
                    </div>
                    <div className="flex items-center gap-3 mt-1.5 text-[10px] text-muted-foreground">
                      {v.localizacao && (
                        <span className="flex items-center gap-0.5"><MapPin className="w-3 h-3" />{v.localizacao}</span>
                      )}
                      {v.dataAgendada && (
                        <span className="flex items-center gap-0.5"><Calendar className="w-3 h-3" />{new Date(v.dataAgendada).toLocaleDateString('pt-BR')}</span>
                      )}
                      {v.imagens?.length > 0 && (
                        <span className="flex items-center gap-0.5"><Image className="w-3 h-3" />{v.imagens.length}</span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleDownloadPdf(v.id)}
                      className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground"
                      title="Baixar PDF"
                    >
                      <Download className="w-4 h-4" />
                    </button>
                    <ChevronRight className="w-4 h-4 text-muted-foreground" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create modal */}
      {showCreate && condId && <CreateVistoriaModal condominioId={condId} onClose={() => setShowCreate(false)} />}

      {/* FAB */}
      {(isAdmin || isMaster) && (
        <button
          onClick={() => setShowCreate(true)}
          className="fixed bottom-20 right-4 w-14 h-14 bg-gradient-to-r from-teal-500 to-teal-600 text-white rounded-full shadow-lg flex items-center justify-center hover:shadow-xl transition-shadow z-20"
        >
          <Plus className="w-6 h-6" />
        </button>
      )}
    </ModulePage>
  );
}

function CreateVistoriaModal({ condominioId, onClose }: { condominioId: number; onClose: () => void }) {
  const [titulo, setTitulo] = useState('');
  const [descricao, setDescricao] = useState('');
  const [localizacao, setLocalizacao] = useState('');
  const [responsavelNome, setResponsavelNome] = useState('');
  const [prioridade, setPrioridade] = useState<string>('media');
  const [dataAgendada, setDataAgendada] = useState('');
  const [saving, setSaving] = useState(false);

  const createMut = trpc.vistoria.create.useMutation();
  const utils = trpc.useUtils();

  const handleCreate = async () => {
    if (!titulo.trim()) return;
    setSaving(true);
    try {
      await createMut.mutateAsync({
        condominioId,
        titulo: titulo.trim(),
        descricao: descricao.trim() || undefined,
        localizacao: localizacao.trim() || undefined,
        responsavelNome: responsavelNome.trim() || undefined,
        prioridade: prioridade as any,
        dataAgendada: dataAgendada || undefined,
      });
      utils.vistoria.listWithDetails.invalidate();
      utils.vistoria.getStats.invalidate();
      onClose();
    } catch (err) {
      console.error('Erro ao criar vistoria:', err);
    } finally {
      setSaving(false);
    }
  };

  const inputCls = 'w-full px-4 py-3 rounded-xl bg-muted/50 border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/30';

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="w-full max-w-lg bg-background rounded-t-3xl sm:rounded-3xl shadow-2xl max-h-[85vh] flex flex-col animate-in slide-in-from-bottom duration-300">
        <div className="flex items-center justify-between p-5 border-b">
          <h2 className="text-lg font-bold">Nova Vistoria</h2>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-muted"><X className="w-5 h-5" /></button>
        </div>
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1 block">Título *</label>
            <input className={inputCls} placeholder="Título da vistoria" value={titulo} onChange={(e) => setTitulo(e.target.value)} />
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1 block">Descrição</label>
            <textarea className={inputCls} rows={3} placeholder="Descreva os itens a inspecionar" value={descricao} onChange={(e) => setDescricao(e.target.value)} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Localização</label>
              <input className={inputCls} placeholder="Bloco A, Sala 3" value={localizacao} onChange={(e) => setLocalizacao(e.target.value)} />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Responsável</label>
              <input className={inputCls} placeholder="Nome do responsável" value={responsavelNome} onChange={(e) => setResponsavelNome(e.target.value)} />
            </div>
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1 block">Prioridade</label>
            <div className="grid grid-cols-4 gap-2">
              {(['baixa', 'media', 'alta', 'urgente'] as const).map((p) => (
                <button
                  key={p}
                  onClick={() => setPrioridade(p)}
                  className={`py-2 rounded-xl text-xs font-medium border transition-all ${
                    prioridade === p ? PRIORIDADE_COLORS[p] + ' border-transparent' : 'border-border hover:bg-muted'
                  }`}
                >
                  {p.charAt(0).toUpperCase() + p.slice(1)}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1 block">Data agendada</label>
            <input type="date" className={inputCls} value={dataAgendada} onChange={(e) => setDataAgendada(e.target.value)} />
          </div>
        </div>
        <div className="p-5 border-t">
          <button
            onClick={handleCreate}
            disabled={saving || !titulo.trim()}
            className="w-full py-3 bg-gradient-to-r from-teal-500 to-teal-600 text-white rounded-xl font-medium text-sm hover:shadow-lg disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
            {saving ? 'Criando...' : 'Criar Vistoria'}
          </button>
        </div>
      </div>
    </div>
  );
}
