import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useGameStore } from '../store/gameStore';

export default function Ground() {
  const groundRef = useRef<THREE.Mesh>(null);
  const level = useGameStore((state) => state.level);

  useFrame((state) => {
    if (groundRef.current) {
      const material = groundRef.current.material as THREE.MeshStandardMaterial;
      const hue = ((level - 1) % 10) / 10; // Changes color every 10 levels
      const lightness = 0.3 + Math.sin(state.clock.elapsedTime) * 0.1;
      material.color.setHSL(hue, 0.6, lightness);
    }
  });

  return (
    <mesh ref={groundRef} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
      <planeGeometry args={[50, 50, 32, 32]} />
      <meshStandardMaterial
        color="#444444"
        metalness={0.5}
        roughness={0.5}
        wireframe={level % 5 === 0} // Changes to wireframe every 5 levels
      />
    </mesh>
  );
}