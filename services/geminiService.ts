import { GoogleGenAI, Modality } from "@google/genai";

const getAi = () => {
    if (!process.env.API_KEY) {
        throw new Error("API_KEY environment variable not set");
    }
    return new GoogleGenAI({ apiKey: process.env.API_KEY });
}

export const getTattooTip = async (): Promise<string> => {
    try {
        const ai = getAi();
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-pro',
            contents: 'Give one concise, actionable tip for an aspiring tattoo artist named Johana. Focus on art, technique, or client relations. Keep it under 50 words.',
            config: {
                systemInstruction: "You are a world-renowned tattoo master, offering a piece of daily wisdom. Your tone is wise, encouraging, and professional.",
            },
        });
        return response.text;
    } catch (error) {
        console.error("Error fetching tattoo tip:", error);
        return "Couldn't fetch a tip right now. Focus on clean lines and solid composition today!";
    }
}

export const generateTattooFromPrompt = async (prompt: string): Promise<string> => {
  try {
    const ai = getAi();
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


export const generateStencil = async (base64Image: string, mimeType: string): Promise<string> => {
    try {
        const ai = getAi();
        const imagePart = {
            inlineData: {
                data: base64Image,
                mimeType: mimeType,
            },
        };
        const textPart = {
            text: "Create a clean, black and white, line-art stencil from this image. The output should be suitable for a tattoo trace. Capture the main contours and details with precise black lines on a pure white background. Remove all shading and color."
        };

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash-image',
            contents: { parts: [imagePart, textPart] },
            config: {
                responseModalities: [Modality.IMAGE],
            },
        });
        
        for (const part of response.candidates[0].content.parts) {
            if (part.inlineData) {
                const base64ImageBytes: string = part.inlineData.data;
                return `data:image/png;base64,${base64ImageBytes}`;
            }
        }
        throw new Error("No stencil image was generated.");

    } catch (error) {
        console.error("Error generating stencil:", error);
        if (error instanceof Error) {
            return Promise.reject(error.message);
        }
        return Promise.reject("An unknown error occurred while generating the stencil.");
    }
}

export const tryOnTattoo = async (tattooBase64: string, bodyPartBase64: string, tattooMimeType: string, bodyPartMimeType: string): Promise<string> => {
     try {
        const ai = getAi();
        const bodyPartImage = {
            inlineData: {
                data: bodyPartBase64,
                mimeType: bodyPartMimeType,
            },
        };
        const tattooImage = {
            inlineData: {
                data: tattooBase64,
                mimeType: tattooMimeType,
            },
        };
        const textPart = {
            text: "Realistically place the second image (the tattoo) onto the skin in the first image (the body part). Adjust for the body's contours, lighting, and skin texture. The final image should look like a photograph of a person with the tattoo."
        };

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash-image',
            contents: { parts: [bodyPartImage, tattooImage, textPart] },
            config: {
                responseModalities: [Modality.IMAGE],
            },
        });
        
        for (const part of response.candidates[0].content.parts) {
            if (part.inlineData) {
                const base64ImageBytes: string = part.inlineData.data;
                return `data:image/png;base64,${base64ImageBytes}`;
            }
        }
        throw new Error("Could not generate a preview.");

    } catch (error) {
        console.error("Error generating tattoo preview:", error);
        if (error instanceof Error) {
            return Promise.reject(error.message);
        }
        return Promise.reject("An unknown error occurred while generating the preview.");
    }
}