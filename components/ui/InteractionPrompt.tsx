import React from 'react';
import { useInteraction } from '../../engine/interaction.tsx';

export const InteractionPrompt = () => {
    const { activeInteractable } = useInteraction();

    if (!activeInteractable) return null;

    return (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center">
            <p className="text-lg bg-black/60 px-4 py-2 rounded-md shadow-lg">
                <span className="font-bold text-cyan-300">[E]</span> {activeInteractable.data.promptMessage}
            </p>
        </div>
    );
};