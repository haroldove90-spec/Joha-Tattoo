import React, { useState } from 'react';
import { generateTattooFromPrompt, addGalleryItem } from '../services/geminiService';
import Loader from './Loader';

const dataURLtoFile = (dataurl: string, filename: string): File => {
    const arr = dataurl.split(',');
    const mimeMatch = arr[0].match(/:(.*?);/);
    if (!mimeMatch) throw new Error('Invalid data URL');
    const mime = mimeMatch[1];
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
        u8arr[n] = bstr.charCodeAt(n);
    }
    return new File([u8arr], filename, { type: mime });
};

const handleShareOrDownload = async (base64Image: string, filename: string) => {
    try {
        const imageFile = dataURLtoFile(base64Image, filename);
        if (navigator.canShare && navigator.canShare({ files: [imageFile] })) {
            await navigator.share({
                files: [imageFile],
                title: 'Diseño de Tatuaje - Soul Patterns',
                text: 'Creado con el Asistente de Diseño IA de Soul Patterns.'
            });
            return;
        }
    } catch (error) {
        console.error('Error al compartir la imagen:', error);
    }
    // Fallback for browsers that don't support sharing or if sharing fails
    const link = document.createElement('a');
    link.href = base64Image;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
};


const GenerateDesign: React.FC = () => {
    const [prompt, setPrompt] = useState('');
    const [generatedImage, setGeneratedImage] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [saveSuccess, setSaveSuccess] = useState(false);

    const handleGenerate = async () => {
        if (!prompt.trim()) {
            setError('Por favor, describe tu idea para el tatuaje.');
            return;
        }
        setIsLoading(true);
        setError(null);
        setGeneratedImage(null);
        setSaveSuccess(false);

        try {
            const imageUrl = await generateTattooFromPrompt(prompt);
            setGeneratedImage(imageUrl);

            // Auto-save to gallery using IndexedDB
            await addGalleryItem(imageUrl);
            setSaveSuccess(true);

        } catch (err: any) {
            setError(err.toString() || 'No se pudo generar el diseño. Por favor, inténtalo de nuevo.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleFocus = (e: React.FocusEvent<HTMLTextAreaElement>) => {
        setTimeout(() => {
            e.target.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, 300);
    };

    const suggestionPills = ["Un león majestuoso con corona floral", "Silueta de lobo geométrico", "Pez koi estilo japonés", "Rosa minimalista de una línea"];

    return (
        <div className="py-8">
            <div className="text-center">
                <h1 className="text-3xl font-bold font-cinzel text-main mb-2">Generador de Diseños</h1>
                <p className="text-secondary mb-8 max-w-xl mx-auto">Da vida a tu visión. Describe tu tatuaje ideal y deja que nuestra IA cree un diseño único para ti.</p>
            </div>
            
            <div className="max-w-md mx-auto">
                <div className="relative mb-2">
                    <textarea
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        onFocus={handleFocus}
                        placeholder="Ej: 'Un dragón rodeando una rama de cerezo, estilo acuarela'"
                        className="w-full h-24 p-4 pr-32 bg-card border border-border-card rounded-lg text-main placeholder-secondary focus:ring-2 focus:ring-primary focus:border-primary transition duration-300 resize-none"
                        aria-label="Descripción del Tatuaje"
                    />
                    <button
                        onClick={handleGenerate}
                        disabled={isLoading}
                        className="absolute top-1/2 right-3 -translate-y-1/2 bg-primary text-primary-contrast font-bold py-2 px-4 rounded-lg hover:opacity-90 transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isLoading ? 'Creando...' : 'Generar'}
                    </button>
                </div>
                 <div className="flex flex-wrap justify-center gap-2 mb-8">
                    {suggestionPills.map(p => (
                        <button key={p} onClick={() => setPrompt(p)} className="px-3 py-1 bg-card text-secondary text-xs rounded-full hover:bg-border-card hover:text-main transition-colors">
                            {p}
                        </button>
                    ))}
                </div>
            </div>

            <div className="mt-8 min-h-[350px] flex items-center justify-center">
                {isLoading && <Loader />}
                {error && <div className="text-red-500 bg-red-900/20 p-4 rounded-lg text-center">{error}</div>}
                {generatedImage && (
                    <div className="flex flex-col items-center gap-4 animate-fade-in-up">
                        <div className="bg-white p-2 rounded-lg shadow-2xl shadow-primary/20">
                             <img src={generatedImage} alt="Diseño de tatuaje generado" className="w-72 h-72 object-cover rounded-md"/>
                        </div>
                        {saveSuccess && (
                            <p className="text-green-400 font-semibold text-sm bg-green-900/30 px-4 py-2 rounded-full">
                                ✓ ¡Guardado en la galería de la app!
                            </p>
                        )}
                        <button
                            onClick={() => handleShareOrDownload(generatedImage, `soul-patterns-design-${Date.now()}.png`)}
                            className="flex items-center gap-2 bg-primary text-primary-contrast font-semibold py-2 px-4 rounded-lg hover:opacity-90 transition-opacity"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M8.684 13.342C8.886 12.938 9 12.482 9 12s-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.368a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" /></svg>
                            Compartir Diseño
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default GenerateDesign;