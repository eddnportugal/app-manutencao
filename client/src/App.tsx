import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import { lazy, Suspense } from "react";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import { AuthProvider } from "./contexts/AuthContext";
import WhatsAppButton from "./components/WhatsAppButton";
import { LayoutPreferencesProvider } from "./components/LayoutPreferencesProvider";
import { ProtectedRoute } from "./components/ProtectedRoute";

// Lightweight pages – loaded eagerly (Home, Login, public routes)
import Home from "./pages/Home";
import Login from "./pages/Login";
import Registar from "./pages/Registar";
import RecuperarSenha from "./pages/RecuperarSenha";

// NEW APP pages — lazy loaded
const AppDashboard = lazy(() => import("./pages/AppDashboard"));
const AppLogin = lazy(() => import("./pages/AppLogin"));
const AppCadastro = lazy(() => import("./pages/AppCadastro"));
const MinhaContaPage = lazy(() => import("./pages/MinhaContaPage"));
const MasterPanelPage = lazy(() => import("./pages/MasterPanelPage"));
const FuncionariosPage = lazy(() => import("./pages/modules/FuncionariosPage"));
const EquipePage = lazy(() => import("./pages/modules/EquipePage"));
const ManutencaoPage = lazy(() => import("./pages/modules/ManutencaoPage"));
const QRCodePage = lazy(() => import("./pages/modules/QRCodePage"));
const DocumentosPage = lazy(() => import("./pages/modules/DocumentosPage"));
const AgendaPage = lazy(() => import("./pages/modules/AgendaPage"));
const LocalizacaoPage = lazy(() => import("./pages/modules/LocalizacaoPage"));
const VistoriaPage = lazy(() => import("./pages/modules/VistoriaPage"));
const AppTimelinePage = lazy(() => import("./pages/modules/TimelinePage"));
const TermosDeUsoPage = lazy(() => import("./pages/TermosDeUsoPage"));
const PoliticaPrivacidadePage = lazy(() => import("./pages/PoliticaPrivacidadePage"));

