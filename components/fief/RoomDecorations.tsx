'use client'

import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

// Fireplace point light with multi-frequency flicker
function FireplaceLight() {
  const ref = useRef<THREE.PointLight>(null)
  useFrame(({ clock }) => {
    if (ref.current) {
      const t = clock.elapsedTime
      ref.current.intensity = 2.5 + Math.sin(t * 3.7) * 0.4 + Math.sin(t * 7.1) * 0.15
    }
  })
  return (
    <pointLight
      ref={ref}
      position={[-1.35, 0.4, 0.6]}
      color="#ff6830"
      intensity={2.5}
      distance={4.5}
      decay={2}
      castShadow
      shadow-mapSize={512}
    />
  )
}

// Glowing embers inside fireplace
function FireEmbers() {
  const groupRef = useRef<THREE.Group>(null)
  const embers = useMemo(() =>
    Array.from({ length: 5 }, () => ({
      x: -1.4 + (Math.random() - 0.5) * 0.15,
      y: 0.08 + Math.random() * 0.06,
      z: 0.6 + (Math.random() - 0.5) * 0.25,
      size: 0.015 + Math.random() * 0.012,
      phase: Math.random() * Math.PI * 2,
      speed: 3 + Math.random() * 2,
    })),
  [])

  useFrame(({ clock }) => {
    if (!groupRef.current) return
    const t = clock.elapsedTime
    groupRef.current.children.forEach((child, i) => {
      const e = embers[i]
      child.position.y = e.y + Math.sin(t * e.speed + e.phase) * 0.008
      child.scale.setScalar(0.8 + Math.sin(t * 2 + e.phase) * 0.2)
    })
  })

  return (
    <group ref={groupRef}>
      {embers.map((e, i) => (
        <mesh key={i} position={[e.x, e.y, e.z]}>
          <sphereGeometry args={[e.size, 6, 4]} />
          <meshStandardMaterial
            color="#ff6020"
            emissive="#ff4010"
            emissiveIntensity={0.8}
            roughness={0.9}
          />
        </mesh>
      ))}
    </group>
  )
}

// Fireplace structure
function Fireplace() {
  return (
    <group position={[-1.6, 0, 0.6]}>
      {/* Stone frame - left pillar */}
      <mesh position={[0, 0.5, -0.35]} castShadow>
        <boxGeometry args={[0.12, 1.0, 0.12]} />
        <meshStandardMaterial color="#8a8078" roughness={0.92} />
      </mesh>
      {/* Stone frame - right pillar */}
      <mesh position={[0, 0.5, 0.35]} castShadow>
        <boxGeometry args={[0.12, 1.0, 0.12]} />
        <meshStandardMaterial color="#8a8078" roughness={0.92} />
      </mesh>
      {/* Lintel */}
      <mesh position={[0, 1.05, 0]} castShadow>
        <boxGeometry args={[0.18, 0.1, 0.8]} />
        <meshStandardMaterial color="#8a8078" roughness={0.92} />
      </mesh>
      {/* Dark interior */}
      <mesh position={[0.05, 0.35, 0]}>
        <boxGeometry args={[0.08, 0.65, 0.6]} />
        <meshStandardMaterial color="#1a1210" roughness={1} />
      </mesh>
      {/* Log 1 */}
      <mesh position={[0.1, 0.08, 0]} rotation={[0, 0.3, Math.PI / 2]} castShadow>
        <cylinderGeometry args={[0.035, 0.035, 0.4, 6]} />
        <meshStandardMaterial color="#5C4030" roughness={0.88} />
      </mesh>
      {/* Log 2 */}
      <mesh position={[0.1, 0.12, 0.05]} rotation={[0, -0.2, Math.PI / 2]} castShadow>
        <cylinderGeometry args={[0.03, 0.03, 0.35, 6]} />
        <meshStandardMaterial color="#7B5E45" roughness={0.85} />
      </mesh>
      {/* Mantel item - pottery */}
      <mesh position={[0, 1.15, -0.2]} castShadow>
        <cylinderGeometry args={[0.05, 0.04, 0.1, 8]} />
        <meshStandardMaterial color="#9B7B5B" roughness={0.8} />
      </mesh>
      {/* Mantel item - bottle */}
      <mesh position={[0, 1.15, 0.2]} castShadow>
        <cylinderGeometry args={[0.025, 0.03, 0.12, 8]} />
        <meshStandardMaterial color="#446644" roughness={0.3} metalness={0.1} />
      </mesh>
    </group>
  )
}

