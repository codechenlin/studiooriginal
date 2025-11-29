"use client";

export const dynamic = "force-dynamic";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { History, PlusCircle, Search, Tag, Calendar as CalendarIcon, FolderSearch } from "lucide-react";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { HelpButton } from "@/components/dashboard/help-button";
import { cn } from "@/lib/utils";

const campaigns = [
  // This is mock data. In a real app, you would fetch this from your backend.
  // {
  //   name: "Lanzamiento de Verano",
  //   status: "Enviado",
  //   subscribers: 5678,
  //   openRate: "25.4%",
  //   date: "2024-07-15",
  //   tags: ["Ventas", "Promoción"]
  // },
];

export default function CampaignsPage() {
  const [date, setDate] = useState<Date | undefined>();

  return (
    <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8 bg-background">
       <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-foreground to-muted-foreground flex items-center gap-2">
            <History className="size-8"/>
            Historial de Campañas
          </h1>
          <p className="text-muted-foreground">Aquí puedes ver, filtrar y gestionar todas tus campañas pasadas.</p>
        </div>
        <div className="flex items-center gap-2">
            <HelpButton />
            <Link href="/dashboard/campaigns/create">
                <Button className="bg-gradient-to-r from-primary to-accent/80 hover:opacity-90 transition-opacity">
                    <PlusCircle className="mr-2" />
                    Crear Nueva Campaña
                </Button>
            </Link>
        </div>
      </div>
      
      <Card className="bg-card/50 backdrop-blur-sm border-border/40 shadow-xl flex-1">
        <CardHeader>
            <CardTitle>Mis Campañas</CardTitle>
            <CardDescription>
                {campaigns.length > 0 
                    ? `Mostrando ${campaigns.length} de ${campaigns.length} campañas.` 
                    : "Aún no has enviado ninguna campaña. ¡Crea una para empezar!"
                }
            </CardDescription>
        </CardHeader>
        <CardContent>
            <div className="flex flex-col md:flex-row gap-4 mb-6">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground"/>
                    <Input placeholder="Buscar por nombre de campaña..." className="pl-10"/>
                </div>
                <Select>
                    <SelectTrigger className="w-full md:w-[220px]">
                        <div className="flex items-center gap-2">
                            <Tag className="size-4 text-muted-foreground"/>
                            <SelectValue placeholder="Filtrar por etiqueta" />
                        </div>
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="ventas">Ventas</SelectItem>
                        <SelectItem value="promocion">Promoción</SelectItem>
                        <SelectItem value="noticias">Noticias</SelectItem>
                        <SelectItem value="blog">Blog</SelectItem>
                    </SelectContent>
                </Select>
                 <div className="group rounded-md p-0.5 bg-transparent hover:bg-gradient-to-r from-[#00CE07] to-[#A6EE00] transition-colors">
                  <Popover>
                      <PopoverTrigger asChild>
                          <Button
                              variant={"outline"}
                              className={cn(
                                "w-full md:w-[280px] justify-start text-left font-normal bg-background dark:bg-background",
                                !date && "text-muted-foreground",
                                "group-hover:bg-transparent dark:group-hover:bg-transparent transition-colors"
                              )}
                          >
                              <CalendarIcon className="mr-2 size-4" />
                              {date ? format(date, "LLL dd, y") : <span>Seleccionar una fecha</span>}
                          </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                              initialFocus
                              mode="single"
                              selected={date}
                              onSelect={setDate}
                              numberOfMonths={1}
                          />
                      </PopoverContent>
                  </Popover>
                </div>
            </div>
            {campaigns.length === 0 ? (
                <div className="text-center py-20 text-muted-foreground flex flex-col items-center justify-center border-2 border-dashed border-border/60 rounded-lg">
                    <FolderSearch className="size-16 mb-4 text-primary/50" />
                    <h3 className="text-xl font-semibold text-foreground">No se encontraron campañas</h3>
                    <p className="mt-2">Parece que aún no has creado ninguna. ¡Es un buen momento para empezar!</p>
                </div>
            ) : (
                <div className="overflow-x-auto">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Nombre</TableHead>
                                <TableHead>Estado</TableHead>
                                <TableHead className="text-right">Suscriptores</TableHead>
                                <TableHead className="text-right">Tasa de Apertura</TableHead>
                                <TableHead>Fecha</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {campaigns.map((campaign, index) => (
                                <TableRow key={index}>
                                    <TableCell className="font-medium flex items-center gap-2">
                                        {campaign.name}
                                        <div className="flex gap-1">
                                            {campaign.tags.map(tag => <Badge key={tag} variant="outline">{tag}</Badge>)}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant={campaign.status === "Enviado" ? "default" : "secondary"}>
                                            {campaign.status}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right">{campaign.subscribers.toLocaleString()}</TableCell>
                                    <TableCell className="text-right">{campaign.openRate}</TableCell>
                                    <TableCell>{campaign.date}</TableCell>
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
