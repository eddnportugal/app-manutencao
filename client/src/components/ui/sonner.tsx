import { useEffect, useState, useCallback, useRef } from "react";
import { createPortal } from "react-dom";
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from "lucide-react";

type ToastType = "success" | "error" | "info" | "warning" | "default" | "custom";

interface ToastItem {
  id: string;
  message?: string;
  description?: string;
  component?: React.ReactNode;
  type: ToastType;
  duration: number;
}

// Store global para toasts
let toastListeners: Array<(toasts: ToastItem[]) => void> = [];
let toastItems: ToastItem[] = [];
let toastId = 0;

const addToast = (message: string | undefined, type: ToastType = "default", duration = 4000, description?: string, component?: React.ReactNode) => {
  const id = `toast-${++toastId}`;
  const newToast: ToastItem = { id, message, type, duration, description, component };
  toastItems = [...toastItems, newToast];
  toastListeners.forEach(listener => listener(toastItems));
  
  if (duration > 0) {
    setTimeout(() => {
      removeToast(id);
    }, duration);
  }
  
  return id;
};

const removeToast = (id: string) => {
  toastItems = toastItems.filter(t => t.id !== id);
  toastListeners.forEach(listener => listener(toastItems));
};

// Toast API compatível com sonner
const toast = Object.assign(
  (message: string, options?: { duration?: number; description?: string }) => 
    addToast(message, "default", options?.duration ?? 4000, options?.description),
  {
    success: (message: string, options?: { duration?: number; description?: string }) => 
      addToast(message, "success", options?.duration ?? 4000, options?.description),
    error: (message: string, options?: { duration?: number; description?: string }) => 
      addToast(message, "error", options?.duration ?? 4000, options?.description),
    info: (message: string, options?: { duration?: number; description?: string }) => 
      addToast(message, "info", options?.duration ?? 4000, options?.description),
    warning: (message: string, options?: { duration?: number; description?: string }) => 
      addToast(message, "warning", options?.duration ?? 4000, options?.description),
    loading: (message: string, options?: { duration?: number; description?: string }) => 
      addToast(message, "info", 0, options?.description),
    custom: (renderer: (id: string | number) => React.ReactNode, options?: { duration?: number; position?: string }) => {
       // We generate ID first to pass to renderer
       const id = `toast-${++toastId}`;
       // We fake the create process by manually constructing the item
       // because addToast increments ID again.
       // Let's modify logic to just use addToast but with a known ID or handle component.
       // Simpler: Just render the component. The renderer returns a node.
       // We pass the FUTURE id to the renderer. 
       const component = renderer(id);
       
       const newToast: ToastItem = { id, type: "custom", duration: options?.duration ?? 4000, component };
       toastItems = [...toastItems, newToast];
       toastListeners.forEach(listener => listener(toastItems));

       if ((options?.duration ?? 4000) > 0) {
         setTimeout(() => {
           removeToast(id);
         }, options?.duration ?? 4000);
       }
       return id;
    },
    dismiss: (id?: string | number | { id?: string | number }) => {
      const toastId = typeof id === 'object' ? id?.id : id;
      if (toastId) {
        removeToast(String(toastId));
      } else {
        toastItems = [];
        toastListeners.forEach(listener => listener(toastItems));
      }
    },
    promise: async <T,>(
      promise: Promise<T>,
      msgs: { loading: string; success: string; error: string }
    ) => {
      const id = addToast(msgs.loading, "info", 0);
      try {
        const result = await promise;
        removeToast(id);
        addToast(msgs.success, "success");
        return result;
      } catch (e) {
        removeToast(id);
        addToast(msgs.error, "error");
        throw e;
      }
    },
  }
);

const ToastIcon = ({ type }: { type: ToastType }) => {
  switch (type) {
    case "success":
      return <CheckCircle className="w-5 h-5 text-green-500" />;
    case "error":
      return <AlertCircle className="w-5 h-5 text-red-500" />;
    case "warning":
      return <AlertTriangle className="w-5 h-5 text-amber-500" />;
    case "info":
      return <Info className="w-5 h-5 text-blue-500" />;
    default:
      return null;
  }
};

const ToastComponent = ({ toast: t, onClose }: { toast: ToastItem; onClose: () => void }) => {
  const [isExiting, setIsExiting] = useState(false);

  const handleClose = useCallback(() => {
    setIsExiting(true);
    setTimeout(onClose, 200);
  }, [onClose]);

  if (t.type === 'custom' && t.component) {
     return (
        <div 
          className={`transform transition-all duration-200 ease-out ${isExiting ? "opacity-0 translate-x-4" : "opacity-100 translate-x-0"}`}
        >
          {t.component}
        </div>
     );
  }

  return (
    <div
      className={`
        flex items-center gap-3 min-w-[300px] max-w-[420px] px-4 py-3
        bg-white dark:bg-slate-800 rounded-lg shadow-lg border border-slate-200 dark:border-slate-700
        transform transition-all duration-200 ease-out
        ${isExiting ? "opacity-0 translate-x-4" : "opacity-100 translate-x-0"}
      `}
    >
      <div className="flex items-start gap-3 w-full">
        <ToastIcon type={t.type} />
        <div className="flex-1 flex flex-col gap-1">
          <p className="text-sm font-medium text-slate-900 dark:text-slate-100">{t.message}</p>
          {t.description && (
            <p className="text-xs text-slate-500 dark:text-slate-400">{t.description}</p>
          )}
        </div>
        <button
          onClick={handleClose}
          className="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded transition-colors -mt-1 -mr-1"
        >
          <X className="w-4 h-4 text-slate-400" />
        </button>
      </div>
    </div>
  );
};

const Toaster = () => {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const [mounted, setMounted] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    // Create a dedicated container for toasts
    const container = document.createElement('div');
    container.setAttribute('data-toast-portal', '');
    container.setAttribute('translate', 'no'); // Prevent Google Translate
    container.classList.add('notranslate'); // Additional translate protection
    document.body.appendChild(container);
    containerRef.current = container;
    setMounted(true);
    
    toastListeners.push(setToasts);
    
    return () => {
      toastListeners = toastListeners.filter(l => l !== setToasts);
      // Delay removal and check parent to avoid React 19 removeChild errors
      requestAnimationFrame(() => {
        try {
          if (container && container.parentNode && document.body.contains(container)) {
            document.body.removeChild(container);
          }
        } catch (e) {
          // Ignore removal errors (can happen with browser extensions)
        }
      });
    };
  }, []);

  if (!mounted || !containerRef.current) return null;

  return createPortal(
    <div className="fixed top-4 right-4 z-[9999] flex flex-col gap-2 pointer-events-none notranslate" translate="no">
      {toasts.map((t) => (
        <div key={t.id} className="pointer-events-auto">
          <ToastComponent toast={t} onClose={() => removeToast(t.id)} />
        </div>
      ))}
    </div>,
    containerRef.current
  );
};

export { Toaster, toast };
