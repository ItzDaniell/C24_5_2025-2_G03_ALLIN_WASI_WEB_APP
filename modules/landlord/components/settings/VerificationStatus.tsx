"use client";

import React from "react";
import { Shield, Clock, CheckCircle2, AlertTriangle, FileText, Lock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/ui/card";

interface VerificationStatusProps {
    status: 'pending' | 'verified' | 'rejected' | string;
    message?: string | null;
    dniFrontUrl?: string | null;
    dniBackUrl?: string | null;
    utilityBillUrl?: string | null;
}

export function VerificationStatus({
    status,
    message,
    dniFrontUrl,
    dniBackUrl,
    utilityBillUrl
}: VerificationStatusProps) {
    const hasDocuments = dniFrontUrl || dniBackUrl || utilityBillUrl;

    if (!hasDocuments) {
        return (
            <Card className="border-creme-brulee/30 bg-creme-brulee/5">
                <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center gap-2 text-creme-brulee">
                        <AlertTriangle className="w-5 h-5" />
                        Documentos Pendientes
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-sm text-lunar-eclipse">
                        No has subido tus documentos de verificación. Para poder publicar propiedades, necesitas completar la verificación de identidad.
                    </p>
                </CardContent>
            </Card>
        );
    }

    if (status === 'pending') {
        return (
            <Card className="border-inkwell/20 bg-inkwell/5">
                <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center gap-2 text-inkwell">
                        <Clock className="w-5 h-5" />
                        🔒 Documentos en revisión
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                    <p className="text-sm text-lunar-eclipse">
                        Tus documentos están siendo revisados por nuestro equipo. <strong className="text-inkwell">No puedes modificarlos en este momento.</strong>
                    </p>
                    <div className="flex flex-wrap gap-2">
                        {dniFrontUrl && (
                            <span className="inline-flex items-center gap-1 px-3 py-1.5 bg-inkwell/10 text-inkwell rounded-full text-xs font-medium">
                                <FileText className="w-3 h-3" />
                                DNI Frontal
                                <Lock className="w-3 h-3" />
                            </span>
                        )}
                        {dniBackUrl && (
                            <span className="inline-flex items-center gap-1 px-3 py-1.5 bg-inkwell/10 text-inkwell rounded-full text-xs font-medium">
                                <FileText className="w-3 h-3" />
                                DNI Trasero
                                <Lock className="w-3 h-3" />
                            </span>
                        )}
                        {utilityBillUrl && (
                            <span className="inline-flex items-center gap-1 px-3 py-1.5 bg-inkwell/10 text-inkwell rounded-full text-xs font-medium">
                                <FileText className="w-3 h-3" />
                                Recibo de Servicios
                                <Lock className="w-3 h-3" />
                            </span>
                        )}
                    </div>
                    <p className="text-xs text-lunar-eclipse/70">
                        Recibirás una notificación cuando la revisión esté completa.
                    </p>
                </CardContent>
            </Card>
        );
    }

    if (status === 'verified') {
        return (
            <Card className="border-inkwell/30 bg-gradient-to-r from-inkwell/5 to-inkwell/10">
                <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center gap-2 text-inkwell">
                        <CheckCircle2 className="w-5 h-5 text-inkwell" />
                        ✅ Identidad Verificada
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                    <p className="text-sm text-lunar-eclipse">
                        Tus documentos han sido validados exitosamente. <strong className="text-inkwell">Por seguridad, no es posible modificarlos.</strong>
                    </p>
                    <div className="flex flex-wrap gap-2">
                        {dniFrontUrl && (
                            <span className="inline-flex items-center gap-1 px-3 py-1.5 bg-inkwell text-white rounded-full text-xs font-medium">
                                <CheckCircle2 className="w-3 h-3" />
                                DNI Frontal ✓
                            </span>
                        )}
                        {dniBackUrl && (
                            <span className="inline-flex items-center gap-1 px-3 py-1.5 bg-inkwell text-white rounded-full text-xs font-medium">
                                <CheckCircle2 className="w-3 h-3" />
                                DNI Trasero ✓
                            </span>
                        )}
                        {utilityBillUrl && (
                            <span className="inline-flex items-center gap-1 px-3 py-1.5 bg-inkwell text-white rounded-full text-xs font-medium">
                                <CheckCircle2 className="w-3 h-3" />
                                Recibo de Servicios ✓
                            </span>
                        )}
                    </div>
                    <p className="text-xs text-lunar-eclipse/70">
                        Si necesitas actualizar tu DNI o dirección, por favor contacta a soporte.
                    </p>
                </CardContent>
            </Card>
        );
    }

    if (status === 'rejected') {
        return (
            <Card className="border-creme-brulee/40 bg-creme-brulee/5">
                <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center gap-2 text-creme-brulee">
                        <AlertTriangle className="w-5 h-5" />
                        ⚠️ Acción Requerida
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                    <p className="text-sm text-lunar-eclipse">
                        Hubo un problema con tu documentación:
                    </p>
                    {message && (
                        <div className="bg-creme-brulee/10 border border-creme-brulee/30 rounded-lg p-3">
                            <p className="text-sm text-inkwell italic">"{message}"</p>
                        </div>
                    )}
                    <p className="text-sm text-lunar-eclipse">
                        Por favor, sube nuevos documentos para continuar con la verificación.
                    </p>
                </CardContent>
            </Card>
        );
    }

    // Default state (no status or unknown)
    return (
        <Card className="border-au-lait bg-au-lait/10">
            <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2 text-lunar-eclipse">
                    <Shield className="w-5 h-5" />
                    Estado de Verificación
                </CardTitle>
            </CardHeader>
            <CardContent>
                <p className="text-sm text-lunar-eclipse">
                    Estado: {status || 'Desconocido'}
                </p>
            </CardContent>
        </Card>
    );
}
