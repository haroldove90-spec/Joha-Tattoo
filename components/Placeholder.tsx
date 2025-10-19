import React from 'react';

interface PlaceholderProps {
    title: string;
    message: string;
    icon: string;
}

const Placeholder: React.FC<PlaceholderProps> = ({ title, message, icon }) => {
    return (
        <div className="flex flex-col items-center justify-center text-center h-full py-16">
            <div className="text-6xl mb-4">{icon}</div>
            <h1 className="text-3xl font-bold font-cinzel text-main mb-2">{title}</h1>
            <p className="text-secondary max-w-sm">{message}</p>
             <p className="text-sm text-primary mt-4 font-semibold">Próximamente</p>
        </div>
    );
};

export default Placeholder;