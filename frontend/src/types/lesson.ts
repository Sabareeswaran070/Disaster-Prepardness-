export interface Lesson {
    id: number;
    disaster_id: number;
    title: string;
    description: string | null;
    content: string | null;
    difficulty: string;
    duration_minutes: number | null;
    is_published: boolean;
    created_at: string;
    updated_at: string;
}

export interface LearningMaterial {
    id: number;
    lesson_id: number;
    title: string;
    material_type: string;
    file_url: string | null;
    created_at: string;
}
