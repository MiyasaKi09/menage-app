'use client'

import { useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { ContactShadows, RoundedBox } from '@react-three/drei'
import { EffectComposer, Noise, HueSaturation, Vignette } from '@react-three/postprocessing'
import { BlendFunction } from 'postprocessing'
import * as THREE from 'three'

const WALL_COLOR = '#e8d4be'
const WALL_INNER = '#dcc8b0'
const FLOOR_COLOR = '#c4a880'
const WOOD_DARK = '#7a5a38'
const WOOD_MID = '#9a7a52'
const WOOD_LIGHT = '#b89870'

// Thick wall section — diorama style with visible thickness
function ThickWall({ position, size, rotation, color = WALL_COLOR }: {
  position: [number, number, number]
  size: [number, number, number]
  rotation?: [number, number, number]
  color?: string
}) {
  return (
    <mesh position={position} rotation={rotation || [0, 0, 0]} castShadow receiveShadow>
      <boxGeometry args={size} />
      <meshStandardMaterial color={color} roughness={0.92} />
    </mesh>
  )
}

// Room shell — L-shaped walls with thickness (back + left), floor, ceiling edge
function RoomShell() {
  const wallThickness = 0.25
  const wallHeight = 3
  const roomSize = 3.5

  return (
    <group>
      {/* Floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[roomSize, roomSize]} />
        <meshStandardMaterial color={FLOOR_COLOR} roughness={0.9} />
      </mesh>
      {/* Floor border/baseboard */}
      <mesh position={[0, 0.04, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[roomSize - 0.1, roomSize - 0.1]} />
        <meshStandardMaterial color="#b89468" roughness={0.88} />
      </mesh>

      {/* Back wall (Z-) — thick */}
      <ThickWall
        position={[0, wallHeight / 2, -roomSize / 2 - wallThickness / 2]}
        size={[roomSize + wallThickness * 2, wallHeight, wallThickness]}
      />
      {/* Back wall inner face color */}
      <mesh position={[0, wallHeight / 2, -roomSize / 2 + 0.01]}>
        <planeGeometry args={[roomSize, wallHeight]} />
        <meshStandardMaterial color={WALL_INNER} roughness={0.95} />
      </mesh>

      {/* Left wall (X-) — thick */}
      <ThickWall
        position={[-roomSize / 2 - wallThickness / 2, wallHeight / 2, 0]}
        size={[wallThickness, wallHeight, roomSize + wallThickness]}
        color="#dcc0a5"
      />
      {/* Left wall inner face */}
      <mesh position={[-roomSize / 2 + 0.01, wallHeight / 2, 0]} rotation={[0, Math.PI / 2, 0]}>
        <planeGeometry args={[roomSize, wallHeight]} />
        <meshStandardMaterial color={WALL_INNER} roughness={0.95} />
      </mesh>

      {/* Ceiling slab (visible top edge) */}
      <ThickWall
        position={[-roomSize / 4 - wallThickness / 2, wallHeight, -roomSize / 4 - wallThickness / 2]}
        size={[roomSize / 2 + wallThickness * 2, 0.15, roomSize / 2 + wallThickness]}
        color="#e0ccb5"
      />
    </group>
  )
}

// Window (cut into back wall)
function WindowFrame() {
  return (
    <group position={[0.3, 1.6, -1.73]}>
      {/* Window recess */}
      <mesh>
        <boxGeometry args={[0.9, 1.1, 0.28]} />
        <meshStandardMaterial color="#d0bca0" roughness={0.9} />
      </mesh>
      {/* Glass */}
      <mesh position={[0, 0, 0.12]}>
        <planeGeometry args={[0.75, 0.95]} />
        <meshStandardMaterial
          color="#d8e8f0"
          roughness={0.2}
          transparent
          opacity={0.6}
          emissive="#b8d0e0"
          emissiveIntensity={0.4}
        />
      </mesh>
      {/* Frame pieces */}
      <mesh position={[0, 0, 0.14]}>
        <boxGeometry args={[0.04, 0.95, 0.03]} />
        <meshStandardMaterial color={WOOD_DARK} roughness={0.85} />
      </mesh>
      <mesh position={[0, 0.15, 0.14]}>
        <boxGeometry args={[0.75, 0.04, 0.03]} />
        <meshStandardMaterial color={WOOD_DARK} roughness={0.85} />
      </mesh>
      {/* Frame border */}
      {[[-0.4, 0], [0.4, 0]].map(([x], i) => (
        <mesh key={i} position={[x, 0, 0.13]}>
          <boxGeometry args={[0.05, 1.0, 0.04]} />
          <meshStandardMaterial color={WOOD_MID} roughness={0.85} />
        </mesh>
      ))}
      <mesh position={[0, 0.52, 0.13]}>
        <boxGeometry args={[0.85, 0.05, 0.04]} />
        <meshStandardMaterial color={WOOD_MID} roughness={0.85} />
      </mesh>
      <mesh position={[0, -0.52, 0.13]}>
        <boxGeometry args={[0.85, 0.05, 0.04]} />
        <meshStandardMaterial color={WOOD_MID} roughness={0.85} />
      </mesh>
    </group>
  )
}

// Bed — chunky, cozy diorama style
function Bed() {
  return (
    <group position={[-0.6, 0, 0.2]}>
      {/* Frame */}
      <RoundedBox args={[1.5, 0.35, 2.0]} radius={0.04} position={[0, 0.18, 0]} castShadow>
        <meshStandardMaterial color={WOOD_MID} roughness={0.85} />
      </RoundedBox>
      {/* Mattress */}
      <RoundedBox args={[1.4, 0.15, 1.9]} radius={0.06} position={[0, 0.42, 0]} castShadow>
        <meshStandardMaterial color="#f0e8d8" roughness={0.95} />
      </RoundedBox>
      {/* Blanket */}
      <RoundedBox args={[1.4, 0.08, 1.3]} radius={0.04} position={[0, 0.5, 0.25]} castShadow>
        <meshStandardMaterial color="#b8c8a0" roughness={0.9} />
      </RoundedBox>
      {/* Pillow */}
      <RoundedBox args={[0.9, 0.12, 0.3]} radius={0.06} position={[0, 0.55, -0.7]} castShadow>
        <meshStandardMaterial color="#f5efe5" roughness={0.95} />
      </RoundedBox>
      {/* Headboard */}
      <RoundedBox args={[1.5, 0.9, 0.1]} radius={0.04} position={[0, 0.7, -0.95]} castShadow>
        <meshStandardMaterial color={WOOD_DARK} roughness={0.85} />
      </RoundedBox>
      {/* Headboard top rail (rounded) */}
      <mesh position={[0, 1.18, -0.95]} rotation={[0, 0, Math.PI / 2]} castShadow>
        <cylinderGeometry args={[0.05, 0.05, 1.5, 8]} />
        <meshStandardMaterial color={WOOD_DARK} roughness={0.85} />
      </mesh>
    </group>
  )
}

// Nightstand with lamp
function Nightstand() {
  return (
    <group position={[1.0, 0, -0.8]}>
      {/* Table body */}
      <RoundedBox args={[0.55, 0.55, 0.45]} radius={0.03} position={[0, 0.28, 0]} castShadow>
        <meshStandardMaterial color={WOOD_LIGHT} roughness={0.85} />
      </RoundedBox>
      {/* Drawer line */}
      <mesh position={[0, 0.28, 0.23]}>
        <boxGeometry args={[0.4, 0.01, 0.01]} />
        <meshStandardMaterial color={WOOD_DARK} roughness={0.9} />
      </mesh>
      {/* Knob */}
      <mesh position={[0, 0.35, 0.24]}>
        <sphereGeometry args={[0.02, 8, 6]} />
        <meshStandardMaterial color="#c0a060" roughness={0.4} metalness={0.4} />
      </mesh>

      {/* Lamp base */}
      <mesh position={[0, 0.6, 0]} castShadow>
        <cylinderGeometry args={[0.08, 0.1, 0.06, 12]} />
        <meshStandardMaterial color="#d0b890" roughness={0.7} />
      </mesh>
      {/* Lamp stem */}
      <mesh position={[0, 0.72, 0]}>
        <cylinderGeometry args={[0.015, 0.015, 0.2, 6]} />
        <meshStandardMaterial color="#c0a070" roughness={0.6} metalness={0.3} />
      </mesh>
      {/* Lampshade */}
      <mesh position={[0, 0.88, 0]} castShadow>
        <cylinderGeometry args={[0.06, 0.12, 0.15, 12]} />
        <meshStandardMaterial
          color="#f5e8d0"
          roughness={0.9}
          emissive="#ffddaa"
          emissiveIntensity={0.3}
          transparent
          opacity={0.9}
        />
      </mesh>
    </group>
  )
}

// Wall shelf with books
function WallShelf() {
  return (
    <group position={[-1.7, 1.8, -0.3]}>
      {/* Shelf plank */}
      <mesh rotation={[0, Math.PI / 2, 0]} castShadow>
        <boxGeometry args={[0.6, 0.04, 0.2]} />
        <meshStandardMaterial color={WOOD_MID} roughness={0.85} />
      </mesh>
      {/* Books */}
      {[[-0.08, 0.12], [0.0, 0.14], [0.08, 0.1]].map(([z, h], i) => (
        <mesh key={i} position={[0.01, h / 2 + 0.02, z]} rotation={[0, Math.PI / 2, 0]} castShadow>
          <boxGeometry args={[0.08, h, 0.12]} />
          <meshStandardMaterial
            color={['#b85040', '#4878a8', '#d8a840'][i]}
            roughness={0.85}
          />
        </mesh>
      ))}
    </group>
  )
}

// Small plant/succulent
function Plant({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      {/* Pot */}
      <mesh position={[0, 0.06, 0]} castShadow>
        <cylinderGeometry args={[0.06, 0.05, 0.12, 8]} />
        <meshStandardMaterial color="#d4a878" roughness={0.8} />
      </mesh>
      {/* Leaves */}
      {[0, 1.2, 2.4, 3.6, 5].map((angle, i) => (
        <mesh key={i} position={[Math.cos(angle) * 0.04, 0.14 + i * 0.01, Math.sin(angle) * 0.04]} rotation={[0.3, angle, 0.2]}>
          <sphereGeometry args={[0.035, 6, 4]} />
          <meshStandardMaterial color={i % 2 === 0 ? '#6a9a58' : '#7aaa68'} roughness={0.9} />
        </mesh>
      ))}
    </group>
  )
}

// Pendant ceiling light
function CeilingLight() {
  const ref = useRef<THREE.PointLight>(null)
  useFrame(({ clock }) => {
    if (ref.current) {
      ref.current.intensity = 1.0 + Math.sin(clock.elapsedTime * 2) * 0.08
    }
  })

  return (
    <group position={[0, 2.7, -0.2]}>
      {/* Wire */}
      <mesh>
        <cylinderGeometry args={[0.005, 0.005, 0.6, 4]} />
        <meshStandardMaterial color="#333" roughness={0.5} />
      </mesh>
      {/* Bulb housing */}
      <mesh position={[0, -0.35, 0]}>
        <cylinderGeometry args={[0.04, 0.06, 0.12, 8]} />
        <meshStandardMaterial color="#c0a060" roughness={0.4} metalness={0.5} />
      </mesh>
      {/* Bulb glow */}
      <mesh position={[0, -0.45, 0]}>
        <sphereGeometry args={[0.04, 8, 6]} />
        <meshBasicMaterial color="#ffe8aa" />
      </mesh>
      <pointLight ref={ref} position={[0, -0.5, 0]} color="#ffddaa" intensity={1.0} distance={5} decay={2} />
    </group>
  )
}

// Watercolor post-processing
function WatercolorFilter() {
  return (
    <EffectComposer>
      <HueSaturation saturation={-0.05} hue={0.02} />
      <Noise opacity={0.04} blendFunction={BlendFunction.SOFT_LIGHT} />
      <Vignette offset={0.15} darkness={0.3} />
    </EffectComposer>
  )
}

export function MedievalRoom() {
  return (
    <div className="relative aspect-square max-w-md mx-auto rounded-2xl overflow-hidden border border-border">
      <Canvas
        shadows
        orthographic
        camera={{
          position: [6, 6, 6],
          zoom: 90,
          near: 0.1,
          far: 50,
        }}
        gl={{ antialias: true }}
        style={{ background: '#e8d8c4' }}
        onCreated={({ camera }) => {
          camera.lookAt(0, 0.6, 0)
        }}
      >
        {/* Warm ambient */}
        <ambientLight intensity={0.9} color="#fff5e8" />
        <directionalLight position={[5, 8, 4]} intensity={0.7} color="#fff8ee" castShadow shadow-mapSize={1024} />
        <directionalLight position={[-3, 4, 5]} intensity={0.2} color="#e8ddd0" />
        {/* Window daylight */}
        <directionalLight position={[0.3, 3, -4]} intensity={0.5} color="#d0e0f0" />

        <CeilingLight />

        {/* Room structure */}
        <RoomShell />
        <WindowFrame />

        {/* Furniture */}
        <Bed />
        <Nightstand />
        <WallShelf />
        <Plant position={[1.3, 0.56, -0.5]} />
        <Plant position={[-1.7, 1.87, 0.1]} />

        <ContactShadows position={[0, 0.02, 0]} opacity={0.2} scale={5} blur={2} far={3} />

        <WatercolorFilter />
      </Canvas>

      {/* Room state overlay */}
      <div className="absolute top-3 right-3 px-2.5 py-1 rounded-lg bg-green/[0.15] border border-green/20 backdrop-blur-sm">
        <span className="font-sans text-[10px] text-green/60">Propre</span>
      </div>
    </div>
  )
}
