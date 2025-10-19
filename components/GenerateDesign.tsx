import React, { useState } from 'react';
import { generateTattooFromPrompt } from '../services/geminiService';
import Loader from './Loader';

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

            // Auto-save to gallery
            const gallery = JSON.parse(localStorage.getItem('tattooGallery') || '[]');
            gallery.unshift(imageUrl); // Add to the beginning of the array
            localStorage.setItem('tattooGallery', JSON.stringify(gallery));
            window.dispatchEvent(new Event('storage')); // Notify other components
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
                    <div className="flex flex-col items-center gap-4 animate-fade-in">
                        <div className="bg-white p-2 rounded-lg shadow-2xl shadow-primary/20">
                             <img src={generatedImage} alt="Diseño de tatuaje generado" className="w-72 h-72 object-cover rounded-md"/>
                        </div>
                        {saveSuccess && (
                            <p className="text-green-400 font-semibold text-sm bg-green-900/30 px-4 py-2 rounded-full">
                                ✓ ¡Guardado en tu galería!
                            </p>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default GenerateDesign;