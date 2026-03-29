import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { maskPhone } from "@/lib/utils";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/lib/trpc";
import { toast } from "@/components/ui/sonner";
import { 
  CreditCard, 
  QrCode, 
  FileText, 
  Receipt, 
  Loader2, 
  Save,
  DollarSign,
  Settings,
  Plus,
  Edit,
  Trash2,
  Users,
  Layers,
  Bell,
  Mail
} from "lucide-react";

interface FaixaPrecoForm {
  id?: number;
  nome: string;
  usuariosMin: number;
  usuariosMax: number | null;
  valorMensal: string;
  descricao: string;
  ativo: boolean;
  ordem: number;
}

const faixaVazia: FaixaPrecoForm = {
  nome: "",
  usuariosMin: 1,
  usuariosMax: null,
  valorMensal: "",
  descricao: "",
  ativo: true,
  ordem: 0,
};

export default function AdminFinanceiroPage() {
  const [formData, setFormData] = useState({
    pixAtivo: false,
    pixTipoChave: "" as "cpf" | "cnpj" | "email" | "telefone" | "aleatoria" | "",
    pixChave: "",
    pixNomeBeneficiario: "",
    pixCidade: "",
    pixQrCodeUrl: "",
    boletoAtivo: false,
    boletoInstrucoes: "",
    boletoLinkPadrao: "",
    cartaoAtivo: false,
    cartaoLinkPagamento: "",
    cartaoDescricao: "",
    notaFiscalAtivo: false,
    notaFiscalInstrucoes: "",
    notaFiscalEmail: "",
    valorMensalidade: "",
    diaVencimento: 10,
    observacoes: "",
    // Notificações
    emailNotificacaoCadastro: "",
    notificarNovoCadastro: false,
  });

  const [faixaDialogOpen, setFaixaDialogOpen] = useState(false);
  const [faixaForm, setFaixaForm] = useState<FaixaPrecoForm>(faixaVazia);
  const [editandoFaixa, setEditandoFaixa] = useState(false);
  const [faixaParaExcluir, setFaixaParaExcluir] = useState<number | null>(null);

  const { data: config, isLoading, refetch } = trpc.adminFinanceiro.obter.useQuery();
  const { data: faixas, refetch: refetchFaixas } = trpc.adminFinanceiro.listarFaixas.useQuery();
  
  const salvarMutation = trpc.adminFinanceiro.salvar.useMutation({
    onSuccess: () => {
      toast.success("Configurações salvas com sucesso!");
      refetch();
    },
    onError: (error) => {
      toast.error(error.message || "Erro ao salvar configurações");
    },
  });

  const criarFaixaMutation = trpc.adminFinanceiro.criarFaixa.useMutation({
    onSuccess: () => {
      toast.success("Faixa de preço criada com sucesso!");
      setFaixaDialogOpen(false);
      setFaixaForm(faixaVazia);
      refetchFaixas();
    },
    onError: (error) => {
      toast.error(error.message || "Erro ao criar faixa de preço");
    },
  });

  const atualizarFaixaMutation = trpc.adminFinanceiro.atualizarFaixa.useMutation({
    onSuccess: () => {
      toast.success("Faixa de preço atualizada!");
      setFaixaDialogOpen(false);
      setFaixaForm(faixaVazia);
      setEditandoFaixa(false);
      refetchFaixas();
    },
    onError: (error) => {
      toast.error(error.message || "Erro ao atualizar faixa");
    },
  });

  const excluirFaixaMutation = trpc.adminFinanceiro.excluirFaixa.useMutation({
    onSuccess: () => {
      toast.success("Faixa excluída!");
      setFaixaParaExcluir(null);
      refetchFaixas();
    },
    onError: (error) => {
      toast.error(error.message || "Erro ao excluir faixa");
    },
  });

  useEffect(() => {
    if (config) {
      setFormData({
        pixAtivo: config.pixAtivo ?? false,
        pixTipoChave: (config.pixTipoChave as any) || "",
        pixChave: config.pixChave || "",
        pixNomeBeneficiario: config.pixNomeBeneficiario || "",
        pixCidade: config.pixCidade || "",
        pixQrCodeUrl: config.pixQrCodeUrl || "",
        boletoAtivo: config.boletoAtivo ?? false,
        boletoInstrucoes: config.boletoInstrucoes || "",
        boletoLinkPadrao: config.boletoLinkPadrao || "",
        cartaoAtivo: config.cartaoAtivo ?? false,
        cartaoLinkPagamento: config.cartaoLinkPagamento || "",
        cartaoDescricao: config.cartaoDescricao || "",
        notaFiscalAtivo: config.notaFiscalAtivo ?? false,
        notaFiscalInstrucoes: config.notaFiscalInstrucoes || "",
        notaFiscalEmail: config.notaFiscalEmail || "",
        valorMensalidade: config.valorMensalidade || "",
        diaVencimento: config.diaVencimento ?? 10,
        observacoes: config.observacoes || "",
        // Notificações
        emailNotificacaoCadastro: config.emailNotificacaoCadastro || "",
        notificarNovoCadastro: config.notificarNovoCadastro ?? false,
      });
    }
  }, [config]);

  const handleSave = () => {
    salvarMutation.mutate({
      ...formData,
      pixTipoChave: formData.pixTipoChave || null,
      pixChave: formData.pixChave || null,
      pixNomeBeneficiario: formData.pixNomeBeneficiario || null,
      pixCidade: formData.pixCidade || null,
      pixQrCodeUrl: formData.pixQrCodeUrl || null,
      boletoInstrucoes: formData.boletoInstrucoes || null,
      boletoLinkPadrao: formData.boletoLinkPadrao || null,
      cartaoLinkPagamento: formData.cartaoLinkPagamento || null,
      cartaoDescricao: formData.cartaoDescricao || null,
      notaFiscalInstrucoes: formData.notaFiscalInstrucoes || null,
      notaFiscalEmail: formData.notaFiscalEmail || null,
      valorMensalidade: formData.valorMensalidade || null,
      observacoes: formData.observacoes || null,
      // Notificações
      emailNotificacaoCadastro: formData.emailNotificacaoCadastro || null,
      notificarNovoCadastro: formData.notificarNovoCadastro,
    });
  };

  const handleSalvarFaixa = () => {
    if (!faixaForm.nome || !faixaForm.valorMensal) {
      toast.error("Preencha o nome e o valor da faixa");
      return;
    }
    if (editandoFaixa && faixaForm.id) {
      atualizarFaixaMutation.mutate({
        id: faixaForm.id,
        nome: faixaForm.nome,
        usuariosMin: faixaForm.usuariosMin,
        usuariosMax: faixaForm.usuariosMax,
        valorMensal: faixaForm.valorMensal,
        descricao: faixaForm.descricao || null,
        ativo: faixaForm.ativo,
        ordem: faixaForm.ordem,
      });
    } else {
      criarFaixaMutation.mutate({
        nome: faixaForm.nome,
        usuariosMin: faixaForm.usuariosMin,
        usuariosMax: faixaForm.usuariosMax,
        valorMensal: faixaForm.valorMensal,
        descricao: faixaForm.descricao || null,
        ativo: faixaForm.ativo,
        ordem: faixaForm.ordem,
      });
    }
  };

  const handleEditarFaixa = (faixa: any) => {
    setFaixaForm({
      id: faixa.id,
      nome: faixa.nome,
      usuariosMin: faixa.usuariosMin,
      usuariosMax: faixa.usuariosMax,
      valorMensal: faixa.valorMensal,
      descricao: faixa.descricao || "",
      ativo: faixa.ativo,
      ordem: faixa.ordem || 0,
    });
    setEditandoFaixa(true);
    setFaixaDialogOpen(true);
  };

  const handleNovaFaixa = () => {
    setFaixaForm(faixaVazia);
    setEditandoFaixa(false);
    setFaixaDialogOpen(true);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Settings className="h-6 w-6 text-orange-500" />
            Configurações Financeiras
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Configure formas de pagamento e faixas de preço por quantidade de usuários
          </p>
        </div>
        <Button onClick={handleSave} disabled={salvarMutation.isPending}>
          {salvarMutation.isPending ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
          Salvar Configurações
        </Button>
      </div>

      {/* Faixas de Preço */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Layers className="h-5 w-5 text-blue-500" />
                Faixas de Preço por Usuários
              </CardTitle>
              <CardDescription>
                Configure diferentes valores baseados na quantidade de usuários
              </CardDescription>
            </div>
            <Button onClick={handleNovaFaixa} size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Nova Faixa
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {faixas && faixas.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome do Plano</TableHead>
                  <TableHead>Usuários</TableHead>
                  <TableHead>Valor Mensal</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {faixas.map((faixa) => (
                  <TableRow key={faixa.id}>
                    <TableCell className="font-medium">{faixa.nome}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Users className="h-4 w-4 text-gray-400" />
                        {faixa.usuariosMin} - {faixa.usuariosMax || "∞"}
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="font-semibold text-green-600">R$ {faixa.valorMensal}</span>
                    </TableCell>
                    <TableCell>
                      <Badge variant={faixa.ativo ? "default" : "secondary"}>
                        {faixa.ativo ? "Ativo" : "Inativo"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="sm" onClick={() => handleEditarFaixa(faixa)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-700" onClick={() => setFaixaParaExcluir(faixa.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <Layers className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>Nenhuma faixa de preço cadastrada.</p>
              <p className="text-sm">Clique em "Nova Faixa" para começar.</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Informações Gerais */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-green-500" />
            Informações Gerais
          </CardTitle>
          <CardDescription>
            Valores padrão (usado quando não há faixa específica)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="valorMensalidade">Valor Padrão (R$)</Label>
              <Input
                id="valorMensalidade"
                type="text"
                placeholder="99,90"
                value={formData.valorMensalidade}
                onChange={(e) => setFormData({ ...formData, valorMensalidade: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="diaVencimento">Dia do Vencimento</Label>
              <Input
                id="diaVencimento"
                type="number"
                min={1}
                max={31}
                value={formData.diaVencimento}
                onChange={(e) => setFormData({ ...formData, diaVencimento: parseInt(e.target.value) || 10 })}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="observacoes">Observações Gerais</Label>
            <Textarea
              id="observacoes"
              placeholder="Informações adicionais..."
              value={formData.observacoes}
              onChange={(e) => setFormData({ ...formData, observacoes: e.target.value })}
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      {/* Notificações */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5 text-purple-500" />
            Notificações
          </CardTitle>
          <CardDescription>
            Configurar alertas e notificações por e-mail
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-purple-50 rounded-lg border border-purple-200">
            <div className="flex items-center gap-3">
              <Mail className="h-5 w-5 text-purple-600" />
              <div>
                <p className="font-medium text-gray-900">Notificar Novos Cadastros</p>
                <p className="text-sm text-gray-500">Receba um e-mail sempre que um novo usuário se cadastrar</p>
              </div>
            </div>
            <Switch 
              checked={formData.notificarNovoCadastro} 
              onCheckedChange={(checked) => setFormData({ ...formData, notificarNovoCadastro: checked })} 
            />
          </div>
          
          {formData.notificarNovoCadastro && (
            <div className="space-y-2">
              <Label htmlFor="emailNotificacaoCadastro">E-mail para Notificações</Label>
              <Input
                id="emailNotificacaoCadastro"
                type="email"
                placeholder="seu@email.com"
                value={formData.emailNotificacaoCadastro}
                onChange={(e) => setFormData({ ...formData, emailNotificacaoCadastro: e.target.value })}
              />
              <p className="text-xs text-gray-500">
                Você receberá um e-mail com os dados do novo usuário sempre que houver um cadastro.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      <Tabs defaultValue="pix" className="space-y-4">
        <TabsList className="grid grid-cols-2 md:grid-cols-4 w-full max-w-2xl h-auto">
          <TabsTrigger value="pix" className="flex items-center gap-2"><QrCode className="h-4 w-4" />PIX</TabsTrigger>
          <TabsTrigger value="boleto" className="flex items-center gap-2"><FileText className="h-4 w-4" />Boleto</TabsTrigger>
          <TabsTrigger value="cartao" className="flex items-center gap-2"><CreditCard className="h-4 w-4" />Cartão</TabsTrigger>
          <TabsTrigger value="nf" className="flex items-center gap-2"><Receipt className="h-4 w-4" />Nota Fiscal</TabsTrigger>
        </TabsList>

        <TabsContent value="pix">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2"><QrCode className="h-5 w-5 text-green-500" />PIX</CardTitle>
                  <CardDescription>Configure os dados da chave PIX</CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <Label htmlFor="pixAtivo">Ativo</Label>
                  <Switch id="pixAtivo" checked={formData.pixAtivo} onCheckedChange={(checked) => setFormData({ ...formData, pixAtivo: checked })} />
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Tipo de Chave</Label>
                  <Select value={formData.pixTipoChave} onValueChange={(v) => setFormData({ ...formData, pixTipoChave: v as any })}>
                    <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cpf">CPF</SelectItem>
                      <SelectItem value="cnpj">CNPJ</SelectItem>
                      <SelectItem value="email">E-mail</SelectItem>
                      <SelectItem value="telefone">Telefone</SelectItem>
                      <SelectItem value="aleatoria">Chave Aleatória</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="pixChave">Chave PIX</Label>
                  <Input id="pixChave" placeholder={formData.pixTipoChave === 'telefone' ? '(00) 00000-0000' : 'Digite a chave PIX'} value={formData.pixChave} onChange={(e) => setFormData({ ...formData, pixChave: formData.pixTipoChave === 'telefone' ? maskPhone(e.target.value) : e.target.value })} />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="pixNomeBeneficiario">Nome do Beneficiário</Label>
                  <Input id="pixNomeBeneficiario" value={formData.pixNomeBeneficiario} onChange={(e) => setFormData({ ...formData, pixNomeBeneficiario: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="pixCidade">Cidade</Label>
                  <Input id="pixCidade" value={formData.pixCidade} onChange={(e) => setFormData({ ...formData, pixCidade: e.target.value })} />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="pixQrCodeUrl">URL do QR Code (opcional)</Label>
                <Input id="pixQrCodeUrl" placeholder="https://..." value={formData.pixQrCodeUrl} onChange={(e) => setFormData({ ...formData, pixQrCodeUrl: e.target.value })} />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="boleto">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2"><FileText className="h-5 w-5 text-blue-500" />Boleto</CardTitle>
                  <CardDescription>Configure instruções e link do boleto</CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <Label htmlFor="boletoAtivo">Ativo</Label>
                  <Switch id="boletoAtivo" checked={formData.boletoAtivo} onCheckedChange={(checked) => setFormData({ ...formData, boletoAtivo: checked })} />
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="boletoLinkPadrao">Link para Boleto</Label>
                <Input id="boletoLinkPadrao" placeholder="https://..." value={formData.boletoLinkPadrao} onChange={(e) => setFormData({ ...formData, boletoLinkPadrao: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="boletoInstrucoes">Instruções</Label>
                <Textarea id="boletoInstrucoes" placeholder="Instruções..." value={formData.boletoInstrucoes} onChange={(e) => setFormData({ ...formData, boletoInstrucoes: e.target.value })} rows={4} />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="cartao">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2"><CreditCard className="h-5 w-5 text-purple-500" />Cartão</CardTitle>
                  <CardDescription>Configure o link de pagamento</CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <Label htmlFor="cartaoAtivo">Ativo</Label>
                  <Switch id="cartaoAtivo" checked={formData.cartaoAtivo} onCheckedChange={(checked) => setFormData({ ...formData, cartaoAtivo: checked })} />
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="cartaoLinkPagamento">Link de Pagamento</Label>
                <Input id="cartaoLinkPagamento" placeholder="https://..." value={formData.cartaoLinkPagamento} onChange={(e) => setFormData({ ...formData, cartaoLinkPagamento: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cartaoDescricao">Descrição</Label>
                <Textarea id="cartaoDescricao" placeholder="Informações..." value={formData.cartaoDescricao} onChange={(e) => setFormData({ ...formData, cartaoDescricao: e.target.value })} rows={3} />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="nf">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2"><Receipt className="h-5 w-5 text-orange-500" />Nota Fiscal</CardTitle>
                  <CardDescription>Configure informações da NF</CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <Label htmlFor="notaFiscalAtivo">Ativo</Label>
                  <Switch id="notaFiscalAtivo" checked={formData.notaFiscalAtivo} onCheckedChange={(checked) => setFormData({ ...formData, notaFiscalAtivo: checked })} />
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="notaFiscalEmail">E-mail para NF</Label>
                <Input id="notaFiscalEmail" type="email" placeholder="financeiro@empresa.com" value={formData.notaFiscalEmail} onChange={(e) => setFormData({ ...formData, notaFiscalEmail: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="notaFiscalInstrucoes">Instruções</Label>
                <Textarea id="notaFiscalInstrucoes" placeholder="Instruções..." value={formData.notaFiscalInstrucoes} onChange={(e) => setFormData({ ...formData, notaFiscalInstrucoes: e.target.value })} rows={4} />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Dialog Faixa */}
      <Dialog open={faixaDialogOpen} onOpenChange={setFaixaDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Layers className="h-5 w-5 text-blue-500" />
              {editandoFaixa ? "Editar Faixa" : "Nova Faixa de Preço"}
            </DialogTitle>
            <DialogDescription>Configure valores por quantidade de usuários</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="faixa-nome">Nome do Plano *</Label>
              <Input id="faixa-nome" placeholder="Ex: Plano Básico" value={faixaForm.nome} onChange={(e) => setFaixaForm({ ...faixaForm, nome: e.target.value })} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="faixa-min">Mín. Usuários *</Label>
                <Input id="faixa-min" type="number" min={1} value={faixaForm.usuariosMin} onChange={(e) => setFaixaForm({ ...faixaForm, usuariosMin: parseInt(e.target.value) || 1 })} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="faixa-max">Máx. Usuários</Label>
                <Input id="faixa-max" type="number" min={1} placeholder="Ilimitado" value={faixaForm.usuariosMax || ""} onChange={(e) => setFaixaForm({ ...faixaForm, usuariosMax: e.target.value ? parseInt(e.target.value) : null })} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="faixa-valor">Valor Mensal (R$) *</Label>
                <Input id="faixa-valor" placeholder="99,90" value={faixaForm.valorMensal} onChange={(e) => setFaixaForm({ ...faixaForm, valorMensal: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="faixa-ordem">Ordem</Label>
                <Input id="faixa-ordem" type="number" value={faixaForm.ordem} onChange={(e) => setFaixaForm({ ...faixaForm, ordem: parseInt(e.target.value) || 0 })} />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="faixa-descricao">Descrição</Label>
              <Textarea id="faixa-descricao" placeholder="Descrição do plano..." value={faixaForm.descricao} onChange={(e) => setFaixaForm({ ...faixaForm, descricao: e.target.value })} rows={3} />
            </div>
            <div className="flex items-center gap-2">
              <Switch id="faixa-ativo" checked={faixaForm.ativo} onCheckedChange={(checked) => setFaixaForm({ ...faixaForm, ativo: checked })} />
              <Label htmlFor="faixa-ativo">Faixa ativa</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setFaixaDialogOpen(false)}>Cancelar</Button>
            <Button onClick={handleSalvarFaixa} disabled={criarFaixaMutation.isPending || atualizarFaixaMutation.isPending}>
              {(criarFaixaMutation.isPending || atualizarFaixaMutation.isPending) && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {editandoFaixa ? "Atualizar" : "Criar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Confirmação exclusão */}
      <AlertDialog open={!!faixaParaExcluir} onOpenChange={() => setFaixaParaExcluir(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir Faixa de Preço</AlertDialogTitle>
            <AlertDialogDescription>Tem certeza? Esta ação não pode ser desfeita.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction className="bg-red-500 hover:bg-red-600" onClick={() => faixaParaExcluir && excluirFaixaMutation.mutate({ id: faixaParaExcluir })}>
              {excluirFaixaMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
