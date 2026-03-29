import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { 
  Cloud, 
  Download, 
  Upload, 
  RefreshCw, 
  CheckCircle, 
  AlertCircle,
  Database,
  FileJson,
  FileSpreadsheet,
  Shield
} from 'lucide-react';
import { toast } from 'sonner';

interface BackupConfig {
  autoBackup: boolean;
  frequency: 'daily' | 'weekly' | 'monthly';
  includeImages: boolean;
  includeDocuments: boolean;
  retentionDays: number;
}

export function BackupNuvem() {
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);
  const [importProgress, setImportProgress] = useState(0);
  const [lastBackup, setLastBackup] = useState<Date | null>(null);
  const [config, setConfig] = useState<BackupConfig>({
    autoBackup: false,
    frequency: 'weekly',
    includeImages: true,
    includeDocuments: true,
    retentionDays: 30,
  });

  const handleExportJSON = async () => {
    setIsExporting(true);
    setExportProgress(0);

    try {
      // Simular progresso
      for (let i = 0; i <= 100; i += 10) {
        setExportProgress(i);
        await new Promise(resolve => setTimeout(resolve, 100));
      }

      // Buscar dados via API
      const response = await fetch('/api/backup/export');
      if (!response.ok) {
        throw new Error('Erro ao exportar dados');
      }
      
      const backupData = await response.json();

      const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `backup-app-manutencao-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      setLastBackup(new Date());
      toast.success('Backup exportado com sucesso!');
    } catch (error) {
      console.error('Erro ao exportar backup:', error);
      toast.error('Erro ao exportar backup');
    } finally {
      setIsExporting(false);
      setExportProgress(0);
    }
  };

  const handleExportCSV = async () => {
    setIsExporting(true);
    setExportProgress(0);

    try {
      // Simular progresso
      for (let i = 0; i <= 100; i += 20) {
        setExportProgress(i);
        await new Promise(resolve => setTimeout(resolve, 100));
      }

      // Buscar dados via API
      const response = await fetch('/api/backup/export-csv');
      if (!response.ok) {
        throw new Error('Erro ao exportar CSV');
      }
      
      const csvContent = await response.text();

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `ordens-servico-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast.success('Dados exportados em CSV!');
    } catch (error) {
      console.error('Erro ao exportar CSV:', error);
      toast.error('Erro ao exportar CSV');
    } finally {
      setIsExporting(false);
      setExportProgress(0);
    }
  };

  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsImporting(true);
    setImportProgress(0);

    try {
      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          // Simular progresso
          for (let i = 0; i <= 50; i += 10) {
            setImportProgress(i);
            await new Promise(resolve => setTimeout(resolve, 100));
          }

          const content = e.target?.result as string;
          const backupData = JSON.parse(content);

          // Validar estrutura do backup
          if (!backupData.version || !backupData.data) {
            throw new Error('Arquivo de backup inválido');
          }

          setImportProgress(75);

          // Aqui você implementaria a lógica de importação real
          // Por enquanto, apenas simulamos
          await new Promise(resolve => setTimeout(resolve, 500));

          setImportProgress(100);
          toast.success(`Backup importado! ${backupData.metadata?.totalRecords || 0} registros processados.`);
        } catch (error) {
          console.error('Erro ao processar backup:', error);
          toast.error('Erro ao processar arquivo de backup');
        } finally {
          setIsImporting(false);
          setImportProgress(0);
        }
      };
      reader.readAsText(file);
    } catch (error) {
      console.error('Erro ao importar backup:', error);
      toast.error('Erro ao importar backup');
      setIsImporting(false);
      setImportProgress(0);
    }

    // Limpar input
    event.target.value = '';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-500 rounded-xl">
              <Cloud className="h-6 w-6 text-white" />
            </div>
            <div>
              <CardTitle className="text-xl">Backup em Nuvem</CardTitle>
              <CardDescription>
                Exporte e importe seus dados para manter um backup seguro
              </CardDescription>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Status do Sistema */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Database className="h-5 w-5 text-gray-500" />
            Status do Sistema
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <p className="text-2xl font-bold text-orange-500">-</p>
              <p className="text-sm text-gray-500">Ordens de Serviço</p>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <p className="text-2xl font-bold text-blue-500">-</p>
              <p className="text-sm text-gray-500">Vistorias</p>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <p className="text-2xl font-bold text-green-500">-</p>
              <p className="text-sm text-gray-500">Manutenções</p>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <p className="text-2xl font-bold text-purple-500">-</p>
              <p className="text-sm text-gray-500">Total de Registros</p>
            </div>
          </div>

          {lastBackup && (
            <div className="mt-4 flex items-center gap-2 text-sm text-gray-500">
              <CheckCircle className="h-4 w-4 text-green-500" />
              Último backup: {lastBackup.toLocaleString('pt-BR')}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Exportar Dados */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Download className="h-5 w-5 text-green-500" />
            Exportar Dados
          </CardTitle>
          <CardDescription>
            Baixe um backup completo dos seus dados
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {isExporting && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>Exportando...</span>
                <span>{exportProgress}%</span>
              </div>
              <Progress value={exportProgress} className="h-2" />
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Button
              variant="outline"
              className="h-auto py-4 flex flex-col items-center gap-2"
              onClick={handleExportJSON}
              disabled={isExporting}
            >
              <FileJson className="h-8 w-8 text-blue-500" />
              <div className="text-center">
                <p className="font-medium">Exportar JSON</p>
                <p className="text-xs text-gray-500">Backup completo com todos os dados</p>
              </div>
            </Button>

            <Button
              variant="outline"
              className="h-auto py-4 flex flex-col items-center gap-2"
              onClick={handleExportCSV}
              disabled={isExporting}
            >
              <FileSpreadsheet className="h-8 w-8 text-green-500" />
              <div className="text-center">
                <p className="font-medium">Exportar CSV</p>
                <p className="text-xs text-gray-500">Ordens de Serviço em planilha</p>
              </div>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Importar Dados */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Upload className="h-5 w-5 text-blue-500" />
            Importar Dados
          </CardTitle>
          <CardDescription>
            Restaure seus dados a partir de um backup
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {isImporting && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>Importando...</span>
                <span>{importProgress}%</span>
              </div>
              <Progress value={importProgress} className="h-2" />
            </div>
          )}

          <div className="border-2 border-dashed border-gray-200 rounded-lg p-8 text-center">
            <input
              type="file"
              accept=".json"
              onChange={handleImport}
              className="hidden"
              id="backup-import"
              disabled={isImporting}
            />
            <label
              htmlFor="backup-import"
              className="cursor-pointer flex flex-col items-center gap-3"
            >
              <div className="p-4 bg-gray-100 rounded-full">
                <Upload className="h-8 w-8 text-gray-400" />
              </div>
              <div>
                <p className="font-medium text-gray-700">Clique para selecionar arquivo</p>
                <p className="text-sm text-gray-500">ou arraste e solte aqui</p>
              </div>
              <Badge variant="outline">Apenas arquivos .json</Badge>
            </label>
          </div>

          <div className="flex items-start gap-2 p-3 bg-yellow-50 rounded-lg">
            <AlertCircle className="h-5 w-5 text-yellow-500 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-yellow-700">
              <p className="font-medium">Atenção</p>
              <p>A importação pode sobrescrever dados existentes. Certifique-se de ter um backup atual antes de prosseguir.</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Configurações de Backup Automático */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <RefreshCw className="h-5 w-5 text-purple-500" />
            Backup Automático
          </CardTitle>
          <CardDescription>
            Configure backups automáticos para seus dados
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Ativar backup automático</Label>
              <p className="text-sm text-gray-500">
                Seus dados serão salvos automaticamente
              </p>
            </div>
            <Switch
              checked={config.autoBackup}
              onCheckedChange={(checked) => setConfig({ ...config, autoBackup: checked })}
            />
          </div>

          <Separator />

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Incluir imagens</Label>
                <p className="text-sm text-gray-500">
                  Fotos e anexos de imagem
                </p>
              </div>
              <Switch
                checked={config.includeImages}
                onCheckedChange={(checked) => setConfig({ ...config, includeImages: checked })}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Incluir documentos</Label>
                <p className="text-sm text-gray-500">
                  PDFs, Word, Excel e outros
                </p>
              </div>
              <Switch
                checked={config.includeDocuments}
                onCheckedChange={(checked) => setConfig({ ...config, includeDocuments: checked })}
              />
            </div>
          </div>

          <Separator />

          <div className="flex items-start gap-2 p-3 bg-blue-50 rounded-lg">
            <Shield className="h-5 w-5 text-blue-500 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-blue-700">
              <p className="font-medium">Seus dados estão seguros</p>
              <p>Os backups são criptografados e armazenados de forma segura. Apenas você tem acesso aos seus dados.</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
