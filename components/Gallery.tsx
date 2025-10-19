import React, { useState, useEffect } from 'react';
import Section from './Section';
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
        
        // Listen for storage changes from other components
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
        doc.save(`joha-tattoo-design-${selectedImage.index}.pdf`);
    };

    return (
        <Section id="gallery" title="My Creations" subtitle="Your personal collection of AI-generated designs and stencils. Ready to be turned into reality.">
            {galleryItems.length === 0 ? (
                <p className="text-gray-500">Your gallery is empty. Generate a design with the AI Designer to save it here!</p>
            ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                    {galleryItems.map((item, index) => (
                        <div key={index} className="group relative overflow-hidden rounded-lg shadow-lg cursor-pointer bg-gray-800">
                            <img src={item} alt={`Generated tattoo ${index + 1}`} className="w-full h-full object-cover aspect-square"/>
                            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-70 transition-opacity duration-300 flex flex-col items-center justify-center gap-2">
                                <button onClick={() => setSelectedImage({img: item, index})} className="text-white text-sm font-semibold opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-blue-600 px-3 py-1 rounded hover:bg-blue-700">Create PDF</button>
                                <button onClick={() => handleDelete(index)} className="text-white text-sm font-semibold opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-red-600 px-3 py-1 rounded hover:bg-red-700">Delete</button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {selectedImage && (
                <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center" onClick={() => setSelectedImage(null)}>
                    <div className="bg-gray-900 p-8 rounded-lg shadow-xl w-full max-w-sm mx-4" onClick={(e) => e.stopPropagation()}>
                        <h3 className="text-2xl font-cinzel mb-4">Create PDF</h3>
                        <div className="bg-white p-1 rounded">
                          <img src={selectedImage.img} alt="Selected design" className="w-full h-auto object-contain mb-4 max-h-64"/>
                        </div>
                        <div className="flex items-center gap-4">
                            <label htmlFor="pdf-size" className="font-medium">Size (cm):</label>
                            <input type="number" id="pdf-size" value={pdfSize} onChange={(e) => setPdfSize(Number(e.target.value))} className="w-24 px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white" />
                        </div>
                        <div className="mt-6 flex gap-4">
                           <button onClick={() => setSelectedImage(null)} className="w-full bg-gray-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-gray-700 transition">Cancel</button>
                           <button onClick={handleDownloadPdf} className="w-full bg-rose-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-rose-700 transition">Download</button>
                        </div>
                    </div>
                </div>
            )}
        </Section>
    );
};

export default Gallery;
