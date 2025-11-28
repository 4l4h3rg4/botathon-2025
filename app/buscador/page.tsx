"use client"

import { useState } from "react"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { DataTable } from "@/components/ui/data-table"
import { Search, Filter, X, Eye, Mail, Phone, MapPin, Sparkles } from "lucide-react"
import { volunteers, regions, skills, campaigns, availabilityOptions, volunteerTypes } from "@/lib/mock-data"
import Link from "next/link"

interface FilterState {
  searchTerm: string
  region: string
  skills: string[]
  campaign: string
  availability: string
  volunteerType: string
  status: string
}

export default function BuscadorPage() {
  const [filters, setFilters] = useState<FilterState>({
    searchTerm: "",
    region: "",
    skills: [],
    campaign: "",
    availability: "",
    volunteerType: "",
    status: "",
  })

  const [showFilters, setShowFilters] = useState(true)
  const [selectedVolunteers, setSelectedVolunteers] = useState<string[]>([])

  // Filter volunteers based on criteria
  const filteredVolunteers = volunteers.filter((volunteer) => {
    const matchesSearch =
      !filters.searchTerm ||
      volunteer.name.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
      volunteer.email.toLowerCase().includes(filters.searchTerm.toLowerCase())

    const matchesRegion = !filters.region || volunteer.region === filters.region

    const matchesSkills =
      filters.skills.length === 0 || filters.skills.every((skill) => volunteer.skills.includes(skill))

    const matchesCampaign = !filters.campaign || volunteer.campaigns.includes(filters.campaign)

    const matchesAvailability = !filters.availability || volunteer.availability === filters.availability

    const matchesType = !filters.volunteerType || volunteer.volunteerType === filters.volunteerType

    const matchesStatus = !filters.status || volunteer.status === filters.status

    return (
      matchesSearch &&
      matchesRegion &&
      matchesSkills &&
      matchesCampaign &&
      matchesAvailability &&
      matchesType &&
      matchesStatus
    )
  })

  const addSkillFilter = (skill: string) => {
    if (!filters.skills.includes(skill)) {
      setFilters({ ...filters, skills: [...filters.skills, skill] })
    }
  }

  const removeSkillFilter = (skill: string) => {
    setFilters({
      ...filters,
      skills: filters.skills.filter((s) => s !== skill),
    })
  }

  const clearFilters = () => {
    setFilters({
      searchTerm: "",
      region: "",
      skills: [],
      campaign: "",
      availability: "",
      volunteerType: "",
      status: "",
    })
  }

  const hasActiveFilters =
    filters.searchTerm ||
    filters.region ||
    filters.skills.length > 0 ||
    filters.campaign ||
    filters.availability ||
    filters.volunteerType ||
    filters.status

  const columns = [
    {
      key: "name",
      header: "Nombre",
      render: (volunteer: (typeof volunteers)[0]) => (
        <div className="font-medium text-foreground">{volunteer.name}</div>
      ),
    },
    {
      key: "region",
      header: "Región",
      render: (volunteer: (typeof volunteers)[0]) => (
        <div className="flex items-center gap-1 text-sm">
          <MapPin className="h-3 w-3 text-muted-foreground" />
          {volunteer.region}
        </div>
      ),
    },
    {
      key: "contact",
      header: "Contacto",
      render: (volunteer: (typeof volunteers)[0]) => (
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
      key: "skills",
      header: "Habilidades",
      render: (volunteer: (typeof volunteers)[0]) => (
        <div className="flex flex-wrap gap-1">
          {volunteer.skills.slice(0, 2).map((skill) => (
            <Badge key={skill} variant="secondary" className="text-xs">
              {skill}
            </Badge>
          ))}
          {volunteer.skills.length > 2 && (
            <Badge variant="outline" className="text-xs">
              +{volunteer.skills.length - 2}
            </Badge>
          )}
        </div>
      ),
    },
    {
      key: "status",
      header: "Estado",
      render: (volunteer: (typeof volunteers)[0]) => (
        <Badge
          variant={volunteer.status === "Activo" ? "default" : "secondary"}
          className={volunteer.status === "Activo" ? "bg-green-100 text-green-800 hover:bg-green-200" : ""}
        >
          {volunteer.status}
        </Badge>
      ),
    },
    {
      key: "actions",
      header: "Acciones",
      render: (volunteer: (typeof volunteers)[0]) => (
        <div className="flex items-center gap-2">
          <Link href={`/voluntarios/${volunteer.id}`}>
            <Button variant="ghost" size="sm">
              <Eye className="h-4 w-4" />
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
            <h1 className="text-3xl font-bold text-foreground">Buscador de Voluntarios</h1>
            <p className="text-muted-foreground">Busca y segmenta voluntarios según tus criterios</p>
          </div>
          <Button onClick={() => setShowFilters(!showFilters)} variant={showFilters ? "default" : "outline"}>
            <Filter className="mr-2 h-4 w-4" />
            {showFilters ? "Ocultar Filtros" : "Mostrar Filtros"}
          </Button>
        </div>

        {/* Filters Section */}
        {showFilters && (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Filter className="h-5 w-5 text-primary" />
                  Filtros de Búsqueda
                </CardTitle>
                {hasActiveFilters && (
                  <Button variant="ghost" size="sm" onClick={clearFilters}>
                    <X className="mr-2 h-4 w-4" />
                    Limpiar Filtros
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Search Bar */}
                <div>
                  <Label htmlFor="search">Búsqueda General</Label>
                  <div className="relative mt-2">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="search"
                      placeholder="Buscar por nombre o email..."
                      value={filters.searchTerm}
                      onChange={(e) => setFilters({ ...filters, searchTerm: e.target.value })}
                      className="pl-10"
                    />
                  </div>
                </div>

                {/* Filter Grid */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {/* Region Filter */}
                  <div>
                    <Label htmlFor="region">Región</Label>
                    <Select value={filters.region} onValueChange={(value) => setFilters({ ...filters, region: value })}>
                      <SelectTrigger id="region" className="mt-2">
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

                  {/* Campaign Filter */}
                  <div>
                    <Label htmlFor="campaign">Campaña</Label>
                    <Select
                      value={filters.campaign}
                      onValueChange={(value) => setFilters({ ...filters, campaign: value })}
                    >
                      <SelectTrigger id="campaign" className="mt-2">
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

                  {/* Availability Filter */}
                  <div>
                    <Label htmlFor="availability">Disponibilidad</Label>
                    <Select
                      value={filters.availability}
                      onValueChange={(value) => setFilters({ ...filters, availability: value })}
                    >
                      <SelectTrigger id="availability" className="mt-2">
                        <SelectValue placeholder="Cualquier disponibilidad" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Cualquier disponibilidad</SelectItem>
                        {availabilityOptions.map((option) => (
                          <SelectItem key={option} value={option}>
                            {option}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Volunteer Type Filter */}
                  <div>
                    <Label htmlFor="type">Tipo de Voluntariado</Label>
                    <Select
                      value={filters.volunteerType}
                      onValueChange={(value) => setFilters({ ...filters, volunteerType: value })}
                    >
                      <SelectTrigger id="type" className="mt-2">
                        <SelectValue placeholder="Todos los tipos" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todos los tipos</SelectItem>
                        {volunteerTypes.map((type) => (
                          <SelectItem key={type} value={type}>
                            {type}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Status Filter */}
                  <div>
                    <Label htmlFor="status">Estado</Label>
                    <Select value={filters.status} onValueChange={(value) => setFilters({ ...filters, status: value })}>
                      <SelectTrigger id="status" className="mt-2">
                        <SelectValue placeholder="Todos los estados" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todos los estados</SelectItem>
                        <SelectItem value="Activo">Activo</SelectItem>
                        <SelectItem value="Pendiente">Pendiente</SelectItem>
                        <SelectItem value="Inactivo">Inactivo</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Skills Multi-Select */}
                  <div>
                    <Label htmlFor="skills">Habilidades</Label>
                    <Select onValueChange={addSkillFilter}>
                      <SelectTrigger id="skills" className="mt-2">
                        <SelectValue placeholder="Seleccionar habilidades" />
                      </SelectTrigger>
                      <SelectContent>
                        {skills
                          .filter((skill) => !filters.skills.includes(skill))
                          .map((skill) => (
                            <SelectItem key={skill} value={skill}>
                              {skill}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Selected Skills */}
                {filters.skills.length > 0 && (
                  <div>
                    <Label>Habilidades Seleccionadas</Label>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {filters.skills.map((skill) => (
                        <Badge
                          key={skill}
                          variant="secondary"
                          className="gap-1 bg-primary/10 text-primary hover:bg-primary/20"
                        >
                          {skill}
                          <button
                            onClick={() => removeSkillFilter(skill)}
                            className="ml-1 rounded-full hover:bg-primary/30"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Active Filters Indicator */}
                {hasActiveFilters && (
                  <div className="rounded-lg bg-primary/5 p-4">
                    <p className="text-sm font-medium text-foreground">
                      Filtros activos: {filteredVolunteers.length} de {volunteers.length} voluntarios
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Results Section */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Search className="h-5 w-5 text-primary" />
                Resultados ({filteredVolunteers.length})
              </CardTitle>
              {filteredVolunteers.length > 0 && (
                <Button className="bg-primary hover:bg-primary/90">
                  <Sparkles className="mr-2 h-4 w-4" />
                  Segmentar Voluntarios
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {filteredVolunteers.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <Search className="h-12 w-12 text-muted-foreground" />
                <h3 className="mt-4 text-lg font-semibold text-foreground">No se encontraron voluntarios</h3>
                <p className="mt-2 text-sm text-muted-foreground">Intenta ajustar los filtros de búsqueda</p>
                {hasActiveFilters && (
                  <Button onClick={clearFilters} variant="outline" className="mt-4 bg-transparent">
                    Limpiar Filtros
                  </Button>
                )}
              </div>
            ) : (
              <DataTable
                data={filteredVolunteers}
                columns={columns}
                currentPage={1}
                totalPages={Math.ceil(filteredVolunteers.length / 10)}
              />
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
