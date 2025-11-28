"use client"

import { useState } from "react"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { FileText, Search, Filter, RefreshCw, CheckCircle, AlertCircle, Info, AlertTriangle, Clock } from "lucide-react"
import { logs } from "@/lib/mock-data"
import { cn } from "@/lib/utils"

const logTypes = ["Todos", "Sincronización", "Comunicación", "Error", "Segmentación", "Importación", "Warning"]

export default function LogsPage() {
  const [filterType, setFilterType] = useState("Todos")
  const [searchTerm, setSearchTerm] = useState("")
  const [dateFilter, setDateFilter] = useState("")

  const filteredLogs = logs.filter((log) => {
    const matchesType = filterType === "Todos" || log.type === filterType
    const matchesSearch = !searchTerm || log.message.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesDate = !dateFilter || log.timestamp.includes(dateFilter)
    return matchesType && matchesSearch && matchesDate
  })

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "success":
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case "error":
        return <AlertCircle className="h-4 w-4 text-destructive" />
      case "warning":
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />
      case "info":
        return <Info className="h-4 w-4 text-blue-500" />
      default:
        return <Info className="h-4 w-4 text-muted-foreground" />
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "success":
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-200">Éxito</Badge>
      case "error":
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-200">Error</Badge>
      case "warning":
        return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-200">Advertencia</Badge>
      case "info":
        return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-200">Info</Badge>
      default:
        return <Badge variant="secondary">Desconocido</Badge>
    }
  }

  const getTypeBadge = (type: string) => {
    const colors: Record<string, string> = {
      Sincronización: "bg-purple-100 text-purple-800",
      Comunicación: "bg-primary/10 text-primary",
      Error: "bg-red-100 text-red-800",
      Segmentación: "bg-blue-100 text-blue-800",
      Importación: "bg-green-100 text-green-800",
      Warning: "bg-yellow-100 text-yellow-800",
    }

    return (
      <Badge variant="outline" className={cn("border-0", colors[type] || "bg-muted")}>
        {type}
      </Badge>
    )
  }

  // Stats
  const successCount = logs.filter((l) => l.status === "success").length
  const errorCount = logs.filter((l) => l.status === "error").length
  const warningCount = logs.filter((l) => l.status === "warning").length

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Registro de Actividades</h1>
            <p className="text-muted-foreground">Historial de procesos y eventos del sistema</p>
          </div>
          <Button variant="outline">
            <RefreshCw className="mr-2 h-4 w-4" />
            Actualizar
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                  <FileText className="h-5 w-5 text-foreground" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{logs.length}</p>
                  <p className="text-sm text-muted-foreground">Total Registros</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{successCount}</p>
                  <p className="text-sm text-muted-foreground">Exitosos</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-yellow-100">
                  <AlertTriangle className="h-5 w-5 text-yellow-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{warningCount}</p>
                  <p className="text-sm text-muted-foreground">Advertencias</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-100">
                  <AlertCircle className="h-5 w-5 text-red-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{errorCount}</p>
                  <p className="text-sm text-muted-foreground">Errores</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5 text-primary" />
              Filtros
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap items-end gap-4">
              <div className="flex-1 min-w-[200px]">
                <Label htmlFor="search">Buscar</Label>
                <div className="relative mt-2">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="search"
                    placeholder="Buscar en registros..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="w-[200px]">
                <Label htmlFor="type">Tipo de Proceso</Label>
                <Select value={filterType} onValueChange={setFilterType}>
                  <SelectTrigger id="type" className="mt-2">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {logTypes.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="w-[200px]">
                <Label htmlFor="date">Fecha</Label>
                <Input
                  id="date"
                  type="date"
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value)}
                  className="mt-2"
                />
              </div>
              <Button
                variant="outline"
                onClick={() => {
                  setFilterType("Todos")
                  setSearchTerm("")
                  setDateFilter("")
                }}
              >
                Limpiar
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Logs Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              Registros ({filteredLogs.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {filteredLogs.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <FileText className="h-12 w-12 text-muted-foreground" />
                  <h3 className="mt-4 text-lg font-semibold text-foreground">No se encontraron registros</h3>
                  <p className="mt-2 text-sm text-muted-foreground">Intenta ajustar los filtros de búsqueda</p>
                </div>
              ) : (
                filteredLogs.map((log) => (
                  <div
                    key={log.id}
                    className={cn(
                      "flex items-start gap-4 rounded-lg border border-border p-4 transition-colors hover:bg-muted/50",
                      log.status === "error" && "border-l-4 border-l-destructive",
                      log.status === "warning" && "border-l-4 border-l-yellow-500",
                      log.status === "success" && "border-l-4 border-l-green-500",
                    )}
                  >
                    <div className="mt-1">{getStatusIcon(log.status)}</div>
                    <div className="flex-1 space-y-2">
                      <div className="flex flex-wrap items-center gap-2">
                        {getTypeBadge(log.type)}
                        {getStatusBadge(log.status)}
                      </div>
                      <p className="text-foreground">{log.message}</p>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        {log.timestamp}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
