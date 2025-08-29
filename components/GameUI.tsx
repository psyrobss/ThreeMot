import React from 'react';
import { InteractionPrompt } from './ui/InteractionPrompt';
import { Crosshair } from './ui/Crosshair';
import { ControlsDisplay } from './ui/ControlsDisplay';

const GameHeader = () => (
    <div className="p-4 bg-gradient-to-b from-black/60 to-transparent">
        <h1 className="text-2xl font-bold text-cyan-300">R3F Game Engine</h1>
        <p className="text-gray-300">Modular engine with interaction system.</p>
    </div>
);

export const GameUI: React.FC = () => {
  return (
    <div className="absolute top-0 left-0 w-full h-full pointer-events-none text-white font-mono select-none">
      <GameHeader />
      <InteractionPrompt />
      <Crosshair />
      <ControlsDisplay />
    </div>
  );
};