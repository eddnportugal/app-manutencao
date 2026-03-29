import { useAuth } from '@/contexts/AuthContext';
import { useLocation } from 'wouter';
import { Bell, Settings, ChevronLeft } from 'lucide-react';
import { useState, useEffect, type ReactNode } from 'react';

interface AppShellProps {
  children: ReactNode;
  title?: string;
  showBack?: boolean;
}

export default function AppShell({ children, title, showBack }: AppShellProps) {
  const { user, logout } = useAuth();
  const [, setLocation] = useLocation();
  const [trialDays, setTrialDays] = useState<number | null>(null);

  // Calcula dias restantes do trial
  useEffect(() => {
    if (user?.trialEndsAt) {
      const ends = new Date(user.trialEndsAt);
      const now = new Date();
      const diff = Math.ceil((ends.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      setTrialDays(diff > 0 ? diff : 0);
    }
  }, [user?.trialEndsAt]);

  const initials = user?.name
    ? user.name
        .split(' ')
        .slice(0, 2)
        .map((w) => w[0])
        .join('')
        .toUpperCase()
    : 'U';

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Trial Banner */}
      {trialDays !== null && trialDays <= 15 && (
        <div className="bg-gradient-to-r from-amber-500 to-orange-500 text-white text-center py-2 px-4 text-sm font-medium">
          {trialDays > 0 ? (
            <>
              Faltam <strong>{trialDays} dias</strong> de teste.{' '}
              <a
                href="https://wa.me/5511933284364?text=Olá! Gostaria de contratar o App Manutenção."
                target="_blank"
                rel="noopener noreferrer"
                className="underline font-bold hover:text-white/90"
              >
                Para contratar, clique aqui
              </a>
            </>
          ) : (
            <>
              Seu período de teste expirou.{' '}
              <a
                href="https://wa.me/5511933284364?text=Olá! Gostaria de contratar o App Manutenção."
                target="_blank"
                rel="noopener noreferrer"
                className="underline font-bold hover:text-white/90"
              >
                Clique aqui para contratar
              </a>
            </>
          )}
        </div>
      )}

      {/* Header */}
      <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-xl border-b border-border">
        <div className="flex items-center justify-between px-4 h-14 max-w-screen-xl mx-auto">
          {/* Left */}
          <div className="flex items-center gap-3">
            {showBack ? (
              <button
                onClick={() => window.history.back()}
                className="p-2 -ml-2 rounded-xl hover:bg-muted transition-colors"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
            ) : null}
            <h1 className="text-lg font-bold truncate">
              {title || `Olá, ${user?.name?.split(' ')[0] || 'Usuário'} 👋`}
            </h1>
          </div>

          {/* Right */}
          <div className="flex items-center gap-2">
            {/* Notifications Bell */}
            <button
              onClick={() => setLocation('/app/notificacoes')}
              className="relative p-2 rounded-xl hover:bg-muted transition-colors"
            >
              <Bell className="w-5 h-5" />
              {/* Badge - será dinâmico */}
            </button>

            {/* Avatar → Minha Conta */}
            <button
              onClick={() => setLocation('/app/conta')}
              className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-500 to-orange-600 text-white font-bold text-sm flex items-center justify-center hover:shadow-lg transition-shadow"
            >
              {user?.avatarUrl ? (
                <img
                  src={user.avatarUrl}
                  alt={user.name}
                  className="w-full h-full rounded-full object-cover"
                />
              ) : (
                initials
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 pb-20">{children}</main>
    </div>
  );
}
