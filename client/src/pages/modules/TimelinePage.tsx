import { useState } from 'react';
import ModulePage from '@/components/layout/ModulePage';
import { Clock, Wifi, WifiOff, ChevronDown } from 'lucide-react';

type FilterType = 'todas' | 'hoje' | 'semana';

export default function TimelinePage() {
  const [filter, setFilter] = useState<FilterType>('todas');

  return (
    <ModulePage title="Timeline">
      <div className="px-4">
        {/* Filtros */}
        <div className="flex gap-2 mb-4">
          {([
            { key: 'todas', label: 'Todas' },
            { key: 'hoje', label: 'Hoje' },
            { key: 'semana', label: 'Semana' },
          ] as const).map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setFilter(key)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                filter === key
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Online status indicator */}
        <div className="flex items-center gap-2 p-3 rounded-xl bg-green-50 dark:bg-green-500/10 border border-green-200 dark:border-green-500/20 mb-4">
          <Wifi className="w-4 h-4 text-green-500" />
          <span className="text-xs text-green-600 dark:text-green-400 font-medium">Tempo real ativo</span>
          <div className="ml-auto flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <span className="text-xs text-green-500">Online</span>
          </div>
        </div>

        {/* Empty state */}
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="w-16 h-16 rounded-2xl bg-indigo-100 dark:bg-indigo-500/15 flex items-center justify-center mb-4">
            <Clock className="w-7 h-7 text-indigo-500" />
          </div>
          <h3 className="font-semibold text-lg mb-1">Nenhuma atividade</h3>
          <p className="text-sm text-muted-foreground">
            As atividades da equipe aparecerão aqui em tempo real
          </p>
        </div>
      </div>
    </ModulePage>
  );
}
