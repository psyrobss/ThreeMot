import React, { useRef } from 'react';
import { RigidBody } from '@react-three/rapier';
import type { RapierRigidBody } from '@react-three/rapier';
import { Select } from '@react-three/postprocessing';
import { Rotator } from '../../engine/components';

export const SpinningCube = () => {
  const rbRef = useRef<RapierRigidBody>(null);
  return (
      <RigidBody ref={rbRef} type="kinematicPosition" colliders="cuboid" position={[8, 1, 0]} name="SpinningCube_Root">
        <Select enabled>
            <mesh castShadow name="SpinningCube_Mesh">
              <boxGeometry args={[1, 1, 1]} />
              <meshStandardMaterial color="#e56b6f" />
            </mesh>
        </Select>
        <Rotator rigidBodyRef={rbRef} speed={0.5} />
      </RigidBody>
  );
};
