import apiClient from "./client";

import type {
    Lesson,
    LearningMaterial,
} from "../types/lesson";

export const getLessons = async (
    disasterId?: number
): Promise<Lesson[]> => {
    const response = await apiClient.get<Lesson[]>(
        "/lessons",
        {
            params:
                disasterId !== undefined
                    ? { disaster_id: disasterId }
                    : undefined,
        }
    );

    return response.data;
};

export const getLesson = async (
    lessonId: number
): Promise<Lesson> => {
    const response = await apiClient.get<Lesson>(
        `/lessons/${lessonId}`
    );

    return response.data;
};

export const getLessonMaterials = async (
    lessonId: number
): Promise<LearningMaterial[]> => {
    const response =
        await apiClient.get<LearningMaterial[]>(
            `/lessons/${lessonId}/materials`
        );

    return response.data;
};

export const updateLessonProgress = async (
    lessonId: number,
    progressPercentage: number,
    statusValue: string
) => {
    const response = await apiClient.put(
        `/progress/lessons/${lessonId}`,
        null,
        {
            params: {
                progress_percentage:
                    progressPercentage,
                status_value: statusValue,
            },
        }
    );

    return response.data;
};
