import React, { useState, useEffect, useRef, useCallback } from 'react';
import { jsPDF } from 'jspdf';

const Gallery: React.FC = () => {
    const [galleryItems, setGalleryItems] = useState<string[]>([]);
    const [selectedImage, setSelectedImage] = useState<{img: string, index: number} | null>(null);
    const [pdfSize, setPdfSize] = useState<number>(10);
    const [isCameraOpen, setIsCameraOpen] = useState(false);
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const loadGallery = useCallback(() => {
        const items = JSON.parse(localStorage.getItem('tattooGallery') || '[]');
        setGalleryItems(items);
    }, []);

    useEffect(() => {
        loadGallery();
        window.addEventListener('storage', loadGallery);
        return () => window.removeEventListener('storage', loadGallery);
    }, [loadGallery]);

    const addToGallery = (imageBase64: string) => {
        const updatedGallery = [imageBase64, ...galleryItems];
        setGalleryItems(updatedGallery);
        localStorage.setItem('tattooGallery', JSON.stringify(updatedGallery));
    };
    
    const handleDelete = (indexToDelete: number) => {
        const updatedGallery = galleryItems.filter((_, index) => index !== indexToDelete);
        setGalleryItems(updatedGallery);
        localStorage.setItem('tattooGallery', JSON.stringify(updatedGallery));
    };

    const handleDownloadPdf = () => {
        if (!selectedImage) return;
        const doc = new jsPDF({ orientation: 'portrait', unit: 'cm', format: 'a4' });
        const width = doc.internal.pageSize.getWidth();
        const height = doc.internal.pageSize.getHeight();
        const x = (width - pdfSize) / 2;
        const y = (height - pdfSize) / 2;
        doc.addImage(selectedImage.img, 'PNG', x, y, pdfSize, pdfSize);
        doc.save(`johana-tatuajes-diseno-${selectedImage.index}.pdf`);
    };

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
            setTimeout(() => {
                if (videoRef.current) {
                    videoRef.current.srcObject = stream;
                }
            }, 100);
        } catch (err) {
            console.error("Error accessing camera:", err);
        }
    };

    const handleCapture = () => {
        if (videoRef.current && canvasRef.current) {
            const video = videoRef.current;
            const canvas = canvasRef.current;
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            canvas.getContext('2d')?.drawImage(video, 0, 0, video.videoWidth, video.videoHeight);
            const dataUrl = canvas.toDataURL('image/png');
            addToGallery(dataUrl);
            setIsCameraOpen(false);
            cleanupCamera();
        }
    };

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                addToGallery(e.target?.result as string);
            };
            reader.readAsDataURL(file);
        }
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
            
            <div className="text-center mb-8">
                <h1 className="text-3xl font-bold font-cinzel text-main mb-2">Galería</h1>
                <p className="text-secondary">Tu colección personal de diseños.</p>
            </div>
            
             <div className="flex justify-center gap-4 mb-8">
                <input type="file" accept="image/*" onChange={handleFileChange} ref={fileInputRef} className="hidden" />
                <button onClick={() => fileInputRef.current?.click()} className="flex items-center gap-2 bg-primary text-primary-contrast font-semibold py-2 px-4 rounded-md hover:opacity-90 transition-opacity">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM6.293 6.707a1 1 0 010-1.414l3-3a1 1 0 011.414 0l3 3a1 1 0 01-1.414 1.414L11 5.414V13a1 1 0 11-2 0V5.414L7.707 6.707a1 1 0 01-1.414 0z" clipRule="evenodd" /></svg>
                    Subir Imagen
                </button>
                <button onClick={openCamera} className="flex items-center gap-2 bg-card border border-border-card text-main font-semibold py-2 px-4 rounded-md hover:border-primary transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M4 5a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V7a2 2 0 00-2-2h-1.586a1 1 0 01-.707-.293l-1.121-1.121A2 2 0 0011.172 3H8.828a2 2 0 00-1.414.586L6.293 4.707A1 1 0 015.586 5H4zm6 9a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" /></svg>
                    Tomar Foto
                </button>
            </div>

            {galleryItems.length === 0 ? (
                <div className="text-center py-16">
                    <p className="text-secondary">Tu galería está vacía.</p>
                    <p className="text-sm text-secondary">¡Usa las herramientas de IA o sube tus propias fotos para empezar!</p>
                </div>
            ) : (
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2 sm:gap-4">
                    {galleryItems.map((item, index) => (
                        <div key={index} className="group relative overflow-hidden rounded-lg shadow-lg cursor-pointer bg-card aspect-square">
                            <img src={item} alt={`Diseño de tatuaje ${index + 1}`} className="w-full h-full object-cover"/>
                            <div className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col items-center justify-center gap-2 p-2">
                                <button onClick={() => setSelectedImage({img: item, index})} className="w-full text-white text-xs font-semibold bg-blue-600 px-2 py-1 rounded hover:bg-blue-700 text-center">Crear PDF</button>
                                <button onClick={() => handleDelete(index)} className="w-full text-white text-xs font-semibold bg-red-600 px-2 py-1 rounded hover:bg-red-700 text-center">Borrar</button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {selectedImage && (
                <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center" onClick={() => setSelectedImage(null)}>
                    <div className="bg-card p-6 rounded-lg shadow-xl w-full max-w-xs mx-4 border border-border-card" onClick={(e) => e.stopPropagation()}>
                        <h3 className="text-xl font-cinzel mb-4 text-main">Crear PDF</h3>
                        <div className="bg-white p-1 rounded mb-4">
                          <img src={selectedImage.img} alt="Diseño seleccionado" className="w-full h-auto object-contain rounded-sm"/>
                        </div>
                        <div className="flex items-center gap-3 mb-6">
                            <label htmlFor="pdf-size" className="font-medium text-main text-sm">Tamaño (cm):</label>
                            <input type="number" id="pdf-size" value={pdfSize} onChange={(e) => setPdfSize(Number(e.target.value))} className="w-full px-3 py-2 bg-app border border-border-card rounded-lg text-main" />
                        </div>
                        <div className="flex gap-4">
                           <button onClick={() => setSelectedImage(null)} className="w-full bg-gray-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-gray-700 transition">Cancelar</button>
                           <button onClick={handleDownloadPdf} className="w-full bg-primary text-primary-contrast font-bold py-2 px-4 rounded-lg hover:opacity-90 transition">Descargar</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Gallery;