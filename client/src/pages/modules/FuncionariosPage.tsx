import ModulePage from '@/components/layout/ModulePage';
import SmartSearch from '@/components/shared/SmartSearch';
import FuncionarioWizard from '@/components/shared/FuncionarioWizard';
import { useAuth } from '@/contexts/AuthContext';
import { Plus, Users, Phone, Mail, ChevronRight, Loader2 } from 'lucide-react';
import { useState } from 'react';
import { trpc } from '@/lib/trpc';
import { useCondominioAtivo } from '@/hooks/useCondominioAtivo';

export default function FuncionariosPage() {
  const { isAdmin, isMaster } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [showWizard, setShowWizard] = useState(false);
  const { condominioAtivo, isLoading: loadingCond } = useCondominioAtivo();

  const condId = condominioAtivo?.id;

  const { data: funcionarios, isLoading } = trpc.funcionario.list.useQuery(
    { condominioId: condId! },
    { enabled: !!condId },
  );

  const filtered = (funcionarios || []).filter((f: any) =>
    !searchQuery || f.nome?.toLowerCase().includes(searchQuery.toLowerCase()) || f.cargo?.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const tipoColor: Record<string, string> = {
    supervisor: 'bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400',
    gerente: 'bg-purple-100 text-purple-700 dark:bg-purple-500/20 dark:text-purple-400',
    zelador: 'bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-400',
    porteiro: 'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400',
    auxiliar: 'bg-gray-100 text-gray-700 dark:bg-gray-500/20 dark:text-gray-400',
  };

  return (
    <ModulePage title="Funcionários">
      <SmartSearch
        placeholder="Buscar funcionário..."
        onSearch={(q) => setSearchQuery(q)}
        showDateFilter={false}
      />

      <div className="px-4">
        {(isLoading || loadingCond) ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-16 h-16 rounded-2xl bg-purple-100 dark:bg-purple-500/15 flex items-center justify-center mb-4">
              <Users className="w-7 h-7 text-purple-500" />
            </div>
            <h3 className="font-semibold text-lg mb-1">
              {searchQuery ? 'Nenhum resultado' : 'Nenhum funcionário'}
            </h3>
            <p className="text-sm text-muted-foreground mb-6">
              {searchQuery ? 'Tente outro termo de busca' : 'Cadastre seu primeiro funcionário'}
            </p>
          </div>
        ) : (
          <div className="space-y-3 pb-24">
            {filtered.map((f: any) => {
              const initials = (f.nome || 'F').split(' ').map((w: string) => w[0]).join('').slice(0, 2).toUpperCase();
              return (
                <div
                  key={f.id}
                  className="flex items-center gap-3 p-4 rounded-2xl bg-card border shadow-sm hover:shadow-md transition-shadow"
                >
                  {f.fotoUrl ? (
                    <img src={f.fotoUrl} alt={f.nome} className="w-12 h-12 rounded-xl object-cover" />
                  ) : (
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-400 to-violet-500 flex items-center justify-center flex-shrink-0">
                      <span className="text-sm font-bold text-white">{initials}</span>
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-sm truncate">{f.nome}</h3>
                    <div className="flex items-center gap-2 mt-0.5">
                      {f.tipoFuncionario && (
                        <span className={`px-2 py-0.5 text-[10px] font-medium rounded-full ${tipoColor[f.tipoFuncionario] || tipoColor.auxiliar}`}>
                          {f.tipoFuncionario}
                        </span>
                      )}
                      {f.cargo && <span className="text-[10px] text-muted-foreground">{f.cargo}</span>}
                    </div>
                    <div className="flex items-center gap-3 mt-1 text-[10px] text-muted-foreground">
                      {f.telefone && (
                        <span className="flex items-center gap-0.5">
                          <Phone className="w-3 h-3" /> {f.telefone}
                        </span>
                      )}
                      {f.email && (
                        <span className="flex items-center gap-0.5">
                          <Mail className="w-3 h-3" /> {f.email}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className={`w-2.5 h-2.5 rounded-full ${f.ativo !== false ? 'bg-green-500' : 'bg-gray-300'}`} />
                    <ChevronRight className="w-4 h-4 text-muted-foreground" />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* FAB */}
      {(isAdmin || isMaster) && (
        <button
          onClick={() => setShowWizard(true)}
          className="fixed bottom-20 right-4 w-14 h-14 bg-gradient-to-r from-purple-500 to-violet-600 text-white rounded-full shadow-lg flex items-center justify-center hover:shadow-xl transition-shadow z-20"
        >
          <Plus className="w-6 h-6" />
        </button>
      )}

      {/* Wizard modal */}
      {showWizard && <FuncionarioWizard onClose={() => setShowWizard(false)} />}
    </ModulePage>
  );
}
