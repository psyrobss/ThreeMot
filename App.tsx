import React, { Suspense, useRef, useEffect } from 'react';
import * as THREE from 'three';
import { Canvas, useThree } from '@react-three/fiber';
import { Sky, OrbitControls, TransformControls } from '@react-three/drei';
import { Physics } from '@react-three/rapier';
import { Selection, EffectComposer, Outline } from '@react-three/postprocessing';

// Engine systems and components
import { Engine, EngineGameLoop } from './engine/Engine';
import { CameraManager } from './engine/camera.tsx';
import { useEditor } from './engine/editor.tsx';
import type { SceneObject, PrimitiveType } from './engine/types';


// UI Components
import { GameUI } from './components/GameUI';
import { EditorUI } from './components/EditorUI';

// Scene Components
import { Floor } from './components/scene/Floor';
import { Wall } from './components/scene/Wall';
import { Player } from './components/scene/Player';
import { SpinningCube } from './components/scene/SpinningCube';
import { StaticBox } from './components/scene/StaticBox';
import { Primitive } from './components/scene/Primitive';


// --- Core App Structure ---

// A small bridge component to pass R3F state (like the scene) to external UI
const SceneConnector = () => {
    const scene = useThree(state => state.scene);
    const { setScene } = useEditor();
    useEffect(() => {
        if (setScene) {
            setScene(scene);
        }
    }, [scene, setScene]);
    return null;
}

// This component now lives inside the Canvas and hosts all R3F-dependent systems
const EngineSystems = ({ children }: { children: React.ReactNode}) => {
    return (
        <CameraManager>
            <SceneConnector />
            <EngineGameLoop />
            {children}
        </CameraManager>
    )
}

// A helper function to map a SceneObject from state to a renderable component
const renderSceneObject = (obj: SceneObject) => {
    // We attach the unique ID to the userData of the root object for later identification
    const passThroughProps = {
        key: obj.uuid,
        name: obj.name,
        // Pass all properties from the data object to the component
        ...obj.props,
        // This is crucial for linking the THREE.Object3D back to our state object
        userData: { uuid: obj.uuid } 
    };

    switch (obj.type) {
        case 'spinningCube':
            return <SpinningCube {...passThroughProps} />;
        case 'staticBox':
            return <StaticBox {...passThroughProps} />;
        case 'cube':
        case 'sphere':
             // FIX: Changed prop from `shape` to `primitiveShape` to match the updated Primitive component interface.
             return <Primitive primitiveShape={obj.type as PrimitiveType} {...passThroughProps} />;
        default:
            return null;
    }
}

// Renders the 3D scene content and manages camera/player based on editor mode
const SceneContent = () => {
    const { 
        isPlayMode, 
        selectedObject, setSelectedObject, 
        transformMode, syncObjectTransformFrom3D,
        sceneObjects 
    } = useEditor();

    const handleSelect = (e: import('@react-three/fiber').ThreeEvent<MouseEvent>) => {
        if (isPlayMode) return;
        e.stopPropagation();

        let current: THREE.Object3D | null = e.object;
        let entityRoot: THREE.Object3D | null = null;
        
        // Traverse up the scene graph from the clicked object
        while (current) {
            // Select the object that has our UUID in its userData
            if (current.userData.uuid) {
                entityRoot = current; // Found the entity root
                break;
            }
            current = current.parent;
        }
        
        setSelectedObject(entityRoot);
    }
    
    return (
        <Selection>
            <EffectComposer multisampling={8} autoClear={false}>
                <Outline blur visibleEdgeColor={0xffffff} edgeStrength={100} width={1000} />
            </EffectComposer>

            {/* Environment and Lighting */}
            <ambientLight intensity={0.8} />
            <directionalLight 
                castShadow 
                position={[10, 20, 15]} 
                intensity={1.5} 
                shadow-mapSize-width={2048}
                shadow-mapSize-height={2048}
            />
            <Sky sunPosition={[100, 20, 100]} />

            {/* In Editor mode, add the interactive transform gizmo */}
            {selectedObject && !isPlayMode && (
                <TransformControls 
                    object={selectedObject} 
                    mode={transformMode} 
                    onMouseUp={() => syncObjectTransformFrom3D(selectedObject)}
                />
            )}

            {/* In Editor mode, enable free-look OrbitControls */}
            {!isPlayMode && <OrbitControls makeDefault />}

            <Physics gravity={[0, -20, 0]}>
                <Suspense fallback={null}>
                    {/* Wrap scene objects in a group to handle deselection */}
                    <group onClick={handleSelect}>
                        {/* Static, non-editable world geometry */}
                        <Floor />
                        <Wall name="BackWall" position={[0, 2.5, -15]} args={[20, 5, 1]} />
                        <Wall name="LeftWall" position={[-10, 2.5, -5]} args={[1, 5, 20]} />
                        
                        {/* Render editable objects from state */}
                        {sceneObjects.map(renderSceneObject)}
                    </group>
                    
                    {/* In Play mode, spawn the player */}
                    {isPlayMode && <Player />}
                </Suspense>
            </Physics>
        </Selection>
    );
};

// Manages the UI layer and pointer lock state
const UIController = () => {
    const { isPlayMode } = useEditor();
    const { gl } = useThree();

    useEffect(() => {
        const canvas = gl.domElement;
        const handlePointerLockChange = () => {
          if (document.pointerLockElement !== canvas && isPlayMode) {
            // Future improvement: use a global event bus to exit play mode on ESC
          }
        };

        document.addEventListener('pointerlockchange', handlePointerLockChange);

        if (isPlayMode) {
            canvas.requestPointerLock();
        } else {
            if (document.pointerLockElement === canvas) {
                document.exitPointerLock();
            }
        }

        return () => {
          document.removeEventListener('pointerlockchange', handlePointerLockChange);
        }
    }, [isPlayMode, gl]);
    
    return null;
}

// Renders the correct UI overlay based on editor mode
const AppUI = () => {
    const { isPlayMode } = useEditor();
    return isPlayMode ? <GameUI /> : <EditorUI />;
}

function App() {
  const { isPlayMode, setSelectedObject } = useEditor();
  return (
    <div className="w-screen h-screen bg-black">
      <Canvas 
        shadows 
        camera={{ position: [10, 10, 15], fov: 60 }}
        onPointerMissed={() => !isPlayMode && setSelectedObject(null)}
      >
        <EngineSystems>
          <SceneContent />
        </EngineSystems>
        <UIController />
      </Canvas>
      <AppUI />
    </div>
  );
}

// We need to wrap the App in the providers that don't depend on the canvas
const Root = () => (
    <Engine>
        <App />
    </Engine>
);

// We need to export the Root component now
export { Root as default };