// Heavy pages – lazy loaded for code-splitting
const Dashboard = lazy(() => import("./pages/Dashboard"));
const Demo = lazy(() => import("./pages/Demo"));
const MagazineViewer = lazy(() => import("./pages/MagazineViewer"));
const RevistaEditor = lazy(() => import("./pages/RevistaEditor"));
const CondominioManager = lazy(() => import("./pages/CondominioManager"));
const Templates = lazy(() => import("./pages/Templates"));
const TransitionEffects = lazy(() => import("./pages/TransitionEffects"));
const Notificacoes = lazy(() => import("./pages/Notificacoes"));
const Votar = lazy(() => import("./pages/Votar"));
const ItemCompartilhadoPage = lazy(() => import("./pages/ItemCompartilhadoPage").then(m => ({ default: m.ItemCompartilhadoPage })));
const AgendaVencimentos = lazy(() => import("./pages/AgendaVencimentos"));
const Contrato = lazy(() => import("./pages/Contrato"));
const Apresentacao = lazy(() => import("./pages/Apresentacao"));
const CadastroMorador = lazy(() => import("./pages/CadastroMorador"));
const AssembleiaPublica = lazy(() => import("./pages/AssembleiaPublica"));
const NotificarMoradorPage = lazy(() => import("./pages/NotificarMoradorPage"));
const HistoricoInfracoesPage = lazy(() => import("./pages/HistoricoInfracoesPage"));
const NotificacaoPublicaPage = lazy(() => import("./pages/NotificacaoPublicaPage"));
const DemoLayouts = lazy(() => import("./pages/DemoLayouts"));
const LandingApp = lazy(() => import("./pages/LandingApp"));
const LandingRevista = lazy(() => import("./pages/LandingRevista"));
const LandingRelatorio = lazy(() => import("./pages/LandingRelatorio"));
const MoradorLogin = lazy(() => import("./pages/MoradorLogin"));
const MoradorDashboard = lazy(() => import("./pages/MoradorDashboard"));
const MoradorRecuperarSenha = lazy(() => import("./pages/MoradorRecuperarSenha"));
const MoradorRedefinirSenha = lazy(() => import("./pages/MoradorRedefinirSenha"));
const RedefinirSenha = lazy(() => import("./pages/RedefinirSenha"));
const Perfil = lazy(() => import("./pages/Perfil"));
const AdminFuncoes = lazy(() => import("./pages/AdminFuncoes"));
const AdminUsuarios = lazy(() => import("./pages/AdminUsuarios"));
const AdminLogs = lazy(() => import("./pages/AdminLogs"));
const AdminFinanceiro = lazy(() => import("./pages/AdminFinanceiro"));
const FuncionarioLogin = lazy(() => import("./pages/FuncionarioLogin"));
const FuncionarioDashboard = lazy(() => import("./pages/FuncionarioDashboard"));
const FuncionarioRecuperarSenha = lazy(() => import("./pages/FuncionarioRecuperarSenha"));
const FuncionarioRedefinirSenha = lazy(() => import("./pages/FuncionarioRedefinirSenha"));
const MembroLogin = lazy(() => import("./pages/MembroLogin"));
const MembroEsqueciSenha = lazy(() => import("./pages/MembroEsqueciSenha"));
const MembroRedefinirSenha = lazy(() => import("./pages/MembroRedefinirSenha"));
const HistoricoAcessosPage = lazy(() => import("./pages/HistoricoAcessosPage"));
const CompartilhadoPage = lazy(() => import("./pages/CompartilhadoPage"));
const TimelineVisualizarPage = lazy(() => import("./pages/TimelineVisualizarPage"));
const AppBuilder = lazy(() => import("./pages/AppBuilder"));
const RelatorioBuilder = lazy(() => import("./pages/RelatorioBuilder"));
const OrdensServico = lazy(() => import("@/pages/OrdensServico"));
const OrdemServicoDetalhe = lazy(() => import("@/pages/OrdemServicoDetalhe"));
const AppViewer = lazy(() => import("./pages/AppViewer"));
const AppView = lazy(() => import("./pages/AppView"));
const PublicoView = lazy(() => import("./pages/PublicoView"));
const ItemRevistaPublico = lazy(() => import("./pages/ItemRevistaPublico"));
const HistoricoTarefasSimples = lazy(() => import("./pages/HistoricoTarefasSimples"));
const AppRedefinirSenha = lazy(() => import("./pages/AppRedefinirSenha"));
const TimelinePage = lazy(() => import("./pages/TimelinePage"));
const GestorRedefinirSenha = lazy(() => import("./pages/GestorRedefinirSenha"));
const RelatoriosManutencaoPage = lazy(() => import("./pages/RelatoriosManutencaoPage"));
const ChecklistTemplatesPage = lazy(() => import("./pages/ChecklistTemplatesPage"));
const BackupPage = lazy(() => import("./pages/BackupPage"));
const ExportarNuvem = lazy(() => import("./pages/ExportarNuvem"));
const PersonalizarLayout = lazy(() => import("./pages/PersonalizarLayout"));
const FuncoesPersonalizadasPage = lazy(() => import("./pages/FuncoesPersonalizadasPage"));
const FuncaoPersonalizadaFormPage = lazy(() => import("./pages/FuncaoPersonalizadaFormPage"));
const FuncaoPublicaFormPage = lazy(() => import("./pages/FuncaoPublicaFormPage"));
const MobileMenuDemo = lazy(() => import("./components/MobileMenuDemo"));

// Loading fallback for lazy components
function PageLoader() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500" />
    </div>
  );
}

