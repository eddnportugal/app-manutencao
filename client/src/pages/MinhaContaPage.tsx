import { useState, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { ArrowLeft, Camera, Moon, Sun, Upload, Save, LogOut } from 'lucide-react';
import { useLocation } from 'wouter';
import { maskPhone } from '@/lib/utils';


export default function MinhaContaPage() {
  const { user, logout } = useAuth();
  const [, setLocation] = useLocation();

  const [nome, setNome] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [whatsapp, setWhatsapp] = useState(user?.whatsapp || '');
  const [empresa, setEmpresa] = useState(user?.empresa || '');
  const [cpfCnpj, setCpfCnpj] = useState(user?.cpfCnpj || '');
  const [endereco, setEndereco] = useState(user?.endereco || '');
  const [darkMode, setDarkMode] = useState(
    document.documentElement.classList.contains('dark'),
  );

  const logoInputRef = useRef<HTMLInputElement>(null);
  const assinaturaInputRef = useRef<HTMLInputElement>(null);

  const toggleTheme = () => {
    const next = !darkMode;
    setDarkMode(next);
    document.documentElement.classList.toggle('dark', next);
    localStorage.setItem('theme', next ? 'dark' : 'light');
  };

  const initials = (user?.name || 'U')
    .split(' ')
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  const roleLabel: Record<string, string> = {
    master: 'Master',
    admin: 'Administrador',
    supervisor: 'Supervisor',
    funcionario: 'Funcionário',
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <div className="sticky top-0 z-30 bg-background/80 backdrop-blur-lg border-b px-4 py-3 flex items-center gap-3 safe-area-top">
        <button onClick={() => setLocation('/app/dashboard')} className="p-2 -ml-2 rounded-xl hover:bg-muted">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="font-bold text-lg">Minha Conta</h1>
      </div>

      <div className="max-w-lg mx-auto px-4 py-6 space-y-6">
        {/* Avatar */}
        <div className="flex flex-col items-center gap-3">
          <div className="relative">
            {user?.avatarUrl ? (
              <img
                src={user.avatarUrl}
                alt={user.name}
                className="w-24 h-24 rounded-full object-cover ring-4 ring-primary/20"
              />
            ) : (
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center ring-4 ring-primary/20">
                <span className="text-2xl font-bold text-white">{initials}</span>
              </div>
            )}
            <button className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-lg">
              <Camera className="w-4 h-4" />
            </button>
          </div>
          <p className="text-sm text-muted-foreground">{roleLabel[user?.role || 'funcionario']}</p>
        </div>

        {/* Dados pessoais */}
        <section className="space-y-4">
          <h2 className="font-semibold text-base">Dados Pessoais</h2>
          <div className="space-y-3">
            <div>
              <label htmlFor="mc-nome" className="text-sm text-muted-foreground mb-1 block">Nome</label>
              <input
                id="mc-nome"
                type="text"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-muted border-0 text-sm focus:ring-2 focus:ring-primary/30 outline-none"
              />
            </div>
            <div>
              <label htmlFor="mc-email" className="text-sm text-muted-foreground mb-1 block">E-mail</label>
              <input
                id="mc-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-muted border-0 text-sm focus:ring-2 focus:ring-primary/30 outline-none"
              />
            </div>
            <div>
              <label htmlFor="mc-whatsapp" className="text-sm text-muted-foreground mb-1 block">WhatsApp</label>
              <input
                id="mc-whatsapp"
                type="tel"
                value={whatsapp}
                onChange={(e) => setWhatsapp(maskPhone(e.target.value))}
                placeholder="(11) 99999-9999"
                className="w-full px-4 py-3 rounded-xl bg-muted border-0 text-sm focus:ring-2 focus:ring-primary/30 outline-none"
              />
            </div>
          </div>
        </section>

        {/* Dados da empresa */}
        <section className="space-y-4">
          <h2 className="font-semibold text-base">Dados da Empresa</h2>
          <div className="space-y-3">
            <div>
              <label htmlFor="mc-empresa" className="text-sm text-muted-foreground mb-1 block">Nome / Razão Social</label>
              <input
                id="mc-empresa"
                type="text"
                value={empresa}
                onChange={(e) => setEmpresa(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-muted border-0 text-sm focus:ring-2 focus:ring-primary/30 outline-none"
              />
            </div>
            <div>
              <label htmlFor="mc-cpfcnpj" className="text-sm text-muted-foreground mb-1 block">CPF ou CNPJ</label>
              <input
                id="mc-cpfcnpj"
                type="text"
                value={cpfCnpj}
                onChange={(e) => setCpfCnpj(e.target.value)}
                placeholder="000.000.000-00"
                className="w-full px-4 py-3 rounded-xl bg-muted border-0 text-sm focus:ring-2 focus:ring-primary/30 outline-none"
              />
            </div>
            <div>
              <label htmlFor="mc-endereco" className="text-sm text-muted-foreground mb-1 block">Endereço</label>
              <input
                id="mc-endereco"
                type="text"
                value={endereco}
                onChange={(e) => setEndereco(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-muted border-0 text-sm focus:ring-2 focus:ring-primary/30 outline-none"
              />
            </div>
          </div>
        </section>

        {/* Upload logo + assinatura */}
        <section className="space-y-4">
          <h2 className="font-semibold text-base">Documentos</h2>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => logoInputRef.current?.click()}
              className="flex flex-col items-center gap-2 p-4 rounded-xl bg-muted hover:bg-muted/80 transition-colors"
            >
              <Upload className="w-6 h-6 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">Logo (PDF/header)</span>
              {user?.logoUrl && <span className="text-xs text-green-500">Enviado</span>}
            </button>
            <input ref={logoInputRef} type="file" accept="image/*" className="hidden" />

            <button
              onClick={() => assinaturaInputRef.current?.click()}
              className="flex flex-col items-center gap-2 p-4 rounded-xl bg-muted hover:bg-muted/80 transition-colors"
            >
              <Upload className="w-6 h-6 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">Assinatura digital</span>
              {user?.assinaturaUrl && <span className="text-xs text-green-500">Enviado</span>}
            </button>
            <input ref={assinaturaInputRef} type="file" accept="image/*" className="hidden" />
          </div>
        </section>

        {/* Tema */}
        <section className="space-y-4">
          <h2 className="font-semibold text-base">Aparência</h2>
          <button
            onClick={toggleTheme}
            className="w-full flex items-center justify-between px-4 py-3 rounded-xl bg-muted"
          >
            <div className="flex items-center gap-3">
              {darkMode ? <Moon className="w-5 h-5 text-indigo-400" /> : <Sun className="w-5 h-5 text-amber-500" />}
              <span className="text-sm">{darkMode ? 'Tema Escuro' : 'Tema Claro'}</span>
            </div>
            <div className={`w-12 h-7 rounded-full relative transition-colors ${darkMode ? 'bg-indigo-500' : 'bg-gray-300'}`}>
              <div className={`absolute top-0.5 w-6 h-6 rounded-full bg-white shadow transition-transform ${darkMode ? 'translate-x-5' : 'translate-x-0.5'}`} />
            </div>
          </button>
        </section>

        {/* Salvar */}
        <button className="w-full py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-xl font-medium flex items-center justify-center gap-2 hover:shadow-lg transition-shadow">
          <Save className="w-4 h-4" />
          Salvar Alterações
        </button>

        {/* Sair */}
        <button
          onClick={logout}
          className="w-full py-3 rounded-xl border border-red-200 dark:border-red-500/20 text-red-500 font-medium flex items-center justify-center gap-2 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
        >
          <LogOut className="w-4 h-4" />
          Sair da Conta
        </button>
      </div>
    </div>
  );
}
