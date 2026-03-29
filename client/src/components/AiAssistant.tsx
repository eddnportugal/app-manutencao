import { useState, useRef, useEffect, useCallback } from 'react';
import { Mic, MicOff, Send, X, Loader2, Check, ChevronRight } from 'lucide-react';

interface AiAssistantProps {
  open: boolean;
  onClose: () => void;
  onCreateOS: (data: OSData) => void;
}

export interface OSData {
  titulo: string;
  descricao: string;
  prioridade: string;
  status: string;
}

type Step = 'listening' | 'processing' | 'confirm';

interface SpeechRecognitionInstance extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start(): void;
  stop(): void;
  onresult: ((ev: any) => void) | null;
  onerror: ((ev: any) => void) | null;
  onend: (() => void) | null;
}

function getSpeechRecognition(): (new () => SpeechRecognitionInstance) | null {
  const w = window as any;
  return w.SpeechRecognition || w.webkitSpeechRecognition || null;
}

export default function AiAssistant({ open, onClose, onCreateOS }: AiAssistantProps) {
  const [step, setStep] = useState<Step>('listening');
  const [transcript, setTranscript] = useState('');
  const [textInput, setTextInput] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [parsed, setParsed] = useState<OSData | null>(null);
  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);

  // Parse free-form text into OS fields using simple heuristics
  const parseInput = useCallback((text: string): OSData => {
    const lower = text.toLowerCase();

    // Detect priority
    let prioridade = 'media';
    if (lower.includes('urgente') || lower.includes('emergência') || lower.includes('emergencia')) prioridade = 'urgente';
    else if (lower.includes('alta') || lower.includes('importante')) prioridade = 'alta';
    else if (lower.includes('baixa') || lower.includes('simples')) prioridade = 'baixa';

    // Build a clean title (first sentence or first 80 chars)
    const sentences = text.split(/[.!?\n]+/).filter(Boolean);
    const titulo = (sentences[0] || text).trim().slice(0, 100);

    return {
      titulo,
      descricao: text.trim(),
      prioridade,
      status: 'aberto',
    };
  }, []);

  const startListening = useCallback(() => {
    const SpeechRecognition = getSpeechRecognition();
    if (!SpeechRecognition) return;

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = 'pt-BR';

    recognition.onresult = (event: any) => {
      let final = '';
      for (let i = 0; i < event.results.length; i++) {
        final += event.results[i][0].transcript;
      }
      setTranscript(final);
    };

    recognition.onerror = () => {
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current = recognition;
    recognition.start();
    setIsListening(true);
  }, []);

  const stopListening = useCallback(() => {
    recognitionRef.current?.stop();
    setIsListening(false);
  }, []);

  // Process input (voice or text)
  const handleProcess = useCallback(() => {
    const input = transcript || textInput;
    if (!input.trim()) return;

    setStep('processing');

    // Simulate brief processing
    setTimeout(() => {
      const data = parseInput(input);
      setParsed(data);
      setStep('confirm');
    }, 800);
  }, [transcript, textInput, parseInput]);

  // Confirm and create OS
  const handleConfirm = useCallback(() => {
    if (parsed) {
      onCreateOS(parsed);
      handleReset();
    }
  }, [parsed, onCreateOS]);

  const handleReset = () => {
    setStep('listening');
    setTranscript('');
    setTextInput('');
    setParsed(null);
    setIsListening(false);
  };

  useEffect(() => {
    if (!open) handleReset();
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

      {/* Panel */}
      <div className="relative w-full max-w-lg bg-card rounded-t-3xl shadow-2xl p-6 animate-in slide-in-from-bottom duration-300 safe-area-bottom">
        {/* Close */}
        <button onClick={onClose} className="absolute top-4 right-4 p-2 rounded-xl hover:bg-muted">
          <X className="w-5 h-5 text-muted-foreground" />
        </button>

        <h2 className="font-bold text-lg mb-1">Assistente IA</h2>
        <p className="text-xs text-muted-foreground mb-6">
          {step === 'listening' && 'Fale ou digite o que precisa'}
          {step === 'processing' && 'Processando...'}
          {step === 'confirm' && 'Confirme os dados da OS'}
        </p>

        {/* Step: Listening */}
        {step === 'listening' && (
          <div className="space-y-4">
            {/* Voice */}
            <div className="flex justify-center">
              <button
                onMouseDown={startListening}
                onMouseUp={() => { stopListening(); }}
                onTouchStart={startListening}
                onTouchEnd={() => { stopListening(); }}
                className={`w-20 h-20 rounded-full flex items-center justify-center transition-all ${
                  isListening
                    ? 'bg-red-500 scale-110 shadow-lg shadow-red-500/30'
                    : 'bg-gradient-to-r from-orange-500 to-orange-600 hover:scale-105'
                }`}
              >
                {isListening ? (
                  <MicOff className="w-8 h-8 text-white" />
                ) : (
                  <Mic className="w-8 h-8 text-white" />
                )}
              </button>
            </div>

            {isListening && (
              <div className="text-center">
                <div className="flex justify-center gap-1 mb-2">
                  {[0, 1, 2, 3, 4].map((i) => (
                    <div
                      key={i}
                      className="w-1 bg-orange-500 rounded-full animate-pulse"
                      style={{
                        height: `${12 + Math.random() * 20}px`,
                        animationDelay: `${i * 100}ms`,
                      }}
                    />
                  ))}
                </div>
                <p className="text-xs text-muted-foreground">Ouvindo...</p>
              </div>
            )}

            {transcript && (
              <div className="p-3 rounded-xl bg-muted text-sm">
                <p className="text-xs text-muted-foreground mb-1">Você disse:</p>
                {transcript}
              </div>
            )}

            {/* Text input */}
            <div className="relative">
              <input
                type="text"
                value={textInput}
                onChange={(e) => setTextInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleProcess()}
                placeholder="Ou digite aqui..."
                className="w-full px-4 py-3 pr-12 rounded-xl bg-muted border-0 text-sm focus:ring-2 focus:ring-primary/30 outline-none"
              />
              <button
                onClick={handleProcess}
                disabled={!transcript && !textInput}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-lg bg-orange-500 text-white disabled:opacity-30"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Step: Processing */}
        {step === 'processing' && (
          <div className="flex flex-col items-center py-8">
            <Loader2 className="w-10 h-10 animate-spin text-orange-500 mb-4" />
            <p className="text-sm text-muted-foreground">Analisando solicitação...</p>
          </div>
        )}

        {/* Step: Confirm */}
        {step === 'confirm' && parsed && (
          <div className="space-y-4">
            <div className="space-y-3">
              <div>
                <label className="text-[10px] text-muted-foreground uppercase tracking-wider">Título</label>
                <input
                  type="text"
                  value={parsed.titulo}
                  onChange={(e) => setParsed({ ...parsed, titulo: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-muted border-0 text-sm mt-1 focus:ring-2 focus:ring-primary/30 outline-none"
                />
              </div>
              <div>
                <label className="text-[10px] text-muted-foreground uppercase tracking-wider">Descrição</label>
                <textarea
                  value={parsed.descricao}
                  onChange={(e) => setParsed({ ...parsed, descricao: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 rounded-xl bg-muted border-0 text-sm mt-1 focus:ring-2 focus:ring-primary/30 outline-none resize-none"
                />
              </div>
              <div className="flex gap-3">
                <div className="flex-1">
                  <label className="text-[10px] text-muted-foreground uppercase tracking-wider">Prioridade</label>
                  <select
                    value={parsed.prioridade}
                    onChange={(e) => setParsed({ ...parsed, prioridade: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-muted border-0 text-sm mt-1 focus:ring-2 focus:ring-primary/30 outline-none"
                  >
                    <option value="baixa">Baixa</option>
                    <option value="media">Média</option>
                    <option value="alta">Alta</option>
                    <option value="urgente">Urgente</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleReset}
                className="flex-1 py-3 rounded-xl border text-sm font-medium text-muted-foreground hover:bg-muted"
              >
                Refazer
              </button>
              <button
                onClick={handleConfirm}
                className="flex-1 py-3 rounded-xl bg-gradient-to-r from-orange-500 to-orange-600 text-white text-sm font-medium flex items-center justify-center gap-2 hover:shadow-lg transition-shadow"
              >
                <Check className="w-4 h-4" />
                Criar OS
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
