import React, { useState } from 'react';
import Loader from './Loader';
import { tryOnTattoo } from '../services/geminiService';

const TryOnTattoo: React.FC = () => {
    const [userImage, setUserImage] = useState<string | null>(null);
    const [tattooImage, setTattooImage] = useState<string | null>(null);
    const [resultImage, setResultImage] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [userFile, setUserFile] = useState<File | null>(null);
    const [tattooFile, setTattooFile] = useState<File | null>(null);

    const handleFileChange = (type: 'user' | 'tattoo') => (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            if (type === 'user') setUserFile(file);
            if (type === 'tattoo') setTattooFile(file);
            
            const reader = new FileReader();
            reader.onload = (e) => {
                const imageUrl = e.target?.result as string;
                if (type === 'user') setUserImage(imageUrl);
                if (type === 'tattoo') setTattooImage(imageUrl);
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
        if (!userFile || !tattooFile) {
            setError('Por favor, sube ambas imágenes.');
            return;
        }
        setIsLoading(true);
        setError(null);
        setResultImage(null);

        try {
            const userBase64 = await toBase64(userFile);
            const tattooBase64 = await toBase64(tattooFile);
            const resultUrl = await tryOnTattoo(userBase64, userFile.type, tattooBase64, tattooFile.type);
            setResultImage(resultUrl);
        } catch (err: any) {
            setError(err.toString() || 'No se pudo generar la prueba. Por favor, inténtalo de nuevo.');
        } finally {
            setIsLoading(false);
        }
    };
    
    const FileInput = ({ id, label, image, onChange }: { id: string, label: string, image: string | null, onChange: React.ChangeEventHandler<HTMLInputElement>}) => (
        <div className="flex-1 bg-card border-2 border-dashed border-border-card rounded-lg p-4 text-center flex flex-col justify-center items-center min-h-[150px]">
            <label htmlFor={id} className="cursor-pointer text-primary hover:opacity-80 font-semibold mb-2">
                {label}
            </label>
            <input id={id} type="file" accept="image/*" onChange={onChange} className="hidden" />
            {image ? (
                 <img src={image} alt={label} className="max-h-24 rounded mt-2"/>
            ) : (
                <p className="text-secondary text-xs">Sube una imagen</p>
            )}
        </div>
    );

    return (
        <div className="py-8">
             <div className="text-center">
                <h1 className="text-3xl font-bold font-cinzel text-main mb-2">Prueba Virtual</h1>
                <p className="text-secondary mb-8">Visualiza cómo te quedaría un tatuaje antes de decidirte.</p>
            </div>
            <div className="max-w-2xl mx-auto">
                <div className="flex flex-col sm:flex-row gap-4 mb-6">
                    <FileInput id="user-upload" label="Sube tu Foto" image={userImage} onChange={handleFileChange('user')} />
                    <FileInput id="tattoo-upload" label="Sube el Diseño" image={tattooImage} onChange={handleFileChange('tattoo')} />
                </div>

                {userImage && tattooImage && (
                    <div className="text-center mt-6">
                        <button 
                            onClick={handleGenerate}
                            disabled={isLoading}
                             className="w-full bg-primary text-primary-contrast font-bold py-3 px-8 rounded-lg hover:opacity-90 transition-opacity duration-300 disabled:opacity-50 disabled:cursor-not-allowed">
                                {isLoading ? 'Aplicando...' : 'Probar Tatuaje'}
                        </button>
                    </div>
                )}
                
                <div className="mt-8 min-h-[350px] flex items-center justify-center p-4 bg-card rounded-lg">
                    {isLoading && <Loader />}
                    {error && <div className="text-red-500 bg-red-900/20 p-4 rounded-lg">{error}</div>}
                    {resultImage && (
                         <div className="text-center">
                            <h3 className="text-xl font-cinzel mb-4">¡Aquí tienes tu prueba virtual!</h3>
                            <img src={resultImage} alt="Resultado de la prueba virtual" className="mx-auto max-h-80 rounded"/>
                             <a href={resultImage} download="johana-tatuajes-prueba.png" className="inline-block mt-4 bg-green-600 text-white font-bold py-2 px-6 rounded-lg hover:bg-green-700 transition">
                                Descargar Imagen
                            </a>
                        </div>
                    )}
                     {!resultImage && !isLoading && !error && (
                        <p className="text-secondary">El resultado aparecerá aquí.</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default TryOnTattoo;