// Wall torch with animated flame
function WallTorch() {
  const flameRef = useRef<THREE.Mesh>(null)
  const lightRef = useRef<THREE.PointLight>(null)

  useFrame(({ clock }) => {
    const t = clock.elapsedTime
    if (flameRef.current) {
      flameRef.current.position.y = 0.12 + Math.sin(t * 5 + 3) * 0.004
      flameRef.current.scale.set(
        0.9 + Math.sin(t * 8) * 0.1,
        1.4 + Math.sin(t * 7) * 0.25,
        0.9 + Math.sin(t * 8) * 0.1,
      )
    }
    if (lightRef.current) {
      lightRef.current.intensity = 1.5 + Math.sin(t * 4.3) * 0.3 + Math.sin(t * 6.8) * 0.1
    }
  })

  return (
    <group position={[1.2, 1.8, -1.65]}>
      {/* Bracket */}
      <mesh castShadow>
        <boxGeometry args={[0.06, 0.06, 0.08]} />
        <meshStandardMaterial color="#3A3530" roughness={0.6} metalness={0.3} />
      </mesh>
      {/* Torch stick */}
      <mesh position={[0, 0.03, 0.04]} rotation={[Math.PI / 6, 0, 0]} castShadow>
        <cylinderGeometry args={[0.02, 0.025, 0.18, 6]} />
        <meshStandardMaterial color="#5C4030" roughness={0.88} />
      </mesh>
      {/* Flame */}
      <mesh ref={flameRef} position={[0, 0.12, 0.06]}>
        <sphereGeometry args={[0.02, 6, 4]} />
        <meshStandardMaterial
          color="#FFBB33"
          emissive="#FF8800"
          emissiveIntensity={2}
          roughness={0.5}
        />
      </mesh>
      <pointLight
        ref={lightRef}
        position={[0, 0.15, 0.08]}
        color="#FFAA44"
        intensity={1.5}
        distance={3.5}
        decay={2}
        castShadow
        shadow-mapSize={512}
      />
    </group>
  )
}

// Persian rug on floor
function PersianRug() {
  return (
    <group position={[0.2, 0, 0]}>
      {/* Border */}
      <mesh position={[0, 0.006, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[1.9, 1.3]} />
        <meshStandardMaterial color="#C49040" roughness={0.95} />
      </mesh>
      {/* Inner field */}
      <mesh position={[0, 0.008, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[1.7, 1.1]} />
        <meshStandardMaterial color="#8B3535" roughness={0.95} />
      </mesh>
    </group>
  )
}

// Wall tapestry on left wall
function WallTapestry() {
  return (
    <group position={[-1.63, 1.8, -0.6]}>
      {/* Rod */}
      <mesh rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.015, 0.015, 0.7, 6]} />
        <meshStandardMaterial color="#3A3530" roughness={0.6} metalness={0.3} />
      </mesh>
      {/* Fabric */}
      <mesh position={[0.01, -0.4, 0]}>
        <boxGeometry args={[0.02, 0.7, 0.6]} />
        <meshStandardMaterial color="#607848" roughness={0.92} />
      </mesh>
      {/* Diamond motif */}
      <mesh position={[0.02, -0.35, 0]} rotation={[0, 0, Math.PI / 4]}>
        <boxGeometry args={[0.15, 0.15, 0.005]} />
        <meshStandardMaterial color="#C49040" roughness={0.9} />
      </mesh>
    </group>
  )
}

