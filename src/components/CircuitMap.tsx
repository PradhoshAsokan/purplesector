'use client';

import { CIRCUIT_MAP_FILES } from '@/data/circuits';

interface CircuitMapProps {
  circuitId: string;
  className?: string;
  showCars?: boolean;
  color?: 'red' | 'white';
}

const CircuitMap = ({ circuitId, className = "w-full h-full", showCars = false, color = 'red' }: CircuitMapProps) => {
  const fileName = CIRCUIT_MAP_FILES[circuitId] || 'melbourne-2.svg';
  const svgPath = `/tracks/${fileName}`;

  // Filter logic:
  // Red: Full F1 Red transformation
  // White: Just basic visibility (invert to white)
  const filterStyle = color === 'red' 
    ? 'invert(22%) sepia(90%) saturate(7400%) hue-rotate(0deg) brightness(100%) contrast(110%) drop-shadow(0 0 8px rgba(255, 24, 1, 0.6))'
    : 'brightness(0) invert(1) opacity(0.8)';

  return (
    <div className={`relative flex items-center justify-center p-2 overflow-hidden ${className}`}>
      <div className="relative w-full h-full flex items-center justify-center">
        <img 
          src={svgPath}
          alt={`Circuit map for ${circuitId}`}
          className="w-full h-full object-contain select-none"
          style={{ filter: filterStyle }}
        />
        
        {showCars && (
          <div className="absolute inset-0 pointer-events-none">
             <div className="absolute top-1/2 left-1/2 w-2 h-2 bg-blue-400 rounded-full shadow-[0_0_10px_#60A5FA] animate-pulse"></div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CircuitMap;
