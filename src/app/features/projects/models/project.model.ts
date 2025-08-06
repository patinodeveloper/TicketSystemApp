export interface ProjectResponse {
    status: string;
    message: string;
    data: Project[];
}

export interface Project {
    id: number;
    name: string;
    description?: string;
    company: CompanyBasic;
    active: boolean;
}

export interface ProjectRequest {
    name: string;
    description?: string;
    companyId: number;
}

export interface ProjectSelected {
    id: number;
    name: string;
    description?: string;
    company: CompanyBasic;
    active: boolean;
}

export interface SaveProjectResponse {
    status: string;
    message: string;
    data: Project;
}

export interface DeleteResponse {
    status: string;
    message: string;
}

interface CompanyBasic {
    id: number;
    name: string;
}