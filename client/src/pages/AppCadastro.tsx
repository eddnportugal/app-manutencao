import { useState } from 'react';
import { Link, useLocation } from 'wouter';
import { trpc } from '@/lib/trpc';
import { toast } from '@/components/ui/sonner';
import { maskPhone } from '@/lib/utils';
import { Loader2, ArrowLeft } from 'lucide-react';

export default function AppCadastro() {
  const [, setLocation] = useLocation();

  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [cnpj, setCnpj] = useState('');

  const registerMutation = trpc.auth.register.useMutation({
    onSuccess: (data) => {
      toast.success(data.message || 'Cadastro realizado com sucesso!');
      setLocation('/app/login');
    },
    onError: (error) => {
      toast.error(error.message || 'Erro ao cadastrar');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nome || !email || !whatsapp) {
      toast.error('Preencha nome, e-mail e WhatsApp');
      return;
    }
    registerMutation.mutate({
      name: nome,
      email,
      whatsapp,
      cnpj: cnpj || undefined,
    } as any);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-amber-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-6">
          <Link href="/" className="inline-block">
            <img src="/logo-login.png" alt="App Manutenção" className="h-20 mx-auto" />
          </Link>
          <p className="text-muted-foreground mt-2 text-sm">Crie sua conta gratuita</p>
        </div>

        {/* Card */}
        <div className="bg-card rounded-2xl shadow-xl border p-6 space-y-5">
          <div className="text-center">
            <h1 className="text-xl font-bold">Cadastro</h1>
            <p className="text-xs text-muted-foreground mt-1">
              Comece a usar agora — sem aprovação
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-sm text-muted-foreground mb-1.5 block">
                CNPJ ou Nome da Empresa <span className="text-xs">(opcional)</span>
              </label>
              <input
                type="text"
                value={cnpj}
                onChange={(e) => setCnpj(e.target.value)}
                placeholder="00.000.000/0000-00 ou nome"
                className="w-full px-4 py-3 rounded-xl bg-muted border-0 text-sm focus:ring-2 focus:ring-primary/30 outline-none"
                disabled={registerMutation.isPending}
              />
            </div>

            <div>
              <label className="text-sm text-muted-foreground mb-1.5 block">Nome *</label>
              <input
                type="text"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                placeholder="Seu nome completo"
                className="w-full px-4 py-3 rounded-xl bg-muted border-0 text-sm focus:ring-2 focus:ring-primary/30 outline-none"
                disabled={registerMutation.isPending}
                required
              />
            </div>

            <div>
              <label className="text-sm text-muted-foreground mb-1.5 block">E-mail *</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="email@exemplo.com"
                className="w-full px-4 py-3 rounded-xl bg-muted border-0 text-sm focus:ring-2 focus:ring-primary/30 outline-none"
                disabled={registerMutation.isPending}
                required
              />
            </div>

            <div>
              <label className="text-sm text-muted-foreground mb-1.5 block">WhatsApp *</label>
              <input
                type="tel"
                value={whatsapp}
                onChange={(e) => setWhatsapp(maskPhone(e.target.value))}
                placeholder="(11) 99999-9999"
                className="w-full px-4 py-3 rounded-xl bg-muted border-0 text-sm focus:ring-2 focus:ring-primary/30 outline-none"
                disabled={registerMutation.isPending}
                required
              />
            </div>

            <button
              type="submit"
              disabled={registerMutation.isPending}
              className="w-full py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-xl font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg transition-shadow flex items-center justify-center gap-2"
            >
              {registerMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Cadastrando...
                </>
              ) : (
                'Criar Conta'
              )}
            </button>
          </form>

          <div className="text-center text-sm text-muted-foreground">
            Já tem conta?{' '}
            <Link href="/app/login" className="text-primary font-medium hover:underline">
              Entrar
            </Link>
          </div>
        </div>

        <p className="text-center text-xs text-muted-foreground mt-4">
          Período de teste gratuito incluído.{' '}
          <span className="font-medium">R$99/mês</span> após o período de teste.
        </p>
        <p className="text-center text-xs text-muted-foreground mt-2">
          Ao se cadastrar, você concorda com os{' '}
          <Link href="/app/termos" className="underline hover:text-foreground">Termos de Uso</Link>{' '}
          e{' '}
          <Link href="/app/privacidade" className="underline hover:text-foreground">Política de Privacidade</Link>
        </p>
      </div>
    </div>
  );
}
