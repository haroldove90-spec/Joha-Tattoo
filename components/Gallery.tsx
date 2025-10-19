import React, { useState, useEffect } from 'react';
import { jsPDF } from 'jspdf';

const Gallery: React.FC = () => {
    const [galleryItems, setGalleryItems] = useState<string[]>([]);
    const [selectedImage, setSelectedImage] = useState<{img: string, index: number} | null>(null);
    const [pdfSize, setPdfSize] = useState<number>(10);

    useEffect(() => {
        const loadGallery = () => {
            const items = JSON.parse(localStorage.getItem('tattooGallery') || '[]');
            setGalleryItems(items);
        };
        loadGallery();
        
        window.addEventListener('storage', loadGallery);
        return () => window.removeEventListener('storage', loadGallery);
    }, []);
    
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

    return (
        <div className="py-8">
            <div className="text-center mb-8">
                <h1 className="text-3xl font-bold font-cinzel text-main mb-2">Galería</h1>
                <p className="text-secondary">Tu colección personal de diseños generados por IA.</p>
            </div>
            {galleryItems.length === 0 ? (
                <div className="text-center py-16">
                    <p className="text-secondary">Tu galería está vacía.</p>
                    <p className="text-sm text-secondary">¡Usa "Generar Diseño" para guardar tus creaciones aquí!</p>
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