import type { ModuleId, UserRole } from '@/types/permissions';
import {
  Wrench,
  Users,
  UsersRound,
  QrCode,
  FileText,
  CalendarDays,
  MapPin,
  ClipboardCheck,
  Clock,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

export type DashboardStyle = 'cards-gradiente' | 'grid-clean' | 'lista-moderna' | 'bolhas-circular';

export interface ModuleConfig {
  id: ModuleId;
  label: string;
  description: string;
  icon: LucideIcon;
  route: string;
  gradient: string; // tailwind gradient classes
  color: string;    // hex for circle/icon bg
}

export const MODULES: ModuleConfig[] = [
  {
    id: 'funcionarios',
    label: 'Funcionários',
    description: 'Cadastro e gestão',
    icon: Users,
    route: '/app/funcionarios',
    gradient: 'from-purple-500 to-violet-600',
    color: '#8b5cf6',
  },
  {
    id: 'equipe',
    label: 'Equipe',
    description: 'Chat, OS compartilhadas',
    icon: UsersRound,
    route: '/app/equipe',
    gradient: 'from-blue-500 to-blue-600',
    color: '#3b82f6',
  },
  {
    id: 'manutencao',
    label: 'Manutenção',
    description: 'Criar e gerenciar OS',
    icon: Wrench,
    route: '/app/manutencao',
    gradient: 'from-orange-500 to-orange-600',
    color: '#f97316',
  },
  {
    id: 'qrcode',
    label: 'QR Code',
    description: 'Gerar códigos e links',
    icon: QrCode,
    route: '/app/qrcode',
    gradient: 'from-cyan-500 to-cyan-600',
    color: '#06b6d4',
  },
  {
    id: 'documentos',
    label: 'Documentos',
    description: 'Recibos, contratos, OS',
    icon: FileText,
    route: '/app/documentos',
    gradient: 'from-emerald-500 to-emerald-600',
    color: '#10b981',
  },
  {
    id: 'agenda',
    label: 'Agenda',
    description: 'Calendário e vencimentos',
    icon: CalendarDays,
    route: '/app/agenda',
    gradient: 'from-amber-500 to-amber-600',
    color: '#f59e0b',
  },
  {
    id: 'localizacao',
    label: 'Localização',
    description: 'Rastrear equipe',
    icon: MapPin,
    route: '/app/localizacao',
    gradient: 'from-red-500 to-red-600',
    color: '#ef4444',
  },
  {
    id: 'vistoria',
    label: 'Vistoria',
    description: 'Inspeções e checklist',
    icon: ClipboardCheck,
    route: '/app/vistoria',
    gradient: 'from-teal-500 to-teal-600',
    color: '#14b8a6',
  },
  {
    id: 'timeline',
    label: 'Timeline',
    description: 'Atividades em tempo real',
    icon: Clock,
    route: '/app/timeline',
    gradient: 'from-pink-500 to-pink-600',
    color: '#ec4899',
  },
];

// Dado um role e permissões customizadas, retorna os módulos visíveis na ordem correta
export function getVisibleModules(
  role: UserRole,
  permissions: Record<ModuleId, boolean>,
): ModuleConfig[] {
  return MODULES.filter((m) => permissions[m.id]);
}
