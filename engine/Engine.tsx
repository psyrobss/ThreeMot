import React, { useRef, useCallback } from 'react';
import { useFrame } from '@react-three/fiber';
import { EngineContext } from './core';
import { useInputManager, useEngine } from './hooks';
import { InteractionProvider } from './interaction.tsx';
import { EditorProvider } from './editor';
import type { Script } from './types';

interface EngineProviderProps {
  children: React.ReactNode;
}

// This new component contains the game loop logic and is safe to render inside the Canvas
export const EngineGameLoop = () => {
    const { scripts } = useEngine();
    useFrame((_, delta) => {
      // Sort the scripts by priority before executing them. Create a copy to avoid mutating the ref.
      const sortedScripts = [...scripts.current].sort((a, b) => a.priority - b.priority);
      
      const cappedDelta = Math.min(delta, 0.1); // Prevent physics glitches on frame drops
      for (const script of sortedScripts) {
          script.updateFn(cappedDelta);
      }
    });
    return null; // This component doesn't render anything itself
}

export const EngineProvider: React.FC<EngineProviderProps> = ({ children }) => {
  const scripts = useRef<Script[]>([]);
  const inputManager = useInputManager();

  const registerScript = useCallback((updateFn: (delta: number) => void, priority: number = 0) => {
    // Prevent adding the same function multiple times
    if (!scripts.current.some(s => s.updateFn === updateFn)) {
        scripts.current.push({ updateFn, priority });
    }
  }, []);

  const unregisterScript = useCallback((updateFn: (delta: number) => void) => {
    scripts.current = scripts.current.filter(s => s.updateFn !== updateFn);
  }, []);

  // The useFrame hook has been REMOVED from here to fix the critical error.
  // Its logic is now in the EngineGameLoop component.

  const contextValue = {
    registerScript,
    unregisterScript,
    scripts, // Expose the scripts ref for the game loop
    input: inputManager,
  };

  return (
    <EngineContext.Provider value={contextValue}>
      {children}
    </EngineContext.Provider>
  );
};

// A wrapper that includes all core engine providers that DO NOT depend on the R3F canvas.
// Systems that need access to the R3F scene (like CameraManager) must be inside the Canvas.
export const Engine: React.FC<{children: React.ReactNode}> = ({children}) => {
    return (
        <EngineProvider>
            <EditorProvider>
                <InteractionProvider>
                    {children}
                </InteractionProvider>
            </EditorProvider>
        </EngineProvider>
    )
}