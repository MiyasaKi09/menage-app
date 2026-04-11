'use client'

import { useRef, useCallback, Suspense } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { ContactShadows, useGLTF, OrbitControls } from '@react-three/drei'
import { EffectComposer } from '@react-three/postprocessing'
import * as THREE from 'three'
import { FurnitureItem } from './FurnitureItem'
import { RoomDecorations } from './RoomDecorations'
import { Diorama } from './DioramaEffect'

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

// 3D Room model loaded from GLB
function RoomModel() {
  const { scene } = useGLTF('/models/chambre-draco.glb')

  // Enable shadows on all meshes in the model
  scene.traverse((child) => {
    if ((child as THREE.Mesh).isMesh) {
      child.castShadow = true
      child.receiveShadow = true
    }
  })

  return (
    <primitive
      object={scene}
      scale={1}
      position={[0, 0, 0]}
      rotation={[0, Math.PI, 0]}
    />
  )
}

useGLTF.preload('/models/chambre-draco.glb')

// Ceiling pendant light with flicker
function CeilingLight() {
  const ref = useRef<THREE.PointLight>(null)
  useFrame(({ clock }) => {
    if (ref.current) {
      const t = clock.elapsedTime
      ref.current.intensity = 1.0 + Math.sin(t * 2) * 0.08 + Math.sin(t * 5.3) * 0.04
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

// Orbit controls — rotate around the room with touch/mouse
function CameraControls({ isEditMode }: { isEditMode: boolean }) {
  return (
    <OrbitControls
      target={[0, 0.5, 0]}
      enablePan={false}
      enableZoom={true}
      minZoom={50}
      maxZoom={160}
      minPolarAngle={Math.PI / 6}
      maxPolarAngle={Math.PI / 2.5}
      enableDamping
      dampingFactor={0.08}
      rotateSpeed={0.5}
      enabled={!isEditMode}
    />
  )
}

function DioramaFilter() {
  return (
    <EffectComposer>
      <Diorama />
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
      {/* Lighting — soft, bright, diorama style */}
      <ambientLight intensity={0.6} color="#f0e8dd" />
      <directionalLight position={[5, 8, 4]} intensity={1.0} color="#fff5e8" castShadow shadow-mapSize={2048} shadow-bias={-0.001} />
      <directionalLight position={[-3, 6, 2]} intensity={0.3} color="#e8e4f0" />
      <hemisphereLight args={['#faf5ef', '#d4c8b8', 0.4]} />

      <CeilingLight />
      <CameraControls isEditMode={isEditMode} />

      {/* Click catcher for deselect */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]} onPointerDown={handleBackgroundClick}>
        <planeGeometry args={[10, 10]} />
        <meshBasicMaterial visible={false} />
      </mesh>

      <Suspense fallback={null}>
        <RoomModel />
      </Suspense>
      <RoomDecorations />

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

      <ContactShadows position={[0, 0.02, 0]} opacity={0.25} scale={5} blur={2} far={3} />
      <DioramaFilter />
    </>
  )
}

export function RoomScene({ furniture, isEditMode, selectedId, onSelect, onMove }: RoomSceneProps) {
  return (
    <div className="relative aspect-square w-full rounded-[28px] overflow-hidden">
      <Canvas
        shadows
        orthographic
        camera={{
          position: [5, 4, 5],
          zoom: 95,
          near: 0.1,
          far: 50,
        }}
        gl={{ antialias: true }}
        style={{ background: '#f5f0eb' }}
        onCreated={({ camera }) => {
          camera.lookAt(0, 0.5, 0)
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
        <div className="absolute top-3 left-3 px-2.5 py-1 rounded-lg bg-yellow/[0.2] border border-yellow/30 backdrop-blur-sm z-10">
          <span className="font-sans text-[10px] text-yellow/70">Mode edition</span>
        </div>
      )}

      {/* Room state */}
      <div className="absolute top-3 right-3 px-2.5 py-1 rounded-lg bg-green/[0.15] border border-green/20 backdrop-blur-sm z-10">
        <span className="font-sans text-[10px] text-green/60">Propre</span>
      </div>
    </div>
  )
}
