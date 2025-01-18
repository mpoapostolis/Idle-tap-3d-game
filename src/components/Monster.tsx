import {
  useRef,
  useState,
  useEffect,
  Suspense,
  useMemo,
  useCallback,
} from "react";
import { useFrame } from "@react-three/fiber";
import { Box, useGLTF } from "@react-three/drei";
import { useGameStore } from "../store/gameStore";
import * as THREE from "three";
import { useSpring, animated, config } from "@react-spring/three";
import { useSound } from "../hooks/use-sounds";

interface Model {
  uuid?: string;
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
  const [particles] = useState(() =>
    [...Array(24)].map((_, i) => ({
      speed: Math.random() * 0.3 + 0.2,
      angle: (i * Math.PI * 2) / 24 + Math.random() * 0.2,
      scale: Math.random() * 0.15 + 0.05,
      rotationSpeed: (Math.random() - 0.5) * 0.4,
      lifetime: Math.random() * 0.3 + 0.7,
      color: new THREE.Color(0xff3333).multiplyScalar(1 + Math.random() * 0.5),
    }))
  );

  useFrame((state, delta) => {
    if (particlesRef.current) {
      particlesRef.current.children.forEach((particle: THREE.Object3D, i) => {
        const data = particles[i];
        particle.position.x += Math.cos(data.angle) * data.speed * delta * 60;
        particle.position.y +=
          (Math.sin(data.angle) * data.speed + 0.02) * delta * 60;
        particle.position.z += (Math.random() - 0.5) * 0.01;
        particle.rotation.z += data.rotationSpeed * delta;
        particle.scale.multiplyScalar(Math.pow(0.92, delta * 60));
      });
    }
  });

  return (
    <group ref={particlesRef} position={position}>
      {particles.map((data, i) => (
        <mesh
          key={i}
          position={[0, 0, 0]}
          rotation={[0, 0, Math.random() * Math.PI]}
        >
          <planeGeometry args={[data.scale, data.scale]} />
          <meshBasicMaterial
            color={data.color}
            transparent
            opacity={0.9}
            blending={THREE.AdditiveBlending}
            side={THREE.DoubleSide}
            depthWrite={false}
          />
        </mesh>
      ))}
    </group>
  );
}

function DeathEffect({ position }: { position: THREE.Vector3 }) {
  const particlesRef = useRef<THREE.Group>(null);
  const [particles] = useState(() =>
    [...Array(32)].map((_, i) => ({
      speed: Math.random() * 0.4 + 0.3,
      angle: (i * Math.PI * 2) / 32 + Math.random() * 0.2,
      scale: Math.random() * 0.4 + 0.2,
      rotationSpeed: (Math.random() - 0.5) * 0.5,
      ascent: Math.random() * 0.2 + 0.1,
      color: new THREE.Color().setHSL(0.1 + Math.random() * 0.05, 0.8, 0.6),
    }))
  );

  useFrame((state, delta) => {
    if (particlesRef.current) {
      particlesRef.current.children.forEach((particle: THREE.Object3D, i) => {
        const data = particles[i];
        if (!data) return;
        particle.position.x += Math.cos(data.angle) * data.speed * delta * 60;
        particle.position.y +=
          (Math.sin(data.angle) * data.speed + data.ascent) * delta * 60;
        particle.position.z += (Math.random() - 0.5) * 0.02;
        particle.rotation.z += data.rotationSpeed * delta;
        particle.scale.multiplyScalar(Math.pow(0.95, delta * 60));
      });
    }
  });

  return (
    <group ref={particlesRef} position={position}>
      {particles.map((data, i) => (
        <mesh
          key={i}
          position={[0, 0, 0]}
          rotation={[0, 0, Math.random() * Math.PI]}
        >
          <planeGeometry args={[data.scale, data.scale]} />
          <meshBasicMaterial
            color={data.color}
            transparent
            opacity={0.9}
            blending={THREE.AdditiveBlending}
            side={THREE.DoubleSide}
            depthWrite={false}
          />
        </mesh>
      ))}

      {/* Shockwave effect */}
      <mesh rotation-x={-Math.PI / 2} position-y={0.1}>
        <ringGeometry args={[0, 3, 64]} />
        <meshBasicMaterial
          color="#ffaa00"
          transparent
          opacity={0.4}
          blending={THREE.AdditiveBlending}
          side={THREE.DoubleSide}
          depthWrite={false}
        />
      </mesh>
    </group>
  );
}

