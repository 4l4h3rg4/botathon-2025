"use client"

import { useState } from "react"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Users, Eye, Send, Sparkles, MessageSquare, CheckCircle } from "lucide-react"
import { volunteers, regions, campaigns } from "@/lib/mock-data"

const messageTemplates = [
  {
    id: "welcome",
    name: "Bienvenida",
    subject: "¡Bienvenido/a a Teletón!",
    content: `Estimado/a {{nombre}},

¡Bienvenido/a a la familia Teletón! Estamos muy contentos de contar con tu apoyo como voluntario/a.

Tu compromiso es fundamental para hacer realidad la misión de Teletón. Pronto recibirás más información sobre las próximas actividades y cómo puedes participar.

¡Gracias por ser parte de este gran equipo!

Equipo Teletón`,
  },
  {
    id: "campaign",
    name: "Convocatoria Campaña",
    subject: "Teletón {{campaña}} - ¡Te necesitamos!",
    content: `Estimado/a {{nombre}},

Se acerca la campaña {{campaña}} y queremos invitarte a participar activamente.

Tu región: {{region}}
Disponibilidad registrada: {{disponibilidad}}

Confirma tu participación respondiendo este correo o ingresando al portal de voluntarios.

¡Juntos hacemos la diferencia!

Equipo Teletón`,
  },
  {
    id: "reminder",
    name: "Recordatorio",
    subject: "Recordatorio - Actividad Teletón",
    content: `Estimado/a {{nombre}},

Te recordamos que tienes una actividad programada próximamente.

No olvides revisar los detalles en tu portal de voluntarios.

¡Gracias por tu compromiso!

Equipo Teletón`,
  },
  {
    id: "thanks",
    name: "Agradecimiento",
    subject: "¡Gracias por tu apoyo!",
    content: `Estimado/a {{nombre}},

Queremos expresarte nuestro más sincero agradecimiento por tu participación en {{campaña}}.

Gracias a voluntarios como tú, miles de niños y jóvenes en Chile pueden acceder a rehabilitación de calidad.

Tu dedicación hace posible que sigamos cumpliendo nuestra misión.

Con cariño,
Equipo Teletón`,
  },
]

