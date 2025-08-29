import React, { createContext, useContext, useState, useMemo, useCallback } from 'react';
import * as THREE from 'three';
import type { EditorContextType, TransformMode, SceneObject, PrimitiveType } from './types';

// The initial set of objects that can be manipulated in the editor
const INITIAL_EDITABLE_OBJECTS: SceneObject[] = [
    {
        uuid: THREE.MathUtils.generateUUID(),
        type: 'spinningCube',
        name: 'SpinningCube_1',
        props: {
            position: [8, 1, 0],
            rotation: [0, 0, 0],
            scale: [1, 1, 1],
            speed: 0.5,
        }
    },
    {
        uuid: THREE.MathUtils.generateUUID(),
        type: 'staticBox',
        name: 'InteractBox_1',
        props: {
            position: [-5, 0.5, 5],
            rotation: [0, 0, 0],
            scale: [1, 1, 1],
            color: '#fca311',
        }
    },
    {
        uuid: THREE.MathUtils.generateUUID(),
        type: 'staticBox',
        name: 'InteractBox_2',
        props: {
            position: [-5, 1.5, 5],
            rotation: [0, 0, 0],
            scale: [1, 1, 1],
            color: '#fca311',
        }
    },
    {
        uuid: THREE.MathUtils.generateUUID(),
        type: 'staticBox',
        name: 'StaticBox_1',
        props: {
            position: [0, 0.5, -8],
            rotation: [0, 0, 0],
            scale: [1, 1, 1],
            color: '#fca311',
        }
    }
]

// Create a context for the editor system
export const EditorContext = createContext<EditorContextType | null>(null);

// A provider component that encapsulates the editor state
export const EditorProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [isPlayMode, setIsPlayMode] = useState<boolean>(false);
    const [selectedObject, setSelectedObject] = useState<THREE.Object3D | null>(null);
    const [scene, setScene] = useState<THREE.Scene | null>(null);
    const [transformMode, setTransformMode] = useState<TransformMode>('translate');
    const [sceneObjects, setSceneObjects] = useState<SceneObject[]>(INITIAL_EDITABLE_OBJECTS);

    // Derive the selected scene object's *data* from the selected THREE.Object3D
    const selectedSceneObject = useMemo(() => {
        if (!selectedObject) return null;
        return sceneObjects.find(obj => obj.uuid === selectedObject.userData.uuid) || null;
    }, [selectedObject, sceneObjects]);


    // When we exit play mode, clear the selection
    const handleSetPlayMode = (value: React.SetStateAction<boolean>) => {
        const newIsPlayMode = typeof value === 'function' ? value(isPlayMode) : value;
        if (!newIsPlayMode) {
            setSelectedObject(null);
        }
        setIsPlayMode(newIsPlayMode);
    }

    const createObject = useCallback((type: PrimitiveType) => {
        // Find the highest index for the given primitive type to generate a unique name
        const count = sceneObjects.filter(obj => obj.type === type).length;
        const name = `${type.charAt(0).toUpperCase() + type.slice(1)}_${count + 1}`;
        
        const newObject: SceneObject = {
            uuid: THREE.MathUtils.generateUUID(),
            type,
            name,
            props: {
                position: [0, 1, 0],
                rotation: [0, 0, 0],
                scale: [1, 1, 1],
                color: '#cccccc',
            }
        };
        
        setSceneObjects(prev => [...prev, newObject]);
        
        setTimeout(() => {
            if (scene) {
                const objInScene = scene.getObjectByName(name);
                if (objInScene) {
                    const root = objInScene.parent;
                    if(root) setSelectedObject(root);
                }
            }
        }, 0);

    }, [sceneObjects, scene]);

    const updateObject = useCallback((uuid: string, newProps: Partial<SceneObject['props']>) => {
        setSceneObjects(prev =>
            prev.map(obj =>
                obj.uuid === uuid
                    ? { ...obj, props: { ...obj.props, ...newProps } }
                    : obj
            )
        );
    }, []);

    const syncObjectTransformFrom3D = useCallback((object: THREE.Object3D) => {
        if (!object.userData.uuid) return;
        
        const { position, rotation, scale } = object;
        
        updateObject(object.userData.uuid, {
            position: position.toArray(),
            rotation: [rotation.x, rotation.y, rotation.z],
            scale: scale.toArray(),
        });
    }, [updateObject]);

    const contextValue = useMemo(() => ({
        isPlayMode,
        setIsPlayMode: handleSetPlayMode,
        selectedObject,
        setSelectedObject,
        selectedSceneObject,
        scene,
        setScene,
        transformMode,
        setTransformMode,
        sceneObjects,
        setSceneObjects,
        createObject,
        updateObject,
        syncObjectTransformFrom3D,
    }), [
        isPlayMode, selectedObject, selectedSceneObject, 
        scene, transformMode, sceneObjects, 
        createObject, updateObject, syncObjectTransformFrom3D
    ]);

    return (
        <EditorContext.Provider value={contextValue}>
            {children}
        </EditorContext.Provider>
    );
};

// Custom hook to easily access the editor context
export const useEditor = () => {
    const context = useContext(EditorContext);
    if (!context) {
        throw new Error('useEditor must be used within an EditorProvider');
    }
    return context;
};
