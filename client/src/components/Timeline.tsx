import { Clock, CheckCircle, AlertCircle, MessageSquare, Image, User, RefreshCw, XCircle, FileText, Play } from "lucide-react";

interface TimelineEvent {
  id: number;
  tipo: string;
  descricao: string;
  statusAnterior?: string | null;
  statusNovo?: string | null;
  userNome?: string | null;
  createdAt: Date | string;
}

interface TimelineProps {
  events: TimelineEvent[];
  className?: string;
}

const getEventIcon = (tipo: string) => {
  switch (tipo) {
    case "abertura":
      return <Play className="h-4 w-4" />;
    case "fechamento":
      return <CheckCircle className="h-4 w-4" />;
    case "reabertura":
      return <RefreshCw className="h-4 w-4" />;
    case "status_alterado":
      return <AlertCircle className="h-4 w-4" />;
    case "comentario":
      return <MessageSquare className="h-4 w-4" />;
    case "imagem_adicionada":
      return <Image className="h-4 w-4" />;
    case "responsavel_alterado":
      return <User className="h-4 w-4" />;
    case "item_completo":
      return <CheckCircle className="h-4 w-4" />;
    case "atualizacao":
      return <FileText className="h-4 w-4" />;
    default:
      return <Clock className="h-4 w-4" />;
  }
};

const getEventColor = (tipo: string) => {
  switch (tipo) {
    case "abertura":
      return "bg-blue-500";
    case "fechamento":
      return "bg-green-500";
    case "reabertura":
      return "bg-orange-500";
    case "status_alterado":
      return "bg-yellow-500";
    case "comentario":
      return "bg-purple-500";
    case "imagem_adicionada":
      return "bg-pink-500";
    case "responsavel_alterado":
      return "bg-indigo-500";
    case "item_completo":
      return "bg-emerald-500";
    case "atualizacao":
      return "bg-gray-500";
    default:
      return "bg-gray-400";
  }
};

const formatDate = (date: Date | string) => {
  const d = new Date(date);
  return d.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

export function Timeline({ events, className = "" }: TimelineProps) {
  if (events.length === 0) {
    return (
      <div className={`text-center py-8 text-muted-foreground ${className}`}>
        <Clock className="h-12 w-12 mx-auto mb-2 opacity-50" />
        <p>Nenhum evento registrado</p>
      </div>
    );
  }

  return (
    <div className={`relative ${className}`}>
      {/* Linha vertical */}
      <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-border" />

      <div className="space-y-4">
        {events.map((event, index) => (
          <div key={event.id} className="relative pl-10">
            {/* Ícone do evento */}
            <div
              className={`absolute left-0 w-8 h-8 rounded-full flex items-center justify-center text-white ${getEventColor(
                event.tipo
              )}`}
            >
              {getEventIcon(event.tipo)}
            </div>

            {/* Conteúdo do evento */}
            <div className="bg-card border rounded-lg p-3 shadow-sm">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1">
                  <p className="text-sm font-medium">{event.descricao}</p>
                  {event.statusAnterior && event.statusNovo && (
                    <p className="text-xs text-muted-foreground mt-1">
                      <span className="inline-flex items-center gap-1">
                        <StatusBadge status={event.statusAnterior} size="xs" />
                        <span>→</span>
                        <StatusBadge status={event.statusNovo} size="xs" />
                      </span>
                    </p>
                  )}
                </div>
                <div className="text-right text-xs text-muted-foreground whitespace-nowrap">
                  <p>{formatDate(event.createdAt)}</p>
                  {event.userNome && (
                    <p className="text-xs opacity-75">{event.userNome}</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Componente de badge de status
interface StatusBadgeProps {
  status: string;
  size?: "xs" | "sm" | "md";
}

export function StatusBadge({ status, size = "md" }: StatusBadgeProps) {
  const getStatusConfig = (status: string) => {
    switch (status) {
      case "pendente":
        return { 
          label: "Pendente", 
          bgColor: "bg-gradient-to-r from-amber-400 to-yellow-500 shadow-amber-200"
        };
      case "realizada":
        return { 
          label: "Realizada", 
          bgColor: "bg-gradient-to-r from-emerald-500 to-green-600 shadow-emerald-200"
        };
      case "acao_necessaria":
        return { 
          label: "Ação Necessária", 
          bgColor: "bg-gradient-to-r from-red-500 to-rose-600 shadow-red-200"
        };
      case "finalizada":
        return { 
          label: "Finalizada", 
          bgColor: "bg-gradient-to-r from-blue-500 to-indigo-600 shadow-blue-200"
        };
      case "reaberta":
        return { 
          label: "Reaberta", 
          bgColor: "bg-gradient-to-r from-orange-500 to-amber-600 shadow-orange-200"
        };
      case "rascunho":
        return { 
          label: "Rascunho", 
          bgColor: "bg-gradient-to-r from-gray-400 to-slate-500 shadow-gray-200"
        };
      default:
        return { 
          label: status, 
          bgColor: "bg-gradient-to-r from-gray-500 to-slate-600 shadow-gray-200"
        };
    }
  };

  const config = getStatusConfig(status);
  const sizeClasses = {
    xs: "text-xs px-3 py-1 shadow-sm",
    sm: "text-sm px-4 py-1.5 shadow-sm",
    md: "text-base px-5 py-2 shadow-md",
  };

  return (
    <span
      className={`inline-flex items-center justify-center rounded-full font-semibold text-white whitespace-nowrap ${config.bgColor} ${sizeClasses[size]}`}
    >
      {config.label}
    </span>
  );
}

// Componente de badge de prioridade
interface PriorityBadgeProps {
  priority: string;
  size?: "xs" | "sm" | "md";
}

export function PriorityBadge({ priority, size = "sm" }: PriorityBadgeProps) {
  const getPriorityConfig = (priority: string) => {
    switch (priority) {
      case "baixa":
        return { label: "Baixa", color: "bg-slate-100 text-slate-700 border-slate-300" };
      case "media":
        return { label: "Média", color: "bg-blue-100 text-blue-700 border-blue-300" };
      case "alta":
        return { label: "Alta", color: "bg-orange-100 text-orange-700 border-orange-300" };
      case "urgente":
        return { label: "Urgente", color: "bg-red-100 text-red-700 border-red-300" };
      default:
        return { label: priority, color: "bg-gray-100 text-gray-700 border-gray-300" };
    }
  };

  const config = getPriorityConfig(priority);
  const sizeClasses = {
    xs: "text-[10px] px-1.5 py-0.5",
    sm: "text-xs px-2 py-0.5",
    md: "text-sm px-2.5 py-1",
  };

  return (
    <span
      className={`inline-flex items-center rounded-full border font-medium ${config.color} ${sizeClasses[size]}`}
    >
      {config.label}
    </span>
  );
}
