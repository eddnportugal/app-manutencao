import { useState } from 'react';
import { ArrowLeft, Search, Plus, Edit2, Ban, Trash2, CheckCircle, XCircle, Clock } from 'lucide-react';
import { useLocation } from 'wouter';
import SmartSearch from '@/components/shared/SmartSearch';

interface Cliente {
  id: number;
  nome: string;
  email: string;
  whatsapp: string;
  criadoEm: string;
  trialEndsAt: string;
  adimplente: boolean;
  bloqueado: boolean;
}

function diasRestantes(isoDate: string): number {
  const diff = new Date(isoDate).getTime() - Date.now();
  return Math.max(0, Math.ceil(diff / 86_400_000));
}

function tempoDecorrido(isoDate: string): string {
  const diff = Date.now() - new Date(isoDate).getTime();
  const dias = Math.floor(diff / 86_400_000);
  if (dias < 1) return 'Hoje';
  if (dias === 1) return '1 dia';
  if (dias < 30) return `${dias} dias`;
  const meses = Math.floor(dias / 30);
  return meses === 1 ? '1 mês' : `${meses} meses`;
}

export default function MasterPanelPage() {
  const [, setLocation] = useLocation();
  const [busca, setBusca] = useState('');
  const [clientes] = useState<Cliente[]>([]); // will come from tRPC

  const filtered = clientes.filter(
    (c) =>
      c.nome.toLowerCase().includes(busca.toLowerCase()) ||
      c.email.toLowerCase().includes(busca.toLowerCase()),
  );

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <div className="sticky top-0 z-30 bg-background/80 backdrop-blur-lg border-b px-4 py-3 flex items-center gap-3 safe-area-top">
        <button
          onClick={() => setLocation('/app/dashboard')}
          className="p-2 -ml-2 rounded-xl hover:bg-muted"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="font-bold text-lg">Painel Master</h1>
        <button className="ml-auto px-4 py-2 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-xl text-sm font-medium">
          <Plus className="w-4 h-4 inline mr-1" />
          Novo Cliente
        </button>
      </div>

      <div className="px-4 py-4">
        {/* Search */}
        <SmartSearch
          value={busca}
          onChange={setBusca}
          placeholder="Buscar clientes..."
        />

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 mt-4">
          <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-500/10">
            <p className="text-2xl font-bold text-blue-600">{clientes.length}</p>
            <p className="text-xs text-muted-foreground">Total</p>
          </div>
          <div className="p-3 rounded-xl bg-green-50 dark:bg-green-500/10">
            <p className="text-2xl font-bold text-green-600">
              {clientes.filter((c) => c.adimplente).length}
            </p>
            <p className="text-xs text-muted-foreground">Adimplentes</p>
          </div>
          <div className="p-3 rounded-xl bg-red-50 dark:bg-red-500/10">
            <p className="text-2xl font-bold text-red-600">
              {clientes.filter((c) => !c.adimplente).length}
            </p>
            <p className="text-xs text-muted-foreground">Inadimplentes</p>
          </div>
        </div>

        {/* Client list */}
        <div className="mt-6 space-y-3">
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="w-16 h-16 rounded-2xl bg-orange-100 dark:bg-orange-500/15 flex items-center justify-center mb-4">
                <Search className="w-7 h-7 text-orange-500" />
              </div>
              <h3 className="font-semibold text-lg mb-1">Nenhum cliente</h3>
              <p className="text-sm text-muted-foreground">
                Os cadastros aparecerão aqui
              </p>
            </div>
          ) : (
            filtered.map((cliente) => {
              const dias = diasRestantes(cliente.trialEndsAt);
              return (
                <div
                  key={cliente.id}
                  className="p-4 rounded-2xl bg-card border shadow-sm space-y-3"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold">{cliente.nome}</h3>
                      <p className="text-xs text-muted-foreground">{cliente.email}</p>
                    </div>
                    <div className="flex gap-1.5">
                      {cliente.adimplente ? (
                        <span className="px-2 py-0.5 text-xs rounded-full bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-400">
                          Adimplente
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 text-xs rounded-full bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400">
                          Inadimplente
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span>Cadastro: {tempoDecorrido(cliente.criadoEm)} atrás</span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {dias > 0 ? `${dias} dias restantes` : 'Trial expirado'}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 pt-1">
                    <button className="flex-1 py-2 rounded-lg text-xs font-medium bg-muted hover:bg-muted/80 flex items-center justify-center gap-1">
                      <Edit2 className="w-3.5 h-3.5" /> Editar
                    </button>
                    <button className="flex-1 py-2 rounded-lg text-xs font-medium bg-amber-50 text-amber-600 hover:bg-amber-100 dark:bg-amber-500/10 flex items-center justify-center gap-1">
                      <Ban className="w-3.5 h-3.5" /> {cliente.bloqueado ? 'Desbloquear' : 'Bloquear'}
                    </button>
                    <button className="flex-1 py-2 rounded-lg text-xs font-medium bg-red-50 text-red-600 hover:bg-red-100 dark:bg-red-500/10 flex items-center justify-center gap-1">
                      <Trash2 className="w-3.5 h-3.5" /> Excluir
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
