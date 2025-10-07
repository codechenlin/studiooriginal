
"use client";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Users, Mail } from "lucide-react";
import { useState, useEffect } from "react";

export default function AdminDashboardPage() {
  // Mock data
  const totalUsers = 1234;
  const totalConnectedEmails = 56;
  
  const [formattedUsers, setFormattedUsers] = useState<string | null>(null);

  useEffect(() => {
    // This ensures toLocaleString() is only called on the client side
    // after the component has mounted, preventing hydration errors.
    setFormattedUsers(totalUsers.toLocaleString());
  }, []);


  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Escritorio del Super Administrador</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Usuarios Registrados</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formattedUsers || '...'}</div>
            <p className="text-xs text-muted-foreground">Total de usuarios en la plataforma</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Correos Conectados (SMTP)</CardTitle>
            <Mail className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalConnectedEmails}</div>
             <p className="text-xs text-muted-foreground">Total de servidores SMTP genéricos</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
