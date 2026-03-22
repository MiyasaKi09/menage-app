'use client'

import { useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls, ContactShadows } from '@react-three/drei'
import { EffectComposer, Noise, HueSaturation, Vignette, DotScreen } from '@react-three/postprocessing'
import { BlendFunction } from 'postprocessing'
import * as THREE from 'three'

// Simple wooden wall panel
function Wall({ position, rotation, size }: { position: [number, number, number]; rotation?: [number, number, number]; size: [number, number] }) {
  return (
    <mesh position={position} rotation={rotation || [0, 0, 0]}>
      <planeGeometry args={size} />
      <meshStandardMaterial color="#c4a882" roughness={0.9} metalness={0} side={THREE.DoubleSide} />
    </mesh>
  )
}

// Wooden floor
function Floor() {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
      <planeGeometry args={[6, 6]} />
      <meshStandardMaterial color="#a07850" roughness={0.95} metalness={0} />
    </mesh>
  )
}

// Simple bed
function Bed({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      {/* Frame */}
      <mesh position={[0, 0.25, 0]} castShadow>
        <boxGeometry args={[1.4, 0.5, 2]} />
        <meshStandardMaterial color="#8b6b4a" roughness={0.85} />
      </mesh>
      {/* Mattress */}
      <mesh position={[0, 0.55, 0]} castShadow>
        <boxGeometry args={[1.3, 0.15, 1.9]} />
        <meshStandardMaterial color="#d4c4a8" roughness={0.9} />
      </mesh>
      {/* Pillow */}
      <mesh position={[0, 0.7, -0.7]} castShadow>
        <boxGeometry args={[0.8, 0.12, 0.35]} />
        <meshStandardMaterial color="#e8dcc8" roughness={0.95} />
      </mesh>
      {/* Headboard */}
      <mesh position={[0, 0.9, -0.95]} castShadow>
        <boxGeometry args={[1.4, 1, 0.08]} />
        <meshStandardMaterial color="#7a5c3a" roughness={0.85} />
      </mesh>
    </group>
  )
}

// Simple table
function Table({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      {/* Top */}
      <mesh position={[0, 0.7, 0]} castShadow>
        <boxGeometry args={[1, 0.06, 0.6]} />
        <meshStandardMaterial color="#8b6b4a" roughness={0.85} />
      </mesh>
      {/* Legs */}
      {[[-0.4, 0.35, -0.22], [0.4, 0.35, -0.22], [-0.4, 0.35, 0.22], [0.4, 0.35, 0.22]].map((pos, i) => (
        <mesh key={i} position={pos as [number, number, number]} castShadow>
          <boxGeometry args={[0.06, 0.7, 0.06]} />
          <meshStandardMaterial color="#7a5c3a" roughness={0.85} />
        </mesh>
      ))}
      {/* Candle on table */}
      <mesh position={[0.2, 0.82, 0]} castShadow>
        <cylinderGeometry args={[0.03, 0.04, 0.15, 8]} />
        <meshStandardMaterial color="#e8d8b0" roughness={0.8} />
      </mesh>
      {/* Flame */}
      <mesh position={[0.2, 0.95, 0]}>
        <sphereGeometry args={[0.03, 8, 6]} />
        <meshBasicMaterial color="#ffaa33" />
      </mesh>
    </group>
  )
}

// Chest/coffre
function Chest({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      <mesh position={[0, 0.2, 0]} castShadow>
        <boxGeometry args={[0.7, 0.4, 0.45]} />
        <meshStandardMaterial color="#6b4e2e" roughness={0.9} />
      </mesh>
      {/* Lid */}
      <mesh position={[0, 0.42, 0]} castShadow>
        <boxGeometry args={[0.72, 0.06, 0.47]} />
        <meshStandardMaterial color="#5a3e20" roughness={0.9} />
      </mesh>
      {/* Lock */}
      <mesh position={[0, 0.25, 0.23]} castShadow>
        <boxGeometry args={[0.08, 0.08, 0.02]} />
        <meshStandardMaterial color="#b8960c" roughness={0.4} metalness={0.6} />
      </mesh>
    </group>
  )
}

