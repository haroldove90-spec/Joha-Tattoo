import React, { useState } from 'react';
import Loader from './Loader';
import { createTattooTrace } from '../services/geminiService';

const CreateTrace: React.FC = () => {
    const [sourceImage, setSourceImage] = useState<string | null>(null);
    const [stencilImage, setStencilImage] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [sourceFile, setSourceFile] = useState<File | null>(null);

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            setSourceFile(file);
            const reader = new FileReader();
            reader.onload = (e) => {
                setSourceImage(e.target?.result as string);
                setStencilImage(null);
                setError(null);
            };
            reader.readAsDataURL(file);
        }
    };

    const toBase64 = (file: File): Promise<string> =>
        new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve((reader.result as string).split(',')[1]);
            reader.onerror = (error) => reject(error);
        });

    const handleGenerateTrace = async () => {
        if (!sourceFile) {
            setError('Por favor, sube una imagen primero.');
            return;
        }
        setIsLoading(true);
        setError(null);
        setStencilImage(null);

        try {
            const base64Data = await toBase64(sourceFile);
            const stencilUrl = await createTattooTrace(base64Data, sourceFile.type);
            setStencilImage(stencilUrl);
        } catch (err: any) {
            setError(err.toString() || 'No se pudo crear la plantilla. Por favor, inténtalo de nuevo.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="py-8">
            <div className="text-center">
                <h1 className="text-3xl font-bold font-cinzel text-main mb-2">Crear Trazo</h1>
                <p className="text-secondary mb-8">Sube un diseño para crear una plantilla limpia y lista para calcar.</p>
            </div>
            <div className="max-w-md mx-auto">
                <div className="bg-card border-2 border-dashed border-border-card rounded-lg p-8 text-center mb-6">
                    <label htmlFor="trace-upload" className="cursor-pointer bg-primary text-primary-contrast font-semibold py-2 px-4 rounded-md hover:opacity-90 transition-opacity">
                        {sourceImage ? 'Cambiar Imagen' : 'Seleccionar Imagen'}
                    </label>
                    <input id="trace-upload" type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
                    {sourceImage && <img src={sourceImage} alt="Diseño original" className="mx-auto max-h-32 rounded mt-6"/>}
                    {!sourceImage && <p className="text-secondary text-sm mt-4">Sube un diseño de tatuaje para empezar.</p>}
                </div>
                
                {sourceImage && (
                    <div className="text-center mt-6">
                        <button 
                            onClick={handleGenerateTrace}
                            disabled={isLoading}
                            className="w-full bg-primary text-primary-contrast font-bold py-3 px-8 rounded-lg hover:opacity-90 transition-opacity duration-300 disabled:opacity-50 disabled:cursor-not-allowed">
                                {isLoading ? 'Trazando...' : 'Crear Plantilla'}
                        </button>
                    </div>
                )}
                
                <div className="mt-8 min-h-[300px] flex items-center justify-center p-4 bg-card rounded-lg">
                    {isLoading && <Loader />}
                    {error && <div className="text-red-500 bg-red-900/20 p-4 rounded-lg">{error}</div>}
                    {stencilImage && (
                         <div className="text-center">
                            <h3 className="text-xl font-cinzel mb-4">¡Tu plantilla está lista!</h3>
                            <div className="bg-white p-2 rounded-md">
                               <img src={stencilImage} alt="Plantilla generada" className="mx-auto max-h-64 rounded"/>
                            </div>
                            <a href={stencilImage} download="johana-tatuajes-plantilla.png" className="inline-block mt-4 bg-green-600 text-white font-bold py-2 px-6 rounded-lg hover:bg-green-700 transition">
                                Descargar Plantilla
                            </a>
                        </div>
                    )}
                     {!stencilImage && !isLoading && !error && (
                        <p className="text-secondary">Tu plantilla generada aparecerá aquí.</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CreateTrace;