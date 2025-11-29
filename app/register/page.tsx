import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Link from "next/link"
import Image from "next/image"

export default function RegisterPage() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-red-100 dark:from-zinc-900 dark:to-zinc-950 p-4">
            <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]"></div>

            <Card className="w-full max-w-md relative z-10 shadow-xl border-red-100 dark:border-zinc-800">
                <CardHeader className="space-y-1 text-center">
                    <div className="flex justify-center mb-4">
                        <Image
                            src="/teleton-logo.png"
                            alt="Teletón Chile"
                            width={80}
                            height={80}
                            className="h-20 w-auto object-contain"
                            priority
                        />
                    </div>
                    <CardTitle className="text-2xl font-bold tracking-tight">Crear una cuenta</CardTitle>
                    <CardDescription>
                        Únete a nuestra comunidad de voluntarios
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="firstName">Nombre</Label>
                            <Input id="firstName" placeholder="Juan" />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="lastName">Apellido</Label>
                            <Input id="lastName" placeholder="Pérez" />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="email">Correo electrónico</Label>
                        <Input id="email" type="email" placeholder="nombre@ejemplo.com" />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="password">Contraseña</Label>
                        <Input id="password" type="password" />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="confirmPassword">Confirmar contraseña</Label>
                        <Input id="confirmPassword" type="password" />
                    </div>
                </CardContent>
                <CardFooter className="flex flex-col space-y-4">
                    <Button className="w-full bg-red-600 hover:bg-red-700 text-white shadow-md transition-all hover:shadow-lg">
                        Registrarse
                    </Button>
                    <div className="text-center text-sm text-muted-foreground">
                        ¿Ya tienes una cuenta?{" "}
                        <Link href="/login" className="font-medium text-red-600 hover:text-red-500 dark:text-red-400 underline-offset-4 hover:underline">
                            Inicia sesión aquí
                        </Link>
                    </div>
                </CardFooter>
            </Card>
        </div>
    )
}
