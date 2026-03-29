import { ArrowLeft, Shield } from 'lucide-react';
import { useLocation } from 'wouter';

export default function PoliticaPrivacidadePage() {
  const [, setLocation] = useLocation();

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-10 bg-background/80 backdrop-blur-lg border-b px-4 py-3 flex items-center gap-3">
        <button onClick={() => setLocation('/app/login')} className="p-2 -ml-2 rounded-xl hover:bg-muted">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <Shield className="w-5 h-5 text-primary" />
        <h1 className="font-bold text-lg">Política de Privacidade</h1>
      </header>

      <div className="max-w-2xl mx-auto px-4 py-8 prose prose-sm dark:prose-invert">
        <p className="text-muted-foreground text-sm">Última atualização: {new Date().toLocaleDateString('pt-BR')}</p>

        <h2>1. Dados Coletados</h2>
        <p>Coletamos os seguintes dados pessoais:</p>
        <ul>
          <li><strong>Cadastrais:</strong> nome, e-mail, telefone/WhatsApp, CNPJ/CPF</li>
          <li><strong>De uso:</strong> logs de acesso, funcionalidades utilizadas</li>
          <li><strong>De conteúdo:</strong> fotos, documentos e textos inseridos nas ordens de serviço, vistorias e demais módulos</li>
        </ul>

        <h2>2. Finalidade</h2>
        <p>Os dados são utilizados para:</p>
        <ul>
          <li>Prover e manter o funcionamento do Serviço</li>
          <li>Autenticação e segurança da conta</li>
          <li>Notificações relevantes sobre manutenções e vencimentos</li>
          <li>Suporte ao usuário</li>
          <li>Melhorias no Serviço</li>
        </ul>

        <h2>3. Compartilhamento</h2>
        <p>
          Seus dados não são vendidos a terceiros. Podem ser compartilhados apenas com:
        </p>
        <ul>
          <li>Provedores de infraestrutura (hospedagem, armazenamento em nuvem)</li>
          <li>Autoridades legais quando exigido por lei</li>
        </ul>

        <h2>4. Armazenamento e Segurança</h2>
        <p>
          Os dados são armazenados em servidores seguros com criptografia em trânsito (HTTPS/TLS).
          Senhas são armazenadas com hash bcrypt. Implementamos medidas técnicas e organizacionais
          para proteger seus dados contra acesso não autorizado.
        </p>

        <h2>5. Direitos do Titular</h2>
        <p>Conforme a LGPD (Lei nº 13.709/2018), você pode:</p>
        <ul>
          <li>Acessar seus dados pessoais</li>
          <li>Corrigir dados incompletos ou desatualizados</li>
          <li>Solicitar a eliminação de dados desnecessários</li>
          <li>Revogar o consentimento</li>
          <li>Solicitar portabilidade dos dados</li>
        </ul>

        <h2>6. Cookies</h2>
        <p>
          Utilizamos cookies de sessão para autenticação. Não utilizamos cookies de rastreamento
          de terceiros ou publicidade.
        </p>

        <h2>7. Retenção</h2>
        <p>
          Os dados são mantidos enquanto a conta estiver ativa. Após o cancelamento,
          os dados são retidos por até 30 dias antes da exclusão definitiva.
        </p>

        <h2>8. Alterações</h2>
        <p>
          Esta política pode ser atualizada periodicamente. Notificaremos sobre alterações
          significativas por e-mail ou aviso no Serviço.
        </p>

        <h2>9. Contato</h2>
        <p>
          Para exercer seus direitos ou esclarecer dúvidas sobre privacidade,
          entre em contato pelo WhatsApp: (11) 93328-4364.
        </p>
      </div>
    </div>
  );
}
