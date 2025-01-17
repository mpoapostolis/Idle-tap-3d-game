import { Canvas } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera } from '@react-three/drei';
import Monster from './Monster';
import Ground from './Ground';
import Helpers from './Helpers';

export default function Game3D() {
  return (
    <Canvas
      className="absolute inset-0 w-full h-full"
      shadows
      gl={{ antialias: true }}
      camera={{ position: [0, 8, 12], fov: 60 }}
    >
      {/* Scene Configuration */}
      <color attach="background" args={['#111827']} />
      <fog attach="fog" args={['#111827', 10, 50]} />

      {/* Camera Setup */}
      <PerspectiveCamera makeDefault position={[0, 8, 12]} fov={60} />
      
      {/* Enhanced Lighting Setup */}
      <ambientLight intensity={0.7} />
      <directionalLight 
        position={[10, 10, 5]} 
        intensity={1.5}
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-camera-far={50}
        shadow-camera-left={-10}
        shadow-camera-right={10}
        shadow-camera-top={10}
        shadow-camera-bottom={-10}
      />
      <pointLight 
        position={[0, 5, 0]} 
        intensity={1}
        color="#ff4444"
        distance={15}
        decay={2}
      />
      <hemisphereLight
        intensity={0.5}
        groundColor="#111827"
        color="#ffffff"
      />
      
      {/* Scene Content */}
      <group position={[0, 0, 0]}>
        <Monster />
      </group>
      
      <Ground />
      <Helpers />

      {/* Controls */}
      <OrbitControls
        enablePan={false}
        maxPolarAngle={Math.PI / 2 - 0.1}
        minDistance={8}
        maxDistance={16}
        target={[0, 2, 0]}
        enableDamping
        dampingFactor={0.05}
      />
    </Canvas>
  );
}