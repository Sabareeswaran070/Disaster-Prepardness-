export interface User {
    id: number;
    full_name: string;
    email: string;
    role: string;
    institution_id: number | null;
    is_active: boolean;
    created_at: string;
}

export interface CreateManagedUserRequest {
    full_name: string;
    email: string;
    password: string;
    institution_id?: number | null;
}

export interface UpdateUserRoleRequest {
    role: string;
}

export interface UpdateUserStatusRequest {
    is_active: boolean;
}
