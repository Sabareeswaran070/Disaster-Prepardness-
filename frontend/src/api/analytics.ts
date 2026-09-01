import apiClient from "./client";

export interface UserAnalytics {
    total_users: number;
    active_users: number;
    inactive_users: number;
    total_students: number;
    total_faculty: number;
    total_institution_admins: number;
    total_admins: number;
}

export interface LearningAnalytics {
    total_lessons: number;
    completed_lessons: number;
    lesson_completion_percentage: number;
}

export interface QuizAnalytics {
    total_quizzes: number;
    total_attempts: number;
    completed_attempts: number;
    passed_attempts: number;
    average_percentage: number;
    pass_percentage: number;
}

export interface SimulationAnalytics {
    total_simulations: number;
    total_responses: number;
    completed_simulations: number;
    average_percentage: number;
}

export interface DisasterAnalytics {
    disaster_id: number;
    disaster_name: string;
    total_lessons: number;
    completed_lessons: number;
    lesson_completion_percentage: number;
    total_quizzes: number;
    quiz_attempts: number;
    quiz_average_percentage: number;
    total_simulations: number;
    simulation_responses: number;
}

export interface AnalyticsDashboard {
    users: UserAnalytics;
    learning: LearningAnalytics;
    quizzes: QuizAnalytics;
    simulations: SimulationAnalytics;
    disasters: DisasterAnalytics[];
}


export const getAnalyticsDashboard =
    async (): Promise<AnalyticsDashboard> => {

        const response =
            await apiClient.get<AnalyticsDashboard>(
                "/analytics/dashboard"
            );

        return response.data;
    };