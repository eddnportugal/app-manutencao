import ModulePage from '@/components/layout/ModulePage';
import { FileText, Download, Loader2, Calendar, BarChart3, ClipboardCheck, Wrench, FileSpreadsheet, X } from 'lucide-react';
import { useState } from 'react';
import { trpc } from '@/lib/trpc';
import { useCondominioAtivo } from '@/hooks/useCondominioAtivo';

const TEMPLATES = [
  { id: 'recibo', name: 'Recibo', icon: '🧾', description: 'Recibos de pagamento e serviço' },
  { id: 'contrato', name: 'Contrato', icon: '📄', description: 'Contratos de prestação de serviço' },
  { id: 'os', name: 'Ordem de Serviço', icon: '🔧', description: 'OS detalhada para execução' },
  { id: 'orcamento', name: 'Orçamento', icon: '💰', description: 'Orçamentos e propostas' },
  { id: 'etiqueta', name: 'Etiqueta de Manutenção', icon: '🏷️', description: 'Etiquetas para equipamentos' },
];

const SECOES_RELATORIO = [
  { key: 'manutencoes', label: 'Manutenções', icon: Wrench },
  { key: 'vistorias', label: 'Vistorias', icon: ClipboardCheck },
  { key: 'ocorrencias', label: 'Ocorrências', icon: FileText },
  { key: 'checklists', label: 'Checklists', icon: ClipboardCheck },
  { key: 'eventos', label: 'Eventos', icon: Calendar },
  { key: 'antesDepois', label: 'Antes/Depois', icon: BarChart3 },
] as const;

export default function DocumentosPage() {
  const [showRelatorio, setShowRelatorio] = useState(false);
  const { condominioAtivo } = useCondominioAtivo();

  return (
    <ModulePage title="Documentos">
      <div className="px-4 mt-2">
        <p className="text-sm text-muted-foreground mb-4">Escolha um template para gerar</p>

        <div className="grid grid-cols-2 gap-3">
          {TEMPLATES.map((t) => (
            <button
              key={t.id}
              className="flex flex-col items-center gap-2 p-5 rounded-2xl bg-card border border-border hover:shadow-md hover:-translate-y-0.5 transition-all text-center"
            >
              <span className="text-3xl">{t.icon}</span>
              <span className="text-sm font-semibold">{t.name}</span>
              <span className="text-[10px] text-muted-foreground leading-tight">{t.description}</span>
            </button>
          ))}
          <button
            onClick={() => setShowRelatorio(true)}
            className="flex flex-col items-center gap-2 p-5 rounded-2xl bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-500/10 dark:to-purple-500/10 border border-indigo-200 dark:border-indigo-500/20 hover:shadow-md hover:-translate-y-0.5 transition-all text-center"
          >
            <FileSpreadsheet className="w-8 h-8 text-indigo-500" />
            <span className="text-sm font-semibold text-indigo-700 dark:text-indigo-400">Relatório Consolidado</span>
            <span className="text-[10px] text-indigo-500/80">PDF com gráficos e estatísticas</span>
          </button>
        </div>

        {/* CSV Export section */}
        <div className="mt-6">
          <h3 className="text-sm font-semibold mb-3">Exportar Dados (CSV)</h3>
          <div className="space-y-2">
            {[
              { label: 'Manutenções', key: 'manutencoes' },
              { label: 'Vistorias', key: 'vistorias' },
              { label: 'Vencimentos', key: 'vencimentos' },
              { label: 'Funcionários', key: 'funcionarios' },
            ].map((item) => (
              <button
                key={item.key}
                className="flex items-center gap-3 w-full p-3 rounded-xl bg-card border hover:bg-muted/50 transition-colors"
              >
                <Download className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm font-medium">{item.label}</span>
                <span className="ml-auto text-[10px] text-muted-foreground">.csv</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Relatório Consolidado Modal */}
      {showRelatorio && condominioAtivo && (
        <RelatorioModal condominioId={condominioAtivo.id} onClose={() => setShowRelatorio(false)} />
      )}
    </ModulePage>
  );
}

function RelatorioModal({ condominioId, onClose }: { condominioId: number; onClose: () => void }) {
  const [secoes, setSecoes] = useState<string[]>(['manutencoes', 'vistorias']);
  const [dataInicio, setDataInicio] = useState(() => {
    const d = new Date();
    d.setMonth(d.getMonth() - 1);
    return d.toISOString().slice(0, 10);
  });
  const [dataFim, setDataFim] = useState(() => new Date().toISOString().slice(0, 10));
  const [generating, setGenerating] = useState(false);

  const gerarMut = trpc.relatorioConsolidado.gerar.useMutation();

  const toggleSecao = (key: string) => {
    setSecoes((prev) => (prev.includes(key) ? prev.filter((s) => s !== key) : [...prev, key]));
  };

  const handleGerar = async () => {
    setGenerating(true);
    try {
      const result = await gerarMut.mutateAsync({
        condominioId,
        secoes,
        dataInicio,
        dataFim,
        incluirGraficos: true,
        incluirEstatisticas: true,
      });
      // If result contains a PDF blob/base64, trigger download
      if ((result as any)?.pdf) {
        const blob = new Blob(
          [Uint8Array.from(atob((result as any).pdf), (c) => c.charCodeAt(0))],
          { type: 'application/pdf' },
        );
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `relatorio-${dataInicio}-${dataFim}.pdf`;
        a.click();
        URL.revokeObjectURL(url);
      }
      onClose();
    } catch (err) {
      console.error('Erro ao gerar relatório:', err);
    } finally {
      setGenerating(false);
    }
  };

  const inputCls = 'w-full px-4 py-3 rounded-xl bg-muted/50 border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/30';

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="w-full max-w-lg bg-background rounded-t-3xl sm:rounded-3xl shadow-2xl max-h-[85vh] flex flex-col animate-in slide-in-from-bottom duration-300">
        <div className="flex items-center justify-between p-5 border-b">
          <h2 className="text-lg font-bold">Relatório Consolidado</h2>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-muted"><X className="w-5 h-5" /></button>
        </div>
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Data início</label>
              <input type="date" className={inputCls} value={dataInicio} onChange={(e) => setDataInicio(e.target.value)} />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Data fim</label>
              <input type="date" className={inputCls} value={dataFim} onChange={(e) => setDataFim(e.target.value)} />
            </div>
          </div>

          <div>
            <label className="text-xs font-medium text-muted-foreground mb-2 block">Seções do relatório</label>
            <div className="space-y-2">
              {SECOES_RELATORIO.map((s) => {
                const Icon = s.icon;
                const active = secoes.includes(s.key);
                return (
                  <label
                    key={s.key}
                    className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-colors ${
                      active ? 'border-primary bg-primary/5' : 'border-border hover:bg-muted/50'
                    }`}
                  >
                    <Icon className={`w-4 h-4 ${active ? 'text-primary' : 'text-muted-foreground'}`} />
                    <span className="flex-1 text-sm font-medium">{s.label}</span>
                    <input
                      type="checkbox"
                      checked={active}
                      onChange={() => toggleSecao(s.key)}
                      className="w-5 h-5 rounded accent-primary"
                    />
                  </label>
                );
              })}
            </div>
          </div>
        </div>
        <div className="p-5 border-t">
          <button
            onClick={handleGerar}
            disabled={generating || secoes.length === 0}
            className="w-full py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl font-medium text-sm hover:shadow-lg disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {generating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
            {generating ? 'Gerando...' : 'Gerar PDF'}
          </button>
        </div>
      </div>
    </div>
  );
}
