import React, { useState } from 'react';
import { RigidBody } from '@react-three/rapier';
import { Select } from '@react-three/postprocessing';
import { Interactable } from '../../engine/components';

export const StaticBox = (props: { name: string, position: [number, number, number] }) => {
    const [color, setColor] = useState("#fca311");
    const [prompt, setPrompt] = useState("Change Color");

    const handleInteract = () => {
        const newColor = color === "#fca311" ? "#9b5de5" : "#fca311";
        setColor(newColor);
        setPrompt(newColor === "#fca311" ? "Change Color Back" : "Change Color");
    };

    return (
        <Interactable onInteract={handleInteract} promptMessage={prompt}>
            <RigidBody type="fixed" colliders="cuboid" position={props.position} name={`${props.name}_Root`}>
              <Select enabled>
                <mesh castShadow receiveShadow name={props.name}>
                    <boxGeometry />
                    <meshStandardMaterial color={color} />
                </mesh>
              </Select>
            </RigidBody>
        </Interactable>
    );
}
