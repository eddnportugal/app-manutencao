import { ArrowLeft, FileText } from 'lucide-react';
import { useLocation } from 'wouter';

export default function TermosDeUsoPage() {
  const [, setLocation] = useLocation();

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-10 bg-background/80 backdrop-blur-lg border-b px-4 py-3 flex items-center gap-3">
        <button onClick={() => setLocation('/app/login')} className="p-2 -ml-2 rounded-xl hover:bg-muted">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <FileText className="w-5 h-5 text-primary" />
        <h1 className="font-bold text-lg">Termos de Uso</h1>
      </header>

      <div className="max-w-2xl mx-auto px-4 py-8 prose prose-sm dark:prose-invert">
        <p className="text-muted-foreground text-sm">Última atualização: {new Date().toLocaleDateString('pt-BR')}</p>

        <h2>1. Aceitação dos Termos</h2>
        <p>
          Ao acessar e utilizar o App Manutenção ("Serviço"), você concorda com estes Termos de Uso.
          Caso não concorde, não utilize o Serviço.
        </p>

        <h2>2. Descrição do Serviço</h2>
        <p>
          O App Manutenção é uma plataforma de gestão de manutenção predial que permite a administradores,
          supervisores e funcionários registrar, acompanhar e gerenciar ordens de serviço, vistorias,
          checklists, eventos e demais atividades de manutenção.
        </p>

        <h2>3. Cadastro e Conta</h2>
        <p>
          O cadastro é obrigatório para utilizar o Serviço. Você é responsável por manter suas credenciais
          em sigilo e por todas as atividades realizadas com sua conta. O tipo de conta
          (Administrador, Supervisor, Funcionário) determina seus níveis de acesso.
        </p>

        <h2>4. Uso Aceitável</h2>
        <p>Você se compromete a:</p>
        <ul>
          <li>Não utilizar o Serviço para fins ilegais ou não autorizados</li>
          <li>Não tentar acessar contas de outros usuários</li>
          <li>Não transmitir vírus, malware ou código malicioso</li>
          <li>Manter seus dados cadastrais atualizados</li>
        </ul>

        <h2>5. Propriedade Intelectual</h2>
        <p>
          Todo o conteúdo do Serviço, incluindo textos, gráficos, logotipos, ícones e software,
          é propriedade do App Manutenção ou de seus licenciantes, protegido por leis de propriedade intelectual.
        </p>

        <h2>6. Pagamento</h2>
        <p>
          O Serviço é oferecido mediante assinatura mensal. Os valores e condições estão disponíveis na página de cadastro.
          O período de teste gratuito, quando disponível, é limitado e não renovável automaticamente.
        </p>

        <h2>7. Limitação de Responsabilidade</h2>
        <p>
          O Serviço é fornecido "como está". Não garantimos que estará disponível ininterruptamente ou
          livre de erros. Em nenhuma circunstância seremos responsáveis por danos indiretos, incidentais
          ou consequenciais.
        </p>

        <h2>8. Rescisão</h2>
        <p>
          Podemos suspender ou encerrar sua conta a qualquer momento por violação destes Termos.
          Você pode cancelar sua conta a qualquer momento entrando em contato com o suporte.
        </p>

        <h2>9. Alterações</h2>
        <p>
          Reservamo-nos o direito de modificar estes Termos a qualquer momento.
          As alterações entram em vigor imediatamente após publicação.
        </p>

        <h2>10. Contato</h2>
        <p>
          Para dúvidas sobre estes Termos, entre em contato pelo WhatsApp: (11) 93328-4364.
        </p>
      </div>
    </div>
  );
}
