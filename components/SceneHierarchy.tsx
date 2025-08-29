import React, { useState, useMemo } from 'react';
import * as THREE from 'three';
import { useEditor } from '../../engine/editor.tsx';

interface HierarchyItemProps {
  object: THREE.Object3D;
  level: number;
}

const HierarchyItem: React.FC<HierarchyItemProps> = ({ object, level }) => {
  const { selectedObject, setSelectedObject } = useEditor();
  const [isExpanded, setIsExpanded] = useState(true);
  const isSelected = selectedObject?.uuid === object.uuid;

  // We only want to show objects that are meshes or groups with a name
  const isVisible = object.name && (object.type === 'Mesh' || object.type === 'Group' || object.type === 'Scene');
  
  const hasVisibleChildren = useMemo(() => 
    object.children.some(child => child.name && (child.type === 'Mesh' || child.type === 'Group')),
    [object.children]
  );

  if (!isVisible) {
    return object.children.map(child => <HierarchyItem key={child.uuid} object={child} level={level} />);
  }
  
  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent parent from being selected
    setSelectedObject(object);
  };

  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsExpanded(!isExpanded);
  }

  return (
    <div>
      <div
        onClick={handleClick}
        className={`flex items-center cursor-pointer hover:bg-cyan-800/50 rounded ${isSelected ? 'bg-cyan-600' : ''}`}
        style={{ paddingLeft: `${level * 1}rem` }}
      >
        {hasVisibleChildren && (
          <button onClick={handleToggle} className="px-1 text-xs">{isExpanded ? '▼' : '▶'}</button>
        )}
        <span className={`flex-1 p-1 truncate ${!hasVisibleChildren ? 'ml-5' : ''}`}>{object.name || `Unnamed (${object.type})`}</span>
      </div>
      {isExpanded && object.children.map(child => <HierarchyItem key={child.uuid} object={child} level={level + 1} />)}
    </div>
  );
};


export const SceneHierarchy: React.FC = () => {
  const { scene } = useEditor();

  if (!scene) {
      return (
          <div className="p-2">
            <h2 className="text-lg font-bold text-cyan-300 border-b border-gray-600 pb-1 mb-2">Scene</h2>
            <p className="text-gray-400 italic">Loading scene hierarchy...</p>
          </div>
      )
  }

  return (
    <div className="p-2">
      <h2 className="text-lg font-bold text-cyan-300 border-b border-gray-600 pb-1 mb-2">Scene</h2>
      <div className="flex flex-col gap-1">
        <HierarchyItem object={scene} level={0} />
      </div>
    </div>
  );
};
