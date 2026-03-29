import { useState } from 'react';
import { trpc } from '@/lib/trpc';
import { useCondominioAtivo } from '@/hooks/useCondominioAtivo';
import { ALL_MODULES, type ModuleId } from '@/types/permissions';
import { MODULES } from '@/config/modules';
import { X, ChevronRight, ChevronLeft, User, Lock, Shield, Loader2, Check } from 'lucide-react';
import { maskPhone } from '@/lib/utils';

interface FuncionarioWizardProps {
  onClose: () => void;
  onSuccess?: () => void;
}

const TIPOS = [
  { value: 'zelador', label: 'Zelador' },
  { value: 'porteiro', label: 'Porteiro' },
  { value: 'supervisor', label: 'Supervisor' },
  { value: 'gerente', label: 'Gerente' },
  { value: 'auxiliar', label: 'Auxiliar' },
  { value: 'sindico_externo', label: 'Síndico Externo' },
] as const;

const STEPS = [
  { icon: User, label: 'Dados Pessoais' },
  { icon: Lock, label: 'Credenciais' },
  { icon: Shield, label: 'Permissões' },
];

export default function FuncionarioWizard({ onClose, onSuccess }: FuncionarioWizardProps) {
  const { condominioAtivo } = useCondominioAtivo();
  const utils = trpc.useUtils();

  const [step, setStep] = useState(0);
  const [saving, setSaving] = useState(false);

  // Step 1 — dados pessoais
  const [nome, setNome] = useState('');
  const [cargo, setCargo] = useState('');
  const [departamento, setDepartamento] = useState('');
  const [telefone, setTelefone] = useState('');
  const [email, setEmail] = useState('');
  const [tipo, setTipo] = useState<string>('auxiliar');

  // Step 2 — credenciais
  const [loginEmail, setLoginEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [loginAtivo, setLoginAtivo] = useState(true);

  // Step 3 — permissões (módulos habilitados)
  const [perms, setPerms] = useState<Record<ModuleId, boolean>>(() => {
    const p: any = {};
    ALL_MODULES.forEach((m) => (p[m] = true));
    return p;
  });

  const createMut = trpc.funcionario.create.useMutation();
  const configLoginMut = trpc.funcionario.configurarLogin.useMutation();
  const updateFuncoesMut = trpc.funcionario.updateFuncoes.useMutation();

  const canNext = () => {
    if (step === 0) return nome.trim().length >= 2;
    if (step === 1) return true; // credenciais é opcional
    return true;
  };

  const handleFinish = async () => {
    if (!condominioAtivo) return;
    setSaving(true);
    try {
      // 1. Criar funcionário
      const created = await createMut.mutateAsync({
        condominioId: condominioAtivo.id,
        nome: nome.trim(),
        cargo: cargo.trim() || undefined,
        departamento: departamento.trim() || undefined,
        telefone: telefone.trim() || undefined,
        email: email.trim() || undefined,
        tipoFuncionario: tipo as any,
      });

      const funcId = (created as any)?.id ?? (created as any)?.funcionarioId;

      // 2. Configurar login se dados preenchidos
      if (funcId && loginEmail.trim() && senha.trim()) {
        await configLoginMut.mutateAsync({
          funcionarioId: funcId,
          loginEmail: loginEmail.trim(),
          senha: senha.trim(),
          loginAtivo,
        });
      }

      // 3. Salvar permissões de módulos
      if (funcId) {
        const funcoes = ALL_MODULES.map((m) => ({
          funcaoKey: m,
          habilitada: perms[m],
        }));
        await updateFuncoesMut.mutateAsync({ funcionarioId: funcId, funcoes });
      }

      utils.funcionario.list.invalidate();
      onSuccess?.();
      onClose();
    } catch (err) {
      console.error('Erro ao criar funcionário:', err);
    } finally {
      setSaving(false);
    }
  };

  const inputCls =
    'w-full px-4 py-3 rounded-xl bg-muted/50 border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all';

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="w-full max-w-lg bg-background rounded-t-3xl sm:rounded-3xl shadow-2xl max-h-[90vh] flex flex-col animate-in slide-in-from-bottom duration-300">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b">
          <h2 className="text-lg font-bold">Novo Funcionário</h2>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-muted transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Step indicator */}
        <div className="flex items-center gap-1 px-5 pt-4">
          {STEPS.map((s, i) => {
            const Icon = s.icon;
            const done = i < step;
            const active = i === step;
            return (
              <div key={i} className="flex items-center flex-1">
                <div
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                    active
                      ? 'bg-primary text-primary-foreground'
                      : done
                        ? 'bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-400'
                        : 'bg-muted text-muted-foreground'
                  }`}
                >
                  {done ? <Check className="w-3.5 h-3.5" /> : <Icon className="w-3.5 h-3.5" />}
                  <span className="hidden sm:inline">{s.label}</span>
                </div>
                {i < STEPS.length - 1 && (
                  <div className={`flex-1 h-0.5 mx-1 rounded ${done ? 'bg-green-400' : 'bg-muted'}`} />
                )}
              </div>
            );
          })}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {step === 0 && (
            <>
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Nome *</label>
                <input className={inputCls} placeholder="Nome completo" value={nome} onChange={(e) => setNome(e.target.value)} />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Tipo</label>
                <select className={inputCls} value={tipo} onChange={(e) => setTipo(e.target.value)}>
                  {TIPOS.map((t) => (
                    <option key={t.value} value={t.value}>{t.label}</option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1 block">Cargo</label>
                  <input className={inputCls} placeholder="Cargo" value={cargo} onChange={(e) => setCargo(e.target.value)} />
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1 block">Departamento</label>
                  <input className={inputCls} placeholder="Departamento" value={departamento} onChange={(e) => setDepartamento(e.target.value)} />
                </div>
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Telefone</label>
                <input className={inputCls} placeholder="(00) 00000-0000" value={telefone} onChange={(e) => setTelefone(maskPhone(e.target.value))} />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">E-mail</label>
                <input className={inputCls} type="email" placeholder="email@exemplo.com" value={email} onChange={(e) => setEmail(e.target.value)} />
              </div>
            </>
          )}

          {step === 1 && (
            <>
              <p className="text-sm text-muted-foreground">
                Defina as credenciais de acesso deste funcionário ao app. Opcional — pode configurar depois.
              </p>
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">E-mail de login</label>
                <input className={inputCls} type="email" placeholder="login@exemplo.com" value={loginEmail} onChange={(e) => setLoginEmail(e.target.value)} />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Senha (6 dígitos)</label>
                <input
                  className={inputCls}
                  type="password"
                  inputMode="numeric"
                  maxLength={6}
                  placeholder="••••••"
                  value={senha}
                  onChange={(e) => setSenha(e.target.value.replace(/\D/g, '').slice(0, 6))}
                />
              </div>
              <label className="flex items-center gap-3 cursor-pointer">
                <div
                  className={`w-11 h-6 rounded-full relative transition-colors ${loginAtivo ? 'bg-primary' : 'bg-muted'}`}
                  onClick={() => setLoginAtivo(!loginAtivo)}
                >
                  <div
                    className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-transform ${
                      loginAtivo ? 'translate-x-[22px]' : 'translate-x-0.5'
                    }`}
                  />
                </div>
                <span className="text-sm font-medium">Login ativo</span>
              </label>
            </>
          )}

          {step === 2 && (
            <>
              <p className="text-sm text-muted-foreground">
                Selecione quais módulos este funcionário poderá acessar.
              </p>
              <div className="space-y-2">
                {ALL_MODULES.map((modId) => {
                  const cfg = MODULES.find((m) => m.id === modId);
                  if (!cfg) return null;
                  const Icon = cfg.icon;
                  return (
                    <label
                      key={modId}
                      className="flex items-center gap-3 p-3 rounded-xl bg-card border cursor-pointer hover:bg-muted/50 transition-colors"
                    >
                      <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${cfg.color}`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <span className="flex-1 text-sm font-medium">{cfg.label}</span>
                      <input
                        type="checkbox"
                        checked={perms[modId]}
                        onChange={() => setPerms((p) => ({ ...p, [modId]: !p[modId] }))}
                        className="w-5 h-5 rounded accent-primary"
                      />
                    </label>
                  );
                })}
              </div>
            </>
          )}
        </div>

        {/* Footer buttons */}
        <div className="flex items-center gap-3 p-5 border-t">
          {step > 0 && (
            <button
              onClick={() => setStep(step - 1)}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-muted text-sm font-medium hover:bg-muted/80 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" /> Voltar
            </button>
          )}
          <div className="flex-1" />
          {step < 2 ? (
            <button
              onClick={() => setStep(step + 1)}
              disabled={!canNext()}
              className="flex items-center gap-1.5 px-6 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-40"
            >
              Próximo <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={handleFinish}
              disabled={saving || !canNext()}
              className="flex items-center gap-1.5 px-6 py-2.5 rounded-xl bg-gradient-to-r from-purple-500 to-violet-600 text-white text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-40"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
              {saving ? 'Salvando...' : 'Criar Funcionário'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
