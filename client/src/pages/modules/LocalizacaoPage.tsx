import ModulePage from '@/components/layout/ModulePage';
import { MapPin } from 'lucide-react';

export default function LocalizacaoPage() {
  return (
    <ModulePage title="Localização">
      <div className="px-4">
        {/* Map placeholder */}
        <div className="w-full aspect-[4/3] rounded-2xl bg-muted border border-border flex flex-col items-center justify-center gap-3">
          <MapPin className="w-10 h-10 text-red-500" />
          <p className="text-sm text-muted-foreground font-medium">
            Mapa em tempo real
          </p>
          <p className="text-xs text-muted-foreground text-center px-8">
            Visualize a localização da sua equipe em tempo real
          </p>
        </div>

        {/* Employee list placeholder */}
        <div className="mt-6">
          <h3 className="font-semibold text-sm mb-3">Equipe Online</h3>
          <div className="flex flex-col items-center py-8 text-center">
            <p className="text-sm text-muted-foreground">Nenhum funcionário online</p>
          </div>
        </div>
      </div>
    </ModulePage>
  );
}
