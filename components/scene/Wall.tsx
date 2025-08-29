import React from 'react';
import { RigidBody } from '@react-three/rapier';

export const Wall = (props: { name: string, position: [number, number, number], args: [number, number, number]}) => (
    <RigidBody type="fixed" colliders="cuboid" position={props.position}>
        <mesh castShadow receiveShadow name={`${props.name}_Root`}>
            <boxGeometry args={props.args} />
            <meshStandardMaterial color="#8a817c" />
        </mesh>
    </RigidBody>
);
