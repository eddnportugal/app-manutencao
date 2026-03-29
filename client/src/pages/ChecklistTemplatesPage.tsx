import { useEffect } from "react";
import { useLocation, Link } from "wouter";
import { trpc } from "@/lib/trpc";
import { ChecklistTemplates } from "@/components/ChecklistTemplates";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/sonner";
import { ArrowLeft } from "lucide-react";

export default function ChecklistTemplatesPage() {
  const [, setLocation] = useLocation();
  const { data: user, isLoading: userLoading } = trpc.auth.me.useQuery();
  const { data: condominios } = trpc.condominio.list.useQuery();
  const condominioId = condominios?.[0]?.id || 0;

  useEffect(() => {
    if (!userLoading && !user) {
      setLocation("/");
    }
  }, [user, userLoading, setLocation]);

  if (userLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500" />
      </div>
    );
  }

  if (!user) return null;

  const handleSelectTemplate = (template: any) => {
    toast.info(`Template "${template.nome}" selecionado. Use-o ao criar um novo checklist.`);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container max-w-6xl py-6">
        <div className="mb-6">
          <Link href="/dashboard">
            <Button variant="ghost" className="gap-2 mb-4">
              <ArrowLeft className="w-4 h-4" />
              Voltar ao Dashboard
            </Button>
          </Link>
        </div>
        <ChecklistTemplates 
          condominioId={condominioId} 
          onSelectTemplate={handleSelectTemplate}
        />
      </div>
    </div>
  );
}
