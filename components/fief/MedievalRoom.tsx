'use client'

import { useRef, useMemo } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { ContactShadows } from '@react-three/drei'
import { EffectComposer, Noise, HueSaturation, Vignette } from '@react-three/postprocessing'
import { BlendFunction } from 'postprocessing'
import * as THREE from 'three'

// Gothic arch window shape (2D)
function GothicWindow({ position }: { position: [number, number, number] }) {
  const shape = useMemo(() => {
    const s = new THREE.Shape()
    const w = 0.5
    const h = 1.0
    const archH = 0.3
    // Rectangle base
    s.moveTo(-w, 0)
    s.lineTo(-w, h)
    // Gothic arch top
    s.quadraticCurveTo(-w, h + archH, 0, h + archH + 0.15)
    s.quadraticCurveTo(w, h + archH, w, h)
    s.lineTo(w, 0)
    s.lineTo(-w, 0)
    return s
  }, [])

  // Window hole (inner, slightly smaller)
  const innerShape = useMemo(() => {
    const s = new THREE.Shape()
    const w = 0.38
    const h = 0.9
    const archH = 0.22
    s.moveTo(-w, 0)
    s.lineTo(-w, h)
    s.quadraticCurveTo(-w, h + archH, 0, h + archH + 0.12)
    s.quadraticCurveTo(w, h + archH, w, h)
    s.lineTo(w, 0)
    s.lineTo(-w, 0)
    return s
  }, [])

  return (
    <group position={position}>
      {/* Window frame (stone) */}
      <mesh>
        <shapeGeometry args={[shape]} />
        <meshStandardMaterial color="#a09080" roughness={0.95} side={THREE.DoubleSide} />
      </mesh>
      {/* Window glass (light blue, emissive for glow) */}
      <mesh position={[0, 0, 0.01]}>
        <shapeGeometry args={[innerShape]} />
        <meshStandardMaterial
          color="#c8dde8"
          roughness={0.3}
          metalness={0.1}
          emissive="#aaccdd"
          emissiveIntensity={0.3}
          side={THREE.DoubleSide}
        />
      </mesh>
      {/* Window divider (vertical) */}
      <mesh position={[0, 0.55, 0.02]}>
        <boxGeometry args={[0.04, 1.15, 0.03]} />
        <meshStandardMaterial color="#807060" roughness={0.9} />
      </mesh>
      {/* Window divider (horizontal) */}
      <mesh position={[0, 0.5, 0.02]}>
        <boxGeometry args={[0.78, 0.04, 0.03]} />
        <meshStandardMaterial color="#807060" roughness={0.9} />
      </mesh>
    </group>
  )
}

// Stone wall
function Wall({ position, rotation, size, color = '#c8b898' }: {
  position: [number, number, number]
  rotation?: [number, number, number]
  size: [number, number]
  color?: string
}) {
  return (
    <mesh position={position} rotation={rotation || [0, 0, 0]}>
      <planeGeometry args={size} />
      <meshStandardMaterial color={color} roughness={0.95} side={THREE.DoubleSide} />
    </mesh>
  )
}

// Wooden floor with planks feel
function Floor() {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
      <planeGeometry args={[4, 4]} />
      <meshStandardMaterial color="#a08060" roughness={0.92} />
    </mesh>
  )
}

// Sloped roof
function Roof() {
  return (
    <group position={[0, 2.8, 0]}>
      {/* Back slope */}
      <mesh position={[0, 0.4, -1.2]} rotation={[-0.4, 0, 0]}>
        <planeGeometry args={[4.2, 2]} />
        <meshStandardMaterial color="#8b7355" roughness={0.95} side={THREE.DoubleSide} />
      </mesh>
      {/* Left slope */}
      <mesh position={[-1.6, 0.3, 0]} rotation={[-0.3, Math.PI / 2, 0]}>
        <planeGeometry args={[4.2, 1.8]} />
        <meshStandardMaterial color="#7a6548" roughness={0.95} side={THREE.DoubleSide} />
      </mesh>
      {/* Beam */}
      <mesh position={[0, -0.1, 0]}>
        <boxGeometry args={[4.2, 0.08, 0.08]} />
        <meshStandardMaterial color="#6a5030" roughness={0.9} />
      </mesh>
    </group>
  )
}

// Cozy bed — big, takes left side
function Bed() {
  return (
    <group position={[-0.8, 0, 0.4]}>
      {/* Frame */}
      <mesh position={[0, 0.2, 0]} castShadow>
        <boxGeometry args={[1.6, 0.4, 2.2]} />
        <meshStandardMaterial color="#7a5a38" roughness={0.88} />
      </mesh>
      {/* Mattress */}
      <mesh position={[0, 0.45, 0]} castShadow>
        <boxGeometry args={[1.5, 0.12, 2.1]} />
        <meshStandardMaterial color="#e8dcc8" roughness={0.92} />
      </mesh>
      {/* Blanket (draped) */}
      <mesh position={[0, 0.52, 0.3]} castShadow>
        <boxGeometry args={[1.5, 0.06, 1.4]} />
        <meshStandardMaterial color="#8b4040" roughness={0.9} />
      </mesh>
      {/* Pillow */}
      <mesh position={[0, 0.58, -0.8]} castShadow>
        <boxGeometry args={[1.0, 0.1, 0.35]} />
        <meshStandardMaterial color="#f0e8d8" roughness={0.95} />
      </mesh>
      {/* Headboard */}
      <mesh position={[0, 0.8, -1.05]} castShadow>
        <boxGeometry args={[1.6, 0.8, 0.08]} />
        <meshStandardMaterial color="#6a4828" roughness={0.88} />
      </mesh>
    </group>
  )
}

