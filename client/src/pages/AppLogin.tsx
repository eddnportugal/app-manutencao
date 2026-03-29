import { useState, useEffect } from 'react';
import { Link, useLocation, useSearch } from 'wouter';
import { trpc } from '@/lib/trpc';
import { toast } from '@/components/ui/sonner';
import { Loader2, Eye, EyeOff, AlertTriangle, MessageCircle, ExternalLink } from 'lucide-react';

export default function AppLogin() {
  const [, setLocation] = useLocation();
  const searchString = useSearch();
  const utils = trpc.useUtils();

  const [identificador, setIdentificador] = useState(''); // email ou telefone
  const [senha, setSenha] = useState('');
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [mensagemBloqueio, setMensagemBloqueio] = useState<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(searchString);
    const bloqueado = params.get('bloqueado');
    const mensagem = params.get('mensagem');
    if (bloqueado === 'true' && mensagem) {
      setMensagemBloqueio(decodeURIComponent(mensagem));
    }
  }, [searchString]);

  const loginMutation = trpc.auth.loginLocal.useMutation({
    onSuccess: async (data) => {
      toast.success(data.message);
      if (data.token) {
        localStorage.setItem('app_session_token', data.token);
      }
      try {
        await utils.auth.me.invalidate();
        await utils.auth.me.fetch();
      } catch {
        // continue anyway
      }
      setLocation('/app/dashboard');
    },
    onError: (error) => {
      toast.error(error.message || 'Erro ao fazer login');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!identificador || !senha) {
      toast.error('Preencha todos os campos');
      return;
    }
    // O backend aceita "email" — mandamos o identificador (pode ser e-mail ou telefone)
    loginMutation.mutate({ email: identificador, senha });
  };

  // Máscara para senha 6 dígitos numéricos
  const handleSenhaChange = (v: string) => {
    const digits = v.replace(/\D/g, '').slice(0, 6);
    setSenha(digits);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-amber-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-block">
            <img src="/logo-login.png" alt="App Manutenção" className="h-20 mx-auto" />
          </Link>
          <p className="text-muted-foreground mt-2 text-sm">Acesse sua conta</p>
        </div>

        {/* Bloqueio */}
        {mensagemBloqueio && (
          <div className="mb-4 p-3 rounded-xl bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
            <p className="text-sm text-red-600 dark:text-red-400">{mensagemBloqueio}</p>
          </div>
        )}

        {/* Card */}
        <div className="bg-card rounded-2xl shadow-xl border p-6 space-y-5">
          <div className="text-center">
            <h1 className="text-xl font-bold">Entrar</h1>
            <p className="text-xs text-muted-foreground mt-1">
              Use seu e-mail ou telefone
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-sm text-muted-foreground mb-1.5 block">E-mail ou Telefone</label>
              <input
                type="text"
                value={identificador}
                onChange={(e) => setIdentificador(e.target.value)}
                placeholder="email@exemplo.com ou (11) 99999-9999"
                className="w-full px-4 py-3 rounded-xl bg-muted border-0 text-sm focus:ring-2 focus:ring-primary/30 outline-none"
                disabled={loginMutation.isPending}
                autoComplete="username"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-sm text-muted-foreground">Senha (6 dígitos)</label>
                <Link href="/recuperar-senha" className="text-xs text-primary hover:underline">
                  Esqueci minha senha
                </Link>
              </div>
              <div className="relative">
                <input
                  type={mostrarSenha ? 'text' : 'password'}
                  value={senha}
                  onChange={(e) => handleSenhaChange(e.target.value)}
                  placeholder="••••••"
                  inputMode="numeric"
                  maxLength={6}
                  className="w-full px-4 py-3 rounded-xl bg-muted border-0 text-sm tracking-[0.3em] text-center focus:ring-2 focus:ring-primary/30 outline-none"
                  disabled={loginMutation.isPending}
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setMostrarSenha(!mostrarSenha)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {mostrarSenha ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {/* 6 dots indicator */}
              <div className="flex justify-center gap-2 mt-2">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div
                    key={i}
                    className={`w-2.5 h-2.5 rounded-full transition-colors ${
                      i < senha.length
                        ? 'bg-orange-500'
                        : 'bg-gray-200 dark:bg-gray-700'
                    }`}
                  />
                ))}
              </div>
            </div>

            <button
              type="submit"
              disabled={loginMutation.isPending || senha.length < 6}
              className="w-full py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-xl font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg transition-shadow flex items-center justify-center gap-2"
            >
              {loginMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Entrando...
                </>
              ) : (
                'Entrar'
              )}
            </button>
          </form>

          <div className="text-center text-sm text-muted-foreground">
            Não tem conta?{' '}
            <Link href="/app/cadastro" className="text-primary font-medium hover:underline">
              Cadastre-se
            </Link>
          </div>
        </div>

        {/* Bottom links */}
        <div className="mt-6 flex justify-center gap-4">
          <a
            href="https://wa.me/5511933284364"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            <MessageCircle className="w-3.5 h-3.5" />
            Suporte
          </a>
          <Link
            href="/app"
            className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            Conheça o sistema
          </Link>
        </div>

        <p className="text-center text-xs text-muted-foreground mt-4">
          Ao entrar, você concorda com nossos{' '}
          <Link href="/app/termos" className="underline hover:text-foreground">
            Termos de Uso
          </Link>{' '}
          e{' '}
          <Link href="/app/privacidade" className="underline hover:text-foreground">
            Política de Privacidade
          </Link>
        </p>
      </div>
    </div>
  );
}
