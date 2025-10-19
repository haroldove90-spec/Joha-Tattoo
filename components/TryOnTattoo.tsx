import React, { useState } from 'react';
import Section from './Section';
import Loader from './Loader';
import { tryOnTattoo } from '../services/geminiService';

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

const urlToBas64 = async (url: string): Promise<{base64: string, mimeType: string}> => {
    const response = await fetch(url);
    const blob = await response.blob();
    const file = new File([blob], "image.jpg", {type: blob.type});
    return fileToBas64(file);
}


const bodyParts = [
    { name: 'Arm', url: 'https://picsum.photos/seed/arm/500/700?grayscale' },
    { name: 'Back', url: 'https://picsum.photos/seed/back/500/700?grayscale' },
    { name: 'Leg', url: 'https://picsum.photos/seed/leg/500/700?grayscale' },
    { name: 'Hand', url: 'https://picsum.photos/seed/hand/500/700?grayscale' }
];

const TryOnTattoo: React.FC = () => {
    const [tattooImage, setTattooImage] = useState<File | null>(null);
    const [tattooPreview, setTattooPreview] = useState<string | null>(null);
    const [selectedBodyPartUrl, setSelectedBodyPartUrl] = useState<string>(bodyParts[0].url);
    const [resultImage, setResultImage] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    
    const handleTattooUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            setTattooImage(file);
            const reader = new FileReader();
            reader.onload = (e) => setTattooPreview(e.target?.result as string);
            reader.readAsDataURL(file);
        }
    };
    
    const handleGeneratePreview = async () => {
        if (!tattooImage || !selectedBodyPartUrl) {
            setError("Please upload a tattoo design and select a body part.");
            return;
        }
        setIsLoading(true);
        setError(null);
        setResultImage(null);

        try {
            const tattooData = await fileToBas64(tattooImage);
            const bodyPartData = await urlToBas64(selectedBodyPartUrl);
            const result = await tryOnTattoo(tattooData.base64, bodyPartData.base64, tattooData.mimeType, bodyPartData.mimeType);
            setResultImage(result);
        } catch (err: any) {
             setError(err.toString() || 'Failed to generate preview.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Section id="try-on" title="Virtual Try-On" subtitle="See how a tattoo looks before you commit. Upload a design and place it on different body parts." className="bg-gray-900/40">
             <div className="max-w-5xl mx-auto space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
                    {/* Left Column: Inputs */}
                    <div className="space-y-6">
                        <div>
                            <h4 className="text-xl font-semibold mb-3 text-left font-cinzel">1. Upload Tattoo Design</h4>
                            <div className="p-4 bg-gray-800 rounded-lg">
                                <input type="file" accept="image/*" onChange={handleTattooUpload} className="w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-rose-500 file:text-white hover:file:bg-rose-600"/>
                                {tattooPreview && <img src={tattooPreview} alt="Tattoo Preview" className="mt-4 rounded-md max-h-40 mx-auto"/>}
                            </div>
                        </div>
                        <div>
                            <h4 className="text-xl font-semibold mb-3 text-left font-cinzel">2. Select Body Part</h4>
                             <div className="grid grid-cols-2 gap-2">
                                {bodyParts.map(part => (
                                    <button key={part.name} onClick={() => setSelectedBodyPartUrl(part.url)} className={`p-2 rounded-lg border-2 ${selectedBodyPartUrl === part.url ? 'border-rose-500' : 'border-gray-700'} hover:border-rose-400`}>
                                        <img src={part.url} alt={part.name} className="w-full h-32 object-cover rounded-md"/>
                                        <p className="mt-2 text-center font-medium">{part.name}</p>
                                    </button>
                                ))}
                            </div>
                        </div>
                         <button onClick={handleGeneratePreview} disabled={isLoading || !tattooImage} className="w-full bg-rose-600 text-white font-bold py-3 px-8 rounded-lg hover:bg-rose-700 transition duration-300 disabled:bg-gray-500">
                           {isLoading ? 'Generating Preview...' : 'Try It On!'}
                        </button>
                    </div>

                    {/* Right Column: Result */}
                    <div className="p-4 bg-gray-900/50 border-2 border-dashed border-gray-700 rounded-lg flex flex-col items-center justify-center min-h-[500px]">
                        {isLoading ? <Loader /> : resultImage ? (
                            <img src={resultImage} alt="Tattoo try-on result" className="max-w-full max-h-full object-contain rounded-md" />
                        ) : (
                             <div className="text-center text-gray-500">
                                <p>Your virtual tattoo preview will appear here</p>
                            </div>
                        )}
                    </div>
                </div>
                 {error && <div className="text-red-500 bg-red-900/20 p-4 rounded-lg text-center mt-4">{error}</div>}
            </div>
        </Section>
    );
};

export default TryOnTattoo;
