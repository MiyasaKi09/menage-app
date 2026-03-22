'use client'

import { useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { ContactShadows } from '@react-three/drei'
import { EffectComposer, Noise, HueSaturation, Vignette } from '@react-three/postprocessing'
import { BlendFunction } from 'postprocessing'
import * as THREE from 'three'

function Wall({ position, rotation, size, color = '#d4be98' }: { position: [number, number, number]; rotation?: [number, number, number]; size: [number, number]; color?: string }) {
  return (
    <mesh position={position} rotation={rotation || [0, 0, 0]}>
      <planeGeometry args={size} />
      <meshStandardMaterial color={color} roughness={0.95} metalness={0} side={THREE.DoubleSide} />
    </mesh>
  )
}

function Floor() {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
      <planeGeometry args={[6, 6]} />
      <meshStandardMaterial color="#b89070" roughness={0.95} metalness={0} />
    </mesh>
  )
}

function Bed({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      <mesh position={[0, 0.25, 0]} castShadow>
        <boxGeometry args={[1.4, 0.5, 2]} />
        <meshStandardMaterial color="#8b6b4a" roughness={0.85} />
      </mesh>
      <mesh position={[0, 0.55, 0]} castShadow>
        <boxGeometry args={[1.3, 0.15, 1.9]} />
        <meshStandardMaterial color="#e8dcc0" roughness={0.9} />
      </mesh>
      <mesh position={[0, 0.7, -0.7]} castShadow>
        <boxGeometry args={[0.8, 0.12, 0.35]} />
        <meshStandardMaterial color="#f0e8d8" roughness={0.95} />
      </mesh>
      <mesh position={[0, 0.9, -0.95]} castShadow>
        <boxGeometry args={[1.4, 1, 0.08]} />
        <meshStandardMaterial color="#7a5c3a" roughness={0.85} />
      </mesh>
    </group>
  )
}

function Table({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      <mesh position={[0, 0.7, 0]} castShadow>
        <boxGeometry args={[1, 0.06, 0.6]} />
        <meshStandardMaterial color="#8b6b4a" roughness={0.85} />
      </mesh>
      {[[-0.4, 0.35, -0.22], [0.4, 0.35, -0.22], [-0.4, 0.35, 0.22], [0.4, 0.35, 0.22]].map((pos, i) => (
        <mesh key={i} position={pos as [number, number, number]} castShadow>
          <boxGeometry args={[0.06, 0.7, 0.06]} />
          <meshStandardMaterial color="#7a5c3a" roughness={0.85} />
        </mesh>
      ))}
      <mesh position={[0.2, 0.82, 0]} castShadow>
        <cylinderGeometry args={[0.03, 0.04, 0.15, 8]} />
        <meshStandardMaterial color="#e8d8b0" roughness={0.8} />
      </mesh>
      <mesh position={[0.2, 0.95, 0]}>
        <sphereGeometry args={[0.03, 8, 6]} />
        <meshBasicMaterial color="#ffcc55" />
      </mesh>
    </group>
  )
}

function Chest({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      <mesh position={[0, 0.2, 0]} castShadow>
        <boxGeometry args={[0.7, 0.4, 0.45]} />
        <meshStandardMaterial color="#6b4e2e" roughness={0.9} />
      </mesh>
      <mesh position={[0, 0.42, 0]} castShadow>
        <boxGeometry args={[0.72, 0.06, 0.47]} />
        <meshStandardMaterial color="#5a3e20" roughness={0.9} />
      </mesh>
      <mesh position={[0, 0.25, 0.23]} castShadow>
        <boxGeometry args={[0.08, 0.08, 0.02]} />
        <meshStandardMaterial color="#c8a020" roughness={0.4} metalness={0.5} />
      </mesh>
    </group>
  )
}

