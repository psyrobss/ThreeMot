import { useContext, useEffect, useCallback, useRef } from 'react';
import * as THREE from 'three';
import { useFrame, useThree } from '@react-three/fiber';
import { EngineContext } from './core';
import { useInteraction } from './interaction';
import type { InputManager, PlayerMovementProps, PlayerInteractionProps, InteractableData } from './types';

// Hook to easily access the engine's context from any component
export const useEngine = () => {
  const context = useContext(EngineContext);
  if (!context) {
    throw new Error('useEngine must be used within an Engine provider');
  }
  return context;
};

// Hook to subscribe a component's logic to the main game loop
export const useScript = (onUpdate: (delta: number) => void, priority: number = 0) => {
  const { registerScript, unregisterScript } = useEngine();

  // The callback is memoized to prevent re-registrations on every render
  const memoizedOnUpdate = useCallback(onUpdate, [onUpdate]);

  useEffect(() => {
    registerScript(memoizedOnUpdate, priority);
    return () => {
      unregisterScript(memoizedOnUpdate);
    };
  }, [memoizedOnUpdate, priority, registerScript, unregisterScript]);
};

// Hook to manage and access user input state
export const useInputManager = (): InputManager => {
    const keys = useRef(new Set<string>());
    const mouseDelta = useRef({ dx: 0, dy: 0 });

    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => keys.current.add(event.code);
        const handleKeyUp = (event: KeyboardEvent) => keys.current.delete(event.code);
        const handleMouseMove = (event: MouseEvent) => {
            mouseDelta.current.dx += event.movementX;
            mouseDelta.current.dy += event.movementY;
        };

        window.addEventListener('keydown', handleKeyDown);
        window.addEventListener('keyup', handleKeyUp);
        document.addEventListener('mousemove', handleMouseMove);

        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            window.removeEventListener('keyup', handleKeyUp);
            document.removeEventListener('mousemove', handleMouseMove);
        };
    }, []);

    const getKey = useCallback((key: string): boolean => keys.current.has(key), []);

    const getAxis = useCallback((negativeKey: string, positiveKey: string): number => {
        let axis = 0;
        if (getKey(negativeKey)) axis -= 1;
        if (getKey(positiveKey)) axis += 1;
        return axis;
    }, [getKey]);

    const getMouseDelta = useCallback(() => {
        const delta = { ...mouseDelta.current };
        mouseDelta.current.dx = 0;
        mouseDelta.current.dy = 0;
        return delta;
    }, []);


    return { getKey, getAxis, getMouseDelta };
};


// --- Player Controller Hooks ---

/**
 * Manages player movement, jumping, and rotation based on user input.
 */
export const usePlayerMovement = ({ rigidBodyRef, speed = 5, jumpForce = 8 }: PlayerMovementProps) => {
    const { input } = useEngine();
    const { camera } = useThree();
    const isOnGround = useRef(true);
    const velocity = useRef(new THREE.Vector3());

    useFrame((_, delta) => {
        if (!rigidBodyRef.current) return;
        
        const rb = rigidBodyRef.current;
        const currentVelocity = rb.linvel();
        
        // Simple ground check
        isOnGround.current = currentVelocity.y > -0.1 && currentVelocity.y < 0.1;

        // Movement based on camera direction
        const forward = new THREE.Vector3(0, 0, input.getAxis('KeyW', 'KeyS'));
        const side = new THREE.Vector3(input.getAxis('KeyA', 'KeyD'), 0, 0);
        let direction = new THREE.Vector3().subVectors(forward, side).normalize();

        const cameraDirection = new THREE.Vector3();
        camera.getWorldDirection(cameraDirection);
        const angle = Math.atan2(cameraDirection.x, cameraDirection.z);
        direction.applyAxisAngle(new THREE.Vector3(0, 1, 0), angle);

        velocity.current.x = direction.x * speed;
        velocity.current.z = direction.z * speed;
        
        rb.setLinvel({ x: velocity.current.x, y: currentVelocity.y, z: velocity.current.z }, true);

        // Jump
        if (input.getKey('Space') && isOnGround.current) {
            rb.applyImpulse({ x: 0, y: jumpForce, z: 0 }, true);
        }
        
        // Rotation to face movement direction
        if (direction.lengthSq() > 0.1) {
            const targetAngle = Math.atan2(direction.x, direction.z);
            const currentRotation = rb.rotation();
            const targetRotation = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), targetAngle);
            
            const interpolated = new THREE.Quaternion().slerpQuaternions(
                new THREE.Quaternion(currentRotation.x, currentRotation.y, currentRotation.z, currentRotation.w),
                targetRotation,
                delta * 15
            );
            rb.setRotation(interpolated, true);
        }
    });
};

/**
 * Manages player interaction with objects in the world via raycasting.
 */
export const usePlayerInteraction = ({ interactionDistance = 5 }: PlayerInteractionProps) => {
    const { input } = useEngine();
    const { camera, scene } = useThree();
    const { setActiveInteractable } = useInteraction();
    
    const raycaster = useRef(new THREE.Raycaster());
    const interactionCooldown = useRef(0);
    const screenCenter = new THREE.Vector2(0, 0); // Reusable Vector2 for efficiency

    // Configure raycaster's max distance
    useEffect(() => {
        raycaster.current.far = interactionDistance;
    }, [interactionDistance]);

    useFrame((_, delta) => {
        interactionCooldown.current -= delta;
        raycaster.current.setFromCamera(screenCenter, camera); // Cast from center of the screen
        const intersects = raycaster.current.intersectObjects(scene.children, true);
        
        let foundInteractable = false;
        for(const intersect of intersects) {
            let obj = intersect.object;
            // Traverse up the hierarchy to find the object with interactable data
            while(obj.parent && !obj.userData.interactable) {
                obj = obj.parent;
            }

            if(obj.userData.interactable) {
                const data = obj.userData.interactable as InteractableData;
                setActiveInteractable({ id: obj.uuid, data });
                
                // Handle interaction key press
                if(input.getKey('KeyE') && interactionCooldown.current <= 0) {
                    data.onInteract();
                    interactionCooldown.current = 0.5; // 0.5s cooldown to prevent spam
                }
                foundInteractable = true;
                break; // Stop after finding the first interactable
            }
        }
        
        if(!foundInteractable) {
            setActiveInteractable(null); // Clear active interactable if nothing is hit
        }
    });
};