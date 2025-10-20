import React, { useState } from 'react';
import Loader from './Loader';
import { generateTattooOnBodyPart } from '../services/geminiService';

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
                title: 'Prueba de Tatuaje - Soul Patterns',
                text: 'Creada con el Asistente de Diseño IA de Soul Patterns.'
            });
            return;
        }
    } catch (error) {
        console.error('Error al compartir la imagen:', error);
    }
    const link = document.createElement('a');
    link.href = base64Image;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
};


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
                             <button onClick={() => handleShareOrDownload(resultImage, `soul-patterns-prueba-${selectedBodyPart}.png`)} className="inline-flex items-center gap-2 mt-4 bg-primary text-primary-contrast font-bold py-2 px-6 rounded-lg hover:opacity-90 transition">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M8.684 13.342C8.886 12.938 9 12.482 9 12s-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.368a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" /></svg>
                                Compartir Prueba
                            </button>
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