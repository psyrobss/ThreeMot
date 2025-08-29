import React, { useState, useEffect } from 'react';
import { RigidBody } from '@react-three/rapier';
import { Select } from '@react-three/postprocessing';
import { Interactable } from '../../engine/components';
import type { RigidBodyProps } from '@react-three/rapier';

// Combine standard RigidBody props with our custom ones
interface StaticBoxProps extends Omit<RigidBodyProps, 'children'> {
    name: string;
    color?: string;
}

export const StaticBox = ({ name, color: initialColor = "#fca311", ...props }: StaticBoxProps) => {
    const [color, setColor] = useState(initialColor);
    const [prompt, setPrompt] = useState("Change Color");

    // Sync state with prop changes from the inspector
    useEffect(() => {
        setColor(initialColor);
    }, [initialColor]);

    const handleInteract = () => {
        // This interaction logic is now independent of the initial color prop
        const newColor = color === "#fca311" ? "#9b5de5" : "#fca311";
        setColor(newColor);
        setPrompt(newColor === "#fca311" ? "Change Color" : "Change Color Back");
    };

    return (
        <Interactable onInteract={handleInteract} promptMessage={prompt}>
            <RigidBody 
                type="fixed" 
                colliders="cuboid" 
                name={`${name}_Root`}
                {...props} // Pass down position, rotation, scale, userData, etc.
            >
              <Select enabled>
                <mesh castShadow receiveShadow name={name}>
                    <boxGeometry />
                    <meshStandardMaterial color={color} />
                </mesh>
              </Select>
            </RigidBody>
        </Interactable>
    );
}
