"use client"

import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Settings, Bell, Shield, Database, Mail, Save } from "lucide-react"

export default function ConfiguracionPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div>
          <h1 className="text-3xl font-bold text-foreground">Configuración</h1>
          <p className="text-muted-foreground">Administra las preferencias del sistema</p>
        </div>

        <div className="grid gap-6">
          {/* General Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5 text-primary" />
                Configuración General
              </CardTitle>
              <CardDescription>Configuración básica del sistema</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label htmlFor="orgName">Nombre de la Organización</Label>
                  <Input id="orgName" defaultValue="Teletón Chile" className="mt-2" />
                </div>
                <div>
                  <Label htmlFor="adminEmail">Email de Administrador</Label>
                  <Input id="adminEmail" type="email" defaultValue="admin@teleton.cl" className="mt-2" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Notifications */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5 text-primary" />
                Notificaciones
              </CardTitle>
              <CardDescription>Configura las notificaciones del sistema</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Notificaciones por Email</p>
                  <p className="text-sm text-muted-foreground">Recibir alertas importantes por correo</p>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Alertas de Errores</p>
                  <p className="text-sm text-muted-foreground">Notificar cuando ocurran errores en el sistema</p>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Resumen Diario</p>
                  <p className="text-sm text-muted-foreground">Recibir un resumen diario de actividades</p>
                </div>
                <Switch />
              </div>
            </CardContent>
          </Card>

          {/* Email Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="h-5 w-5 text-primary" />
                Configuración de Email
              </CardTitle>
              <CardDescription>Configuración para el envío de comunicaciones</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label htmlFor="smtpServer">Servidor SMTP</Label>
                  <Input id="smtpServer" defaultValue="smtp.teleton.cl" className="mt-2" />
                </div>
                <div>
                  <Label htmlFor="smtpPort">Puerto SMTP</Label>
                  <Input id="smtpPort" defaultValue="587" className="mt-2" />
                </div>
                <div>
                  <Label htmlFor="senderName">Nombre del Remitente</Label>
                  <Input id="senderName" defaultValue="Teletón Chile" className="mt-2" />
                </div>
                <div>
                  <Label htmlFor="senderEmail">Email del Remitente</Label>
                  <Input id="senderEmail" type="email" defaultValue="voluntarios@teleton.cl" className="mt-2" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Security */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-primary" />
                Seguridad
              </CardTitle>
              <CardDescription>Configuración de seguridad y acceso</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Autenticación de Dos Factores</p>
                  <p className="text-sm text-muted-foreground">Requerir 2FA para todos los administradores</p>
                </div>
                <Switch />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Registro de Sesiones</p>
                  <p className="text-sm text-muted-foreground">Guardar registro de todas las sesiones</p>
                </div>
                <Switch defaultChecked />
              </div>
            </CardContent>
          </Card>

          {/* Database */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5 text-primary" />
                Base de Datos
              </CardTitle>
              <CardDescription>Estado y mantenimiento de datos</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-lg bg-muted p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Última Sincronización</p>
                    <p className="text-sm text-muted-foreground">28 de Noviembre, 2024 - 14:32</p>
                  </div>
                  <Button variant="outline" size="sm">
                    Sincronizar Ahora
                  </Button>
                </div>
              </div>
              <div className="rounded-lg bg-muted p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Respaldo Automático</p>
                    <p className="text-sm text-muted-foreground">Activado - Cada 24 horas</p>
                  </div>
                  <Switch defaultChecked />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Save Button */}
          <div className="flex justify-end">
            <Button className="bg-primary hover:bg-primary/90">
              <Save className="mr-2 h-4 w-4" />
              Guardar Cambios
            </Button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
