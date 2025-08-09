export interface UserResponse {
    status: string;
    message: string;
    data: User[];
}

export interface User {
    id: number;
    firstName: string;
    lastName: string;
    secondLastName: string;
    email: string;
    role: string;
    company: CompanyBasic;
    active: boolean;
}

export interface UserRequest {
    firstName: string;
    lastName: string;
    secondLastName: string;
    email: string;
    password?: string;
    role: string;
    companyId: number;
}

export interface UserSelected {
    id: number;
    firstName: string;
    lastName: string;
    secondLastName: string;
    email: string;
    role: string;
    company: CompanyBasic;
    active: boolean;
}

export interface SaveUserResponse {
    status: string;
    message: string;
    data: User;
}

export interface DeleteResponse {
    status: string;
    message: string;
}

interface CompanyBasic {
    id: number;
    name: string;
}