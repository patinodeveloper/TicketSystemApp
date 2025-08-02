export interface CompanyResponse {
    status: string;
    message: string;
    data: Company[];
}

export interface Company {
    id: number;
    name: string;
    legalName?: string;
    rfc?: string;
    giro: string;
    address?: string;
    phone: string;
    secondPhone?: string;
    email?: string;
    active: boolean;
}

export interface CompanyRequest {
    name: string;
    legalName?: string;
    rfc?: string;
    giro: string;
    address?: string;
    phone: string;
    secondPhone?: string;
    email?: string;
}

export interface CompanySelected {
    id: number;
    name: string;
    legalName?: string;
    rfc?: string;
    giro: string;
    address?: string;
    phone: string;
    secondPhone?: string;
    email?: string;
    active: boolean;
}

export interface SaveCompanyResponse {
    status: string;
    message: string;
    data: Company;
}

export interface DeleteResponse {
    status: string;
    message: string;
}