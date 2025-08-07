export interface SupportTypeResponse {
    status: string;
    message: string;
    data: SupportType[];
}

export interface SupportType {
    id: number;
    name: string;
    description?: string;
    active: boolean;
}

export interface SupportTypeRequest {
    name: string;
    description?: string;
}

export interface SupportTypeSelected {
    id: number;
    name: string;
    description?: string;
    active: boolean;
}

export interface SaveSupportTypeResponse {
    status: string;
    message: string;
    data: SupportType;
}

export interface DeleteResponse {
    status: string;
    message: string;
}