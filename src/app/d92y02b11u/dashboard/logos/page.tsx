
"use client";

import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { UploadCloud, Link as LinkIcon, Image as ImageIcon } from "lucide-react";
import Image from 'next/image';
import appConfig from '@/app/lib/app-config.json';
import { useToast } from '@/hooks/use-toast';

export default function LogosPage() {
  const { toast } = useToast();
  const [imageUrl, setImageUrl] = useState(appConfig.authBackgroundImageUrl);
  const [newImageUrl, setNewImageUrl] = useState('');

  const handleUpdateByUrl = () => {
    if (newImageUrl.trim()) {
      setImageUrl(newImageUrl);
      // Here you would typically call a server action to update the config file
      toast({
        title: "Imagen actualizada",
        description: "La portada se ha actualizado desde la URL.",
      });
    }
  };

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Configuración de Logos y Portadas</h1>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><ImageIcon/> Portada de Autenticación</CardTitle>
          <CardDescription>
            Esta imagen se mostrará como fondo en las páginas de inicio de sesión, registro y olvido de contraseña.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
                <h3 className="font-semibold mb-4">Vista Previa Actual</h3>
                <div className="relative aspect-video w-full overflow-hidden rounded-lg border">
                    <Image
                        src={imageUrl}
                        alt="Portada de autenticación"
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 100vw, 50vw"
                    />
                </div>
            </div>
            <div className="space-y-6">
                <div>
                     <h3 className="font-semibold mb-2">Subir Nueva Imagen</h3>
                     <div className="flex flex-col items-center justify-center w-full">
                        <Label htmlFor="picture" className="flex flex-col items-center justify-center w-full h-32 border-2 border-border border-dashed rounded-lg cursor-pointer bg-muted/50 hover:bg-muted">
                            <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                <UploadCloud className="w-8 h-8 mb-2 text-muted-foreground" />
                                <p className="mb-2 text-sm text-muted-foreground">Haz clic para subir</p>
                                <p className="text-xs text-muted-foreground">PNG, JPG, WEBP (MAX. 5MB)</p>
                            </div>
                            <Input id="picture" type="file" className="hidden" />
                        </Label>
                    </div> 
                </div>
                <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                        <span className="w-full border-t" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-card px-2 text-muted-foreground">O</span>
                    </div>
                </div>
                <div>
                    <h3 className="font-semibold mb-2">Actualizar desde URL</h3>
                     <div className="flex w-full items-center space-x-2">
                        <div className="relative flex-grow">
                             <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                            <Input 
                                type="url" 
                                placeholder="https://example.com/image.png" 
                                className="pl-10" 
                                value={newImageUrl}
                                onChange={(e) => setNewImageUrl(e.target.value)}
                            />
                        </div>
                        <Button type="button" onClick={handleUpdateByUrl}>Actualizar</Button>
                    </div>
                </div>
            </div>
        </CardContent>
         <CardFooter>
            <p className="text-xs text-muted-foreground">
                Los cambios se guardarán y reflejarán automáticamente en las páginas de autenticación.
            </p>
        </CardFooter>
      </Card>
    </div>
  );
}
