
import { GoogleGenAI, Modality } from '@google/genai';
import { Mode, CreateFunction, EditFunction, ArtisticStyle, AspectRatio, styleOptions } from '../types';
import type { ImageFile } from '../types';

interface GenerateImageParams {
    prompt: string;
    mode: Mode;
    createFunction: CreateFunction;
    editFunction: EditFunction;
    selectedStyle: ArtisticStyle;
    aspectRatio: AspectRatio;
    image1: ImageFile | null;
    image2: ImageFile | null;
}

/**
 * Converts a data URL string into an object suitable for the Gemini API's inlineData.
 * @param dataUrl The data URL (e.g., "data:image/png;base64,...")
 * @returns An object with an inlineData property.
 */
const dataUrlToInlineData = (dataUrl: string) => {
    const match = dataUrl.match(/^data:(.+);base64,(.+)$/);
    if (!match) {
        console.error('Invalid data URL format:', dataUrl.substring(0, 50));
        throw new Error('Formato de URL de dados inválido. Não foi possível processar a imagem.');
    }
    const mimeType = match[1];
    const data = match[2];
    return { inlineData: { data, mimeType } };
};


/**
 * Generates or edits an image using the Google Gemini API.
 * @param params The parameters for image generation/editing.
 * @returns A promise that resolves to a data URL (base64) of the generated image.
 */
export const generateImage = async (params: GenerateImageParams): Promise<string> => {
    // Initialize the Google GenAI client inside the function to ensure the latest API key is used.
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    console.log('Generating image with real API, params:', params);
    
    try {
        if (params.mode === Mode.CREATE) {
            const styleName = styleOptions.find(s => s.id === params.selectedStyle)?.name || '';
            
            // For "Free" mode, just use the prompt. For "Style" mode, prepend the style.
            const finalPrompt = params.createFunction === CreateFunction.STYLE && styleName
                ? `Uma imagem no estilo de ${styleName.toLowerCase()}: ${params.prompt}`
                : params.prompt;

            if (!finalPrompt.trim()) {
                throw new Error("O prompt não pode estar vazio.");
            }

            // Use Imagen for high-quality image creation.
            const response = await ai.models.generateImages({
                model: 'imagen-4.0-generate-001',
                prompt: finalPrompt,
                config: {
                    numberOfImages: 1,
                    aspectRatio: params.aspectRatio,
                    outputMimeType: 'image/jpeg', // Request JPEG for consistency
                },
            });

            if (!response.generatedImages || response.generatedImages.length === 0) {
                throw new Error('A API não retornou nenhuma imagem.');
            }

            const base64ImageBytes = response.generatedImages[0].image.imageBytes;
            return `data:image/jpeg;base64,${base64ImageBytes}`;
        } else { // Mode.EDIT
            if (!params.image1) {
                throw new Error('A edição de imagem requer uma imagem de base.');
            }

            const parts: any[] = [];
            
            // Add the base image(s)
            parts.push(dataUrlToInlineData(params.image1.url));
            if (params.editFunction === EditFunction.COMPOSE && params.image2) {
                parts.push(dataUrlToInlineData(params.image2.url));
            }
            
            // Add the text prompt
            if (params.prompt) {
                parts.push({ text: params.prompt });
            }

            // Use gemini-flash-image for image editing tasks
            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash-image',
                contents: { parts },
                config: {
                    responseModalities: [Modality.IMAGE],
                },
            });

            if (!response.candidates || response.candidates.length === 0 || !response.candidates[0].content.parts) {
                throw new Error("A API não retornou um candidato de imagem válido.");
            }

            // Find the image part in the response
            for (const part of response.candidates[0].content.parts) {
                if (part.inlineData) {
                    const base64ImageBytes = part.inlineData.data;
                    const mimeType = part.inlineData.mimeType;
                    return `data:${mimeType};base64,${base64ImageBytes}`;
                }
            }

            throw new Error("A API retornou uma resposta, mas não continha dados de imagem.");
        }
    } catch (error) {
        console.error("Error generating image with Gemini API:", error);
        // Re-throw the original error so it can be handled by the UI component,
        // specifically to catch API key errors.
        throw error;
    }
};
