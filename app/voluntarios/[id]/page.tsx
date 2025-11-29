"use client"

import { use, useEffect, useState } from "react"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Edit, Mail, Phone, MapPin, Calendar, Clock, Award, FileText, User } from "lucide-react"
import Link from "next/link"
import { api } from "@/lib/api"

export default function VolunteerProfilePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = use(params)
  const [volunteer, setVolunteer] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    const fetchVolunteer = async () => {
      try {
        const data = await api.volunteers.get(id)
        setVolunteer(data)
      } catch (err) {
        console.error("Error fetching volunteer:", err)
        setError(true)
      } finally {
        setLoading(false)
      }
    }
    fetchVolunteer()
  }, [id])

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center py-12">
          <p>Cargando perfil...</p>
        </div>
      </DashboardLayout>
    )
  }

  if (error || !volunteer) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center py-12">
          <User className="h-16 w-16 text-muted-foreground" />
          <h2 className="mt-4 text-xl font-semibold">Voluntario no encontrado</h2>
          <p className="mt-2 text-muted-foreground">El voluntario solicitado no existe en el sistema.</p>
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

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/voluntarios">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-foreground">Perfil del Voluntario</h1>
              <p className="text-muted-foreground">Información detallada del voluntario</p>
            </div>
          </div>
          <Link href={`/voluntarios/${id}/editar`}>
            <Button className="bg-primary hover:bg-primary/90">
              <Edit className="mr-2 h-4 w-4" />
              Editar
            </Button>
          </Link>
        </div>

        {/* Profile Content */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Main Info Card */}
          <Card className="lg:col-span-2">
            <CardContent className="p-6">
              <div className="flex items-start gap-6">
                <div className="flex h-24 w-24 items-center justify-center rounded-full bg-primary/10 text-3xl font-bold text-primary">
                  {volunteer.name
                    .split(" ")
                    .map((n: string) => n[0])
                    .join("")}
                </div>
                <div className="flex-1 space-y-4">
                  <div>
                    <div className="flex items-center gap-3">
                      <h2 className="text-2xl font-bold text-foreground">{volunteer.name}</h2>
                      <Badge
                        variant="default"
                        className="bg-green-100 text-green-800"
                      >
                        Activo
                      </Badge>
                    </div>
                    <p className="text-muted-foreground">Voluntario</p>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 text-sm">
                        <Mail className="h-4 w-4 text-primary" />
                        <span>{volunteer.email}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Phone className="h-4 w-4 text-primary" />
                        <span>{volunteer.phone || "No registrado"}</span>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 text-sm">
                        <MapPin className="h-4 w-4 text-primary" />
                        <span>
                          {volunteer.region}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Calendar className="h-4 w-4 text-primary" />
                        <span>
                          Desde{" "}
                          {new Date(volunteer.created_at).toLocaleDateString("es-CL", {
                            year: "numeric",
                            month: "long",
                          })}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Availability Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Clock className="h-5 w-5 text-primary" />
                Disponibilidad
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground">Horario</p>
                  <p className="font-medium">{volunteer.availability || "No especificada"}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Skills and Campaigns */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Skills */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Award className="h-5 w-5 text-primary" />
                Habilidades
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {volunteer.skills && volunteer.skills.length > 0 ? (
                  volunteer.skills.map((skill: any) => (
                    <Badge key={skill.id || skill.name} variant="secondary" className="bg-primary/10 text-primary hover:bg-primary/20">
                      {skill.name}
                    </Badge>
                  ))
                ) : (
                  <p className="text-muted-foreground italic">Sin habilidades registradas</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Campaigns */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Calendar className="h-5 w-5 text-primary" />
                Campañas Participadas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {volunteer.campaigns && volunteer.campaigns.length > 0 ? (
                  volunteer.campaigns.map((campaign: any) => (
                    <div key={campaign.id || campaign.name} className="flex items-center justify-between rounded-lg border border-border p-3">
                      <span className="font-medium">{campaign.name}</span>
                      <Badge variant="outline">Participó</Badge>
                    </div>
                  ))
                ) : (
                  <p className="text-muted-foreground italic">Sin campañas registradas</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  )
}
