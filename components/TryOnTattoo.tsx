import React, { useState } from 'react';
import Loader from './Loader';
import { generateTattooOnBodyPart } from '../services/geminiService';

const TryOnTattoo: React.FC = () => {
    const [tattooImage, setTattooImage] = useState<string | null>(null);
    const [resultImage, setResultImage] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [tattooFile, setTattooFile] = useState<File | null>(null);
    const [selectedBodyPart, setSelectedBodyPart] = useState<string | null>(null);

    const bodyParts = ['Brazo', 'Mano', 'Espalda', 'Pierna', 'Pantorrilla', 'Cuello', 'Pecho', 'Hombro'];

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            setTattooFile(file);
            const reader = new FileReader();
            reader.onload = (e) => {
                setTattooImage(e.target?.result as string);
                setResultImage(null);
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

    const handleGenerate = async () => {
        if (!tattooFile || !selectedBodyPart) {
            setError('Por favor, sube un diseño y selecciona una parte del cuerpo.');
            return;
        }
        setIsLoading(true);
        setError(null);
        setResultImage(null);

        try {
            const tattooBase64 = await toBase64(tattooFile);
            const resultUrl = await generateTattooOnBodyPart(tattooBase64, tattooFile.type, selectedBodyPart);
            setResultImage(resultUrl);
        } catch (err: any) {
            setError(err.toString() || 'No se pudo generar la prueba. Por favor, inténtalo de nuevo.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="py-8">
             <div className="text-center">
                <h1 className="text-3xl font-bold font-cinzel text-main mb-2">Prueba Virtual</h1>
                <p className="text-secondary mb-8 max-w-2xl mx-auto">Sube un diseño, elige una parte del cuerpo y deja que la IA cree una vista previa fotorrealista.</p>
            </div>
            <div className="max-w-3xl mx-auto">
                {/* Step 1: Upload Design */}
                <div className="mb-6">
                    <h2 className="font-bold text-main mb-2">Paso 1: Sube el Diseño del Tatuaje</h2>
                    <div className="bg-card border-2 border-dashed border-border-card rounded-lg p-6 text-center">
                        <label htmlFor="tattoo-upload" className="cursor-pointer bg-primary text-primary-contrast font-semibold py-2 px-4 rounded-md hover:opacity-90 transition-opacity">
                            {tattooImage ? 'Cambiar Diseño' : 'Seleccionar Diseño'}
                        </label>
                        <input id="tattoo-upload" type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
                        {tattooImage && <img src={tattooImage} alt="Diseño de tatuaje" className="mx-auto max-h-24 rounded mt-4 bg-white p-1"/>}
                    </div>
                </div>

                {/* Step 2: Select Body Part */}
                {tattooImage && (
                    <div className="mb-6">
                         <h2 className="font-bold text-main mb-3">Paso 2: Elige la Parte del Cuerpo</h2>
                         <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                            {bodyParts.map(part => (
                                <button
                                    key={part}
                                    onClick={() => setSelectedBodyPart(part)}
                                    className={`p-3 rounded-lg border-2 transition-all duration-200 text-center font-semibold ${selectedBodyPart === part ? 'bg-primary border-primary text-primary-contrast' : 'bg-card border-border-card hover:border-primary'}`}
                                >
                                    {part}
                                </button>
                            ))}
                         </div>
                    </div>
                )}

                {/* Step 3: Generate */}
                {tattooImage && selectedBodyPart && (
                    <div className="text-center mt-8">
                        <button 
                            onClick={handleGenerate}
                            disabled={isLoading}
                             className="w-full max-w-md mx-auto bg-primary text-primary-contrast font-bold py-3 px-8 rounded-lg hover:opacity-90 transition-opacity duration-300 disabled:opacity-50 disabled:cursor-not-allowed">
                                {isLoading ? 'Generando...' : `Probar en ${selectedBodyPart}`}
                        </button>
                    </div>
                )}
                
                <div className="mt-8 min-h-[350px] flex items-center justify-center p-4 bg-card rounded-lg">
                    {isLoading && <Loader />}
                    {error && <div className="text-red-500 bg-red-900/20 p-4 rounded-lg">{error}</div>}
                    {resultImage && (
                         <div className="text-center">
                            <h3 className="text-xl font-cinzel mb-4">¡Aquí tienes tu prueba virtual!</h3>
                            <img src={resultImage} alt="Resultado de la prueba virtual" className="mx-auto max-h-80 rounded shadow-lg"/>
                             <a href={resultImage} download={`johana-tatuajes-prueba-${selectedBodyPart}.png`} className="inline-block mt-4 bg-green-600 text-white font-bold py-2 px-6 rounded-lg hover:bg-green-700 transition">
                                Descargar Imagen
                            </a>
                        </div>
                    )}
                     {!resultImage && !isLoading && !error && (
                        <p className="text-secondary">El resultado fotorrealista aparecerá aquí.</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default TryOnTattoo;