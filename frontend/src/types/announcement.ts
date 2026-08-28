export interface Announcement {
    id: number;
    disaster_id: number | null;
    title: string;
    message: string;
    priority: string;
    target_role: string;
    is_published: boolean;
    published_at: string | null;
    created_at: string;
    updated_at: string;
}

export interface AnnouncementCreate {
    disaster_id?: number | null;
    title: string;
    message: string;
    priority: string;
    target_role: string;
}

export interface AnnouncementUpdate {
    disaster_id?: number | null;
    title?: string;
    message?: string;
    priority?: string;
    target_role?: string;
    is_published?: boolean;
}
