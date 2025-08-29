import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';
import { RigidBody, CapsuleCollider } from '@react-three/rapier';
import type { RapierRigidBody } from '@react-three/rapier';
import { useCamera } from '../../engine/camera.tsx';
import { PlayerController } from '../../engine/components';

export const Player = () => {
  const playerRbRef = useRef<RapierRigidBody>(null);
  const groupRef = useRef<THREE.Group>(null);
  const camera = useCamera();

  useEffect(() => {
    if(groupRef.current) {
        camera.setTarget(groupRef.current);
    }
  }, [camera]);

  return (
    <group ref={groupRef} name="Player_Root">
      <RigidBody ref={playerRbRef} mass={1} position={[0, 1, 0]} lockRotations enabledRotations={[false, true, false]}>
        <mesh castShadow>
          <capsuleGeometry args={[0.4, 1.2]} />
          <meshStandardMaterial color="#4d908e" />
        </mesh>
        <CapsuleCollider args={[0.6, 0.4]} />
      </RigidBody>
      <PlayerController rigidBodyRef={playerRbRef} speed={6} jumpForce={7}/>
    </group>
  );
};