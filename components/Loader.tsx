
import React from 'react';

const Loader: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center space-y-4">
      <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-rose-500"></div>
      <p className="text-rose-400 font-cinzel tracking-wider">Inking your idea...</p>
    </div>
  );
};

export default Loader;
