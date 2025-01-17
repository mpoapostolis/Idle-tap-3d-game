import { useRef, useState, useEffect, Suspense } from "react";
import { useFrame } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";
import { useGameStore } from "../store/gameStore";
import * as THREE from "three";
import { useSpring, animated } from "@react-spring/three";
import { useSound } from "../hooks/use-sounds";

interface Model {
  name: string;
  glb: string;
  levelRange?: [number, number];
  isBoss?: boolean;
}

interface ModelsData {
  models: Model[];
}

function HitEffect({ position }: { position: THREE.Vector3 }) {
  const particlesRef = useRef<THREE.Group>(null);

  useFrame((state, delta) => {
    if (particlesRef.current) {
      particlesRef.current.children.forEach((particle, i) => {
        const speed = 0.1;
        particle.position.x += Math.cos(i * Math.PI * 0.25) * speed;
        particle.position.y += Math.sin(i * Math.PI * 0.25) * speed;
        particle.scale.multiplyScalar(0.9);
      });
    }
  });

  return (
    <group ref={particlesRef} position={position}>
      {[...Array(12)].map((_, i) => (
        <mesh key={i} position={[0, 0, 0]}>
          <sphereGeometry args={[0.1, 8, 8]} />
          <meshStandardMaterial
            color="#ff4444"
            emissive="#ff0000"
            emissiveIntensity={2}
            transparent
            opacity={0.8}
          />
        </mesh>
      ))}
    </group>
  );
}

