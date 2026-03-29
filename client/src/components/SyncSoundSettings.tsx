/**
 * Componente de Configuração de Sons de Sincronização
 */

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Volume2, VolumeX, Bell, Wifi, WifiOff, RefreshCw, CheckCircle, XCircle } from 'lucide-react';
import SyncSounds from '@/lib/notificationSounds';

export function SyncSoundSettings() {
  const [soundsEnabled, setSoundsEnabled] = useState(SyncSounds.isEnabled());

  useEffect(() => {
    setSoundsEnabled(SyncSounds.isEnabled());
  }, []);

  const handleToggleSounds = (enabled: boolean) => {
    SyncSounds.setEnabled(enabled);
    setSoundsEnabled(enabled);
    
    // Tocar som de teste se habilitado
    if (enabled) {
      SyncSounds.notification();
    }
  };

  const testSound = (soundType: 'success' | 'error' | 'pending' | 'online' | 'offline' | 'notification') => {
    // Temporariamente habilitar sons para teste
    const wasEnabled = SyncSounds.isEnabled();
    SyncSounds.setEnabled(true);
    
    switch (soundType) {
      case 'success':
        SyncSounds.success();
        break;
      case 'error':
        SyncSounds.error();
        break;
      case 'pending':
        SyncSounds.pending();
        break;
      case 'online':
        SyncSounds.online();
        break;
      case 'offline':
        SyncSounds.offline();
        break;
      case 'notification':
        SyncSounds.notification();
        break;
    }
    
    // Restaurar estado anterior
    SyncSounds.setEnabled(wasEnabled);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {soundsEnabled ? <Volume2 className="h-5 w-5 text-orange-500" /> : <VolumeX className="h-5 w-5 text-gray-400" />}
          Sons de Sincronização
        </CardTitle>
        <CardDescription>
          Configure os alertas sonoros para eventos de sincronização offline
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Toggle Principal */}
        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center gap-3">
            <Bell className="h-5 w-5 text-orange-500" />
            <div>
              <Label htmlFor="sounds-toggle" className="font-medium">Ativar Sons</Label>
              <p className="text-sm text-gray-500">Receba alertas sonoros durante a sincronização</p>
            </div>
          </div>
          <Switch
            id="sounds-toggle"
            checked={soundsEnabled}
            onCheckedChange={handleToggleSounds}
          />
        </div>

        {/* Testar Sons */}
        <div className="space-y-3">
          <Label className="text-sm font-medium text-gray-700">Testar Sons</Label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => testSound('success')}
              className="flex items-center gap-2"
            >
              <CheckCircle className="h-4 w-4 text-green-500" />
              Sucesso
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => testSound('error')}
              className="flex items-center gap-2"
            >
              <XCircle className="h-4 w-4 text-red-500" />
              Erro
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => testSound('pending')}
              className="flex items-center gap-2"
            >
              <RefreshCw className="h-4 w-4 text-yellow-500" />
              Pendente
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => testSound('online')}
              className="flex items-center gap-2"
            >
              <Wifi className="h-4 w-4 text-green-500" />
              Online
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => testSound('offline')}
              className="flex items-center gap-2"
            >
              <WifiOff className="h-4 w-4 text-red-500" />
              Offline
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => testSound('notification')}
              className="flex items-center gap-2"
            >
              <Bell className="h-4 w-4 text-blue-500" />
              Notificação
            </Button>
          </div>
        </div>

        {/* Descrição dos Sons */}
        <div className="text-xs text-gray-500 space-y-1 border-t pt-4">
          <p><strong>Sucesso:</strong> Tocado quando a sincronização é concluída com sucesso</p>
          <p><strong>Erro:</strong> Tocado quando há falha na sincronização</p>
          <p><strong>Pendente:</strong> Tocado quando uma operação é salva offline</p>
          <p><strong>Online:</strong> Tocado quando a conexão é restaurada</p>
          <p><strong>Offline:</strong> Tocado quando a conexão é perdida</p>
        </div>
      </CardContent>
    </Card>
  );
}

export default SyncSoundSettings;
