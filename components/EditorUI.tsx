import React, { useState } from 'react';
import { SceneHierarchy } from './SceneHierarchy';
import { InspectorPanel } from './InspectorPanel';
import { Toolbar } from './editor/Toolbar';

export const EditorUI: React.FC = () => {
    const [isHierarchyOpen, setIsHierarchyOpen] = useState(true);
    const [isInspectorOpen, setIsInspectorOpen] = useState(true);

    return (
        <div className="absolute top-0 left-0 w-full h-full pointer-events-none text-white font-mono select-none overflow-x-hidden">
            <Toolbar />

            {/* Left Panel - Scene Hierarchy */}
            <div className={`absolute top-12 left-0 w-72 h-[calc(100%-48px)] transition-transform duration-300 ease-in-out z-10 ${isHierarchyOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                <div className="w-full h-full bg-gray-800/80 backdrop-blur-sm border-r border-gray-700 pointer-events-auto overflow-y-auto">
                    <SceneHierarchy />
                </div>
                {/* Toggle Button */}
                <button
                    onClick={() => setIsHierarchyOpen(!isHierarchyOpen)}
                    className="absolute top-1/2 -translate-y-1/2 right-0 translate-x-full w-5 h-20 bg-gray-700/90 hover:bg-cyan-600 rounded-r-lg pointer-events-auto flex items-center justify-center transition-colors"
                    title={isHierarchyOpen ? 'Collapse Hierarchy' : 'Expand Hierarchy'}
                >
                    <span className="text-white text-lg">{isHierarchyOpen ? '◀' : '▶'}</span>
                </button>
            </div>


            {/* Right Panel - Inspector */}
            <div className={`absolute top-12 right-0 w-80 h-[calc(100%-48px)] transition-transform duration-300 ease-in-out z-10 ${isInspectorOpen ? 'translate-x-0' : 'translate-x-full'}`}>
                <div className="w-full h-full bg-gray-800/80 backdrop-blur-sm border-l border-gray-700 pointer-events-auto overflow-y-auto">
                    <InspectorPanel />
                </div>
                {/* Toggle Button */}
                 <button
                    onClick={() => setIsInspectorOpen(!isInspectorOpen)}
                    className="absolute top-1/2 -translate-y-1/2 left-0 -translate-x-full w-5 h-20 bg-gray-700/90 hover:bg-cyan-600 rounded-l-lg pointer-events-auto flex items-center justify-center transition-colors"
                    title={isInspectorOpen ? 'Collapse Inspector' : 'Expand Inspector'}
                >
                    <span className="text-white text-lg">{isInspectorOpen ? '▶' : '◀'}</span>
                </button>
            </div>
        </div>
    );
};
