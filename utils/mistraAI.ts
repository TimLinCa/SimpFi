import { Mistral } from '@mistralai/mistralai';
import { AssistantMessage, OCRPageObject, OCRResponse } from '@mistralai/mistralai/models/components';
import * as FileSystem from 'expo-file-system';

const apiKey = process.env.EXPO_PUBLIC_MISTRAL_API_KEY;

const client = new Mistral({ apiKey: apiKey });

async function remoteImageToBase64(uri: string): Promise<string | null> {
    try {
        const response = await fetch(uri);
        const blob = await response.blob();

        return await new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => {
                const base64 = (reader.result as string).split(',')[1];
                resolve(base64);
            };
            reader.onerror = reject;
            reader.readAsDataURL(blob);
        });
    } catch (err) {
        console.error("Failed to convert image to base64:", err);
        return null;
    }
}

async function encodeImage(imagePath: string) {
    try {
        // Read the image file and convert it to a Base64-encoded string
        const base64Image = await FileSystem.readAsStringAsync(imagePath, { encoding: FileSystem.EncodingType.Base64 });
        return base64Image;
    } catch (error) {
        console.error(`Error reading image: ${error}`);
        return null;
    }
}

const processOCR = async (base64Image: string): Promise<OCRResponse> => {
    const ocrResult = await client.ocr.process({
        model: "mistral-ocr-latest",
        document: {
            type: "image_url",
            imageUrl: "data:image/jpeg;base64," + base64Image
        },
        includeImageBase64: true
    });
    return ocrResult;
}

export const performOCR = async (imagePath: string): Promise<Array<OCRPageObject>> => {
    const isRemoteImage = imagePath.startsWith('http://') || imagePath.startsWith('https://');
    let base64Image: string | null;
    console.log("Image path:", imagePath);
    if (isRemoteImage) {
        base64Image = await remoteImageToBase64(imagePath);
        if (!base64Image) {
            throw new Error("Failed to convert remote image to base64");
        }
    } else {
        // For local images, use the encodeImage function
        base64Image = await encodeImage(imagePath);
    }
    if (!base64Image) {
        throw new Error("Failed to encode image");
    }
    console.log("Processing OCR for image with base64 length:", base64Image.length);
    const ocrResult = await processOCR(base64Image);
    return ocrResult.pages;
}

export const askMistralForAnalysisReceipt = async (ocrResult: string): Promise<string> => {
    console.log("Asking Mistral for receipt analysis with OCR result:", ocrResult);
    const context = "You are analyzing a receipt and need to convert it to a specific JSON format. No other context is needed for this task. Please ensure the output is in the exact format specified below. If there is no tax, no need to include it, otherwise the tax should be included as a separate item with the name 'Tax'. The date should be in the format 'YYYY-MM-DD'. Only the json format is expected in the response, without any additional text or explanation and the item name must convert to human readable names. The sum of item_value should match the total value in the receipt. If there is no store name, use 'Unknown Store' as the default store name.";
    const question = `Analyze this receipt and convert it to the following JSON format:
    {
        "total": "6.8",
        "time": "2025-04-08",
        "store_name": "REAL CANADIAN SUPERSTORE",
        "items": [
            {
                "item_value": "4.00",
                "item_name": "LONGKOV VMRCLLI"
            },
            {
                "item_value": "2.48",
                "item_name": "NN CORN STARCH"
            }
            {
                "item_value": "0.32",
                "item_name": "Tax"
            }
        ]
    }

    Here is the receipt to analyze:
    ${ocrResult}`;

    const AssistantMessage = await askMistral(question, context);
    console.log("Received response from Mistral:", AssistantMessage);
    if (!AssistantMessage || !AssistantMessage.content) {
        throw new Error("Unexpected error happened, please try again later.");
    }
    if (typeof AssistantMessage.content === "string") {
        console.log("Assistant response content:", AssistantMessage.content);
        return AssistantMessage.content;
    } else {
        throw new Error("Unexpected error happened, please try again later.");
    }
}

export const askMistral = async (question: string, context: string): Promise<AssistantMessage> => {
    try {
        const response = await client.chat.complete({
            model: "open-mistral-nemo",
            messages: [
                { role: "user", content: context },
                { role: "user", content: question }
            ],
            maxTokens: 10000,
            temperature: 0.2
        });
        if (!response.choices || response.choices.length === 0 || response.choices[0].message.content == undefined || response.choices[0].message.content == null) {
            throw new Error("Unexpected error happened, please try again later.");
        }
        return response.choices[0].message;
    } catch (error) {
        console.error("Error asking Mistral:", error);
        throw error;
    }
}
