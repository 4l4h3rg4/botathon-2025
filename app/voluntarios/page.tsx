"use client"

import { useState, useEffect } from "react"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { DataTable } from "@/components/ui/data-table"
import { Search, Plus, Eye, Edit, Mail, Phone, MapPin, Users } from "lucide-react"
import Link from "next/link"
import { api } from "@/lib/api"

export default function VoluntariosPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [volunteers, setVolunteers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchVolunteers = async () => {
      try {
        const data = await api.volunteers.list()
        setVolunteers(data)
      } catch (error) {
        console.error("Failed to fetch volunteers", error)
      } finally {
        setLoading(false)
      }
    }
    fetchVolunteers()
  }, [])

  const filteredVolunteers = volunteers.filter(
    (volunteer) =>
      volunteer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      volunteer.email.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const columns = [
    {
      key: "name",
      header: "Nombre",
      render: (volunteer: any) => (
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-sm font-medium text-primary">
            {volunteer.name
              .split(" ")
              .map((n: string) => n[0])
              .join("")}
          </div>
          <div>
            <p className="font-medium text-foreground">{volunteer.name}</p>
            <p className="text-sm text-muted-foreground">{volunteer.city}</p>
          </div>
        </div>
      ),
    },
    {
      key: "contact",
      header: "Contacto",
      render: (volunteer: any) => (
        <div className="space-y-1 text-sm">
          <div className="flex items-center gap-1 text-muted-foreground">
            <Mail className="h-3 w-3" />
            {volunteer.email}
          </div>
          <div className="flex items-center gap-1 text-muted-foreground">
            <Phone className="h-3 w-3" />
            {volunteer.phone}
          </div>
        </div>
      ),
    },
    {
      key: "region",
      header: "Región",
      render: (volunteer: any) => (
        <div className="flex items-center gap-1 text-sm">
          <MapPin className="h-3 w-3 text-muted-foreground" />
          {volunteer.region}
        </div>
      ),
    },
    {
      key: "skills",
      header: "Habilidades",
      render: (volunteer: any) => (
        <div className="flex flex-wrap gap-1">
          {volunteer.skills && volunteer.skills.slice(0, 2).map((skill: any) => (
            <Badge key={skill.id} variant="secondary" className="text-xs">
              {skill.name}
            </Badge>
          ))}
          {volunteer.skills && volunteer.skills.length > 2 && (
            <Badge variant="outline" className="text-xs">
              +{volunteer.skills.length - 2}
            </Badge>
          )}
        </div>
      ),
    },
    {
      key: "actions",
      header: "Acciones",
      render: (volunteer: any) => (
        <div className="flex items-center gap-2">
          <Link href={`/voluntarios/${volunteer.id}`}>
            <Button variant="ghost" size="sm">
              <Eye className="h-4 w-4" />
            </Button>
          </Link>
          <Link href={`/voluntarios/${volunteer.id}/editar`}>
            <Button variant="ghost" size="sm">
              <Edit className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      ),
    },
  ]

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Voluntarios</h1>
            <p className="text-muted-foreground">Gestión de voluntarios registrados en el sistema</p>
          </div>
          <Button className="bg-primary hover:bg-primary/90">
            <Plus className="mr-2 h-4 w-4" />
            Nuevo Voluntario
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                  <Users className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{volunteers.length}</p>
                  <p className="text-sm text-muted-foreground">Total</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Volunteers Table */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Lista de Voluntarios</CardTitle>
              <div className="relative w-64">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Buscar voluntarios..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <DataTable
              data={filteredVolunteers}
              columns={columns}
              currentPage={1}
              totalPages={Math.ceil(filteredVolunteers.length / 10)}
            />
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
