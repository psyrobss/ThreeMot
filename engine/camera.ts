import * as THREE from 'three';
import { useFrame, useThree } from '@react-three/fiber';
import React, { useRef, useState, useMemo, useContext, createContext, useEffect } from 'react';
import type { InputManager } from './types';
import { useEngine } from './hooks';

// Interface defining the contract for any camera state
export interface CameraState {
  update: (
    delta: number,
    input: InputManager,
    camera: THREE.PerspectiveCamera,
    target: THREE.Object3D,
    scene: THREE.Scene,
  ) => void;
}

// API exposed by the CameraManager context
export interface CameraManagerApi {
  setTarget: (target: THREE.Object3D) => void;
  setState: (name: string, state: CameraState) => void;
  setActiveState: (name: string) => void;
}

const CameraContext = createContext<CameraManagerApi | null>(null);

// Custom hook to access camera controls
export const useCamera = () => {
    const context = useContext(CameraContext);
    if (!context) {
        throw new Error("useCamera must be used within a CameraManager");
    }
    return context;
}

// --- CAMERA STATES ---

export class ThirdPersonCamera implements CameraState {
  private idealLookAt: THREE.Vector3;
  private currentPosition: THREE.Vector3;
  private currentLookAt: THREE.Vector3;
  private spherical: THREE.Spherical;
  private raycaster = new THREE.Raycaster();
  
  constructor() {
    this.idealLookAt = new THREE.Vector3(0, 1.5, 0);
    this.currentPosition = new THREE.Vector3();
    this.currentLookAt = new THREE.Vector3();
    
    this.spherical = new THREE.Spherical();
    this.spherical.radius = 6;
    this.spherical.phi = Math.PI / 2.5;
    this.spherical.theta = 0;
  }

  update(delta: number, input: InputManager, camera: THREE.PerspectiveCamera, target: THREE.Object3D, scene: THREE.Scene) {
    const targetPosition = new THREE.Vector3();
    target.getWorldPosition(targetPosition);

    // Update spherical coords from mouse input
    if (document.pointerLockElement) {
        const mouseDelta = input.getMouseDelta();
        const mouseSensitivity = 0.005;
        this.spherical.theta -= mouseDelta.dx * mouseSensitivity;
        this.spherical.phi -= mouseDelta.dy * mouseSensitivity;
        this.spherical.phi = Math.max(0.2, Math.min(Math.PI - 0.2, this.spherical.phi)); // Clamp vertical angle
    }

    // Calculate ideal camera position based on spherical coordinates
    const idealOffset = new THREE.Vector3().setFromSpherical(this.spherical);
    const idealPosition = targetPosition.clone().add(idealOffset);

    // Collision detection
    const targetToIdeal = idealPosition.clone().sub(targetPosition);
    const distance = targetToIdeal.length();
    this.raycaster.set(targetPosition, targetToIdeal.normalize());
    this.raycaster.far = distance;
    const intersects = this.raycaster.intersectObjects(scene.children, true);

    let collisionDistance = distance;
    if (intersects.length > 0) {
        // Find the closest non-player intersection
        const closest = intersects.find(i => {
            let obj = i.object;
            while(obj.parent) {
                if(obj === target) return false;
                obj = obj.parent;
            }
            return true;
        })
        if(closest) {
            collisionDistance = closest.distance * 0.9; // Apply a small buffer
        }
    }
    
    const finalPosition = targetPosition.clone().add(targetToIdeal.normalize().multiplyScalar(collisionDistance));

    // Smoothly interpolate camera position and look-at point
    this.currentPosition.lerp(finalPosition, 15 * delta);
    this.currentLookAt.lerp(targetPosition.clone().add(this.idealLookAt), 15 * delta);

    camera.position.copy(this.currentPosition);
    camera.lookAt(this.currentLookAt);
  }
}

// --- CAMERA MANAGER COMPONENT ---

interface CameraManagerProps {
    children: React.ReactNode;
}

export const CameraManager: React.FC<CameraManagerProps> = ({ children }) => {
    const camera = useThree(state => state.camera as THREE.PerspectiveCamera);
    const scene = useThree(state => state.scene);
    const [target, setTarget] = useState<THREE.Object3D | null>(null);
    const states = useRef(new Map<string, CameraState>());
    const [activeState, setActiveState] = useState<CameraState | null>(null);
    const { input } = useEngine(); // Get the real input manager from the engine

    const api = useMemo<CameraManagerApi>(() => ({
        setTarget: (newTarget) => setTarget(newTarget),
        setState: (name, state) => states.current.set(name, state),
        setActiveState: (name) => {
            const state = states.current.get(name);
            if(state) setActiveState(() => state);
        }
    }), []);

    useFrame((_, delta) => {
        if (activeState && target) {
            activeState.update(delta, input, camera, target, scene);
        }
    });
    
    useEffect(() => {
        const thirdPerson = new ThirdPersonCamera();
        api.setState('thirdPerson', thirdPerson);
        api.setActiveState('thirdPerson');
    }, [api]);

    return React.createElement(CameraContext.Provider, { value: api }, children);
};