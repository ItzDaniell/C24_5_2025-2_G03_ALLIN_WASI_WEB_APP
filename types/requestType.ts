export enum RequestStatus {
  PENDING = 'pending',
  ACCEPTED = 'accepted',
  REJECTED = 'rejected',
}

export interface Request {
  id: string;
  message?: string;
  status: RequestStatus;
  propertyId: string;
  property?: {
    id: string;
    title: string;
    address?: string;
    city?: string;
    monthlyPrice?: number;
  };
  tenantId: string;
  tenant?: {
    id: string;
    fullName?: string;
    email?: string;
    profilePicture?: string | null;
  };
  createdAt: string;
  updatedAt: string;
}

export interface CreateRequestDto {
  propertyId: string;
  message?: string;
}



