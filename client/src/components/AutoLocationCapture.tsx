import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { MapPin, Loader2, CheckCircle, AlertCircle, RefreshCw, ChevronDown, ChevronUp } from "lucide-react";

interface LocationData {
  latitude: string;
  longitude: string;
  endereco: string;
  accuracy?: number;
}

interface AutoLocationCaptureProps {
  onLocationCapture: (location: LocationData) => void;
  autoCapture?: boolean;
  showStatus?: boolean;
  className?: string;
}

export function AutoLocationCapture({
  onLocationCapture,
  autoCapture = true,
  showStatus = true,
  className = "",
}: AutoLocationCaptureProps) {
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [locationData, setLocationData] = useState<LocationData | null>(null);
  const [expanded, setExpanded] = useState(false);

  const captureLocation = useCallback(async () => {
    if (!navigator.geolocation) {
      setStatus("error");
      setErrorMessage("Geolocalização não suportada neste navegador");
      return;
    }

    setStatus("loading");
    setErrorMessage("");
    setExpanded(true);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude, accuracy } = position.coords;
        
        // Tentar obter endereço via reverse geocoding
        let endereco = `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;
        
        try {
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`,
            {
              headers: {
                'Accept-Language': 'pt-BR',
              }
            }
          );
          
          if (response.ok) {
            const data = await response.json();
            if (data.display_name) {
              endereco = data.display_name;
            }
          }
        } catch (e) {
          console.log("Não foi possível obter endereço, usando coordenadas");
        }

        const location: LocationData = {
          latitude: latitude.toFixed(8),
          longitude: longitude.toFixed(8),
          endereco,
          accuracy,
        };

        setLocationData(location);
        setStatus("success");
        onLocationCapture(location);
      },
      (error) => {
        setStatus("error");
        switch (error.code) {
          case error.PERMISSION_DENIED:
            setErrorMessage("Permissão de localização negada. Por favor, permita o acesso à localização.");
            break;
          case error.POSITION_UNAVAILABLE:
            setErrorMessage("Localização indisponível. Verifique se o GPS está ativado.");
            break;
          case error.TIMEOUT:
            setErrorMessage("Tempo esgotado ao obter localização. Tente novamente.");
            break;
          default:
            setErrorMessage("Erro ao obter localização.");
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 0,
      }
    );
  }, [onLocationCapture]);

  // Captura automática ao montar o componente
  useEffect(() => {
    if (autoCapture && status === "idle") {
      captureLocation();
    }
  }, [autoCapture, status, captureLocation]);

  if (!showStatus) {
    return null;
  }

  // Ícone e cor do status para o header colapsado
  const statusIcon = {
    idle: <MapPin className="h-4 w-4 text-gray-400" />,
    loading: <Loader2 className="h-4 w-4 animate-spin text-blue-500" />,
    success: <CheckCircle className="h-4 w-4 text-green-500" />,
    error: <AlertCircle className="h-4 w-4 text-red-500" />,
  };

  const statusLabel = {
    idle: "Capturar Localização",
    loading: "Capturando...",
    success: "Localização capturada",
    error: "Erro na localização",
  };

  const headerBg = {
    idle: "from-slate-50 to-slate-100",
    loading: "from-blue-50 to-indigo-50",
    success: "from-green-50 to-emerald-50",
    error: "from-red-50 to-orange-50",
  };

  return (
    <div className={`w-full max-w-full overflow-hidden ${className}`}>
      {/* Header colapsável */}
      <button
        type="button"
        onClick={() => {
          if (status === "idle") {
            captureLocation();
          } else {
            setExpanded(!expanded);
          }
        }}
        className={`w-full flex items-center justify-between p-3 rounded-lg border bg-gradient-to-r ${headerBg[status]} hover:opacity-90 transition-all`}
      >
        <div className="flex items-center gap-2">
          <div className={`p-1.5 rounded-lg ${status === "success" ? "bg-green-100" : status === "error" ? "bg-red-100" : "bg-blue-100"}`}>
            {statusIcon[status]}
          </div>
          <div className="text-left">
            <span className={`text-sm font-medium ${status === "success" ? "text-green-900" : status === "error" ? "text-red-900" : "text-slate-900"}`}>
              {statusLabel[status]}
            </span>
            {status === "success" && !expanded && locationData && (
              <span className="ml-2 text-[10px] text-green-600">
                ({locationData.latitude}, {locationData.longitude})
              </span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          {(status === "error" || status === "success") && (
            <span
              onClick={(e) => { e.stopPropagation(); captureLocation(); }}
              className="p-1 hover:bg-white/50 rounded transition-colors"
            >
              <RefreshCw className="h-3.5 w-3.5 text-muted-foreground" />
            </span>
          )}
          {status !== "idle" && (
            expanded ? (
              <ChevronUp className="w-4 h-4 text-muted-foreground" />
            ) : (
              <ChevronDown className="w-4 h-4 text-muted-foreground" />
            )
          )}
        </div>
      </button>

      {/* Conteúdo expandido */}
      {expanded && (
        <div className="mt-2 w-full max-w-full overflow-hidden">
          {status === "loading" && (
            <div className="p-3 rounded-lg border bg-blue-50/50 text-center">
              <Loader2 className="h-5 w-5 animate-spin text-blue-500 mx-auto mb-1" />
              <span className="text-xs text-muted-foreground">Obtendo localização GPS...</span>
            </div>
          )}
          
          {status === "error" && (
            <div className="p-3 rounded-lg border border-red-200 bg-red-50">
              <p className="text-xs text-red-600">{errorMessage}</p>
            </div>
          )}

          {status === "success" && locationData && (
            <div className="rounded-lg border text-xs text-muted-foreground p-3 space-y-1.5">
              <div className="flex items-center gap-1">
                <span className="font-medium">Coordenadas:</span>
                <span>{locationData.latitude}, {locationData.longitude}</span>
              </div>
              {locationData.accuracy && (
                <div className="flex items-center gap-1">
                  <span className="font-medium">Precisão:</span>
                  <span>±{Math.round(locationData.accuracy)}m</span>
                </div>
              )}
              <div className="flex items-start gap-1">
                <span className="font-medium shrink-0">Endereço:</span>
                <span className="line-clamp-2">{locationData.endereco}</span>
              </div>
              <a
                href={`https://www.google.com/maps?q=${locationData.latitude},${locationData.longitude}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-blue-500 hover:underline flex items-center gap-1 pt-1"
              >
                <MapPin className="h-3 w-3" />
                Ver no Google Maps
              </a>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default AutoLocationCapture;