// Gothic window with glass
function GothicWindow() {
  return (
    <group position={[0.3, 1.6, -1.73]}>
      {/* Frame */}
      <mesh castShadow>
        <boxGeometry args={[0.7, 0.9, 0.06]} />
        <meshStandardMaterial color="#5C4030" roughness={0.88} />
      </mesh>
      {/* Glass */}
      <mesh position={[0, 0, 0.02]}>
        <planeGeometry args={[0.55, 0.75]} />
        <meshStandardMaterial
          color="#B8D8E8"
          roughness={0.1}
          metalness={0.05}
          transparent
          opacity={0.35}
        />
      </mesh>
      {/* Horizontal divider */}
      <mesh position={[0, 0, 0.04]}>
        <boxGeometry args={[0.55, 0.03, 0.03]} />
        <meshStandardMaterial color="#5C4030" roughness={0.88} />
      </mesh>
      {/* Vertical divider */}
      <mesh position={[0, 0, 0.04]}>
        <boxGeometry args={[0.03, 0.75, 0.03]} />
        <meshStandardMaterial color="#5C4030" roughness={0.88} />
      </mesh>
      {/* Sill */}
      <mesh position={[0, -0.48, 0.05]} castShadow>
        <boxGeometry args={[0.8, 0.05, 0.12]} />
        <meshStandardMaterial color="#8a8078" roughness={0.92} />
      </mesh>
    </group>
  )
}

// Sleeping cat
function SleepingCat() {
  const bodyRef = useRef<THREE.Mesh>(null)

  useFrame(({ clock }) => {
    if (bodyRef.current) {
      bodyRef.current.scale.y = 0.6 + Math.sin(clock.elapsedTime * 0.8) * 0.025
    }
  })

  return (
    <group position={[0.3, 0.08, 0.2]}>
      {/* Body */}
      <mesh ref={bodyRef} scale={[1.2, 0.6, 0.9]} castShadow>
        <sphereGeometry args={[0.1, 8, 6]} />
        <meshStandardMaterial color="#4A3828" roughness={0.9} />
      </mesh>
      {/* Head */}
      <mesh position={[0.15, 0.01, 0]} castShadow>
        <sphereGeometry args={[0.06, 8, 6]} />
        <meshStandardMaterial color="#4A3828" roughness={0.9} />
      </mesh>
      {/* Tail */}
      <mesh position={[-0.18, 0, 0.02]} rotation={[0, 0.3, Math.PI / 2.5]}>
        <cylinderGeometry args={[0.012, 0.008, 0.16, 6]} />
        <meshStandardMaterial color="#4A3828" roughness={0.9} />
      </mesh>
    </group>
  )
}

// Floating dust particles
function DustParticles() {
  const groupRef = useRef<THREE.Group>(null)

  const particles = useMemo(() =>
    Array.from({ length: 15 }, () => ({
      x: (Math.random() - 0.3) * 3,
      y: 0.5 + Math.random() * 2.2,
      z: (Math.random() - 0.3) * 3,
      speed: 0.15 + Math.random() * 0.25,
      phase: Math.random() * Math.PI * 2,
      ampX: 0.12 + Math.random() * 0.12,
      ampZ: 0.08 + Math.random() * 0.08,
      size: 0.006 + Math.random() * 0.006,
    })),
  [])

  useFrame(({ clock }) => {
    if (!groupRef.current) return
    const t = clock.elapsedTime
    groupRef.current.children.forEach((child, i) => {
      const p = particles[i]
      child.position.x = p.x + Math.sin(t * p.speed + p.phase) * p.ampX
      child.position.y = p.y + Math.sin(t * p.speed * 0.7 + p.phase) * 0.06
      child.position.z = p.z + Math.cos(t * p.speed * 0.5 + p.phase) * p.ampZ
    })
  })

  return (
    <group ref={groupRef}>
      {particles.map((p, i) => (
        <mesh key={i} position={[p.x, p.y, p.z]}>
          <sphereGeometry args={[p.size, 4, 3]} />
          <meshStandardMaterial
            color="#FFEECC"
            emissive="#FFDDAA"
            emissiveIntensity={0.3}
          />
        </mesh>
      ))}
    </group>
  )
}

// Sunbeam spotlight through window
function WindowSunbeam() {
  return (
    <>
      <spotLight
        position={[0.3, 3.5, -3]}
        target-position={[0.3, 0, 0.5]}
        color="#FFE8C0"
        intensity={1.5}
        distance={8}
        angle={Math.PI / 6}
        penumbra={0.6}
        decay={1}
        castShadow
        shadow-mapSize={1024}
      />
    </>
  )
}

// Main export — all decorations in a non-interactive group
export function RoomDecorations() {
  return (
    <group raycast={() => null}>
      <Fireplace />
      <FireEmbers />
      <FireplaceLight />
      <WallTorch />
      <PersianRug />
      <WallTapestry />
      <GothicWindow />
      <SleepingCat />
      <DustParticles />
      <WindowSunbeam />
    </group>
  )
}
