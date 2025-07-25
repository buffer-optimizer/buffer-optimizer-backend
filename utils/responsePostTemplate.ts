import express from "express";
import {ResponseTemplate} from "../dto/ResponseTemplate";

/**
 * @author Kingsley Baah Brew <kingsleybrew@gmail.com>
 * @return json
 * @todo Its returns a response when a request is made
 */
export const responsePostTemplate = async <T>(
    serviceFunction: () => Promise<T>,
    res: express.Response,
    statusCode: number = 201
): Promise<void> => {
    try {
        const data = await serviceFunction();

        const response: ResponseTemplate<T> = {
            success: true,
            data,
            message: 'Resource created successfully',
            timestamp: new Date().toISOString()
        };

        res.status(statusCode).json(response);
    } catch (error) {
        console.error('Service error:', error);
        throw error;
    }
}

export default responsePostTemplate;