import React from 'react';
import { RigidBody } from '@react-three/rapier';

export const Floor = () => (
  <RigidBody type="fixed" colliders="cuboid" friction={1}>
    <mesh receiveShadow position={[0, -0.5, 0]} name="Floor_Root">
      <boxGeometry args={[100, 1, 100]} />
      <meshStandardMaterial color="#3a5a40" />
    </mesh>
  </RigidBody>
);
