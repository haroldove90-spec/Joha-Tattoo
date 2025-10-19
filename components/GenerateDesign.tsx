import React, { useState } from 'react';
import { generateTattooFromPrompt } from '../services/geminiService';
import Loader from './Loader';

const GenerateDesign: React.FC = () => {
    const [prompt, setPrompt] = useState('');
    const [generatedImage, setGeneratedImage] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isSaved, setIsSaved] = useState(false);

    const handleGenerate = async () => {
        if (!prompt.trim()) {
            setError('Por favor, describe tu idea para el tatuaje.');
            return;
        }
        setIsLoading(true);
        setError(null);
        setGeneratedImage(null);
        setIsSaved(false);

        try {
            const imageUrl = await generateTattooFromPrompt(prompt);
            setGeneratedImage(imageUrl);
        } catch (err: any) {
            setError(err.toString() || 'No se pudo generar el diseño. Por favor, inténtalo de nuevo.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleSaveToGallery = () => {
        if (!generatedImage) return;
        const gallery = JSON.parse(localStorage.getItem('tattooGallery') || '[]');
        gallery.unshift(generatedImage);
        localStorage.setItem('tattooGallery', JSON.stringify(gallery));
        setIsSaved(true);
        window.dispatchEvent(new Event('storage'));
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
                        <button
                            onClick={handleSaveToGallery}
                            disabled={isSaved}
                            className="bg-green-600 text-white font-bold py-2 px-6 rounded-lg hover:bg-green-700 transition duration-300 disabled:bg-gray-500 disabled:cursor-not-allowed"
                        >
                            {isSaved ? '✓ Guardado' : 'Guardar en Galería'}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default GenerateDesign;