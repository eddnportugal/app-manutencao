// Sistema de permissões por módulo
export type UserRole = 'master' | 'admin' | 'supervisor' | 'funcionario';

export type ModuleId =
  | 'funcionarios'
  | 'equipe'
  | 'manutencao'
  | 'qrcode'
  | 'documentos'
  | 'agenda'
  | 'localizacao'
  | 'vistoria'
  | 'timeline';

export interface ModulePermission {
  moduleId: ModuleId;
  enabled: boolean;
}

export interface UserPermissions {
  userId: number;
  role: UserRole;
  modules: Record<ModuleId, boolean>;
}

// Módulos padrão: quais cada papel vê por default (antes do admin customizar)
export const DEFAULT_PERMISSIONS: Record<UserRole, Record<ModuleId, boolean>> = {
  master: {
    funcionarios: true,
    equipe: true,
    manutencao: true,
    qrcode: true,
    documentos: true,
    agenda: true,
    localizacao: true,
    vistoria: true,
    timeline: true,
  },
  admin: {
    funcionarios: true,
    equipe: true,
    manutencao: true,
    qrcode: true,
    documentos: true,
    agenda: true,
    localizacao: true,
    vistoria: true,
    timeline: true,
  },
  supervisor: {
    funcionarios: true,
    equipe: true,
    manutencao: true,
    qrcode: true,
    documentos: true,
    agenda: true,
    localizacao: false,
    vistoria: true,
    timeline: false,
  },
  funcionario: {
    funcionarios: false,
    equipe: true,
    manutencao: true,
    qrcode: true,
    documentos: true,
    agenda: true,
    localizacao: false,
    vistoria: true,
    timeline: false,
  },
};

// Todos os módulos na ordem do menu
export const ALL_MODULES: ModuleId[] = [
  'funcionarios',
  'equipe',
  'manutencao',
  'qrcode',
  'documentos',
  'agenda',
  'localizacao',
  'vistoria',
  'timeline',
];
