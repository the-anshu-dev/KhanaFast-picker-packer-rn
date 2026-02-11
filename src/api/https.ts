import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '../utils/env';

const BASE_URL = API_URL || 'https://blinket-backend.vercel.app/';

interface RequestOptions extends RequestInit {
    headers?: any;
    isJSON?: boolean;
}

const getFormData = (object: any) => {
    const formData = new FormData();
    Object.keys(object).forEach(key => {
        const value = object[key];
        if (Array.isArray(value)) {
            value.forEach((v, i) => {
                formData.append(`${key}[${i}]`, v);
            });
        } else {
            formData.append(key, value);
        }
    });
    return formData;
};

const request = async <T>(
    endpoint: string,
    method: string,
    data?: any,
    options?: RequestOptions
): Promise<T> => {
    const url = endpoint.startsWith('http') ? endpoint : `${BASE_URL}${endpoint}`;

    // Get token from AsyncStorage
    let token = null;
    try {
        token = await AsyncStorage.getItem('user_token');
        if (token) token = token.trim();
        console.log("Retrieved Token from Storage:", token);
    } catch (e) {
        console.error("Error reading token", e);
    }

    const defaultHeaders: any = {
        // 'Content-Type': 'multipart/form-data', // Fetch automatically sets this with boundary when body is FormData
        ...(token ? { 'Authorization': token.startsWith('Bearer ') ? token : `Bearer ${token}` } : {})
    };

    if (!data) {
        defaultHeaders['Content-Type'] = 'application/json';
    }

    console.log("Request Headers:", defaultHeaders);

    const config: RequestInit = {
        method,
        headers: {
            ...defaultHeaders,
            ...options?.headers,
        },
        ...options,
    };

    if (data) {
        if (options?.isJSON) {
            config.headers = {
                ...config.headers,
                'Content-Type': 'application/json',
            };
            config.body = JSON.stringify(data);
        } else {
            config.body = getFormData(data);
        }
    }

    console.log("Request URL ==========>", url);
    console.log("Request Config ==========>", config);
    // payload
    console.log("Request Payload ==========>", data);
    try {
        const response = await fetch(url, config);
        const text = await response.text();
        console.log("Raw Response ==========>", url, response.status, text);

        let responseData;
        try {
            responseData = JSON.parse(text);
        } catch (e) {
            console.log("JSON Parse Error (likely HTML response). Raw text:", text);
            throw new Error(`Failed to parse JSON. Status: ${response.status}. Content: ${text.substring(0, 200)}...`);
        }

        console.log("Response Data ==========>", url, config, responseData)
        if (!response.ok) {
            throw new Error(responseData.message || 'Something went wrong');
        }

        return responseData;
    } catch (error: any) {
        console.log(`API Error (${method} ${endpoint}):`, error);
        throw error;
    }
};

export const https = {
    get: <T>(endpoint: string, options?: RequestOptions) =>
        request<T>(endpoint, 'GET', undefined, options),

    post: <T>(endpoint: string, data: any, options?: RequestOptions) =>
        request<T>(endpoint, 'POST', data, options),

    put: <T>(endpoint: string, data: any, options?: RequestOptions) =>
        request<T>(endpoint, 'PUT', data, options),

    delete: <T>(endpoint: string, options?: RequestOptions) =>
        request<T>(endpoint, 'DELETE', undefined, options),

    patch: <T>(endpoint: string, data: any, options?: RequestOptions) =>
        request<T>(endpoint, 'PATCH', data, options),
};
