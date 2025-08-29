import React from 'react';
import * as THREE from 'three';
import { useEditor } from '../../engine/editor';

// A reusable component for a 3-component vector (like position, rotation, scale)
const Vector3Control: React.FC<{
  label: string;
  value: THREE.Vector3 | THREE.Euler;
  onChange: (axis: 'x' | 'y' | 'z', newValue: number) => void;
  isDegrees?: boolean; // For converting rotation radians to degrees
}> = ({ label, value, onChange, isDegrees = false }) => {
  
  const getDisplayValue = (val: number) => isDegrees ? THREE.MathUtils.radToDeg(val) : val;
  
  const handleInputChange = (axis: 'x' | 'y' | 'z', strValue: string) => {
    let numValue = parseFloat(strValue);
    if (isNaN(numValue)) numValue = 0;
    if (isDegrees) numValue = THREE.MathUtils.degToRad(numValue);
    onChange(axis, numValue);
  };

  return (
    <div className="mb-2">
      <label className="text-sm text-gray-400">{label}</label>
      <div className="grid grid-cols-4 gap-2 items-center mt-1">
        <span className="px-2 py-1 text-center bg-gray-700/50 text-red-400 rounded-md">X</span>
        <input type="number" step={0.1} value={getDisplayValue(value.x).toFixed(2)} onChange={e => handleInputChange('x', e.target.value)} className="w-full bg-gray-900 rounded p-1 text-right" />
        <span className="px-2 py-1 text-center bg-gray-700/50 text-green-400 rounded-md">Y</span>
        <input type="number" step={0.1} value={getDisplayValue(value.y).toFixed(2)} onChange={e => handleInputChange('y', e.target.value)} className="w-full bg-gray-900 rounded p-1 text-right" />
        <span className="px-2 py-1 text-center bg-gray-700/50 text-blue-400 rounded-md">Z</span>
        <input type="number" step={0.1} value={getDisplayValue(value.z).toFixed(2)} onChange={e => handleInputChange('z', e.target.value)} className="w-full bg-gray-900 rounded p-1 text-right" />
      </div>
    </div>
  );
};


export const InspectorPanel: React.FC = () => {
  const { selectedObject, revision, incrementRevision } = useEditor();

  if (!selectedObject) {
    return (
      <div className="p-2">
        <h2 className="text-lg font-bold text-cyan-300 border-b border-gray-600 pb-1 mb-2">Inspector</h2>
        <p className="text-gray-400 italic">No object selected.</p>
      </div>
    );
  }

  const handleTransformChange = (
    property: 'position' | 'rotation' | 'scale',
    axis: 'x' | 'y' | 'z',
    value: number
  ) => {
    if (selectedObject) {
      selectedObject[property][axis] = value;
      // Force a re-render by updating the revision key from the context
      incrementRevision();
    }
  };

  return (
    // The key now uses the global revision, so it updates when the gizmo moves the object
    <div className="p-2" key={selectedObject.uuid + revision}>
      <h2 className="text-lg font-bold text-cyan-300 border-b border-gray-600 pb-1 mb-2 truncate">
        {selectedObject.name || 'Unnamed Object'}
      </h2>
      
      <div className="mt-4">
        <h3 className="font-bold text-md text-cyan-400 mb-2">Transform</h3>
        <Vector3Control 
          label="Position" 
          value={selectedObject.position}
          onChange={(axis, value) => handleTransformChange('position', axis, value)}
        />
        <Vector3Control 
          label="Rotation" 
          value={selectedObject.rotation}
          onChange={(axis, value) => handleTransformChange('rotation', axis, value)}
          isDegrees
        />
        <Vector3Control 
          label="Scale" 
          value={selectedObject.scale}
          onChange={(axis, value) => handleTransformChange('scale', axis, value)}
        />
      </div>
    </div>
  );
};