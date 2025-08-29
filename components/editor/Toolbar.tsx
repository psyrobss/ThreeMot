import React from 'react';
import { useEditor } from '../../engine/editor';

const ToolButton = ({ title, active, onClick, children }: { title: string, active?: boolean, onClick: () => void, children: React.ReactNode }) => (
    <button
        title={title}
        onClick={onClick}
        className={`px-3 py-1 rounded text-2xl transition-colors ${active ? 'bg-cyan-500' : 'bg-gray-700 hover:bg-gray-600'}`}
    >
        {children}
    </button>
);

export const Toolbar: React.FC = () => {
    const { isPlayMode, setIsPlayMode, selectedObject, setSelectedObject, scene, transformMode, setTransformMode } = useEditor();

    const handleDelete = () => {
        if (selectedObject) {
            selectedObject.removeFromParent();
            setSelectedObject(null);
        }
    };

    const handleDuplicate = () => {
        if (selectedObject && scene) {
            const clone = selectedObject.clone(true);
            // Optional: Add a suffix to distinguish the clone
            clone.name = `${selectedObject.name}_clone`;
            scene.add(clone);
            setSelectedObject(clone); // Select the new clone
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
                 <ToolButton title="Duplicar Objeto (Ctrl+D)" onClick={handleDuplicate}>➕</ToolButton>
                 <ToolButton title="Deletar Objeto (Delete)" onClick={handleDelete}>🗑️</ToolButton>
            </div>
        </div>
    );
};