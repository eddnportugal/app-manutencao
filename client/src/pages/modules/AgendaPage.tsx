import ModulePage from '@/components/layout/ModulePage';
import { CalendarDays, ChevronLeft, ChevronRight, Pencil, MoreVertical, Plus, X, Loader2, Clock, MapPin, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { trpc } from '@/lib/trpc';
import { useCondominioAtivo } from '@/hooks/useCondominioAtivo';
import { useAuth } from '@/contexts/AuthContext';

const WEEKDAYS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
const MONTHS = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
];

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year: number, month: number) {
  return new Date(year, month, 1).getDay();
}

export default function AgendaPage() {
  const today = new Date();
  const { isAdmin, isMaster } = useAuth();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());
  const [showEventModal, setShowEventModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const { condominioAtivo } = useCondominioAtivo();

  // Fetch eventos via tRPC (uses revistaId — we pass condominioId as revistaId since that's the router's API)
  const { data: eventos } = trpc.evento.list.useQuery(
    { revistaId: condominioAtivo?.id ?? 0 },
    { enabled: !!condominioAtivo },
  );

  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month);
  const todayDate = today.getDate();
  const isCurrentMonth = year === today.getFullYear() && month === today.getMonth();

  // Map events to day numbers for dots
  const eventDays = new Set<number>();
  (eventos || []).forEach((e: any) => {
    if (e.dataEvento) {
      const d = new Date(e.dataEvento);
      if (d.getFullYear() === year && d.getMonth() === month) {
        eventDays.add(d.getDate());
      }
    }
  });

  const prevMonth = () => {
    if (month === 0) { setMonth(11); setYear(year - 1); }
    else setMonth(month - 1);
  };

  const nextMonth = () => {
    if (month === 11) { setMonth(0); setYear(year + 1); }
    else setMonth(month + 1);
  };

  const handleDayClick = (day: number) => {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    setSelectedDate(dateStr);
    setShowEventModal(true);
  };

  // Events for selected day
  const dayEvents = selectedDate
    ? (eventos || []).filter((e: any) => {
        if (!e.dataEvento) return false;
        return new Date(e.dataEvento).toISOString().slice(0, 10) === selectedDate;
      })
    : [];

  return (
    <ModulePage title="Agenda">
      <div className="px-4">
        {/* Month navigation */}
        <div className="flex items-center justify-between mb-4">
          <button onClick={prevMonth} className="p-2 rounded-xl hover:bg-muted transition-colors">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <h2 className="text-lg font-bold">
            {MONTHS[month]} {year}
          </h2>
          <button onClick={nextMonth} className="p-2 rounded-xl hover:bg-muted transition-colors">
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        {/* Weekday headers */}
        <div className="grid grid-cols-7 mb-2">
          {WEEKDAYS.map((d) => (
            <div key={d} className="text-center text-[11px] font-semibold text-muted-foreground py-1">
              {d}
            </div>
          ))}
        </div>

        {/* Calendar grid */}
        <div className="grid grid-cols-7 gap-1">
          {Array.from({ length: firstDay }).map((_, i) => (
            <div key={`empty-${i}`} className="aspect-square" />
          ))}

          {Array.from({ length: daysInMonth }).map((_, i) => {
            const day = i + 1;
            const isToday = isCurrentMonth && day === todayDate;
            const hasEvent = eventDays.has(day);

            return (
              <button
                key={day}
                onClick={() => handleDayClick(day)}
                className={`aspect-square rounded-xl flex flex-col items-center justify-center text-sm font-semibold transition-all relative group ${
                  isToday ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'
                }`}
              >
                <span className="text-base">{day}</span>
                {hasEvent && (
                  <div className={`absolute bottom-1 w-1.5 h-1.5 rounded-full ${isToday ? 'bg-primary-foreground' : 'bg-primary'}`} />
                )}
                <div className="absolute top-0.5 right-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                  <MoreVertical className="w-3 h-3 text-muted-foreground" />
                </div>
              </button>
            );
          })}
        </div>

        {/* Upcoming events list */}
        {(eventos || []).length > 0 && (
          <div className="mt-6">
            <h3 className="text-sm font-semibold mb-3">Próximos eventos</h3>
            <div className="space-y-2">
              {(eventos || [])
                .filter((e: any) => e.dataEvento && new Date(e.dataEvento) >= new Date())
                .slice(0, 5)
                .map((e: any) => (
                  <div key={e.id} className="flex items-center gap-3 p-3 rounded-xl bg-card border">
                    <div className="w-10 h-10 rounded-lg bg-amber-100 dark:bg-amber-500/15 flex items-center justify-center">
                      <CalendarDays className="w-5 h-5 text-amber-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-medium truncate">{e.titulo}</h4>
                      <div className="flex items-center gap-2 text-[10px] text-muted-foreground mt-0.5">
                        <span>{new Date(e.dataEvento).toLocaleDateString('pt-BR')}</span>
                        {e.horaInicio && <span className="flex items-center gap-0.5"><Clock className="w-3 h-3" />{e.horaInicio}</span>}
                        {e.local && <span className="flex items-center gap-0.5"><MapPin className="w-3 h-3" />{e.local}</span>}
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* Color legend hint */}
        <div className="mt-6 flex items-center gap-2">
          <Pencil className="w-4 h-4 text-muted-foreground" />
          <span className="text-xs text-muted-foreground">
            Clique em um dia para ver ou criar eventos
          </span>
        </div>

        {/* Add event */}
        {(isAdmin || isMaster) && (
          <button
            onClick={() => { setSelectedDate(new Date().toISOString().slice(0, 10)); setShowEventModal(true); }}
            className="w-full mt-4 mb-6 py-3 bg-gradient-to-r from-amber-500 to-amber-600 text-white rounded-xl font-medium text-sm hover:shadow-lg transition-shadow flex items-center justify-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Novo Evento
          </button>
        )}
      </div>

      {/* Event modal */}
      {showEventModal && condominioAtivo && (
        <EventModal
          condominioId={condominioAtivo.id}
          date={selectedDate}
          dayEvents={dayEvents}
          onClose={() => setShowEventModal(false)}
        />
      )}
    </ModulePage>
  );
}

function EventModal({
  condominioId,
  date,
  dayEvents,
  onClose,
}: {
  condominioId: number;
  date: string | null;
  dayEvents: any[];
  onClose: () => void;
}) {
  const { isAdmin, isMaster } = useAuth();
  const [titulo, setTitulo] = useState('');
  const [descricao, setDescricao] = useState('');
  const [horaInicio, setHoraInicio] = useState('');
  const [horaFim, setHoraFim] = useState('');
  const [local, setLocal] = useState('');
  const [saving, setSaving] = useState(false);

  const createMut = trpc.evento.create.useMutation();
  const deleteMut = trpc.evento.delete.useMutation();
  const utils = trpc.useUtils();

  const handleCreate = async () => {
    if (!titulo.trim()) return;
    setSaving(true);
    try {
      await createMut.mutateAsync({
        revistaId: condominioId,
        titulo: titulo.trim(),
        descricao: descricao.trim() || undefined,
        dataEvento: date ? new Date(date) : undefined,
        horaInicio: horaInicio || undefined,
        horaFim: horaFim || undefined,
        local: local.trim() || undefined,
      });
      utils.evento.list.invalidate();
      onClose();
    } catch (err) {
      console.error('Erro ao criar evento:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    await deleteMut.mutateAsync({ id });
    utils.evento.list.invalidate();
  };

  const inputCls = 'w-full px-4 py-3 rounded-xl bg-muted/50 border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/30';

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="w-full max-w-lg bg-background rounded-t-3xl sm:rounded-3xl shadow-2xl max-h-[85vh] flex flex-col animate-in slide-in-from-bottom duration-300">
        <div className="flex items-center justify-between p-5 border-b">
          <h2 className="text-lg font-bold">
            {date ? new Date(date + 'T12:00:00').toLocaleDateString('pt-BR', { day: 'numeric', month: 'long' }) : 'Evento'}
          </h2>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-muted"><X className="w-5 h-5" /></button>
        </div>
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {/* Existing events for this day */}
          {dayEvents.length > 0 && (
            <div className="space-y-2 pb-4 border-b">
              <p className="text-xs font-medium text-muted-foreground">Eventos neste dia</p>
              {dayEvents.map((e: any) => (
                <div key={e.id} className="flex items-center gap-3 p-3 rounded-xl bg-muted/50">
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-medium">{e.titulo}</h4>
                    {e.horaInicio && <span className="text-[10px] text-muted-foreground">{e.horaInicio} {e.horaFim ? `- ${e.horaFim}` : ''}</span>}
                  </div>
                  {(isAdmin || isMaster) && (
                    <button onClick={() => handleDelete(e.id)} className="p-1.5 rounded-lg hover:bg-red-100 text-muted-foreground hover:text-red-500">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Create new event form */}
          {(isAdmin || isMaster) && (
            <>
              <p className="text-xs font-medium text-muted-foreground">Novo evento</p>
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Título *</label>
                <input className={inputCls} placeholder="Nome do evento" value={titulo} onChange={(e) => setTitulo(e.target.value)} />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Descrição</label>
                <textarea className={inputCls} rows={2} placeholder="Detalhes do evento" value={descricao} onChange={(e) => setDescricao(e.target.value)} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1 block">Hora início</label>
                  <input type="time" className={inputCls} value={horaInicio} onChange={(e) => setHoraInicio(e.target.value)} />
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1 block">Hora fim</label>
                  <input type="time" className={inputCls} value={horaFim} onChange={(e) => setHoraFim(e.target.value)} />
                </div>
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Local</label>
                <input className={inputCls} placeholder="Local do evento" value={local} onChange={(e) => setLocal(e.target.value)} />
              </div>
              <button
                onClick={handleCreate}
                disabled={saving || !titulo.trim()}
                className="w-full py-3 bg-gradient-to-r from-amber-500 to-amber-600 text-white rounded-xl font-medium text-sm hover:shadow-lg disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                {saving ? 'Salvando...' : 'Criar Evento'}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
