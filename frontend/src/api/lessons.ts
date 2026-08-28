import apiClient from "./client";

import type {
    Lesson,
    LearningMaterial,
    LessonCreate,
    LessonUpdate,
} from "../types/lesson";


export const getLessons = async (
    disasterId?: number
): Promise<Lesson[]> => {

    const response =
        await apiClient.get<Lesson[]>(
            "/lessons",
            {
                params:
                    disasterId !== undefined
                        ? {
                            disaster_id:
                                disasterId,
                        }
                        : undefined,
            }
        );

    return response.data;
};


export const getAdminLessons =
    async (
        disasterId?: number
    ): Promise<Lesson[]> => {

        const response =
            await apiClient.get<Lesson[]>(
                "/lessons/manage",
                {
                    params:
                        disasterId !== undefined
                            ? {
                                disaster_id:
                                    disasterId,
                            }
                            : undefined,
                }
            );

        return response.data;
    };


export const getLesson = async (
    lessonId: number
): Promise<Lesson> => {

    const response =
        await apiClient.get<Lesson>(
            `/lessons/${lessonId}`
        );

    return response.data;
};


export const createLesson =
    async (
        data: LessonCreate
    ): Promise<Lesson> => {

        const response =
            await apiClient.post<Lesson>(
                "/lessons",
                data
            );

        return response.data;
    };


export const updateLesson =
    async (
        lessonId: number,
        data: LessonUpdate
    ): Promise<Lesson> => {

        const response =
            await apiClient.put<Lesson>(
                `/lessons/${lessonId}`,
                data
            );

        return response.data;
    };


export const publishLesson =
    async (
        lessonId: number
    ): Promise<Lesson> => {

        const response =
            await apiClient.patch<Lesson>(
                `/lessons/${lessonId}/publish`
            );

        return response.data;
    };


export const unpublishLesson =
    async (
        lessonId: number
    ): Promise<Lesson> => {

        const response =
            await apiClient.patch<Lesson>(
                `/lessons/${lessonId}/unpublish`
            );

        return response.data;
    };


export const deleteLesson =
    async (
        lessonId: number
    ): Promise<void> => {

        await apiClient.delete(
            `/lessons/${lessonId}`
        );
    };


export const getLessonMaterials =
    async (
        lessonId: number
    ): Promise<LearningMaterial[]> => {

        const response =
            await apiClient.get<LearningMaterial[]>(
                `/lessons/${lessonId}/materials`
            );

        return response.data;
    };


export const updateLessonProgress =
    async (
        lessonId: number,
        progressPercentage: number,
        statusValue: string
    ) => {

        const response =
            await apiClient.put(
                `/progress/lessons/${lessonId}`,
                null,
                {
                    params: {
                        progress_percentage:
                            progressPercentage,
                        status_value:
                            statusValue,
                    },
                }
            );

        return response.data;
    };