export interface UserResponse {
    status: string;
    message: string;
    data: User[];
}

export interface User {
    id: number;
    firstName: string;
    lastName: string;
    username: string;
    email: string;
    roles: RoleBasic[];
}

interface RoleBasic {
    id: number;
    name: string;
}

export interface UserRequest {
    firstName: string;
    lastName: string;
    username: string;
    email: string;
    password?: string;
    roleIds: number[];
}

export interface UserSelected {
    id: number;
    firstName: string;
    lastName: string;
    username: string;
    email: string;
    password: string;
    roleIds: number[];
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