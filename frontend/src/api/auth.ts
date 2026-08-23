import apiClient from "./client";

export interface LoginRequest {
    email: string;
    password: string;
}

export interface RegisterRequest {
    full_name: string;
    email: string;
    password: string;
    institution_id?: number | null;
}

export interface TokenResponse {
    access_token: string;
    token_type: string;
}

export interface UserResponse {
    id: number;
    full_name: string;
    email: string;
    role: string;
    institution_id: number | null;
    is_active: boolean;
    created_at: string;
}

export const login = async (
    data: LoginRequest
): Promise<TokenResponse> => {
    const response = await apiClient.post<TokenResponse>(
        "/auth/login",
        data
    );

    return response.data;
};

export const register = async (
    data: RegisterRequest
): Promise<UserResponse> => {
    const response = await apiClient.post<UserResponse>(
        "/auth/register",
        data
    );

    return response.data;
};

export const getCurrentUser = async (): Promise<UserResponse> => {
    const response = await apiClient.get<UserResponse>(
        "/auth/me"
    );

    return response.data;
};