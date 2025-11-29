"use client"

import { useEffect, useState } from "react"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { KpiCard } from "@/components/ui/kpi-card"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, MapPin, Calendar, Award, TrendingUp, Heart } from "lucide-react"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from "recharts"
import { api } from "@/lib/api"

const chileRegions = [
  { name: "Arica y Parinacota", lat: -18.48, lng: -70.33 },
  { name: "Antofagasta", lat: -23.65, lng: -70.4 },
  { name: "Atacama", lat: -27.37, lng: -70.33 },
  { name: "Coquimbo", lat: -29.9, lng: -71.25 },
  { name: "Valparaíso", lat: -33.05, lng: -71.62 },
  { name: "Metropolitana", lat: -33.45, lng: -70.67 },
  { name: "O'Higgins", lat: -34.17, lng: -70.74 },
  { name: "Maule", lat: -35.43, lng: -71.67 },
  { name: "Biobío", lat: -36.83, lng: -73.05 },
  { name: "Araucanía", lat: -38.74, lng: -72.6 },
  { name: "Los Lagos", lat: -41.47, lng: -72.93 },
  { name: "Magallanes", lat: -53.16, lng: -70.91 },
]

export default function DashboardPage() {
  const [overview, setOverview] = useState<any>(null)
  const [regionStats, setRegionStats] = useState<any[]>([])
  const [skillsStats, setSkillsStats] = useState<any[]>([])
  const [timeline, setTimeline] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [ov, reg, ski, time] = await Promise.all([
          api.metrics.overview(),
          api.metrics.regions(),
          api.metrics.skills(),
          api.metrics.timeline()
        ])
        setOverview(ov)
        setRegionStats(reg)
        setSkillsStats(ski)
        setTimeline(time)
      } catch (error) {
        console.error("Failed to fetch dashboard data", error)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  if (loading) {
    return <DashboardLayout><div className="p-8">Cargando dashboard...</div></DashboardLayout>
  }

  const mapRegions = chileRegions.map(r => {
    const stat = regionStats.find((s: any) => s.region === r.name)
    return { ...r, volunteers: stat ? stat.count : 0 }
  })

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
            value={overview?.total_volunteers?.toLocaleString() || "0"}
            description="Voluntarios registrados"
            icon={Users}
            trend={{ value: 12, isPositive: true }}
          />
          <KpiCard title="Regiones Activas" value={regionStats.length.toString()} description="Cobertura nacional" icon={MapPin} />
          <KpiCard title="Campañas" value="4" description="Teletón históricas" icon={Calendar} />
          <KpiCard title="Habilidades" value={skillsStats.length.toString()} description="Categorías registradas" icon={Award} />
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
                  {mapRegions.map((region, index) => {
                    const y = 20 + index * 38
                    const size = Math.max(8, Math.min(20, region.volunteers / 10))
                    return (
                      <g key={region.name}>
                        <circle
                          cx={100 + (index % 2 === 0 ? -5 : 5)}
                          cy={y}
                          r={size}
                          fill="#E00025"
                          opacity={0.7 + region.volunteers / 50}
                        />
                        <text x={130} y={y + 4} fontSize="10" fill="#374151" className="font-medium">
                          {region.name}: {region.volunteers}
                        </text>
                      </g>
                    )
                  })}
                </svg>
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
                  <Bar dataKey="count" fill="#E00025" radius={[0, 4, 4, 0]} />
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
                Crecimiento Mensual
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={timeline}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                  <XAxis dataKey="date" stroke="#6B7280" fontSize={12} tickFormatter={(val) => new Date(val).toLocaleDateString()} />
                  <YAxis stroke="#6B7280" fontSize={12} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "white",
                      border: "1px solid #E5E7EB",
                      borderRadius: "8px",
                    }}
                    labelFormatter={(val) => new Date(val).toLocaleDateString()}
                  />
                  <Line
                    type="monotone"
                    dataKey="count"
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
      </div>
    </DashboardLayout>
  )
}
