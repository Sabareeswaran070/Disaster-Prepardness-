import apiClient from "./client";

import type {
    Quiz,
    StudentQuizDetail,
    StartQuizResponse,
    SubmitQuizRequest,
    QuizResult,
    AdminQuizDetail,
    QuizCreate,
    QuizUpdate,
    QuestionCreate,
    AdminQuestion,
} from "../types/quiz";


export const getQuizzes =
    async (
        disasterId?: number,
        lessonId?: number
    ): Promise<Quiz[]> => {

        const response =
            await apiClient.get<Quiz[]>(
                "/quizzes",
                {
                    params: {
                        disaster_id: disasterId,
                        lesson_id: lessonId,
                    },
                }
            );

        return response.data;
    };


export const getQuiz =
    async (
        quizId: number
    ): Promise<StudentQuizDetail> => {

        const response =
            await apiClient.get<StudentQuizDetail>(
                `/quizzes/${quizId}`
            );

        return response.data;
    };


export const getAdminQuiz =
    async (
        quizId: number
    ): Promise<AdminQuizDetail> => {

        const response =
            await apiClient.get<AdminQuizDetail>(
                `/quizzes/${quizId}/admin`
            );

        return response.data;
    };


export const createQuiz =
    async (
        data: QuizCreate
    ): Promise<Quiz> => {

        const response =
            await apiClient.post<Quiz>(
                "/quizzes",
                data
            );

        return response.data;
    };
export const getAdminQuizzes = async (): Promise<Quiz[]> => {
    const response = await apiClient.get(
        "/quizzes/manage"
    );

    return response.data;
};


export const updateQuiz =
    async (
        quizId: number,
        data: QuizUpdate
    ): Promise<Quiz> => {

        const response =
            await apiClient.put<Quiz>(
                `/quizzes/${quizId}`,
                data
            );

        return response.data;
    };


export const addQuestion =
    async (
        quizId: number,
        data: QuestionCreate
    ): Promise<AdminQuestion> => {

        const response =
            await apiClient.post<AdminQuestion>(
                `/quizzes/${quizId}/questions`,
                data
            );

        return response.data;
    };


export const publishQuiz =
    async (
        quizId: number
    ): Promise<Quiz> => {

        const response =
            await apiClient.patch<Quiz>(
                `/quizzes/${quizId}/publish`
            );

        return response.data;
    };


export const unpublishQuiz =
    async (
        quizId: number
    ): Promise<Quiz> => {

        const response =
            await apiClient.patch<Quiz>(
                `/quizzes/${quizId}/unpublish`
            );

        return response.data;
    };


export const deleteQuiz =
    async (
        quizId: number
    ): Promise<void> => {

        await apiClient.delete(
            `/quizzes/${quizId}`
        );
    };


export const startQuiz =
    async (
        quizId: number
    ): Promise<StartQuizResponse> => {

        const response =
            await apiClient.post<StartQuizResponse>(
                `/quizzes/${quizId}/start`
            );

        return response.data;
    };


export const submitQuiz =
    async (
        attemptId: number,
        data: SubmitQuizRequest
    ): Promise<QuizResult> => {

        const response =
            await apiClient.post<QuizResult>(
                `/quizzes/attempts/${attemptId}/submit`,
                data
            );

        return response.data;
    };
