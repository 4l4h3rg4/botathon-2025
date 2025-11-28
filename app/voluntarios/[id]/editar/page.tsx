"use client"

import type React from "react"

import { use, useState } from "react"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Save, X, User } from "lucide-react"
import { volunteers, regions, skills, campaigns, availabilityOptions, volunteerTypes } from "@/lib/mock-data"
import Link from "next/link"
import { useRouter } from "next/navigation"

export default function EditVolunteerPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = use(params)
  const router = useRouter()
  const volunteer = volunteers.find((v) => v.id === id)

  const [formData, setFormData] = useState({
    name: volunteer?.name || "",
    email: volunteer?.email || "",
    phone: volunteer?.phone || "",
    region: volunteer?.region || "",
    city: volunteer?.city || "",
    skills: volunteer?.skills || [],
    campaigns: volunteer?.campaigns || [],
    availability: volunteer?.availability || "",
    volunteerType: volunteer?.volunteerType || "",
    status: volunteer?.status || "",
    notes: volunteer?.notes || "",
  })

  const [saving, setSaving] = useState(false)

  if (!volunteer) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center py-12">
          <User className="h-16 w-16 text-muted-foreground" />
          <h2 className="mt-4 text-xl font-semibold">Voluntario no encontrado</h2>
          <Link href="/voluntarios">
            <Button className="mt-4">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Volver a Voluntarios
            </Button>
          </Link>
        </div>
      </DashboardLayout>
    )
  }

  const addSkill = (skill: string) => {
    if (!formData.skills.includes(skill)) {
      setFormData({ ...formData, skills: [...formData.skills, skill] })
    }
  }

  const removeSkill = (skill: string) => {
    setFormData({
      ...formData,
      skills: formData.skills.filter((s) => s !== skill),
    })
  }

  const addCampaign = (campaign: string) => {
    if (!formData.campaigns.includes(campaign)) {
      setFormData({ ...formData, campaigns: [...formData.campaigns, campaign] })
    }
  }

  const removeCampaign = (campaign: string) => {
    setFormData({
      ...formData,
      campaigns: formData.campaigns.filter((c) => c !== campaign),
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000))
    setSaving(false)
    router.push(`/voluntarios/${id}`)
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Link href={`/voluntarios/${id}`}>
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-foreground">Editar Voluntario</h1>
            <p className="text-muted-foreground">Modifica la información del voluntario</p>
          </div>
        </div>

        {/* Edit Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Personal Info */}
          <Card>
            <CardHeader>
              <CardTitle>Información Personal</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label htmlFor="name">Nombre Completo</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="mt-2"
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="mt-2"
                  />
                </div>
                <div>
                  <Label htmlFor="phone">Teléfono</Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="mt-2"
                  />
                </div>
                <div>
                  <Label htmlFor="status">Estado</Label>
                  <Select
                    value={formData.status}
                    onValueChange={(value) => setFormData({ ...formData, status: value })}
                  >
                    <SelectTrigger id="status" className="mt-2">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Activo">Activo</SelectItem>
                      <SelectItem value="Pendiente">Pendiente</SelectItem>
                      <SelectItem value="Inactivo">Inactivo</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Location */}
          <Card>
            <CardHeader>
              <CardTitle>Ubicación</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label htmlFor="region">Región</Label>
                  <Select
                    value={formData.region}
                    onValueChange={(value) => setFormData({ ...formData, region: value })}
                  >
                    <SelectTrigger id="region" className="mt-2">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {regions.map((region) => (
                        <SelectItem key={region} value={region}>
                          {region}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="city">Ciudad</Label>
                  <Input
                    id="city"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    className="mt-2"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Volunteer Info */}
          <Card>
            <CardHeader>
              <CardTitle>Información de Voluntariado</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label htmlFor="availability">Disponibilidad</Label>
                  <Select
                    value={formData.availability}
                    onValueChange={(value) => setFormData({ ...formData, availability: value })}
                  >
                    <SelectTrigger id="availability" className="mt-2">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {availabilityOptions.map((option) => (
                        <SelectItem key={option} value={option}>
                          {option}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="volunteerType">Tipo de Voluntariado</Label>
                  <Select
                    value={formData.volunteerType}
                    onValueChange={(value) => setFormData({ ...formData, volunteerType: value })}
                  >
                    <SelectTrigger id="volunteerType" className="mt-2">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {volunteerTypes.map((type) => (
                        <SelectItem key={type} value={type}>
                          {type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Skills */}
              <div>
                <Label>Habilidades</Label>
                <Select onValueChange={addSkill}>
                  <SelectTrigger className="mt-2">
                    <SelectValue placeholder="Agregar habilidad" />
                  </SelectTrigger>
                  <SelectContent>
                    {skills
                      .filter((skill) => !formData.skills.includes(skill))
                      .map((skill) => (
                        <SelectItem key={skill} value={skill}>
                          {skill}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
                {formData.skills.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {formData.skills.map((skill) => (
                      <Badge key={skill} variant="secondary" className="gap-1 bg-primary/10 text-primary">
                        {skill}
                        <button type="button" onClick={() => removeSkill(skill)} className="ml-1">
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                )}
              </div>

              {/* Campaigns */}
              <div>
                <Label>Campañas</Label>
                <Select onValueChange={addCampaign}>
                  <SelectTrigger className="mt-2">
                    <SelectValue placeholder="Agregar campaña" />
                  </SelectTrigger>
                  <SelectContent>
                    {campaigns
                      .filter((campaign) => !formData.campaigns.includes(campaign))
                      .map((campaign) => (
                        <SelectItem key={campaign} value={campaign}>
                          {campaign}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
                {formData.campaigns.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {formData.campaigns.map((campaign) => (
                      <Badge key={campaign} variant="secondary" className="gap-1">
                        {campaign}
                        <button type="button" onClick={() => removeCampaign(campaign)} className="ml-1">
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Notes */}
          <Card>
            <CardHeader>
              <CardTitle>Notas</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Agregar notas sobre el voluntario..."
                className="min-h-[100px]"
              />
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex justify-end gap-4">
            <Link href={`/voluntarios/${id}`}>
              <Button type="button" variant="outline">
                Cancelar
              </Button>
            </Link>
            <Button type="submit" className="bg-primary hover:bg-primary/90" disabled={saving}>
              <Save className="mr-2 h-4 w-4" />
              {saving ? "Guardando..." : "Guardar Cambios"}
            </Button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  )
}
