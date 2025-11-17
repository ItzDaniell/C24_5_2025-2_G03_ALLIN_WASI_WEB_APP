"use client";
import React from "react";
import { Card, CardContent } from "@/ui/card";
import { Badge } from "@/ui/badge";
import { Button } from "@/ui/button";
import { Input } from "@/ui/input";
import useRequests from "@/modules/dashboard/data/queries/useRequests";
import { useAcceptRequest, useRejectRequest } from "@/modules/dashboard/data/mutations/useRequestActions";
import { RequestStatus, Request } from "@/types/requestType";
import { FileText, Search, CheckCircle, XCircle, Clock, MapPin, Building, User, ArrowLeft } from "lucide-react";
import useDebouncedValue from "@/modules/dashboard/hooks/useDebouncedValue";

interface RequestsViewProps {
  onViewChange: (view: string) => void;
}

const formatDate = (date: string | Date) => {
  const d = new Date(date);
  return d.toLocaleDateString("es-ES", { 
    year: "numeric", 
    month: "long", 
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  });
};

const getStatusBadge = (status: RequestStatus) => {
  switch (status) {
    case RequestStatus.PENDING:
      return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">Pendiente</Badge>;
    case RequestStatus.ACCEPTED:
      return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Aceptada</Badge>;
    case RequestStatus.REJECTED:
      return <Badge className="bg-red-100 text-red-800 hover:bg-red-100">Rechazada</Badge>;
    default:
      return <Badge variant="secondary">{status}</Badge>;
  }
};

