export interface Disaster {
    id: number;
    name: string;
    description: string | null;
    preparedness_guidelines: string | null;
    response_guidelines: string | null;
    recovery_guidelines: string | null;
    is_active: boolean;
    created_at: string;
}
