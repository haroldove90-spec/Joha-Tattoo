import React, { useState, useRef, useCallback } from 'react';
import Loader from './Loader';
import { createTattooTrace } from '../services/geminiService';
import { jsPDF } from 'jspdf';

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
            const stream = await navigator.mediaDevices.getUserMedia({ video: true });
            setIsCameraOpen(true);
            // Use a timeout to ensure the video element is rendered
            setTimeout(() => {
                if (videoRef.current) {
                    videoRef.current.srcObject = stream;
                }
            }, 100);
        } catch (err) {
            console.error("Error al acceder a la cámara:", err);
            setError("No se pudo acceder a la cámara. Asegúrate de haber otorgado los permisos.");
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
            
            // Automatically save to gallery upon successful creation
            const gallery = JSON.parse(localStorage.getItem('tattooGallery') || '[]');
            if (!gallery.includes(stencilUrl)) {
                gallery.unshift(stencilUrl);
                localStorage.setItem('tattooGallery', JSON.stringify(gallery));
                window.dispatchEvent(new Event('storage'));
            }
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
        link.download = 'johana-tatuajes-plantilla.png';
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
        doc.save(`johana-tatuajes-plantilla.pdf`);
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
                                    ✓ ¡Guardado automáticamente en tu galería!
                                </p>
                            )}
                            <div className="mt-6 border-t border-border-card pt-4 space-y-4">
                                <div>
                                    <h4 className="font-semibold text-main mb-3">Opciones de Descarga</h4>
                                    <div className="flex flex-col sm:flex-row gap-3">
                                        <button
                                            onClick={handleDownloadPng}
                                            className="w-full bg-green-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-green-700 transition"
                                        >
                                            Descargar PNG
                                        </button>
                                        <button onClick={handleDownloadPdf} className="w-full bg-primary text-primary-contrast font-bold py-2 px-4 rounded-lg hover:opacity-90 transition">
                                            Descargar PDF
                                        </button>
                                    </div>
                                    <div className="flex items-center gap-3 mt-4 max-w-xs mx-auto">
                                        <label htmlFor="pdf-size" className="font-medium text-main text-sm whitespace-nowrap">Tamaño PDF (cm):</label>
                                        <input type="number" id="pdf-size" value={pdfSize} onChange={(e) => setPdfSize(Number(e.target.value))} className="w-full px-3 py-2 bg-app border border-border-card rounded-lg text-main" />
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