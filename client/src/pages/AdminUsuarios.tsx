import { useState } from "react";
// DashboardLayout removido - agora renderizado dentro do Dashboard.tsx
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { trpc } from "@/lib/trpc";
import { maskPhone } from "@/lib/utils";
import { toast } from "@/components/ui/sonner";
import { 
  Users, 
  Search, 
  Edit, 
  Trash2, 
  Loader2, 
  Shield, 
  UserCheck, 
  UserX,
  TrendingUp,
  Calendar,
  Mail,
  Phone,
  MoreHorizontal,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  Building2,
  User,
  Ban,
  CheckCircle,
  XCircle,
  MapPin,
  Clock,
  Download,
  DollarSign,
} from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

const ROLE_LABELS: Record<string, string> = {
  admin: "Administrador",
  sindico: "Gestor",
  user: "Usuário",
  morador: "Usuário",
};

const ROLE_COLORS: Record<string, string> = {
  admin: "bg-red-100 text-red-700 border-red-200",
  sindico: "bg-blue-100 text-blue-700 border-blue-200",
  user: "bg-gray-100 text-gray-700 border-gray-200",
  morador: "bg-green-100 text-green-700 border-green-200",
};

const TIPO_CONTA_LABELS: Record<string, string> = {
  sindico: "Gestor",
  administradora: "Empresa",
  admin: "Admin Sistema",
};

const TIPO_USUARIO_LABELS: Record<string, string> = {
  usuario: "Usuário",
  pequena_empresa: "Pequena Empresa",
  media_empresa: "Média Empresa",
};

