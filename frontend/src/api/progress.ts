import apiClient from "./client";

export interface StudentDashboardResponse {
    total_lessons: number;
    completed_lessons: number;
    lesson_completion_percentage: number;

    total_quizzes: number;
    completed_quizzes: number;
    quiz_average_percentage: number;
    quizzes_passed: number;

    total_simulations: number;
    completed_simulations: number;
    simulation_average_percentage: number;

    overall_preparedness_percentage: number;
}

export interface QuizProgressResponse {
    quiz_id: number;
    quiz_title: string;
    attempts: number;
    best_score: number;
    total_points: number;
    best_percentage: number;
    passed: boolean;
}

export interface SimulationProgressResponse {
    simulation_id: number;
    simulation_title: string;
    scenarios_answered: number;
    score: number;
    max_score: number;
    percentage: number;
    completed: boolean;
}

export interface LessonProgressResponse {
    lesson_id: number;
    lesson_title: string;
    status: string;
    progress_percentage: number;
    completed_at: string | null;
}

export const getStudentDashboard =
    async (): Promise<StudentDashboardResponse> => {
        const response =
            await apiClient.get<StudentDashboardResponse>(
                "/progress/dashboard"
            );

        return response.data;
    };

export const getLessonProgress =
    async (): Promise<LessonProgressResponse[]> => {
        const response =
            await apiClient.get<LessonProgressResponse[]>(
                "/progress/lessons"
            );

        return response.data;
    };

export const getQuizProgress =
    async (): Promise<QuizProgressResponse[]> => {
        const response =
            await apiClient.get<QuizProgressResponse[]>(
                "/progress/quizzes"
            );

        return response.data;
    };

export const getSimulationProgress =
    async (): Promise<SimulationProgressResponse[]> => {
        const response =
            await apiClient.get<SimulationProgressResponse[]>(
                "/progress/simulations"
            );

        return response.data;
    };