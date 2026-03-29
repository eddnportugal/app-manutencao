import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { trpc } from "@/lib/trpc";
import { toast } from "@/components/ui/sonner";
import { useState } from "react";
import ImageUpload from "@/components/ImageUpload";
import {
  AlertTriangle,
  BookOpen,
  Building2,
  EyeOff,
  FileText,
  Image,
  Loader2,
  Megaphone,
  Package,
  Plus,
  Send,
  Star,
  Trash2,
  X,
} from "lucide-react";

interface SectionProps {
  revistaId: number;
  condominioId: number;
  hiddenSections: Set<string>;
  toggleSectionVisibility: (sectionId: string) => void;
  showForm: boolean;
  setShowForm: (show: boolean) => void;
}

// ==================== GALERIA DE FOTOS ====================
export function GaleriaSection({ revistaId, condominioId, hiddenSections, toggleSectionVisibility, showForm, setShowForm }: SectionProps) {
  const [titulo, setTitulo] = useState("");
  const [descricao, setDescricao] = useState("");
  const [fotos, setFotos] = useState<string[]>([]);
  
  const utils = trpc.useUtils();
  const { data: albuns, isLoading } = trpc.album.list.useQuery({ condominioId }, { enabled: condominioId > 0 });
  
  const createAlbumMutation = trpc.album.create.useMutation({
    onSuccess: () => {
      toast.success("Álbum criado com sucesso!");
      utils.album.list.invalidate({ condominioId });
      setTitulo("");
      setDescricao("");
      setFotos([]);
      setShowForm(false);
    },
    onError: (error) => toast.error("Erro ao criar álbum: " + error.message),
  });

  const deleteAlbumMutation = trpc.album.delete.useMutation({
    onSuccess: () => {
      toast.success("Álbum removido!");
      utils.album.list.invalidate({ condominioId });
    },
  });

  if (hiddenSections.has("galeria")) return null;

  return (
    <div id="galeria-section" className="relative overflow-hidden bg-gradient-to-br from-violet-50 via-purple-50 to-fuchsia-50 rounded-2xl border border-violet-100 shadow-sm hover:shadow-lg transition-all duration-300">
      <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-violet-400 via-purple-500 to-fuchsia-500" />
      <div className="absolute -right-12 -top-12 w-40 h-40 bg-violet-200/20 rounded-full blur-3xl" />
      <div className="absolute -left-8 -bottom-8 w-32 h-32 bg-purple-200/20 rounded-full blur-2xl" />
      
      <div className="relative p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-gradient-to-br from-violet-500 to-purple-500 rounded-xl shadow-lg shadow-violet-500/30">
              <Image className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-800">Galeria de Fotos</h3>
              <p className="text-sm text-slate-500">Álbuns de fotos da organização</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={() => toggleSectionVisibility("galeria")} className="text-slate-500 hover:text-red-500 hover:bg-red-50">
              <EyeOff className="w-4 h-4 mr-1" />
              Ocultar
            </Button>
            <Dialog open={showForm} onOpenChange={setShowForm}>
              <DialogTrigger asChild>
                <Button size="sm" className="bg-gradient-to-r from-violet-500 to-purple-500 hover:from-violet-600 hover:to-purple-600 text-white shadow-md shadow-violet-500/25">
                  <Plus className="w-4 h-4 mr-2" />
                  Novo Álbum
                </Button>
              </DialogTrigger>
              <DialogContent className="w-[95vw] max-w-lg max-h-[90vh] overflow-hidden p-0">
                <div className="bg-gradient-to-r from-violet-500 to-purple-500 px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
                      <Image className="w-5 h-5 text-white" />
                    </div>
                    <h3 className="text-lg font-semibold text-white">Novo Álbum de Fotos</h3>
                  </div>
                </div>
                <div className="p-6 overflow-y-auto max-h-[70vh] space-y-4">
                  <div>
                    <Label>Título do Álbum *</Label>
                    <Input value={titulo} onChange={(e) => setTitulo(e.target.value)} placeholder="Ex: Festa Junina 2026" />
                  </div>
                  <div>
                    <Label>Descrição</Label>
                    <Textarea value={descricao} onChange={(e) => setDescricao(e.target.value)} placeholder="Descrição do álbum..." rows={3} />
                  </div>
                  <div>
                    <Label>Fotos do Álbum</Label>
                    <div className="grid grid-cols-3 gap-2 mt-2">
                      {fotos.map((foto, index) => (
                        <div key={index} className="relative aspect-square rounded-lg overflow-hidden border">
                          <img src={foto} alt="" className="w-full h-full object-cover" />
                          <button onClick={() => setFotos(fotos.filter((_, i) => i !== index))} className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full hover:bg-red-600">
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                      <ImageUpload onChange={(url) => url && setFotos([...fotos, url])} className="aspect-square" />
                    </div>
                  </div>
                  <div className="flex gap-2 pt-4">
                    <Button variant="outline" className="flex-1" onClick={() => setShowForm(false)}>Cancelar</Button>
                    <Button 
                      className="flex-1 bg-gradient-to-r from-violet-500 to-purple-500"
                      onClick={() => createAlbumMutation.mutate({ condominioId, titulo, descricao, categoria: "eventos" })}
                      disabled={!titulo || createAlbumMutation.isPending}
                    >
                      {createAlbumMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                      Criar Álbum
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
        
        {isLoading ? (
          <div className="text-center py-8"><Loader2 className="w-6 h-6 animate-spin mx-auto text-violet-500" /></div>
        ) : albuns && albuns.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {albuns.map((album: any) => (
              <div key={album.id} className="bg-white/60 rounded-xl p-4 border border-violet-100 hover:shadow-md transition-all">
                <div className="aspect-video bg-violet-100 rounded-lg mb-3 flex items-center justify-center overflow-hidden">
                  {album.fotos?.[0]?.imagemUrl ? (
                    <img src={album.fotos[0].imagemUrl} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <Image className="w-8 h-8 text-violet-300" />
                  )}
                </div>
                <h4 className="font-medium text-slate-800 truncate">{album.titulo}</h4>
                <p className="text-xs text-slate-500">{album.fotos?.length || 0} fotos</p>
                <Button variant="ghost" size="sm" className="w-full mt-2 text-red-500 hover:bg-red-50" onClick={() => deleteAlbumMutation.mutate({ id: album.id })}>
                  <Trash2 className="w-3 h-3 mr-1" /> Remover
                </Button>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-white/40 rounded-xl border border-dashed border-violet-200">
            <div className="p-3 bg-violet-100 rounded-full w-fit mx-auto mb-3">
              <Image className="w-6 h-6 text-violet-500" />
            </div>
            <p className="font-medium text-slate-700">Nenhum álbum criado</p>
            <p className="text-sm text-slate-500 mt-1">Crie álbuns de fotos para a revista</p>
          </div>
        )}
      </div>
    </div>
  );
}

// ==================== COMUNICADOS ====================
export function ComunicadosSection({ revistaId, condominioId, hiddenSections, toggleSectionVisibility, showForm, setShowForm }: SectionProps) {
  const [titulo, setTitulo] = useState("");
  const [conteudo, setConteudo] = useState("");
  const [categoria, setCategoria] = useState("outros");
  
  const utils = trpc.useUtils();
  const { data: comunicados, isLoading } = trpc.comunicado.list.useQuery({ revistaId }, { enabled: revistaId > 0 });
  
  const createMutation = trpc.comunicado.create.useMutation({
    onSuccess: () => {
      toast.success("Comunicado criado!");
      utils.comunicado.list.invalidate({ revistaId });
      setTitulo("");
      setConteudo("");
      setShowForm(false);
    },
    onError: (error) => toast.error("Erro: " + error.message),
  });

  const deleteMutation = trpc.comunicado.delete.useMutation({
    onSuccess: () => {
      toast.success("Comunicado removido!");
      utils.comunicado.list.invalidate({ revistaId });
    },
  });

  if (hiddenSections.has("comunicados")) return null;

  return (
    <div id="comunicados-section" className="relative overflow-hidden bg-gradient-to-br from-sky-50 via-blue-50 to-indigo-50 rounded-2xl border border-sky-100 shadow-sm hover:shadow-lg transition-all duration-300">
      <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-sky-400 via-blue-500 to-indigo-500" />
      <div className="absolute -right-12 -top-12 w-40 h-40 bg-sky-200/20 rounded-full blur-3xl" />
      
      <div className="relative p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-gradient-to-br from-sky-500 to-blue-500 rounded-xl shadow-lg shadow-sky-500/30">
              <FileText className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-800">Comunicados</h3>
              <p className="text-sm text-slate-500">Comunicados oficiais da administração</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={() => toggleSectionVisibility("comunicados")} className="text-slate-500 hover:text-red-500 hover:bg-red-50">
              <EyeOff className="w-4 h-4 mr-1" />
              Ocultar
            </Button>
            <Dialog open={showForm} onOpenChange={setShowForm}>
              <DialogTrigger asChild>
                <Button size="sm" className="bg-gradient-to-r from-sky-500 to-blue-500 hover:from-sky-600 hover:to-blue-600 text-white shadow-md shadow-sky-500/25">
                  <Plus className="w-4 h-4 mr-2" />
                  Novo Comunicado
                </Button>
              </DialogTrigger>
              <DialogContent className="w-[95vw] max-w-lg max-h-[90vh] overflow-hidden p-0">
                <div className="bg-gradient-to-r from-sky-500 to-blue-500 px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
                      <FileText className="w-5 h-5 text-white" />
                    </div>
                    <h3 className="text-lg font-semibold text-white">Novo Comunicado</h3>
                  </div>
                </div>
                <div className="p-6 overflow-y-auto max-h-[70vh] space-y-4">
                  <div>
                    <Label>Título *</Label>
                    <Input value={titulo} onChange={(e) => setTitulo(e.target.value)} placeholder="Título do comunicado" />
                  </div>
                  <div>
                    <Label>Categoria</Label>
                    <Select value={categoria} onValueChange={setCategoria}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="eventos">Eventos</SelectItem>
                        <SelectItem value="obras">Obras</SelectItem>
                        <SelectItem value="areas_comuns">Áreas Comuns</SelectItem>
                        <SelectItem value="melhorias">Melhorias</SelectItem>
                        <SelectItem value="outros">Outros</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Conteúdo *</Label>
                    <Textarea value={conteudo} onChange={(e) => setConteudo(e.target.value)} placeholder="Conteúdo do comunicado..." rows={5} />
                  </div>
                  <div className="flex gap-2 pt-4">
                    <Button variant="outline" className="flex-1" onClick={() => setShowForm(false)}>Cancelar</Button>
                    <Button 
                      className="flex-1 bg-gradient-to-r from-sky-500 to-blue-500"
                      onClick={() => createMutation.mutate({ revistaId, titulo, descricao: conteudo })}
                      disabled={!titulo || !conteudo || createMutation.isPending}
                    >
                      {createMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                      Criar
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
        
        {isLoading ? (
          <div className="text-center py-8"><Loader2 className="w-6 h-6 animate-spin mx-auto text-sky-500" /></div>
        ) : comunicados && comunicados.length > 0 ? (
          <div className="space-y-3">
            {comunicados.map((item: any) => (
              <div key={item.id} className="bg-white/60 rounded-xl p-4 border border-sky-100 hover:shadow-md transition-all">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-medium text-slate-800">{item.titulo}</h4>
                    <p className="text-sm text-slate-500 mt-1 line-clamp-2">{item.conteudo}</p>
                    <span className="inline-block mt-2 text-xs px-2 py-1 bg-sky-100 text-sky-700 rounded-full">{item.categoria}</span>
                  </div>
                  <Button variant="ghost" size="sm" className="text-red-500 hover:bg-red-50" onClick={() => deleteMutation.mutate({ id: item.id })}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-white/40 rounded-xl border border-dashed border-sky-200">
            <div className="p-3 bg-sky-100 rounded-full w-fit mx-auto mb-3">
              <FileText className="w-6 h-6 text-sky-500" />
            </div>
            <p className="font-medium text-slate-700">Nenhum comunicado</p>
            <p className="text-sm text-slate-500 mt-1">Adicione comunicados oficiais</p>
          </div>
        )}
      </div>
    </div>
  );
}

// ==================== REGRAS E NORMAS ====================
export function RegrasSection({ revistaId, condominioId, hiddenSections, toggleSectionVisibility, showForm, setShowForm }: SectionProps) {
  const [titulo, setTitulo] = useState("");
  const [descricao, setDescricao] = useState("");
  const [categoria, setCategoria] = useState("geral");
  
  const utils = trpc.useUtils();
  const { data: regras, isLoading } = trpc.regra.list.useQuery({ condominioId }, { enabled: condominioId > 0 });
  
  const createMutation = trpc.regra.create.useMutation({
    onSuccess: () => {
      toast.success("Regra adicionada!");
      utils.regra.list.invalidate({ condominioId });
      setTitulo("");
      setDescricao("");
      setShowForm(false);
    },
    onError: (error) => toast.error("Erro: " + error.message),
  });

  const deleteMutation = trpc.regra.delete.useMutation({
    onSuccess: () => {
      toast.success("Regra removida!");
      utils.regra.list.invalidate({ condominioId });
    },
  });

  if (hiddenSections.has("regras")) return null;

  return (
    <div id="regras-section" className="relative overflow-hidden bg-gradient-to-br from-slate-50 via-gray-50 to-zinc-50 rounded-2xl border border-slate-200 shadow-sm hover:shadow-lg transition-all duration-300">
      <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-slate-400 via-gray-500 to-zinc-500" />
      <div className="absolute -right-12 -top-12 w-40 h-40 bg-slate-200/20 rounded-full blur-3xl" />
      
      <div className="relative p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-gradient-to-br from-slate-500 to-gray-600 rounded-xl shadow-lg shadow-slate-500/30">
              <BookOpen className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-800">Regras e Normas</h3>
              <p className="text-sm text-slate-500">Regulamento interno da organização</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={() => toggleSectionVisibility("regras")} className="text-slate-500 hover:text-red-500 hover:bg-red-50">
              <EyeOff className="w-4 h-4 mr-1" />
              Ocultar
            </Button>
            <Dialog open={showForm} onOpenChange={setShowForm}>
              <DialogTrigger asChild>
                <Button size="sm" className="bg-gradient-to-r from-slate-500 to-gray-600 hover:from-slate-600 hover:to-gray-700 text-white shadow-md shadow-slate-500/25">
                  <Plus className="w-4 h-4 mr-2" />
                  Nova Regra
                </Button>
              </DialogTrigger>
              <DialogContent className="w-[95vw] max-w-lg max-h-[90vh] overflow-hidden p-0">
                <div className="bg-gradient-to-r from-slate-500 to-gray-600 px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
                      <BookOpen className="w-5 h-5 text-white" />
                    </div>
                    <h3 className="text-lg font-semibold text-white">Nova Regra</h3>
                  </div>
                </div>
                <div className="p-6 overflow-y-auto max-h-[70vh] space-y-4">
                  <div>
                    <Label>Título *</Label>
                    <Input value={titulo} onChange={(e) => setTitulo(e.target.value)} placeholder="Ex: Horário de Silêncio" />
                  </div>
                  <div>
                    <Label>Categoria</Label>
                    <Select value={categoria} onValueChange={setCategoria}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="geral">Geral</SelectItem>
                        <SelectItem value="convivencia">Convivência</SelectItem>
                        <SelectItem value="areas_comuns">Áreas Comuns</SelectItem>
                        <SelectItem value="estacionamento">Estacionamento</SelectItem>
                        <SelectItem value="animais">Animais</SelectItem>
                        <SelectItem value="mudancas">Mudanças</SelectItem>
                        <SelectItem value="obras">Obras</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Descrição *</Label>
                    <Textarea value={descricao} onChange={(e) => setDescricao(e.target.value)} placeholder="Descreva a regra em detalhes..." rows={5} />
                  </div>
                  <div className="flex gap-2 pt-4">
                    <Button variant="outline" className="flex-1" onClick={() => setShowForm(false)}>Cancelar</Button>
                    <Button 
                      className="flex-1 bg-gradient-to-r from-slate-500 to-gray-600"
                      onClick={() => createMutation.mutate({ condominioId, titulo, descricao, categoria: categoria as any })}
                      disabled={!titulo || !descricao || createMutation.isPending}
                    >
                      {createMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                      Adicionar
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
        
        {isLoading ? (
          <div className="text-center py-8"><Loader2 className="w-6 h-6 animate-spin mx-auto text-slate-500" /></div>
        ) : regras && regras.length > 0 ? (
          <div className="space-y-3">
            {regras.map((item: any) => (
              <div key={item.id} className="bg-white/60 rounded-xl p-4 border border-slate-200 hover:shadow-md transition-all">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-medium text-slate-800">{item.titulo}</h4>
                    <p className="text-sm text-slate-500 mt-1 line-clamp-2">{item.descricao}</p>
                    <span className="inline-block mt-2 text-xs px-2 py-1 bg-slate-100 text-slate-700 rounded-full">{item.categoria}</span>
                  </div>
                  <Button variant="ghost" size="sm" className="text-red-500 hover:bg-red-50" onClick={() => deleteMutation.mutate({ id: item.id })}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-white/40 rounded-xl border border-dashed border-slate-200">
            <div className="p-3 bg-slate-100 rounded-full w-fit mx-auto mb-3">
              <BookOpen className="w-6 h-6 text-slate-500" />
            </div>
            <p className="font-medium text-slate-700">Nenhuma regra cadastrada</p>
            <p className="text-sm text-slate-500 mt-1">Adicione as regras da organização</p>
          </div>
        )}
      </div>
    </div>
  );
}

// ==================== DICAS DE SEGURANÇA ====================
export function DicasSegurancaSection({ revistaId, condominioId, hiddenSections, toggleSectionVisibility, showForm, setShowForm }: SectionProps) {
  const [titulo, setTitulo] = useState("");
  const [descricao, setDescricao] = useState("");
  const [categoria, setCategoria] = useState("geral");
  
  const utils = trpc.useUtils();
  const { data: dicas, isLoading } = trpc.dicaSeguranca.list.useQuery({ condominioId }, { enabled: condominioId > 0 });
  
  const createMutation = trpc.dicaSeguranca.create.useMutation({
    onSuccess: () => {
      toast.success("Dica adicionada!");
      utils.dicaSeguranca.list.invalidate({ condominioId });
      setTitulo("");
      setDescricao("");
      setShowForm(false);
    },
    onError: (error) => toast.error("Erro: " + error.message),
  });

  const deleteMutation = trpc.dicaSeguranca.delete.useMutation({
    onSuccess: () => {
      toast.success("Dica removida!");
      utils.dicaSeguranca.list.invalidate({ condominioId });
    },
  });

  if (hiddenSections.has("dicas_seguranca")) return null;

  return (
    <div id="dicas-section" className="relative overflow-hidden bg-gradient-to-br from-yellow-50 via-amber-50 to-orange-50 rounded-2xl border border-yellow-100 shadow-sm hover:shadow-lg transition-all duration-300">
      <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-yellow-400 via-amber-500 to-orange-500" />
      <div className="absolute -right-12 -top-12 w-40 h-40 bg-yellow-200/20 rounded-full blur-3xl" />
      
      <div className="relative p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-gradient-to-br from-yellow-500 to-amber-500 rounded-xl shadow-lg shadow-yellow-500/30">
              <AlertTriangle className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-800">Dicas de Segurança</h3>
              <p className="text-sm text-slate-500">Orientações para a equipa</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={() => toggleSectionVisibility("dicas_seguranca")} className="text-slate-500 hover:text-red-500 hover:bg-red-50">
              <EyeOff className="w-4 h-4 mr-1" />
              Ocultar
            </Button>
            <Dialog open={showForm} onOpenChange={setShowForm}>
              <DialogTrigger asChild>
                <Button size="sm" className="bg-gradient-to-r from-yellow-500 to-amber-500 hover:from-yellow-600 hover:to-amber-600 text-white shadow-md shadow-yellow-500/25">
                  <Plus className="w-4 h-4 mr-2" />
                  Nova Dica
                </Button>
              </DialogTrigger>
              <DialogContent className="w-[95vw] max-w-lg max-h-[90vh] overflow-hidden p-0">
                <div className="bg-gradient-to-r from-yellow-500 to-amber-500 px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
                      <AlertTriangle className="w-5 h-5 text-white" />
                    </div>
                    <h3 className="text-lg font-semibold text-white">Nova Dica de Segurança</h3>
                  </div>
                </div>
                <div className="p-6 overflow-y-auto max-h-[70vh] space-y-4">
                  <div>
                    <Label>Título *</Label>
                    <Input value={titulo} onChange={(e) => setTitulo(e.target.value)} placeholder="Ex: Cuidados com Entregas" />
                  </div>
                  <div>
                    <Label>Categoria</Label>
                    <Select value={categoria} onValueChange={setCategoria}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="geral">Geral</SelectItem>
                        <SelectItem value="portaria">Portaria</SelectItem>
                        <SelectItem value="garagem">Garagem</SelectItem>
                        <SelectItem value="incendio">Incêndio</SelectItem>
                        <SelectItem value="emergencia">Emergência</SelectItem>
                        <SelectItem value="digital">Segurança Digital</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Descrição *</Label>
                    <Textarea value={descricao} onChange={(e) => setDescricao(e.target.value)} placeholder="Descreva a dica de segurança..." rows={5} />
                  </div>
                  <div className="flex gap-2 pt-4">
                    <Button variant="outline" className="flex-1" onClick={() => setShowForm(false)}>Cancelar</Button>
                    <Button 
                      className="flex-1 bg-gradient-to-r from-yellow-500 to-amber-500"
                      onClick={() => createMutation.mutate({ condominioId, titulo, descricao, categoria: categoria as any })}
                      disabled={!titulo || !descricao || createMutation.isPending}
                    >
                      {createMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                      Adicionar
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
        
        {isLoading ? (
          <div className="text-center py-8"><Loader2 className="w-6 h-6 animate-spin mx-auto text-yellow-500" /></div>
        ) : dicas && dicas.length > 0 ? (
          <div className="space-y-3">
            {dicas.map((item: any) => (
              <div key={item.id} className="bg-white/60 rounded-xl p-4 border border-yellow-100 hover:shadow-md transition-all">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-medium text-slate-800">{item.titulo}</h4>
                    <p className="text-sm text-slate-500 mt-1 line-clamp-2">{item.descricao}</p>
                    <span className="inline-block mt-2 text-xs px-2 py-1 bg-yellow-100 text-yellow-700 rounded-full">{item.categoria}</span>
                  </div>
                  <Button variant="ghost" size="sm" className="text-red-500 hover:bg-red-50" onClick={() => deleteMutation.mutate({ id: item.id })}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-white/40 rounded-xl border border-dashed border-yellow-200">
            <div className="p-3 bg-yellow-100 rounded-full w-fit mx-auto mb-3">
              <AlertTriangle className="w-6 h-6 text-yellow-500" />
            </div>
            <p className="font-medium text-slate-700">Nenhuma dica cadastrada</p>
            <p className="text-sm text-slate-500 mt-1">Adicione dicas de segurança</p>
          </div>
        )}
      </div>
    </div>
  );
}

// ==================== REALIZAÇÕES ====================
export function RealizacoesSection({ revistaId, condominioId, hiddenSections, toggleSectionVisibility, showForm, setShowForm }: SectionProps) {
  const [titulo, setTitulo] = useState("");
  const [descricao, setDescricao] = useState("");
  const [imagens, setImagens] = useState<string[]>([]);
  
  const utils = trpc.useUtils();
  const { data: realizacoes, isLoading } = trpc.realizacao.list.useQuery({ revistaId }, { enabled: revistaId > 0 });
  
  const createMutation = trpc.realizacao.create.useMutation({
    onSuccess: () => {
      toast.success("Realização adicionada!");
      utils.realizacao.list.invalidate({ revistaId });
      setTitulo("");
      setDescricao("");
      setImagens([]);
      setShowForm(false);
    },
    onError: (error) => toast.error("Erro: " + error.message),
  });

  const deleteMutation = trpc.realizacao.delete.useMutation({
    onSuccess: () => {
      toast.success("Realização removida!");
      utils.realizacao.list.invalidate({ revistaId });
    },
  });

  if (hiddenSections.has("realizacoes")) return null;

  return (
    <div id="realizacoes-section" className="relative overflow-hidden bg-gradient-to-br from-amber-50 via-yellow-50 to-lime-50 rounded-2xl border border-amber-100 shadow-sm hover:shadow-lg transition-all duration-300">
      <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-amber-400 via-yellow-500 to-lime-500" />
      <div className="absolute -right-12 -top-12 w-40 h-40 bg-amber-200/20 rounded-full blur-3xl" />
      
      <div className="relative p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-gradient-to-br from-amber-500 to-yellow-500 rounded-xl shadow-lg shadow-amber-500/30">
              <Star className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-800">Realizações</h3>
              <p className="text-sm text-slate-500">Conquistas da gestão</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={() => toggleSectionVisibility("realizacoes")} className="text-slate-500 hover:text-red-500 hover:bg-red-50">
              <EyeOff className="w-4 h-4 mr-1" />
              Ocultar
            </Button>
            <Dialog open={showForm} onOpenChange={setShowForm}>
              <DialogTrigger asChild>
                <Button size="sm" className="bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-white shadow-md shadow-amber-500/25">
                  <Plus className="w-4 h-4 mr-2" />
                  Nova Realização
                </Button>
              </DialogTrigger>
              <DialogContent className="w-[95vw] max-w-lg max-h-[90vh] overflow-hidden p-0">
                <div className="bg-gradient-to-r from-amber-500 to-yellow-500 px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
                      <Star className="w-5 h-5 text-white" />
                    </div>
                    <h3 className="text-lg font-semibold text-white">Nova Realização</h3>
                  </div>
                </div>
                <div className="p-6 overflow-y-auto max-h-[70vh] space-y-4">
                  <div>
                    <Label>Título *</Label>
                    <Input value={titulo} onChange={(e) => setTitulo(e.target.value)} placeholder="Ex: Reforma da Piscina" />
                  </div>
                  <div>
                    <Label>Descrição *</Label>
                    <Textarea value={descricao} onChange={(e) => setDescricao(e.target.value)} placeholder="Descreva a realização..." rows={4} />
                  </div>
                  <div>
                    <Label>Imagens</Label>
                    <div className="grid grid-cols-3 gap-2 mt-2">
                      {imagens.map((img, index) => (
                        <div key={index} className="relative aspect-square rounded-lg overflow-hidden border">
                          <img src={img} alt="" className="w-full h-full object-cover" />
                          <button onClick={() => setImagens(imagens.filter((_, i) => i !== index))} className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full hover:bg-red-600">
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                      <ImageUpload onChange={(url) => url && setImagens([...imagens, url])} className="aspect-square" />
                    </div>
                  </div>
                  <div className="flex gap-2 pt-4">
                    <Button variant="outline" className="flex-1" onClick={() => setShowForm(false)}>Cancelar</Button>
                    <Button 
                      className="flex-1 bg-gradient-to-r from-amber-500 to-yellow-500"
                      onClick={() => createMutation.mutate({ revistaId, titulo, descricao })}
                      disabled={!titulo || !descricao || createMutation.isPending}
                    >
                      {createMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                      Adicionar
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
        
        {isLoading ? (
          <div className="text-center py-8"><Loader2 className="w-6 h-6 animate-spin mx-auto text-amber-500" /></div>
        ) : realizacoes && realizacoes.length > 0 ? (
          <div className="grid grid-cols-2 gap-4">
            {realizacoes.map((item: any) => (
              <div key={item.id} className="bg-white/60 rounded-xl p-4 border border-amber-100 hover:shadow-md transition-all">
                {item.imagens?.[0]?.imagemUrl && (
                  <div className="aspect-video rounded-lg overflow-hidden mb-3">
                    <img src={item.imagens[0].imagemUrl} alt="" className="w-full h-full object-cover" />
                  </div>
                )}
                <h4 className="font-medium text-slate-800">{item.titulo}</h4>
                <p className="text-sm text-slate-500 mt-1 line-clamp-2">{item.descricao}</p>
                <Button variant="ghost" size="sm" className="w-full mt-2 text-red-500 hover:bg-red-50" onClick={() => deleteMutation.mutate({ id: item.id })}>
                  <Trash2 className="w-3 h-3 mr-1" /> Remover
                </Button>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-white/40 rounded-xl border border-dashed border-amber-200">
            <div className="p-3 bg-amber-100 rounded-full w-fit mx-auto mb-3">
              <Star className="w-6 h-6 text-amber-500" />
            </div>
            <p className="font-medium text-slate-700">Nenhuma realização</p>
            <p className="text-sm text-slate-500 mt-1">Adicione as conquistas da gestão</p>
          </div>
        )}
      </div>
    </div>
  );
}

// ==================== MELHORIAS ====================
export function MelhoriasSection({ revistaId, condominioId, hiddenSections, toggleSectionVisibility, showForm, setShowForm }: SectionProps) {
  const [titulo, setTitulo] = useState("");
  const [descricao, setDescricao] = useState("");
  const [status, setStatus] = useState("planejada");
  const [imagens, setImagens] = useState<string[]>([]);
  
  const utils = trpc.useUtils();
  const { data: melhorias, isLoading } = trpc.melhoria.list.useQuery({ revistaId }, { enabled: revistaId > 0 });
  
  const createMutation = trpc.melhoria.create.useMutation({
    onSuccess: () => {
      toast.success("Melhoria adicionada!");
      utils.melhoria.list.invalidate({ revistaId });
      setTitulo("");
      setDescricao("");
      setImagens([]);
      setShowForm(false);
    },
    onError: (error) => toast.error("Erro: " + error.message),
  });

  const deleteMutation = trpc.melhoria.delete.useMutation({
    onSuccess: () => {
      toast.success("Melhoria removida!");
      utils.melhoria.list.invalidate({ revistaId });
    },
  });

  if (hiddenSections.has("melhorias")) return null;

  return (
    <div id="melhorias-section" className="relative overflow-hidden bg-gradient-to-br from-lime-50 via-green-50 to-emerald-50 rounded-2xl border border-lime-100 shadow-sm hover:shadow-lg transition-all duration-300">
      <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-lime-400 via-green-500 to-emerald-500" />
      <div className="absolute -right-12 -top-12 w-40 h-40 bg-lime-200/20 rounded-full blur-3xl" />
      
      <div className="relative p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-gradient-to-br from-lime-500 to-green-500 rounded-xl shadow-lg shadow-lime-500/30">
              <Building2 className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-800">Melhorias</h3>
              <p className="text-sm text-slate-500">Projetos em andamento</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={() => toggleSectionVisibility("melhorias")} className="text-slate-500 hover:text-red-500 hover:bg-red-50">
              <EyeOff className="w-4 h-4 mr-1" />
              Ocultar
            </Button>
            <Dialog open={showForm} onOpenChange={setShowForm}>
              <DialogTrigger asChild>
                <Button size="sm" className="bg-gradient-to-r from-lime-500 to-green-500 hover:from-lime-600 hover:to-green-600 text-white shadow-md shadow-lime-500/25">
                  <Plus className="w-4 h-4 mr-2" />
                  Nova Melhoria
                </Button>
              </DialogTrigger>
              <DialogContent className="w-[95vw] max-w-lg max-h-[90vh] overflow-hidden p-0">
                <div className="bg-gradient-to-r from-lime-500 to-green-500 px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
                      <Building2 className="w-5 h-5 text-white" />
                    </div>
                    <h3 className="text-lg font-semibold text-white">Nova Melhoria</h3>
                  </div>
                </div>
                <div className="p-6 overflow-y-auto max-h-[70vh] space-y-4">
                  <div>
                    <Label>Título *</Label>
                    <Input value={titulo} onChange={(e) => setTitulo(e.target.value)} placeholder="Ex: Instalação de Câmeras" />
                  </div>
                  <div>
                    <Label>Status</Label>
                    <Select value={status} onValueChange={setStatus}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="planejada">Planejada</SelectItem>
                        <SelectItem value="em_andamento">Em Andamento</SelectItem>
                        <SelectItem value="concluida">Concluída</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Descrição *</Label>
                    <Textarea value={descricao} onChange={(e) => setDescricao(e.target.value)} placeholder="Descreva a melhoria..." rows={4} />
                  </div>
                  <div>
                    <Label>Imagens</Label>
                    <div className="grid grid-cols-3 gap-2 mt-2">
                      {imagens.map((img, index) => (
                        <div key={index} className="relative aspect-square rounded-lg overflow-hidden border">
                          <img src={img} alt="" className="w-full h-full object-cover" />
                          <button onClick={() => setImagens(imagens.filter((_, i) => i !== index))} className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full hover:bg-red-600">
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                      <ImageUpload onChange={(url) => url && setImagens([...imagens, url])} className="aspect-square" />
                    </div>
                  </div>
                  <div className="flex gap-2 pt-4">
                    <Button variant="outline" className="flex-1" onClick={() => setShowForm(false)}>Cancelar</Button>
                    <Button 
                      className="flex-1 bg-gradient-to-r from-lime-500 to-green-500"
                      onClick={() => createMutation.mutate({ revistaId, titulo, descricao, status: status as any })}
                      disabled={!titulo || !descricao || createMutation.isPending}
                    >
                      {createMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                      Adicionar
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
        
        {isLoading ? (
          <div className="text-center py-8"><Loader2 className="w-6 h-6 animate-spin mx-auto text-lime-500" /></div>
        ) : melhorias && melhorias.length > 0 ? (
          <div className="grid grid-cols-2 gap-4">
            {melhorias.map((item: any) => (
              <div key={item.id} className="bg-white/60 rounded-xl p-4 border border-lime-100 hover:shadow-md transition-all">
                {item.imagens?.[0]?.imagemUrl && (
                  <div className="aspect-video rounded-lg overflow-hidden mb-3">
                    <img src={item.imagens[0].imagemUrl} alt="" className="w-full h-full object-cover" />
                  </div>
                )}
                <div className="flex items-center gap-2 mb-2">
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    item.status === 'concluida' ? 'bg-green-100 text-green-700' :
                    item.status === 'em_andamento' ? 'bg-blue-100 text-blue-700' :
                    'bg-slate-100 text-slate-700'
                  }`}>{item.status}</span>
                </div>
                <h4 className="font-medium text-slate-800">{item.titulo}</h4>
                <p className="text-sm text-slate-500 mt-1 line-clamp-2">{item.descricao}</p>
                <Button variant="ghost" size="sm" className="w-full mt-2 text-red-500 hover:bg-red-50" onClick={() => deleteMutation.mutate({ id: item.id })}>
                  <Trash2 className="w-3 h-3 mr-1" /> Remover
                </Button>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-white/40 rounded-xl border border-dashed border-lime-200">
            <div className="p-3 bg-lime-100 rounded-full w-fit mx-auto mb-3">
              <Building2 className="w-6 h-6 text-lime-500" />
            </div>
            <p className="font-medium text-slate-700">Nenhuma melhoria</p>
            <p className="text-sm text-slate-500 mt-1">Adicione projetos de melhoria</p>
          </div>
        )}
      </div>
    </div>
  );
}

// ==================== AQUISIÇÕES ====================
export function AquisicoesSection({ revistaId, condominioId, hiddenSections, toggleSectionVisibility, showForm, setShowForm }: SectionProps) {
  const [titulo, setTitulo] = useState("");
  const [descricao, setDescricao] = useState("");
  const [imagens, setImagens] = useState<string[]>([]);
  
  const utils = trpc.useUtils();
  const { data: aquisicoes, isLoading } = trpc.aquisicao.list.useQuery({ revistaId }, { enabled: revistaId > 0 });
  
  const createMutation = trpc.aquisicao.create.useMutation({
    onSuccess: () => {
      toast.success("Aquisição adicionada!");
      utils.aquisicao.list.invalidate({ revistaId });
      setTitulo("");
      setDescricao("");
      setImagens([]);
      setShowForm(false);
    },
    onError: (error) => toast.error("Erro: " + error.message),
  });

  const deleteMutation = trpc.aquisicao.delete.useMutation({
    onSuccess: () => {
      toast.success("Aquisição removida!");
      utils.aquisicao.list.invalidate({ revistaId });
    },
  });

  if (hiddenSections.has("aquisicoes")) return null;

  return (
    <div id="aquisicoes-section" className="relative overflow-hidden bg-gradient-to-br from-fuchsia-50 via-pink-50 to-rose-50 rounded-2xl border border-fuchsia-100 shadow-sm hover:shadow-lg transition-all duration-300">
      <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-fuchsia-400 via-pink-500 to-rose-500" />
      <div className="absolute -right-12 -top-12 w-40 h-40 bg-fuchsia-200/20 rounded-full blur-3xl" />
      
      <div className="relative p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-gradient-to-br from-fuchsia-500 to-pink-500 rounded-xl shadow-lg shadow-fuchsia-500/30">
              <Package className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-800">Aquisições</h3>
              <p className="text-sm text-slate-500">Novos equipamentos e bens</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={() => toggleSectionVisibility("aquisicoes")} className="text-slate-500 hover:text-red-500 hover:bg-red-50">
              <EyeOff className="w-4 h-4 mr-1" />
              Ocultar
            </Button>
            <Dialog open={showForm} onOpenChange={setShowForm}>
              <DialogTrigger asChild>
                <Button size="sm" className="bg-gradient-to-r from-fuchsia-500 to-pink-500 hover:from-fuchsia-600 hover:to-pink-600 text-white shadow-md shadow-fuchsia-500/25">
                  <Plus className="w-4 h-4 mr-2" />
                  Nova Aquisição
                </Button>
              </DialogTrigger>
              <DialogContent className="w-[95vw] max-w-lg max-h-[90vh] overflow-hidden p-0">
                <div className="bg-gradient-to-r from-fuchsia-500 to-pink-500 px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
                      <Package className="w-5 h-5 text-white" />
                    </div>
                    <h3 className="text-lg font-semibold text-white">Nova Aquisição</h3>
                  </div>
                </div>
                <div className="p-6 overflow-y-auto max-h-[70vh] space-y-4">
                  <div>
                    <Label>Título *</Label>
                    <Input value={titulo} onChange={(e) => setTitulo(e.target.value)} placeholder="Ex: Novo Gerador" />
                  </div>
                  <div>
                    <Label>Descrição *</Label>
                    <Textarea value={descricao} onChange={(e) => setDescricao(e.target.value)} placeholder="Descreva a aquisição..." rows={4} />
                  </div>
                  <div>
                    <Label>Imagens</Label>
                    <div className="grid grid-cols-3 gap-2 mt-2">
                      {imagens.map((img, index) => (
                        <div key={index} className="relative aspect-square rounded-lg overflow-hidden border">
                          <img src={img} alt="" className="w-full h-full object-cover" />
                          <button onClick={() => setImagens(imagens.filter((_, i) => i !== index))} className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full hover:bg-red-600">
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                      <ImageUpload onChange={(url) => url && setImagens([...imagens, url])} className="aspect-square" />
                    </div>
                  </div>
                  <div className="flex gap-2 pt-4">
                    <Button variant="outline" className="flex-1" onClick={() => setShowForm(false)}>Cancelar</Button>
                    <Button 
                      className="flex-1 bg-gradient-to-r from-fuchsia-500 to-pink-500"
                      onClick={() => createMutation.mutate({ revistaId, titulo, descricao })}
                      disabled={!titulo || !descricao || createMutation.isPending}
                    >
                      {createMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                      Adicionar
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
        
        {isLoading ? (
          <div className="text-center py-8"><Loader2 className="w-6 h-6 animate-spin mx-auto text-fuchsia-500" /></div>
        ) : aquisicoes && aquisicoes.length > 0 ? (
          <div className="grid grid-cols-2 gap-4">
            {aquisicoes.map((item: any) => (
              <div key={item.id} className="bg-white/60 rounded-xl p-4 border border-fuchsia-100 hover:shadow-md transition-all">
                {item.imagens?.[0]?.imagemUrl && (
                  <div className="aspect-video rounded-lg overflow-hidden mb-3">
                    <img src={item.imagens[0].imagemUrl} alt="" className="w-full h-full object-cover" />
                  </div>
                )}
                <h4 className="font-medium text-slate-800">{item.titulo}</h4>
                <p className="text-sm text-slate-500 mt-1 line-clamp-2">{item.descricao}</p>
                <Button variant="ghost" size="sm" className="w-full mt-2 text-red-500 hover:bg-red-50" onClick={() => deleteMutation.mutate({ id: item.id })}>
                  <Trash2 className="w-3 h-3 mr-1" /> Remover
                </Button>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-white/40 rounded-xl border border-dashed border-fuchsia-200">
            <div className="p-3 bg-fuchsia-100 rounded-full w-fit mx-auto mb-3">
              <Package className="w-6 h-6 text-fuchsia-500" />
            </div>
            <p className="font-medium text-slate-700">Nenhuma aquisição</p>
            <p className="text-sm text-slate-500 mt-1">Adicione novas aquisições</p>
          </div>
        )}
      </div>
    </div>
  );
}

// ==================== PUBLICIDADE ====================
export function PublicidadeSection({ revistaId, condominioId, hiddenSections, toggleSectionVisibility, showForm, setShowForm }: SectionProps) {
  const [titulo, setTitulo] = useState("");
  const [descricao, setDescricao] = useState("");
  const [empresa, setEmpresa] = useState("");
  const [telefone, setTelefone] = useState("");
  const [imagemUrl, setImagemUrl] = useState("");
  
  const utils = trpc.useUtils();
  const { data: publicidades, isLoading } = trpc.publicidade.list.useQuery({ condominioId }, { enabled: condominioId > 0 });
  
  const createMutation = trpc.publicidade.create.useMutation({
    onSuccess: () => {
      toast.success("Publicidade adicionada!");
      utils.publicidade.list.invalidate({ condominioId });
      setTitulo("");
      setDescricao("");
      setEmpresa("");
      setTelefone("");
      setImagemUrl("");
      setShowForm(false);
    },
    onError: (error) => toast.error("Erro: " + error.message),
  });

  const deleteMutation = trpc.publicidade.delete.useMutation({
    onSuccess: () => {
      toast.success("Publicidade removida!");
      utils.publicidade.list.invalidate({ condominioId });
    },
  });

  if (hiddenSections.has("publicidade")) return null;

  return (
    <div id="publicidade-section" className="relative overflow-hidden bg-gradient-to-br from-rose-50 via-red-50 to-orange-50 rounded-2xl border border-rose-100 shadow-sm hover:shadow-lg transition-all duration-300">
      <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-rose-400 via-red-500 to-orange-500" />
      <div className="absolute -right-12 -top-12 w-40 h-40 bg-rose-200/20 rounded-full blur-3xl" />
      
      <div className="relative p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-gradient-to-br from-rose-500 to-red-500 rounded-xl shadow-lg shadow-rose-500/30">
              <Megaphone className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-800">Publicidade</h3>
              <p className="text-sm text-slate-500">Anúncios de parceiros</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={() => toggleSectionVisibility("publicidade")} className="text-slate-500 hover:text-red-500 hover:bg-red-50">
              <EyeOff className="w-4 h-4 mr-1" />
              Ocultar
            </Button>
            <Dialog open={showForm} onOpenChange={setShowForm}>
              <DialogTrigger asChild>
                <Button size="sm" className="bg-gradient-to-r from-rose-500 to-red-500 hover:from-rose-600 hover:to-red-600 text-white shadow-md shadow-rose-500/25">
                  <Plus className="w-4 h-4 mr-2" />
                  Novo Anúncio
                </Button>
              </DialogTrigger>
              <DialogContent className="w-[95vw] max-w-lg max-h-[90vh] overflow-hidden p-0">
                <div className="bg-gradient-to-r from-rose-500 to-red-500 px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
                      <Megaphone className="w-5 h-5 text-white" />
                    </div>
                    <h3 className="text-lg font-semibold text-white">Novo Anúncio</h3>
                  </div>
                </div>
                <div className="p-6 overflow-y-auto max-h-[70vh] space-y-4">
                  <div>
                    <Label>Empresa *</Label>
                    <Input value={empresa} onChange={(e) => setEmpresa(e.target.value)} placeholder="Nome da empresa" />
                  </div>
                  <div>
                    <Label>Título do Anúncio *</Label>
                    <Input value={titulo} onChange={(e) => setTitulo(e.target.value)} placeholder="Ex: 10% de desconto para equipa" />
                  </div>
                  <div>
                    <Label>Telefone</Label>
                    <Input value={telefone} onChange={(e) => setTelefone(e.target.value)} placeholder="(11) 99999-9999" />
                  </div>
                  <div>
                    <Label>Descrição</Label>
                    <Textarea value={descricao} onChange={(e) => setDescricao(e.target.value)} placeholder="Detalhes do anúncio..." rows={3} />
                  </div>
                  <div>
                    <Label>Imagem do Anúncio</Label>
                    {imagemUrl ? (
                      <div className="relative aspect-video rounded-lg overflow-hidden border mt-2">
                        <img src={imagemUrl} alt="" className="w-full h-full object-cover" />
                        <button onClick={() => setImagemUrl("")} className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600">
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <ImageUpload onChange={(url) => setImagemUrl(url || "")} className="aspect-video mt-2" />
                    )}
                  </div>
                  <div className="flex gap-2 pt-4">
                    <Button variant="outline" className="flex-1" onClick={() => setShowForm(false)}>Cancelar</Button>
                    <Button 
                      className="flex-1 bg-gradient-to-r from-rose-500 to-red-500"
                      onClick={() => createMutation.mutate({ condominioId, anunciante: empresa, titulo, descricao, telefone, imagemUrl })}
                      disabled={!titulo || !empresa || createMutation.isPending}
                    >
                      {createMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                      Adicionar
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
        
        {isLoading ? (
          <div className="text-center py-8"><Loader2 className="w-6 h-6 animate-spin mx-auto text-rose-500" /></div>
        ) : publicidades && publicidades.length > 0 ? (
          <div className="grid grid-cols-2 gap-4">
            {publicidades.map((item: any) => (
              <div key={item.id} className="bg-white/60 rounded-xl p-4 border border-rose-100 hover:shadow-md transition-all">
                {item.imagemUrl && (
                  <div className="aspect-video rounded-lg overflow-hidden mb-3">
                    <img src={item.imagemUrl} alt="" className="w-full h-full object-cover" />
                  </div>
                )}
                <p className="text-xs text-rose-500 font-medium">{item.empresa}</p>
                <h4 className="font-medium text-slate-800">{item.titulo}</h4>
                {item.telefone && <p className="text-sm text-slate-500">{item.telefone}</p>}
                <Button variant="ghost" size="sm" className="w-full mt-2 text-red-500 hover:bg-red-50" onClick={() => deleteMutation.mutate({ id: item.id })}>
                  <Trash2 className="w-3 h-3 mr-1" /> Remover
                </Button>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-white/40 rounded-xl border border-dashed border-rose-200">
            <div className="p-3 bg-rose-100 rounded-full w-fit mx-auto mb-3">
              <Megaphone className="w-6 h-6 text-rose-500" />
            </div>
            <p className="font-medium text-slate-700">Nenhum anúncio</p>
            <p className="text-sm text-slate-500 mt-1">Adicione anúncios de parceiros</p>
          </div>
        )}
      </div>
    </div>
  );
}

// ==================== CADASTRE-SE PARA RECEBER ====================
export function CadastroSection({ revistaId, condominioId, hiddenSections, toggleSectionVisibility }: Omit<SectionProps, 'showForm' | 'setShowForm'>) {
  const utils = trpc.useUtils();
  const { data: inscricoes, isLoading } = trpc.inscricaoRevista.list.useQuery({ condominioId }, { enabled: condominioId > 0 });
  
  const ativarMutation = trpc.inscricaoRevista.ativar.useMutation({
    onSuccess: () => {
      toast.success("Inscrição ativada!");
      utils.inscricaoRevista.list.invalidate({ condominioId });
    },
  });

  const deleteMutation = trpc.inscricaoRevista.delete.useMutation({
    onSuccess: () => {
      toast.success("Inscrição removida!");
      utils.inscricaoRevista.list.invalidate({ condominioId });
    },
  });

  if (hiddenSections.has("cadastro")) return null;

  return (
    <div id="cadastro-section" className="relative overflow-hidden bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 rounded-2xl border border-green-100 shadow-sm hover:shadow-lg transition-all duration-300">
      <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-green-400 via-emerald-500 to-teal-500" />
      <div className="absolute -right-12 -top-12 w-40 h-40 bg-green-200/20 rounded-full blur-3xl" />
      
      <div className="relative p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl shadow-lg shadow-green-500/30">
              <Send className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-800">Cadastre-se para Receber</h3>
              <p className="text-sm text-slate-500">Inscrições de moradores</p>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={() => toggleSectionVisibility("cadastro")} className="text-slate-500 hover:text-red-500 hover:bg-red-50">
            <EyeOff className="w-4 h-4 mr-1" />
            Ocultar
          </Button>
        </div>
        
        {isLoading ? (
          <div className="text-center py-8"><Loader2 className="w-6 h-6 animate-spin mx-auto text-green-500" /></div>
        ) : inscricoes && inscricoes.length > 0 ? (
          <div className="space-y-3">
            {inscricoes.map((item: any) => (
              <div key={item.id} className="bg-white/60 rounded-xl p-4 border border-green-100 hover:shadow-md transition-all">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-medium text-slate-800">{item.nome}</h4>
                    <p className="text-sm text-slate-500">{item.email}</p>
                    {item.unidade && <p className="text-sm text-slate-500">Unidade: {item.unidade}</p>}
                    {item.whatsapp && <p className="text-sm text-slate-500">WhatsApp: {item.whatsapp}</p>}
                    <span className={`inline-block mt-2 text-xs px-2 py-1 rounded-full ${
                      item.status === 'ativo' ? 'bg-green-100 text-green-700' :
                      item.status === 'pendente' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-slate-100 text-slate-700'
                    }`}>{item.status}</span>
                  </div>
                  <div className="flex gap-2">
                    {item.status === 'pendente' && (
                      <Button variant="outline" size="sm" className="text-green-600 hover:bg-green-50" onClick={() => ativarMutation.mutate({ id: item.id })}>
                        Ativar
                      </Button>
                    )}
                    <Button variant="ghost" size="sm" className="text-red-500 hover:bg-red-50" onClick={() => deleteMutation.mutate({ id: item.id })}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-white/40 rounded-xl border border-dashed border-green-200">
            <div className="p-3 bg-green-100 rounded-full w-fit mx-auto mb-3">
              <Send className="w-6 h-6 text-green-500" />
            </div>
            <p className="font-medium text-slate-700">Nenhuma inscrição</p>
            <p className="text-sm text-slate-500 mt-1">Os moradores podem se inscrever pela revista</p>
          </div>
        )}
      </div>
    </div>
  );
}
