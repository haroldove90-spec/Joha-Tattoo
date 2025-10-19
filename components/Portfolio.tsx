
import React from 'react';
import Section from './Section';

const portfolioImages = [
    { id: 1, src: "https://picsum.photos/seed/tattoo1/500/500?grayscale&blur=1", alt: "Abstract line tattoo" },
    { id: 2, src: "https://picsum.photos/seed/tattoo2/500/500?grayscale", alt: "Floral tattoo design" },
    { id: 3, src: "https://picsum.photos/seed/tattoo3/500/500?grayscale", alt: "Geometric animal tattoo" },
    { id: 4, src: "https://picsum.photos/seed/tattoo4/500/500?grayscale&blur=1", alt: "Minimalist symbol tattoo" },
    { id: 5, src: "https://picsum.photos/seed/tattoo5/500/500?grayscale", alt: "Detailed portrait tattoo" },
    { id: 6, src: "https://picsum.photos/seed/tattoo6/500/500?grayscale", alt: "Nature scene tattoo" },
];

const Portfolio: React.FC = () => {
  return (
    <Section
        id="portfolio"
        title="My Work"
        subtitle="A collection of my recent tattoos. Each piece tells a unique story, crafted with passion and precision."
        className="bg-gray-900/40"
    >
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {portfolioImages.map((image) => (
                <div key={image.id} className="group relative overflow-hidden rounded-lg shadow-lg">
                    <img src={image.src} alt={image.alt} className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500 ease-in-out" />
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-opacity duration-300 flex items-center justify-center">
                        <p className="text-white text-lg font-semibold opacity-0 group-hover:opacity-100 transition-opacity duration-300">{image.alt}</p>
                    </div>
                </div>
            ))}
        </div>
    </Section>
  );
};

export default Portfolio;
