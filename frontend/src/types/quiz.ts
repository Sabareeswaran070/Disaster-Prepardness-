export interface Quiz {
    id: number;
    lesson_id: number | null;
    disaster_id: number | null;
    title: string;
    description: string | null;
    passing_score: number;
    time_limit_minutes: number | null;
    is_published: boolean;
    created_at: string;
}


export interface QuizOption {
    id: number;
    option_text: string;
    option_order: number;
}


export interface AdminQuizOption extends QuizOption {
    question_id: number;
    is_correct: boolean;
}


export interface QuizQuestion {
    id: number;
    question_text: string;
    question_order: number;
    points: number;
    options: QuizOption[];
}


export interface AdminQuestion extends QuizQuestion {
    quiz_id: number;
    options: AdminQuizOption[];
}


export interface StudentQuizDetail extends Quiz {
    questions: QuizQuestion[];
}


export interface AdminQuizDetail extends Quiz {
    questions: AdminQuestion[];
}


export interface QuizCreate {
    lesson_id?: number | null;
    disaster_id?: number | null;
    title: string;
    description?: string | null;
    passing_score: number;
    time_limit_minutes?: number | null;
}


export interface QuizUpdate {
    title?: string;
    description?: string | null;
    passing_score?: number;
    time_limit_minutes?: number | null;
}


export interface QuizOptionCreate {
    option_text: string;
    option_order: number;
    is_correct: boolean;
}


export interface QuestionCreate {
    question_text: string;
    question_order: number;
    points: number;
    options: QuizOptionCreate[];
}


export interface StartQuizResponse {
    attempt_id: number;
    quiz_id: number;
    started_at: string;
}


export interface SubmitAnswer {
    question_id: number;
    selected_option_id: number | null;
}


export interface SubmitQuizRequest {
    answers: SubmitAnswer[];
}


export interface QuizResult {
    attempt_id: number;
    quiz_id: number;
    score: number;
    total_points: number;
    percentage: number;
    passed: boolean;
    completed_at: string;
}
