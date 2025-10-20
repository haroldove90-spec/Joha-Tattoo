import React, { useState, useEffect, useRef, useCallback } from 'react';
import { jsPDF } from 'jspdf';
import { getGalleryItems, addGalleryItem, deleteGalleryItem, GalleryItem } from '../services/geminiService';

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
                text: 'Guardado desde la galería de Soul Patterns.'
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


const Gallery: React.FC = () => {
    const [galleryItems, setGalleryItems] = useState<GalleryItem[]>([]);
    const [selectedImage, setSelectedImage] = useState<GalleryItem | null>(null);
    const [magnifiedImage, setMagnifiedImage] = useState<string | null>(null);
    const [pdfSize, setPdfSize] = useState<number>(10);
    const [isCameraOpen, setIsCameraOpen] = useState(false);
    const [isImporting, setIsImporting] = useState(false);
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isInputFocused, setIsInputFocused] = useState(false);

    const loadGallery = useCallback(async () => {
        const items = await getGalleryItems();
        setGalleryItems(items);
    }, []);

    useEffect(() => {
        loadGallery();
    }, [loadGallery]);
    
    const handleDelete = async (id: number) => {
        await deleteGalleryItem(id);
        setGalleryItems(items => items.filter(item => item.id !== id));
    };

    const handleDownloadPdf = () => {
        if (!selectedImage) return;
        const doc = new jsPDF({ orientation: 'portrait', unit: 'cm', format: 'a4' });
        const width = doc.internal.pageSize.getWidth();
        const height = doc.internal.pageSize.getHeight();
        const x = (width - pdfSize) / 2;
        const y = (height - pdfSize) / 2;
        doc.addImage(selectedImage.base64, 'PNG', x, y, pdfSize, pdfSize);
        doc.save(`soul-patterns-diseno-${selectedImage.id}.pdf`);
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
            const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
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
    
    const handleCapture = async () => {
        if (videoRef.current && canvasRef.current) {
            const video = videoRef.current;
            const canvas = canvasRef.current;
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            canvas.getContext('2d')?.drawImage(video, 0, 0, video.videoWidth, video.videoHeight);
            const dataUrl = canvas.toDataURL('image/png');
            
            // Add to DB and then optimistically update UI
            const newId = await addGalleryItem(dataUrl);
            setGalleryItems(prevItems => [{ id: newId, base64: dataUrl }, ...prevItems]);

            setIsCameraOpen(false);
            cleanupCamera();
        }
    };
    
    const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const files = event.target.files;
        if (!files || files.length === 0) {
            return;
        }

        setIsImporting(true);
        try {
            // Read all files into base64 strings
            const fileReadPromises = Array.from(files).map((file: File) => {
                return new Promise<string>((resolve, reject) => {
                    const reader = new FileReader();
                    reader.onload = e => resolve(e.target?.result as string);
                    reader.onerror = err => reject(err);
                    reader.readAsDataURL(file);
                });
            });
            const base64Images = await Promise.all(fileReadPromises);

            // Add them to the database and collect the new items with their generated IDs
            const addPromises = base64Images.map(async (base64) => {
                const id = await addGalleryItem(base64);
                return { id, base64 };
            });
            const newItems = await Promise.all(addPromises);

            // Optimistically update the state with the new items, putting them at the beginning
            setGalleryItems(prevItems => [...newItems.reverse(), ...prevItems]);

        } catch (error) {
            console.error("Error importing images:", error);
        } finally {
            setIsImporting(false);
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
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
                <input type="file" accept="image/*" multiple onChange={handleFileChange} ref={fileInputRef} className="hidden" />
                <button 
                    onClick={() => fileInputRef.current?.click()} 
                    disabled={isImporting || isCameraOpen}
                    className="flex items-center gap-2 bg-primary text-primary-contrast font-semibold py-2 px-4 rounded-md hover:opacity-90 transition-opacity disabled:opacity-50"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM6.293 6.707a1 1 0 010-1.414l3-3a1 1 0 011.414 0l3 3a1 1 0 01-1.414 1.414L11 5.414V13a1 1 0 11-2 0V5.414L7.707 6.707a1 1 0 01-1.414 0z" clipRule="evenodd" /></svg>
                    {isImporting ? 'Importando...' : 'Importar Fotos'}
                </button>
                <button 
                    onClick={openCamera} 
                    disabled={isImporting || isCameraOpen}
                    className="flex items-center gap-2 bg-card border border-border-card text-main font-semibold py-2 px-4 rounded-md hover:border-primary transition-colors disabled:opacity-50"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M4 5a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V7a2 2 0 00-2-2h-1.586a1 1 0 01-.707-.293l-1.121-1.121A2 2 0 0011.172 3H8.828a2 2 0 00-1.414.586L6.293 4.707A1 1 0 015.586 5H4zm6 9a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" /></svg>
                    Tomar Foto
                </button>
            </div>
            {isImporting && <p className="text-center text-secondary -mt-4 mb-4 animate-pulse">Añadiendo nuevas imágenes a tu galería...</p>}

            {galleryItems.length === 0 && !isImporting ? (
                <div className="text-center py-16">
                    <p className="text-secondary">Tu galería está vacía.</p>
                    <p className="text-sm text-secondary">¡Usa las herramientas de IA o sube tus propias fotos para empezar!</p>
                </div>
            ) : (
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2 sm:gap-4">
                    {galleryItems.map((item) => (
                        <div key={item.id} onClick={() => setMagnifiedImage(item.base64)} className="group relative overflow-hidden rounded-lg shadow-lg cursor-pointer bg-card aspect-square">
                            <img src={item.base64} alt={`Diseño de tatuaje ${item.id}`} className="w-full h-full object-cover"/>
                            <div className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col items-center justify-center gap-1.5 p-1.5">
                                <button onClick={(e) => { e.stopPropagation(); handleShareOrDownload(item.base64, `soul-patterns-gallery-${item.id}.png`); }} className="w-full text-white text-xs font-semibold bg-primary px-2 py-1 rounded hover:opacity-90 text-center">Compartir</button>
                                <button onClick={(e) => { e.stopPropagation(); setSelectedImage(item); }} className="w-full text-white text-xs font-semibold bg-blue-600 px-2 py-1 rounded hover:bg-blue-700 text-center">Crear PDF</button>
                                <button onClick={(e) => { e.stopPropagation(); handleDelete(item.id); }} className="w-full text-white text-xs font-semibold bg-red-600 px-2 py-1 rounded hover:bg-red-700 text-center">Borrar</button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {magnifiedImage && (
                <div className="fixed inset-0 bg-black/90 z-[60] flex items-center justify-center p-4 animate-fade-in-up" onClick={() => setMagnifiedImage(null)}>
                    <img 
                        src={magnifiedImage} 
                        alt="Vista ampliada" 
                        className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
                        onClick={(e) => e.stopPropagation()} 
                    />
                </div>
            )}

            {selectedImage && (
                <div className={`fixed inset-0 bg-black/80 z-50 flex justify-center ${isInputFocused ? 'items-start pt-8' : 'items-center'}`} onClick={() => setSelectedImage(null)}>
                    <div className="bg-card p-6 rounded-lg shadow-xl w-full max-w-xs mx-4 border border-border-card" onClick={(e) => e.stopPropagation()}>
                        <h3 className="text-xl font-cinzel mb-4 text-main">Crear PDF</h3>
                        <div className="bg-white p-1 rounded mb-4">
                          <img src={selectedImage.base64} alt="Diseño seleccionado" className="w-full h-auto object-contain rounded-sm"/>
                        </div>
                        <div className="flex items-center gap-3 mb-6">
                            <label htmlFor="pdf-size" className="font-medium text-main text-sm">Tamaño (cm):</label>
                            <input 
                                type="number" 
                                id="pdf-size" 
                                value={pdfSize} 
                                onChange={(e) => setPdfSize(Number(e.target.value))} 
                                onFocus={() => setIsInputFocused(true)}
                                onBlur={() => setIsInputFocused(false)}
                                className="w-full px-3 py-2 bg-app border border-border-card rounded-lg text-main" 
                            />
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