function MonsterModel({
  url,
  isBoss,
  hovered,
  onPointerOver,
  onPointerOut,
  onClick,
}: {
  url: string;
  isBoss: boolean;
  hovered: boolean;
  onPointerOver: () => void;
  onPointerOut: () => void;
  onClick: () => void;
}) {
  const monsterRef = useRef<THREE.Group>(null);
  const { scene } = useGLTF(url);
  const [isHit, setIsHit] = useState(false);
  const [hitPosition, setHitPosition] = useState<THREE.Vector3>(
    new THREE.Vector3()
  );
  const [hitEffects, setHitEffects] = useState<number[]>([]);
  const [originalMaterials, setOriginalMaterials] = useState<
    Map<THREE.Material, THREE.Color>
  >(new Map());

  // Store original materials on mount
  useEffect(() => {
    const materials = new Map<THREE.Material, THREE.Color>();
    scene.traverse((child) => {
      if (
        child instanceof THREE.Mesh &&
        child.material instanceof THREE.MeshStandardMaterial
      ) {
        materials.set(child.material, child.material.color.clone());
      }
    });
    setOriginalMaterials(materials);
  }, [scene]);

  // Animations
  const { scale } = useSpring({
    scale: isHit ? 0.85 : hovered ? 1.1 : 1,
    config: {
      tension: 300,
      friction: 10,
    },
  });

  useEffect(() => {
    if (monsterRef.current) {
      // Normalize scale
      const box = new THREE.Box3().setFromObject(monsterRef.current);
      const size = box.getSize(new THREE.Vector3());
      const maxDim = Math.max(size.x, size.y, size.z);
      const scale = 2 / maxDim;
      monsterRef.current.scale.setScalar(scale);

      // Set up materials
      monsterRef.current.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          child.castShadow = true;
          child.receiveShadow = true;
          if (child.material instanceof THREE.MeshStandardMaterial) {
            child.material = child.material.clone();
            child.material.roughness = 0.7;
            child.material.metalness = 0.3;
          }
        }
      });
    }
  }, []);

  useFrame((state, delta) => {
    if (!monsterRef.current) return;

    const time = state.clock.elapsedTime;

    // Complex animation combining multiple movements
    const baseY = isBoss ? 3 : 2;
    const floatAmplitude = isBoss ? 0.4 : 0.2;
    const floatSpeed = isBoss ? 2 : 1;

    // Floating motion
    monsterRef.current.position.y =
      baseY + Math.sin(time * floatSpeed) * floatAmplitude;

    // Circular motion
    const circleRadius = isBoss ? 0.3 : 0.15;
    monsterRef.current.position.x = Math.cos(time * 0.5) * circleRadius;
    monsterRef.current.position.z = Math.sin(time * 0.5) * circleRadius;

    // Continuous rotation + wobble
    monsterRef.current.rotation.y += delta * (isBoss ? 1 : 0.5);
    monsterRef.current.rotation.x = Math.sin(time * 2) * 0.1;

    // Boss-specific effects
    if (isBoss) {
      monsterRef.current.traverse((child) => {
        if (
          child instanceof THREE.Mesh &&
          child.material instanceof THREE.MeshStandardMaterial
        ) {
          if (!isHit) {
            child.material.emissiveIntensity = 0.5 + Math.sin(time * 4) * 0.3;
            child.material.emissive.setHSL((time * 0.1) % 1, 1, 0.5);
          }
        }
      });
    }
  });

  const handleClick = (event: THREE.Event) => {
    event.stopPropagation();
    setIsHit(true);

    // Store hit position for particle effect
    if (event.point) {
      setHitPosition(event.point);
      setHitEffects((prev) => [...prev, Date.now()]);
      // Clean up old effects
      setTimeout(() => {
        setHitEffects((prev) => prev.filter((time) => Date.now() - time < 500));
      }, 500);
    }

    // Flash red
    if (monsterRef.current) {
      monsterRef.current.traverse((child) => {
        if (
          child instanceof THREE.Mesh &&
          child.material instanceof THREE.MeshStandardMaterial
        ) {
          child.material.color.set("#ff0000");
          child.material.emissive.set("#ff0000");
          child.material.emissiveIntensity = 1;
        }
      });
    }

    // Reset to original colors
    setTimeout(() => {
      setIsHit(false);
      if (monsterRef.current) {
        monsterRef.current.traverse((child) => {
          if (
            child instanceof THREE.Mesh &&
            child.material instanceof THREE.MeshStandardMaterial
          ) {
            const originalColor = originalMaterials.get(child.material);
            if (originalColor) {
              child.material.color.copy(originalColor);
              child.material.emissive.set("#000000");
              child.material.emissiveIntensity = isBoss ? 0.5 : 0;
            }
          }
        });
      }
    }, 100);

    onClick();
  };

  return (
    <animated.group
      ref={monsterRef}
      onClick={handleClick}
      onPointerOver={onPointerOver}
      onPointerOut={onPointerOut}
      scale={scale}
    >
      <primitive object={scene.clone()} />

      {/* Hit Effects */}
      {hitEffects.map((time, index) => (
        <HitEffect key={time} position={hitPosition} />
      ))}

      {/* Impact Ring */}
      {isHit && (
        <mesh rotation-x={-Math.PI / 2} position-y={0.1}>
          <ringGeometry args={[0, 1, 32]} />
          <meshBasicMaterial
            color="#ff0000"
            transparent
            opacity={0.5}
            side={THREE.DoubleSide}
          />
        </mesh>
      )}
    </animated.group>
  );
}

export default function Monster() {
  const [hovered, setHovered] = useState(false);
  const [models, setModels] = useState<Model[]>([]);
  const [currentModel, setCurrentModel] = useState<Model | null>(null);

  const { level, isBoss, damageMonster, clickDamage } = useGameStore();
  const { playSound } = useSound();

  useEffect(() => {
    fetch("/models.json")
      .then((res) => res.json())
      .then((data: ModelsData) => {
        setModels(data.models);
      })
      .catch((error) => {
        console.error("Error loading models:", error);
      });
  }, []);

  useEffect(() => {
    if (models.length > 0) {
      if (isBoss) {
        const bossModel = models.find((model) => model.isBoss);
        setCurrentModel(bossModel || models[0]);
      } else {
        const levelModel = models.find(
          (model) =>
            model.levelRange &&
            level >= model.levelRange[0] &&
            level <= model.levelRange[1]
        );
        setCurrentModel(levelModel || models[0]);
      }
    }
  }, [level, isBoss, models]);

  if (!currentModel) {
    return null;
  }

  return (
    <group>
      <Suspense fallback={null}>
        <MonsterModel
          url={currentModel.glb}
          isBoss={isBoss}
          hovered={hovered}
          onPointerOver={() => setHovered(true)}
          onPointerOut={() => setHovered(false)}
          onClick={() => {
            playSound("hit");
            damageMonster(clickDamage);
          }}
        />
      </Suspense>
    </group>
  );
}
