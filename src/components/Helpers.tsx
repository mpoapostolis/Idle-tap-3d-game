import { useGameStore } from '../store/gameStore';
import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

export default function Helpers() {
  const helpers = useGameStore((state) => state.helpers);
  const helperRefs = useRef<THREE.Group[]>([]);

  useFrame((state, delta) => {
    helperRefs.current.forEach((group, index) => {
      if (group) {
        const radius = 3 + index * 0.5;
        const speed = 0.5 - index * 0.05;
        const time = state.clock.elapsedTime * speed;
        
        group.position.x = Math.cos(time) * radius;
        group.position.z = Math.sin(time) * radius;
        group.rotation.y += delta;
      }
    });
  });

  return (
    <group>
      {helpers.map((helper, index) => (
        helper.count > 0 && (
          <group
            key={helper.id}
            ref={(el) => {
              if (el) helperRefs.current[index] = el;
            }}
            position={[3 + index * 0.5, 0.5, 0]}
          >
            {Array.from({ length: Math.min(helper.count, 5) }).map((_, i) => (
              <mesh
                key={i}
                position={[
                  Math.cos((i / 5) * Math.PI * 2) * 0.3,
                  i * 0.1,
                  Math.sin((i / 5) * Math.PI * 2) * 0.3
                ]}
              >
                <sphereGeometry args={[0.2, 16, 16]} />
                <meshStandardMaterial
                  color={helper.color}
                  emissive={helper.color}
                  emissiveIntensity={0.5}
                />
              </mesh>
            ))}
          </group>
        )
      ))}
    </group>
  );
}