// Bookshelf
function Bookshelf({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      {/* Frame */}
      <mesh position={[0, 0.9, 0]} castShadow>
        <boxGeometry args={[0.8, 1.8, 0.3]} />
        <meshStandardMaterial color="#7a5c3a" roughness={0.9} />
      </mesh>
      {/* Books (colored blocks on shelves) */}
      {[0.4, 0.8, 1.2].map((y, row) => (
        <group key={row} position={[0, y, 0.05]}>
          {[-0.2, -0.05, 0.1, 0.22].map((bx, j) => (
            <mesh key={j} position={[bx, 0, 0]} castShadow>
              <boxGeometry args={[0.1, 0.25, 0.18]} />
              <meshStandardMaterial
                color={['#8b2020', '#1a4a2a', '#2a3a6a', '#6a4a1a', '#4a1a4a'][j % 5]}
                roughness={0.85}
              />
            </mesh>
          ))}
        </group>
      ))}
    </group>
  )
}

// Gentle floating animation for ambient feel
function FloatingLight() {
  const ref = useRef<THREE.PointLight>(null)
  useFrame(({ clock }) => {
    if (ref.current) {
      ref.current.position.y = 2.5 + Math.sin(clock.elapsedTime * 0.5) * 0.1
      ref.current.intensity = 0.8 + Math.sin(clock.elapsedTime * 2) * 0.1
    }
  })
  return <pointLight ref={ref} position={[0.5, 2.5, 0.5]} color="#ffcc66" intensity={0.8} distance={8} />
}

// Storybook/watercolor post-processing
function WatercolorFilter() {
  return (
    <EffectComposer>
      <HueSaturation saturation={-0.15} hue={0.05} />
      <Noise opacity={0.08} blendFunction={BlendFunction.SOFT_LIGHT} />
      <DotScreen scale={1.5} angle={0.5} blendFunction={BlendFunction.SOFT_LIGHT} />
      <Vignette offset={0.3} darkness={0.6} />
    </EffectComposer>
  )
}

export function MedievalRoom() {
  return (
    <div className="relative aspect-square max-w-sm mx-auto rounded-2xl overflow-hidden border border-cream/[0.08]">
      <Canvas
        shadows
        camera={{ position: [4, 3.5, 4], fov: 45 }}
        gl={{ antialias: true, alpha: true }}
        style={{ background: 'linear-gradient(180deg, #d4c4a0 0%, #c4b48a 100%)' }}
      >
        {/* Lighting */}
        <ambientLight intensity={0.4} color="#ffe8cc" />
        <directionalLight position={[3, 5, 2]} intensity={0.6} color="#fff5e0" castShadow shadow-mapSize={512} />
        <FloatingLight />

        {/* Room */}
        <Floor />
        <Wall position={[0, 1.5, -3]} size={[6, 3]} />
        <Wall position={[-3, 1.5, 0]} rotation={[0, Math.PI / 2, 0]} size={[6, 3]} />

        {/* Furniture */}
        <Bed position={[-1.5, 0, -1.8]} />
        <Table position={[1.5, 0, -2]} />
        <Chest position={[1.8, 0, 0.5]} />
        <Bookshelf position={[-2.6, 0, 0.5]} />

        {/* Contact shadows on floor */}
        <ContactShadows position={[0, 0.01, 0]} opacity={0.3} scale={8} blur={2} far={4} />

        {/* Camera controls */}
        <OrbitControls
          enableZoom={false}
          enablePan={false}
          minPolarAngle={Math.PI / 6}
          maxPolarAngle={Math.PI / 2.5}
          minAzimuthAngle={-Math.PI / 4}
          maxAzimuthAngle={Math.PI / 4}
          target={[0, 0.8, 0]}
        />

        {/* Storybook filter */}
        <WatercolorFilter />
      </Canvas>

      {/* Room state overlay */}
      <div className="absolute top-3 right-3 px-2.5 py-1 rounded-lg bg-green/[0.15] border border-green/20 backdrop-blur-sm">
        <span className="font-medieval text-[10px] text-green/60">Propre</span>
      </div>
    </div>
  )
}