export default function ComunicacionesPage() {
  const [selectedTemplate, setSelectedTemplate] = useState(messageTemplates[0])
  const [customSubject, setCustomSubject] = useState(messageTemplates[0].subject)
  const [customContent, setCustomContent] = useState(messageTemplates[0].content)
  const [selectedRegion, setSelectedRegion] = useState<string>("")
  const [selectedCampaign, setSelectedCampaign] = useState<string>("")
  const [showPreview, setShowPreview] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const [previewVolunteer, setPreviewVolunteer] = useState(volunteers[0])

  // Filter volunteers based on selection
  const filteredVolunteers = volunteers.filter((v) => {
    const matchesRegion = !selectedRegion || v.region === selectedRegion
    const matchesCampaign = !selectedCampaign || v.campaigns.includes(selectedCampaign)
    return matchesRegion && matchesCampaign
  })

  const handleTemplateChange = (templateId: string) => {
    const template = messageTemplates.find((t) => t.id === templateId)
    if (template) {
      setSelectedTemplate(template)
      setCustomSubject(template.subject)
      setCustomContent(template.content)
    }
  }

  const replaceVariables = (text: string, volunteer: (typeof volunteers)[0]) => {
    return text
      .replace(/{{nombre}}/g, volunteer.name)
      .replace(/{{email}}/g, volunteer.email)
      .replace(/{{region}}/g, volunteer.region)
      .replace(/{{disponibilidad}}/g, volunteer.availability)
      .replace(/{{campaña}}/g, selectedCampaign || "Teletón 2024")
  }

  const handleGenerateCommunication = () => {
    // Simulate sending
    setShowSuccess(true)
    setTimeout(() => {
      setShowSuccess(false)
    }, 3000)
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div>
          <h1 className="text-3xl font-bold text-foreground">Comunicaciones</h1>
          <p className="text-muted-foreground">Crea y envía comunicaciones masivas a los voluntarios</p>
        </div>

        {/* Success Toast */}
        {showSuccess && (
          <div className="fixed right-4 top-20 z-50 flex items-center gap-2 rounded-lg bg-green-500 px-4 py-3 text-white shadow-lg">
            <CheckCircle className="h-5 w-5" />
            <span>Comunicación generada exitosamente</span>
          </div>
        )}

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Message Editor */}
          <div className="space-y-6 lg:col-span-2">
            {/* Template Selection */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5 text-primary" />
                  Plantilla de Mensaje
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="template">Seleccionar Plantilla</Label>
                  <Select value={selectedTemplate.id} onValueChange={handleTemplateChange}>
                    <SelectTrigger id="template" className="mt-2">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {messageTemplates.map((template) => (
                        <SelectItem key={template.id} value={template.id}>
                          {template.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="subject">Asunto</Label>
                  <Input
                    id="subject"
                    value={customSubject}
                    onChange={(e) => setCustomSubject(e.target.value)}
                    className="mt-2"
                  />
                </div>

                <div>
                  <Label htmlFor="content">Contenido del Mensaje</Label>
                  <Textarea
                    id="content"
                    value={customContent}
                    onChange={(e) => setCustomContent(e.target.value)}
                    className="mt-2 min-h-[250px] font-mono text-sm"
                  />
                </div>

                <div className="rounded-lg bg-muted p-4">
                  <p className="text-sm font-medium text-foreground">Variables Disponibles:</p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {["{{nombre}}", "{{email}}", "{{region}}", "{{disponibilidad}}", "{{campaña}}"].map((variable) => (
                      <Badge key={variable} variant="outline" className="font-mono">
                        {variable}
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Preview Section */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Eye className="h-5 w-5 text-primary" />
                    Vista Previa
                  </CardTitle>
                  <Select
                    value={previewVolunteer.id}
                    onValueChange={(id) => {
                      const volunteer = volunteers.find((v) => v.id === id)
                      if (volunteer) setPreviewVolunteer(volunteer)
                    }}
                  >
                    <SelectTrigger className="w-[200px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {volunteers.map((v) => (
                        <SelectItem key={v.id} value={v.id}>
                          {v.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardHeader>
              <CardContent>
                <div className="rounded-lg border border-border bg-card p-6">
                  <div className="mb-4 border-b border-border pb-4">
                    <p className="text-sm text-muted-foreground">Para:</p>
                    <p className="font-medium">{previewVolunteer.email}</p>
                  </div>
                  <div className="mb-4 border-b border-border pb-4">
                    <p className="text-sm text-muted-foreground">Asunto:</p>
                    <p className="font-medium">{replaceVariables(customSubject, previewVolunteer)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Mensaje:</p>
                    <pre className="mt-2 whitespace-pre-wrap font-sans text-sm text-foreground">
                      {replaceVariables(customContent, previewVolunteer)}
                    </pre>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recipients Section */}
          <div className="space-y-6">
            {/* Filters */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-primary" />
                  Destinatarios
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="filterRegion">Filtrar por Región</Label>
                  <Select value={selectedRegion} onValueChange={setSelectedRegion}>
                    <SelectTrigger id="filterRegion" className="mt-2">
                      <SelectValue placeholder="Todas las regiones" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todas las regiones</SelectItem>
                      {regions.map((region) => (
                        <SelectItem key={region} value={region}>
                          {region}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="filterCampaign">Filtrar por Campaña</Label>
                  <Select value={selectedCampaign} onValueChange={setSelectedCampaign}>
                    <SelectTrigger id="filterCampaign" className="mt-2">
                      <SelectValue placeholder="Todas las campañas" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todas las campañas</SelectItem>
                      {campaigns.map((campaign) => (
                        <SelectItem key={campaign} value={campaign}>
                          {campaign}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="rounded-lg bg-primary/5 p-4">
                  <p className="text-2xl font-bold text-primary">{filteredVolunteers.length}</p>
                  <p className="text-sm text-muted-foreground">voluntarios seleccionados</p>
                </div>
              </CardContent>
            </Card>

            {/* Recipients List */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Lista de Destinatarios</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="max-h-[300px] space-y-2 overflow-y-auto">
                  {filteredVolunteers.map((volunteer) => (
                    <div key={volunteer.id} className="flex items-center gap-3 rounded-lg border border-border p-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-xs font-medium text-primary">
                        {volunteer.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="truncate text-sm font-medium">{volunteer.name}</p>
                        <p className="truncate text-xs text-muted-foreground">{volunteer.email}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Actions */}
            <div className="space-y-3">
              <Button
                className="w-full bg-primary hover:bg-primary/90"
                onClick={handleGenerateCommunication}
                disabled={filteredVolunteers.length === 0}
              >
                <Sparkles className="mr-2 h-4 w-4" />
                Generar Comunicación Simulada
              </Button>
              <Button variant="outline" className="w-full bg-transparent" onClick={() => setShowPreview(true)}>
                <Eye className="mr-2 h-4 w-4" />
                Ver Vista Previa Completa
              </Button>
            </div>
          </div>
        </div>

        {/* Full Preview Dialog */}
        <Dialog open={showPreview} onOpenChange={setShowPreview}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Vista Previa del Mensaje</DialogTitle>
              <DialogDescription>Así se verá el mensaje para cada voluntario</DialogDescription>
            </DialogHeader>
            <div className="max-h-[60vh] overflow-y-auto rounded-lg border border-border bg-muted/30 p-6">
              <div className="mb-4">
                <Badge className="bg-primary">{filteredVolunteers.length} destinatarios</Badge>
              </div>
              <div className="mb-4 border-b border-border pb-4">
                <p className="text-sm font-medium text-muted-foreground">Asunto:</p>
                <p className="text-lg font-semibold">{replaceVariables(customSubject, previewVolunteer)}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Contenido:</p>
                <pre className="mt-2 whitespace-pre-wrap font-sans text-foreground">
                  {replaceVariables(customContent, previewVolunteer)}
                </pre>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowPreview(false)}>
                Cerrar
              </Button>
              <Button
                className="bg-primary hover:bg-primary/90"
                onClick={() => {
                  setShowPreview(false)
                  handleGenerateCommunication()
                }}
              >
                <Send className="mr-2 h-4 w-4" />
                Enviar Comunicación
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  )
}
