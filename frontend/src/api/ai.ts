import apiClient from "./client";

export interface AIChatRequest {
    message: string;
}

export interface AIChatResponse {
    answer: string;
}

export const chatWithAI =
    async (
        message: string
    ): Promise<AIChatResponse> => {

        const response =
            await apiClient.post<AIChatResponse>(
                "/ai/chat",
                {
                    message,
                }
            );

        return response.data;
    };
