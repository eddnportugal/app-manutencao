import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { 
  BookOpen, 
  ArrowLeft, 
  Check,
  Sparkles,
  Image,
  Palette,
  Share2,
  Download,
  Eye,
  FileText,
  Megaphone,
  Star,
  Heart,
  Award
} from "lucide-react";
import { Link } from "wouter";

const features = [
  {
    icon: BookOpen,
    title: "Navegação por Páginas",
    description: "Experiência de leitura como uma revista real, com efeito de virar páginas e transições suaves."
  },
  {
    icon: Palette,
    title: "Design Personalizado",
    description: "Escolha entre diversos templates e personalize cores, fontes e layout da sua revista."
  },
  {
    icon: Image,
    title: "Galeria de Fotos",
    description: "Adicione fotos de eventos, obras e melhorias da organização com legendas e descrições."
  },
  {
    icon: Share2,
    title: "Compartilhamento Fácil",
    description: "Gere um link único para compartilhar a revista via WhatsApp, email ou redes sociais."
  },
  {
    icon: Download,
    title: "Exportação em PDF",
    description: "Baixe a revista completa em PDF para impressão ou arquivamento."
  },
  {
    icon: Eye,
    title: "Visualização Elegante",
    description: "Interface sofisticada que valoriza o conteúdo e impressiona a equipa."
  }
];

const sections = [
  { icon: Megaphone, name: "Editorial", description: "Mensagem do gestor" },
  { icon: FileText, name: "Avisos", description: "Comunicados importantes" },
  { icon: Star, name: "Destaques", description: "Realizações do mês" },
  { icon: Heart, name: "Comunidade", description: "Eventos e confraternizações" },
  { icon: Award, name: "Melhorias", description: "Obras e benfeitorias" },
];

const benefits = [
  "Formato profissional e elegante",
  "Efeitos de transição personalizáveis",
  "Edições mensais organizadas",
  "Histórico de publicações",
  "Estatísticas de visualização",
  "Anúncios de parceiros"
];

export default function LandingRevista() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50 to-white">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur border-b">
        <div className="container py-4">
          <div className="flex items-center justify-between">
            <Link href="/">
              <Button variant="ghost" className="gap-2">
                <ArrowLeft className="w-4 h-4" />
                Voltar
              </Button>
            </Link>
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-xl bg-emerald-600 flex items-center justify-center">
                <BookOpen className="w-5 h-5 text-white" />
              </div>
              <span className="font-serif font-bold text-xl">Revista Digital</span>
            </div>
            <Link href="/dashboard/revistas">
              <Button className="bg-emerald-600 hover:bg-emerald-700">
                Criar Minha Revista
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 overflow-hidden">
        <div className="container">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-100 text-emerald-700 mb-6">
                <Sparkles className="w-4 h-4" />
                <span className="text-sm font-medium">Layout de Páginas</span>
              </div>
              <h1 className="text-4xl md:text-5xl font-serif font-bold text-gray-900 mb-6">
                Uma Revista
                <span className="text-emerald-600"> Profissional</span>
                <br />para seu Condomínio
              </h1>
              <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                Crie revistas digitais interativas com navegação elegante página a página, 
                perfeitas para comunicar realizações, eventos e novidades da organização.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link href="/dashboard/revistas">
                  <Button size="lg" className="bg-emerald-600 hover:bg-emerald-700">
                    <BookOpen className="w-5 h-5 mr-2" />
                    Criar Minha Revista
                  </Button>
                </Link>
                <Link href="/demo-layouts">
                  <Button size="lg" variant="outline">
                    Ver Demonstração
                  </Button>
                </Link>
              </div>
            </div>
            
            {/* Magazine Preview */}
            <div className="relative">
              <div className="bg-gradient-to-br from-emerald-600 to-emerald-800 rounded-3xl p-8 shadow-2xl transform rotate-2 hover:rotate-0 transition-transform duration-500">
                <div className="bg-white rounded-lg shadow-inner overflow-hidden">
                  {/* Magazine Cover */}
                  <div className="aspect-[3/4] bg-gradient-to-b from-emerald-50 to-white p-6 flex flex-col">
                    <div className="text-center mb-4">
                      <p className="text-xs text-emerald-600 font-medium tracking-wider">EDIÇÃO DEZEMBRO 2024</p>
                      <h3 className="text-xl font-serif font-bold text-gray-900 mt-1">Residencial Jardins</h3>
                      <div className="w-12 h-1 bg-emerald-500 mx-auto mt-2 rounded-full"></div>
                    </div>
                    <div className="flex-1 space-y-3">
                      {sections.slice(0, 4).map((section, index) => (
                        <div key={index} className="flex items-center gap-3 p-2 rounded-lg bg-gray-50">
                          <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center">
                            <section.icon className="w-4 h-4 text-emerald-600" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900">{section.name}</p>
                            <p className="text-xs text-gray-500">{section.description}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="text-center mt-4">
                      <p className="text-xs text-gray-400">— 1 —</p>
                    </div>
                  </div>
                </div>
              </div>
              {/* Floating elements */}
              <div className="absolute -top-4 -left-4 bg-white rounded-xl shadow-lg p-3">
                <Sparkles className="w-6 h-6 text-emerald-600" />
              </div>
              <div className="absolute -bottom-4 -right-4 bg-white rounded-xl shadow-lg px-4 py-2">
                <span className="text-sm font-medium text-emerald-600">12 páginas</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="container">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-serif font-bold text-gray-900 mb-4">
              Uma Experiência de Leitura Única
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Recursos pensados para criar revistas digitais profissionais e envolventes
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="border-0 shadow-lg hover:shadow-xl transition-shadow">
                <CardContent className="p-6">
                  <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center mb-4">
                    <feature.icon className="w-6 h-6 text-emerald-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">{feature.title}</h3>
                  <p className="text-gray-600">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 bg-emerald-600">
        <div className="container">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-serif font-bold text-white mb-6">
                Por que escolher o formato Revista?
              </h2>
              <p className="text-xl text-emerald-100 mb-8">
                O formato de revista digital é ideal para comunicações mensais, 
                relatórios de gestão e apresentações especiais.
              </p>
              <div className="grid sm:grid-cols-2 gap-4">
                {benefits.map((benefit, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
                      <Check className="w-4 h-4 text-white" />
                    </div>
                    <span className="text-white">{benefit}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-white/10 rounded-2xl p-8 backdrop-blur">
              <div className="text-center">
                <BookOpen className="w-16 h-16 text-white mx-auto mb-4" />
                <h3 className="text-2xl font-bold text-white mb-2">Edições Memoráveis</h3>
                <p className="text-emerald-100">
                  Crie um arquivo histórico da sua organização com edições mensais 
                  que documentam eventos, melhorias e a vida em comunidade.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gray-50">
        <div className="container text-center">
          <h2 className="text-3xl md:text-4xl font-serif font-bold text-gray-900 mb-4">
            Comece sua Primeira Edição Hoje
          </h2>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Crie uma revista digital profissional em minutos e surpreenda a equipa.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link href="/dashboard/revistas">
              <Button size="lg" className="bg-emerald-600 hover:bg-emerald-700">
                <BookOpen className="w-5 h-5 mr-2" />
                Criar Minha Revista Grátis
              </Button>
            </Link>
            <Link href="/">
              <Button size="lg" variant="outline">
                Conhecer Outros Formatos
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 border-t">
        <div className="container text-center text-gray-500">
          <p>© 2024 PlataformaDigital. Todos os direitos reservados.</p>
        </div>
      </footer>
    </div>
  );
}
