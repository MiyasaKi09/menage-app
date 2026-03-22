'use client'

import { useRef, useCallback } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { ContactShadows } from '@react-three/drei'
import { EffectComposer, Noise, HueSaturation, Vignette } from '@react-three/postprocessing'
import { BlendFunction } from 'postprocessing'
import * as THREE from 'three'
import { FurnitureItem } from './FurnitureItem'

export interface RoomFurnitureData {
  id: string
  catalog_id: string
  position_x: number
  position_y: number
  position_z: number
  rotation_y: number
  scale: number
}

interface RoomSceneProps {
  furniture: RoomFurnitureData[]
  isEditMode: boolean
  selectedId: string | null
  onSelect: (id: string) => void
  onMove: (id: string, pos: [number, number, number]) => void
}

const WALL_COLOR = '#e8d4be'
const WALL_INNER = '#dcc8b0'
const FLOOR_COLOR = '#b89070'

// Room shell — L-shaped walls, floor, partial ceiling
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
      <mesh position={[0, 0.04, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[roomSize - 0.1, roomSize - 0.1]} />
        <meshStandardMaterial color="#b08858" roughness={0.88} />
      </mesh>

      {/* Back wall */}
      <mesh position={[0, wallHeight / 2, -roomSize / 2 - wallThickness / 2]} castShadow>
        <boxGeometry args={[roomSize + wallThickness * 2, wallHeight, wallThickness]} />
        <meshStandardMaterial color={WALL_COLOR} roughness={0.92} />
      </mesh>
      <mesh position={[0, wallHeight / 2, -roomSize / 2 + 0.01]}>
        <planeGeometry args={[roomSize, wallHeight]} />
        <meshStandardMaterial color={WALL_INNER} roughness={0.95} />
      </mesh>

      {/* Left wall */}
      <mesh position={[-roomSize / 2 - wallThickness / 2, wallHeight / 2, 0]} castShadow>
        <boxGeometry args={[wallThickness, wallHeight, roomSize + wallThickness]} />
        <meshStandardMaterial color="#dcc0a5" roughness={0.92} />
      </mesh>
      <mesh position={[-roomSize / 2 + 0.01, wallHeight / 2, 0]} rotation={[0, Math.PI / 2, 0]}>
        <planeGeometry args={[roomSize, wallHeight]} />
        <meshStandardMaterial color={WALL_INNER} roughness={0.95} />
      </mesh>

      {/* Partial ceiling */}
      <mesh position={[-roomSize / 4 - wallThickness / 2, wallHeight, -roomSize / 4 - wallThickness / 2]} castShadow>
        <boxGeometry args={[roomSize / 2 + wallThickness * 2, 0.15, roomSize / 2 + wallThickness]} />
        <meshStandardMaterial color="#e0ccb5" roughness={0.92} />
      </mesh>
    </group>
  )
}

// Ceiling pendant light with flicker
function CeilingLight() {
  const ref = useRef<THREE.PointLight>(null)
  useFrame(({ clock }) => {
    if (ref.current) {
      ref.current.intensity = 1.0 + Math.sin(clock.elapsedTime * 2) * 0.08
    }
  })

  return (
    <group position={[0, 2.7, -0.2]}>
      <mesh>
        <cylinderGeometry args={[0.005, 0.005, 0.6, 4]} />
        <meshStandardMaterial color="#333" roughness={0.5} />
      </mesh>
      <mesh position={[0, -0.35, 0]}>
        <cylinderGeometry args={[0.04, 0.06, 0.12, 8]} />
        <meshStandardMaterial color="#c0a060" roughness={0.4} metalness={0.5} />
      </mesh>
      <mesh position={[0, -0.45, 0]}>
        <sphereGeometry args={[0.04, 8, 6]} />
        <meshBasicMaterial color="#ffe8aa" />
      </mesh>
      <pointLight ref={ref} position={[0, -0.5, 0]} color="#ffddaa" intensity={1.0} distance={5} decay={2} />
    </group>
  )
}

function WatercolorFilter() {
  return (
    <EffectComposer>
      <HueSaturation saturation={-0.05} hue={0.02} />
      <Noise opacity={0.04} blendFunction={BlendFunction.SOFT_LIGHT} />
      <Vignette offset={0.15} darkness={0.3} />
    </EffectComposer>
  )
}

function SceneContent({ furniture, isEditMode, selectedId, onSelect, onMove }: RoomSceneProps) {
  // Deselect when clicking empty space
  const handleBackgroundClick = useCallback(() => {
    if (isEditMode) onSelect('')
  }, [isEditMode, onSelect])

  return (
    <>
      <ambientLight intensity={0.9} color="#fff5e8" />
      <directionalLight position={[5, 8, 4]} intensity={0.7} color="#fff8ee" castShadow shadow-mapSize={1024} />
      <directionalLight position={[-3, 4, 5]} intensity={0.2} color="#e8ddd0" />
      <directionalLight position={[0.3, 3, -4]} intensity={0.5} color="#d0e0f0" />

      <CeilingLight />

      {/* Click catcher for deselect */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]} onPointerDown={handleBackgroundClick}>
        <planeGeometry args={[10, 10]} />
        <meshBasicMaterial visible={false} />
      </mesh>

      <RoomShell />

      {/* Dynamic furniture */}
      {furniture.map((item) => (
        <FurnitureItem
          key={item.id}
          id={item.id}
          catalogId={item.catalog_id}
          position={[item.position_x, item.position_y, item.position_z]}
          rotationY={item.rotation_y}
          scale={item.scale}
          isEditMode={isEditMode}
          isSelected={selectedId === item.id}
          onSelect={onSelect}
          onMove={onMove}
        />
      ))}

      <ContactShadows position={[0, 0.02, 0]} opacity={0.2} scale={5} blur={2} far={3} />
      <WatercolorFilter />
    </>
  )
}

export function RoomScene({ furniture, isEditMode, selectedId, onSelect, onMove }: RoomSceneProps) {
  return (
    <div className="relative aspect-square max-w-md mx-auto rounded-2xl overflow-hidden border border-cream/[0.08]">
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
        <SceneContent
          furniture={furniture}
          isEditMode={isEditMode}
          selectedId={selectedId}
          onSelect={onSelect}
          onMove={onMove}
        />
      </Canvas>

      {/* Edit mode indicator */}
      {isEditMode && (
        <div className="absolute top-3 left-3 px-2.5 py-1 rounded-lg bg-yellow/[0.2] border border-yellow/30 backdrop-blur-sm">
          <span className="font-medieval text-[10px] text-yellow/70">Mode edition</span>
        </div>
      )}

      {/* Room state */}
      <div className="absolute top-3 right-3 px-2.5 py-1 rounded-lg bg-green/[0.15] border border-green/20 backdrop-blur-sm">
        <span className="font-medieval text-[10px] text-green/60">Propre</span>
      </div>
    </div>
  )
}
