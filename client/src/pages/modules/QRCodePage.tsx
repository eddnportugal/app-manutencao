import ModulePage from '@/components/layout/ModulePage';
import SmartSearch from '@/components/shared/SmartSearch';
import { useState } from 'react';
import { QrCode, Plus, Copy, ExternalLink, Trash2, Loader2, Link2, X, Check } from 'lucide-react';
import { trpc } from '@/lib/trpc';
import { useCondominioAtivo } from '@/hooks/useCondominioAtivo';
import { useAuth } from '@/contexts/AuthContext';

const TIPOS = [
  { value: 'vistoria', label: 'Vistoria', color: 'bg-teal-100 text-teal-700 dark:bg-teal-500/20 dark:text-teal-400' },
  { value: 'manutencao', label: 'Manutenção', color: 'bg-orange-100 text-orange-700 dark:bg-orange-500/20 dark:text-orange-400' },
  { value: 'ocorrencia', label: 'Ocorrência', color: 'bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400' },
  { value: 'checklist', label: 'Checklist', color: 'bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400' },
] as const;

export default function QRCodePage() {
  const { isAdmin, isMaster } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [copied, setCopied] = useState<number | null>(null);
  const { condominioAtivo, isLoading: loadingCond } = useCondominioAtivo();

  const condId = condominioAtivo?.id;

  const { data: links, isLoading } = trpc.linkCompartilhavel.list.useQuery(
    { condominioId: condId! },
    { enabled: !!condId },
  );

  const deleteMut = trpc.linkCompartilhavel.delete.useMutation();
  const utils = trpc.useUtils();

  const filtered = (links || []).filter(
    (l: any) => !searchQuery || l.titulo?.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const handleCopy = (token: string, id: number) => {
    const url = `${globalThis.location.origin}/compartilhado/${token}`;
    navigator.clipboard.writeText(url);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  const handleDelete = async (id: number) => {
    await deleteMut.mutateAsync({ id });
    utils.linkCompartilhavel.list.invalidate();
  };

  return (
    <ModulePage title="QR Code">
      <SmartSearch placeholder="Buscar QR Code..." onSearch={(q) => setSearchQuery(q)} showDateFilter={false} />

      <div className="px-4">
        {(isLoading || loadingCond) ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
          </div>
        ) : filtered.length === 0 && !showCreate ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-16 h-16 rounded-2xl bg-cyan-100 dark:bg-cyan-500/15 flex items-center justify-center mb-4">
              <QrCode className="w-7 h-7 text-cyan-500" />
            </div>
            <h3 className="font-semibold text-lg mb-1">
              {searchQuery ? 'Nenhum resultado' : 'Nenhum QR Code'}
            </h3>
            <p className="text-sm text-muted-foreground mb-6">
              {searchQuery ? 'Tente outro termo' : 'Gere seu primeiro código QR para compartilhar vistorias, manutenções e mais'}
            </p>
          </div>
        ) : (
          <div className="space-y-3 pb-24">
            {filtered.map((link: any) => {
              const tipoInfo = TIPOS.find((t) => t.value === link.tipo);
              const url = `${globalThis.location.origin}/compartilhado/${link.token}`;
              return (
                <div key={link.id} className="p-4 rounded-2xl bg-card border shadow-sm">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-cyan-100 dark:bg-cyan-500/15 flex items-center justify-center flex-shrink-0">
                      <Link2 className="w-5 h-5 text-cyan-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-sm truncate">{link.titulo || 'Link compartilhável'}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        {tipoInfo && (
                          <span className={`px-2 py-0.5 text-[10px] font-medium rounded-full ${tipoInfo.color}`}>
                            {tipoInfo.label}
                          </span>
                        )}
                        {link.expiraEm && (
                          <span className="text-[10px] text-muted-foreground">
                            Expira {new Date(link.expiraEm).toLocaleDateString('pt-BR')}
                          </span>
                        )}
                      </div>
                      <p className="text-[10px] text-muted-foreground mt-1 truncate">{url}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 mt-3 pt-3 border-t">
                    <button
                      onClick={() => handleCopy(link.token, link.id)}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-muted text-xs font-medium hover:bg-muted/80 transition-colors"
                    >
                      {copied === link.id ? <Check className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5" />}
                      {copied === link.id ? 'Copiado!' : 'Copiar'}
                    </button>
                    <a
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-muted text-xs font-medium hover:bg-muted/80 transition-colors"
                    >
                      <ExternalLink className="w-3.5 h-3.5" /> Abrir
                    </a>
                    <div className="flex-1" />
                    {(isAdmin || isMaster) && (
                      <button
                        onClick={() => handleDelete(link.id)}
                        className="p-1.5 rounded-lg hover:bg-red-100 dark:hover:bg-red-500/10 text-muted-foreground hover:text-red-500 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Create QR modal */}
      {showCreate && condId && <CreateQRModal condominioId={condId} onClose={() => setShowCreate(false)} />}

      {/* FAB */}
      {(isAdmin || isMaster) && (
        <button
          onClick={() => setShowCreate(true)}
          className="fixed bottom-20 right-4 w-14 h-14 bg-gradient-to-r from-cyan-500 to-cyan-600 text-white rounded-full shadow-lg flex items-center justify-center hover:shadow-xl transition-shadow z-20"
        >
          <Plus className="w-6 h-6" />
        </button>
      )}
    </ModulePage>
  );
}

function CreateQRModal({ condominioId, onClose }: { condominioId: number; onClose: () => void }) {
  const [titulo, setTitulo] = useState('');
  const [tipo, setTipo] = useState<string>('manutencao');
  const [saving, setSaving] = useState(false);
  const createMut = trpc.linkCompartilhavel.create.useMutation();
  const utils = trpc.useUtils();

  const handleCreate = async () => {
    setSaving(true);
    try {
      const token = crypto.randomUUID().replace(/-/g, '').slice(0, 21);
      await createMut.mutateAsync({
        condominioId,
        tipo: tipo as any,
        titulo: titulo.trim() || `QR ${tipo}`,
        token,
        itemId: 0,
      });
      utils.linkCompartilhavel.list.invalidate();
      onClose();
    } catch (err) {
      console.error('Erro ao criar QR:', err);
    } finally {
      setSaving(false);
    }
  };

  const inputCls = 'w-full px-4 py-3 rounded-xl bg-muted/50 border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/30';

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="w-full max-w-md bg-background rounded-t-3xl sm:rounded-3xl shadow-2xl animate-in slide-in-from-bottom duration-300">
        <div className="flex items-center justify-between p-5 border-b">
          <h2 className="text-lg font-bold">Novo QR Code</h2>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-muted"><X className="w-5 h-5" /></button>
        </div>
        <div className="p-5 space-y-4">
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1 block">Título</label>
            <input className={inputCls} placeholder="Nome do QR Code" value={titulo} onChange={(e) => setTitulo(e.target.value)} />
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1 block">Tipo</label>
            <div className="grid grid-cols-2 gap-2">
              {TIPOS.map((t) => (
                <button
                  key={t.value}
                  onClick={() => setTipo(t.value)}
                  className={`p-3 rounded-xl border text-sm font-medium transition-all ${
                    tipo === t.value ? 'border-primary bg-primary/5 text-primary' : 'border-border hover:bg-muted'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>
          <button
            onClick={handleCreate}
            disabled={saving}
            className="w-full py-3 bg-gradient-to-r from-cyan-500 to-cyan-600 text-white rounded-xl font-medium text-sm hover:shadow-lg disabled:opacity-50"
          >
            {saving ? 'Criando...' : 'Gerar QR Code'}
          </button>
        </div>
      </div>
    </div>
  );
}
