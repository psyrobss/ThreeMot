import React from 'react';
import * as THREE from 'three';
import { useEditor } from '../../engine/editor.tsx';
import type { SceneObject } from '../../engine/types';

// A generic control for a single number input (like speed)
const NumberControl: React.FC<{
    label: string;
    value: number;
    onChange: (newValue: number) => void;
    step?: number;
    min?: number;
    max?: number;
}> = ({ label, value, onChange, step = 0.1, min, max }) => {
    return (
        <div className="mb-2">
            <label className="text-sm text-gray-400 flex justify-between items-center">
                <span>{label}</span>
                <input 
                    type="number"
                    step={step}
                    min={min}
                    max={max}
                    value={value?.toFixed(2) || 0} 
                    onChange={e => onChange(parseFloat(e.target.value))} 
                    className="w-24 bg-gray-900 rounded p-1 text-right" 
                />
            </label>
        </div>
    )
}

// A generic control for a color input
const ColorControl: React.FC<{
    label: string;
    value: string;
    onChange: (newValue: string) => void;
}> = ({ label, value, onChange }) => {
    return (
        <div className="mb-2">
             <label className="text-sm text-gray-400 flex justify-between items-center">
                <span>{label}</span>
                <input 
                    type="color"
                    value={value || '#ffffff'} 
                    onChange={e => onChange(e.target.value)} 
                    className="w-24 h-7 p-0 m-0 bg-gray-900 border-none rounded" 
                />
            </label>
        </div>
    )
}


// A reusable component for a 3-component vector (like position, rotation, scale)
const Vector3Control: React.FC<{
  label: string;
  value: [number, number, number];
  onChange: (axis: 'x' | 'y' | 'z', newValue: number) => void;
}> = ({ label, value, onChange }) => {
  
  const handleInputChange = (axis: 'x' | 'y' | 'z', strValue: string) => {
    let numValue = parseFloat(strValue);
    if (isNaN(numValue)) numValue = 0;
    onChange(axis, numValue);
  };

  const [x, y, z] = value;

  return (
    <div className="mb-2">
      <label className="text-sm text-gray-400">{label}</label>
      <div className="grid grid-cols-3 gap-2 items-center mt-1">
        <input type="number" step={0.1} value={x.toFixed(2)} onChange={e => handleInputChange('x', e.target.value)} className="w-full bg-gray-900 rounded p-1 text-right" />
        <input type="number" step={0.1} value={y.toFixed(2)} onChange={e => handleInputChange('y', e.target.value)} className="w-full bg-gray-900 rounded p-1 text-right" />
        <input type="number" step={0.1} value={z.toFixed(2)} onChange={e => handleInputChange('z', e.target.value)} className="w-full bg-gray-900 rounded p-1 text-right" />
      </div>
    </div>
  );
};

// --- Component-specific property panels ---

const SpinningCubeProperties: React.FC<{ obj: SceneObject }> = ({ obj }) => {
    const { updateObject } = useEditor();
    return (
        <NumberControl
            label="Rotation Speed"
            value={obj.props.speed || 0}
            onChange={speed => updateObject(obj.uuid, { speed })}
            min={-5}
            max={5}
            step={0.1}
        />
    )
}

const ColorProperties: React.FC<{ obj: SceneObject }> = ({ obj }) => {
    const { updateObject } = useEditor();
    return (
        <ColorControl
            label="Color"
            value={obj.props.color || '#ffffff'}
            onChange={color => updateObject(obj.uuid, { color })}
        />
    )
}


export const InspectorPanel: React.FC = () => {
  const { selectedSceneObject, updateObject } = useEditor();

  if (!selectedSceneObject) {
    return (
      <div className="p-2">
        <h2 className="text-lg font-bold text-cyan-300 border-b border-gray-600 pb-1 mb-2">Inspector</h2>
        <p className="text-gray-400 italic">No object selected.</p>
      </div>
    );
  }

  const { uuid, name, type, props } = selectedSceneObject;

  const handleTransformChange = (
    property: 'position' | 'rotation' | 'scale',
    axis: 'x' | 'y' | 'z',
    value: number
  ) => {
    const currentVec = props[property];
    const newVec: [number, number, number] = [...currentVec];
    if (axis === 'x') newVec[0] = value;
    if (axis === 'y') newVec[1] = value;
    if (axis === 'z') newVec[2] = value;
    updateObject(uuid, { [property]: newVec });
  };
  
  const handleRotationChange = (axis: 'x' | 'y' | 'z', value: number) => {
    const currentRot = props.rotation;
    const newRot: [number, number, number] = [...currentRot];
    const radValue = THREE.MathUtils.degToRad(value);
     if (axis === 'x') newRot[0] = radValue;
    if (axis === 'y') newRot[1] = radValue;
    if (axis === 'z') newRot[2] = radValue;
    updateObject(uuid, { rotation: newRot });
  }

  return (
    <div className="p-2">
      <h2 className="text-lg font-bold text-cyan-300 border-b border-gray-600 pb-1 mb-2 truncate">
        {name || 'Unnamed Object'}
      </h2>
      
      <div className="mt-4">
        <h3 className="font-bold text-md text-cyan-400 mb-2 border-b border-gray-700 pb-1">Transform</h3>
        <Vector3Control 
          label="Position" 
          value={props.position}
          onChange={(axis, value) => handleTransformChange('position', axis, value)}
        />
        <div className="mb-2">
            <label className="text-sm text-gray-400">Rotation</label>
            <div className="grid grid-cols-3 gap-2 items-center mt-1">
                <input type="number" step={1} value={THREE.MathUtils.radToDeg(props.rotation[0]).toFixed(1)} onChange={e => handleRotationChange('x', parseFloat(e.target.value))} className="w-full bg-gray-900 rounded p-1 text-right" />
                <input type="number" step={1} value={THREE.MathUtils.radToDeg(props.rotation[1]).toFixed(1)} onChange={e => handleRotationChange('y', parseFloat(e.target.value))} className="w-full bg-gray-900 rounded p-1 text-right" />
                <input type="number" step={1} value={THREE.MathUtils.radToDeg(props.rotation[2]).toFixed(1)} onChange={e => handleRotationChange('z', parseFloat(e.target.value))} className="w-full bg-gray-900 rounded p-1 text-right" />
            </div>
        </div>
        <Vector3Control 
          label="Scale" 
          value={props.scale}
          onChange={(axis, value) => handleTransformChange('scale', axis, value)}
        />
      </div>

      <div className="mt-4">
        <h3 className="font-bold text-md text-cyan-400 mb-2 border-b border-gray-700 pb-1">Components</h3>
        {type === 'spinningCube' && <SpinningCubeProperties obj={selectedSceneObject} />}
        {type === 'staticBox' && <ColorProperties obj={selectedSceneObject} />}
        {(type === 'cube' || type === 'sphere') && <ColorProperties obj={selectedSceneObject} />}

      </div>
    </div>
  );
};
