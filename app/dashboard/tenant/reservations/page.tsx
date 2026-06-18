"use client";
import React from "react";
import { useRouter } from "next/navigation";
import {
  CalendarCheck,
  MapPin,
  Calendar,
  Clock,
  MessageSquare,
  Loader2,
} from "lucide-react";
import { Button } from "@/ui/button";
import { Card, CardContent } from "@/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/ui/dialog";
import { Skeleton } from "@/ui/skeleton";
import { ViewHeader } from "@/modules/tenant/components/ViewHeader";
import useTenantRequests from "@/modules/tenant/data/queries/useTenantRequests";
import useDeleteRequest from "@/modules/tenant/data/mutations/useDeleteRequest";
import { useCreateConversation } from "@/modules/landlord/data/mutations/useChatActions";
import { ImageWithSkeleton } from "@/modules/shared/components/ImageWithSkeleton";

const toDataUrl = (value?: string | null): string | undefined => {
  if (!value) return undefined;
  return value.startsWith("data:") || value.startsWith("http")
    ? value
    : `data:image/jpeg;base64,${value}`;
};

export default function TenantReservationsPage() {
  const router = useRouter();
  const { data: myRequests, isLoading: loadingRequests } = useTenantRequests();
  const { mutate: deleteRequest } = useDeleteRequest();
  const { mutate: createChat, isPending: creatingChat } = useCreateConversation();

  const [reservationFilter, setReservationFilter] =
    React.useState<string>("pending");
  const [requestToCancel, setRequestToCancel] = React.useState<string | null>(
    null
  );

  const statusFilters = [
    { id: "pending", label: "Pendientes" },
    { id: "accepted", label: "Confirmadas" },
    { id: "rejected", label: "Rechazadas" },
    { id: "all", label: "Historial" },
  ];

  const getStatusCount = (status: string) => {
    if (!myRequests) return 0;
    if (status === "all") return myRequests.length;
    return myRequests.filter((r: any) => r.status === status).length;
  };

  const filteredRequests =
    reservationFilter === "all"
      ? myRequests
      : myRequests?.filter((r: any) => r.status === reservationFilter);

  const handleChangeView = (v: string, propertyId?: string, chatId?: string) => {
    router.push(`/dashboard/tenant/${v}`);
  };

  return (
    <div className="space-y-8">
      <ViewHeader
        title="Mis Reservas"
        description="Gestiona tus solicitudes y mantente al tanto de tus futuros mudanzas."
      />

      {/* Status Tabs */}
      <div className="bg-slate-100 p-1.5 rounded-full flex gap-1.5 border border-slate-200/50 shadow-inner">
        {statusFilters.map((f) => {
          const isActive = reservationFilter === f.id;
          const count = getStatusCount(f.id);
          return (
            <button
              key={f.id}
              onClick={() => setReservationFilter(f.id)}
              className={`
                      flex-1 py-2.5 px-4 rounded-full text-sm font-semibold transition-all flex items-center justify-center gap-2
                      ${
                        isActive
                          ? "bg-white text-slate-900 shadow-sm border border-slate-200"
                          : "text-slate-500 hover:text-slate-700 hover:bg-white/40"
                      }
                    `}
            >
              {f.label}
              <span
                className={`
                      px-2 py-0.5 rounded-full text-[10px] font-bold
                      ${
                        isActive
                          ? "bg-creme-brulee text-white"
                          : "bg-slate-200 text-slate-500"
                      }
                    `}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {loadingRequests ? (
        <div className="flex justify-center py-20">
          <Loader2 className="w-10 h-10 animate-spin text-creme-brulee" />
        </div>
      ) : !filteredRequests || filteredRequests.length === 0 ? (
        <div className="bg-white rounded-3xl p-16 text-center border border-dashed border-au-lait shadow-sm">
          <CalendarCheck className="w-16 h-16 text-slate-200 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-inkwell mb-2">
            No hay reservas en esta categoría
          </h3>
          <p className="text-lunar-eclipse mb-6">
            Parece que no tienes solicitudes con el estado seleccionado.
          </p>
          <Button
            onClick={() => setReservationFilter("all")}
            variant="outline"
            className="rounded-xl border-au-lait"
          >
            Ver todo el historial
          </Button>
        </div>
      ) : (
        <div className="space-y-6">
          {filteredRequests.map((req: any) => (
            <Card
              key={req.id}
              className="overflow-hidden border-slate-200 shadow-sm rounded-[2rem] bg-white border p-5 cursor-pointer hover:border-creme-brulee/50 transition-all hover:shadow-md group"
              onClick={() =>
                handleChangeView("property-details", req.propertyId)
              }
            >
              <div className="flex flex-col sm:flex-row gap-5">
                <div className="w-24 h-24 sm:w-32 sm:h-32 shrink-0">
                  <ImageWithSkeleton
                    src={
                      req.property?.images?.[0]?.url ||
                      "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688"
                    }
                    alt={req.property?.title}
                    className="w-full h-full rounded-2xl"
                  />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start mb-1">
                    <h4 className="font-bold text-xl text-slate-800 truncate pr-4 group-hover:text-creme-brulee transition-colors">
                      {req.property?.title}
                    </h4>
                    <div
                      className={`
                              flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold border shrink-0
                              ${
                                req.status === "pending"
                                  ? "bg-amber-50 text-amber-600 border-amber-100"
                                  : ""
                              }
                              ${
                                req.status === "accepted"
                                  ? "bg-emerald-50 text-emerald-600 border-emerald-100"
                                  : ""
                              }
                              ${
                                req.status === "rejected"
                                  ? "bg-red-50 text-red-600 border-red-100"
                                  : ""
                              }
                            `}
                    >
                      <div
                        className={`size-1.5 rounded-full ${
                          req.status === "pending"
                            ? "bg-amber-400"
                            : req.status === "accepted"
                            ? "bg-emerald-400"
                            : "bg-red-400"
                        }`}
                      />
                      {req.status === "pending"
                        ? "Pendiente"
                        : req.status === "accepted"
                        ? "Confirmada"
                        : "Rechazada"}
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 text-slate-400 text-sm mb-3">
                    <MapPin className="w-3.5 h-3.5" />
                    <span className="truncate">{req.property?.address}</span>
                  </div>

                  <div className="flex items-center gap-3 mb-4">
                    <Avatar className="size-8 border-2 border-white shadow-sm ring-1 ring-slate-100">
                      <AvatarImage
                        src={toDataUrl(req.property?.landlord?.profilePicture)}
                        className="object-cover"
                      />
                      <AvatarFallback className="text-[10px] font-bold bg-gradient-to-br from-creme-brulee/20 to-creme-brulee/40 text-creme-brulee">
                        {(req.property?.landlord?.fullName || "A")[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider leading-none mb-1">
                        Arrendador
                      </span>
                      <span className="text-sm font-bold text-slate-700 leading-none">
                        {req.property?.landlord?.fullName || "No asignado"}
                      </span>
                    </div>
                    <div className="ml-auto flex flex-col items-end">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider leading-none mb-1">
                        Precio
                      </span>
                      <span className="text-sm font-black text-creme-brulee leading-none">
                        S/ {req.property?.monthlyPrice}/mes
                      </span>
                    </div>
                  </div>

                  <div className="space-y-1 mb-5">
                    <div className="flex items-center gap-2 text-slate-400 text-xs">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>
                        Solicitado:{" "}
                        {new Date(req.createdAt).toLocaleDateString("es-PE", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-400 text-xs">
                      <Clock className="w-3.5 h-3.5 opacity-70" />
                      <span>Mudanza: Próximamente</span>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      disabled={creatingChat}
                      onClick={(e) => {
                        e.stopPropagation();
                        if (req.property?.landlordId) {
                          createChat(
                            { participantId: req.property.landlordId },
                            {
                              onSuccess: (data) =>
                                handleChangeView("messages", undefined, data.id),
                            }
                          );
                        } else {
                          handleChangeView("messages");
                        }
                      }}
                      className="rounded-xl h-10 px-6 text-xs font-bold border-slate-200 text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      {creatingChat ? "Cargando..." : "Contactar"}
                    </Button>
                    {req.status === "pending" ? (
                      <Button
                        variant="destructive"
                        className="rounded-xl h-10 px-6 text-xs font-bold bg-red-50 text-red-600 border-red-100 hover:bg-red-100 border transition-colors shadow-none"
                        onClick={(e) => {
                          e.stopPropagation();
                          setRequestToCancel(req.id);
                        }}
                      >
                        Cancelar
                      </Button>
                    ) : (
                      <Button
                        variant="outline"
                        className="rounded-xl h-10 px-6 text-xs font-bold border-slate-200 text-slate-700 hover:bg-slate-50"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleChangeView("property-details", req.propertyId);
                        }}
                      >
                        Detalles
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Cancel Request Dialog */}
      <Dialog
        open={!!requestToCancel}
        onOpenChange={(open) => !open && setRequestToCancel(null)}
      >
        <DialogContent className="rounded-2xl border-au-lait">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-inkwell">
              ¿Cancelar solicitud?
            </DialogTitle>
            <DialogDescription className="text-lunar-eclipse">
              Esta acción no se puede deshacer. La solicitud será eliminada y el
              arrendador será notificado.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex gap-2 sm:gap-3">
            <Button
              variant="outline"
              onClick={() => setRequestToCancel(null)}
              className="rounded-xl border-au-lait text-lunar-eclipse hover:bg-au-lait/10"
            >
              Volver
            </Button>
            <Button
              onClick={() => {
                if (requestToCancel) {
                  deleteRequest(requestToCancel);
                  setRequestToCancel(null);
                }
              }}
              className="rounded-xl bg-red-600 hover:bg-red-700 text-white"
            >
              Sí, cancelar solicitud
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
