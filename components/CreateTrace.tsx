import React, { useState, useRef } from 'react';
import Section from './Section';
import Loader from './Loader';
import { generateStencil } from '../services/geminiService';
import { jsPDF } from 'jspdf';

const fileToBas64 = (file: File): Promise<{base64: string, mimeType: string}> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => {
            const result = reader.result as string;
            const [mimeType, base64] = result.split(',');
            resolve({ base64, mimeType: mimeType.replace('data:', '').replace(';base64', '') });
        };
        reader.onerror = error => reject(error);
    });
};

const CreateTrace: React.FC = () => {
    const [sourceImage, setSourceImage] = useState<string | null>(null);
    const [sourceFile, setSourceFile] = useState<File | null>(null);
    const [stencilImage, setStencilImage] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [pdfSize, setPdfSize] = useState<number>(10);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            setSourceFile(file);
            const reader = new FileReader();
            reader.onload = (e) => setSourceImage(e.target?.result as string);
            reader.readAsDataURL(file);
            setStencilImage(null);
            setError(null);
        }
    };

    const handleGenerate = async () => {
        if (!sourceFile) {
            setError('Please upload an image first.');
            return;
        }
        setIsLoading(true);
        setError(null);
        setStencilImage(null);

        try {
            const { base64, mimeType } = await fileToBas64(sourceFile);
            const resultUrl = await generateStencil(base64, mimeType);
            setStencilImage(resultUrl);
        } catch (err: any) {
            setError(err.toString() || 'Failed to generate stencil.');
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleDownloadPdf = () => {
        if (!stencilImage) return;
        const doc = new jsPDF({
            orientation: 'portrait',
            unit: 'cm',
            format: 'a4'
        });
        const width = doc.internal.pageSize.getWidth();
        const height = doc.internal.pageSize.getHeight();
        const x = (width - pdfSize) / 2;
        const y = (height - pdfSize) / 2;
        doc.addImage(stencilImage, 'PNG', x, y, pdfSize, pdfSize);
        doc.save('joha-tattoo-stencil.pdf');
    };
    
    const handlePrint = () => {
        if (!stencilImage) return;
        const printWindow = window.open('', '_blank');
        printWindow?.document.write(`
            <html>
                <head><title>Print Stencil</title></head>
                <body style="margin:0; padding:0; display:flex; justify-content:center; align-items:center; height:100vh;">
                    <img src="${stencilImage}" style="width:${pdfSize}cm; height:${pdfSize}cm;" onload="window.print(); window.close();" />
                </body>
            </html>
        `);
        printWindow?.document.close();
    };

    return (
        <Section id="trace" title="Create a Stencil" subtitle="Upload any image and our AI will trace it into a clean stencil, ready for your next tattoo." className="bg-black">
            <div className="max-w-4xl mx-auto space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                    <div className="p-6 bg-gray-900/50 border-2 border-dashed border-gray-700 rounded-lg flex flex-col items-center justify-center h-80">
                        {sourceImage ? (
                            <img src={sourceImage} alt="Source for stencil" className="max-w-full max-h-full object-contain rounded-md" />
                        ) : (
                            <div className="text-center text-gray-500">
                                <p>Upload or take a photo</p>
                            </div>
                        )}
                    </div>
                     <div className="p-6 bg-gray-900/50 border-2 border-dashed border-gray-700 rounded-lg flex flex-col items-center justify-center h-80">
                        {isLoading ? <Loader /> : stencilImage ? (
                            <img src={stencilImage} alt="Generated stencil" className="max-w-full max-h-full object-contain rounded-md" />
                        ) : (
                             <div className="text-center text-gray-500">
                                <p>Your generated stencil will appear here</p>
                            </div>
                        )}
                    </div>
                </div>

                {error && <div className="text-red-500 bg-red-900/20 p-4 rounded-lg text-center">{error}</div>}

                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                    <input type="file" accept="image/*" onChange={handleFileChange} ref={fileInputRef} className="hidden" />
                    <button onClick={() => fileInputRef.current?.click()} className="bg-gray-700 text-white font-bold py-3 px-6 rounded-lg hover:bg-gray-600 transition w-full sm:w-auto">Upload Image</button>
                    <button onClick={() => { fileInputRef.current?.setAttribute('capture', 'environment'); fileInputRef.current?.click(); }} className="bg-gray-700 text-white font-bold py-3 px-6 rounded-lg hover:bg-gray-600 transition w-full sm:w-auto">Take Photo</button>
                    <button onClick={handleGenerate} disabled={isLoading || !sourceImage} className="bg-rose-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-rose-700 transition disabled:bg-gray-500 w-full sm:w-auto">Generate Stencil</button>
                </div>
                
                {stencilImage && (
                    <div className="mt-8 p-6 bg-gray-900 rounded-lg flex flex-col sm:flex-row items-center justify-center gap-6">
                         <div>
                            <label htmlFor="size" className="block text-sm font-medium text-gray-300 mb-2">Print Size (cm)</label>
                            <input type="number" id="size" value={pdfSize} onChange={(e) => setPdfSize(Number(e.target.value))} className="w-24 px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white" />
                        </div>
                        <button onClick={handleDownloadPdf} className="bg-blue-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-blue-700 transition w-full sm:w-auto">Download PDF</button>
                        <button onClick={handlePrint} className="bg-green-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-green-700 transition w-full sm:w-auto">Print Stencil</button>
                    </div>
                )}
            </div>
        </Section>
    );
};

export default CreateTrace;