function MonsterModel({
  url,
  isBoss,
  hovered,
  onPointerOver,
  uuid,
  onPointerOut,
  onClick,
  currentMonsterHp,
}: {
  url: string;
  isBoss: boolean;
  hovered: boolean;
  uuid?: string;
  onPointerOver: () => void;
  onPointerOut: () => void;
  onClick: () => void;
  currentMonsterHp: number;
}) {
  const monsterRef = useRef<THREE.Group>(null);
  const { scene } = useGLTF(url);
  const [isHit, setIsHit] = useState(false);
  const rotationSpeed = useRef(0);
  const positionSpeed = useRef(0);
  const time = useRef(0);
  const bounceHeight = useRef(0.5); // Controls how high the monster bounces
  const bounceSpeed = useRef(2); // Controls how fast the monster bounces
  const [hitPosition, setHitPosition] = useState<THREE.Vector3>(
    new THREE.Vector3()
  );
  const [hitEffects, setHitEffects] = useState<{ id: string; time: number }[]>(
    []
  );

  useFrame((state, delta) => {
    if (!monsterRef.current) return;

    // Update the time
    time.current += delta;

    // Apply breathing animation (scale)
    const breatheScale = 2 + Math.sin(time.current * 2) * 0.03;
    monsterRef.current.scale.set(breatheScale, breatheScale, breatheScale);

    if (currentMonsterHp <= 0) {
      // Gradually increase the rotation and position speeds
      rotationSpeed.current += delta * 10;
      positionSpeed.current += delta * 4;

      // Apply the accumulated speeds
      monsterRef.current.rotation.y += rotationSpeed.current * delta * 5;
      monsterRef.current.position.y -= positionSpeed.current * delta * 5;
      return;
    }

    // Apply bouncing animation
    monsterRef.current.position.y =
      Math.sin(time.current * bounceSpeed.current) * bounceHeight.current;
  });

  const handleClick = useCallback(
    (event: THREE.Event) => {
      if (currentMonsterHp <= 0) return; // Prevent clicks while dying

      const intersect = event.intersections[0];
      if (intersect) {
        setHitPosition(intersect.point);
        setHitEffects((prev) => [
          ...prev,
          { id: `${Date.now()}-${Math.random()}`, time: Date.now() },
        ]);
        setIsHit(true);

        // Apply red tint
        scene.traverse((child) => {
          if (child instanceof THREE.Mesh && child.material) {
            const material = child.material as THREE.MeshStandardMaterial;
            material.emissive.setHex(0xff0000);
            material.emissiveIntensity = 1;
          }
        });

        // Reset color after 100ms
        setTimeout(() => {
          setIsHit(false);
          scene.traverse((child) => {
            if (child instanceof THREE.Mesh && child.material) {
              const material = child.material as THREE.MeshStandardMaterial;
              material.emissive.setHex(0x000000);
              material.emissiveIntensity = 0;
            }
          });
        }, 100);

        onClick();
      }
    },
    [onClick, currentMonsterHp, scene]
  );
  return currentMonsterHp < 0 ? null : (
    <group
      key={uuid}
      ref={monsterRef}
      onClick={handleClick}
      onPointerOver={onPointerOver}
      onPointerOut={onPointerOut}
    >
      <primitive object={scene} />
      {hitEffects.map(({ id, time }) => (
        <HitEffect key={id} position={hitPosition} />
      ))}
    </group>
  );
}

export default function Monster() {
  const [hovered, setHovered] = useState(false);
  const [models, setModels] = useState<Model[]>([]);
  const [currentModel, setCurrentModel] = useState<Model | null>(null);
  const { level, isBoss, damageMonster, clickDamage, currentMonsterHp } =
    useGameStore();
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
    const uuid = new THREE.Object3D().uuid;
    if (models.length > 0) {
      if (isBoss) {
        const bossModel = models.find((model) => model.isBoss);
        setCurrentModel({ uuid, ...bossModel } || models[0]);
      } else {
        const levelModel = models[Math.floor(Math.random() * models.length)];
        setCurrentModel({ uuid, ...levelModel } || models[0]);
      }
    }
  }, [level, isBoss, models]);

  if (!currentModel) {
    return null;
  }

  return (
    <group>
      <Suspense fallback={null}>
        <ambientLight />
        <MonsterModel
          uuid={currentModel?.uuid}
          key={currentModel?.uuid}
          url={currentModel?.glb}
          isBoss={isBoss}
          hovered={hovered}
          currentMonsterHp={currentMonsterHp}
          onPointerOver={() => setHovered(true)}
          onPointerOut={() => setHovered(false)}
          onClick={() => {
            playSound("hit");
            if (currentMonsterHp <= clickDamage) {
              playSound("loot");
            }
            damageMonster(clickDamage);
          }}
        />
      </Suspense>
    </group>
  );
}
