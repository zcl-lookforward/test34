import React, { useState, useCallback } from 'react';
import Experience from './components/Experience';
import { ShapeType } from './types';
import { SEQUENCE } from './constants';

const App: React.FC = () => {
  const [sequenceIndex, setSequenceIndex] = useState(0);

  const handleNextShape = useCallback(() => {
    setSequenceIndex((prev) => (prev + 1) % SEQUENCE.length);
  }, []);

  const currentShape = SEQUENCE[sequenceIndex];

  const getInstructions = (shape: ShapeType) => {
    switch(shape) {
      case ShapeType.TREE: return "Click to Ignite";
      case ShapeType.EXPLOSION_1: 
      case ShapeType.EXPLOSION_2: 
      case ShapeType.EXPLOSION_3: return "Reforming...";
      case ShapeType.HEART: return "Click to Disperse";
      case ShapeType.GALAXY: return "Click to Reset";
      default: return "Click to Transform";
    }
  };

  return (
    <div className="relative w-full h-full bg-black font-sans text-white select-none">
      
      {/* 3D Canvas Layer */}
      <div className="absolute inset-0 z-0">
        <Experience currentShape={currentShape} onCanvasClick={handleNextShape} />
      </div>

      {/* UI Overlay */}
      <div className="absolute top-0 left-0 w-full p-8 pointer-events-none z-10 flex flex-col items-center justify-between h-full">
        
        {/* Header */}
        <header className="text-center pt-8 opacity-80">
          <h1 className="text-3xl md:text-5xl font-extralight tracking-[0.3em] uppercase text-blue-200 drop-shadow-[0_0_15px_rgba(59,130,246,0.8)]">
            Celestial Tree
          </h1>
          <div className="w-16 h-[1px] bg-blue-500 mx-auto mt-4 opacity-50"></div>
        </header>

        {/* Instructions / Status */}
        <div className="mb-20 text-center animate-pulse">
          <p className="text-sm md:text-lg tracking-widest uppercase text-blue-100 opacity-60">
            {getInstructions(currentShape)}
          </p>
          <div className="mt-2 text-xs text-blue-300 opacity-40">
            [ Rotate &bull; Zoom &bull; Click ]
          </div>
        </div>
      </div>
      
      {/* Ambient Vignette */}
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,10,0.8)_100%)] z-1"></div>
    </div>
  );
};

export default App;
