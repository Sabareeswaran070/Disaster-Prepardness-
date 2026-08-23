import apiClient from "./client";

import type {
    Quiz,
    StudentQuizDetail,
    StartQuizResponse,
    SubmitQuizRequest,
    QuizResult,
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