// Small bedside table with plant/vase
function Nightstand() {
  return (
    <group position={[1.2, 0, -0.8]}>
      {/* Table */}
      <mesh position={[0, 0.35, 0]} castShadow>
        <boxGeometry args={[0.5, 0.7, 0.4]} />
        <meshStandardMaterial color="#7a5a38" roughness={0.88} />
      </mesh>
      {/* Vase */}
      <mesh position={[0, 0.78, 0]} castShadow>
        <cylinderGeometry args={[0.06, 0.08, 0.2, 8]} />
        <meshStandardMaterial color="#906040" roughness={0.7} />
      </mesh>
      {/* Plant stems */}
      {[-0.03, 0.02, 0].map((xOff, i) => (
        <mesh key={i} position={[xOff, 1.0, i * 0.02]} castShadow>
          <cylinderGeometry args={[0.008, 0.008, 0.3, 4]} />
          <meshStandardMaterial color="#4a7a3a" roughness={0.9} />
        </mesh>
      ))}
      {/* Leaves */}
      {[[-0.05, 1.1, 0.02], [0.04, 1.08, -0.03], [0, 1.15, 0]].map((pos, i) => (
        <mesh key={i} position={pos as [number, number, number]} rotation={[0.3 * i, 0.5 * i, 0.2]}>
          <sphereGeometry args={[0.04, 6, 4]} />
          <meshStandardMaterial color="#5a8a4a" roughness={0.9} />
        </mesh>
      ))}
    </group>
  )
}

// Candle flicker light
function CandleLight() {
  const ref = useRef<THREE.PointLight>(null)
  useFrame(({ clock }) => {
    if (ref.current) {
      ref.current.intensity = 1.2 + Math.sin(clock.elapsedTime * 4) * 0.2 + Math.sin(clock.elapsedTime * 9) * 0.08
    }
  })
  return <pointLight ref={ref} position={[1.2, 1.2, -0.8]} color="#ffcc66" intensity={1.2} distance={5} decay={2} />
}

// Watercolor post-processing
function WatercolorFilter() {
  return (
    <EffectComposer>
      <HueSaturation saturation={-0.08} hue={0.02} />
      <Noise opacity={0.05} blendFunction={BlendFunction.SOFT_LIGHT} />
      <Vignette offset={0.2} darkness={0.35} />
    </EffectComposer>
  )
}

export function MedievalRoom() {
  return (
    <div className="relative aspect-[4/3] max-w-md mx-auto rounded-2xl overflow-hidden border border-cream/[0.08]">
      <Canvas
        shadows
        orthographic
        camera={{
          position: [5, 5, 5],
          zoom: 100,
          near: 0.1,
          far: 50,
        }}
        gl={{ antialias: true }}
        style={{ background: 'linear-gradient(180deg, #e8dcc4 0%, #d8c8a8 100%)' }}
        onCreated={({ camera }) => {
          camera.lookAt(0, 0.8, 0)
        }}
      >
        {/* Lighting — warm and bright */}
        <ambientLight intensity={1.0} color="#fff5e8" />
        <directionalLight position={[4, 6, 3]} intensity={0.8} color="#fff8ee" castShadow shadow-mapSize={1024} />
        <directionalLight position={[-2, 3, -1]} intensity={0.25} color="#e8d8c8" />
        {/* Window light coming in */}
        <directionalLight position={[0, 3, -3]} intensity={0.4} color="#c8dde8" />
        <CandleLight />

        {/* Room — compact cozy space */}
        <Floor />
        {/* Back wall with window */}
        <Wall position={[0, 1.4, -2]} size={[4, 2.8]} />
        {/* Left wall */}
        <Wall position={[-2, 1.4, 0]} rotation={[0, Math.PI / 2, 0]} size={[4, 2.8]} color="#bfab88" />

        {/* Gothic window on back wall */}
        <GothicWindow position={[0.3, 0.8, -1.98]} />

        {/* Roof beams */}
        <Roof />

        {/* Furniture */}
        <Bed />
        <Nightstand />

        <ContactShadows position={[0, 0.01, 0]} opacity={0.2} scale={6} blur={2} far={3} />

        <WatercolorFilter />
      </Canvas>

      {/* Room state overlay */}
      <div className="absolute top-3 right-3 px-2.5 py-1 rounded-lg bg-green/[0.15] border border-green/20 backdrop-blur-sm">
        <span className="font-medieval text-[10px] text-green/60">Propre</span>
      </div>
    </div>
  )
}
