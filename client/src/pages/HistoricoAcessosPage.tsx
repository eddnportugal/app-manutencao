import { useState, useRef } from "react";
import { trpc } from "@/lib/trpc";
// DashboardLayout removido - agora renderizado dentro do Dashboard.tsx
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { MapView } from "@/components/Map";
import { 
  History, 
  Search, 
  Filter, 
  ChevronLeft, 
  ChevronRight,
  Monitor,
  Smartphone,
  Tablet,
  CheckCircle,
  XCircle,
  LogIn,
  LogOut,
  Key,
  RefreshCw,
  Users,
  Clock,
  AlertTriangle,
  Calendar,
  MapPin,
  Globe,
  Map
} from "lucide-react";

export default function HistoricoAcessosPage() {
  const [condominioId, setCondominioId] = useState<number | null>(null);
  const [funcionarioId, setFuncionarioId] = useState<number | null>(null);
  const [pagina, setPagina] = useState(1);
  const [busca, setBusca] = useState("");
  const [filtroTipo, setFiltroTipo] = useState<string>("todos");
  const [filtroPeriodo, setFiltroPeriodo] = useState<string>("30");
  const [mostrarMapa, setMostrarMapa] = useState(false);
  const [acessoSelecionado, setAcessoSelecionado] = useState<number | null>(null);
  const limite = 20;
  
  const mapRef = useRef<google.maps.Map | null>(null);
  const markersRef = useRef<google.maps.marker.AdvancedMarkerElement[]>([]);

  // Buscar condomínios do usuário
  const { data: condominios } = trpc.condominio.list.useQuery();
  
  // Selecionar primeira organização automaticamente
  const condominioSelecionado = condominioId || condominios?.[0]?.id;

  // Buscar funcionários da organização
  const { data: funcionariosData } = trpc.funcionario.list.useQuery(
    { condominioId: condominioSelecionado! },
    { enabled: !!condominioSelecionado }
  );

  // Calcular datas de filtro
  const getDataInicio = () => {
    if (filtroPeriodo === "todos") return undefined;
    const dias = parseInt(filtroPeriodo);
    const data = new Date();
    data.setDate(data.getDate() - dias);
    return data;
  };

  // Buscar histórico de acessos
  const { data: historicoData, isLoading } = trpc.funcionario.listarAcessos.useQuery(
    { 
      condominioId: condominioSelecionado,
      funcionarioId: funcionarioId || undefined,
      limite,
      pagina,
      dataInicio: getDataInicio(),
    },
    { enabled: !!condominioSelecionado }
  );

  // Buscar estatísticas
  const { data: estatisticas } = trpc.funcionario.estatisticasAcessos.useQuery(
    { 
      condominioId: condominioSelecionado!,
      dias: parseInt(filtroPeriodo) || 30,
    },
    { enabled: !!condominioSelecionado }
  );

  const acessos = historicoData?.acessos || [];
  const total = historicoData?.total || 0;
  const totalPaginas = Math.ceil(total / limite);

  // Filtrar acessos com geolocalização
  const acessosComGeo = acessos.filter(a => a.latitude && a.longitude);

  // Filtrar por busca e tipo
  const acessosFiltrados = acessos.filter(acesso => {
    const matchBusca = busca === "" || 
      acesso.funcionarioNome?.toLowerCase().includes(busca.toLowerCase()) ||
      acesso.ip?.toLowerCase().includes(busca.toLowerCase()) ||
      acesso.dispositivo?.toLowerCase().includes(busca.toLowerCase()) ||
      acesso.cidade?.toLowerCase().includes(busca.toLowerCase()) ||
      acesso.pais?.toLowerCase().includes(busca.toLowerCase());
    
    const matchTipo = filtroTipo === "todos" || acesso.tipoAcesso === filtroTipo;
    
    return matchBusca && matchTipo;
  });

  const getIconeTipo = (tipo: string | null) => {
    switch (tipo) {
      case "login": return <LogIn className="h-4 w-4" />;
      case "logout": return <LogOut className="h-4 w-4" />;
      case "recuperacao_senha": return <Key className="h-4 w-4" />;
      case "alteracao_senha": return <RefreshCw className="h-4 w-4" />;
      default: return <History className="h-4 w-4" />;
    }
  };

  const getCorTipo = (tipo: string | null) => {
    switch (tipo) {
      case "login": return "bg-green-100 text-green-800";
      case "logout": return "bg-gray-100 text-gray-800";
      case "recuperacao_senha": return "bg-yellow-100 text-yellow-800";
      case "alteracao_senha": return "bg-blue-100 text-blue-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getLabelTipo = (tipo: string | null) => {
    switch (tipo) {
      case "login": return "Login";
      case "logout": return "Logout";
      case "recuperacao_senha": return "Recuperação";
      case "alteracao_senha": return "Alteração Senha";
      default: return tipo;
    }
  };

  const getIconeDispositivo = (dispositivo: string | null) => {
    switch (dispositivo) {
      case "Mobile": return <Smartphone className="h-4 w-4" />;
      case "Tablet": return <Tablet className="h-4 w-4" />;
      default: return <Monitor className="h-4 w-4" />;
    }
  };

  const formatarData = (data: Date | string | null) => {
    if (!data) return "-";
    const d = new Date(data);
    return d.toLocaleString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Função para adicionar marcadores no mapa
  const adicionarMarcadores = (map: google.maps.Map) => {
    // Limpar marcadores anteriores
    markersRef.current.forEach(marker => marker.map = null);
    markersRef.current = [];

    // Adicionar marcadores para acessos com geolocalização
    const bounds = new google.maps.LatLngBounds();
    let temMarcadores = false;

    acessosComGeo.forEach((acesso) => {
      if (acesso.latitude && acesso.longitude) {
        const lat = parseFloat(acesso.latitude);
        const lng = parseFloat(acesso.longitude);
        
        if (!isNaN(lat) && !isNaN(lng)) {
          const position = { lat, lng };
          bounds.extend(position);
          temMarcadores = true;

          // Criar elemento HTML para o marcador
          const markerElement = document.createElement("div");
          markerElement.className = `w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-lg cursor-pointer transition-transform hover:scale-110 ${
            acesso.sucesso ? "bg-green-500" : "bg-red-500"
          } ${acessoSelecionado === acesso.id ? "ring-4 ring-blue-400 scale-125" : ""}`;
          markerElement.innerHTML = acesso.funcionarioNome?.charAt(0).toUpperCase() || "?";
          markerElement.title = `${acesso.funcionarioNome || "Desconhecido"}\n${acesso.cidade || ""}, ${acesso.pais || ""}\n${formatarData(acesso.dataHora)}`;

          const marker = new google.maps.marker.AdvancedMarkerElement({
            map,
            position,
            content: markerElement,
          });

          marker.addListener("click", () => {
            setAcessoSelecionado(acesso.id);
          });

          markersRef.current.push(marker);
        }
      }
    });

    // Ajustar zoom para mostrar todos os marcadores
    if (temMarcadores) {
      map.fitBounds(bounds);
      // Limitar zoom máximo
      const listener = google.maps.event.addListener(map, "idle", () => {
        if (map.getZoom()! > 15) map.setZoom(15);
        google.maps.event.removeListener(listener);
      });
    }
  };

  // Atualizar marcadores quando os dados mudarem
  const handleMapReady = (map: google.maps.Map) => {
    mapRef.current = map;
    adicionarMarcadores(map);
  };

  // Atualizar marcadores quando acessos mudarem
  if (mapRef.current && mostrarMapa) {
    adicionarMarcadores(mapRef.current);
  }

  return (
    <div className="space-y-6">
        {/* Cabeçalho */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <History className="h-6 w-6 text-blue-600" />
              Histórico de Acessos
            </h1>
            <p className="text-gray-600 mt-1">
              Auditoria de acessos dos funcionários ao sistema
            </p>
          </div>
          <Button
            variant={mostrarMapa ? "default" : "outline"}
            onClick={() => setMostrarMapa(!mostrarMapa)}
            className="flex items-center gap-2"
          >
            <Map className="h-4 w-4" />
            {mostrarMapa ? "Ocultar Mapa" : "Ver no Mapa"}
            {acessosComGeo.length > 0 && (
              <Badge variant="secondary" className="ml-1">
                {acessosComGeo.length}
              </Badge>
            )}
          </Button>
        </div>

        {/* Estatísticas */}
        {estatisticas && (
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <History className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{estatisticas.totalAcessos}</p>
                    <p className="text-xs text-gray-500">Total de Acessos</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{estatisticas.acessosSucesso}</p>
                    <p className="text-xs text-gray-500">Com Sucesso</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-red-100 rounded-lg">
                    <XCircle className="h-5 w-5 text-red-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{estatisticas.acessosFalhados}</p>
                    <p className="text-xs text-gray-500">Falhados</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <Users className="h-5 w-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{estatisticas.funcionariosUnicos}</p>
                    <p className="text-xs text-gray-500">Funcionários Ativos</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-amber-100 rounded-lg">
                    <Clock className="h-5 w-5 text-amber-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium truncate">
                      {estatisticas.ultimoAcesso ? formatarData(estatisticas.ultimoAcesso) : "-"}
                    </p>
                    <p className="text-xs text-gray-500">Último Acesso</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Mapa de Geolocalização */}
        {mostrarMapa && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <Globe className="h-5 w-5 text-blue-600" />
                Mapa de Localizações
              </CardTitle>
              <CardDescription>
                {acessosComGeo.length} acesso(s) com geolocalização disponível
              </CardDescription>
            </CardHeader>
            <CardContent>
              {acessosComGeo.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-gray-500 bg-gray-50 rounded-lg">
                  <MapPin className="h-12 w-12 mb-4 opacity-50" />
                  <p className="text-lg font-medium">Nenhum acesso com geolocalização</p>
                  <p className="text-sm mt-1">Os próximos logins terão a localização registrada automaticamente</p>
                </div>
              ) : (
                <div className="relative">
                  <MapView
                    className="h-[400px] rounded-lg overflow-hidden"
                    initialCenter={{ lat: -23.5505, lng: -46.6333 }} // São Paulo como centro padrão
                    initialZoom={4}
                    onMapReady={handleMapReady}
                  />
                  
                  {/* Legenda do Mapa */}
                  <div className="absolute bottom-4 left-4 bg-white/95 backdrop-blur-sm rounded-lg p-3 shadow-lg">
                    <p className="text-xs font-semibold text-gray-700 mb-2">Legenda</p>
                    <div className="flex flex-col gap-1.5">
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded-full bg-green-500"></div>
                        <span className="text-xs text-gray-600">Login com sucesso</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded-full bg-red-500"></div>
                        <span className="text-xs text-gray-600">Login falhado</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Filtros */}
        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="text-lg flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Filtros
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              {/* Seletor de Condomínio */}
              <Select 
                value={condominioSelecionado?.toString() || ""} 
                onValueChange={(v) => setCondominioId(parseInt(v))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione a organização" />
                </SelectTrigger>
                <SelectContent>
                  {condominios?.map((c) => (
                    <SelectItem key={c.id} value={c.id.toString()}>
                      {c.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Seletor de Funcionário */}
              <Select 
                value={funcionarioId?.toString() || "todos"} 
                onValueChange={(v) => setFuncionarioId(v === "todos" ? null : parseInt(v))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Todos os funcionários" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos os funcionários</SelectItem>
                  {funcionariosData?.map((f) => (
                    <SelectItem key={f.id} value={f.id.toString()}>
                      {f.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Filtro por Tipo */}
              <Select value={filtroTipo} onValueChange={setFiltroTipo}>
                <SelectTrigger>
                  <SelectValue placeholder="Tipo de acesso" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos os tipos</SelectItem>
                  <SelectItem value="login">Login</SelectItem>
                  <SelectItem value="logout">Logout</SelectItem>
                  <SelectItem value="recuperacao_senha">Recuperação</SelectItem>
                  <SelectItem value="alteracao_senha">Alteração Senha</SelectItem>
                </SelectContent>
              </Select>

              {/* Filtro por Período */}
              <Select value={filtroPeriodo} onValueChange={setFiltroPeriodo}>
                <SelectTrigger>
                  <SelectValue placeholder="Período" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7">Últimos 7 dias</SelectItem>
                  <SelectItem value="30">Últimos 30 dias</SelectItem>
                  <SelectItem value="90">Últimos 90 dias</SelectItem>
                  <SelectItem value="365">Último ano</SelectItem>
                  <SelectItem value="todos">Todo o período</SelectItem>
                </SelectContent>
              </Select>

              {/* Busca */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Buscar por nome, IP, cidade..."
                  value={busca}
                  onChange={(e) => setBusca(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Lista de Acessos */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Registros de Acesso</CardTitle>
            <CardDescription>
              {total} registro(s) encontrado(s)
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <RefreshCw className="h-6 w-6 animate-spin text-gray-400" />
              </div>
            ) : acessosFiltrados.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <History className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Nenhum registro de acesso encontrado</p>
              </div>
            ) : (
              <div className="space-y-3">
                {acessosFiltrados.map((acesso) => (
                  <div
                    key={acesso.id}
                    className={`flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer ${
                      acessoSelecionado === acesso.id ? "ring-2 ring-blue-400 bg-blue-50" : ""
                    }`}
                    onClick={() => {
                      setAcessoSelecionado(acesso.id);
                      if (acesso.latitude && acesso.longitude && mapRef.current) {
                        mapRef.current.panTo({
                          lat: parseFloat(acesso.latitude),
                          lng: parseFloat(acesso.longitude),
                        });
                        mapRef.current.setZoom(12);
                        if (!mostrarMapa) setMostrarMapa(true);
                      }
                    }}
                  >
                    <div className="flex items-center gap-4">
                      {/* Ícone de Status */}
                      <div className={`p-2 rounded-full ${acesso.sucesso ? "bg-green-100" : "bg-red-100"}`}>
                        {acesso.sucesso ? (
                          <CheckCircle className="h-5 w-5 text-green-600" />
                        ) : (
                          <XCircle className="h-5 w-5 text-red-600" />
                        )}
                      </div>

                      {/* Informações do Acesso */}
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{acesso.funcionarioNome || "Desconhecido"}</span>
                          {acesso.funcionarioCargo && (
                            <span className="text-xs text-gray-500">({acesso.funcionarioCargo})</span>
                          )}
                        </div>
                        <div className="flex items-center gap-3 text-sm text-gray-500 mt-1">
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {formatarData(acesso.dataHora)}
                          </span>
                          {acesso.ip && (
                            <span className="flex items-center gap-1">
                              IP: {acesso.ip}
                            </span>
                          )}
                        </div>
                        {/* Localização */}
                        {(acesso.cidade || acesso.pais) && (
                          <div className="flex items-center gap-1 text-sm text-blue-600 mt-1">
                            <MapPin className="h-3 w-3" />
                            <span>
                              {[acesso.cidade, acesso.regiao, acesso.pais].filter(Boolean).join(", ")}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      {/* Indicador de Geolocalização */}
                      {acesso.latitude && acesso.longitude && (
                        <div className="p-1.5 bg-blue-100 rounded-full" title="Localização disponível">
                          <Globe className="h-4 w-4 text-blue-600" />
                        </div>
                      )}

                      {/* Dispositivo */}
                      <div className="flex items-center gap-1 text-gray-500" title={acesso.dispositivo || "Desktop"}>
                        {getIconeDispositivo(acesso.dispositivo)}
                        <span className="text-xs hidden sm:inline">{acesso.dispositivo || "Desktop"}</span>
                      </div>

                      {/* Navegador */}
                      {acesso.navegador && (
                        <span className="text-xs text-gray-500 hidden md:inline">
                          {acesso.navegador}
                        </span>
                      )}

                      {/* Tipo de Acesso */}
                      <Badge className={`${getCorTipo(acesso.tipoAcesso)} flex items-center gap-1`}>
                        {getIconeTipo(acesso.tipoAcesso)}
                        {getLabelTipo(acesso.tipoAcesso)}
                      </Badge>

                      {/* Motivo de Falha */}
                      {!acesso.sucesso && acesso.motivoFalha && (
                        <div className="flex items-center gap-1 text-red-500" title={acesso.motivoFalha}>
                          <AlertTriangle className="h-4 w-4" />
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Paginação */}
            {totalPaginas > 1 && (
              <div className="flex items-center justify-between mt-6 pt-4 border-t">
                <p className="text-sm text-gray-500">
                  Página {pagina} de {totalPaginas}
                </p>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPagina(p => Math.max(1, p - 1))}
                    disabled={pagina === 1}
                  >
                    <ChevronLeft className="h-4 w-4" />
                    Anterior
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPagina(p => Math.min(totalPaginas, p + 1))}
                    disabled={pagina === totalPaginas}
                  >
                    Próxima
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
    </div>
  );
}
