export interface UserType {
    id: string;
    fullName: string;   
    email: string;
    profilePicture: string;
    role: string;
}

export interface UpdateUserData {
    fullName?: string;
    profilePicture?: string;
}

export interface Tenant extends UserType {
    phone: string;
    code: string;
    carrer: string;
    cicle: string;
    monthly_budget: string;
    origin_department: string;
}

export interface Landlord extends UserType {
    phone: string;
    dni: string;
    address: string;
    propertyCount: string;
}

export interface UpdateLandlordData {
    phone: string;
    dni: string;
    address: string;
    propertyCount: string;
}