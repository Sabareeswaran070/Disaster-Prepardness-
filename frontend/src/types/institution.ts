export interface Institution {
    id: number;
    name: string;
    institution_type: string;
    address: string | null;
    city: string | null;
    state: string | null;
    contact_email: string | null;
    contact_phone: string | null;
    is_active: boolean;
    created_at: string;
    updated_at: string;
}