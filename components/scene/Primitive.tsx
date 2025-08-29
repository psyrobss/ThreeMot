import React from 'react';
import { RigidBody } from '@react-three/rapier';
import { Select } from '@react-three/postprocessing';
import type { PrimitiveType } from '../../engine/types';
import type { RigidBodyProps } from '@react-three/rapier';

// Define props for our new generic primitive component
// Omit 'children' as we are defining them internally. We no longer need to omit 'type' as we've renamed our prop.
// FIX: Renamed `shape` prop to `primitiveShape` to avoid a name collision with a prop in `RigidBodyProps`.
interface PrimitiveProps extends Omit<RigidBodyProps, 'children'> {
    primitiveShape: PrimitiveType;
    name: string;
    color?: string;
}

export const Primitive: React.FC<PrimitiveProps> = ({ primitiveShape, name, color, ...rigidBodyProps }) => {
    
    // Determine collider shape based on geometry for better physics
    const colliderType = primitiveShape === 'sphere' ? 'ball' : 'cuboid';
    
    return (
        // The root object is the RigidBody, which will be selected
        <RigidBody
            type="dynamic" // Primitives are dynamic by default
            colliders={colliderType}
            name={`${name}_Root`}
            {...rigidBodyProps} // Pass down position, rotation, etc.
        >
            <Select enabled>
                <mesh castShadow receiveShadow name={name}>
                    {primitiveShape === 'cube' && <boxGeometry />}
                    {primitiveShape === 'sphere' && <sphereGeometry />}
                    <meshStandardMaterial color={color || "#cccccc"} />
                </mesh>
            </Select>
        </RigidBody>
    );
}
