"use client"

import { useState, useRef } from "react"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Send, Sparkles, Bot } from "lucide-react"

export default function AsistentePage() {
    const [messages, setMessages] = useState<{ role: "user" | "assistant"; text: string }[]>([
        { role: "assistant", text: "Hola! Puedo buscar voluntarios y enviarles correos. ¿Como empezamos?" }
    ])
    const [input, setInput] = useState("")
    const [loading, setLoading] = useState(false)
    const sessionId = useRef(crypto.randomUUID())

    async function sendMessage() {
        if (!input.trim() || loading) return
        const userMsg = input.trim()
        setInput("")
        setMessages(prev => [...prev, { role: "user", text: userMsg }])
        setLoading(true)

        try {
            const token = typeof window !== "undefined" ? localStorage.getItem("token") : null
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api/v1"}/assistant/chat`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    ...(token ? { "Authorization": `Bearer ${token}` } : {})
                },
                body: JSON.stringify({ message: userMsg, session_id: sessionId.current })
            })
            const data = await res.json()
            setMessages(prev => [...prev, { role: "assistant", text: data.response ?? data.error ?? "Sin respuesta" }])
        } catch {
            setMessages(prev => [...prev, { role: "assistant", text: "Hubo un error. Por favor, intenta nuevamente." }])
        } finally {
            setLoading(false)
        }
    }

    return (
        <DashboardLayout>
            <div className="flex h-[calc(100vh-8rem)] flex-col gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
                        <Sparkles className="h-8 w-8 text-primary" />
                        Asistente AI
                    </h1>
                    <p className="text-muted-foreground">Interactúa con tu base de datos de voluntarios usando lenguaje natural</p>
                </div>

                <Card className="flex-1 flex flex-col overflow-hidden">
                    <ScrollArea className="flex-1 p-4">
                        <div className="space-y-4">
                            {messages.map((msg, index) => (
                                <div key={index} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                                    <div className={`max-w-[80%] rounded-lg p-4 ${msg.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted"}`}>
                                        <div className="flex items-start gap-2">
                                            {msg.role === "assistant" && <Bot className="h-5 w-5 mt-1 shrink-0" />}
                                            <p className="whitespace-pre-wrap">{msg.text}</p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                            {loading && (
                                <div className="flex justify-start">
                                    <div className="bg-muted rounded-lg p-4 animate-pulse flex items-center gap-2">
                                        <Bot className="h-5 w-5" />
                                        <span>Pensando...</span>
                                    </div>
                                </div>
                            )}
                        </div>
                    </ScrollArea>

                    <div className="p-4 border-t border-border bg-card">
                        <div className="flex gap-2">
                            <Input
                                placeholder="Escribe tu instrucción aquí... (ej: 'Buscar voluntarios con primeros auxilios en Biobío')"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                                className="flex-1"
                                disabled={loading}
                            />
                            <Button onClick={sendMessage} disabled={loading} className="shrink-0">
                                <Send className="h-5 w-5" />
                            </Button>
                        </div>
                    </div>
                </Card>
            </div>
        </DashboardLayout>
    )
}
