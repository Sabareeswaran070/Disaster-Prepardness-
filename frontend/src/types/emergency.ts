export interface Emergency {
    id: number;
    disaster_id: number | null;
    name: string;
    category: string;
    phone: string | null;
    description: string | null;
    is_active: boolean;
    created_at: string;
    updated_at: string;
}
export interface EmergencyCreate {
    disaster_id?: number | null;
    name: string;
    category: string;
    phone?: string | null;
    description?: string | null;
}

export interface EmergencyUpdate {
    disaster_id?: number | null;
    name?: string;
    category?: string;
    phone?: string | null;
    description?: string | null;
    is_active?: boolean;
}