function Router() {
  return (
    <Switch>
      {/* Public routes */}
      <Route path="/" component={Home} />
      <Route path="/login" component={Login} />
      <Route path="/registar" component={Registar} />
      <Route path="/recuperar-senha" component={RecuperarSenha} />
      <Route path="/redefinir-senha/:token" component={RedefinirSenha} />
      <Route path="/app/recuperar-senha/:token" component={AppRedefinirSenha} />
      <Route path="/demo" component={Demo} />
      <Route path="/demo-layouts" component={DemoLayouts} />
      <Route path="/demo-menu-mobile" component={MobileMenuDemo} />
      <Route path="/app" component={LandingApp} />
      <Route path="/revista" component={LandingRevista} />
      <Route path="/relatorio" component={LandingRelatorio} />
      <Route path="/templates" component={Templates} />
      <Route path="/contrato" component={Contrato} />
      <Route path="/apresentacao" component={Apresentacao} />
      <Route path="/transicoes" component={TransitionEffects} />
      <Route path="/revista/:shareLink/item/:tipo/:itemId" component={ItemRevistaPublico} />
      <Route path="/revista/:shareLink" component={MagazineViewer} />
      <Route path="/app/:shareLink" component={AppViewer} />
      <Route path="/meuapp/:id" component={AppView} />
      
      {/* Voting route */}
      <Route path="/votar/:id" component={Votar} />
      
      {/* Shared item routes */}
      <Route path="/compartilhado/:tipo/:token" component={ItemCompartilhadoPage} />
      <Route path="/compartilhado/:token" component={CompartilhadoPage} />
      <Route path="/timeline/:token">{(params) => <TimelineVisualizarPage token={params.token} />}</Route>
      
      {/* Public registration */}
      <Route path="/cadastro/:token" component={CadastroMorador} />
      
      {/* Public assembly access */}
      <Route path="/assembleia/:id" component={AssembleiaPublica} />
      
      {/* Public QR Code access */}
      <Route path="/publico/:tipo/:id" component={PublicoView} />
      
      {/* Public custom function form */}
      <Route path="/manutencao/:token" component={FuncaoPublicaFormPage} />
      
      {/* Public notification response */}
      <Route path="/notificacao/:token" component={NotificacaoPublicaPage} />
      
      {/* Portal do Morador */}
      <Route path="/morador/login" component={MoradorLogin} />
      <Route path="/morador/recuperar-senha" component={MoradorRecuperarSenha} />
      <Route path="/morador/redefinir-senha/:token" component={MoradorRedefinirSenha} />
      <Route path="/morador" component={MoradorDashboard} />
      
      {/* Portal do Membro da Equipe */}
      <Route path="/equipe/login" component={MembroLogin} />
      <Route path="/equipe/esqueci-senha" component={MembroEsqueciSenha} />
      <Route path="/equipe/redefinir-senha" component={MembroRedefinirSenha} />
      
      {/* Portal do Funcionário */}
      <Route path="/funcionario/login" component={FuncionarioLogin} />
      <Route path="/funcionario/recuperar-senha" component={FuncionarioRecuperarSenha} />
      <Route path="/funcionario/redefinir-senha" component={FuncionarioRedefinirSenha} />
      <Route path="/funcionario/dashboard" component={FuncionarioDashboard} />
      <Route path="/funcionario/:section" component={FuncionarioDashboard} />
      
      {/* ===== NEW APP ROUTES ===== */}
      <Route path="/app/login" component={AppLogin} />
      <Route path="/app/cadastro" component={AppCadastro} />
      <Route path="/app/termos" component={TermosDeUsoPage} />
      <Route path="/app/privacidade" component={PoliticaPrivacidadePage} />
      <Route path="/app/dashboard">{() => <ProtectedRoute><AppDashboard /></ProtectedRoute>}</Route>
      <Route path="/app/minha-conta">{() => <ProtectedRoute><MinhaContaPage /></ProtectedRoute>}</Route>
      <Route path="/app/master">{() => <ProtectedRoute><MasterPanelPage /></ProtectedRoute>}</Route>
      <Route path="/app/funcionarios">{() => <ProtectedRoute><FuncionariosPage /></ProtectedRoute>}</Route>
      <Route path="/app/equipe">{() => <ProtectedRoute><EquipePage /></ProtectedRoute>}</Route>
      <Route path="/app/manutencao">{() => <ProtectedRoute><ManutencaoPage /></ProtectedRoute>}</Route>
      <Route path="/app/qrcode">{() => <ProtectedRoute><QRCodePage /></ProtectedRoute>}</Route>
      <Route path="/app/documentos">{() => <ProtectedRoute><DocumentosPage /></ProtectedRoute>}</Route>
      <Route path="/app/agenda">{() => <ProtectedRoute><AgendaPage /></ProtectedRoute>}</Route>
      <Route path="/app/localizacao">{() => <ProtectedRoute><LocalizacaoPage /></ProtectedRoute>}</Route>
      <Route path="/app/vistoria">{() => <ProtectedRoute><VistoriaPage /></ProtectedRoute>}</Route>
      <Route path="/app/timeline">{() => <ProtectedRoute><AppTimelinePage /></ProtectedRoute>}</Route>

      {/* Protected routes */}
      <Route path="/perfil">{() => <ProtectedRoute><Perfil /></ProtectedRoute>}</Route>
      <Route path="/dashboard">{() => <ProtectedRoute><Dashboard /></ProtectedRoute>}</Route>
      <Route path="/dashboard/notificacoes" component={Notificacoes} />
      <Route path="/dashboard/vencimentos">{() => { window.location.href = '/dashboard/agenda-vencimentos'; return null; }}</Route>
      <Route path="/dashboard/notificar-morador" component={NotificarMoradorPage} />
      <Route path="/dashboard/historico-infracoes" component={HistoricoInfracoesPage} />
      <Route path="/admin/funcoes">{() => <ProtectedRoute><AdminFuncoes /></ProtectedRoute>}</Route>
      <Route path="/admin/usuarios">{() => <ProtectedRoute><AdminUsuarios /></ProtectedRoute>}</Route>
      <Route path="/admin/logs">{() => <ProtectedRoute><AdminLogs /></ProtectedRoute>}</Route>
      <Route path="/admin/financeiro">{() => <ProtectedRoute><AdminFinanceiro /></ProtectedRoute>}</Route>
      <Route path="/dashboard/historico-acessos" component={HistoricoAcessosPage} />
      <Route path="/dashboard/apps/novo" component={AppBuilder} />
      <Route path="/dashboard/relatorios/novo" component={RelatorioBuilder} />
      {/* Rota de ordens-servico agora usa o Dashboard.tsx */}
      <Route path="/dashboard/ordens-servico/nova" component={OrdemServicoDetalhe} />
      <Route path="/dashboard/ordens-servico/:id" component={OrdemServicoDetalhe} />
      {/* Rota criar-projeto removida - sistema focado em manutenção */}
      <Route path="/dashboard/funcoes-simples" component={HistoricoTarefasSimples} />
      <Route path="/dashboard/relatorios-manutencao" component={RelatoriosManutencaoPage} />
      <Route path="/dashboard/checklist-templates" component={ChecklistTemplatesPage} />
      <Route path="/dashboard/backup" component={BackupPage} />
      <Route path="/dashboard/exportar-nuvem" component={ExportarNuvem} />
      <Route path="/dashboard/personalizar-layout" component={PersonalizarLayout} />
      <Route path="/dashboard/funcoes-personalizadas" component={FuncoesPersonalizadasPage} />
      <Route path="/dashboard/funcao-personalizada/:funcaoId" component={FuncaoPersonalizadaFormPage} />
      <Route path="/dashboard/revistas/nova">{() => { window.location.href = '/dashboard/revistas'; return null; }}</Route>
      <Route path="/dashboard/:section" component={Dashboard} />
      <Route path="/condominio/:id" component={CondominioManager} />
      <Route path="/revista/editor/:id" component={RevistaEditor} />
      
      {/* Fallback */}
      <Route path="/404" component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <TooltipProvider>
          <AuthProvider>
            <LayoutPreferencesProvider>
              <Toaster />
              <Suspense fallback={<PageLoader />}>
                <Router />
              </Suspense>
              <WhatsAppButton />
            </LayoutPreferencesProvider>
          </AuthProvider>
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
