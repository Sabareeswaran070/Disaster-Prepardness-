import apiClient from "./client";

import type {
    User,
    CreateManagedUserRequest,
    UpdateUserRoleRequest,
    UpdateUserStatusRequest,
} from "../types/user";


export const getUsers = async (): Promise<User[]> => {

    const response = await apiClient.get<User[]>(
        "/users"
    );

    return response.data;
};


export const getUser = async (
    userId: number
): Promise<User> => {

    const response = await apiClient.get<User>(
        `/users/${userId}`
    );

    return response.data;
};


export const createFaculty = async (
    data: CreateManagedUserRequest
): Promise<User> => {

    const response = await apiClient.post<User>(
        "/users/faculty",
        data
    );

    return response.data;
};


export const createInstitutionAdmin = async (
    data: CreateManagedUserRequest
): Promise<User> => {

    const response = await apiClient.post<User>(
        "/users/institution-admin",
        data
    );

    return response.data;
};


export const updateUserRole = async (
    userId: number,
    data: UpdateUserRoleRequest
): Promise<User> => {

    const response = await apiClient.patch<User>(
        `/users/${userId}/role`,
        data
    );

    return response.data;
};


export const updateUserStatus = async (
    userId: number,
    data: UpdateUserStatusRequest
): Promise<User> => {

    const response = await apiClient.patch<User>(
        `/users/${userId}/status`,
        data
    );

    return response.data;
};
