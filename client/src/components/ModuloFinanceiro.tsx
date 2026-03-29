import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/lib/trpc";
import { toast } from "@/components/ui/sonner";
import { 
  CreditCard, 
  QrCode, 
  FileText, 
  Receipt, 
  Loader2, 
  Copy,
  ExternalLink,
  Mail,
  DollarSign,
  Calendar,
  Info,
  Users,
  Layers
} from "lucide-react";

export default function ModuloFinanceiro() {
  const { data: config, isLoading } = trpc.adminFinanceiro.obter.useQuery();
  const { data: faixas } = trpc.adminFinanceiro.listarFaixas.useQuery();
  
  // Buscar quantidade de membros da equipe do usuário
  const { data: condominios } = trpc.condominio.list.useQuery();
  const condominioId = condominios?.[0]?.id;
  const { data: membrosEquipe } = trpc.membroEquipe.list.useQuery(
    { condominioId: condominioId! },
    { enabled: !!condominioId }
  );
  
  const qtdUsuarios = (membrosEquipe?.length || 0) + 1; // +1 para contar o próprio gestor

  const copyToClipboard = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success(`${label} copiado!`);
    } catch {
      toast.error("Erro ao copiar");
    }
  };
  
  // Encontrar a faixa de preço correta
  const faixaAtual = faixas?.find(f => {
    if (!f.ativo) return false;
    const min = f.usuariosMin;
    const max = f.usuariosMax;
    return qtdUsuarios >= min && (max === null || qtdUsuarios <= max);
  }) || faixas?.[faixas.length - 1]; // última faixa se não encontrar

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
        </CardContent>
      </Card>
    );
  }

  if (!config) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12 text-center">
          <DollarSign className="h-12 w-12 text-gray-300 mb-4" />
          <h3 className="text-lg font-medium text-gray-900">Módulo Financeiro</h3>
          <p className="text-gray-500 mt-1">
            As formas de pagamento ainda não foram configuradas.
          </p>
        </CardContent>
      </Card>
    );
  }

  const hasAnyPaymentMethod = config.pixAtivo || config.boletoAtivo || config.cartaoAtivo || config.notaFiscalAtivo;

  if (!hasAnyPaymentMethod) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12 text-center">
          <DollarSign className="h-12 w-12 text-gray-300 mb-4" />
          <h3 className="text-lg font-medium text-gray-900">Módulo Financeiro</h3>
          <p className="text-gray-500 mt-1">
            Nenhuma forma de pagamento disponível no momento.
          </p>
        </CardContent>
      </Card>
    );
  }
  
  // Usar valor da faixa ou valor padrão
  const valorMensalidade = faixaAtual?.valorMensal || config.valorMensalidade;

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-green-500" />
            Módulo Financeiro
          </CardTitle>
          <CardDescription>
            Formas de pagamento disponíveis para sua assinatura
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Faixa de Preço Atual */}
          {faixaAtual && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <Layers className="h-5 w-5 text-blue-600" />
                  <span className="font-medium text-blue-900">{faixaAtual.nome}</span>
                </div>
                <Badge className="bg-blue-100 text-blue-700">
                  <Users className="h-3 w-3 mr-1" />
                  {qtdUsuarios} usuário{qtdUsuarios > 1 ? 's' : ''}
                </Badge>
              </div>
              {faixaAtual.descricao && (
                <p className="text-sm text-blue-600 mt-2">{faixaAtual.descricao}</p>
              )}
            </div>
          )}
          
          {/* Informações Gerais */}
          {(valorMensalidade || config.diaVencimento) && (
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
              <div className="flex items-center gap-4 flex-wrap">
                {valorMensalidade && (
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-orange-600" />
                    <span className="text-sm text-orange-700">
                      Mensalidade: <strong>R$ {valorMensalidade}</strong>
                    </span>
                  </div>
                )}
                {config.diaVencimento && (
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-orange-600" />
                    <span className="text-sm text-orange-700">
                      Vencimento: <strong>Dia {config.diaVencimento}</strong>
                    </span>
                  </div>
                )}
              </div>
              {config.observacoes && (
                <p className="text-sm text-orange-600 mt-2 flex items-start gap-2">
                  <Info className="h-4 w-4 mt-0.5 flex-shrink-0" />
                  {config.observacoes}
                </p>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* PIX */}
        {config.pixAtivo && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <div className="w-8 h-8 rounded-lg bg-green-100 flex items-center justify-center">
                  <QrCode className="h-4 w-4 text-green-600" />
                </div>
                PIX
                <Badge className="bg-green-100 text-green-700 ml-auto">Disponível</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {config.pixTipoChave && (
                <div className="text-sm">
                  <span className="text-gray-500">Tipo de Chave:</span>
                  <span className="ml-2 font-medium capitalize">{config.pixTipoChave}</span>
                </div>
              )}
              {config.pixChave && (
                <div className="flex items-center gap-2">
                  <div className="flex-1 bg-gray-50 rounded-lg p-3 font-mono text-sm break-all">
                    {config.pixChave}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyToClipboard(config.pixChave!, "Chave PIX")}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              )}
              {config.pixNomeBeneficiario && (
                <div className="text-sm">
                  <span className="text-gray-500">Beneficiário:</span>
                  <span className="ml-2 font-medium">{config.pixNomeBeneficiario}</span>
                </div>
              )}
              {config.pixQrCodeUrl && (
                <div className="flex justify-center pt-2">
                  <img 
                    src={config.pixQrCodeUrl} 
                    alt="QR Code PIX" 
                    className="max-w-[200px] rounded-lg border"
                  />
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Boleto */}
        {config.boletoAtivo && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center">
                  <FileText className="h-4 w-4 text-blue-600" />
                </div>
                Boleto Bancário
                <Badge className="bg-blue-100 text-blue-700 ml-auto">Disponível</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {config.boletoInstrucoes && (
                <p className="text-sm text-gray-600 whitespace-pre-line">
                  {config.boletoInstrucoes}
                </p>
              )}
              {config.boletoLinkPadrao && (
                <Button
                  className="w-full"
                  onClick={() => window.open(config.boletoLinkPadrao!, "_blank")}
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Acessar Boleto
                </Button>
              )}
            </CardContent>
          </Card>
        )}

        {/* Cartão */}
        {config.cartaoAtivo && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <div className="w-8 h-8 rounded-lg bg-purple-100 flex items-center justify-center">
                  <CreditCard className="h-4 w-4 text-purple-600" />
                </div>
                Cartão de Crédito
                <Badge className="bg-purple-100 text-purple-700 ml-auto">Disponível</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {config.cartaoDescricao && (
                <p className="text-sm text-gray-600 whitespace-pre-line">
                  {config.cartaoDescricao}
                </p>
              )}
              {config.cartaoLinkPagamento && (
                <Button
                  className="w-full bg-purple-600 hover:bg-purple-700"
                  onClick={() => window.open(config.cartaoLinkPagamento!, "_blank")}
                >
                  <CreditCard className="h-4 w-4 mr-2" />
                  Pagar com Cartão
                </Button>
              )}
            </CardContent>
          </Card>
        )}

        {/* Nota Fiscal */}
        {config.notaFiscalAtivo && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <div className="w-8 h-8 rounded-lg bg-orange-100 flex items-center justify-center">
                  <Receipt className="h-4 w-4 text-orange-600" />
                </div>
                Nota Fiscal
                <Badge className="bg-orange-100 text-orange-700 ml-auto">Disponível</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {config.notaFiscalInstrucoes && (
                <p className="text-sm text-gray-600 whitespace-pre-line">
                  {config.notaFiscalInstrucoes}
                </p>
              )}
              {config.notaFiscalEmail && (
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => window.location.href = `mailto:${config.notaFiscalEmail}?subject=Solicitação de Nota Fiscal`}
                >
                  <Mail className="h-4 w-4 mr-2" />
                  Solicitar por E-mail
                </Button>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
