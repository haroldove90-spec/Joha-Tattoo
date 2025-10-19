import React, { useState, useEffect } from 'react';
import { getTattooTip } from '../services/geminiService';

const TipOfTheDay: React.FC = () => {
    const [tip, setTip] = useState<string>('');
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchTip = async () => {
            setIsLoading(true);
            const today = new Date().toDateString();
            const storedTip = JSON.parse(localStorage.getItem('tattooTip') || '{}');

            if (storedTip.date === today && storedTip.tip) {
                setTip(storedTip.tip);
            } else {
                const newTip = await getTattooTip();
                setTip(newTip);
                localStorage.setItem('tattooTip', JSON.stringify({ date: today, tip: newTip }));
            }
            setIsLoading(false);
        };

        fetchTip();
    }, []);

    return (
        <section className="bg-gray-900/40 py-12">
            <div className="container mx-auto px-6 text-center">
                <h3 className="text-2xl font-bold font-cinzel text-rose-400 mb-2 tracking-wider">Tip of the Day</h3>
                <div className="max-w-3xl mx-auto p-6 bg-gray-800/50 rounded-lg border border-gray-700 min-h-[80px] flex items-center justify-center">
                    {isLoading ? (
                         <div className="animate-pulse h-4 bg-gray-700 rounded w-3/4"></div>
                    ) : (
                        <p className="text-lg text-gray-300 italic">"{tip}"</p>
                    )}
                </div>
            </div>
        </section>
    );
};

export default TipOfTheDay;