function Bookshelf({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      <mesh position={[0, 0.9, 0]} castShadow>
        <boxGeometry args={[0.8, 1.8, 0.3]} />
        <meshStandardMaterial color="#7a5c3a" roughness={0.9} />
      </mesh>
      {[0.4, 0.8, 1.2].map((y, row) => (
        <group key={row} position={[0, y, 0.05]}>
          {[-0.2, -0.05, 0.1, 0.22].map((bx, j) => (
            <mesh key={j} position={[bx, 0, 0]} castShadow>
              <boxGeometry args={[0.1, 0.25, 0.18]} />
              <meshStandardMaterial
                color={['#8b3030', '#2a5a3a', '#3a4a7a', '#7a5a2a', '#5a2a5a'][j % 5]}
                roughness={0.85}
              />
            </mesh>
          ))}
        </group>
      ))}
    </group>
  )
}

// Gentle candle flicker
function CandleLight() {
  const ref = useRef<THREE.PointLight>(null)
  useFrame(({ clock }) => {
    if (ref.current) {
      ref.current.intensity = 1.5 + Math.sin(clock.elapsedTime * 3) * 0.3 + Math.sin(clock.elapsedTime * 7) * 0.1
    }
  })
  return <pointLight ref={ref} position={[1.7, 1.2, -2]} color="#ffcc66" intensity={1.5} distance={6} decay={2} />
}

// Soft watercolor post-processing (no DotScreen — it was causing the black screen)
function WatercolorFilter() {
  return (
    <EffectComposer>
      <HueSaturation saturation={-0.1} hue={0.03} />
      <Noise opacity={0.06} blendFunction={BlendFunction.SOFT_LIGHT} />
      <Vignette offset={0.25} darkness={0.4} />
    </EffectComposer>
  )
}

// Isometric camera angle — fixed, no controls
const ISO_DISTANCE = 8
const ISO_ANGLE = Math.PI / 6 // 30 degrees
const cameraPosition: [number, number, number] = [
  ISO_DISTANCE * Math.cos(Math.PI / 4) * Math.cos(ISO_ANGLE),
  ISO_DISTANCE * Math.sin(ISO_ANGLE) + 2,
  ISO_DISTANCE * Math.sin(Math.PI / 4) * Math.cos(ISO_ANGLE),
]

export function MedievalRoom() {
  return (
    <div className="relative aspect-[4/3] max-w-md mx-auto rounded-2xl overflow-hidden border border-cream/[0.08]">
      <Canvas
        shadows
        orthographic
        camera={{
          position: cameraPosition,
          zoom: 80,
          near: 0.1,
          far: 100,
        }}
        gl={{ antialias: true }}
        style={{ background: 'linear-gradient(180deg, #e8dcc4 0%, #d8c8a8 100%)' }}
        onCreated={({ camera }) => {
          camera.lookAt(0, 0.5, 0)
        }}
      >
        {/* Strong ambient light — no more black */}
        <ambientLight intensity={1.2} color="#fff5e6" />
        <directionalLight position={[5, 8, 4]} intensity={1.0} color="#fff8ee" castShadow shadow-mapSize={1024} />
        <directionalLight position={[-3, 4, -2]} intensity={0.3} color="#e8d8c0" />
        <CandleLight />

        {/* Room structure */}
        <Floor />
        <Wall position={[0, 1.5, -3]} size={[6, 3]} />
        <Wall position={[-3, 1.5, 0]} rotation={[0, Math.PI / 2, 0]} size={[6, 3]} color="#cbb890" />

        {/* Furniture */}
        <Bed position={[-1.5, 0, -1.8]} />
        <Table position={[1.5, 0, -2]} />
        <Chest position={[1.8, 0, 0.5]} />
        <Bookshelf position={[-2.6, 0, 0.5]} />

        <ContactShadows position={[0, 0.01, 0]} opacity={0.25} scale={8} blur={2.5} far={4} />

        {/* Watercolor filter */}
        <WatercolorFilter />
      </Canvas>

      {/* Room state overlay */}
      <div className="absolute top-3 right-3 px-2.5 py-1 rounded-lg bg-green/[0.15] border border-green/20 backdrop-blur-sm">
        <span className="font-medieval text-[10px] text-green/60">Propre</span>
      </div>
    </div>
  )
}
