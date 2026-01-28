import { configService } from "./configService";

export interface WhatsAppResponse {
    status: string;
    data: any;
    message?: string;
}

export const sendWhatsAppMessage = async (phone: string, message: string): Promise<WhatsAppResponse> => {
    try {
        const apiUrl = await configService.getApiUrl();
        const url = `${apiUrl.replace(/\/$/, '')}/whatsapp_send`;
        
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ phone, message }),
        });

        if (!response.ok) {
             throw new Error(`Error: ${response.statusText}`);
        }

        return await response.json();
    } catch (error) {
        console.error("WhatsApp Send Error:", error);
        return { status: 'error', data: null, message: error instanceof Error ? error.message : String(error) };
    }
};

export const WhatsAppService = {
    sendMessage: sendWhatsAppMessage
};
