import React, { createContext, useContext, useState, useMemo, useCallback } from 'react';
import type * as THREE from 'three';
import type { EditorContextType, TransformMode } from './types';

// Create a context for the editor system
export const EditorContext = createContext<EditorContextType | null>(null);

// A provider component that encapsulates the editor state
export const EditorProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [isPlayMode, setIsPlayMode] = useState<boolean>(false);
    const [selectedObject, setSelectedObject] = useState<THREE.Object3D | null>(null);
    const [scene, setScene] = useState<THREE.Scene | null>(null);
    const [transformMode, setTransformMode] = useState<TransformMode>('translate');
    const [revision, setRevision] = useState<number>(0);

    // When we exit play mode, clear the selection
    const handleSetPlayMode = (value: React.SetStateAction<boolean>) => {
        // Resolve the new value whether a value or a function is passed
        const newIsPlayMode = typeof value === 'function' ? value(isPlayMode) : value;
        if (!newIsPlayMode) {
            setSelectedObject(null);
        }
        setIsPlayMode(newIsPlayMode);
    }

    const incrementRevision = useCallback(() => {
        setRevision(r => r + 1);
    }, []);

    const contextValue = useMemo(() => ({
        isPlayMode,
        setIsPlayMode: handleSetPlayMode,
        selectedObject,
        setSelectedObject,
        scene,
        setScene,
        transformMode,
        setTransformMode,
        revision,
        incrementRevision,
    }), [isPlayMode, selectedObject, scene, transformMode, revision, incrementRevision]);

    return React.createElement(EditorContext.Provider, { value: contextValue }, children);
};

// Custom hook to easily access the editor context
export const useEditor = () => {
    const context = useContext(EditorContext);
    if (!context) {
        throw new Error('useEditor must be used within an EditorProvider');
    }
    return context;
};