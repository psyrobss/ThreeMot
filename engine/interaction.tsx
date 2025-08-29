import React, { createContext, useContext, useState, useMemo } from 'react';
import type { InteractionContextType, ActiveInteractable } from './types';

// Create a context for the interaction system
export const InteractionContext = createContext<InteractionContextType | null>(null);

// A provider component that encapsulates the interaction state
export const InteractionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [activeInteractable, setActiveInteractable] = useState<ActiveInteractable | null>(null);

    const contextValue = useMemo(() => ({
        activeInteractable,
        setActiveInteractable,
    }), [activeInteractable]);

    // Reverted to standard JSX, which is more readable and conventional in .tsx files.
    return (
        <InteractionContext.Provider value={contextValue}>
            {children}
        </InteractionContext.Provider>
    );
};

// Custom hook to easily access the interaction context
export const useInteraction = () => {
    const context = useContext(InteractionContext);
    if (!context) {
        throw new Error('useInteraction must be used within an InteractionProvider');
    }
    return context;
};
