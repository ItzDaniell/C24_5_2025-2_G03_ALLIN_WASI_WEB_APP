export interface User {
    id: string;
    name: string;
    email: string;
    image: string;
    role: string;
}

export interface Tenant extends User {
    phone: string;
    code: string;
    carrer: string;
    cicle: string;
    monthly_budget: string;
    origin_department: string;
}

export interface Landlord extends User {
    phone: string;
    dni: string;
    address: string;
    propertyCount: string;
}