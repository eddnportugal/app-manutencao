import { useAuth } from '@/contexts/AuthContext';
import { getVisibleModules, type DashboardStyle, type ModuleConfig } from '@/config/modules';
import { useLocation } from 'wouter';
import { useState, useEffect } from 'react';
import AppShell from '@/components/layout/AppShell';

// ─── Dashboard Summary Cards ───
function SummaryCards() {
  // Futuro: buscar dados reais via tRPC
  const stats = [
    { label: 'OS Abertas', value: '—', color: 'text-orange-500' },
    { label: 'Urgentes', value: '—', color: 'text-red-500' },
    { label: 'Vencendo Hoje', value: '—', color: 'text-amber-500' },
    { label: 'Concluídas', value: '—', color: 'text-emerald-500' },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 px-4 mb-6">
      {stats.map((s) => (
        <div
          key={s.label}
          className="bg-card border border-border rounded-2xl p-4 flex flex-col items-center gap-1"
        >
          <span className={`text-2xl font-bold ${s.color}`}>{s.value}</span>
          <span className="text-xs text-muted-foreground">{s.label}</span>
        </div>
      ))}
    </div>
  );
}

// ─── Style: Cards Gradiente (padrão) ───
function CardsGradiente({ modules, onNavigate }: { modules: ModuleConfig[]; onNavigate: (route: string) => void }) {
  return (
    <div className="grid grid-cols-2 gap-4 px-4">
      {modules.map((m) => {
        const Icon = m.icon;
        return (
          <button
            key={m.id}
            onClick={() => onNavigate(m.route)}
            className={`relative overflow-hidden bg-gradient-to-br ${m.gradient} rounded-2xl p-5 text-left text-white transition-all duration-200 hover:-translate-y-1 hover:shadow-xl active:scale-[0.97]`}
          >
            {/* Circle decoration */}
            <div className="absolute -top-5 -right-5 w-20 h-20 rounded-full bg-white/10" />
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center mb-3">
              <Icon className="w-5 h-5" />
            </div>
            <p className="font-bold text-sm">{m.label}</p>
            <p className="text-[11px] text-white/65 mt-0.5">{m.description}</p>
          </button>
        );
      })}
    </div>
  );
}

// ─── Style: Grid Clean ───
function GridClean({ modules, onNavigate }: { modules: ModuleConfig[]; onNavigate: (route: string) => void }) {
  return (
    <div className="grid grid-cols-3 gap-3 px-4">
      {modules.map((m) => {
        const Icon = m.icon;
        return (
          <button
            key={m.id}
            onClick={() => onNavigate(m.route)}
            className="flex flex-col items-center gap-2 p-4 rounded-2xl bg-card border border-border hover:shadow-md hover:-translate-y-0.5 transition-all"
          >
            <div
              className="w-13 h-13 rounded-2xl flex items-center justify-center"
              style={{ backgroundColor: m.color + '15', color: m.color }}
            >
              <Icon className="w-6 h-6" />
            </div>
            <span className="text-[11px] font-semibold text-muted-foreground text-center leading-tight">
              {m.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}

// ─── Style: Lista Moderna ───
function ListaModerna({ modules, onNavigate }: { modules: ModuleConfig[]; onNavigate: (route: string) => void }) {
  return (
    <div className="flex flex-col gap-2.5 px-4">
      {modules.map((m) => {
        const Icon = m.icon;
        return (
          <button
            key={m.id}
            onClick={() => onNavigate(m.route)}
            className="flex items-center gap-3.5 p-3.5 rounded-2xl bg-card border border-border hover:shadow-md hover:translate-x-1 transition-all text-left"
          >
            <div
              className={`w-11 h-11 rounded-xl bg-gradient-to-br ${m.gradient} flex items-center justify-center text-white flex-shrink-0`}
            >
              <Icon className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold">{m.label}</p>
              <p className="text-[11px] text-muted-foreground">{m.description}</p>
            </div>
            <svg className="w-4 h-4 text-muted-foreground/50 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </button>
        );
      })}
    </div>
  );
}

// ─── Style: Bolhas Circular ───
function BolhasCircular({ modules, onNavigate }: { modules: ModuleConfig[]; onNavigate: (route: string) => void }) {
  return (
    <div className="grid grid-cols-3 gap-y-6 gap-x-2 px-4">
      {modules.map((m) => {
        const Icon = m.icon;
        return (
          <button
            key={m.id}
            onClick={() => onNavigate(m.route)}
            className="flex flex-col items-center gap-2.5 hover:scale-110 transition-transform"
          >
            <div
              className={`w-16 h-16 rounded-full bg-gradient-to-br ${m.gradient} flex items-center justify-center text-white shadow-lg`}
            >
              <Icon className="w-6 h-6" />
            </div>
            <span className="text-[11px] font-semibold text-muted-foreground text-center leading-tight">
              {m.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}

// ─── Main Dashboard ───
const STYLE_KEY = 'dashboard_style';

export default function AppDashboard() {
  const { user, permissions } = useAuth();
  const [, setLocation] = useLocation();
  const [style, setStyle] = useState<DashboardStyle>(() => {
    return (localStorage.getItem(STYLE_KEY) as DashboardStyle) || 'cards-gradiente';
  });

  useEffect(() => {
    localStorage.setItem(STYLE_KEY, style);
  }, [style]);

  const role = user?.role || 'funcionario';
  const modules = getVisibleModules(role, permissions);

  const handleNavigate = (route: string) => setLocation(route);

  const greeting = user?.name
    ? `O que você precisa hoje?`
    : '';

  const StyleComponent = {
    'cards-gradiente': CardsGradiente,
    'grid-clean': GridClean,
    'lista-moderna': ListaModerna,
    'bolhas-circular': BolhasCircular,
  }[style];

  return (
    <AppShell>
      {/* Greeting */}
      <p className="px-4 text-sm text-muted-foreground mb-5 mt-4">{greeting}</p>

      {/* Summary */}
      <SummaryCards />

      {/* Module Grid */}
      <StyleComponent modules={modules} onNavigate={handleNavigate} />

      {/* Style Switcher (small, bottom) */}
      <div className="flex justify-center gap-2 mt-8 mb-4">
        {(
          [
            { key: 'cards-gradiente', label: 'Cards' },
            { key: 'grid-clean', label: 'Grid' },
            { key: 'lista-moderna', label: 'Lista' },
            { key: 'bolhas-circular', label: 'Bolhas' },
          ] as { key: DashboardStyle; label: string }[]
        ).map((s) => (
          <button
            key={s.key}
            onClick={() => setStyle(s.key)}
            className={`px-3 py-1.5 text-xs rounded-full font-medium transition-all ${
              style === s.key
                ? 'bg-primary text-primary-foreground shadow-sm'
                : 'bg-muted text-muted-foreground hover:bg-muted/80'
            }`}
          >
            {s.label}
          </button>
        ))}
      </div>
    </AppShell>
  );
}
