import { GoogleGenAI, Modality, Chat } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

/**
 * Creates and returns a new chat session configured to act as a tattoo master mentor.
 */
export const createAssistantChat = (): Chat => {
    const chat = ai.chats.create({
        model: 'gemini-2.5-pro', // Using a more advanced model for expert advice
        config: {
            systemInstruction: "Eres un 'Maestro Tatuador', un mentor experto para Johana, una aprendiz de tatuadora. Tu tono es sabio, profesional y alentador. Ofrece consejos detallados sobre técnicas de tatuaje, seguridad, higiene, diseño, y cómo tratar con los clientes. Responde siempre desde esta perspectiva."
        }
    });
    return chat;
};

/**
 * Generates a tattoo design image from a text prompt.
 */
export const generateTattooFromPrompt = async (prompt: string): Promise<string> => {
  try {
    const fullPrompt = `Un diseño de tatuaje minimalista, limpio, en blanco y negro de ${prompt}. El diseño debe estar sobre un fondo blanco liso, adecuado para una plantilla.`;
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
      throw new Error("No se generó ninguna imagen.");
    }
  } catch (error) {
    console.error("Error al generar el diseño del tatuaje:", error);
    throw new Error("No se pudo generar el diseño del tatuaje. Por favor, inténtalo de nuevo.");
  }
};

/**
 * Gets a random tattoo-related tip of the day.
 */
export const getTattooTip = async (): Promise<string> => {
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: 'Dame un consejo corto, interesante y útil para Johana, una aprendiz de tatuadora, para que se convierta en una experta. Solo una frase o dos.',
            config: {
              systemInstruction: "Eres un maestro tatuador experimentado que da consejos a un aprendiz."
            }
        });
        return response.text;
    } catch (error) {
        console.error("Error al obtener el consejo sobre tatuajes:", error);
        throw new Error("No se pudo obtener un consejo. Por favor, inténtalo de nuevo.");
    }
};


/**
 * Converts a tattoo image into a stencil/trace.
 * @param base64ImageData The base64 encoded string of the source image.
 * @param mimeType The MIME type of the source image.
 */
export const createTattooTrace = async (base64ImageData: string, mimeType: string): Promise<string> => {
    try {
        const imagePart = {
            inlineData: {
                data: base64ImageData,
                mimeType: mimeType,
            },
        };
        const textPart = {
            text: "Crea una plantilla de arte lineal (stencil), limpia, en blanco y negro, de este diseño de tatuaje. El resultado debe contener solo las líneas negras sobre un fondo transparente, adecuado para calcar.",
        };

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash-image',
            contents: {
                parts: [imagePart, textPart],
            },
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
        throw new Error("No se generó ninguna imagen de plantilla.");

    } catch (error) {
        console.error("Error al crear el trazo del tatuaje:", error);
        throw new Error("No se pudo crear la plantilla. Por favor, inténtalo de nuevo.");
    }
};

/**
 * Generates a realistic image of a tattoo on a specified body part.
 * @param tattooImageBase64 The base64 encoded string of the tattoo design.
 * @param tattooImageMimeType The MIME type of the tattoo design.
 * @param bodyPart The name of the body part (e.g., 'Brazo', 'Espalda').
 */
export const generateTattooOnBodyPart = async (tattooImageBase64: string, tattooImageMimeType: string, bodyPart: string): Promise<string> => {
    try {
        const tattooImagePart = {
            inlineData: {
                data: tattooImageBase64,
                mimeType: tattooImageMimeType,
            },
        };
        const textPart = {
            text: `Genera una foto de estudio, fotorrealista y de alta calidad de un/una ${bodyPart} de una persona. La piel debe tener una textura natural. Sobre esta piel, aplica la imagen del tatuaje proporcionada, integrándola perfectamente. Asegúrate de que el tatuaje siga los contornos del cuerpo y que la iluminación y las sombras del tatuaje coincidan con la iluminación de la foto para que parezca completamente real. El resultado debe ser solo la imagen fotorrealista.`,
        };

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash-image',
            contents: {
                parts: [tattooImagePart, textPart],
            },
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
        throw new Error("No se generó ninguna imagen de prueba.");

    } catch (error) {
        console.error("Error al probar el tatuaje:", error);
        throw new Error("No se pudo generar la prueba virtual. Por favor, inténtalo de nuevo.");
    }
};