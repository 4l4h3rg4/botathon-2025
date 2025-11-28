"use client"

import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { KpiCard } from "@/components/ui/kpi-card"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, MapPin, Calendar, Award, TrendingUp, Heart } from "lucide-react"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from "recharts"
import { regionStats, skillsStats, campaignParticipation } from "@/lib/mock-data"

const COLORS = ["#E00025", "#FFD100", "#6B7280", "#9CA3AF", "#E00025CC", "#FFD100CC", "#4B5563", "#D1D5DB"]

const chileRegions = [
  { name: "Arica", lat: -18.48, lng: -70.33, volunteers: 120 },
  { name: "Antofagasta", lat: -23.65, lng: -70.4, volunteers: 180 },
  { name: "Copiapó", lat: -27.37, lng: -70.33, volunteers: 90 },
  { name: "La Serena", lat: -29.9, lng: -71.25, volunteers: 200 },
  { name: "Valparaíso", lat: -33.05, lng: -71.62, volunteers: 420 },
  { name: "Santiago", lat: -33.45, lng: -70.67, volunteers: 1250 },
  { name: "Rancagua", lat: -34.17, lng: -70.74, volunteers: 150 },
  { name: "Talca", lat: -35.43, lng: -71.67, volunteers: 180 },
  { name: "Concepción", lat: -36.83, lng: -73.05, volunteers: 380 },
  { name: "Temuco", lat: -38.74, lng: -72.6, volunteers: 290 },
  { name: "Puerto Montt", lat: -41.47, lng: -72.93, volunteers: 250 },
  { name: "Punta Arenas", lat: -53.16, lng: -70.91, volunteers: 80 },
]

export default function DashboardPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div>
          <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground">Resumen general del sistema de voluntariado Teletón</p>
        </div>

        {/* KPI Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <KpiCard
            title="Total Voluntarios"
            value="3,550"
            description="Voluntarios registrados"
            icon={Users}
            trend={{ value: 12, isPositive: true }}
          />
          <KpiCard title="Regiones Activas" value="16" description="Cobertura nacional" icon={MapPin} />
          <KpiCard title="Campañas" value="4" description="Teletón históricas" icon={Calendar} />
          <KpiCard title="Habilidades" value="12" description="Categorías registradas" icon={Award} />
        </div>

        {/* Charts Row 1 */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Chile Map Representation */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5 text-primary" />
                Distribución Geográfica
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="relative h-[350px] bg-muted/30 rounded-lg overflow-hidden">
                {/* Simplified Chile Map Visual */}
                <svg
                  viewBox="0 0 200 500"
                  className="absolute inset-0 w-full h-full"
                  style={{ filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.1))" }}
                >
                  {/* Chile shape simplified */}
                  <path
                    d="M100 20 Q120 50 110 100 Q105 150 115 200 Q110 250 100 300 Q95 350 105 400 Q100 450 95 480 L90 480 Q85 450 90 400 Q80 350 85 300 Q80 250 90 200 Q85 150 95 100 Q85 50 100 20"
                    fill="#E5E7EB"
                    stroke="#9CA3AF"
                    strokeWidth="1"
                  />
                  {/* Region markers */}
                  {chileRegions.map((region, index) => {
                    const y = 20 + index * 38
                    const size = Math.max(8, Math.min(20, region.volunteers / 80))
                    return (
                      <g key={region.name}>
                        <circle
                          cx={100 + (index % 2 === 0 ? -5 : 5)}
                          cy={y}
                          r={size}
                          fill="#E00025"
                          opacity={0.7 + region.volunteers / 5000}
                        />
                        <text x={130} y={y + 4} fontSize="10" fill="#374151" className="font-medium">
                          {region.name}: {region.volunteers}
                        </text>
                      </g>
                    )
                  })}
                </svg>
              </div>
              <div className="mt-4 flex items-center justify-center gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-primary opacity-50" />
                  <span className="text-muted-foreground">Menor concentración</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-primary" />
                  <span className="text-muted-foreground">Mayor concentración</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Region Bar Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-primary" />
                Voluntarios por Región
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={350}>
                <BarChart data={regionStats} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                  <XAxis type="number" stroke="#6B7280" fontSize={12} />
                  <YAxis dataKey="region" type="category" stroke="#6B7280" fontSize={12} width={80} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "white",
                      border: "1px solid #E5E7EB",
                      borderRadius: "8px",
                    }}
                  />
                  <Bar dataKey="volunteers" fill="#E00025" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Charts Row 2 */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Campaign Participation Timeline */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-primary" />
                Participación por Campaña
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={campaignParticipation}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                  <XAxis dataKey="campaign" stroke="#6B7280" fontSize={12} />
                  <YAxis stroke="#6B7280" fontSize={12} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "white",
                      border: "1px solid #E5E7EB",
                      borderRadius: "8px",
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="volunteers"
                    stroke="#E00025"
                    strokeWidth={3}
                    dot={{ fill: "#E00025", strokeWidth: 2, r: 6 }}
                    activeDot={{ r: 8, fill: "#FFD100" }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Skills Distribution */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Heart className="h-5 w-5 text-primary" />
                Habilidades más Comunes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={skillsStats}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                  <XAxis dataKey="skill" stroke="#6B7280" fontSize={10} angle={-45} textAnchor="end" height={80} />
                  <YAxis stroke="#6B7280" fontSize={12} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "white",
                      border: "1px solid #E5E7EB",
                      borderRadius: "8px",
                    }}
                  />
                  <Bar dataKey="count" fill="#FFD100" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Quick Stats */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Voluntarios Activos</p>
                  <p className="text-2xl font-bold text-green-600">3,280</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">Porcentaje</p>
                  <p className="text-2xl font-bold text-foreground">92%</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Nuevos este Mes</p>
                  <p className="text-2xl font-bold text-primary">145</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">Crecimiento</p>
                  <p className="text-2xl font-bold text-green-600">+4.2%</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Comunicaciones Enviadas</p>
                  <p className="text-2xl font-bold text-foreground">2,450</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">Este Mes</p>
                  <p className="text-2xl font-bold text-secondary-foreground">+890</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  )
}
