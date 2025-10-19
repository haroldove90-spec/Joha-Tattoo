
import { GoogleGenAI } from "@google/genai";

export const generateTattooDesign = async (prompt: string): Promise<string> => {
  if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable not set");
  }

  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

    const fullPrompt = `High-quality, professional tattoo design of ${prompt}. Minimalist, clean black lines, high contrast, on a plain white background.`;
    
    const response = await ai.models.generateImages({
        model: 'imagen-4.0-generate-001',
        prompt: fullPrompt,
        config: {
          numberOfImages: 1,
          outputMimeType: 'image/png',
          aspectRatio: '1:1',
        },
    });

    if (response.generatedImages && response.generatedImages.length > 0) {
      const base64ImageBytes: string = response.generatedImages[0].image.imageBytes;
      return `data:image/png;base64,${base64ImageBytes}`;
    } else {
      throw new Error("No image was generated. Please try a different prompt.");
    }
  } catch (error) {
    console.error("Error generating tattoo design:", error);
    if (error instanceof Error) {
        return Promise.reject(error.message);
    }
    return Promise.reject("An unknown error occurred while generating the design.");
  }
};
