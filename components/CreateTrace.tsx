import React, { useState, useRef, useCallback } from 'react';
import Loader from './Loader';
import { createTattooTrace, addGalleryItem } from '../services/geminiService';
import { jsPDF } from 'jspdf';

const dataURLtoFileUtil = (dataurl: string, filename: string): File => {
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
        const imageFile = dataURLtoFileUtil(base64Image, filename);
        if (navigator.canShare && navigator.canShare({ files: [imageFile] })) {
            await navigator.share({
                files: [imageFile],
                title: 'Plantilla de Tatuaje - Soul Patterns',
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


const CreateTrace: React.FC = () => {
    const [sourceImage, setSourceImage] = useState<string | null>(null);
    const [stencilImage, setStencilImage] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [sourceFile, setSourceFile] = useState<File | null>(null);
    const [isCameraOpen, setIsCameraOpen] = useState(false);
    const [pdfSize, setPdfSize] = useState<number>(10);
    const [saveSuccess, setSaveSuccess] = useState(false);
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    
    const cleanupCamera = useCallback(() => {
        if (videoRef.current && videoRef.current.srcObject) {
            const stream = videoRef.current.srcObject as MediaStream;
            stream.getTracks().forEach(track => track.stop());
            videoRef.current.srcObject = null;
        }
    }, []);

    const openCamera = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
            setIsCameraOpen(true);
            // Use a timeout to ensure the video element is rendered
            setTimeout(() => {
                if (videoRef.current) {
                    videoRef.current.srcObject = stream;
                }
            }, 100);
        } catch (err) {
            console.error("Error al acceder a la cámara:", err);
            setError("No se pudo acceder a la cámara trasera. Asegúrate de haber otorgado los permisos.");
        }
    };
    
    const dataURLtoFile = (dataurl: string, filename: string): File => {
        const arr = dataurl.split(',');
        const mime = arr[0].match(/:(.*?);/)![1];
        const bstr = atob(arr[1]);
        let n = bstr.length;
        const u8arr = new Uint8Array(n);
        while (n--) {
            u8arr[n] = bstr.charCodeAt(n);
        }
        return new File([u8arr], filename, { type: mime });
    };

    const handleCapture = () => {
        if (videoRef.current && canvasRef.current) {
            const video = videoRef.current;
            const canvas = canvasRef.current;
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            const context = canvas.getContext('2d');
            context?.drawImage(video, 0, 0, video.videoWidth, video.videoHeight);
            const dataUrl = canvas.toDataURL('image/png');
            setSourceImage(dataUrl);
            setSourceFile(dataURLtoFile(dataUrl, `captura-${Date.now()}.png`));
            setStencilImage(null);
            setError(null);
            setSaveSuccess(false);
            setIsCameraOpen(false);
            cleanupCamera();
        }
    };

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            setSourceFile(file);
            const reader = new FileReader();
            reader.onload = (e) => {
                setSourceImage(e.target?.result as string);
                setStencilImage(null);
                setError(null);
                setSaveSuccess(false);
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
        setSaveSuccess(false);

        try {
            const base64Data = await toBase64(sourceFile);
            const stencilUrl = await createTattooTrace(base64Data, sourceFile.type);
            setStencilImage(stencilUrl);
            
            // Automatically save to gallery (IndexedDB) upon successful creation
            await addGalleryItem(stencilUrl);
            setSaveSuccess(true);

        } catch (err: any) {
            setError(err.toString() || 'No se pudo crear la plantilla. Por favor, inténtalo de nuevo.');
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleDownloadPng = () => {
        if (!stencilImage) return;
        const link = document.createElement('a');
        link.href = stencilImage;
        link.download = 'soul-patterns-plantilla.png';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleDownloadPdf = () => {
        if (!stencilImage) return;
        const doc = new jsPDF({ orientation: 'portrait', unit: 'cm', format: 'a4' });
        const width = doc.internal.pageSize.getWidth();
        const height = doc.internal.pageSize.getHeight();
        const x = (width - pdfSize) / 2;
        const y = (height - pdfSize) / 2;
        doc.addImage(stencilImage, 'PNG', x, y, pdfSize, pdfSize);
        doc.save(`soul-patterns-plantilla.pdf`);
    };

    const handleInputFocus = (e: React.FocusEvent<HTMLInputElement>) => {
        setTimeout(() => {
            e.target.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, 300);
    };

    return (
        <div className="py-8">
            <canvas ref={canvasRef} style={{ display: 'none' }} />
             {isCameraOpen && (
                <div className="fixed inset-0 bg-black/80 z-50 flex flex-col items-center justify-center p-4">
                    <video ref={videoRef} autoPlay playsInline className="w-full max-w-lg h-auto rounded-lg mb-4"></video>
                    <div className="flex gap-4">
                        <button onClick={handleCapture} className="bg-primary text-primary-contrast font-semibold py-2 px-6 rounded-md">Capturar</button>
                        <button onClick={() => { setIsCameraOpen(false); cleanupCamera(); }} className="bg-gray-600 text-white font-semibold py-2 px-6 rounded-md">Cancelar</button>
                    </div>
                </div>
            )}
            <div className="text-center">
                <h1 className="text-3xl font-bold font-cinzel text-main mb-2">Crear Trazo</h1>
                <p className="text-secondary mb-8">Sube o captura un diseño para crear una plantilla limpia.</p>
            </div>
            <div className="max-w-md mx-auto">
                <div className="bg-card border-2 border-dashed border-border-card rounded-lg p-8 text-center mb-6">
                    <div className="flex justify-center items-center gap-4">
                         <label htmlFor="trace-upload" className="cursor-pointer bg-primary text-primary-contrast font-semibold py-2 px-4 rounded-md hover:opacity-90 transition-opacity">
                            Subir Imagen
                        </label>
                        <button onClick={openCamera} className="bg-card border border-border-card text-main font-semibold py-2 px-4 rounded-md hover:border-primary transition-colors">
                            Tomar Foto
                        </button>
                    </div>
                    <input id="trace-upload" type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
                    {sourceImage && <img src={sourceImage} alt="Diseño original" className="mx-auto max-h-32 rounded mt-6"/>}
                    {!sourceImage && <p className="text-secondary text-sm mt-4">Sube un archivo o toma una foto para empezar.</p>}
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
                         <div className="text-center w-full">
                            <h3 className="text-xl font-cinzel mb-4">¡Tu plantilla está lista!</h3>
                            <div className="bg-white p-2 rounded-md inline-block">
                               <img src={stencilImage} alt="Plantilla generada" className="mx-auto max-h-48 rounded"/>
                            </div>
                            {saveSuccess && (
                                <p className="text-green-400 font-semibold text-sm bg-green-900/30 px-4 py-2 rounded-full mt-4 inline-block">
                                    ✓ ¡Guardado en la galería de la app!
                                </p>
                            )}
                            <div className="mt-6 border-t border-border-card pt-4 space-y-4">
                                <div>
                                    <h4 className="font-semibold text-main mb-3">Opciones de Guardado</h4>
                                    <div className="flex flex-col gap-3">
                                        <button
                                            onClick={() => handleShareOrDownload(stencilImage, `soul-patterns-plantilla-${Date.now()}.png`)}
                                            className="w-full bg-primary text-primary-contrast font-bold py-2 px-4 rounded-lg hover:opacity-90 transition flex items-center justify-center gap-2"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M8.684 13.342C8.886 12.938 9 12.482 9 12s-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.368a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" /></svg>
                                            Compartir Plantilla
                                        </button>
                                        <button onClick={handleDownloadPdf} className="w-full bg-card border border-border-card text-main font-bold py-2 px-4 rounded-lg hover:border-primary transition">
                                            Descargar PDF
                                        </button>
                                    </div>
                                    <div className="flex items-center gap-3 mt-4 max-w-xs mx-auto">
                                        <label htmlFor="pdf-size" className="font-medium text-main text-sm whitespace-nowrap">Tamaño PDF (cm):</label>
                                        <input type="number" id="pdf-size" value={pdfSize} onFocus={handleInputFocus} onChange={(e) => setPdfSize(Number(e.target.value))} className="w-full px-3 py-2 bg-app border border-border-card rounded-lg text-main" />
                                    </div>
                                </div>
                            </div>
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