export default function AdminUsuariosPage() {
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("");
  const [tipoContaFilter, setTipoContaFilter] = useState<string>("");
  const [page, setPage] = useState(1);
  const [editingUser, setEditingUser] = useState<any>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<any>(null);
  const [blockConfirm, setBlockConfirm] = useState<any>(null);
  const [financeiroUser, setFinanceiroUser] = useState<any>(null);
  const [valorPlanoInput, setValorPlanoInput] = useState("");
  
  // Estado para modal de exportação
  const [showExportModal, setShowExportModal] = useState(false);
  const [exportFilters, setExportFilters] = useState({
    tipoUsuario: "",
    cidade: "",
    adimplente: "",
    bloqueado: "",
  });

  // Buscar usuários
  const { data: usuariosData, isLoading, refetch } = trpc.adminUsuarios.listar.useQuery({
    page,
    limit: 20,
    search: search || undefined,
    role: roleFilter as any || undefined,
    tipoConta: tipoContaFilter as any || undefined,
  });

  // Buscar faixas de preço
  const { data: faixasPreco } = trpc.adminFinanceiro.listarFaixas.useQuery();

  // Buscar estatísticas
  const { data: stats } = trpc.adminUsuarios.estatisticas.useQuery();

  // Mutations
  const atualizarMutation = trpc.adminUsuarios.atualizar.useMutation({
    onSuccess: () => {
      toast.success("Usuário atualizado com sucesso!");
      setEditingUser(null);
      refetch();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const excluirMutation = trpc.adminUsuarios.excluir.useMutation({
    onSuccess: () => {
      toast.success("Usuário excluído com sucesso!");
      setDeleteConfirm(null);
      refetch();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const atualizarValorPlanoMutation = trpc.adminUsuarios.atualizarValorPlano.useMutation({
    onSuccess: () => {
      toast.success("Valor do plano atualizado!");
      setFinanceiroUser(null);
      setValorPlanoInput("");
      refetch();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const handleSearch = (value: string) => {
    setSearch(value);
    setPage(1);
  };

  const handleSaveUser = () => {
    if (!editingUser) return;
    atualizarMutation.mutate({
      id: editingUser.id,
      role: editingUser.role,
      tipoConta: editingUser.tipoConta,
      tipoUsuario: editingUser.tipoUsuario,
      diasUtilizacao: editingUser.diasUtilizacao ? Number(editingUser.diasUtilizacao) : undefined,
      cidade: editingUser.cidade,
      adimplente: editingUser.adimplente,
      bloqueado: editingUser.bloqueado,
      motivoBloqueio: editingUser.motivoBloqueio,
      name: editingUser.name,
      phone: editingUser.phone,
    });
  };

  const handleDeleteUser = () => {
    if (!deleteConfirm) return;
    excluirMutation.mutate({ id: deleteConfirm.id });
  };

  const handleBlockUser = () => {
    if (!blockConfirm) return;
    atualizarMutation.mutate({
      id: blockConfirm.id,
      bloqueado: true,
      motivoBloqueio: "Para continuar a utilizar escolha um dos planos pagos.",
    });
    setBlockConfirm(null);
  };

  const handleUnblockUser = (usuario: any) => {
    atualizarMutation.mutate({
      id: usuario.id,
      bloqueado: false,
      motivoBloqueio: "",
    });
  };

  const handleOpenFinanceiro = (usuario: any) => {
    setFinanceiroUser(usuario);
    setValorPlanoInput(usuario.valorPlano || "");
  };

  const handleSaveValorPlano = () => {
    if (!financeiroUser) return;
    atualizarValorPlanoMutation.mutate({
      userId: financeiroUser.id,
      valorPlano: valorPlanoInput || null,
    });
  };

  const handleExportCSV = () => {
    if (!usuariosData?.usuarios || usuariosData.usuarios.length === 0) {
      toast.error("Não há usuários para exportar");
      return;
    }

    const formatDateCSV = (date: Date | string | null) => {
      if (!date) return "-";
      return new Date(date).toLocaleDateString("pt-BR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    };

    // Aplicar filtros de exportação
    let usuariosFiltrados = usuariosData.usuarios;
    
    if (exportFilters.tipoUsuario && exportFilters.tipoUsuario !== "all") {
      usuariosFiltrados = usuariosFiltrados.filter(
        (u) => u.tipoUsuario === exportFilters.tipoUsuario
      );
    }
    
    if (exportFilters.cidade) {
      usuariosFiltrados = usuariosFiltrados.filter(
        (u) => u.cidade?.toLowerCase().includes(exportFilters.cidade.toLowerCase())
      );
    }
    
    if (exportFilters.adimplente && exportFilters.adimplente !== "all") {
      const isAdimplente = exportFilters.adimplente === "true";
      usuariosFiltrados = usuariosFiltrados.filter(
        (u) => u.adimplente === isAdimplente
      );
    }
    
    if (exportFilters.bloqueado && exportFilters.bloqueado !== "all") {
      const isBloqueado = exportFilters.bloqueado === "true";
      usuariosFiltrados = usuariosFiltrados.filter(
        (u) => u.bloqueado === isBloqueado
      );
    }
    
    if (usuariosFiltrados.length === 0) {
      toast.error("Nenhum usuário encontrado com os filtros selecionados");
      return;
    }

    // Cabeçalho do CSV
    const headers = [
      "Nome",
      "Email",
      "Tipo Usuário",
      "Cidade",
      "Dias de Uso",
      "Adimplência",
      "Status",
      "Tipo Conta",
      "Data Cadastro",
      "Último Acesso",
    ];

    // Dados dos usuários filtrados
    const rows = usuariosFiltrados.map((usuario) => [
      usuario.name || "Sem nome",
      usuario.email || "-",
      TIPO_USUARIO_LABELS[usuario.tipoUsuario || "usuario"] || "Usuário",
      usuario.cidade || "-",
      usuario.diasUtilizacao || 0,
      usuario.adimplente === false ? "Inadimplente" : "Adimplente",
      usuario.bloqueado ? "Bloqueado" : "Ativo",
      usuario.tipoConta ? TIPO_CONTA_LABELS[usuario.tipoConta] || usuario.tipoConta : "-",
      formatDateCSV(usuario.createdAt),
      formatDateCSV(usuario.lastSignedIn),
    ]);

    // Criar conteúdo CSV
    const csvContent = [
      headers.join(";"),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(";"))
    ].join("\n");

    // Adicionar BOM para UTF-8
    const BOM = "\uFEFF";
    const blob = new Blob([BOM + csvContent], { type: "text/csv;charset=utf-8;" });
    
    // Criar link de download
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `usuarios_${new Date().toISOString().split("T")[0]}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast.success(`${usuariosFiltrados.length} usuário(s) exportado(s) com sucesso!`);
    setShowExportModal(false);
    setExportFilters({ tipoUsuario: "", cidade: "", adimplente: "", bloqueado: "" });
  };

  const formatDate = (date: Date | string | null) => {
    if (!date) return "-";
    return new Date(date).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <Shield className="h-7 w-7 text-orange-500" />
              Administração de Usuários
            </h1>
            <p className="text-gray-500 mt-1">
              Gerencie os usuários cadastrados no sistema
            </p>
          </div>
          <div className="flex gap-2">
            <Button onClick={() => setShowExportModal(true)} variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Exportar CSV
            </Button>
            <Button onClick={() => refetch()} variant="outline" size="sm">
              <RefreshCw className="h-4 w-4 mr-2" />
              Atualizar
            </Button>
          </div>
        </div>

        {/* Estatísticas */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="border-l-4 border-l-orange-500">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Total de Usuários</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                  </div>
                  <Users className="h-10 w-10 text-orange-500 opacity-20" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-green-500">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Ativos (30 dias)</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.ativos30dias}</p>
                  </div>
                  <UserCheck className="h-10 w-10 text-green-500 opacity-20" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-blue-500">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Novos (30 dias)</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.novos30dias}</p>
                  </div>
                  <TrendingUp className="h-10 w-10 text-blue-500 opacity-20" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-purple-500">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Administradores</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.porRole?.admin || 0}</p>
                  </div>
                  <Shield className="h-10 w-10 text-purple-500 opacity-20" />
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Filtros */}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Buscar por nome ou email..."
                  value={search}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={roleFilter || "all"} onValueChange={(v) => { setRoleFilter(v === "all" ? "" : v); setPage(1); }}>
                <SelectTrigger className="w-full md:w-[180px]">
                  <SelectValue placeholder="Todos os perfis" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os perfis</SelectItem>
                  <SelectItem value="admin">Administrador</SelectItem>
                  <SelectItem value="sindico">Gestor</SelectItem>
                  <SelectItem value="user">Usuário</SelectItem>
                  <SelectItem value="morador">Usuário</SelectItem>
                </SelectContent>
              </Select>
              <Select value={tipoContaFilter || "all"} onValueChange={(v) => { setTipoContaFilter(v === "all" ? "" : v); setPage(1); }}>
                <SelectTrigger className="w-full md:w-[180px]">
                  <SelectValue placeholder="Todos os tipos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os tipos</SelectItem>
                  <SelectItem value="sindico">Gestor</SelectItem>
                  <SelectItem value="administradora">Empresa</SelectItem>
                  <SelectItem value="admin">Admin Sistema</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Tabela de Usuários */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Lista de Usuários</CardTitle>
            <CardDescription>
              {usuariosData?.total || 0} usuário(s) encontrado(s)
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
              </div>
            ) : (
              <>
                <div className="rounded-md border overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-12">Ações</TableHead>
                        <TableHead>Usuário</TableHead>
                        <TableHead>Tipo Usuário</TableHead>
                        <TableHead>Valor Plano</TableHead>
                        <TableHead>Cidade</TableHead>
                        <TableHead>Dias Uso</TableHead>
                        <TableHead>Qtd Equipe</TableHead>
                        <TableHead>Adimplência</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Tipo Conta</TableHead>
                        <TableHead>Data Cadastro</TableHead>
                        <TableHead>Último Acesso</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {usuariosData?.usuarios.map((usuario) => (
                        <TableRow key={usuario.id} className={usuario.bloqueado ? "bg-red-50" : ""}>
                          <TableCell>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="start">
                                <DropdownMenuItem onClick={() => setEditingUser({ ...usuario })}>
                                  <Edit className="h-4 w-4 mr-2" />
                                  Editar
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleOpenFinanceiro(usuario)}>
                                  <DollarSign className="h-4 w-4 mr-2" />
                                  Financeiro
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                {usuario.bloqueado ? (
                                  <DropdownMenuItem 
                                    onClick={() => handleUnblockUser(usuario)}
                                    className="text-green-600"
                                  >
                                    <CheckCircle className="h-4 w-4 mr-2" />
                                    Desbloquear
                                  </DropdownMenuItem>
                                ) : (
                                  <DropdownMenuItem 
                                    onClick={() => setBlockConfirm(usuario)}
                                    className="text-orange-600"
                                  >
                                    <Ban className="h-4 w-4 mr-2" />
                                    Bloquear
                                  </DropdownMenuItem>
                                )}
                                <DropdownMenuSeparator />
                                <DropdownMenuItem 
                                  onClick={() => setDeleteConfirm(usuario)}
                                  className="text-red-600"
                                >
                                  <Trash2 className="h-4 w-4 mr-2" />
                                  Excluir
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              {usuario.avatarUrl ? (
                                <img
                                  src={usuario.avatarUrl}
                                  alt={usuario.name || ""}
                                  className="h-8 w-8 rounded-full object-cover"
                                />
                              ) : (
                                <div className="h-8 w-8 rounded-full bg-orange-100 flex items-center justify-center">
                                  <User className="h-4 w-4 text-orange-600" />
                                </div>
                              )}
                              <div>
                                <p className="font-medium text-gray-900">{usuario.name || "Sem nome"}</p>
                                <p className="text-xs text-gray-500">{usuario.email || "-"}</p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className="font-normal">
                              {TIPO_USUARIO_LABELS[usuario.tipoUsuario || "usuario"] || "Usuário"}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {usuario.valorPlano ? (
                              <Badge className="bg-green-100 text-green-700 border-green-200">
                                <DollarSign className="h-3 w-3 mr-1" />
                                R$ {usuario.valorPlano}
                              </Badge>
                            ) : (
                              <span className="text-gray-400 text-sm">-</span>
                            )}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1 text-gray-600">
                              <MapPin className="h-3 w-3" />
                              {usuario.cidade || "-"}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1 text-gray-600">
                              <Clock className="h-3 w-3" />
                              {usuario.diasUtilizacao || 0} dias
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1 text-gray-600">
                              <Users className="h-3 w-3" />
                              {(usuario as any).totalMembrosEquipe || 0}
                            </div>
                          </TableCell>
                          <TableCell>
                            {usuario.adimplente === false ? (
                              <Badge className="bg-red-100 text-red-700 border-red-200">
                                <XCircle className="h-3 w-3 mr-1" />
                                Inadimplente
                              </Badge>
                            ) : (
                              <Badge className="bg-green-100 text-green-700 border-green-200">
                                <CheckCircle className="h-3 w-3 mr-1" />
                                Adimplente
                              </Badge>
                            )}
                          </TableCell>
                          <TableCell>
                            {usuario.bloqueado ? (
                              <Badge className="bg-red-100 text-red-700 border-red-200">
                                <Ban className="h-3 w-3 mr-1" />
                                Bloqueado
                              </Badge>
                            ) : (
                              <Badge className="bg-green-100 text-green-700 border-green-200">
                                <CheckCircle className="h-3 w-3 mr-1" />
                                Ativo
                              </Badge>
                            )}
                          </TableCell>
                          <TableCell>
                            {usuario.tipoConta ? (
                              <span className="text-sm text-gray-600">
                                {TIPO_CONTA_LABELS[usuario.tipoConta] || usuario.tipoConta}
                              </span>
                            ) : (
                              <span className="text-sm text-gray-400">-</span>
                            )}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1 text-sm text-gray-500">
                              <Calendar className="h-3 w-3" />
                              {formatDate(usuario.createdAt)}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1 text-sm text-gray-500">
                              <Calendar className="h-3 w-3" />
                              {formatDate(usuario.lastSignedIn)}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                      {usuariosData?.usuarios.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={11} className="text-center py-8 text-gray-500">
                            Nenhum usuário encontrado
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>

                {/* Paginação */}
                {usuariosData && usuariosData.totalPages > 1 && (
                  <div className="flex items-center justify-between mt-4">
                    <p className="text-sm text-gray-500">
                      Página {usuariosData.page} de {usuariosData.totalPages}
                    </p>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPage(p => Math.max(1, p - 1))}
                        disabled={page === 1}
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPage(p => Math.min(usuariosData.totalPages, p + 1))}
                        disabled={page === usuariosData.totalPages}
                      >
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>

        {/* Modal de Edição */}
        <Dialog open={!!editingUser} onOpenChange={() => setEditingUser(null)}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Editar Usuário</DialogTitle>
              <DialogDescription>
                Altere as informações do usuário
              </DialogDescription>
            </DialogHeader>
            {editingUser && (
              <div className="space-y-4 py-4 max-h-[60vh] overflow-y-auto">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Nome</Label>
                    <Input
                      value={editingUser.name || ""}
                      onChange={(e) => setEditingUser({ ...editingUser, name: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Telefone</Label>
                    <Input
                      value={editingUser.phone || ""}
                      onChange={(e) => setEditingUser({ ...editingUser, phone: maskPhone(e.target.value) })}
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label>Tipo de Usuário</Label>
                  <Select
                    value={editingUser.tipoUsuario || "usuario"}
                    onValueChange={(v) => setEditingUser({ ...editingUser, tipoUsuario: v })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="usuario">Usuário</SelectItem>
                      <SelectItem value="pequena_empresa">Pequena Empresa</SelectItem>
                      <SelectItem value="media_empresa">Média Empresa</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Cidade</Label>
                    <Input
                      value={editingUser.cidade || ""}
                      onChange={(e) => setEditingUser({ ...editingUser, cidade: e.target.value })}
                      placeholder="Ex: São Paulo"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Dias de Utilização</Label>
                    <Input
                      type="number"
                      value={editingUser.diasUtilizacao || 0}
                      onChange={(e) => setEditingUser({ ...editingUser, diasUtilizacao: parseInt(e.target.value) || 0 })}
                      min={0}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Perfil (Role)</Label>
                    <Select
                      value={editingUser.role}
                      onValueChange={(v) => setEditingUser({ ...editingUser, role: v })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="user">Usuário</SelectItem>
                        <SelectItem value="sindico">Gestor</SelectItem>
                        <SelectItem value="morador">Usuário</SelectItem>
                        <SelectItem value="admin">Administrador</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Tipo de Conta</Label>
                    <Select
                      value={editingUser.tipoConta || "sindico"}
                      onValueChange={(v) => setEditingUser({ ...editingUser, tipoConta: v })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="sindico">Gestor</SelectItem>
                        <SelectItem value="administradora">Empresa</SelectItem>
                        <SelectItem value="admin">Admin Sistema</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="border rounded-lg p-4 space-y-4 bg-gray-50">
                  <h4 className="font-medium text-gray-900">Status Financeiro e Acesso</h4>
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Adimplente</Label>
                      <p className="text-xs text-gray-500">Usuário está em dia com pagamentos</p>
                    </div>
                    <Switch
                      checked={editingUser.adimplente !== false}
                      onCheckedChange={(checked) => setEditingUser({ ...editingUser, adimplente: checked })}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Bloqueado</Label>
                      <p className="text-xs text-gray-500">Impede o acesso ao sistema</p>
                    </div>
                    <Switch
                      checked={editingUser.bloqueado === true}
                      onCheckedChange={(checked) => setEditingUser({ 
                        ...editingUser, 
                        bloqueado: checked,
                        motivoBloqueio: checked ? "Para continuar a utilizar escolha um dos planos pagos." : ""
                      })}
                    />
                  </div>

                  {editingUser.bloqueado && (
                    <div className="space-y-2">
                      <Label>Motivo do Bloqueio</Label>
                      <Input
                        value={editingUser.motivoBloqueio || ""}
                        onChange={(e) => setEditingUser({ ...editingUser, motivoBloqueio: e.target.value })}
                        placeholder="Mensagem exibida ao usuário"
                      />
                    </div>
                  )}
                </div>
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setEditingUser(null)}>
                Cancelar
              </Button>
              <Button 
                onClick={handleSaveUser}
                disabled={atualizarMutation.isPending}
                className="bg-orange-500 hover:bg-orange-600"
              >
                {atualizarMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                Salvar
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Modal de Confirmação de Bloqueio */}
        <Dialog open={!!blockConfirm} onOpenChange={() => setBlockConfirm(null)}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="text-orange-600 flex items-center gap-2">
                <Ban className="h-5 w-5" />
                Bloquear Usuário
              </DialogTitle>
              <DialogDescription>
                Tem certeza que deseja bloquear o usuário <strong>{blockConfirm?.name || blockConfirm?.email}</strong>?
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                <p className="text-sm text-orange-800">
                  <strong>Mensagem exibida ao usuário:</strong>
                </p>
                <p className="text-sm text-orange-700 mt-1 italic">
                  "Para continuar a utilizar escolha um dos planos pagos."
                </p>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setBlockConfirm(null)}>
                Cancelar
              </Button>
              <Button 
                onClick={handleBlockUser}
                disabled={atualizarMutation.isPending}
                className="bg-orange-500 hover:bg-orange-600"
              >
                {atualizarMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                Bloquear
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Modal de Confirmação de Exclusão */}
        <Dialog open={!!deleteConfirm} onOpenChange={() => setDeleteConfirm(null)}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="text-red-600">Excluir Usuário</DialogTitle>
              <DialogDescription>
                Tem certeza que deseja excluir o usuário <strong>{deleteConfirm?.name || deleteConfirm?.email}</strong>? Esta ação não pode ser desfeita.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDeleteConfirm(null)}>
                Cancelar
              </Button>
              <Button 
                variant="destructive"
                onClick={handleDeleteUser}
                disabled={excluirMutation.isPending}
              >
                {excluirMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                Excluir
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Modal de Exportação com Filtros */}
        <Dialog open={showExportModal} onOpenChange={setShowExportModal}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Download className="h-5 w-5 text-orange-500" />
                Exportar Usuários para CSV
              </DialogTitle>
              <DialogDescription>
                Selecione os filtros para exportar apenas os usuários desejados. Deixe em branco para exportar todos.
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Tipo de Usuário</Label>
                <Select
                  value={exportFilters.tipoUsuario}
                  onValueChange={(v) => setExportFilters({ ...exportFilters, tipoUsuario: v })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Todos os tipos" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos os tipos</SelectItem>
                    <SelectItem value="usuario">Usuário</SelectItem>
                    <SelectItem value="pequena_empresa">Pequena Empresa</SelectItem>
                    <SelectItem value="media_empresa">Média Empresa</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Cidade</Label>
                <Input
                  placeholder="Digite a cidade para filtrar"
                  value={exportFilters.cidade}
                  onChange={(e) => setExportFilters({ ...exportFilters, cidade: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label>Status de Adimplência</Label>
                <Select
                  value={exportFilters.adimplente}
                  onValueChange={(v) => setExportFilters({ ...exportFilters, adimplente: v })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Todos" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    <SelectItem value="true">Adimplentes</SelectItem>
                    <SelectItem value="false">Inadimplentes</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Status de Bloqueio</Label>
                <Select
                  value={exportFilters.bloqueado}
                  onValueChange={(v) => setExportFilters({ ...exportFilters, bloqueado: v })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Todos" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    <SelectItem value="false">Ativos</SelectItem>
                    <SelectItem value="true">Bloqueados</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <DialogFooter>
              <Button 
                variant="outline" 
                onClick={() => {
                  setShowExportModal(false);
                  setExportFilters({ tipoUsuario: "", cidade: "", adimplente: "", bloqueado: "" });
                }}
              >
                Cancelar
              </Button>
              <Button 
                onClick={handleExportCSV}
                className="bg-orange-500 hover:bg-orange-600"
              >
                <Download className="h-4 w-4 mr-2" />
                Exportar
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Modal Financeiro */}
        <Dialog open={!!financeiroUser} onOpenChange={(open) => !open && setFinanceiroUser(null)}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-green-600" />
                Financeiro - {financeiroUser?.nome}
              </DialogTitle>
              <DialogDescription>
                Configure o valor do plano para este cliente.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label>Email</Label>
                <Input value={financeiroUser?.email || ""} disabled className="bg-gray-100" />
              </div>
              
              <div className="space-y-2">
                <Label>Tipo de Usuário</Label>
                <Input 
                  value={
                    financeiroUser?.tipoUsuario === "usuario" ? "Usuário Individual" :
                    financeiroUser?.tipoUsuario === "pequena_empresa" ? "Pequena Empresa" :
                    financeiroUser?.tipoUsuario === "media_empresa" ? "Média Empresa" :
                    financeiroUser?.tipoUsuario || ""
                  } 
                  disabled 
                  className="bg-gray-100" 
                />
              </div>

              {faixasPreco && faixasPreco.length > 0 && (
                <div className="space-y-2">
                  <Label>Faixa de Preço Sugerida</Label>
                  <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <p className="text-sm text-blue-700">
                      Baseado nas faixas cadastradas, você pode usar como referência:
                    </p>
                    <div className="mt-2 space-y-1">
                      {faixasPreco.map((faixa) => (
                        <button
                          key={faixa.id}
                          type="button"
                          onClick={() => setValorPlanoInput(faixa.valorMensal)}
                          className="block w-full text-left px-2 py-1 text-sm hover:bg-blue-100 rounded transition-colors"
                        >
                          {faixa.usuariosMin} - {faixa.usuariosMax || '∞'} usuários: 
                          <span className="font-semibold text-green-600 ml-1">
                            R$ {Number(faixa.valorMensal).toFixed(2)}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="valorPlano">Valor do Plano (R$)</Label>
                <Input
                  id="valorPlano"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="Ex: 99.90"
                  value={valorPlanoInput}
                  onChange={(e) => setValorPlanoInput(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  Digite o valor mensal do plano para este cliente específico.
                </p>
              </div>
            </div>
            <DialogFooter>
              <Button 
                variant="outline" 
                onClick={() => setFinanceiroUser(null)}
              >
                Cancelar
              </Button>
              <Button 
                onClick={handleSaveValorPlano}
                disabled={atualizarValorPlanoMutation.isPending}
                className="bg-green-600 hover:bg-green-700"
              >
                {atualizarValorPlanoMutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Salvando...
                  </>
                ) : (
                  <>
                    <DollarSign className="h-4 w-4 mr-2" />
                    Salvar Valor
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
    </div>
  );
}
