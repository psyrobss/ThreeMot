import React, { useState, useRef, useEffect } from 'react';
import * as THREE from 'three';
import { useEditor } from '../../engine/editor.tsx';
import type { SceneObject } from '../../engine/types';

const ToolButton = ({ title, active, onClick, children }: { title: string, active?: boolean, onClick: (e: React.MouseEvent) => void, children: React.ReactNode }) => (
    <button
        title={title}
        onClick={onClick}
        className={`px-3 py-1 rounded text-2xl transition-colors ${active ? 'bg-cyan-500' : 'bg-gray-700 hover:bg-gray-600'}`}
    >
        {children}
    </button>
);

const AddObjectDropdown: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);
    const { createObject } = useEditor();
    const dropdownRef = useRef<HTMLDivElement>(null);

    const handleCreate = (type: 'cube' | 'sphere') => {
        createObject(type);
        setIsOpen(false);
    }

    // Close dropdown if clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <div className="relative" ref={dropdownRef}>
            <ToolButton title="Adicionar Objeto" onClick={() => setIsOpen(!isOpen)}>➕</ToolButton>
            {isOpen && (
                <div className="absolute top-full mt-2 left-1/2 -translate-x-1/2 w-32 bg-gray-700 rounded-md shadow-lg z-30 border border-gray-600">
                    <button onClick={() => handleCreate('cube')} className="w-full text-left px-4 py-2 text-sm text-white hover:bg-cyan-600 rounded-t-md">Cubo</button>
                    <button onClick={() => handleCreate('sphere')} className="w-full text-left px-4 py-2 text-sm text-white hover:bg-cyan-600 rounded-b-md">Esfera</button>
                </div>
            )}
        </div>
    );
};

export const Toolbar: React.FC = () => {
    const { 
        isPlayMode, setIsPlayMode, 
        selectedObject, setSelectedObject, 
        transformMode, setTransformMode,
        sceneObjects, setSceneObjects
    } = useEditor();

    const handleDelete = () => {
        if (selectedObject) {
            setSceneObjects(prev => prev.filter(obj => obj.uuid !== selectedObject.userData.uuid));
            setSelectedObject(null);
        }
    };

    const handleDuplicate = () => {
        if (!selectedObject) return;
        
        const sourceObject = sceneObjects.find(obj => obj.uuid === selectedObject.userData.uuid);
        if (sourceObject) {
            // Find the highest index for the given type to generate a unique name
            const count = sceneObjects.filter(obj => obj.type === sourceObject.type).length;
            const newName = `${sourceObject.type.charAt(0).toUpperCase() + sourceObject.type.slice(1)}_${count + 1}`;

            const newObject: SceneObject = {
                ...JSON.parse(JSON.stringify(sourceObject)), // Deep copy
                uuid: THREE.MathUtils.generateUUID(),
                name: newName,
            };
            // Offset the new object slightly
            newObject.props.position[0] += 1.5;

            setSceneObjects(prev => [...prev, newObject]);

            // Select the new object after it's been rendered
            setTimeout(() => {
                const objInScene = selectedObject.parent?.getObjectByName(newName);
                 if (objInScene) {
                    const root = objInScene.parent;
                    if(root) setSelectedObject(root);
                }
            }, 0);
        }
    };

    return (
        <div className="absolute top-0 left-0 w-full h-12 bg-gray-800/90 pointer-events-auto flex items-center justify-center gap-4 border-b border-gray-700 shadow-lg z-20">
            {/* Simulation Controls */}
            <ToolButton
                title={isPlayMode ? 'Parar Simulação' : 'Iniciar Simulação'}
                onClick={() => setIsPlayMode(!isPlayMode)}
            >
                {isPlayMode ? '⏹️' : '▶️'}
            </ToolButton>

            <div className="w-px h-6 bg-gray-600" />

            {/* Transform Tools */}
            <div className="flex items-center gap-2">
                <ToolButton title="Mover (W)" active={transformMode === 'translate'} onClick={() => setTransformMode('translate')}>↔️</ToolButton>
                <ToolButton title="Rotacionar (E)" active={transformMode === 'rotate'} onClick={() => setTransformMode('rotate')}>🔄</ToolButton>
                <ToolButton title="Escalar (R)" active={transformMode === 'scale'} onClick={() => setTransformMode('scale')}>📏</ToolButton>
            </div>
            
            <div className="w-px h-6 bg-gray-600" />

            {/* Object Management */}
            <div className="flex items-center gap-2">
                 <AddObjectDropdown />
                 <ToolButton title="Duplicar Objeto (Ctrl+D)" onClick={handleDuplicate}>📄</ToolButton>
                 <ToolButton title="Deletar Objeto (Delete)" onClick={handleDelete}>🗑️</ToolButton>
            </div>
        </div>
    );
};
