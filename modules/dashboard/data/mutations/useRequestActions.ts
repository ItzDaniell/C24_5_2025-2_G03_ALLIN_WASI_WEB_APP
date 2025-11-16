import { useMutation, useQueryClient } from "@tanstack/react-query";
import axiosInstance from "@/lib/axios";
import { Request, CreateRequestDto } from "@/types/requestType";
import { toast } from "sonner";

const acceptRequest = async (id: string) => {
  const res = await axiosInstance.patch(`/api/requests/${id}?action=accept`);
  return res.data;
};

const rejectRequest = async (id: string) => {
  const res = await axiosInstance.patch(`/api/requests/${id}?action=reject`);
  return res.data;
};

const updateRequest = async ({ id, ...dto }: { id: string; message?: string }) => {
  const res = await axiosInstance.patch(`/api/requests/${id}`, dto);
  return res.data;
};

const deleteRequest = async (id: string) => {
  const res = await axiosInstance.delete(`/api/requests/${id}`);
  return res.data;
};

const createRequest = async (dto: CreateRequestDto) => {
  const res = await axiosInstance.post("/api/requests", dto);
  return res.data;
};

export function useAcceptRequest() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: acceptRequest,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["requests"] });
      toast.success("Solicitud aceptada");
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || "Error al aceptar solicitud");
    },
  });
}

export function useRejectRequest() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: rejectRequest,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["requests"] });
      toast.success("Solicitud rechazada");
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || "Error al rechazar solicitud");
    },
  });
}

export function useUpdateRequest() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: updateRequest,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["requests"] });
      toast.success("Solicitud actualizada");
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || "Error al actualizar solicitud");
    },
  });
}

export function useDeleteRequest() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: deleteRequest,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["requests"] });
      toast.success("Solicitud eliminada");
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || "Error al eliminar solicitud");
    },
  });
}

export function useCreateRequest() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createRequest,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["requests"] });
      toast.success("Solicitud creada");
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || "Error al crear solicitud");
    },
  });
}



