"use client"

import { useState } from "react"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Mic, Send, Sparkles, Bot, Mail, Phone, MapPin, CheckCircle } from "lucide-react"
import { volunteers } from "@/lib/mock-data"

export default function AsistentePage() {
    const [input, setInput] = useState("")
    const [isListening, setIsListening] = useState(false)
    const [messages, setMessages] = useState<{ role: "user" | "assistant"; content: string; data?: any[] }[]>([
        {
            role: "assistant",
            content: "Hola, soy tu asistente virtual de Teletón. ¿En qué puedo ayudarte hoy? Puedes pedirme buscar voluntarios por habilidades, región, o enviar correos masivos.",
        },
    ])
    const [showSuccess, setShowSuccess] = useState(false)

    const handleSend = () => {
        if (!input.trim()) return

        const userMessage = { role: "user" as const, content: input }
        setMessages((prev) => [...prev, userMessage])
        setInput("")

        // Simulate AI processing
        setTimeout(() => {
            let responseContent = "Entendido."
            let responseData: any[] = []

            const lowerInput = input.toLowerCase()

            if (lowerInput.includes("voluntarios") && (lowerInput.includes("primeros auxilios") || lowerInput.includes("habilidades"))) {
                responseContent = "Aquí tienes a los voluntarios con habilidades de primeros auxilios:"
                responseData = volunteers.filter((v) => v.skills.includes("Primeros Auxilios"))
            } else if (lowerInput.includes("voluntarios") && lowerInput.includes("región")) {
                responseContent = "Aquí tienes a los voluntarios agrupados por región:"
                responseData = volunteers // Just showing all for simplicity in this mock
            } else {
                responseContent = "No estoy seguro de entender. ¿Podrías intentar pedirme 'buscar voluntarios con primeros auxilios'?"
            }

            setMessages((prev) => [
                ...prev,
                { role: "assistant", content: responseContent, data: responseData },
            ])
        }, 1000)
    }

    const handleMicClick = () => {
        setIsListening(true)
        setTimeout(() => {
            setInput("Muéstrame todos los voluntarios que tengan habilidades de primeros auxilios")
            setIsListening(false)
        }, 1500)
    }

    const handleSendEmails = () => {
        setShowSuccess(true)
        setTimeout(() => setShowSuccess(false), 3000)
    }

    return (
        <DashboardLayout>
            <div className="flex h-[calc(100vh-8rem)] flex-col gap-4">
                {/* Header */}
                <div>
                    <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
                        <Sparkles className="h-8 w-8 text-primary" />
                        Asistente AI
                    </h1>
                    <p className="text-muted-foreground">Interactúa con tu base de datos de voluntarios usando lenguaje natural</p>
                </div>

                {/* Success Toast */}
                {showSuccess && (
                    <div className="fixed right-4 top-20 z-50 flex items-center gap-2 rounded-lg bg-green-500 px-4 py-3 text-white shadow-lg animate-in slide-in-from-top-2">
                        <CheckCircle className="h-5 w-5" />
                        <span>Correos enviados exitosamente a los voluntarios seleccionados</span>
                    </div>
                )}

                {/* Chat Area */}
                <Card className="flex-1 flex flex-col overflow-hidden">
                    <ScrollArea className="flex-1 p-4">
                        <div className="space-y-4">
                            {messages.map((msg, index) => (
                                <div
                                    key={index}
                                    className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                                >
                                    <div
                                        className={`max-w-[80%] rounded-lg p-4 ${msg.role === "user"
                                                ? "bg-primary text-primary-foreground"
                                                : "bg-muted"
                                            }`}
                                    >
                                        <div className="flex items-start gap-2">
                                            {msg.role === "assistant" && <Bot className="h-5 w-5 mt-1 shrink-0" />}
                                            <div>
                                                <p className="whitespace-pre-wrap">{msg.content}</p>

                                                {/* Data Display */}
                                                {msg.data && msg.data.length > 0 && (
                                                    <div className="mt-4 space-y-2">
                                                        {msg.data.map((volunteer: any) => (
                                                            <div key={volunteer.id} className="bg-background rounded p-3 border border-border text-foreground">
                                                                <div className="flex justify-between items-start">
                                                                    <div>
                                                                        <p className="font-bold">{volunteer.name}</p>
                                                                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                                            <Mail className="h-3 w-3" /> {volunteer.email}
                                                                        </div>
                                                                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                                            <MapPin className="h-3 w-3" /> {volunteer.region}
                                                                        </div>
                                                                    </div>
                                                                    <Badge variant="outline">{volunteer.status}</Badge>
                                                                </div>
                                                                <div className="mt-2 flex flex-wrap gap-1">
                                                                    {volunteer.skills.map((skill: string) => (
                                                                        <Badge key={skill} variant="secondary" className="text-xs">{skill}</Badge>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                        ))}
                                                        <Button onClick={handleSendEmails} className="w-full mt-2 bg-green-600 hover:bg-green-700 text-white">
                                                            <Mail className="mr-2 h-4 w-4" />
                                                            Enviar Correos a Estos Voluntarios
                                                        </Button>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                            {isListening && (
                                <div className="flex justify-end">
                                    <div className="bg-primary/50 text-primary-foreground rounded-lg p-4 animate-pulse">
                                        Escuchando...
                                    </div>
                                </div>
                            )}
                        </div>
                    </ScrollArea>

                    {/* Input Area */}
                    <div className="p-4 border-t border-border bg-card">
                        <div className="flex gap-2">
                            <Button
                                variant={isListening ? "destructive" : "outline"}
                                size="icon"
                                onClick={handleMicClick}
                                className="shrink-0"
                            >
                                <Mic className={`h-5 w-5 ${isListening ? "animate-pulse" : ""}`} />
                            </Button>
                            <Input
                                placeholder="Escribe tu instrucción aquí... (ej: 'Buscar voluntarios con primeros auxilios')"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyDown={(e) => e.key === "Enter" && handleSend()}
                                className="flex-1"
                            />
                            <Button onClick={handleSend} className="shrink-0">
                                <Send className="h-5 w-5" />
                            </Button>
                        </div>
                    </div>
                </Card>
            </div>
        </DashboardLayout>
    )
}