export function RequestsView({ onViewChange }: RequestsViewProps) {
  const [filter, setFilter] = React.useState<RequestStatus | "all">("all");
  const [search, setSearch] = React.useState("");
  const debouncedSearch = useDebouncedValue(search, 300);

  const { data: requests, isLoading, error } = useRequests("landlord");
  const { mutate: acceptRequest, isPending: accepting } = useAcceptRequest();
  const { mutate: rejectRequest, isPending: rejecting } = useRejectRequest();

  const filteredRequests = React.useMemo(() => {
    if (!requests) return [];
    let filtered = requests;

    // Filtrar por estado
    if (filter !== "all") {
      filtered = filtered.filter((r) => r.status === filter);
    }

    // Filtrar por búsqueda
    if (debouncedSearch.trim()) {
      const q = debouncedSearch.toLowerCase();
      filtered = filtered.filter((r) => {
        const propertyTitle = r.property?.title?.toLowerCase() || "";
        const tenantName = r.tenant?.fullName?.toLowerCase() || "";
        const message = r.message?.toLowerCase() || "";
        return propertyTitle.includes(q) || tenantName.includes(q) || message.includes(q);
      });
    }

    return filtered;
  }, [requests, filter, debouncedSearch]);

  const pendingCount = requests?.filter((r) => r.status === RequestStatus.PENDING).length || 0;
  const acceptedCount = requests?.filter((r) => r.status === RequestStatus.ACCEPTED).length || 0;
  const rejectedCount = requests?.filter((r) => r.status === RequestStatus.REJECTED).length || 0;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={() => onViewChange("dashboard")} className="cursor-pointer">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver
          </Button>
        </div>
        <div className="text-lunar-eclipse">Cargando solicitudes...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={() => onViewChange("dashboard")} className="cursor-pointer">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver
          </Button>
        </div>
        <div className="text-red-600">Error al cargar las solicitudes</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={() => onViewChange("dashboard")} className="cursor-pointer">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver
          </Button>
          <div>
            <h1 className="mb-2 text-inkwell">Solicitudes</h1>
            <p className="text-lunar-eclipse">Gestiona las solicitudes de alquiler de tus propiedades</p>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-white border-au-lait">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-lunar-eclipse">Total</p>
                <p className="text-inkwell text-2xl font-semibold">{requests?.length || 0}</p>
              </div>
              <FileText className="w-8 h-8 text-lunar-eclipse" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border-au-lait">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-lunar-eclipse">Pendientes</p>
                <p className="text-inkwell text-2xl font-semibold">{pendingCount}</p>
              </div>
              <Clock className="w-8 h-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border-au-lait">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-lunar-eclipse">Aceptadas</p>
                <p className="text-inkwell text-2xl font-semibold">{acceptedCount}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border-au-lait">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-lunar-eclipse">Rechazadas</p>
                <p className="text-inkwell text-2xl font-semibold">{rejectedCount}</p>
              </div>
              <XCircle className="w-8 h-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="border-au-lait">
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row gap-3 items-stretch">
            <div className="flex-1 relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <Search className="w-4 h-4 text-lunar-eclipse" />
              </span>
              <Input 
                placeholder="Buscar por propiedad, inquilino o mensaje"
                className="pl-10 h-11 bg-white border-2 border-gray-200 rounded-lg pr-4 focus:border-creme-brulee focus:ring-2 focus:ring-creme-brulee focus:ring-opacity-20 transition-all"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              <Button
                variant={filter === "all" ? "default" : "outline"}
                size="sm"
                onClick={() => setFilter("all")}
                className={filter === "all" ? "bg-creme-brulee text-white" : "border-au-lait text-inkwell"}
              >
                Todas
              </Button>
              <Button
                variant={filter === RequestStatus.PENDING ? "default" : "outline"}
                size="sm"
                onClick={() => setFilter(RequestStatus.PENDING)}
                className={filter === RequestStatus.PENDING ? "bg-creme-brulee text-white" : "border-au-lait text-inkwell"}
              >
                Pendientes
              </Button>
              <Button
                variant={filter === RequestStatus.ACCEPTED ? "default" : "outline"}
                size="sm"
                onClick={() => setFilter(RequestStatus.ACCEPTED)}
                className={filter === RequestStatus.ACCEPTED ? "bg-creme-brulee text-white" : "border-au-lait text-inkwell"}
              >
                Aceptadas
              </Button>
              <Button
                variant={filter === RequestStatus.REJECTED ? "default" : "outline"}
                size="sm"
                onClick={() => setFilter(RequestStatus.REJECTED)}
                className={filter === RequestStatus.REJECTED ? "bg-creme-brulee text-white" : "border-au-lait text-inkwell"}
              >
                Rechazadas
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Requests List */}
      {filteredRequests.length === 0 ? (
        <Card className="border-au-lait">
          <CardContent className="p-6 text-center">
            <FileText className="w-12 h-12 text-lunar-eclipse mx-auto mb-4" />
            <p className="text-lunar-eclipse">
              {search || filter !== "all"
                ? "No se encontraron solicitudes que coincidan con los filtros."
                : "Aún no tienes solicitudes de alquiler."}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filteredRequests.map((request: Request) => (
            <Card key={request.id} className="border-au-lait hover:shadow-md transition-shadow">
              <CardContent className="p-5">
                {/* Header: Estado + Fecha */}
                <div className="flex items-center justify-between mb-3">
                  {getStatusBadge(request.status)}
                  <span className="text-xs text-lunar-eclipse">{formatDate(request.createdAt)}</span>
                </div>
                {/* Propiedad */}
                <div className="mb-3">
                  <h3 className="text-inkwell font-semibold line-clamp-1">
                    {request.property?.title || "Propiedad sin título"}
                  </h3>
                  <div className="flex items-center gap-4 text-sm text-lunar-eclipse mt-1">
                    {request.property?.address && (
                      <div className="flex items-center gap-1 min-w-0">
                        <MapPin className="w-4 h-4 flex-shrink-0" />
                        <span className="truncate">
                          {request.property.address}
                          {request.property.city && `, ${request.property.city}`}
                        </span>
                      </div>
                    )}
                    {request.property?.monthlyPrice && (
                      <div className="flex items-center gap-1">
                        <Building className="w-4 h-4" />
                        S/{request.property.monthlyPrice.toLocaleString()}/mes
                      </div>
                    )}
                  </div>
                </div>
                {/* Inquilino + Mensaje */}
                <div className="bg-au-lait/50 rounded-lg p-3">
                  <div className="flex items-start gap-3">
                    <User className="w-5 h-5 text-lunar-eclipse mt-0.5" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-inkwell font-medium truncate">
                        {request.tenant?.fullName || request.tenant?.email || "Inquilino"}
                      </p>
                      {request.message && (
                        <p className="text-sm text-inkwell/90 mt-1 line-clamp-3">
                          {request.message}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
                {/* Acciones */}
                <div className="flex gap-2 mt-4">
                  <Button
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white cursor-pointer"
                    onClick={() => acceptRequest(request.id)}
                    disabled={accepting || rejecting || request.status !== RequestStatus.PENDING}
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Aceptar
                  </Button>
                  <Button
                    variant="outline"
                    className="flex-1 border-red-300 text-red-600 hover:bg-red-50 cursor-pointer"
                    onClick={() => rejectRequest(request.id)}
                    disabled={accepting || rejecting || request.status !== RequestStatus.PENDING}
                  >
                    <XCircle className="w-4 h-4 mr-2" />
                    Rechazar
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}






