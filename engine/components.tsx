import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';
import { useScript } from './hooks';
import { usePlayerMovement, usePlayerInteraction } from './hooks';
import type { EntityProps, PlayerControllerProps, RotatorProps, InteractableProps, InteractableData } from './types';

// The base for any object in the game world. Essentially a configurable <group>.
export const Entity = React.forwardRef<THREE.Group, EntityProps>(
  ({ children, ...props }, ref) => {
    return (
      <group ref={ref} {...props}>
        {children}
      </group>
    );
  }
);
Entity.displayName = "Entity";


// A script component that rotates a kinematic RigidBody.
export const Rotator: React.FC<RotatorProps> = ({ rigidBodyRef, speed = 1 }) => {
  useScript((delta) => {
    if (!rigidBodyRef.current) return;
    
    const rb = rigidBodyRef.current;
    const time = performance.now() / 1000;
    const euler = new THREE.Euler(time * speed * 0.5, time * speed, 0);
    const quat = new THREE.Quaternion().setFromEuler(euler);
    rb.setNextKinematicRotation(quat);
  });

  return null; // This component provides logic, not visuals
};


// Player controller script component, now refactored to use custom hooks.
export const PlayerController: React.FC<PlayerControllerProps> = ({ rigidBodyRef, speed = 5, jumpForce = 8, interactionDistance = 5 }) => {
  // The component now cleanly delegates its logic to specialized hooks.
  usePlayerMovement({ rigidBodyRef, speed, jumpForce });
  usePlayerInteraction({ interactionDistance });

  return null; // This component provides logic, not visuals
};

// A component wrapper to make its children interactable
export const Interactable: React.FC<InteractableProps> = ({ children, onInteract, promptMessage = "Interact" }) => {
    const groupRef = useRef<THREE.Group>(null!);

    useEffect(() => {
        const group = groupRef.current;
        if(group) {
            group.userData.interactable = {
                onInteract,
                promptMessage
            } as InteractableData;
        }
    }, [onInteract, promptMessage]);

    return <group ref={groupRef}>{children}</group>;
};