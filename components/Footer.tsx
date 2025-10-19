
import React from 'react';

const InstagramIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.85s-.011 3.584-.069 4.85c-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07s-3.584-.012-4.85-.07c-3.252-.148-4.771-1.691-4.919-4.919-.058-1.265-.069-1.645-.069-4.85s.011-3.584.069-4.85c.149-3.225 1.664-4.771 4.919-4.919C8.416 2.175 8.796 2.163 12 2.163zm0 1.62c-3.144 0-3.483.01-4.702.067-2.61.12-3.832 1.34-3.951 3.951-.057 1.22-.067 1.558-.067 4.702s.01 3.482.067 4.702c.12 2.61 1.34 3.832 3.951 3.951 1.22.057 1.558.067 4.702.067s3.482-.01 4.702-.067c2.61-.12 3.832-1.34 3.951-3.951.057-1.22.067-1.558.067-4.702s-.01-3.482-.067-4.702c-.12-2.61-1.34-3.832-3.951-3.951C15.482 3.793 15.144 3.783 12 3.783zM12 7.2c-2.649 0-4.8 2.15-4.8 4.8s2.151 4.8 4.8 4.8 4.8-2.15 4.8-4.8-2.151-4.8-4.8-4.8zm0 7.9c-1.71 0-3.1-1.39-3.1-3.1s1.39-3.1 3.1-3.1 3.1 1.39 3.1 3.1-1.39 3.1-3.1 3.1zm6.363-7.989c-.624 0-1.13.505-1.13 1.13s.506 1.13 1.13 1.13c.624 0 1.13-.505 1.13-1.13s-.506-1.13-1.13-1.13z"/>
  </svg>
);

const Footer: React.FC = () => {
  return (
    <footer className="bg-black border-t border-gray-800">
      <div className="container mx-auto px-6 py-8 flex flex-col sm:flex-row justify-between items-center text-center sm:text-left">
        <div>
          <p className="text-gray-400">&copy; {new Date().getFullYear()} Joha Tattoo. All Rights Reserved.</p>
          <p className="text-sm text-gray-500">Crafted with passion in the digital realm.</p>
        </div>
        <div className="flex justify-center space-x-4 mt-4 sm:mt-0">
          <a href="#" className="text-gray-400 hover:text-rose-500 transition-colors duration-300">
            <InstagramIcon />
          </a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
