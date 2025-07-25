export interface ResponseTemplate<T> {
    success: boolean;
    data?: T;
    message?: string;
    timestamp: string;
}