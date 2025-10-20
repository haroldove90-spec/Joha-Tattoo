import React, { useState, useEffect } from 'react';
import { getTattooTip } from '../services/geminiService';

const TipOfTheDay: React.FC = () => {
    const [tip, setTip] = useState('');
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchTip = async () => {
            setIsLoading(true);
            try {
                const today = new Date().toISOString().split('T')[0];
                const storedTipData = localStorage.getItem('dailyTattooTip');

                if (storedTipData) {
                    const { tip: storedTip, date: storedDate } = JSON.parse(storedTipData);
                    if (storedDate === today) {
                        setTip(storedTip);
                        setIsLoading(false);
                        return; // Use the stored tip for today
                    }
                }

                // Fetch a new tip if it's a new day or no tip is stored
                const newTip = await getTattooTip();
                setTip(newTip);
                
                // Save the new tip with today's date
                localStorage.setItem('dailyTattooTip', JSON.stringify({ tip: newTip, date: today }));

            } catch (err) {
                setTip('No se pudo cargar el consejo de hoy. ¡Pero sigue practicando!');
            } finally {
                setIsLoading(false);
            }
        };
        fetchTip();
    }, []);

    return (
        <div className="bg-card border border-border-card rounded-lg p-4 flex items-start space-x-4">
            <div className="flex-shrink-0">
                <span className="text-primary">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg>
                </span>
            </div>
            <div>
                <h3 className="font-bold text-main">Consejo del Día</h3>
                {isLoading ? (
                    <p className="text-sm text-secondary animate-pulse">Cargando consejo...</p>
                ) : (
                    <p className="text-sm text-secondary">{tip}</p>
                )}
            </div>
        </div>
    );
};

export default TipOfTheDay;