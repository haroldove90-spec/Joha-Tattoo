
import React from 'react';
import Section from './Section';

const About: React.FC = () => {
  return (
    <Section
        id="about"
        title="The Artist"
        subtitle="Behind every line, there's a story."
    >
      <div className="flex flex-col lg:flex-row items-center justify-center gap-12 lg:gap-16 text-left max-w-5xl mx-auto">
        <div className="w-64 h-64 lg:w-80 lg:h-80 flex-shrink-0">
          <img 
            src="https://picsum.photos/seed/artist/500/500?grayscale" 
            alt="Joha, the tattoo artist" 
            className="w-full h-full object-cover rounded-full shadow-2xl shadow-rose-500/20 border-4 border-gray-800"
          />
        </div>
        <div className="flex-grow">
          <h3 className="text-3xl font-bold font-cinzel text-white mb-4">Joha</h3>
          <p className="text-gray-300 mb-4 leading-relaxed">
            With over a decade of experience, I specialize in creating timeless pieces that blend traditional techniques with modern aesthetics. For me, tattooing is more than just ink on skin; it's a collaborative art form, a way to commemorate moments, and a celebration of individuality.
          </p>
          <p className="text-gray-300 leading-relaxed">
            My passion lies in blackwork, fine-line details, and nature-inspired themes. I believe in creating a comfortable and safe environment where your ideas can flourish. Let's work together to create something beautiful and meaningful that you'll cherish for a lifetime.
          </p>
        </div>
      </div>
    </Section>
  );
};

export default About;
