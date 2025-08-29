import React, { useRef } from 'react';
import { RigidBody } from '@react-three/rapier';
import type { RapierRigidBody, RigidBodyProps } from '@react-three/rapier';
import { Select } from '@react-three/postprocessing';
import { Rotator } from '../../engine/components';

// Allow passing RigidBody props like position, name, userData
interface SpinningCubeProps extends Omit<RigidBodyProps, 'children'> {
  name: string;
  speed?: number; // Add speed as an optional prop
}

export const SpinningCube = ({ name, speed = 0.5, ...props }: SpinningCubeProps) => {
  const rbRef = useRef<RapierRigidBody>(null);
  return (
      <RigidBody 
        ref={rbRef} 
        type="kinematicPosition" 
        colliders="cuboid" 
        name={`${name}_Root`}
        {...props} // Spread all other props (position, rotation, etc.) to the RigidBody
      >
        <Select enabled>
            <mesh castShadow name={name}>
              <boxGeometry args={[1, 1, 1]} />
              <meshStandardMaterial color="#e56b6f" />
            </mesh>
        </Select>
        <Rotator rigidBodyRef={rbRef} speed={speed} />
      </RigidBody>
  );
};
