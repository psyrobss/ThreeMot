import React, { Suspense, useRef, useEffect } from 'react';
import * as THREE from 'three';
import { Canvas, useThree } from '@react-three/fiber';
import { Sky, OrbitControls, TransformControls } from '@react-three/drei';
import { Physics } from '@react-three/rapier';
import { Selection, EffectComposer, Outline } from '@react-three/postprocessing';

// Engine systems and components
import { Engine, EngineGameLoop } from './engine/Engine';
import { CameraManager } from './engine/camera';
import { useEditor } from './engine/editor';

// UI Components
import { GameUI } from './components/GameUI';
import { EditorUI } from './components/EditorUI';

// Scene Components
import { Floor } from './components/scene/Floor';
import { Wall } from './components/scene/Wall';
import { Player } from './components/scene/Player';
import { SpinningCube } from './components/scene/SpinningCube';
import { StaticBox } from './components/scene/StaticBox';

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

// Renders the 3D scene content and manages camera/player based on editor mode
const SceneContent = () => {
    const { isPlayMode, selectedObject, setSelectedObject, transformMode, incrementRevision } = useEditor();

    const handleSelect = (e: import('@react-three/fiber').ThreeEvent<MouseEvent>) => {
        if (isPlayMode) return;
        e.stopPropagation();

        let current: THREE.Object3D | null = e.object;
        let entityRoot: THREE.Object3D | null = null;
        
        // Traverse up the scene graph from the clicked object
        while (current) {
            if (current.name.endsWith('_Root')) {
                entityRoot = current; // Found the entity root
                break;
            }
            current = current.parent;
        }
        
        // Only select valid entity roots. If the user clicks on something
        // that isn't part of an entity (like the sky), nothing will be selected.
        setSelectedObject(entityRoot);
    }
    
    return (
        <Selection>
            <EffectComposer multisampling={8} autoClear={false}>
                {/* FIX: Changed visibleEdgeColor from string "white" to number 0xffffff to fix type error. */}
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
                    // This ensures the inspector updates in real-time while dragging the gizmo
                    onObjectChange={incrementRevision} 
                />
            )}

            {/* In Editor mode, enable free-look OrbitControls */}
            {/* The gizmo can interfere with OrbitControls, so we disable controls while transforming */}
            {!isPlayMode && <OrbitControls makeDefault />}

            <Physics gravity={[0, -20, 0]}>
                <Suspense fallback={null}>
                    {/* Wrap scene objects in a group to handle deselection */}
                    <group onClick={handleSelect}>
                        {/* Static world geometry */}
                        <Floor />
                        <SpinningCube/>
                        <StaticBox name="InteractBox_1" position={[-5, 0.5, 5]} />
                        <StaticBox name="InteractBox_2" position={[-5, 1.5, 5]} />
                        <StaticBox name="StaticBox_1" position={[0, 0.5, -8]} />
                        <Wall name="BackWall" position={[0, 2.5, -15]} args={[20, 5, 1]} />
                        <Wall name="LeftWall" position={[-10, 2.5, -5]} args={[1, 5, 20]} />
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
          // If pointer lock is lost while in play mode (e.g. user presses ESC), exit play mode
          if (document.pointerLockElement !== canvas && isPlayMode) {
            // This part is commented out as direct state change from here can be tricky.
            // A more robust solution would involve a global event bus.
            // For now, the user can press the Stop button.
            // setIsPlayMode(false);
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
        // In editor mode, onPointerMissed is used to deselect objects
        onPointerMissed={() => !isPlayMode && setSelectedObject(null)}
      >
        {/* EngineSystems now correctly lives inside the Canvas */}
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