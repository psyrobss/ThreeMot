import React from 'react';

export const ControlsDisplay = () => (
    <div className="absolute bottom-4 left-4 p-4 bg-black/50 rounded-lg shadow-lg border border-gray-700">
        <h2 className="font-bold text-lg mb-2 text-cyan-300">Controls</h2>
        <p className="flex items-center gap-2"><span className="font-bold p-2 w-24 text-center bg-gray-700 rounded">W, A, S, D</span> - Move</p>
        <p className="flex items-center gap-2 mt-2"><span className="font-bold p-2 w-24 text-center bg-gray-700 rounded">SPACE</span> - Jump</p>
        <p className="flex items-center gap-2 mt-2"><span className="font-bold p-2 w-24 text-center bg-gray-700 rounded">Mouse</span> - Look Around</p>
        <p className="flex items-center gap-2 mt-2"><span className="font-bold p-2 w-24 text-center bg-gray-700 rounded">E</span> - Interact</p>
    </div>
);
