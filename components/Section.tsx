
import React from 'react';

interface SectionProps {
  id: string;
  title: string;
  subtitle: string;
  children: React.ReactNode;
  className?: string;
}

const Section: React.FC<SectionProps> = ({ id, title, subtitle, children, className = '' }) => {
  return (
    <section id={id} className={`py-20 sm:py-28 ${className}`}>
      <div className="container mx-auto px-6 text-center">
        <h2 className="text-4xl sm:text-5xl font-bold font-cinzel text-white mb-4 tracking-wider">{title}</h2>
        <p className="text-lg text-gray-400 mb-12 max-w-2xl mx-auto">{subtitle}</p>
        {children}
      </div>
    </section>
  );
};

export default Section;
