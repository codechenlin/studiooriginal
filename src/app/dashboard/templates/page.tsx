
import { createClient } from '@/lib/supabase/server';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FolderSearch, History, PlusCircle } from "lucide-react";
import Link from "next/link";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

async function getTemplates() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return [];
  }

  const { data, error } = await supabase
    .from('templates')
    .select('id, name, updated_at')
    .eq('user_id', user.id)
    .order('updated_at', { ascending: false });

  if (error) {
    console.error('Error fetching templates:', error);
    return [];
  }
  
  return data;
}

export default async function TemplatesPage() {
  const templates = await getTemplates();

  return (
    <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8 bg-background">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-foreground to-muted-foreground flex items-center gap-2">
            <History className="size-8"/>
            Mis Plantillas
          </h1>
          <p className="text-muted-foreground">Aquí puedes ver, editar y gestionar todas tus plantillas guardadas.</p>
        </div>
        <Link href="/dashboard/templates/create">
            <Button className="bg-gradient-to-r from-primary to-accent/80 hover:opacity-90 transition-opacity">
                <PlusCircle className="mr-2" />
                Crear Nueva Plantilla
            </Button>
        </Link>
      </div>
      
      <Card className="bg-card/50 backdrop-blur-sm border-border/40 shadow-xl flex-1">
        <CardHeader>
            <CardTitle>Plantillas Guardadas</CardTitle>
            <CardDescription>
                {templates.length > 0 
                    ? `Mostrando ${templates.length} plantillas.` 
                    : "Aún no has guardado ninguna plantilla. ¡Crea una para empezar!"
                }
            </CardDescription>
        </CardHeader>
        <CardContent>
            {templates.length === 0 ? (
                <div className="text-center py-20 text-muted-foreground flex flex-col items-center justify-center border-2 border-dashed border-border/60 rounded-lg">
                    <FolderSearch className="size-16 mb-4 text-primary/50" />
                    <h3 className="text-xl font-semibold text-foreground">No se encontraron plantillas</h3>
                    <p className="mt-2">Parece que aún no has creado ninguna. ¡Es un buen momento para empezar!</p>
                </div>
            ) : (
                <div className="overflow-x-auto">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Nombre</TableHead>
                                <TableHead>Última Modificación</TableHead>
                                <TableHead className="text-right">Acciones</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {templates.map((template) => (
                                <TableRow key={template.id}>
                                    <TableCell className="font-medium">
                                        {template.name}
                                    </TableCell>
                                    <TableCell>
                                      {format(new Date(template.updated_at), "d 'de' MMMM, yyyy 'a las' HH:mm", { locale: es })}
                                    </TableCell>
                                    <TableCell className="text-right">
                                       <Button asChild variant="outline" size="sm">
                                          <Link href={`/dashboard/templates/edit/${template.id}`}>
                                            Editar
                                          </Link>
                                       </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            )}
        </CardContent>
      </Card>
    </main>
  );
}
