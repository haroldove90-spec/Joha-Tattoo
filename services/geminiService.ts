

import { GoogleGenAI, Modality, Chat } from "@google/genai";

/**
 * Returns a new instance of the GoogleGenAI client.
 * This ensures the latest API key from the environment is used for each call,
 * which is crucial after the user selects a key via the UI.
 * The underlying GoogleGenAI constructor will throw an error if the API key is missing.
 */
const getAiInstance = (): GoogleGenAI => {
    return new GoogleGenAI({ apiKey: process.env.API_KEY });
};

/**
 * Creates and returns a new chat session configured to act as a tattoo master mentor.
 */
export const createAssistantChat = (): Chat => {
    const ai = getAiInstance();
    const chat = ai.chats.create({
        model: 'gemini-2.5-pro', // Using a more advanced model for expert advice
        config: {
            systemInstruction: "Eres un 'Maestro Tatuador', un mentor experto para un aprendiz de tatuador. Tu tono es sabio, profesional y alentador. Ofrece consejos detallados sobre técnicas de tatuaje, seguridad, higiene, diseño, y cómo tratar con los clientes. Responde siempre desde esta perspectiva."
        }
    });
    return chat;
};

/**
 * Generates a tattoo design image from a text prompt.
 */
export const generateTattooFromPrompt = async (prompt: string): Promise<string> => {
  try {
    const ai = getAiInstance();
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
    throw error;
  }
};

/**
 * Gets a random tattoo-related tip of the day with a retry mechanism.
 */
export const getTattooTip = async (retries = 3, delay = 500): Promise<string> => {
    try {
        const ai = getAiInstance();
        const prompt = 'Genera un consejo único y motivador para una aprendiz de tatuadora. El consejo debe ser conciso, de una o dos frases, y cubrir temas como técnica, trato con el cliente, o crecimiento artístico. Ejemplo: "La confianza en tu trazo se construye con cada línea que practicas, no solo en la piel, sino en papel.". Asegúrate de dar siempre una respuesta con un consejo.';

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
              systemInstruction: "Eres un maestro tatuador experimentado que da consejos a un aprendiz. Tu tono es sabio y alentador."
            }
        });

        if (!response.text || response.text.trim() === '') {
            throw new Error("La respuesta de la API estaba vacía.");
        }
        
        return response.text;
    } catch (error) {
        console.error(`Error al obtener el consejo sobre tatuajes (intentos restantes: ${retries - 1}):`, error);
        if (retries > 1) {
            await new Promise(res => setTimeout(res, delay));
            return getTattooTip(retries - 1, delay * 2);
        }
        console.error("Todos los intentos para obtener el consejo del día han fallado.");
        throw error;
    }
};


/**
 * Converts a tattoo image into a stencil/trace.
 * @param base64ImageData The base64 encoded string of the source image.
 * @param mimeType The MIME type of the source image.
 */
export const createTattooTrace = async (base64ImageData: string, mimeType: string): Promise<string> => {
    try {
        const ai = getAiInstance();
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
        throw error;
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
        const ai = getAiInstance();
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
        throw error;
    }
};

// =============================================
// IndexedDB Database Service
// =============================================

type Appointment = {
  id: string;
  clientName: string;
  phone: string;
  tattooType: string;
  date: string;
  time: string;
};

type Sale = {
    id: string;
    amount: number;
    date: string;
};

export type GalleryItem = {
    id: number;
    base64: string;
};

const DB_NAME = 'soulPatternsDB';
const DB_VERSION = 1;
let dbPromise: Promise<IDBDatabase> | null = null;

const getDB = (): Promise<IDBDatabase> => {
    if (dbPromise) {
        return dbPromise;
    }
    dbPromise = new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, DB_VERSION);
        request.onerror = () => reject(request.error);
        request.onsuccess = () => resolve(request.result);
        request.onupgradeneeded = (event) => {
            const db = (event.target as IDBOpenDBRequest).result;
            if (!db.objectStoreNames.contains('gallery')) {
                db.createObjectStore('gallery', { keyPath: 'id', autoIncrement: true });
            }
            if (!db.objectStoreNames.contains('appointments')) {
                db.createObjectStore('appointments', { keyPath: 'id' });
            }
            if (!db.objectStoreNames.contains('sales')) {
                db.createObjectStore('sales', { keyPath: 'id' });
            }
        };
    });
    return dbPromise;
};

const promisifyRequest = <T>(request: IDBRequest<T>): Promise<T> => {
    return new Promise((resolve, reject) => {
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
};

// Gallery functions
export const addGalleryItem = async (base64: string): Promise<number> => {
    const db = await getDB();
    const tx = db.transaction('gallery', 'readwrite');
    const store = tx.objectStore('gallery');
    const request = store.add({ base64 });
    // Fix: Explicitly type the result of the promisified request to number, as the gallery uses an auto-incrementing key.
    return promisifyRequest(request as IDBRequest<number>);
};

export const getGalleryItems = async (): Promise<GalleryItem[]> => {
    const db = await getDB();
    const items = await promisifyRequest(db.transaction('gallery').objectStore('gallery').getAll());
    return items.reverse();
};

export const deleteGalleryItem = async (id: number): Promise<void> => {
    const db = await getDB();
    const tx = db.transaction('gallery', 'readwrite');
    await promisifyRequest(tx.objectStore('gallery').delete(id));
};

// Appointment functions
export const saveAppointment = async (appointment: Appointment): Promise<string> => {
    const db = await getDB();
    const tx = db.transaction('appointments', 'readwrite');
    // Fix: Explicitly type the result of the promisified request to string to match the Appointment's ID type.
    return promisifyRequest(tx.objectStore('appointments').put(appointment) as IDBRequest<string>);
};

export const getAppointments = async (): Promise<Appointment[]> => {
    const db = await getDB();
    return promisifyRequest(db.transaction('appointments').objectStore('appointments').getAll());
};

export const deleteAppointment = async (id: string): Promise<void> => {
    const db = await getDB();
    const tx = db.transaction('appointments', 'readwrite');
    await promisifyRequest(tx.objectStore('appointments').delete(id));
};

// Sales functions
export const saveSale = async (sale: Sale): Promise<string> => {
    const db = await getDB();
    const tx = db.transaction('sales', 'readwrite');
    // Fix: Explicitly type the result of the promisified request to string to match the Sale's ID type.
    return promisifyRequest(tx.objectStore('sales').put(sale) as IDBRequest<string>);
};

export const getSales = async (): Promise<Sale[]> => {
    const db = await getDB();
    return promisifyRequest(db.transaction('sales').objectStore('sales').getAll());
};