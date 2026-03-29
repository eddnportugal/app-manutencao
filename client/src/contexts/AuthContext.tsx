import { createContext, useContext, useState, useEffect, useMemo, type ReactNode } from 'react';
import type { UserRole, ModuleId } from '@/types/permissions';
import { DEFAULT_PERMISSIONS } from '@/types/permissions';
import { trpc } from '@/lib/trpc';

interface AuthUser {
  id: number;
  name: string;
  email: string;
  whatsapp?: string;
  role: UserRole;
  avatarUrl?: string;
  empresa?: string;
  cnpj?: string;
  logoUrl?: string;
  assinaturaUrl?: string;
  endereco?: string;
  cpfCnpj?: string;
  // Período de teste
  trialEndsAt?: string;
  isAdimplente?: boolean;
  isBloqueado?: boolean;
}

interface AuthContextType {
  user: AuthUser | null;
  isLoading: boolean;
  permissions: Record<ModuleId, boolean>;
  hasModule: (moduleId: ModuleId) => boolean;
  isMaster: boolean;
  isAdmin: boolean;
  isSupervisor: boolean;
  isFuncionario: boolean;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const { data: serverUser, isLoading } = trpc.auth.me.useQuery(undefined, {
    retry: false,
    staleTime: 5 * 60 * 1000,
  });

  const [user, setUser] = useState<AuthUser | null>(null);
  const [permissions, setPermissions] = useState<Record<ModuleId, boolean>>(
    DEFAULT_PERMISSIONS.funcionario,
  );

  useEffect(() => {
    if (serverUser) {
      const role = (serverUser.role as UserRole) || 'funcionario';
      setUser({
        id: serverUser.id,
        name: serverUser.name || '',
        email: serverUser.email || '',
        role,
        avatarUrl: (serverUser as any).avatarUrl,
        empresa: (serverUser as any).empresa,
      });

      // Se o backend enviar permissões customizadas, usar. Senão, usar padrão do role.
      const customPerms = (serverUser as any).modulePermissions;
      if (customPerms && typeof customPerms === 'object') {
        setPermissions({ ...DEFAULT_PERMISSIONS[role], ...customPerms });
      } else {
        setPermissions(DEFAULT_PERMISSIONS[role]);
      }
    } else if (!isLoading) {
      setUser(null);
    }
  }, [serverUser, isLoading]);

  const hasModule = (moduleId: ModuleId) => !!permissions[moduleId];
  const role = user?.role;

  const logout = () => {
    localStorage.removeItem('app_session_token');
    document.cookie = 'app_session_id=; Max-Age=0; path=/';
    globalThis.location.href = '/login';
  };

  const value = useMemo(
    () => ({
      user,
      isLoading,
      permissions,
      hasModule,
      isMaster: role === 'master',
      isAdmin: role === 'admin',
      isSupervisor: role === 'supervisor',
      isFuncionario: role === 'funcionario',
      logout,
    }),
    [user, isLoading, permissions, role],
  );

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
