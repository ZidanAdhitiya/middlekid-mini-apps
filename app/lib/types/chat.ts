// Chat message types
export interface ChatMessage {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    timestamp: Date;
    status?: 'sending' | 'sent' | 'error';
}

// API request/response types
export interface ChatRequest {
    message: string;
    conversationHistory?: ChatMessage[];
}

export interface ChatResponse {
    response: string;
    success: boolean;
    error?: string;
}
