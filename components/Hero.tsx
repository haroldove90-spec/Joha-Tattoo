
import React, { useState } from 'react';
import { generateTattooDesign } from '../services/geminiService';
import Loader from './Loader';

const Hero: React.FC = () => {
    const [prompt, setPrompt] = useState('');
    const [generatedImage, setGeneratedImage] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleGenerate = async () => {
        if (!prompt.trim()) {
            setError('Please describe your tattoo idea.');
            return;
        }
        setIsLoading(true);
        setError(null);
        setGeneratedImage(null);

        try {
            const imageUrl = await generateTattooDesign(prompt);
            setGeneratedImage(imageUrl);
        } catch (err: any) {
            setError(err.toString() || 'Failed to generate design. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const suggestionPills = ["A majestic lion with a floral crown", "Geometric wolf silhouette", "Japanese style koi fish", "Minimalist single line rose"];

    return (
        <section id="designer" className="min-h-screen flex items-center justify-center bg-black relative overflow-hidden" style={{backgroundImage: 'radial-gradient(circle at center, rgba(128, 128, 128, 0.05), black 70%)'}}>
            <div className="container mx-auto px-6 py-20 text-center z-10">
                <h1 className="text-5xl md:text-7xl font-bold font-cinzel text-white mb-4 leading-tight tracking-wider">Design Your Dream Tattoo</h1>
                <p className="text-xl text-gray-400 mb-8 max-w-3xl mx-auto">Bring your vision to life. Describe your perfect tattoo and let our AI create a unique design just for you.</p>

                <div className="max-w-4xl mx-auto">
                    <div className="relative">
                        <textarea
                            value={prompt}
                            onChange={(e) => setPrompt(e.target.value)}
                            placeholder="e.g., 'A dragon wrapping around a cherry blossom branch, in a watercolor style'"
                            className="w-full h-28 p-4 pr-32 bg-gray-900/50 border-2 border-gray-700 rounded-lg text-white placeholder-gray-500 focus:ring-2 focus:ring-rose-500 focus:border-rose-500 transition duration-300 resize-none"
                        />
                        <button
                            onClick={handleGenerate}
                            disabled={isLoading}
                            className="absolute top-1/2 right-4 -translate-y-1/2 bg-rose-600 text-white font-bold py-2 px-6 rounded-lg hover:bg-rose-700 transition duration-300 disabled:bg-gray-500 disabled:cursor-not-allowed flex items-center justify-center"
                        >
                            {isLoading ? 'Creating...' : 'Generate'}
                        </button>
                    </div>
                     <div className="flex flex-wrap justify-center gap-2 mt-4">
                        {suggestionPills.map(p => (
                            <button key={p} onClick={() => setPrompt(p)} className="px-3 py-1 bg-gray-800 text-gray-300 text-sm rounded-full hover:bg-gray-700 hover:text-white transition-colors">
                                {p}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="mt-12 min-h-[350px] flex items-center justify-center">
                    {isLoading && <Loader />}
                    {error && <div className="text-red-500 bg-red-900/20 p-4 rounded-lg">{error}</div>}
                    {generatedImage && (
                        <div className="bg-white p-2 rounded-lg shadow-2xl shadow-rose-500/20 transform hover:scale-105 transition-transform duration-500">
                             <img src={generatedImage} alt="Generated tattoo design" className="w-80 h-80 object-cover rounded-md"/>
                        </div>
                    )}
                </div>
            </div>
        </section>
    );
};

export default Hero;
