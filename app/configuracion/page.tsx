
"use client"

import { useState, useEffect } from "react"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Settings, Bell, Shield, Database, Mail, Save } from "lucide-react"
import { api } from "@/lib/api"

export default function ConfiguracionPage() {
  const [config, setConfig] = useState<any>({
    org_name: "",
    admin_email: "",
    gmail_email: "",
    gmail_token: "",
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const data = await api.config.get()
        setConfig(prev => ({ ...prev, ...data }))
      } catch (error) {
        console.error("Failed to fetch config", error)
      } finally {
        setLoading(false)
      }
    }
    fetchConfig()
  }, [])

  const handleChange = (key: string, value: string) => {
    setConfig(prev => ({ ...prev, [key]: value }))
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      await api.config.update(config)
      alert("Configuración guardada correctamente")
    } catch (error) {
      console.error("Failed to save config", error)
      alert("Error al guardar la configuración")
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex h-full items-center justify-center">
          <p>Cargando configuración...</p>
        </div>
      </DashboardLayout>
    )
  }

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
                  <Input
                    id="orgName"
                    value={config.org_name}
                    onChange={(e) => handleChange("org_name", e.target.value)}
                    className="mt-2"
                  />
                </div>
                <div>
                  <Label htmlFor="adminEmail">Email de Administrador</Label>
                  <Input
                    id="adminEmail"
                    type="email"
                    value={config.admin_email}
                    onChange={(e) => handleChange("admin_email", e.target.value)}
                    className="mt-2"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Email Settings (Gmail API) */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="h-5 w-5 text-primary" />
                Configuración de Gmail API
              </CardTitle>
              <CardDescription>Configura el envío de correos mediante Gmail API</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label htmlFor="gmailEmail">Gmail Email</Label>
                  <Input
                    id="gmailEmail"
                    type="email"
                    value={config.gmail_email}
                    onChange={(e) => handleChange("gmail_email", e.target.value)}
                    placeholder="ejemplo@gmail.com"
                    className="mt-2"
                  />
                </div>
                <div>
                  <Label htmlFor="gmailToken">Token de Acceso / App Password</Label>
                  <Input
                    id="gmailToken"
                    type="password"
                    value={config.gmail_token}
                    onChange={(e) => handleChange("gmail_token", e.target.value)}
                    placeholder="Token o contraseña de aplicación"
                    className="mt-2"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Usa una "Contraseña de Aplicación" si tienes 2FA activado, o un token OAuth válido.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Save Button */}
          <div className="flex justify-end">
            <Button
              className="bg-primary hover:bg-primary/90"
              onClick={handleSave}
              disabled={saving}
            >
              <Save className="mr-2 h-4 w-4" />
              {saving ? "Guardando..." : "Guardar Cambios"}
            </Button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
