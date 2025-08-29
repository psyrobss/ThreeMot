import type { RapierRigidBody } from '@react-three/rapier';
import type { MutableRefObject, Dispatch, SetStateAction } from 'react';
import type * as THREE from 'three';

// Input state and methods provided by the InputManager
export interface InputManager {
  getKey: (key: string) => boolean;
  getAxis: (negativeKey: string, positiveKey:string) => number;
  getMouseDelta: () => { dx: number; dy: number };
}

// A structure for scripts registered with the engine, including a priority
export interface Script {
    updateFn: (delta: number) => void;
    priority: number;
}

// The value provided by the EngineContext to all child components
export interface EngineContextType {
  registerScript: (updateFn: (delta: number) => void, priority?: number) => void;
  unregisterScript: (updateFn: (delta: number) => void) => void;
  scripts: MutableRefObject<Script[]>;
  input: InputManager;
}

// Common props for game object components (Entities)
export interface EntityProps {
  children?: React.ReactNode;
  position?: [number, number, number];
  rotation?: [number, number, number];
  scale?: [number, number, number];
}

// Props for the PlayerController component, decoupling it from the entity it controls
export interface PlayerControllerProps {
  rigidBodyRef: MutableRefObject<RapierRigidBody | null>;
  speed?: number;
  jumpForce?: number;
  interactionDistance?: number;
}

// Props for the usePlayerMovement hook
export interface PlayerMovementProps {
  rigidBodyRef: MutableRefObject<RapierRigidBody | null>;
  speed?: number;
  jumpForce?: number;
}

// Props for the usePlayerInteraction hook
export interface PlayerInteractionProps {
  interactionDistance?: number;
}


// Props for the Rotator component
export interface RotatorProps {
  rigidBodyRef: MutableRefObject<RapierRigidBody | null>;
  speed?: number;
}

// --- Interaction System Types ---

// The data attached to an interactable object's userData
export interface InteractableData {
    onInteract: () => void;
    promptMessage: string;
}

// Props for the Interactable component wrapper
export interface InteractableProps {
    children: React.ReactNode;
    promptMessage?: string;
    onInteract: () => void;
}

// The active interactable object being targeted by the player
export interface ActiveInteractable {
    id: string; // The UUID of the THREE.Object3D
    data: InteractableData;
}

// The context value for the interaction system
export interface InteractionContextType {
    activeInteractable: ActiveInteractable | null;
    setActiveInteractable: Dispatch<SetStateAction<ActiveInteractable | null>>;
}

// --- Editor System Types ---
export type TransformMode = 'translate' | 'rotate' | 'scale';

// The types of primitive shapes that can be created
export type PrimitiveType = 'cube' | 'sphere';

// A data structure to describe any object in the scene that can be manipulated by the editor
export interface SceneObject {
    uuid: string;
    type: string; // e.g., 'staticBox', 'spinningCube', or a primitive type like 'cube'
    name: string;
    // We use a flexible props object to hold transform and other component-specific data
    props: {
        position: [number, number, number];
        rotation: [number, number, number];
        scale: [number, number, number];
        // Component-specific properties
        color?: string;
        speed?: number;
        [key: string]: any; // Allows for other props like 'args', etc.
    };
}


export interface EditorContextType {
    isPlayMode: boolean;
    setIsPlayMode: React.Dispatch<React.SetStateAction<boolean>>;
    
    // The actual THREE.Object3D selected in the scene
    selectedObject: THREE.Object3D | null;
    setSelectedObject: React.Dispatch<React.SetStateAction<THREE.Object3D | null>>;
    
    // The data representation of the selected object, derived from sceneObjects
    selectedSceneObject: SceneObject | null;

    scene: THREE.Scene | null;
    setScene: React.Dispatch<React.SetStateAction<THREE.Scene | null>>;
    
    transformMode: TransformMode;
    setTransformMode: React.Dispatch<React.SetStateAction<TransformMode>>;
    
    // New state and functions for data-driven scene management
    sceneObjects: SceneObject[];
    setSceneObjects: React.Dispatch<React.SetStateAction<SceneObject[]>>;
    createObject: (type: PrimitiveType) => void;

    // New functions for a more robust data-driven workflow
    updateObject: (uuid: string, newProps: Partial<SceneObject['props']>) => void;
    syncObjectTransformFrom3D: (object: THREE.Object3D) => void;
}
